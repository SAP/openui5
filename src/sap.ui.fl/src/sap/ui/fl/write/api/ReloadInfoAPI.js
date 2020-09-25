/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/base/util/UriParameters"
], function(
	LayerUtils,
	Layer,
	Utils,
	VersionsAPI,
	FeaturesAPI,
	PersistenceWriteAPI
) {
	"use strict";

	function isDraftAvailable(oReloadInfo) {
		return FeaturesAPI.isVersioningEnabled(oReloadInfo.layer).then(function(bVersioningAvailable) {
			return bVersioningAvailable && VersionsAPI.isDraftAvailable({
				selector: oReloadInfo.selector,
				layer: oReloadInfo.layer
			});
		});
	}

	function areHigherLayerChangesAvailable(oReloadInfo) {
		var bUserLayer = oReloadInfo.layer === Layer.USER;
		if (bUserLayer) {
			return Promise.resolve(false);
		}

		return PersistenceWriteAPI.hasHigherLayerChanges({
			selector: oReloadInfo.selector,
			ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
			upToLayer: oReloadInfo.layer
		});
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
		 * Checks if personalization or drafts changes exist for controls.
		 *
		 * @param  {object} oReloadInfo - Contains the information needed to find a reason to reload
		 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param  {sap.ui.core.Control} oReloadInfo.selector - Root control instance
		 * @param  {boolean} [oReloadInfo.ignoreMaxLayerParameter] - Indicates that personalization is to be checked without max layer filtering
		 * @param  {object} oReloadInfo.parsedHash - The parsed URL hash
		 *
		 * @returns {Promise<object>} Promise resolving to an object with the reload reasons
		 */
		getReloadReasonsForStart: function(oReloadInfo) {
			var bUrlHasMaxLayerParameter = ReloadInfoAPI.hasMaxLayerParameterWithValue({value: oReloadInfo.layer});
			var bUrlHasVersionParameter = !!Utils.getParameter(sap.ui.fl.Versions.UrlParameter);

			return Promise.all([
				(!bUrlHasMaxLayerParameter) ?
					areHigherLayerChangesAvailable(oReloadInfo) : false,
				(!bUrlHasVersionParameter) ?
					isDraftAvailable(oReloadInfo) : false
			]).then(function(aReasons) {
				oReloadInfo.hasHigherLayerChanges = aReasons[0];
				oReloadInfo.hasDraftChanges = aReasons[1];
				return oReloadInfo;
			});
		},

		/**
		 * Checks if the the <code>sap-ui-fl-version</code> parameter name with the given value is contained in the URL.
		 *
		 * @param  {object} oParameter - Object containing the parameter value to be checked
		 * @param  {string} oParameter.value - The parameter value to be checked
		 *
		 * @returns {boolean} True if the parameter with the given value is in the URL
		 */
		hasVersionParameterWithValue: function(oParameter) {
			return Utils.hasParameterAndValue(sap.ui.fl.Versions.UrlParameter, oParameter.value);
		},

		/**
		 * Checks if the the <code>sap-ui-fl-max-layer</code> parameter name with the given value is contained in the URL.
		 *
		 * @param  {object} oParameter - Object containing the parameter value to be checked
		 * @param  {string} oParameter.value - The parameter value to be checked
		 *
		 * @returns {boolean} <code>true</code> if the parameter with the given value is in the URL
		 */
		hasMaxLayerParameterWithValue: function(oParameter) {
			var sParameterName = LayerUtils.FL_MAX_LAYER_PARAM;
			return Utils.hasParameterAndValue(sParameterName, oParameter.value);
		},

		/**
		 * Standalone: Adds the <code>sap-ui-fl-version</code> parameter to the URL or removes it.
		 *
		 * @param  {object} oReloadInfo - Contains the information needed to add the correct URL parameters
		 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param  {boolean} oReloadInfo.hasDraftChanges - Indicates if a draft is available
		 * @param  {string} oReloadInfo.parameters - The URL parameters to be modified
		 * @param  {string} oReloadInfo.versionSwitch - Indicates if we are in a version switch scenario
		 * @param  {string} oReloadInfo.version - Version we want to switch to
		 *
		 * @returns {string} The modified URL
		 */
		handleUrlParametersForStandalone: function(oReloadInfo) {
			if (oReloadInfo.hasHigherLayerChanges) {
				oReloadInfo.parameters = Utils.handleUrlParameters(oReloadInfo.parameters, LayerUtils.FL_MAX_LAYER_PARAM, oReloadInfo.layer);
			}

			// removes any version number set (original, draft, inactive and active versions)
			var oVersionRegExp = new RegExp("\&*" + sap.ui.fl.Versions.UrlParameter + "=-?\\d*\&?", "g");
			oReloadInfo.parameters = oReloadInfo.parameters.replace(oVersionRegExp, "");

			// startup reload due to draft
			if (oReloadInfo.hasDraftChanges) {
				oReloadInfo.parameters = Utils.handleUrlParameters(oReloadInfo.parameters, sap.ui.fl.Versions.UrlParameter, sap.ui.fl.Versions.Draft);
			}

			if (oReloadInfo.versionSwitch) {
				oReloadInfo.parameters = Utils.handleUrlParameters(oReloadInfo.parameters, sap.ui.fl.Versions.UrlParameter, oReloadInfo.version);
			}

			// clean up if the last parameter was removed
			if (oReloadInfo.parameters === "?") {
				oReloadInfo.parameters = "";
			}

			return oReloadInfo.parameters;
		},

		/**
		 * Adds parameters to the parsed hash to skip personalization changes and/or apply draft changes.
		 *
		 * @param  {object}  oReloadInfo - Contains the information needed to add the correct URL parameters
		 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param  {boolean} oReloadInfo.hasDraftChanges - Indicates if a draft is available
		 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param  {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 *
		 * @returns {object} oParsedHash Adjusted parsed hash
		 */
		handleParametersOnStart: function(oReloadInfo) {
			var mParsedHash = Utils.getParsedURLHash();
			mParsedHash.params = mParsedHash.params || {};

			if (oReloadInfo.hasHigherLayerChanges) {
				mParsedHash.params[LayerUtils.FL_MAX_LAYER_PARAM] = [oReloadInfo.layer];
			}
			if (oReloadInfo.hasDraftChanges) {
				mParsedHash.params[sap.ui.fl.Versions.UrlParameter] = [sap.ui.fl.Versions.Draft];
			}
			return mParsedHash;
		},

		/**
		 * Checks if an initially available draft got activated during the current UI adaptation session.
		 *
		 * @param  {object}  oReloadInfo - Contains the information needed to check if the initial draft got activated
		 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param  {sap.ui.fl.Selector} oReloadInfo.selector - Root control instance
		 * @param  {boolean} oReloadInfo.versioningEnabled - Indicates if versioning is enabled by the backend
		 *
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 */
		initialDraftGotActivated: function(oReloadInfo) {
			if (oReloadInfo.versioningEnabled) {
				var bUrlHasVersionParameter = this.hasVersionParameterWithValue({value: sap.ui.fl.Versions.Draft.toString()});
				return !VersionsAPI.isDraftAvailable(oReloadInfo) && bUrlHasVersionParameter;
			}
			return false;
		},

		/**
		 * Determines if a reload on exit is needed and if yes - it returns what kind of reload should happen (CrossAppNavigation or hard reload).
		 *
		 * @param  {object} oReloadInfo - Contains the information needed to check if a reload on exit should happen
		 * @param  {sap.ui.fl.Layer} oReloadInfo.layer - Current layer
		 * @param  {boolean} oReloadInfo.hasDraftChanges - Indicates if a draft is available
		 * @param  {boolean} oReloadInfo.hasDirtyDraftChanges - Indicates if dirty draft changes are available
		 * @param  {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
		 * @param  {boolean} oReloadInfo.changesNeedReload - Indicates if changes (e.g. app descriptor changes) need hard reload
		 * @param  {boolean} oReloadInfo.initialDraftGotActivated - Indicates if a draft got activated and had a draft initially when entering UI adaptation
		 * @param  {boolean} oReloadInfo.activeVersion - Indicates the current active version
		 *
		 * @returns {boolean} <code>true</code> if a draft got activated and had a draft initially when entering UI adaptation
		 */
		getReloadMethod: function(oReloadInfo) {
			var oRELOAD = {
				NOT_NEEDED : "NO_RELOAD",
				RELOAD_PAGE : "HARD_RELOAD",
				VIA_HASH : "CROSS_APP_NAVIGATION"
			};
			oReloadInfo.reloadMethod = oRELOAD.NOT_NEEDED;

			// TODO fix app descriptor handling and reload behavior
			// TODO move changesNeedReload near flexState; set flag when saving change that needs a reload
			oReloadInfo.hasDraft = oReloadInfo.hasDirtyDraftChanges || ReloadInfoAPI.hasVersionParameterWithValue({value: sap.ui.fl.Versions.Draft.toString()});
			if (oReloadInfo.activeVersion > sap.ui.fl.Versions.Original) {
				oReloadInfo.activeVersionNotSelected = oReloadInfo.activeVersion && !ReloadInfoAPI.hasVersionParameterWithValue({value: oReloadInfo.activeVersion.toString()});
			}
			oReloadInfo.hasHigherLayerChanges = ReloadInfoAPI.hasMaxLayerParameterWithValue({value: oReloadInfo.layer});
			oReloadInfo.initialDraftGotActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			if (oReloadInfo.changesNeedReload
				|| oReloadInfo.hasDraft
				|| oReloadInfo.hasHigherLayerChanges
				|| oReloadInfo.initialDraftGotActivated
				|| oReloadInfo.activeVersionNotSelected
			) {
				oReloadInfo.reloadMethod = oRELOAD.RELOAD_PAGE;
				// always try cross app navigation (via hash); we only need a hard reload because of appdescr changes (changesNeedReload = true)
				if (!oReloadInfo.changesNeedReload && Utils.getUshellContainer()) {
					oReloadInfo.reloadMethod = oRELOAD.VIA_HASH;
				}
			}
			return oReloadInfo;
		}
	};
	return ReloadInfoAPI;
});