/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core"
], function(oCore) {
	"use strict";

	var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");
	var oMBundle = oCore.getLibraryResourceBundle("sap.m");

	var Util = {

		texts: {
			resetwarning: oMBundle.getText("MSGBOX_TITLE_WARNING"),
			ok: oMDCBundle.getText("p13nDialog.OK"),
			cancel: oMDCBundle.getText("p13nDialog.CANCEL"),
			reset: oMDCBundle.getText("p13nDialog.RESET"),
			none: oMDCBundle.getText("sort.PERSONALIZATION_DIALOG_OPTION_NONE"),
			chart: oMDCBundle.getText("p13nDialog.TAB_Chart"),
			column: oMDCBundle.getText("p13nDialog.TAB_Column"),
			filter: oMDCBundle.getText("p13nDialog.TAB_Filter"),
			group: oMDCBundle.getText("p13nDialog.TAB_Group"),
			sort: oMDCBundle.getText("p13nDialog.TAB_Sort")
		},

		icons: {
			descending: "sap-icon://sort-descending",
			ascending: "sap-icon://sort-ascending",
			decline: "sap-icon://decline",
			settings: "sap-icon://action-settings",
			movetotop: "sap-icon://collapse-group",
			movetobottom: "sap-icon://expand-group",
			movedown: "sap-icon://navigation-down-arrow",
			moveup: "sap-icon://navigation-up-arrow",
			group: "sap-icon://group-2"
		}

	};

	return Util;
});
