sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectAttributeInTable.Table", {

		onInit: function () {
			var aData = [
				{ product: "Power Projector 4713", supplier: "Robert Brown Entertainment" },
				{ product: "HT-1022", supplier: "Pear Computing Services" },
				{ product: "Ergo Screen E-III", supplier: "DelBont Industries" },
				{ product: "Gladiator MX", supplier: "Asia High tech" },
				{ product: "Hurricane GX", supplier: "Telecomunicaciones Star" },
				{ product: "Notebook Basic 17", supplier: "Pear Computing Services" },
				{ product: "ITelO Vault SAT", supplier: "New Line Design"},
				{ product: "Hurricane GX", supplier: "Robert Brown Entertainment" },
				{ product: "Webcam", supplier: "Getränkegroßhandel Janssen" },
				{ product: "Deskjet Super Highspeed", supplier: "Vente Et Réparation de Ordinateur" }
			];

			var oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

});
