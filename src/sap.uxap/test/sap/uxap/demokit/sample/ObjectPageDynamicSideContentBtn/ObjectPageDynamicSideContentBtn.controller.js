sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	var DynamicSideContentBtn = Controller.extend("sap.uxap.sample.ObjectPageDynamicSideContentBtn.ObjectPageDynamicSideContentBtn", {

		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageDynamicSideContentBtn/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		handleSideContentHide: function () {
			if (jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				this.getView().byId("DynamicSideContent").toggle();
			} else {
				this.getView().byId("DynamicSideContent").setShowSideContent(false);
				this.getView().byId("headerForTest").setShowSideContentButton(true);
			}
		},
		handleSCBtnPress: function (oEvent) {
			if (jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				this.getView().byId("DynamicSideContent").toggle();
			} else {
				this.getView().byId("DynamicSideContent").setShowSideContent(true);
				this.getView().byId("headerForTest").setShowSideContentButton(false);
			}
		}
	});

	return DynamicSideContentBtn;
});
