sap.ui.define([
	"./FormatHelper",
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/Locale",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(FormatHelper, ListFormat, Locale, Controller, JSONModel) {
	"use strict";

	return Controller.extend("DateFormat", {
		onInit: function() {

			var oFormatOptions = {
				type: "standard",
				style: "wide"
			};
			var oListFormat = ListFormat.getInstance(oFormatOptions);

			var aParsedValue = [1, 2, 3, 4];
			var sFormattedValue = oListFormat.format(aParsedValue);

			var oModel = new JSONModel({
				formatOptions: oFormatOptions,
				formattedValue: sFormattedValue,
				parsedValue: aParsedValue,
				parsedValueDisplay: "1,2,3,4",
				locales: FormatHelper.locales
			});

			this.getView().setModel(oModel);
		},

		updateStringValue: function() {
			var oModel = this.getView().getModel();
			var aParsedValue = oModel.getProperty('/parsedValue');
			var oOptions = oModel.getProperty('/formatOptions');
			var listFormat = ListFormat.getInstance(oOptions);

			oModel.setProperty("/formattedValue", listFormat.format(aParsedValue));
		},

		formatFormatOptions: function (oFormatOptions) {
			return JSON.stringify(oFormatOptions);
		},

		onTypeChange: function(oEvent) {
			var oModel = this.getView().getModel();
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oFormatOptions = Object.assign({}, oModel.getProperty("/formatOptions"));

			oFormatOptions.type = oSelectedItem.getKey();
			oModel.setProperty("/formatOptions", oFormatOptions);

			this.updateStringValue();

			oModel.updateBindings(true);
		},

		onStyleChange: function (oEvent) {
			var oModel = this.getView().getModel();
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oFormatOptions = Object.assign({}, oModel.getProperty("/formatOptions"));

			oFormatOptions.style = oSelectedItem.getKey();
			oModel.setProperty("/formatOptions", oFormatOptions);

			this.updateStringValue();

			oModel.updateBindings(true);
		},

		onInputLiveChange: function (oEvent) {
			var oModel = this.getView().getModel();
			var sValue = "[" + oEvent.getParameter('value') + "]";
			var aValues = [];
			var oListFormat = ListFormat.getInstance(oModel.getProperty("/formatOptions"));

			try {
				aValues = JSON.parse(sValue);
			} catch (error) {
				// wayne
			}
			var sFormatted = oListFormat.format(aValues);

			oModel.setProperty("/parsedValue", aValues);
			oModel.setProperty("/formattedValue", sFormatted);
		},

		onStringLiveChange: function (oEvent) {
			var oModel = this.getView().getModel();
			var sFormatted = oEvent.getParameter('value');
			var oListFormat = ListFormat.getInstance(oModel.getProperty("/formatOptions"));

			var aParsed = oListFormat.parse(sFormatted);
			var sResult = aParsed.toString();

			oModel.setProperty("/parsedValue", aParsed);
			oModel.setProperty("/parsedValueDisplay", sResult);
		},

		formatLocaleText: function (aParsedValue, sLocale) {
			var oLocale = new Locale(sLocale),
				oListFormat = ListFormat.getInstance(this.getView().getModel().getProperty("/formatOptions"), oLocale);

			return oListFormat.format(aParsedValue);
		}
	});
});
