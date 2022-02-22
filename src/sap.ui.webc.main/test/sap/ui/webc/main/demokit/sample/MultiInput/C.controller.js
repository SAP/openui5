sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.MultiInput.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event change fired.");
			demoToast.show();
		},
		handleInput: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event input fired.");
			demoToast.show();
		},
		handleSuggestionItemPreview: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event suggestionItemPreview fired.");
			demoToast.show();
		},
		handleSuggestionItemSelect: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event suggestionItemSelect fired.");
			demoToast.show();
		},
		handleTokenDelete: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event tokenDelete fired.");
			demoToast.show();
		},
		handleValueHelpTrigger: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event valueHelpTrigger fired.");
			demoToast.show();
		}
	});
});