sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/sample/GridAutoFlow/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridAutoFlow.GridAutoFlow", {

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onExit: function() {
			RevealGrid.destroy("grid1", this.getView());
		},

		onRadioButtonSelected: function (oEvent) {
			var iIndex = oEvent.getParameters().selectedIndex;
			switch (iIndex) {
				case 0:
					this.byId("grid1").setGridAutoFlow("Column");
					break;
				case 1:
					this.byId("grid1").setGridAutoFlow("ColumnDense");
					break;
				case 2:
					this.byId("grid1").setGridAutoFlow("Row");
					break;
				case 3:
					this.byId("grid1").setGridAutoFlow("RowDense");
					break;
				default:
			}
		}

	});
});