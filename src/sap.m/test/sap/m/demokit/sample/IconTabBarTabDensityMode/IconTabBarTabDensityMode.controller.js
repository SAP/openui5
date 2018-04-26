sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/IconTabFilter',
		'sap/m/Text'
	], function(jQuery, Controller, IconTabFilter, Text) {
	"use strict";

	var IconTabBarController = Controller.extend("sap.m.sample.IconTabBarTabDensityMode.IconTabBarTabDensityMode", {

		onInit: function () {

			var oIconTabFilter,
				oIconTabBar = this.byId("idIconTabBar0");

			for (var i = 1; i <= 30; i++) {
				oIconTabFilter = new IconTabFilter({
					text : 'Tab ' + i,
					content: new Text({
						text: 'Content ' + i
					})
				});

				oIconTabBar.addItem(oIconTabFilter);
			}
		},
		onTabDensityModeSelect: function (oEvent) {
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText(),
				oIconTabBar;
			for (var i = 0; i < 8; i++) {
				oIconTabBar = this.byId("idIconTabBar" + i);
				oIconTabBar.setTabDensityMode(sSelectedValue);
			}
		}
	});


	return IconTabBarController;

});
