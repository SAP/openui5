/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/init"
], function(
	FlexObjectState,
	FlexInfoSession,
	ManifestUtils,
	Version,
	Versions,
	ContextBasedAdaptationsAPI,
	FeaturesAPI,
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
			return Promise.reject(new Error("No control was provided"));
		}
		if (!mPropertyBag.layer) {
			return Promise.reject(new Error("No layer was provided"));
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
	 * Returns the list of Flex Objects file names which belong to the current draft.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the file names should be retrieved
	 * @returns {string[]} List of file names for the draft
	 */
	VersionsAPI.getDraftFilenames = function(mPropertyBag) {
		const oModel = getVersionsModel(mPropertyBag);
		return oModel.getProperty("/draftFilenames");
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
		return VersionsAPI.loadVersionForApplication({ ...mPropertyBag, version: Version.Number.Draft });
	};

	/**
	 * Prepares the State for loading a specific version after a reload;
	 * the actual reload of the application has to be triggered by the caller.
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
	VersionsAPI.loadVersionForApplication = async function(mPropertyBag) {
		if (!mPropertyBag.control) {
			throw Error("No control was provided");
		}
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}
		const oModel = getVersionsModel(mPropertyBag);
		const sVersion = mPropertyBag.version !== undefined ? mPropertyBag.version : oModel?.getProperty("/activeVersion");
		if (oModel) {
			oModel.setProperty("/displayedVersion", sVersion);
			oModel.setProperty("/persistedVersion", sVersion);
			const bIsPublishAvailable = await FeaturesAPI.isPublishAvailable();
			if (sVersion !== Version.Number.Draft && bIsPublishAvailable) {
				const aVersions = oModel.getProperty("/versions");
				if (aVersions.length) {
					const oVersion = aVersions.find(function(oVersion) {
						return oVersion.version === sVersion;
					});
					if (oVersion) {
						oModel.setProperty("/publishVersionEnabled", !oVersion.isPublished);
					}
				}
			}
		}

		const sDisplayedAdaptationId = await incorporateAdaptationIdInSwitch(mPropertyBag);
		const oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
		const sReference = getFlexReferenceForControl(oAppComponent);
		const oFlexInfo = FlexInfoSession.getByReference(sReference);
		oFlexInfo.version = sVersion;
		oFlexInfo.displayedAdaptationId = sDisplayedAdaptationId;
		FlexInfoSession.setByReference(oFlexInfo, sReference);
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
			return Promise.reject(new Error("No control was provided"));
		}
		if (!mPropertyBag.layer) {
			return Promise.reject(new Error("No layer was provided"));
		}
		if (!mPropertyBag.title) {
			return Promise.reject(new Error("No version title was provided"));
		}

		const sReference = getFlexReferenceForControl(mPropertyBag.control);
		if (doDirtyChangesExist(sReference)) {
			return Promise.reject(new Error("Unsaved changes exist"));
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
	 * @param {boolean} [mPropertyBag.discardDraftAndKeepActiveVersion] - discard draft and keep active version
	 * @returns {Promise<boolean>} Promise resolving with a flag if a discarding took place;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	VersionsAPI.discardDraft = function(mPropertyBag) {
		if (!mPropertyBag.control) {
			return Promise.reject(new Error("No control was provided"));
		}
		if (!mPropertyBag.layer) {
			return Promise.reject(new Error("No layer was provided"));
		}
		const oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
		const sReference = getFlexReferenceForControl(oAppComponent);
		return Versions.discardDraft({
			reference: sReference,
			layer: mPropertyBag.layer,
			discardDraftAndKeepActiveVersion: mPropertyBag.discardDraftAndKeepActiveVersion
		})
		.then(function(oDiscardInfo) {
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
						return oDiscardInfo;
					});
				}
			}
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
	 * @param {function(boolean):void} [mPropertyBag.setBusy] - Optional callback invoked by the connector to request showing (<code>true</code>) or hiding (<code>false</code>) a busy indicator.
	 * The connector decides when to call it (e.g. an ABAP connector calls it after the transport selection dialog closes).
	 * @returns {Promise} Resolves when the version was published.
	 * Rejects with a {@link sap.ui.fl.util.CancelError} if the user cancelled the publish flow.
	 * Rejects with the originating error otherwise.
	 */
	VersionsAPI.publish = function(mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject(new Error("No selector was provided"));
		}
		if (!mPropertyBag.layer) {
			return Promise.reject(new Error("No layer was provided"));
		}
		if (!mPropertyBag.version) {
			return Promise.reject(new Error("No version was provided"));
		}
		return Versions.publish({
			...mPropertyBag,
			styleClass: mPropertyBag.styleClass || "",
			reference: getFlexReferenceForControl(mPropertyBag.selector)
		});
	};

	/**
	 * Returns the list of versions created by a specific user
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} sUser - User ID for which the versions should be retrieved
	 * @returns {Array} List of versions created by the user
	 */
	VersionsAPI.getCreatedVersionsByUser = function(mPropertyBag, sUser) {
		const oModel = getVersionsModel(mPropertyBag);
		const aVersions = oModel.getProperty("/versions");
		return aVersions.filter((oVersion) => oVersion.activatedBy === sUser);
	};

	return VersionsAPI;
});
