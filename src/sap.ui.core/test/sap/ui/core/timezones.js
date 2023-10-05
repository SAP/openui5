sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel"
], function (Column, ColumnListItem, Label, Text, Locale, LocaleData, UI5Date, DateFormat, XMLView, JSONModel) {
	"use strict";

	var aTimezones = Object.keys(LocaleData.getInstance(new Locale("en")).getTimezoneTranslations());

	//dimensions: locales, timezones
	var aActiveLocales = ["de", "fr", "en", "tr"];
	var oDate = UI5Date.getInstance();
	var oEntities = {};
	var getEntities = function(aLocales) {
		aLocales.forEach(function (sLocale) {
			var oLocale = new Locale(sLocale);
			var oInstance = DateFormat.getDateTimeWithTimezoneInstance(oLocale);
			aTimezones.forEach(function (sTimezone) {
				var sFormatted = oInstance.format(oDate, sTimezone);
				var oParsed = oInstance.parse(sFormatted, sTimezone);
				if (!oParsed) {
					throw new Error("Cannot parse " + sTimezone);
				}
				if (oParsed[1] !== sTimezone) {
					throw new Error("Timezone mismatch: " + sTimezone + " and " + oParsed[1]);
				}
				oEntities[sTimezone] = oEntities[sTimezone] || {name: sTimezone};
				oEntities[sTimezone][sLocale] = sFormatted;
			});
		});
		return Object.keys(oEntities).map(function (sEntityKey) {
			return oEntities[sEntityKey];
		});
	};
	var aEntities = getEntities(aActiveLocales);
	var aColumns = ["name"].concat(aActiveLocales);

	var oModel = new JSONModel({
		date: oDate,
		entities: aEntities,
		locales: Locale._cldrLocales.map(function(sLocale) {
			return {
				key: sLocale,
				name: sLocale
			};
		}),
		columns: aColumns
	});
	var oView = XMLView.create({viewName: "sample/timezone/timezones"});
	oView.then(function (oView) {
		oView.setModel(oModel);
		oView.placeAt("content");
		var oTable = oView.byId("table");
		var configureTableColumns = function(aLocales) {
			var aColumns = ["name"].concat(aLocales);
			var texts = [];
			aColumns.forEach(function (sLocale) {
				var oColumn = new Column("col" + sLocale + "", {
					width: "1em",
					header: new Label({
						text: sLocale
					})
				});
				oTable.addColumn(oColumn);
				texts.push(new Text({text : "{" + sLocale + "}"}));
			});
			var oTemplate = new ColumnListItem(
				{cells: texts
				});
			oTable.bindItems("/entities", oTemplate);
		};
		configureTableColumns(aActiveLocales);

		var oMultiComobo = oView.byId("multiComobo");
		oMultiComobo.attachSelectionFinish(function (oEvent) {
			aActiveLocales = oEvent.getParameter("selectedItems").map(function(oItem) { return oItem.getKey();});
			oTable.destroyColumns();
			oTable.removeAllColumns();
			configureTableColumns(aActiveLocales);
			var aEntities = getEntities(aActiveLocales);
			oModel.setProperty("/entities", aEntities);
			oTable.rerender();
		});
	});
});
