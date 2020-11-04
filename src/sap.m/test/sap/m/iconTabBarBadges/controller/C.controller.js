sap.ui.define([
	"sap/m/BadgeCustomData",
	"sap/ui/core/mvc/Controller"
], function (BadgeCustomData, Controller) {
	"use strict";

	return Controller.extend("sap.m.iconTabBarBadges.controller.C", {
		onToggleCompact: function () {
			jQuery(document.body).toggleClass("sapUiSizeCompact");
		},
		addToVisible: function() {
			var oFilter = this.getView().byId("item3");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToSubItem: function() {
			var oFilter = this.getView().byId("item211");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToSplitModeTabRootItem: function() {
			var oFilter = this.getView().byId("item4");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToSplitModeTabSubItem: function() {
			var oFilter = this.getView().byId("item402");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToMoreItem: function() {
			var oFilter = this.getView().byId("item16");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToMoreSubItem: function() {
			var oFilter = this.getView().byId("item1711");
			oFilter.addCustomData(new BadgeCustomData());
		},
		addToIconItem: function() {
			var oFilter = this.getView().byId("iconTab");
			oFilter.addCustomData(new BadgeCustomData());
		}
	});
});
