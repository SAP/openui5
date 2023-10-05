/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(oCore, Lib) {
	"use strict";

	var oMDCBundle = Lib.getResourceBundleFor("sap.ui.mdc");
	//var oMBundle = oCore.getLibraryResourceBundle("sap.m");

	var Util = {

		texts: {
			go: oMDCBundle.getText("filterbar.GO")
		},

		icons: {
			decline: "sap-icon://decline",
			valueHelp: "sap-icon://value-help"
		}

	};

	return Util;
});
