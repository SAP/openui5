/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/Version",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode"
], function(
	Settings,
	ChangePersistenceFactory,
	Storage,
	Utils,
	Version,
	JSONModel,
	BindingMode
) {
	"use strict";

	var _mInstances = {};
	var MODEL_SIZE_LIMIT = 9;
	// Limiting the data requested from the back end but one additional version is requested to
	// ensure sufficient data is present even if a draft was returned and later discarded
	var BACKEND_REQUEST_LIMIT = MODEL_SIZE_LIMIT + 1;

	function createModel(bVersioningEnabled, aVersions) {
		var bBackendDraft = _doesDraftExistInVersions(aVersions);
		var aDraftFilenames = [];

		var sActiveVersion = Version.Number.Original;
		var bPublishVersionEnabled = false;

		return Utils.getUShellService("URLParsing")
			.then(function (oURLParsingService) {
				var sPersistedBasisForDisplayedVersion = Utils.getParameter(
					Version.UrlParameter,
					oURLParsingService
				);
				if (!sPersistedBasisForDisplayedVersion) {
					if (aVersions.length > 0) {
						sPersistedBasisForDisplayedVersion = aVersions[0].version;
					} else {
						sPersistedBasisForDisplayedVersion = Version.Number.Original;
					}
				}

				aVersions.forEach(function (oVersion) {
					if (oVersion.version === Version.Number.Draft) {
						oVersion.type = "draft";
						oVersion.isPublished = false;
						aDraftFilenames = oVersion.filenames;
					} else {
						if (sActiveVersion === Version.Number.Original) {
							// no active version found yet; the first non-draft version is always the active version
							oVersion.type = "active";
							sActiveVersion = oVersion.version;
						} else {
							oVersion.type = "inactive";
						}
						//If the current selected version is not yet published, enable the publish button
						//Original versions are not part of back end response, so publish button is not enabled by default value
						if ((oVersion.version === sPersistedBasisForDisplayedVersion) && (oVersion.isPublished === false)) {
							bPublishVersionEnabled = true;
						}
					}
				});

				var oModel = new JSONModel({
					publishVersionEnabled: bPublishVersionEnabled,
					versioningEnabled: bVersioningEnabled,
					versions: aVersions,
					activeVersion: sActiveVersion,
					backendDraft: bBackendDraft,
					dirtyChanges: false,
					draftAvailable: bBackendDraft,
					activateEnabled: bBackendDraft,
					persistedVersion: sPersistedBasisForDisplayedVersion,
					displayedVersion: sPersistedBasisForDisplayedVersion,
					draftFilenames: aDraftFilenames
				});

				oModel.setDefaultBindingMode(BindingMode.OneWay);
				oModel.setSizeLimit(MODEL_SIZE_LIMIT);

				// TODO: currently called by sap.ui.rta.RuntimeAuthoring but should be by a ChangesState
				oModel.setDirtyChanges = function (bDirtyChanges) {
					oModel.setProperty("/dirtyChanges", bDirtyChanges);
					oModel.updateDraftVersion();
					oModel.updateBindings(true);
				};

				oModel.updateDraftVersion = function () {
					var aVersions = oModel.getProperty("/versions");
					var bVersioningEnabled = oModel.getProperty("/versioningEnabled");
					var bDirtyChanges = oModel.getProperty("/dirtyChanges");
					var bBackendDraft = oModel.getProperty("/backendDraft");
					var bDraftAvailable = bVersioningEnabled && (bDirtyChanges || bBackendDraft);
					oModel.setProperty("/draftAvailable", bDraftAvailable);

					if (bDirtyChanges) {
						oModel.setProperty("/displayedVersion", Version.Number.Draft);
					}

					// add draft
					if (!_doesDraftExistInVersions(aVersions) && bDraftAvailable) {
						aVersions.splice(0, 0, {version: Version.Number.Draft, type: "draft", filenames: [], isPublished: false});
					}

					// remove draft
					if (_doesDraftExistInVersions(aVersions) && !bDraftAvailable) {
						aVersions.shift();
						oModel.setProperty("/displayedVersion", oModel.getProperty("/persistedVersion"));
					}

					var bActivateEnabled = oModel.getProperty("/displayedVersion") !== oModel.getProperty("/activeVersion");
					oModel.setProperty("/activateEnabled", bActivateEnabled);
				};

				return oModel;
			});
	}

	// TODO: the handling should move to the FlexState as soon as it is ready
	function _removeDirtyChanges(mPropertyBag, oDirtyChangeInfo) {
		// remove all dirty changes
		var aDirtyChanges = [];
		var aChangePersistences = oDirtyChangeInfo.changePersistences;
		aChangePersistences.forEach(function (oChangePersistence) {
			aDirtyChanges = oChangePersistence.getDirtyChanges().concat();
			aDirtyChanges.forEach(function(oChange) {
				oChangePersistence.deleteChange(oChange, true);
			});
		});
		return aDirtyChanges.length > 0;
	}

	function _getDirtyChangesInfo(mPropertyBag) {
		var oDirtyChangesInfo = {
			dirtyChangesExist: false,
			changePersistences: []
		};

		if (mPropertyBag.reference) {
			var oChangePersistenceForAppDescriptorChanges = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
			if (oChangePersistenceForAppDescriptorChanges.getDirtyChanges().length > 0) {
				oDirtyChangesInfo.dirtyChangesExist = true;
				oDirtyChangesInfo.changePersistences.push(oChangePersistenceForAppDescriptorChanges);
			}
		}
		if (mPropertyBag.nonNormalizedReference) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.nonNormalizedReference);
			if (oChangePersistence.getDirtyChanges().length > 0) {
				oDirtyChangesInfo.dirtyChangesExist = true;
				oDirtyChangesInfo.changePersistences.push(oChangePersistence);
			}
		}
		return oDirtyChangesInfo;
	}

	function _doesDraftExistInVersions(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.version === Version.Number.Draft;
		});
	}

	/**
	 *
	 *
	 * @namespace sap.ui.fl.write._internal.Versions
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Versions = {};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {sap.ui.model.json.JSONModel} Model containing version data like <code>versions</code>,
	 *  <code>dirtyChanges</code> and <code>backendDraft</code>
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.initialize = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		mPropertyBag.limit = BACKEND_REQUEST_LIMIT;

		return Settings.getInstance()
			.then(function (oSettings) {
				var bVersionsEnabled = oSettings.isVersioningEnabled(sLayer);
				var aVersionsPromise = bVersionsEnabled ? Storage.versions.load(mPropertyBag) : Promise.resolve([]);
				return aVersionsPromise
					.then(function (aVersions) {
						return createModel(bVersionsEnabled, aVersions);
					})
					.then(function (oModel) {
						_mInstances[sReference] = _mInstances[sReference] || {};
						_mInstances[sReference][sLayer] = _mInstances[sReference][sLayer] || {};
						_mInstances[sReference][sLayer] = oModel;
						return _mInstances[sReference][sLayer];
					});
			});
	};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {sap.ui.model.json.JSONModel} Model containing version data like <code>versions</code>,
	 *  <code>dirtyChanges</code> and <code>backendDraft</code>
	 * throws an error if versions were not initialized for the given reference and layer
	 */
	Versions.getVersionsModel = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (!_mInstances[sReference] || !_mInstances[sReference][sLayer]) {
			throw Error("Versions Model for reference '" + sReference + "' and layer '" + sLayer + "' were not initialized.");
		}

		var oDirtyChangesInfo = _getDirtyChangesInfo(mPropertyBag);
		if (oDirtyChangesInfo.dirtyChangesExist) {
			_mInstances[sReference][sLayer].updateDraftVersion(mPropertyBag);
		}
		return _mInstances[sReference][sLayer];
	};

	Versions.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Updates dirty changes and the backendDraft property of the model after a saveAll was called.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 */
	Versions.onAllChangesSaved = function (mPropertyBag) {
		mPropertyBag.reference = Utils.normalizeReference(mPropertyBag.reference);
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var bVersioningEnabled = oModel.getProperty("/versioningEnabled");
		var bDirtyChanges = oModel.getProperty("/dirtyChanges");
		oModel.setProperty("/dirtyChanges", true);
		oModel.setProperty("/backendDraft", bVersioningEnabled && bDirtyChanges);
		oModel.updateDraftVersion();
	};

	/**
	 * (Re-)activates a version.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.nonNormalizedReference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 * @param {string} mPropertyBag.appComponent - Application Component
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs, the layer does not support draft handling, there is unsaved content, there is no draft to activate or
	 * when the displayed version is already active
	 */
	Versions.activate = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var aVersions = oModel.getProperty("/versions");
		var bDraftExists = _doesDraftExistInVersions(aVersions);
		var sDisplayedVersion = oModel.getProperty("/displayedVersion");
		var sActiveVersion = oModel.getProperty("/activeVersion");
		if (sDisplayedVersion === sActiveVersion) {
			return Promise.reject("Version is already active");
		}
		mPropertyBag.version = sDisplayedVersion;

		var oDirtyChangeInfo = _getDirtyChangesInfo(mPropertyBag);
		var aChangePersistences = oDirtyChangeInfo.changePersistences;
		var bDirtyChangesExists = aChangePersistences.some(function (oChangePersistence) {
			return oChangePersistence.getDirtyChanges().length > 0;
		});

		if (bDirtyChangesExists) {
			return Promise.reject("unsaved changes exists");
		}

		return Storage.versions.activate(mPropertyBag)
		.then(function (oVersion) {
			aVersions.forEach(function (oVersionEntry) {
				oVersionEntry.type = "inactive";
			});
			oVersion.type = "active";
			oVersion.isPublished = false;
			if (bDraftExists) {
				aVersions.shift();
			}
			aVersions.splice(0, 0, oVersion);
			oModel.setProperty("/publishVersionEnabled", true);
			oModel.setProperty("/backendDraft", false);
			oModel.setProperty("/dirtyChanges", false);
			oModel.setProperty("/draftAvailable", false);
			oModel.setProperty("/publishVersionEnabled", true);
			oModel.setProperty("/activateEnabled", false);
			oModel.setProperty("/activeVersion", oVersion.version);
			oModel.setProperty("/displayedVersion", oVersion.version);
			oModel.setProperty("/persistedVersion", oVersion.version);
			oModel.updateBindings(true);
		});
	};

	/**
	 * Discards the draft for a given application and layer; dirty changes are only.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.nonNormalizedReference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<object>} Promise resolving to an object to indicate if a discarding took place on backend side and/or dirty changes were discarded;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.discardDraft = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var aVersions = oModel.getProperty("/versions");
		var oDirtyChangesInfo = _getDirtyChangesInfo(mPropertyBag);
		var bBackendDraftExists = oModel.getProperty("/backendDraft");
		var oDiscardPromise = bBackendDraftExists ? Storage.versions.discardDraft(mPropertyBag) : Promise.resolve();

		return oDiscardPromise.then(function () {
			aVersions.shift();
			oModel.setProperty("/backendDraft", false);
			oModel.setProperty("/dirtyChanges", false);
			oModel.setProperty("/draftAvailable", false);
			oModel.setProperty("/activateEnabled", false);
			oModel.setProperty("/displayedVersion", oModel.getProperty("/persistedVersion"));
			oModel.updateBindings(true);
			// in case of a existing draft known by the backend;
			// we remove dirty changes only after successful DELETE request
			var bDirtyChangesRemoved = _removeDirtyChanges(mPropertyBag, oDirtyChangesInfo);
			return {
				backendChangesDiscarded: bBackendDraftExists,
				dirtyChangesDiscarded: bDirtyChangesRemoved
			};
		});
	};

	/**
	 * Publishes a version.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.version - The number of the version to be published
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving when the version was published;
	 * rejects if an error occurs, the layer does not support draft handling, there is no version to publish or
	 * when the displayed version is already published
	 */
	Versions.publish = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel({
			reference: Utils.normalizeReference(mPropertyBag.reference),
			layer: mPropertyBag.layer
		});
		return Storage.versions.publish(mPropertyBag)
			.then(function (sMessage) {
				//If transport version success, disable publish version button
				if (sMessage !== "Error" && sMessage !== "Cancel") {
					oModel.setProperty("/publishVersionEnabled", false);
					var aVersions = oModel.getProperty("/versions");
					aVersions.find(function (oVersion) {
						return oVersion.version === mPropertyBag.version;
					}).isPublished = true;
				}
				return sMessage;
			});
	};

	return Versions;
});
