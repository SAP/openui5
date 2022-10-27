sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("my.component.sample.cardContentControls.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.card,
				oData;
			if (oCard.getProperty("useMockData")) {
				oData = {
					"cities": [
						{
							"text": "Mock_Berlin",
							"key": "BR"
						},
						{
							"text": "Mock_London",
							"key": "LN"
						},
						{
							"text": "Mock_Madrid",
							"key": "MD"
						},
						{
							"text": "Mock_Prague",
							"key": "PR"
						},
						{
							"text": "Mock_Paris",
							"key": "PS"
						},
						{
							"text": "Mock_Sofia",
							"key": "SF"
						},
						{
							"text": "Mock_Vienna",
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