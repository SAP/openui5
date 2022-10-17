/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/base/Object"
], function(
	Opa5,
	BaseObject
) {
	"use strict";

	var Utils = BaseObject.extend("sap.ui.mdc.qunit.opa.test.Util", {});

	Utils.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		var oCore = Opa5.getWindow().sap.ui.getCore();
		return oCore.getLibraryResourceBundle(sLibraryName).getText(sTextKey);
	};

	Utils.enhanceWaitFor = function (vIdent, oConfig) {
        var bStringIdent = typeof vIdent === "string";
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
