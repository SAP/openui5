sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/sample/GridResponsiveColumnLayout/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridResponsiveColumnLayout.GridResponsiveColumnLayout", {

		onExit: function() {
			RevealGrid.destroy("grid1", this.getView());
		},

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelCSSGrid").setWidth(fValue + "%");
		}

	});
});