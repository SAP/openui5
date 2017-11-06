sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";
	var sCurrentBreakpoint, oDynamicSideView, oOPSideContentBtn;
	var DynamicSideContentBtn = Controller.extend("sap.uxap.sample.ObjectPageDynamicSideContentBtn.ObjectPageDynamicSideContentBtn", {

		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageDynamicSideContentBtn/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
			oDynamicSideView = this.byId("DynamicSideContent");
			oOPSideContentBtn = this.byId("headerForTest").getSideContentButton();
		},
		onAfterRendering: function() {
			sCurrentBreakpoint = oDynamicSideView.getCurrentBreakpoint();
		},
		handleSideContentHide: function () {
			if (sCurrentBreakpoint === "S") {
				oDynamicSideView.toggle();
			} else {
				oDynamicSideView.setShowSideContent(false);
			}
			oOPSideContentBtn.setVisible(true);
		},
		handleSCBtnPress: function (oEvent) {
			if (sCurrentBreakpoint === "S") {
				oDynamicSideView.toggle();
			} else {
				oDynamicSideView.setShowSideContent(true);
			}
			oOPSideContentBtn.setVisible(false);
		},
		updateToggleButtonState: function (oEvent) {
			sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S" || !oDynamicSideView.getShowSideContent()) {
				oOPSideContentBtn.setVisible(true);
			} else {
				oOPSideContentBtn.setVisible(false);
			}
		}
	});

	return DynamicSideContentBtn;
});
