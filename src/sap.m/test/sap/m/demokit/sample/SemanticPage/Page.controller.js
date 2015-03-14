sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.SemanticPage.Page", {

		onInit: function () {
			//set explored app's demo model on this sample
			var sPath = jQuery.sap.getModulePath("sap.m.sample.SemanticPage", "/sort.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		}

	});


	return PageController;

});
