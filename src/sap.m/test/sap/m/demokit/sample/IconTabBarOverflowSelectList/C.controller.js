sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/IconTabFilter",
	"sap/m/Text"
], function (Controller, IconTabFilter, Text) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarOverflowSelectList.C", {

		onInit: function () {
			var oIconTabBar = this.byId("idIconTabBar");

			for (var i = 1; i <= 30; i++) {
				oIconTabBar.addItem(new IconTabFilter({
					text: 'Tab ' + i,
					key: i,
					content: new Text({
						text: 'Content ' + i
					})
				}));
			}
		}

	});
});