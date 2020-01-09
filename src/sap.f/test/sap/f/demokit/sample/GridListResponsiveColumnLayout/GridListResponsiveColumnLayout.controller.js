sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/sample/GridListResponsiveColumnLayout/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListResponsiveColumnLayout.GridListResponsiveColumnLayout", {

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onExit: function() {
			RevealGrid.destroy("grid1", this.getView());
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelForGridList").setWidth(fValue + "%");
		}

	});
});