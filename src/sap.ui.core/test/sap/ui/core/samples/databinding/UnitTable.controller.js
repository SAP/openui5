sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function (Controller, JSONModel, NumberFormat) {
	"use strict";
	return Controller.extend("sap.ui.core.samples.UnitTable", {

		onInit: function () {
			var aLocales = {
				currentLocale: sap.ui.getCore().getConfiguration().getLocale().toString(),
				locales: [
					{key: "ar-SA"},
					{key: "de-DE"},
					{key: "da-DK"},
					{key: "en-GB"},
					{key: "en-US"},
					{key: "es-MX"},
					{key: "es-ES"},
					{key: "fa-IR"},
					{key: "fr-FR"},
					{key: "ja-JP"},
					{key: "id-ID"},
					{key: "it-IT"},
					{key: "ro-RO"},
					{key: "ru-RU"},
					{key: "pt-BR"},
					{key: "hi-IN"},
					{key: "he-IL"},
					{key: "tr-TR"},
					{key: "nl-NL"},
					{key: "pl-PL"},
					{key: "ko-KR"},
					{key: "zh-SG"},
					{key: "zh-TW"},
					{key: "zh-CN"}
				]
			};

			var aItems = [
				{lastName: "Dente", name: "Alfred", money: 5.67, currency: "EUR"},
				{lastName: "Friese", name: "Andrew", money: 10.45, currency: "EUR"},
				{lastName: "Mann", name: "Sarah", money: 1345.212, currency: "EUR"},
				{lastName: "Berry", name: "Doris", money: 1.1, currency: "USD"},
				{lastName: "Open", name: "Jenny", money: 55663.1, currency: "USD"},
				{lastName: "Dewit", name: "Stanley", money: 34.23, currency: "EUR"},
				{lastName: "Zar", name: "Louise", money: 123, currency: "EUR"},
				{lastName: "Burr", name: "Timothy", money: 678.45, currency: "DEM"},
				{lastName: "Hughes", name: "Trisha", money: 123.45, currency: "EUR"},
				{lastName: "Town", name: "Mike", money: 678.90, currency: "JPY"},
				{lastName: "Case", name: "Josephine", money: 8756.2, currency: "EUR"},
				{lastName: "Time", name: "Tim", money: 836.4, currency: "EUR"},
				{lastName: "Barr", name: "Susan", money: 9.3, currency: "USD"},
				{lastName: "Poole", name: "Gerry", money: 6344.21, currency: "EUR"},
				{lastName: "Ander", name: "Corey", money: 563.2, currency: "JPY"},
				{lastName: "Early", name: "Boris", money: 8564.4, currency: "EUR"},
				{lastName: "Noring", name: "Cory", money: 3563, currency: "USD"},
				{lastName: "O'Lantern", name: "Jacob", money: 5.67, currency: "EUR"},
				{lastName: "Tress", name: "Matthew", money: 5.67, currency: "EUR"},
				{lastName: "Summer", name: "Paige", money: 5.67, currency: "EUR"}
			];

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].speedValue = Math.random() * 1000;
				aItems[i].speedUnit = "speed-meter-per-second";

				aItems[i].diskspaceValue = Math.random() * 1000;
				aItems[i].diskspaceUnit = "digital-gigabyte";

				aItems[i].volumeValue = Math.random() * 1000;
				aItems[i].volumeUnit = "volume-cup";
			}

			this.getView().setModel(new JSONModel(aItems));

			this.getView().setModel(new JSONModel(aLocales), "loc");

			this.setupFormatters();
		},

		setupFormatters: function (oLocale) {
			this.oUnitFormatterCLDR = NumberFormat.getUnitInstance({unitCodeType: "CLDR"}, oLocale);
			this.oCurrencyFormatter = NumberFormat.getCurrencyInstance({}, oLocale);
			this.oNumberFormatter = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2}, oLocale);
		},

		localeChanged: function (oEvent) {
			var sParam = oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel("loc").setProperty("/currentLocale", sParam);
			this.setupFormatters(new sap.ui.core.Locale(sParam));
			sap.ui.getCore().getConfiguration().setLanguage(sParam);
		},

		getLocaleData: function(sLocale) {
			var oLocale = new sap.ui.core.Locale(sLocale);
			return sap.ui.core.LocaleData.getInstance(oLocale);
		},

		formatUnitCLDR: function (v, u) {
			return this.oUnitFormatterCLDR.format(v, u);
		},

		formatDiskvalue: function (v) {
			return this.oNumberFormatter.format(v);
		},

		formatDisplayNameCLDR: function (sISOCode) {
			var oLocaleData = this.getLocaleData(this.getView().getModel("loc").getProperty("/currentLocale"));
			return oLocaleData.getUnitDisplayNameByCLDRCode(sISOCode);
		},

		formatCurrency: function (v, u) {
			return this.oCurrencyFormatter.format(v, u);
		}
	});
});
