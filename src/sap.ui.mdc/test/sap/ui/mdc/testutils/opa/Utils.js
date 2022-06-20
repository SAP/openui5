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

	return Utils;
});
