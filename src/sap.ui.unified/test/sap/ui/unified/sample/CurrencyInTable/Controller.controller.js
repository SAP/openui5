sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.CurrencyInTable.Controller", {

		onInit: function () {
			var aData = [
				{ product: "Power Projector 4713", price: 234 },
				{ product: "Gladiator MX", price: 5435 },
				{ product: "Hurricane GX", price: 6757 },
				{ product: "Webcam", price: -59 },
				{ product: "Deskjet Super Highspeed", price: 567 }
			];

			var oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

});