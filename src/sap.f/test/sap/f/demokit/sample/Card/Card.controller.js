sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.sample.Card.Card", {
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
				],
				"productItems": [
					{
						"title": "Notebook HT",
						"subtitle": "ID23452256-D44",
						"revenue": "27.25K EUR",
						"status": "success",
						"statusSchema": "Success"
					},
					{
						"title": "Notebook XT",
						"subtitle": "ID27852256-D47",
						"revenue": "7.35K EUR",
						"status": "exceeded",
						"statusSchema": "Error"
					},
					{
						"title": "Notebook ST",
						"subtitle": "ID123555587-I05",
						"revenue": "22.89K EUR",
						"status": "warning",
						"statusSchema": "Warning"
					}
				]
			});
			this.getView().setModel(oModel);
		},
		onBookPress: function() {
			MessageToast.show(
				"By pressing the 'Book' button a new application can be opened where the actual booking happens. This can be in the same window, in a new tab or in a dialog.",
				{
					my: "center",
					at: "center",
					width: "50rem"
				}
			);
		}
	});
});