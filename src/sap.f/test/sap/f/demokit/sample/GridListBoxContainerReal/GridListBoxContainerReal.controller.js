sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/sample/GridListBoxContainerReal/RevealGrid/RevealGrid"
], function (Controller, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListBoxContainerReal.GridListBoxContainerReal", {
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel();
			var oData = [
				{ title: "Grid item title 1", subtitle: "Subtitle 1", group: "Group A" },
				{ title: "Grid item title 2", subtitle: "Subtitle 2", group: "Group A" },
				{ title: "Grid item title 3", subtitle: "Subtitle 3", group: "Group A" },
				{ title: "Grid item title 4", subtitle: "Subtitle 4", group: "Group A" },
				{ title: "Grid item title 5", subtitle: "Subtitle 5", group: "Group A" },
				{ title: "Grid item title 6 Grid item title Grid item title Grid item title Grid item title Grid item title", subtitle: "Subtitle 6", group: "Group A" },
				{ title: "Very long Grid item title that should wrap 7", subtitle: "This is a long subtitle 7", group: "Group A" },
				{ title: "Grid item title B 8", subtitle: "Subtitle 8", group: "Group A" },
				{ title: "Grid item title B 9 Grid item title B  Grid item title B 9 Grid item title B 9Grid item title B 9title B 9 Grid item title B 9Grid item title B", subtitle: "Subtitle 9", group: "Group A" },
				{ title: "Grid item title B 10", subtitle: "Subtitle 10", group: "Group B" },
				{ title: "Grid item title B 11", subtitle: "Subtitle 11", group: "Group B" },
				{ title: "Grid item title B 12", subtitle: "Subtitle 12", group: "Group B" },
				{ title: "Grid item title 13", subtitle: "Subtitle 13", group: "Group B" },
				{ title: "Grid item title 14", subtitle: "Subtitle 14", group: "Group B" },
				{ title: "Grid item title 15", subtitle: "Subtitle 15", group: "Group B" },
				{ title: "Grid item title 16", subtitle: "Subtitle 16", group: "Group B" },
				{ title: "Grid item title 17", subtitle: "Subtitle 17", group: "Group B" },
				{ title: "Grid item title 18", subtitle: "Subtitle 18", group: "Group B" },
				{ title: "Very long Grid item title that should wrap 19", subtitle: "This is a long subtitle 19", group: "Group B" },
				{ title: "Grid item title B 20", subtitle: "Subtitle 20", group: "Group B" },
				{ title: "Grid item title B 21", subtitle: "Subtitle 21", group: "Group B" },
				{ title: "Grid item title B 22", subtitle: "Subtitle 22", group: "Group B" },
				{ title: "Grid item title B 23", subtitle: "Subtitle 23", group: "Group B" },
				{ title: "Grid item title B 24", subtitle: "Subtitle 24", group: "Group B" },
				{ title: "Grid item title B 25", subtitle: "Subtitle 25", group: "Group B" },
				{ title: "Grid item title B 26", subtitle: "Subtitle 26", group: "Group B" },
				{ title: "Grid item title B 27", subtitle: "Subtitle 27", group: "Group B" }
			];
			oModel.setData(oData);
			this.getView().setModel(oModel);
		},

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