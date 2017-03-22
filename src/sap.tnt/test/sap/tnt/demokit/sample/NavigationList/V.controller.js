sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/Popover',
		'sap/m/Button'
	], function(jQuery, Controller, Popover, Button) {
	"use strict";

	var Controller = Controller.extend("sap.tnt.sample.NavigationList.V", {

		onInit: function () {

		},

		onCollapseExapandPress: function (event) {
			var navigationList = this.getView().byId('navigationList');
			var expanded = !navigationList.getExpanded();

			navigationList.setExpanded(expanded);
		}
	});


	return Controller;

});
