sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/IconTabFilter",
	"sap/m/Text"
], function (Controller, IconTabFilter, Text) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarDragDrop.IconTabBarDragDrop", {

		onInit: function () {
			var oIconTabBar = this.byId("idIconTabBar");

			for (var i = 1; i <= 30; i++) {
				oIconTabBar.addItem(new IconTabFilter({
					key: i,
					text : 'Tab ' + i,
					content: new Text({
						text: 'Content ' + i
					})
				}));
			}
		},

		onTabNestingChange: function (oEvent) {
			var oIconTabBar = this.byId("idIconTabBar");
			oIconTabBar.setTabNestingViaInteraction(oEvent.getParameter("state"));
		}

	});
});
