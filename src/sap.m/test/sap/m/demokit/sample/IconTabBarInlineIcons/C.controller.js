sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/IconTabFilter",
	"sap/m/Text"
], function (Controller, IconTabFilter, Text) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarInlineIcons.C", {

		onInit: function () {
			var oIconTabBar = this.byId("idIconTabBar");

			for (var i = 1; i <= 12; i++) {
				oIconTabBar.addItem(new IconTabFilter({
					text: 'Tab ' + i,
					key: i,
					content: new Text({
						text: 'Content ' + i
					})
				}));
			}

			oIconTabBar.setHeaderMode("Inline");
			var aItems = oIconTabBar.getItems();
			var aIcons = ["sap-icon://history", "sap-icon://home", "sap-icon://employee"];
			var randomize = function (array) {
				return Math.floor(Math.random() * array.length);
			};

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].setIcon(aIcons[randomize(aIcons)]);
			}
		}

	});
});