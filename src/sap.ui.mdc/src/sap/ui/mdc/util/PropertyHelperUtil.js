/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/VersionInfo",
	"sap/ui/base/Object"
], (
	Library,
	VersionInfo,
	BaseObject
) => {
	"use strict";

	/**
	 * Provides validation functions for checking the (required) usage of the PropertyHelper.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.util.PropertyHelperUtil
	 * @namespace
	 * @since 1.132.0
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	// const PropertyHelperUtil = BaseObject.extend("sap.ui.mdc.util.PropertyHelperUtil", {
	// 	constructor: function() {
	// 		this.bValidationException = null;
	// 	}
	// });

	const PropertyHelperUtil = {};

    PropertyHelperUtil.checkValidationExceptions = async function () {
		if (this.bValidationException === null || this.bValidationException === undefined){
			this.bValidationException = await this._checkValidationExceptions();
		}

		return Promise.resolve(this.bValidationException);
	};

    PropertyHelperUtil._checkValidationExceptions = async function () {
		const affectedLibaries = ["sap.fe.core", "sap.fe.macros", "sap.sac.df"];
		const aLoadedLibraries = affectedLibaries.filter((sLibrary) => Library.isLoaded(sLibrary));

		const oVersionInfo = await VersionInfo.load();
		const bDisabledViaConfig = window['sap-ui-mdc-config'] && window['sap-ui-mdc-config'].disableStrictPropertyInfoValidation;
		const bDisabledViaURLParam = new URLSearchParams(window.location.search).get("sap-ui-xx-disableStrictPropertyValidation") == "true";
		const bExceptionForFE = aLoadedLibraries.includes("sap.fe.core") || aLoadedLibraries.includes("sap.fe.macros");
		const bDisabledForDF = aLoadedLibraries.includes("sap.sac.df");
		const bExplicitlyEnabled = (new URLSearchParams(window.location.search).get("sap-ui-xx-enableStrictPropertyValidation") == "true");
		const bUI5Version2 = oVersionInfo.version.indexOf("2.") === 0;

		// Disable strict validation if
		// 1. it is disabled explicitly via config
		// 2. it is disabled via url param
		// 3. a library with an exception is loaded in the app (FE)
		// 4. a library with an exception is loaded in the app (DF)
		// 5. it has not explicitly been enabled via url param
		// 6. UI5 version < 2.0
		return bDisabledViaConfig || bDisabledViaURLParam || bExceptionForFE || bDisabledForDF && !bExplicitlyEnabled && !bUI5Version2;
	};

    return PropertyHelperUtil;
});