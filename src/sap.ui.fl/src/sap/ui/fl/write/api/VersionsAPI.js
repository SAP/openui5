/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils"
], function(
	FlexObjectState,
	FlexState,
	ManifestUtils,
	FlexInfoSession,
	Version,
	Versions,
	ContextBasedAdaptationsAPI,
	FeaturesAPI,
	ChangePersistenceFactory,
	Utils
) {
	"use strict";

	function getFlexReferenceForControl(oControl) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oControl);

		if (!sReference) {
			throw Error("The application ID could not be determined");
		}

		return sReference;
	}

	function doDirtyChangesExist(sReference) {
		const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(sReference);
		return aDirtyChanges.length > 0;
	}

	function getVersionsModel(mPropertyBag) {
		if (!mPropertyBag.control) {
			throw Error("No control was provided");
		}
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}

		var sReference = getFlexReferenceForControl(mPropertyBag.control);

		const oVersionModel = Versions.getVersionsModel({
			reference: sReference,
			layer: mPropertyBag.layer
		});

		if (doDirtyChangesExist(sReference)) {
			oVersionModel.updateDraftVersion();
		}
		return oVersionModel;
	}

	function incorporateAdaptationIdInSwitch(mPropertyBag) {
		var sReference = getFlexReferenceForControl(mPropertyBag.control);
		var bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel({
			layer: mPropertyBag.layer,
			reference: sReference
		});

		// version switch
		if (!mPropertyBag.adaptationId && bHasAdaptationsModel) {
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(mPropertyBag);
		// adaptation switch
		} else if (mPropertyBag.adaptationId && bHasAdaptationsModel) {
			var oAdaptationsModel = ContextBasedAdaptationsAPI.getAdaptationsModel(mPropertyBag);
			oAdaptationsModel.switchDisplayedAdaptation(mPropertyBag.adaptationId);
			return Promise.resolve(mPropertyBag.adaptationId);
		}
		// adaptations disabled
		return Promise.resolve();
	}

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to activate, discard and retrieve versions.
	 *
	 * @namespace sap.ui.fl.write.api.VersionsAPI
	 * @since 1.74
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var VersionsAPI = /** @lends sap.ui.fl.write.api.VersionsAPI */ {};

	/**
	 * Initializes the versions for a given control and layer.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @returns {Promise<sap.ui.model.json.JSONModel>} Model with list of versions if available and further version properties;
	 * Rejects if not all parameters were passed or the application could not be determined
	 */
	VersionsAPI.initialize = function(mPropertyBag) {
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);

		return Versions.initialize({
			reference: getFlexReferenceForControl(oAppComponent),
			layer: mPropertyBag.layer
		});
	};

	VersionsAPI.clearInstances = function() {
		Versions.clearInstances();
	};

	/**
	 * Returns a flag if a draft exists for the current application and layer.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @return {boolean} Flag if a draft is available;
	 * Throws an error in case no initialization took place upfront
	 */
	VersionsAPI.isDraftAvailable = function(mPropertyBag) {
		var oModel = getVersionsModel(mPropertyBag);

		var aVersions = oModel.getProperty("/versions");
		var oDraft = aVersions.find(function(oVersion) {
			return oVersion.version === Version.Number.Draft;
		});

		return !!oDraft;
	};

	/**
	 * Returns a flag if the displayed version is not the active version for the current application and layer.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @return {boolean} Flag if the displayed version is not the active version
	 * Throws an error in case no initialization took place upfront
	 */
	VersionsAPI.isOldVersionDisplayed = function(mPropertyBag) {
		var oModel = getVersionsModel(mPropertyBag);

		var displayedVersion = oModel.getProperty("/displayedVersion");
		var activeVersion = oModel.getProperty("/activeVersion");

		return displayedVersion !== Version.Number.Draft && displayedVersion !== activeVersion;
	};

	/**
	 * Removes the internal stored state of a given application and refreshes the state including a draft for the given layer;
	 * an actual reload of the application has to be triggered by the caller.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation to be loaded
	 *
	 * @returns {Promise} Resolves as soon as the clearance and the requesting is triggered.
	 */
	VersionsAPI.loadDraftForApplication = function(mPropertyBag) {
		mPropertyBag.version = Version.Number.Draft;
		return VersionsAPI.loadVersionForApplication(mPropertyBag);
	};

	/**
	 * Removes the internal stored state of a given application and refreshes the state including a draft for the given layer;
	 * an actual reload of the application has to be triggered by the caller.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} [mPropertyBag.version] - Version to be loaded
	 * @param {boolean} [mPropertyBag.allContexts] - Includes also restricted contexts
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation to be loaded
	 *
	 * @returns {Promise} Resolves as soon as the clearance and the requesting is triggered.
	 */
	VersionsAPI.loadVersionForApplication = function(mPropertyBag) {
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		const oModel = getVersionsModel(mPropertyBag);
		if (oModel) {
			if (mPropertyBag.version === undefined) {
				mPropertyBag.version = oModel.getProperty("/activeVersion");
			}
			oModel.setProperty("/displayedVersion", mPropertyBag.version);
			oModel.setProperty("/persistedVersion", mPropertyBag.version);
			if (mPropertyBag.version !== Version.Number.Draft && FeaturesAPI.isPublishAvailable()) {
				const aVersions = oModel.getProperty("/versions");
				if (aVersions.length) {
					const oVersion = aVersions.find(function(oVersion) {
						return oVersion.version === mPropertyBag.version;
					});
					if (oVersion) {
						oModel.setProperty("/publishVersionEnabled", !oVersion.isPublished);
					}
				}
			}
		}

		return incorporateAdaptationIdInSwitch(mPropertyBag)
		.then(function(sDisplayedAdaptationId) {
			const oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
			const sReference = getFlexReferenceForControl(oAppComponent);
			const oFlexInfo = FlexInfoSession.getByReference(sReference);
			oFlexInfo.version = mPropertyBag.version;
			oFlexInfo.displayedAdaptationId = sDisplayedAdaptationId;
			FlexInfoSession.setByReference(oFlexInfo, sReference);
			FlexState.clearState(sReference);
		});
	};

	/**
	 * (Re-)activates a version.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 * @param {string} mPropertyBag.displayedVersion - Id of the displayed version
	 *
	 * @ui5-restricted sap.ui.rta
	 *
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs, the layer does not support draft handling, there is unsaved content, there is no draft to activate or
	 * when the displayed version is already active
	 */
	VersionsAPI.activate = function(mPropertyBag) {
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.title) {
			return Promise.reject("No version title was provided");
		}

		const sReference = getFlexReferenceForControl(mPropertyBag.control);
		if (doDirtyChangesExist(sReference)) {
			return Promise.reject("Unsaved changes exist");
		}

		const oFlexInfo = FlexInfoSession.getByReference(sReference);
		delete oFlexInfo.version;
		FlexInfoSession.setByReference(oFlexInfo, sReference);

		return Versions.activate({
			reference: sReference,
			layer: mPropertyBag.layer,
			title: mPropertyBag.title,
			appComponent: Utils.getAppComponentForControl(mPropertyBag.control),
			displayedVersion: mPropertyBag.displayedVersion
		});
	};

	/**
	 * Discards the current draft within a given layer; This sends a call to the connector in case a draft exists and will
	 * update the FlexState accordingly in case the <code>updateState</code> flag is set; This API does not revert the changes
	 * and the consumer must take care of making a reload of the application itself.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<boolean>} Promise resolving with a flag if a discarding took place;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	VersionsAPI.discardDraft = function(mPropertyBag) {
		function removeDirtyChanges(mPropertyBag) {
			const oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
			const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(mPropertyBag.reference);
			oChangePersistence.deleteChanges(aDirtyChanges, true);
			return aDirtyChanges.length > 0;
		}

		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		const oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
		const sReference = getFlexReferenceForControl(oAppComponent);
		return Versions.discardDraft({
			reference: sReference,
			layer: mPropertyBag.layer
		})
		.then(function(oDiscardInfo) {
			// in case of a existing draft known by the backend;
			// we remove dirty changes only after successful DELETE request
			const bDirtyChangesRemoved = removeDirtyChanges(mPropertyBag);
			oDiscardInfo.dirtyChangesDiscarded = bDirtyChangesRemoved;

			if (oDiscardInfo.backendChangesDiscarded) {
				const bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel({
					layer: mPropertyBag.layer,
					reference: sReference
				});
				if (bHasAdaptationsModel) {
					return ContextBasedAdaptationsAPI.refreshAdaptationModel(mPropertyBag)
					.then(function(sDisplayedAdaptationId) {
						// invalidate flexState to trigger getFlexData for the current active version after discard
						const oFlexInfo = FlexInfoSession.getByReference(sReference);
						oFlexInfo.displayedAdaptationId = sDisplayedAdaptationId;
						FlexInfoSession.setByReference(oFlexInfo, sReference);
						FlexState.clearState(sReference);
						return oDiscardInfo;
					});
				}
			}
			FlexState.clearState(sReference);
			return oDiscardInfo;
		});
	};

	/**
	 * Publish a version.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @param {string} [mPropertyBag.styleClass] - Style class name that will be added to the transport dialog
	 * @param {string} mPropertyBag.layer - Working layer
	 * @param {string} mPropertyBag.version - ID of version which need to be published
	 * @returns {Promise<string>} Promise that can resolve to the following strings:
	 * - "Cancel" if publish process was canceled
	 * - <sMessage> when all the version is successfully transported fl will return the message to show
	 * - "Error" in case of a problem
	 */
	VersionsAPI.publish = function(mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.version) {
			return Promise.reject("No version was provided");
		}
		mPropertyBag.styleClass ||= "";
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.selector);

		return Versions.publish(mPropertyBag);
	};

	return VersionsAPI;
});
