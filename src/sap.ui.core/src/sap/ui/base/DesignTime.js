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
	 * Provides DesignTime related config options
	 *
	 * @alias module:sap/ui/base/DesignTime
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core.Core, sap.watt, com.sap.webide, sap.ui.fl, sap.ui.rta, sap.ui.comp, SAP Business Application Studio
	 * @since 1.120.0
	 */
	const DesignTime = {
		/**
		 * Return whether the design mode is active or not.
		 *
		 * @returns {boolean} whether the design mode is active or not.
		 * @private
		 * @ui5-restricted sap.ui.core.Core, sap.watt, com.sap.webide, sap.ui.fl, sap.ui.rta, sap.ui.comp, SAP Business Application Studio
		 * @since 1.120.0
		 */
		isDesignModeEnabled() {
			return BaseConfig.get({
				name: "sapUiXxDesignMode",
				type: BaseConfig.Type.Boolean,
				external: true,
				freeze: true
			});
		},
		/**
		 * Return whether the activation of the controller code is suppressed.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 * @since 1.120.0
		 */
		isControllerCodeDeactivationSuppressed() {
			return BaseConfig.get({
				name: "sapUiXxSuppressDeactivationOfControllerCode",
				type: BaseConfig.Type.Boolean,
				external: true,
				freeze: true
			});
		},
		/**
		 * Return whether the controller code is deactivated. During design mode the.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 * @since 1.120.0
		 */
		isControllerCodeDeactivated() {
			return DesignTime.isDesignModeEnabled() && !DesignTime.isControllerCodeDeactivationSuppressed();
		}
	};

	return DesignTime;
});