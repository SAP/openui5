sap.ui.define(['sap/m/Token','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Token, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.MultiInputDatabinding.Page", {

		onInit: function () {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		}
		    
	});
	
	return PageController;
});