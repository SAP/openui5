sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageHeaderExpanded.ObjectPageHeaderExpanded", {
		onAfterRendering: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageHeaderExpanded/employee.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			var oSampleModel = new JSONModel({
				text: "working binding",
				icon: "sap-icon://chain-link"
			});

			this.getView().setModel(oSampleModel, "buttons");

			// set explored app's demo model on this sample
			var oModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageHeaderExpanded/products.json");
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		}
	});
}, true);
