sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.Currency.Controller", {

		onInit: function () {

			var aVariousNumberData = [
				{ currency: "EUR", price: 2300.12 },
				{ currency: "EUR", price: 38 },
				{ currency: "JPY", price: 1928472 },
				{ currency: "JPY", price: 233.9385763 },
				{ currency: "USD", price: 125.02 },
				{ currency: "USD", price: 2125.02843 },
				{ currency: "TND", price: 9283 },
				{ currency: "TND", price: 235.0298 }
			];

			var aNonDecimalCurrencyData = [
				{ currency: "JPY", price: 2300.12 },
				{ currency: "JPY", price: 38 },
				{ currency: "JPY", price: 1928472 },
				{ currency: "JPY", price: 233 }
			];

			var aBigNumberData = [
				{ currency: "USD", price: "12345678901234567890123" },
				{ currency: "USD", price: "123456789012345678901.23" }
			];

			var oModel = new JSONModel({
				variousNumberDataModel: aVariousNumberData,
				nonDecimalCurrencyDataModel: aNonDecimalCurrencyData,
				bigNumberDataModel: aBigNumberData
			});
			this.getView().setModel(oModel);
		}
	});

});
