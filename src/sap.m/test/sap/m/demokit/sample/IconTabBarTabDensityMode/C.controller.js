sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/IconTabFilter",
	"sap/m/Text"
], function (Controller, IconTabFilter, Text) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarTabDensityMode.C", {

		onInit: function () {
			var oIconTabBar = this.byId("idIconTabBar0");
			for (var i = 1; i <= 30; i++) {
				oIconTabBar.addItem(new IconTabFilter({
					text: 'Tab ' + i,
					key: i,
					content: new Text({
						text: 'Content ' + i
					})
				}));
			}

			var idIconTabBarInlineIcons = this.byId("iconTabBarInlineIcons");

			for (var i = 1; i <= 12; i++) {
				idIconTabBarInlineIcons.addItem(new IconTabFilter({
					text: 'Tab ' + i,
					key: i,
					content: new Text({
						text: 'IconTabBar inline header mode with icons Content ' + i
					})
				}));
			}

			idIconTabBarInlineIcons.setHeaderMode("Inline");
			var aItems = idIconTabBarInlineIcons.getItems();
			var aIcons = ["sap-icon://history", "sap-icon://home", "sap-icon://employee"];
			var randomize = function (array) {
				return Math.floor(Math.random() * array.length);
			};

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].setIcon(aIcons[randomize(aIcons)]);
			}
		},

		onTabDensityModeSelect: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			for (var i = 0; i < 8; i++) {
				this.byId("idIconTabBar" + i).setTabDensityMode(sSelectedValue);
			}
		}

	});
});