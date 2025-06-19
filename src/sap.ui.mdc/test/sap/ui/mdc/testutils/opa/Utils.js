/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/base/Object",
	"sap/ui/core/Lib"
], function(
	Opa5,
	BaseObject,
	Library
) {
	"use strict";

	var Utils = BaseObject.extend("sap.ui.mdc.qunit.opa.test.Util", {});

	Utils.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		return Library.getResourceBundleFor(sLibraryName).getText(sTextKey);
	};

	Utils.enhanceWaitFor = function (vIdent, oConfig) {
        const bStringIdent = typeof vIdent === "string";

		if (vIdent.matchers) {
			oConfig = Object.assign({matchers: vIdent.matchers}, oConfig);
			vIdent = Object.assign({}, vIdent);
			delete vIdent.matchers;
		}

		return Object.assign({}, oConfig, bStringIdent ? {properties: {id: vIdent}} : {properties: vIdent});
    };


	Utils.removeUndefinedValues = function(oObject) {
		var oReturnObject = {};

		Object.entries(oObject).forEach(function(aEntry) {
			var vKey = aEntry[0];
			var vValue = aEntry[1];
			if (aEntry[1] !== undefined) {
				oReturnObject[vKey] = vValue;
			}
		});

		return oReturnObject;
	};

	return Utils;
});
