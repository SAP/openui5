sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var BlockController = Controller.extend("sap.ui.layout.sample.BlockLayoutCustomBackground.Block", {
		onInit: function () {
			this.oModel = new JSONModel({
				dataObjectsCount: 11,
				maxCellsPerRow: 4,
				colorSet: "ColorSet1"
			});
			this.getView().setModel(this.oModel);
		},
		onAfterRendering: function () {
			this.setBLCells();
		},
		createContent: function (index) {
			var text = new sap.m.Text({text: index + "Lorem ipsum"});
			return new sap.ui.layout.BlockLayoutCell({
				content: text
			});
		},
		setBLCells: function () {
			var oBlockLayout2 = this.getView().byId("BlockLayoutTwo"),
				oBLRow = null,
				sColorSet = this.oModel.getProperty("/colorSet"),
				sColorShade = "A",
				bCreateRow = true,
				iDataObjCount = parseInt(this.oModel.getProperty("/dataObjectsCount"), 10),
				iMaxCellsPerRow = parseInt(this.oModel.getProperty("/maxCellsPerRow"), 10);

			oBlockLayout2.destroyContent();

			for (var i = 1; i <= iDataObjCount; i++) {
				if (bCreateRow) {
					oBLRow = new sap.ui.layout.BlockLayoutRow();
					oBlockLayout2.addContent(oBLRow);
					bCreateRow = false;
					sColorShade = sColorShade === "D" ? "A" : String.fromCharCode(sColorShade.charCodeAt(0) + 1);
				}

				var oBLCell = this.createContent(i);
				oBLCell.setBackgroundColorSet(sColorSet);
				oBLCell.setBackgroundColorShade("Shade" + sColorShade);
				oBLRow.addContent(oBLCell);
				sColorShade = sColorShade === "D" ? "A" : String.fromCharCode(sColorShade.charCodeAt(0) + 1);

				bCreateRow = i % iMaxCellsPerRow === 0;
			}
		}
	});

	return BlockController;

});
