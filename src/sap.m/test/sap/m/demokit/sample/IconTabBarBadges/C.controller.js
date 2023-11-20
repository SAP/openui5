sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/IconTabFilter",
	"sap/m/Text",
	"sap/m/BadgeCustomData"
], function (Controller, IconTabFilter, Text, BadgeCustomData) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarBadges.C", {

		onInit: function () {
			var oIconTabBar = this.byId("iconTabBar0");
			for (var i = 1; i <= 30; i++) {
				oIconTabBar.addItem(new IconTabFilter({
					text: 'Tab ' + i,
					key: i,
					content: new Text({
						text: 'Content ' + i
					}),
					customData: new BadgeCustomData({visible: i === 19})
				}));
			}
		},

		onTabDensityModeSelect: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			for (var i = 0; i < 9; i++) {
				this.byId("iconTabBar" + i).setTabDensityMode(sSelectedValue);
			}
		}

	});
});