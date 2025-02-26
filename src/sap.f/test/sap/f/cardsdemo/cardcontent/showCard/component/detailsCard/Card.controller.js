sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.showCard.component.detailsCard.Card", {

		onInit: function () {
			var oModel = new JSONModel({
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
			});
			this.getView().setModel(oModel);
		},

		onBookPress: function () {
			MessageToast.show("Your booking has been submitted.");
		},

		onChangeSizePress: function () {
			const oContainer = this.getView().byId("container");

			const iWidth = Math.floor(Math.random() * 2000) + 300;
			const iHeight = Math.floor(Math.random() * 1000) + 200;
			oContainer.setWidth(iWidth + "px");
			oContainer.setHeight(iHeight + "px");
		}

	});
});