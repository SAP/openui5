sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.tnt.sample.NavigationList.NavigationList", {

		// create JSON model instance
		onInit: function () {

		}
	});


	return CController;

});
