/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib"
], function(Library) {
	"use strict";

	var oMDCBundle = Library.getResourceBundleFor("sap.ui.mdc");

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