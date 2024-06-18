/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils"
], function(
	ManifestUtils,
	FlexInfoSession,
	Version,
	CompVariantState,
	FeaturesAPI,
	PersistenceWriteAPI,
	VersionsAPI,
	Layer,
	LayerUtils,
	Settings,
	Utils
) {
	"use strict";

	function isDraftAvailable(oReloadInfo, sReference) {
		if (FlexInfoSession.getByReference(sReference).version) {
			return Promise.resolve(false);
		}

		return FeaturesAPI.isVersioningEnabled(oReloadInfo.layer).then(function(bVersioningAvailable) {
			return bVersioningAvailable && VersionsAPI.isDraftAvailable({
				control: oReloadInfo.selector,
				layer: oReloadInfo.layer
			});
		});
	}

	function areHigherLayerChangesAvailable(oReloadInfo, sReference) {
		var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		var bUserLayer = oReloadInfo.layer === Layer.USER;
		if (bUserLayer || (oFlexInfoSession.maxLayer && oFlexInfoSession.maxLayer === oReloadInfo.layer)) {
			return Promise.resolve(false);
		}

		return PersistenceWriteAPI.hasHigherLayerChanges({
			selector: oReloadInfo.selector,
			ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
			upToLayer: oReloadInfo.layer,
			includeCtrlVariants: oReloadInfo.includeCtrlVariants,
			includeDirtyChanges: true
		})
		.then(function(bResult) {
			// not yet saved personalization on SmartVariantManagement controls is not tracked as a FlexObject,
			// but it should be treated the same as already saved higher layer changes
			return bResult || checkSVMControlsForDirty(oReloadInfo);
		});
	}

	function checkSVMControlsForDirty(oReloadInfo) {
		if (LayerUtils.isOverLayer(Layer.USER, oReloadInfo.layer)) {
			return CompVariantState.checkSVMControlsForDirty((ManifestUtils.getFlexReferenceForControl(oReloadInfo.selector)));
		}
		return false;
	}

	/**
	 * Should reload happen when starting RTA due to allContextsProvided flag.
	 * allContextsProvided determines if the user has provided all nessesary roles to see the views.
	 * If allContextsProvided=false, that means that EndUser hasn't some specific roles to see the views,
	 * so the reload should happen in order to provide all views for a KeyUser.
	 *
	 * @param {object} oReloadInfo - Information needed for the reload
	 * @param {sap.ui.core.Control} oReloadInfo.selector - Root control instance
	 * @param {string} sReference - Flex reference of the app
	 * @return {boolean} true if allContextsProvided false and RTA wasn't started yet, otherwise false.
	 */
	function needContextSpecificReload(oReloadInfo, sReference) {
		// TODO: could be disabled when ContextBasedAdaptationAPI is enabled
		var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		if (oFlexInfoSession.initialAllContexts) {
			return false; // if we are already in RTA mode, no reload needed again
		}
		if (oFlexInfoSession.allContextsProvided === undefined) {
			var mPropertyBag = {
				selector: oReloadInfo.selector,
				layer: oReloadInfo.layer
			};
			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag)
			.then(function(oResult) {
				if (!oFlexInfoSession.initialAllContexts) {
					oResult.initialAllContexts = true;
				}
				FlexInfoSession.setByReference(oResult, sReference);
				return !oResult.allContextsProvided;
			});
		}
		oFlexInfoSession.initialAllContexts = true;
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
		return !oFlexInfoSession.allContextsProvided;
	}

	function isAllContextsAvailable(sReference, sLayer) {
		if (!Settings.getInstanceOrUndef()?.isContextSharingEnabled(sLayer)) {
			return false;
		}

		return FlexInfoSession.getByReference(sReference).allContextsProvided === false;
	}

	function needAdaptationReloadOnExit(sReference) {
		return FlexInfoSession.getByReference(sReference).isEndUserAdaptation === false;
	}

	/**
	 * Provides an API to get information about reload behavior in case of a draft and/or personalization changes.
	 *
	 * @namespace sap.ui.fl.write.api.ReloadInfoAPI
	 * @since 1.78
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var ReloadInfoAPI = /** @lends sap.ui.fl.write.api.ReloadInfoAPI */{

		/**
		 * Checks if all contexts, personalization or drafts changes exist for controls.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to find a reason to reload
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {sap.ui.core.Control} oReloadInfo.selector - Root control instance
		 * @param {boolean} [oReloadInfo.ignoreMaxLayerParameter] - Indicates that personalization is to be checked without max layer filtering
		 * @param {string} [oReloadInfo.adaptationId] - Context-based adaptation ID of the currently displayed adaptation
		 *
		 * @returns {Promise<object>} Promise resolving to an object with the reload reasons
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getReloadReasonsForStart(oReloadInfo) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oReloadInfo.selector);
			return Promise.all([
				areHigherLayerChangesAvailable.call(this, oReloadInfo, sReference),
				isDraftAvailable(oReloadInfo, sReference),
				needContextSpecificReload(oReloadInfo, sReference)
			]).then(function(aReasons) {
				[oReloadInfo.hasHigherLayerChanges, oReloadInfo.isDraftAvailable, oReloadInfo.allContexts] = aReasons;
				return oReloadInfo;
			});
		},

		/**
		 * Checks if the version is the given value in FlexInfoSession.
		 *
		 * @param {object} oParameter - Object containing the parameter value to be checked
		 * @param {string} oParameter.value - Parameter value to be checked
		 * @param {object} oControl - oControl
		 * @returns {boolean} True if the value is in the session
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		hasVersionStorage(oParameter, oControl) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oControl);
			var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			return !!(oFlexInfoSession.version && oFlexInfoSession.version === oParameter.value);
		},

		/**
		 * Remove flex info form session storage.
		 *
		 * @param {object} oControl - Root control instance
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		removeInfoSessionStorage(oControl) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oControl);
			FlexInfoSession.removeByReference(sReference);
		},

		/**
		 * Checks if the the max layer is the given value is the session.
		 *
		 * @param {object} oParameter - Object containing the parameter value to be checked
		 * @param {string} oParameter.value - Parameter value to be checked
		 * @param {object} oControl - oControl
		 *
		 * @returns {boolean} <code>true</code> if the value is in the session
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		hasMaxLayerStorage(oParameter, oControl) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oControl);
			var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			return !!(oFlexInfoSession.maxLayer && oFlexInfoSession.maxLayer === oParameter.value);
		},

		/**
		 * Standalone: Adds the version to the session or removes it.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to add the correct URL parameters
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param {boolean} oReloadInfo.ignoreMaxLayerParameter - Indicates if the max layer parameter should be ignored
		 * @param {string|object} oReloadInfo.parameters - The URL parameters to be modified
		 * @param {string} oReloadInfo.versionSwitch - Indicates if we are in a version switch scenario
		 * @param {string} oReloadInfo.version - Version we want to switch to
		 * @param {string} oReloadInfo.removeVersionParameter - Indicates if the version parameter should be removed
		 * @param {string} oReloadInfo.removeDraft - Indicates if the draft parameter should be removed
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param {string} sScenario - Current scenario. Can be 'flp' or 'standalone'
		 *
		 * @returns {boolean} Indicates if the parameters have changed
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		handleReloadInfo(oReloadInfo) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oReloadInfo.selector);
			var bFlexInfoSessionChanged = false;
			var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			if (!oReloadInfo.ignoreMaxLayerParameter && oReloadInfo.hasHigherLayerChanges) {
				delete oFlexInfoSession.maxLayer;
				delete oFlexInfoSession.adaptationLayer;
				bFlexInfoSessionChanged = true;
			}

			if (oReloadInfo.versionSwitch && oFlexInfoSession.version !== oReloadInfo.version) {
				oFlexInfoSession.version = oReloadInfo.version;
				bFlexInfoSessionChanged = true;
			}

			if (
				oFlexInfoSession.version && oReloadInfo.removeVersionParameter
				|| oFlexInfoSession.version === Version.Number.Draft && oReloadInfo.removeDraft
			) {
				delete oFlexInfoSession.version;
				bFlexInfoSessionChanged = true;
			}
			FlexInfoSession.setByReference(oFlexInfoSession, sReference);
			return bFlexInfoSessionChanged;
		},

		/**
		 * Adds parameters to the session to skip personalization changes and/or apply draft changes.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to add the correct URL parameters
		 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param {string} sScenario - Current scenario. Can be 'flp' or 'standalone'
		 *
		 * @returns {boolean} <code>true</code> to indicate that the session has been changed
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		handleReloadInfoOnStart(oReloadInfo) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oReloadInfo.selector);
			var bFlexInfoSessionChanged = false;
			var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			if (oReloadInfo.hasHigherLayerChanges) {
				oFlexInfoSession.maxLayer = oReloadInfo.layer;
				bFlexInfoSessionChanged = true;
			}

			if (oReloadInfo.isDraftAvailable) {
				oFlexInfoSession.version = Version.Number.Draft;
				bFlexInfoSessionChanged = true;
			}
			FlexInfoSession.setByReference(oFlexInfoSession, sReference);
			return bFlexInfoSessionChanged;
		},

		/**
		 * Checks if an initially available draft got activated during the current UI adaptation session.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to check if the initial draft got activated
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param {boolean} oReloadInfo.versioningEnabled - Indicates if versioning is enabled by the back end
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		initialDraftGotActivated(oReloadInfo) {
			if (oReloadInfo.versioningEnabled) {
				var bHasVersionParameter = this.hasVersionStorage({value: Version.Number.Draft}, oReloadInfo.selector);
				return !VersionsAPI.isDraftAvailable({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer
				}) && bHasVersionParameter;
			}
			return false;
		},

		/**
		 * Determines if a reload on exit is needed and if yes - it returns what kind of reload should happen
		 * (ushell Navigation or hard reload).
		 *
		 * @param {object} oReloadInfo - Contains the information needed to check if a reload on exit should happen
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
		 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param {boolean} oReloadInfo.changesNeedReload - Indicates if changes (e.g. app descriptor changes) need a hard reload
		 * @param {boolean} oReloadInfo.initialDraftGotActivated - Indicates if a draft got activated and had a draft initially when the key user entered UI adaptation
		 * @param {boolean} oReloadInfo.activeVersion - Indicates the current active version
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 *
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getReloadMethod(oReloadInfo) {
			const sReference = ManifestUtils.getFlexReferenceForControl(oReloadInfo.selector);
			var oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			oReloadInfo.reloadMethod = oRELOAD.NOT_NEEDED;

			// TODO fix app descriptor handling and reload behavior
			// TODO move changesNeedReload near flexState; set flag when saving change that needs a reload
			oReloadInfo.isDraftAvailable ||= ReloadInfoAPI.hasVersionStorage(
				{value: Version.Number.Draft},
				oReloadInfo.selector
			);

			oReloadInfo.isDraftAvailable ||= ReloadInfoAPI.hasVersionStorage({value: Version.Number.Draft}, oReloadInfo.selector);
			oReloadInfo.hasVersionStorage = !!FlexInfoSession.getByReference(sReference).version;

			if (
				oReloadInfo.activeVersion
				&& oReloadInfo.activeVersion !== Version.Number.Original
				&& oReloadInfo.hasVersionStorage
			) {
				oReloadInfo.activeVersionNotSelected = !ReloadInfoAPI.hasVersionStorage(
					{value: oReloadInfo.activeVersion},
					oReloadInfo.selector
				);
			}

			oReloadInfo.hasHigherLayerChanges = ReloadInfoAPI.hasMaxLayerStorage({value: oReloadInfo.layer}, oReloadInfo.selector);
			oReloadInfo.initialDraftGotActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			if (oReloadInfo.initialDraftGotActivated) {
				oReloadInfo.isDraftAvailable = false;
			}
			oReloadInfo.allContexts = isAllContextsAvailable(sReference, oReloadInfo.layer);
			oReloadInfo.switchEndUserAdaptation = needAdaptationReloadOnExit(sReference);
			if (oReloadInfo.changesNeedReload
				|| oReloadInfo.isDraftAvailable
				|| oReloadInfo.hasHigherLayerChanges
				|| oReloadInfo.initialDraftGotActivated
				|| oReloadInfo.activeVersionNotSelected
				|| oReloadInfo.allContexts
				|| oReloadInfo.switchEndUserAdaptation
			) {
				oReloadInfo.reloadMethod = oRELOAD.RELOAD_PAGE;
				// always try cross-app navigation (via hash); we only need a hard reload because of appdescr changes
				// (changesNeedReload = true)
				if (!oReloadInfo.changesNeedReload && Utils.getUshellContainer()) {
					oReloadInfo.reloadMethod = oRELOAD.VIA_HASH;
				}
			}
			return oReloadInfo;
		}
	};
	return ReloadInfoAPI;
});