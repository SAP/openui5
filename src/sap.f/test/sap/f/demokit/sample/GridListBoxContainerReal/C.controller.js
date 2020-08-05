sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/sample/GridListBoxContainerReal/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListBoxContainerReal.GridListBoxContainerReal", {

		onExit: function() {
			RevealGrid.destroy(["gridList1", "gridList2", "gridList3"], this.getView());
		},

		onRevealGrid: function () {
			RevealGrid.toggle(["gridList1", "gridList2", "gridList3"], this.getView());
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("gridList").setWidth(fValue + "%");
		}

	});
});