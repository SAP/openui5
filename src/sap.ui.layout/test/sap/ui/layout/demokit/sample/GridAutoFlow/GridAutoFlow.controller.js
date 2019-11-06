sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridAutoFlow.GridAutoFlow", {

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