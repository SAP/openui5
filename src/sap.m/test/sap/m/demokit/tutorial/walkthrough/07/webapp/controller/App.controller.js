sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.walkthrough.controller.App", {

		onInit : function () {

			// set data model on view
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		},

		onShowHello : function () {
			MessageToast.show("Hello World");
		}
	});

});