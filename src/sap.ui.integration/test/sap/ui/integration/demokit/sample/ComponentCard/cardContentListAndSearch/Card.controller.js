sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.ComponentCard.cardContentListAndSearch.Card", {
		onInit: function () {
			var oModel = new JSONModel({
				"productItems": [
					{
						"title": "Avantel",
						"subtitle": "ID23452256-D44",
						"businessType": "NONPROFIT",
						"status": "success",
						"statusSchema": 8
					},
					{
						"title": "Tecum",
						"subtitle": "ID27852256-D47",
						"businessType": "CORPORATION",
						"status": "information",
						"statusSchema": 3
					},
					{
						"title": "Talpa",
						"subtitle": "ID123555587-I05",
						"businessType": "PARTNERSHIP",
						"status": "warning",
						"statusSchema": 1
					}
				]
			});
			this.getView().setModel(oModel);
		}
	});
});