sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.AlternativeProfileObjectPageHeader.AlternativeProfileObjectPageHeader", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/AlternativeProfileObjectPageHeader/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		handlePress: function (oEvent) {
			var oObjectHeaderCont = this.getView().byId("ObjectPageLayout");
			oObjectHeaderCont.setShowHeaderContent(!oObjectHeaderCont.getShowHeaderContent());
		}
	});
}, true);
