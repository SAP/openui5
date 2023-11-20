sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/library"
], function (Controller, JSONModel, library) {
	"use strict";
	var CardPreviewMode = library.CardPreviewMode;
	return Controller.extend("my.component.sample.cardContentControls.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.card,
				oData;
			if (oCard.getPreviewMode() === CardPreviewMode.MockData) {
				oData = {
					"cities": [
						{
							"text": "MockData_Berlin",
							"key": "BR"
						},
						{
							"text": "MockData_London",
							"key": "LN"
						},
						{
							"text": "MockData_Madrid",
							"key": "MD"
						},
						{
							"text": "MockData_Prague",
							"key": "PR"
						},
						{
							"text": "MockData_Paris",
							"key": "PS"
						},
						{
							"text": "MockData_Sofia",
							"key": "SF"
						},
						{
							"text": "MockData_Vienna",
							"key": "VN"
						}
					]
				};
			} else {
				oData = {
					"cities": [
						{
							"text": "Berlin",
							"key": "BR"
						},
						{
							"text": "London",
							"key": "LN"
						},
						{
							"text": "Madrid",
							"key": "MD"
						},
						{
							"text": "Prague",
							"key": "PR"
						},
						{
							"text": "Paris",
							"key": "PS"
						},
						{
							"text": "Sofia",
							"key": "SF"
						},
						{
							"text": "Vienna",
							"key": "VN"
						}
					]
				};
			}
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});
});