/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
], function(oCore, Lib) {
	"use strict";

	var oMDCBundle = Lib.getResourceBundleFor("sap.ui.mdc");

	var Util = {

		texts: {
			ok: oMDCBundle.getText("valuehelp.OK"),
			cancel: oMDCBundle.getText("valuehelp.CANCEL"),
			defineConditions: oMDCBundle.getText("valuehelp.DEFINECONDITIONSNONUMBER"),
			add: oMDCBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION")
		},

		icons: {
			decline: "sap-icon://decline"
		}


	};

	return Util;
});