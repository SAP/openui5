sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/IconTabFilter',
		'sap/m/Text'
	], function(Controller, IconTabFilter, Text) {
	"use strict";

	var IconTabBarController = Controller.extend("sap.m.sample.IconTabBarDragDrop.IconTabBarDragDrop", {

		onInit: function () {

			var oIconTabFilter,
				oIconTabBar = this.byId("idIconTabBar");

			for (var i = 1; i <= 30; i++) {
				oIconTabFilter = new IconTabFilter({
					text : 'Tab ' + i,
					content: new Text({
						text: 'Content ' + i
					})
				});

				oIconTabBar.addItem(oIconTabFilter);
			}
		}
	});


	return IconTabBarController;

});
