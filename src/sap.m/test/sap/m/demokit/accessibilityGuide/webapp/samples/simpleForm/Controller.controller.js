sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.simpleForm.Controller", {
		onInit: function () {

			var oViewModel = new JSONModel();
			this.getView().setModel(oViewModel, "appView");
		}
	});
});
