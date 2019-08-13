sap.ui.define([
	"sap/ui/model/type/Currency",
	"sap/ui/core/samples/formatting/model/Customizing"],
function (CurrencyType, Customizing) {
	"use strict";

	return CurrencyType.extend("sap.ui.core.samples.formatting.types.CustomCurrency", {
		constructor: function (oFormatOptions, oConstraints) {
			oFormatOptions = oFormatOptions || {};
			oFormatOptions.customCurrencies = Customizing.customCurrencies;
			CurrencyType.apply(this, [oFormatOptions, oConstraints]);
		}
	});
});