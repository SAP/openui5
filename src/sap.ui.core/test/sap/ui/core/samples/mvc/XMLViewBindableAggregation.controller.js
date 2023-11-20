sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.sample.mvc.XMLViewBindableAggregation", {
		onInit: function () {
			var oModel = new JSONModel({
				supplier: [{
					name: "name1"
				}, {
					name: "name2"
				}, {
					name: "name3"
				}]
			});
			this.getView().setModel(oModel);
		},
		afterRendering: function() {
			MessageToast.show("Event fired: 'afterRendering'");
		},
		openDialog: function() {
			this.getView().byId("dialog").open();
		},
		closeDialog: function() {
			this.getView().byId("dialog").close();
		}
	});
});
