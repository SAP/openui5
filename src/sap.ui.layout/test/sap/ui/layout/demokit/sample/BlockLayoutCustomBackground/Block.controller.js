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
				colorSet: "1"
			});
			this.getView().setModel(this.oModel);
		},
		onAfterRendering: function () {
			this.setBLCells();
		},
		createDummyContent: function (index) {
			var text = new sap.m.Text({text: index + "Lorem ipsum"});
			text.addStyleClass("sapContrast");
			return new sap.ui.layout.BlockLayoutCell({
				content: text
			});
		},
		setBLCells: function (event) {
			var bl2 = this.getView().byId("BlockLayoutTwo"),
				row = null,
				colorSet = parseInt(this.oModel.getProperty("/colorSet")),
				colorIndex = 0,
				createRow = true,
				dataObjCount = parseInt(this.oModel.getProperty("/dataObjectsCount")),
				maxCellsPerRow = parseInt(this.oModel.getProperty("/maxCellsPerRow"));

			bl2.removeAllContent();

			for (var i = 1; i <= dataObjCount; i++) {
				if (createRow) {
					row = new sap.ui.layout.BlockLayoutRow();
					bl2.addContent(row);
					createRow = false;
					colorIndex = colorIndex >= 4 ? 1 : colorIndex + 1;
				}

				var cellContent = this.createDummyContent(i);
				cellContent.setBackgroundColorSet(colorSet);
				cellContent.setBackgroundColorIndex(colorIndex);
				row.addContent(cellContent);
				colorIndex = colorIndex >= 4 ? 1 : colorIndex + 1;

				if (i % maxCellsPerRow == 0) {
					createRow = true;
				}
			}
		}
	});

	return BlockController;

});
