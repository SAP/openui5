sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";
	return Controller.extend("sap.ui.core.samples.formatting.controller.Main", {
		onInit: function () {},

		bind: function(sCtrID, sProp, mBindingInfo) {
			var oView = this.getView();
			var oCtr = oView.byId(sCtrID);
			if (oCtr) {
				oCtr.bindProperty(sProp, mBindingInfo);
			}
		},

		collectFormatOptionsFor: function(sType) {
			var oView = this.getView();
			var oFormatOptions = {
				// general
				showMeasure: oView.byId("showMeasure").getSelected(),
				strictParsing: oView.byId("strictParsing").getSelected()
			};

			if (sType == "units") {
				Object.assign(oFormatOptions, {
					unitOptional: oView.byId("unitOptional").getSelected()
				});
			} else if (sType == "currencies") {
				Object.assign(oFormatOptions, {
					currencyCode: oView.byId("currencyCode").getSelected()
				});
			}

			return oFormatOptions;
		},

		activate: function() {
			sap.ui.getCore().getMessageManager().removeAllMessages();

			// setTimeout is needed because the datastate is refreshed async
			// without the setTimeout error states will not be removed after a rebind
			// This is a bug, see incident 1980347458
			setTimeout(function() {
				// unit CLDR
				this.bind("inputUnitCLDR", "value", {
					parts:['/unitData/valueCLDR', '/unitData/unitCLDR'],
					type: 'sap.ui.model.type.Unit',
					formatOptions: this.collectFormatOptionsFor("units")
				});
				this.bind("labelUnitCLDR", "text", {
					parts:['/unitData/valueCLDR', '/unitData/unitCLDR'],
					type: 'sap.ui.model.type.Unit',
					formatOptions: this.collectFormatOptionsFor("units")
				});

				// unit custom
				this.bind("inputUnitCustom", "value", {
					parts:['/unitData/valueCustom', '/unitData/unitCustom'],
					type: 'sap.ui.core.samples.formatting.types.CustomUnit',
					formatOptions: this.collectFormatOptionsFor("units")
				});
				this.bind("labelUnitCustom", "text", {
					parts:['/unitData/valueCustom', '/unitData/unitCustom'],
					type: 'sap.ui.core.samples.formatting.types.CustomUnit',
					formatOptions: this.collectFormatOptionsFor("units")
				});

				// currency CLDR
				this.bind("inputCurrencyCLDR", "value", {
					parts:['/currencyData/valueCLDR', '/currencyData/currencyCLDR'],
					type: 'sap.ui.model.type.Currency',
					formatOptions: this.collectFormatOptionsFor("currencies")
				});
				this.bind("labelCurrencyCLDR", "text", {
					parts:['/currencyData/valueCLDR', '/currencyData/currencyCLDR'],
					type: 'sap.ui.model.type.Currency',
					formatOptions: this.collectFormatOptionsFor("currencies")
				});

				// currency custom
				this.bind("inputCurrencyCustom", "value", {
					parts: ['/currencyData/valueCustom', '/currencyData/currencyCustom'],
					type: 'sap.ui.core.samples.formatting.types.CustomCurrency',
					formatOptions: this.collectFormatOptionsFor("currencies")
				});
				this.bind("labelCurrencyCustom", "text", {
					parts: ['/currencyData/valueCustom', '/currencyData/currencyCustom'],
					type: 'sap.ui.core.samples.formatting.types.CustomCurrency',
					formatOptions: this.collectFormatOptionsFor("currencies")
				});
			}.bind(this), 0);
		}
	});
});
