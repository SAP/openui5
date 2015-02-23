sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (Controller, MessageToast, JSONModel, ResourceModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.App", {

		onInit : function () {

			// set data model on view
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oDataModel = new JSONModel(oData);
			this.getView().setModel(oDataModel);

			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "sap.ui.demo.wt.i18n.messageBundle"
			});
			this.getView().setModel(i18nModel, "i18n");
		},

		onShowHello : function () {

			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sMsg = oBundle.getText("helloMsg");

			// show message
			MessageToast.show(sMsg);
		}
	});

}, /* bExport= */ true);
