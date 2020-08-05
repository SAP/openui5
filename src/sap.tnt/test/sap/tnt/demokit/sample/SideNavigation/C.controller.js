sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.SideNavigation.C", {

		onCollapseExpandPress: function () {
			var oSideNavigation = this.byId("sideNavigation");
			var bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

		onHideShowSubItemPress: function () {
			var oNavListItem = this.byId("subItem3");
			oNavListItem.setVisible(!oNavListItem.getVisible());
		}

	});
});