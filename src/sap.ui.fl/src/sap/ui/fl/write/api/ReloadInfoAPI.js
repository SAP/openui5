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
	Utils
) {
	"use strict";

	var oMutators = {
		flp: {
			set(vParams, sKey, sValue) {
				vParams[sKey] = [sValue];
				return vParams;
			},
			get(vParams, sKey) {
				return vParams[sKey] && vParams[sKey][0];
			},
			remove(vParams, sKey) {
				delete vParams[sKey];
				return vParams;
			}
		},
		standalone: {
			set(vParams, sKey, sValue) {
				return Utils.handleUrlParameters(vParams, sKey, sValue);
			},
			get(vParams, sKey) {
				return Utils.getParameter(sKey);
			},
			remove(vParams, sKey, sValue) {
				return Utils.handleUrlParameters(vParams, sKey, sValue);
			}
		}
	};

	function isDraftAvailable(oReloadInfo) {
		var bUrlHasVersionParameter = !!Utils.getParameter(Version.UrlParameter, oReloadInfo.URLParsingService);
		if (bUrlHasVersionParameter) {
			return Promise.resolve(false);
		}

		return FeaturesAPI.isVersioningEnabled(oReloadInfo.layer).then(function(bVersioningAvailable) {
			return bVersioningAvailable && VersionsAPI.isDraftAvailable({
				control: oReloadInfo.selector,
				layer: oReloadInfo.layer
			});
		});
	}

	function areHigherLayerChangesAvailable(oReloadInfo) {
		var bUrlHasMaxLayerParameter = this.hasMaxLayerParameterWithValue({value: oReloadInfo.layer}, oReloadInfo.URLParsingService);
		var bUserLayer = oReloadInfo.layer === Layer.USER;
		if (bUserLayer || bUrlHasMaxLayerParameter) {
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
	 * @return {boolean} true if allContextsProvided false and RTA wasn't started yet, otherwise false.
	 */
	function needContextSpecificReload(oReloadInfo) {
		// TODO: could be disabled when ContextBasedAdaptationAPI is enabled
		var oFlexInfoSession = FlexInfoSession.get(oReloadInfo.selector);
		if (oFlexInfoSession && oFlexInfoSession.initialAllContexts) {
			return false; // if we are already in RTA mode, no reload needed again
		}
		if (oFlexInfoSession === null || oFlexInfoSession.allContextsProvided === undefined) {
			var mPropertyBag = {
				selector: oReloadInfo.selector,
				layer: oReloadInfo.layer
			};
			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag)
			.then(function(oResult) {
				if (oFlexInfoSession === null || !oFlexInfoSession.initialAllContexts) {
					oResult.initialAllContexts = true;
				}
				FlexInfoSession.set(oResult, oReloadInfo.selector);
				return !oResult.allContextsProvided;
			});
		}
		oFlexInfoSession.initialAllContexts = true;
		FlexInfoSession.set(oFlexInfoSession, oReloadInfo.selector);
		return !oFlexInfoSession.allContextsProvided;
	}

	function isAllContextsAvailable(oControl) {
		var oFlexInfoSession = FlexInfoSession.get(oControl);
		return oFlexInfoSession && !oFlexInfoSession.allContextsProvided;
	}

	function needAdaptationReloadOnExit(oControl) {
		var oFlexInfoSession = FlexInfoSession.get(oControl);
		return oFlexInfoSession && oFlexInfoSession.isEndUserAdaptation === false;
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
		 * @param {object} oReloadInfo.parsedHash - Parsed URL hash
		 *
		 * @returns {Promise<object>} Promise resolving to an object with the reload reasons
		 */
		getReloadReasonsForStart(oReloadInfo) {
			return Promise.all([
				areHigherLayerChangesAvailable.call(this, oReloadInfo),
				isDraftAvailable(oReloadInfo),
				needContextSpecificReload(oReloadInfo)
			]).then(function(aReasons) {
				[oReloadInfo.hasHigherLayerChanges, oReloadInfo.isDraftAvailable, oReloadInfo.allContexts] = aReasons;
				return oReloadInfo;
			});
		},

		/**
		 * Checks if the the <code>sap-ui-fl-version</code> parameter name with the given value is contained in the URL.
		 *
		 * @param {object} oParameter - Object containing the parameter value to be checked
		 * @param {string} oParameter.value - Parameter value to be checked
		 * @param {sap.ushell.services.URLParsing} oURLParsingService - Unified Shell's internal URL parsing service
		 * @returns {boolean} True if the parameter with the given value is in the URL
		 */
		hasVersionParameterWithValue(oParameter, oURLParsingService) {
			return Utils.hasParameterAndValue(Version.UrlParameter, oParameter.value, oURLParsingService);
		},

		/**
		 * Remove flex info form session storage.
		 *
		 * @param {object} oControl - Root control instance
		 */
		removeInfoSessionStorage(oControl) {
			FlexInfoSession.remove(oControl);
		},

		/**
		 * Checks if the the <code>sap-ui-fl-max-layer</code> parameter name with the given value is contained in the URL.
		 *
		 * @param {object} oParameter - Object containing the parameter value to be checked
		 * @param {string} oParameter.value - Parameter value to be checked
		 * @param {sap.ushell.services.URLParsing} oURLParsingService - Unified Shell's internal URL parsing service
		 *
		 * @returns {boolean} <code>true</code> if the parameter with the given value is in the URL
		 */
		hasMaxLayerParameterWithValue(oParameter, oURLParsingService) {
			var sParameterName = LayerUtils.FL_MAX_LAYER_PARAM;
			return Utils.hasParameterAndValue(sParameterName, oParameter.value, oURLParsingService);
		},

		/**
		 * Standalone: Adds the <code>sap-ui-fl-version</code> parameter to the URL or removes it.
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
		 */
		handleUrlParameters(oReloadInfo, sScenario) {
			var bParametersChanged = false;
			var oFlexInfoSession = FlexInfoSession.get(oReloadInfo.selector) || {};
			if (!oReloadInfo.ignoreMaxLayerParameter && oReloadInfo.hasHigherLayerChanges) {
				oReloadInfo.parameters = oMutators[sScenario].remove(oReloadInfo.parameters, LayerUtils.FL_MAX_LAYER_PARAM, oReloadInfo.layer);
				delete oFlexInfoSession.maxLayer;
				bParametersChanged = true;
			}

			var sCurrentVersionParameter = oMutators[sScenario].get(oReloadInfo.parameters, Version.UrlParameter);
			if (oReloadInfo.versionSwitch && sCurrentVersionParameter !== oReloadInfo.version) {
				oReloadInfo.parameters = oMutators[sScenario].remove(oReloadInfo.parameters, Version.UrlParameter, sCurrentVersionParameter);
				oReloadInfo.parameters = oMutators[sScenario].set(oReloadInfo.parameters, Version.UrlParameter, oReloadInfo.version);
				oFlexInfoSession.version = oReloadInfo.version;
				bParametersChanged = true;
			}

			if (
				sCurrentVersionParameter && oReloadInfo.removeVersionParameter
				|| sCurrentVersionParameter === Version.Number.Draft && oReloadInfo.removeDraft
			) {
				oReloadInfo.parameters = oMutators[sScenario].remove(oReloadInfo.parameters, Version.UrlParameter, sCurrentVersionParameter);
				delete oFlexInfoSession.version;
				bParametersChanged = true;
			}
			FlexInfoSession.set(oFlexInfoSession, oReloadInfo.selector);
			return bParametersChanged;
		},

		/**
		 * Adds parameters to the parsed hash to skip personalization changes and/or apply draft changes.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to add the correct URL parameters
		 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param {string} sScenario - Current scenario. Can be 'flp' or 'standalone'
		 *
		 * @returns {boolean} <code>true</code> to indicate that the URL has been changed
		 */
		handleParametersOnStart(oReloadInfo, sScenario) {
			var bParametersChanged = false;
			var oFlexInfoSession = FlexInfoSession.get(oReloadInfo.selector) || {};
			if (oReloadInfo.hasHigherLayerChanges) {
				oReloadInfo.parameters = oMutators[sScenario].set(oReloadInfo.parameters, LayerUtils.FL_MAX_LAYER_PARAM, oReloadInfo.layer);
				oFlexInfoSession.maxLayer = oReloadInfo.layer;
				bParametersChanged = true;
			}

			if (oReloadInfo.isDraftAvailable) {
				oReloadInfo.parameters = oMutators[sScenario].set(oReloadInfo.parameters, Version.UrlParameter, Version.Number.Draft);
				oFlexInfoSession.version = Version.Number.Draft;
				bParametersChanged = true;
			}
			FlexInfoSession.set(oFlexInfoSession, oReloadInfo.selector);
			return bParametersChanged;
		},

		/**
		 * Checks if an initially available draft got activated during the current UI adaptation session.
		 *
		 * @param {object} oReloadInfo - Contains the information needed to check if the initial draft got activated
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param {boolean} oReloadInfo.versioningEnabled - Indicates if versioning is enabled by the back end
		 * @param {sap.ushell.services.URLParsing} oReloadInfo.URLParsingService - Unified Shell's internal URL parsing service
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 */
		initialDraftGotActivated(oReloadInfo) {
			if (oReloadInfo.versioningEnabled) {
				var bUrlHasVersionParameter = this.hasVersionParameterWithValue({value: Version.Number.Draft}, oReloadInfo.URLParsingService);
				return !VersionsAPI.isDraftAvailable({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer
				}) && bUrlHasVersionParameter;
			}
			return false;
		},

		/**
		 * Determines if a reload on exit is needed and if yes - it returns what kind of reload should happen (CrossAppNavigation or hard reload).
		 *
		 * @param {object} oReloadInfo - Contains the information needed to check if a reload on exit should happen
		 * @param {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param {boolean} oReloadInfo.isDraftAvailable - Indicates if a draft is available
		 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param {boolean} oReloadInfo.changesNeedReload - Indicates if changes (e.g. app descriptor changes) need a hard reload
		 * @param {boolean} oReloadInfo.initialDraftGotActivated - Indicates if a draft got activated and had a draft initially when the key user entered UI adaptation
		 * @param {boolean} oReloadInfo.activeVersion - Indicates the current active version
		 * @param {sap.ushell.services.URLParsing} oReloadInfo.URLParsingService - Unified Shell's internal URL parsing service
		 *
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 */
		getReloadMethod(oReloadInfo) {
			var oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			oReloadInfo.reloadMethod = oRELOAD.NOT_NEEDED;

			// TODO fix app descriptor handling and reload behavior
			// TODO move changesNeedReload near flexState; set flag when saving change that needs a reload
			oReloadInfo.isDraftAvailable ||= ReloadInfoAPI.hasVersionParameterWithValue(
				{value: Version.Number.Draft},
				oReloadInfo.URLParsingService
			);

			oReloadInfo.hasVersionUrlParameter = !!Utils.getParameter(Version.UrlParameter, oReloadInfo.URLParsingService);

			if (
				oReloadInfo.activeVersion
				&& oReloadInfo.activeVersion !== Version.Number.Original
				&& oReloadInfo.hasVersionUrlParameter
			) {
				oReloadInfo.activeVersionNotSelected = !ReloadInfoAPI.hasVersionParameterWithValue({value: oReloadInfo.activeVersion}, oReloadInfo.URLParsingService);
			}

			oReloadInfo.hasHigherLayerChanges = ReloadInfoAPI.hasMaxLayerParameterWithValue({value: oReloadInfo.layer}, oReloadInfo.URLParsingService);
			oReloadInfo.initialDraftGotActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			if (oReloadInfo.initialDraftGotActivated) {
				oReloadInfo.isDraftAvailable = false;
			}
			oReloadInfo.allContexts = isAllContextsAvailable(oReloadInfo.selector);
			oReloadInfo.switchEndUserAdaptation = needAdaptationReloadOnExit(oReloadInfo.selector);
			if (oReloadInfo.changesNeedReload
				|| oReloadInfo.isDraftAvailable
				|| oReloadInfo.hasHigherLayerChanges
				|| oReloadInfo.initialDraftGotActivated
				|| oReloadInfo.activeVersionNotSelected
				|| oReloadInfo.allContexts
				|| oReloadInfo.switchEndUserAdaptation
			) {
				oReloadInfo.reloadMethod = oRELOAD.RELOAD_PAGE;
				// always try cross app navigation (via hash); we only need a hard reload because of appdescr changes (changesNeedReload = true)
				if (!oReloadInfo.changesNeedReload && Utils.getUshellContainer()) {
					oReloadInfo.reloadMethod = oRELOAD.VIA_HASH;
				}
			}
			FlexInfoSession.remove(oReloadInfo.selector);
			return oReloadInfo;
		}
	};
	return ReloadInfoAPI;
});