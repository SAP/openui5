/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core"
], function(oCore) {
	"use strict";

	var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

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