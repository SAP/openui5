sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.DynamicSideContent.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleLayoutChange: function(oEvent) {
			var oToggle = this.getView().byId("ToggleButton"),
				oBreakpoint = this.getView().byId("Breakpoint"),
				sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");
			oToggle.setEnabled(sCurrentBreakpoint === "S");
			oBreakpoint.setText("Breakpoint: " + sCurrentBreakpoint);
		},
		handleClick: function() {
			var oDSC = this.getView().byId("DynamicSideContent");
			oDSC.toggleContents();
		},
		handleSliderChange: function(oEvent) {
			var oSlider = this.getView().byId("WidthSlider"),
				oDSCWrapper = this.getView().byId("DSCWrapper");
			oDSCWrapper.setWidth(oSlider.getValue() + "%");
		}
	});
});