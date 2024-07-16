sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/library",
	"sap/ui/model/json/JSONModel"
], function(XMLView, layoutLibrary, JSONModel) {
	"use strict";

	var BlockLayoutCellColorShade = layoutLibrary.BlockLayoutCellColorShade;

	XMLView.create({
		definition: document.getElementById('myXml').textContent,
		models: new JSONModel({
			selectEnabled: true,
			colorSet: "ColorSet5",
			shades: [
				BlockLayoutCellColorShade.ShadeA,
				BlockLayoutCellColorShade.ShadeB,
				BlockLayoutCellColorShade.ShadeC,
				BlockLayoutCellColorShade.ShadeD,
				BlockLayoutCellColorShade.ShadeE,
				BlockLayoutCellColorShade.ShadeF
			]
		})
	}).then(function(oXMLView) {
		oXMLView.placeAt("content");
	});
});