sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/sample/GridResponsiveColumnLayout/RevealGrid/RevealGrid",
	"sap/ui/model/json/JSONModel"
], function (Controller, RevealGrid, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridResponsiveColumnLayout.GridResponsiveColumnLayout", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				currentBreakpoint: ""
			}));
		},

		onExit: function() {
			RevealGrid.destroy("grid1", this.getView());
		},

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelCSSGrid").setWidth(fValue + "%");
		},

		onLayoutChange: function (oEvent) {
			this.getView().getModel().setProperty("/currentBreakpoint", oEvent.getParameter("layout"));
		}

	});
});