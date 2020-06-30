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

	var Util = BaseObject.extend("sap.ui.mdc.qunit.opa.test.Util", {});

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		var oCore = Opa5.getWindow().sap.ui.getCore();
		return oCore.getLibraryResourceBundle(sLibraryName).getText(sTextKey);
	};

	return Util;
});
