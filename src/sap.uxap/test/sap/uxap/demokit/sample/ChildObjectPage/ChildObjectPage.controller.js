sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (JSON, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ChildObjectPage.ChildObjectPage", {
		onAfterRendering: function () {
			var oJsonModel = new JSON("./test-resources/sap/uxap/demokit/sample/ChildObjectPage/employee.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			var oSampleModel = new JSON({
				text: "working binding",
				icon: "sap-icon://chain-link"
			});

			this.getView().setModel(oSampleModel, "buttons");

			// set explored app's demo model on this sample
			var oModel = new JSON("./test-resources/sap/uxap/demokit/sample/ChildObjectPage/products.json");
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		},
		onFormat: function () {
			return "formatted link";
		},
		handleLink2Press: function (oEvent) {
			var msg = 'Page 2 long link clicked',
				msgToast = MessageToast;
			msgToast.show(msg);
		}
	});
}, true);

