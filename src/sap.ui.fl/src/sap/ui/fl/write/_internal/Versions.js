/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode"
], function(
	FlexObjectState,
	Version,
	FlexInfoSession,
	Settings,
	Storage,
	ChangePersistenceFactory,
	JSONModel,
	BindingMode
) {
	"use strict";

	var _mInstances = {};
	var MODEL_SIZE_LIMIT = 9;
	// Limiting the data requested from the back end but one additional version is requested to
	// ensure sufficient data is present even if a draft was returned and later discarded
	var BACKEND_REQUEST_LIMIT = MODEL_SIZE_LIMIT + 1;

	function createModel(mPropertyBag) {
		var oModel = _prepareVersionsModel(mPropertyBag);
		oModel.setDefaultBindingMode(BindingMode.OneWay);
		oModel.setSizeLimit(MODEL_SIZE_LIMIT);
		// TODO: currently called by sap.ui.rta.RuntimeAuthoring but should be by a ChangesState
		oModel.setDirtyChanges = function(bDirtyChanges) {
			oModel.setProperty("/dirtyChanges", bDirtyChanges);
			oModel.updateDraftVersion();
			oModel.updateBindings(true);
		};

		oModel.updateDraftVersion = function() {
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
				aVersions.splice(0, 0, {version: Version.Number.Draft, type: Version.Type.Draft, filenames: [], isPublished: false});
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
	}

	function _isPublishVersionEnabled(aVersions, sDisplayedVersion) {
		if (sDisplayedVersion !== Version.Number.Original && sDisplayedVersion !== Version.Number.Draft) {
			return aVersions.some(function(oVersion) {
				return oVersion.version === sDisplayedVersion && oVersion.isPublished === false;
			});
		}
		return false;
	}

	function _prepareVersionsModel(mPropertyBag) {
		var sPersistedBasisForDisplayedVersion;
		var sActiveVersion = Version.Number.Original;
		var aVersions = mPropertyBag.versions;
		var oVersionsModel = mPropertyBag.versionsModel;
		var bBackendDraft = _doesDraftExistInVersions(aVersions);
		var aDraftFilenames = [];

		if (aVersions.length > 0) {
			sPersistedBasisForDisplayedVersion = aVersions[0].version;
		} else {
			sPersistedBasisForDisplayedVersion = Version.Number.Original;
		}

		aVersions.forEach(function(oVersion) {
			if (oVersion.version === Version.Number.Draft) {
				oVersion.type = Version.Type.Draft;
				oVersion.isPublished = false;
				aDraftFilenames = oVersion.filenames;
			} else if (sActiveVersion === Version.Number.Original) {
				// no active version found yet; the first non-draft version is always the active version
				oVersion.type = Version.Type.Active;
				sActiveVersion = oVersion.version;
			} else {
				oVersion.type = Version.Type.Inactive;
			}
		});

		if (oVersionsModel) {
			oVersionsModel.setProperty("/publishVersionEnabled", _isPublishVersionEnabled(aVersions, sPersistedBasisForDisplayedVersion));
			oVersionsModel.setProperty("/versioningEnabled", mPropertyBag.versioningEnabled);
			oVersionsModel.setProperty("/versions", aVersions);
			oVersionsModel.setProperty("/backendDraft", bBackendDraft);
			oVersionsModel.setProperty("/dirtyChanges", false);
			oVersionsModel.setProperty("/draftAvailable", bBackendDraft);
			oVersionsModel.setProperty("/activateEnabled", bBackendDraft);
			oVersionsModel.setProperty("/activeVersion", sActiveVersion);
			oVersionsModel.setProperty("/persistedVersion", sPersistedBasisForDisplayedVersion);
			oVersionsModel.setProperty("/displayedVersion", sPersistedBasisForDisplayedVersion);
			oVersionsModel.setProperty("/draftFilenames", aDraftFilenames);
			oVersionsModel.updateBindings(true);
		} else {
			// when a standalone app switch the version it always trigger a hard reload there the session version is needed
			var oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
			return new JSONModel({
				publishVersionEnabled: _isPublishVersionEnabled(aVersions, oFlexInfoSession.version || sPersistedBasisForDisplayedVersion),
				versioningEnabled: mPropertyBag.versioningEnabled,
				versions: aVersions,
				backendDraft: bBackendDraft,
				dirtyChanges: false,
				draftAvailable: bBackendDraft,
				activateEnabled: bBackendDraft,
				activeVersion: sActiveVersion,
				persistedVersion: oFlexInfoSession.version || sPersistedBasisForDisplayedVersion,
				displayedVersion: oFlexInfoSession.version || sPersistedBasisForDisplayedVersion,
				draftFilenames: aDraftFilenames
			});
		}

		return oVersionsModel;
	}
	// TODO: the handling should move to the FlexState as soon as it is ready
	function _removeDirtyChanges(mPropertyBag) {
		const oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
		const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(mPropertyBag.reference);
		oChangePersistence.deleteChanges(aDirtyChanges, true);
		return aDirtyChanges.length > 0;
	}

	function doDirtyChangesExist(sReference) {
		const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(sReference);
		return aDirtyChanges.length > 0;
	}

	function _doesDraftExistInVersions(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.version === Version.Number.Draft;
		});
	}

	function _updateVersionModelWhenDiscardOrActivate(oModel, iNewVersion) {
		oModel.setProperty("/backendDraft", false);
		oModel.setProperty("/dirtyChanges", false);
		oModel.setProperty("/draftAvailable", false);
		oModel.setProperty("/activateEnabled", false);
		oModel.setProperty("/displayedVersion", iNewVersion);
		oModel.setProperty("/persistedVersion", iNewVersion);
		oModel.updateBindings(true);
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
		.then(function(oSettings) {
			var bVersionsEnabled = oSettings.isVersioningEnabled(sLayer);
			// TODO: similar to ContextBasedAdaptationsAPI this could also be moved outside
			if (_mInstances && _mInstances[sReference] && _mInstances[sReference][sLayer]) {
				return _mInstances[sReference][sLayer];
			}
			var aVersionsPromise = bVersionsEnabled ? Storage.versions.load(mPropertyBag) : Promise.resolve([]);
			return aVersionsPromise
			.then(function(aVersions) {
				mPropertyBag.versioningEnabled = bVersionsEnabled;
				mPropertyBag.versions = aVersions;
				return createModel(mPropertyBag);
			})
			.then(function(oModel) {
				_mInstances[sReference] ||= {};
				_mInstances[sReference][sLayer] ||= {};
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

		if (!Versions.hasVersionsModel(mPropertyBag)) {
			throw Error(`Versions Model for reference '${sReference}' and layer '${sLayer}' were not initialized.`);
		}

		if (doDirtyChangesExist(mPropertyBag.reference)) {
			_mInstances[sReference][sLayer].updateDraftVersion(mPropertyBag);
		}
		return _mInstances[sReference][sLayer];
	};

	Versions.hasVersionsModel = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return !!(_mInstances[sReference] && _mInstances[sReference][sLayer]);
	};

	Versions.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Update version model with backend information.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated version model for the application from the backend
	 */
	Versions.updateModelFromBackend = function(mPropertyBag) {
		if (Versions.hasVersionsModel(mPropertyBag) && Versions.getVersionsModel(mPropertyBag).getProperty("/versioningEnabled")) {
			mPropertyBag.limit = BACKEND_REQUEST_LIMIT;
			return Storage.versions.load(mPropertyBag)
			.then(function(aVersions) {
				var oVersionsModel = Versions.getVersionsModel(mPropertyBag);
				mPropertyBag.versioningEnabled = oVersionsModel.getProperty("/versioningEnabled");
				mPropertyBag.versions = aVersions;
				mPropertyBag.versionsModel = oVersionsModel;
				return _prepareVersionsModel(mPropertyBag);
			});
		}
		return undefined;
	};

	/**
	 * Updates dirty changes and the backendDraft property of the model after a saveAll was called.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {boolean} [mPropertyBag.contextBasedAdaptation] - Parameter that indicates whether or not a new backend draft was triggered via contextBasedAdaptationsAPI
	 * @param {array} [mPropertyBag.draftFilenames] - Array with filesnames which was saved as draft
	 */
	Versions.onAllChangesSaved = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var bVersioningEnabled = oModel.getProperty("/versioningEnabled");
		var bDirtyChanges = oModel.getProperty("/dirtyChanges");
		var aDraftFilenames = oModel.getProperty("/draftFilenames");
		oModel.setProperty("/draftFilenames", aDraftFilenames.concat(mPropertyBag.draftFilenames));
		oModel.setProperty("/dirtyChanges", true);
		oModel.setProperty("/backendDraft", bVersioningEnabled && bDirtyChanges || !!mPropertyBag.contextBasedAdaptation);
		oModel.updateDraftVersion();
		// Save can happen without a reload and the model must be kept up-to-date
		oModel.setProperty("/persistedVersion", Version.Number.Draft);
		oModel.updateBindings(true);
	};

	/**
	 * (Re-)activates a version.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 * @param {string} mPropertyBag.appComponent - Application Component
	 * @param {string} mPropertyBag.displayedVersion - Id of the displayed version
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs, the layer does not support draft handling, there is unsaved content, there is no draft to activate or
	 * when the displayed version is already active
	 */
	Versions.activate = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var aVersions = oModel.getProperty("/versions");
		var bDraftExists = _doesDraftExistInVersions(aVersions);
		var sActiveVersion = oModel.getProperty("/activeVersion");
		if (mPropertyBag.displayedVersion === sActiveVersion) {
			return Promise.reject("Version is already active");
		}
		mPropertyBag.version = mPropertyBag.displayedVersion;

		if (doDirtyChangesExist(mPropertyBag.reference)) {
			return Promise.reject("unsaved changes exists");
		}

		return Storage.versions.activate(mPropertyBag)
		.then(function(oVersion) {
			aVersions.forEach(function(oVersionEntry) {
				oVersionEntry.type = Version.Type.Inactive;
			});
			oVersion.type = Version.Type.Active;
			oVersion.isPublished = false;
			if (bDraftExists) {
				aVersions.shift();
			}
			aVersions.splice(0, 0, oVersion);
			oModel.setProperty("/activeVersion", oVersion.version);
			oModel.setProperty("/publishVersionEnabled", true);
			oModel.setProperty("/draftFilenames", []);
			_updateVersionModelWhenDiscardOrActivate(oModel, oVersion.version);
		});
	};

	/**
	 * Discards the draft for a given application and layer; dirty changes are only.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<object>} Promise resolving to an object to indicate if a discarding took place on backend side and/or dirty changes were discarded;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.discardDraft = function(mPropertyBag) {
		var oModel = Versions.getVersionsModel(mPropertyBag);
		var bBackendDraftExists = oModel.getProperty("/backendDraft");
		var oDiscardPromise = bBackendDraftExists ? Storage.versions.discardDraft(mPropertyBag) : Promise.resolve();

		return oDiscardPromise.then(function() {
			var aVersions = oModel.getProperty("/versions");
			aVersions.shift();
			_updateVersionModelWhenDiscardOrActivate(oModel, oModel.getProperty("/activeVersion"));
			// in case of a existing draft known by the backend;
			// we remove dirty changes only after successful DELETE request
			const bDirtyChangesRemoved = _removeDirtyChanges(mPropertyBag);
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
			reference: mPropertyBag.reference,
			layer: mPropertyBag.layer
		});
		return Storage.versions.publish(mPropertyBag)
		.then(function(sMessage) {
			// If transport version success, disable publish version button
			if (sMessage !== "Error" && sMessage !== "Cancel") {
				oModel.setProperty("/publishVersionEnabled", false);
				var aVersions = oModel.getProperty("/versions");
				var bIsPublishedOrOlderVersion = false;
				aVersions.forEach(function(oVersion) {
					if (oVersion.isPublished) {
						return;
					}
					if (oVersion.version === mPropertyBag.version) {
						bIsPublishedOrOlderVersion = true;
					}
					if (bIsPublishedOrOlderVersion && !oVersion.isPublished) {
						oVersion.isPublished = true;
					}
				});
			}
			return sMessage;
		});
	};

	return Versions;
});
