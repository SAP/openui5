sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/type/Currency"],
	function (Controller, Currency) {
		"use strict";

	return Controller.extend("sap.ui.demo.db.controller.App", {
		formatMapUrl: function(sStreet, sZip, sCity, sCountry) {
			return "https://maps.googleapis.com/maps/api/staticmap?zoom=13&size=500x300&markers="
			+ jQuery.sap.encodeURL(sStreet + ", " + sZip +  " " + sCity + ", " + sCountry);
		},
		formatStockValue: function(fUnitPrice, iStockLevel, sCurrCode) {
			var sBrowserLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oLocale = new sap.ui.core.Locale(sBrowserLocale);
			var oLocaleData = new sap.ui.core.LocaleData(oLocale);
			var oCurrency = new Currency(oLocaleData.mData.currencyFormat);
			return oCurrency.formatValue([fUnitPrice * iStockLevel, sCurrCode], "string");
		}
	});
});