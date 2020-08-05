sap.ui.define([
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function (Locale, LocaleData, Controller, JSONModel, NumberFormat) {
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

			var sUrl = "sap/ui/core/samples/UnitTable.meters.json";
			var pLoadResource = jQuery.sap.loadResource(sUrl,{
				dataType: "json",
				async : true
			});
			var that = this;
			pLoadResource.then(function(oResult) {
				//data transformation
				var aMeters = [];
				var aMonths = [];

				var oMonths = {};

				Object.keys(oResult).forEach(function(sKey) {
					var oResultObj = oResult[sKey];
					var sMeterName = oResultObj.name;
					var oObj = {
						decimals: oResultObj.decimals,
						unit: oResultObj.unit,
						name: sMeterName
					};
					oResultObj.data.forEach(function(oData) {
						var sMonthKey = oData.name.toLowerCase();
						oObj[sMonthKey] =  oData.value;


						oMonths[oData.name] = oMonths[oData.name] || {};
						oMonths[oData.name][sMeterName] = {
							value: oData.value,
							decimals: oResultObj.decimals,
							unit: oResultObj.unit
						};

					});

					aMeters.push(oObj);
				});

				Object.keys(oMonths).forEach(function(sMonth) {
					var oObj = oMonths[sMonth];
					oObj.name = sMonth;
					aMonths.push(oObj);
				});


				that.getView().setModel(new JSONModel({data:aMeters,size:aMeters.length}), "meters");
				that.getView().setModel(new JSONModel({data:aMonths,size:aMonths.length}), "months");
			});

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].speedValue = Math.random() * 1000;
				aItems[i].speedUnit = "speed-meter-per-second";

				aItems[i].diskspaceValue = Math.random() * 1000;
				aItems[i].diskspaceUnit = "digital-gigabyte";

				aItems[i].volumeValue = Math.random() * 1000;
				aItems[i].volumeUnit = "volume-cup";

				aItems[i].customValue = Math.floor(Math.random() * 10);
				aItems[i].customUnit = "cats";
			}

			this.getView().setModel(new JSONModel(aItems));

			this.getView().setModel(new JSONModel(aLocales), "loc");

			this.getView().setModel(new JSONModel({
				value: 128,
				unit: "gigabyte",
				customUnits: {
					gigabyte: {
						"displayName": "GB",
						"unitPattern-count-other": "{0} GIGABYTE!"
					}
				}
			}), "boundUnits");

			this.setupFormatters();
		},

		setupFormatters: function (oLocale) {
			this.oUnitFormatter = NumberFormat.getUnitInstance({}, oLocale);
			this.oCustomUnitFormatter = NumberFormat.getUnitInstance({
				customUnits: {
					"cats": {
						"displayName": "Kitties",
						"unitPattern-count-zero": "no cats :(",
						"unitPattern-count-one": "{0} cat",
						"unitPattern-count-other": "{0} cats"
					}
				}
			}, oLocale);
			this.oCurrencyFormatter = NumberFormat.getCurrencyInstance({}, oLocale);
			this.oNumberFormatter = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2}, oLocale);
		},

		localeChanged: function (oEvent) {
			var sParam = oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel("loc").setProperty("/currentLocale", sParam);
			this.setupFormatters(new Locale(sParam));
			sap.ui.getCore().getConfiguration().setLanguage(sParam);
		},

		getLocaleData: function(sLocale) {
			var oLocale = new Locale(sLocale);
			return LocaleData.getInstance(oLocale);
		},

		formatUnit: function (v, u) {
			return this.oUnitFormatter.format(v, u);
		},

		formatCustomUnit: function (v, u) {
			return this.oCustomUnitFormatter.format(v, u);
		},

		formatDiskvalue: function (v) {
			return this.oNumberFormatter.format(v);
		},

		formatDisplayName: function (sUnit) {
			var oLocaleData = this.getLocaleData(this.getView().getModel("loc").getProperty("/currentLocale"));
			return oLocaleData.getUnitDisplayName(sUnit);
		},

		formatCurrency: function (v, u) {
			return this.oCurrencyFormatter.format(v, u);
		}
	});
});
