sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.StandardMarginsSingleSided.Page", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		}
	});


	return PageController;

});
