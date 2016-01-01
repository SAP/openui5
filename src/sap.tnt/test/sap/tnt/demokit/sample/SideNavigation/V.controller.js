sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/Popover',
		'sap/m/Button'
	], function(jQuery, Controller, Popover, Button) {
	"use strict";

	var Controller = Controller.extend("sap.tnt.sample.SideNavigation.V", {

		onInit: function () {

		},

		onCollapseExapandPress: function (event) {
			var sideNavigation = this.getView().byId('sideNavigation');
			var expanded = !sideNavigation.getExpanded();

			sideNavigation.setExpanded(expanded);
		}
	});


	return Controller;

});
