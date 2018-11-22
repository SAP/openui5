sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
		"use strict";

		var GridAutoFlow = Controller.extend("sap.ui.layout.sample.GridAutoFlow.GridAutoFlow", {
			onRadioButtonSelected: function (oEvent) {
				var index = oEvent.getParameters().selectedIndex;
				switch (index) {
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

		return GridAutoFlow;
	});
