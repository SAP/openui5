sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.NavigationList.C", {

		onCollapseExpandPress: function () {
			var oNavigationList = this.byId("navigationList");
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

		onHideShowSubItemPress: function () {
			var oNavListItem = this.byId("subItemThree");
			oNavListItem.setVisible(!oNavListItem.getVisible());
		}

	});
});