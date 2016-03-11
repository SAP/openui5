sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";
	var sCurrentBreakpoint;
	var DynamicSideContentBtn = Controller.extend("sap.uxap.sample.ObjectPageDynamicSideContentBtn.ObjectPageDynamicSideContentBtn", {
		
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageDynamicSideContentBtn/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
			
		},
		onAfterRendering: function() {
			sCurrentBreakpoint=this.getView().byId("DynamicSideContent").getCurrentBreakpoint();
		},
		handleSideContentHide: function () {
			if (sCurrentBreakpoint === "S") {
				this.getView().byId("DynamicSideContent").toggle();
			} else {
				this.getView().byId("DynamicSideContent").setShowSideContent(false);
			}
			this.getView().byId("headerForTest").setShowSideContentButton(true);
		},
		handleSCBtnPress: function (oEvent) {
			if (sCurrentBreakpoint === "S") {
				this.getView().byId("DynamicSideContent").toggle();
			} else {
				this.getView().byId("DynamicSideContent").setShowSideContent(true);
			}
			this.getView().byId("headerForTest").setShowSideContentButton(false);
		},
		updateToggleButtonState: function (oEvent) {
			sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S" && !this.getView().byId("DynamicSideContent").getShowSideContent()) {
				this.getView().byId("headerForTest").setShowSideContentButton(true);
			} else {
				this.getView().byId("headerForTest").setShowSideContentButton(false);
			}

		},
	});

	return DynamicSideContentBtn;
});
