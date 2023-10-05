/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config"
], (
	BaseConfig
) => {
	"use strict";

	/**
	 * Provides supportability related API
	 *
	 * @alias module:sap/ui/core/Supportability
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.120.0
	 */
	const Supportability = {
		/**
		 * Returns whether the page runs in full debug mode.
		 * @returns {boolean} Whether the page runs in full debug mode
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.120.0
		 */
		isDebugModeEnabled() {
			// Configuration only maintains a flag for the full debug mode.
			// ui5loader-autoconfig calculates detailed information also for the partial debug
			// mode and writes it to window["sap-ui-debug"].
			// Only a value of true must be reflected by this getter
			let bDebug = window["sap-ui-debug"] === true ||
				BaseConfig.get({
					name: "sapUiDebug",
					type: BaseConfig.Type.Boolean,
					external: true
				});

			try {
				bDebug = bDebug || /^(?:true|x|X)$/.test(window.localStorage.getItem("sap-ui-debug"));
			} catch (e) {
				// access to local storage might fail due to security / privacy settings
			}
			return bDebug;
		},

		/**
		 * Returns whether the UI5 control inspector is displayed.
		 * Has only an effect when the sap-ui-debug module has been loaded
		 * @return {boolean} whether the UI5 control inspector is displayed
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.120.0
		 */
		isControlInspectorEnabled() {
			return BaseConfig.get({
				name: "sapUiInspect",
				type: BaseConfig.Type.Boolean,
				external: true
			});
		},

		/**
		 * Flag if statistics are requested.
		 *
		 * Flag set by TechnicalInfo Popup will also be checked.
		 * So its active if set by URL parameter or manually via TechnicalInfo.
		 *
		 * @returns {boolean} Whether statistics are enabled
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.120.0
		 */
		isStatisticsEnabled() {
			var result = BaseConfig.get({
				name: "sapUiStatistics",
				type: BaseConfig.Type.Boolean,
				defaultValue: BaseConfig.get({
					name: "sapStatistics",
					type: BaseConfig.Type.Boolean,
					external: true
				}),
				external: true
			});
			try {
				result = result || window.localStorage.getItem("sap-ui-statistics") == "X";
			} catch (e) {
				// access to local storage might fail due to security / privacy settings
			}
			return result;
		},

		/**
		 * Returns the support settings. In case there are no settings,
		 * the support is disabled.
		 *
		 * @return {string[]} The support settings.
		 * @experimental
		 * @since 1.120.0
		 */
		getSupportSettings() {
			return BaseConfig.get({
				name: "sapUiSupport",
				type: BaseConfig.Type.StringArray,
				defaultValue: null,
				external: true
			});
		},

		/**
		 * Returns the test recorder settings. In case there are no settings,
		 * the test recorder is disabled.
		 *
		 * @return {string[]} The test recorder settings.
		 * @experimental
		 * @since 1.120.0
		 */
		getTestRecorderSettings() {
			return BaseConfig.get({
				name: "sapUiTestRecorder",
				type: BaseConfig.Type.StringArray,
				defaultValue: null,
				external: true
			});
		},

		/**
		 * Returns whether the text origin information is collected.
		 * @return {boolean} whether the text info is collected
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.model
		 */
		collectOriginInfo() {
			return BaseConfig.get({
				name: "sapUiOriginInfo",
				type: BaseConfig.Type.Boolean,
				external: true
			});
		}
	};

	return Supportability;
});