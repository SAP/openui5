sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/m/MessageToast"
], function (Controller, library, MessageToast) {
	"use strict";

	return Controller.extend("sap.tnt.sample.SideNavigationUnselectableParents.C", {

		onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

		onItemSelect(oEvent) {
			const oItem = oEvent.getParameter("item"),
				sText = oItem.getText();
			MessageToast.show(`Item selected: ${sText}`);
		}

	});
});