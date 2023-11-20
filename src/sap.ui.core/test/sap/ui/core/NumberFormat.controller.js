sap.ui.define([
	"./FormatHelper",
	"sap/base/i18n/Formatting",
	"sap/base/util/deepEqual",
	"sap/base/util/JSTokenizer",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(FormatHelper, Formatting, deepEqual, JSTokenizer, NumberFormat, Locale, LocaleData, Controller, JSONModel) {
	"use strict";

	return Controller.extend("DateFormat", {
		onInit: function() {

			var aSamples = [
					{key: "custom", text: "Custom", type: "Float", sample: {} },
					{key: "integer", text: "Integer", type: "Integer", sample: {} },
					{key: "float", text: "Float with precision", type: "Float", sample: {precision: 3} },
					{key: "short", text: "Short format", type: "Float", sample: {style: "short", precision: 3} },
					{key: "short2", text: "Short format with limit", type: "Float", sample: {style: "short", precision: 3, shortLimit: 1000000} },
					{key: "short3", text: "Short format without scale", type: "Float", sample: {style: "short", precision: 3, showScale: false} },
					{key: "long", text: "Long format", type: "Float", sample: {style: "long"} },
					{key: "currency", text: "Currency", type: "Currency", sample: {currencyCode: false} },
					{key: "currency2", text: "Currency short", type: "Currency", sample: {currencyCode: false, style: "short"} },
					{key: "unit", text: "Unit long format", type: "Unit", sample: {style: "long"} },
					{key: "unit2", text: "Unit", type: "Unit", sample: {} },
					{key: "unit3", text: "Unit Custom", type: "Unit", sample: {customUnits:{"electric-inductance": {
									"unitPattern-count-one": "{0}\u00a0H",
									"unitPattern-count-other": "{0}\u00a0H"}}}, unit: 'electric-inductance' },
					{key: "pattern", text: "Float Custom pattern", type: "Float", sample: {pattern: "#,##,###.0#"} }
				],
				aHashParams = [
					{name: "formatOptions", "default": {}},
					{name: "type", "default": "Integer"},
					{name: "number", "default": 123456.789},
					{name: "currency", "default": "USD"},
					{name: "unit", "default": "speed-knot"}
				],
				oSupportedOptions = {
					minIntegerDigits: {
						type: "int",
						min: 0,
						help: "Integer value defining the minimum number of integer digits"
					},
					maxIntegerDigits: {
						type: "int",
						min: 0,
						help: "Integer value defining the maximum number of integer digits"
					},
					minFractionDigits: {
						type: "int",
						min: 0,
						help: "Integer value defining the minimum number of fraction digits"
					},
					maxFractionDigits: {
						type: "int",
						min: 0,
						help: "Integer value defining the maximum number of fraction digits"
					},
					decimals: {
						type: "int",
						min: 0,
						help: "Integer value defining the number of decimals (minimum and maximum fraction digits)"
					},
					shortDecimals: {
						type: "int",
						min: 0,
						help: "Integer value defining the number of decimals used in short number format"
					},
					shortLimit: {
						type: "float",
						min: 0,
						help: "Float value, the short formatting will only be applied to numbers above this limit"
					},
					shortRefNumber: {
						type: "float",
						help: "Float value used to chose the scale instead of the value to format. This is useful if you have multiple values which should be comparable"
					},
					showScale: {
						type: "boolean",
						help: "To hide the scale in the short format set to \"false\""
					},
					trailingCurrencyCode: {
						type: "boolean",
						help: "To use the CLDR pattern set to \"false\""
					},
					precision: {
						type: "int",
						min: 0,
						help: "Integer value defining the of valid digits shared across both decimals and fraction digits"
					},
					pattern: {
						type: "string",
						regex: /^(¤(\s)*)?[#0]*(,[#0]+)*(\.[0#]+)?((\s)*¤)?$/,
						help: "Number pattern consisting of '#' for optional digit, '0' for mandatory digit, ',' as grouping separator, '.' as decimal separator, '¤' for the currency symbol"
					},
					strictGroupingValidation: {
						type: "boolean",
						help: "To enable strict grouping validation set to \"true\""
					},
					groupingEnabled: {
						type: "boolean",
						help: "To enable grouping of integer digits set to \"true\""
					},
					groupingSeparator: {
						type: "string",
						help: "Character used as grouping separator"
					},
					groupingSize: {
						type: "int",
						min: 0,
						help: "The size of groups on the integer part"
					},
					groupingBaseSize: {
						type: "int",
						min: 0,
						help: "The base group size for grouping on the integer part"
					},
					decimalSeparator: {
						type: "string",
						help: "Character used as decimal separator"
					},
					plusSign: {
						type: "string",
						help: "Character used as plus sign"
					},
					minusSign: {
						type: "string",
						help: "Character used as minus sign"
					},
					parseAsString: {
						type: "boolean",
						help: "To return a JS string instead of number set this to \"true\""
					},
					preserveDecimals: {
						type: "boolean",
						help: "To keep the decimals set this to \"true\""
					},
					style: {
						type: "enum",
						values: ["short", "long"],
						help: "Allowed values are \"short\" and \"long\""
					},
					roundingMode: {
						type: "enum",
						values: ["floor", "ceiling", "towards_zero", "away_from_zero", "half_floor", "half_ceiling", "half_towards_zero", "half_away_from_zero"],
						help: "Allowed values are \"floor\", \"ceiling\", \"towards_zero\", \"away_from_zero\", \"half_floor\", \"half_ceiling\", \"half_towards_zero\" and \"half_away_from_zero\""
					},
					showMeasure: {
						type: "boolean",
						help: "To hide the measure/currency on the formatted value, set to \"false\""
					},
					showNumber: {
						type: "boolean",
						help: "To hide the number set this to \"true\""
					},
					currencyCode: {
						type: "boolean",
						help: "To show currency symbols instead of three letter currency code, set to \"false\""
					},
					currencyContext: {
						type: "enum",
						values: ["standard", "accounting"],
						help: "Allowed values are \"standard\" and \"accounting\""
					},
					customUnits: {
						type: "object",
						help: "Custom units"
					},
					customCurrencies: {
						type: "object",
						help: "Custom Currencies"
					},
					language: {
						type: "string",
						help: "Language to enter"
					},
					emptyString: {
					}

				};


			var oCurrentLocale = new Locale(Formatting.getLanguageTag());
			var sLocale = oCurrentLocale.getLanguage();
			if (oCurrentLocale.getRegion()) {
				sLocale += "-" + oCurrentLocale.getRegion();
			}
			var oModel = new JSONModel({
				number: 123456.789,
				currency: "USD",
				unit: "speed-knot",
				formatOptions: {},
				type: "Integer",
				locales: FormatHelper.locales,
				localesSuggestions: FormatHelper.locales.map(function(sLocale) {
					return {name: sLocale};
				}),
				samples: aSamples,
				sample: "custom",
				locale: sLocale,
				cldrEntries: []
			});

			oModel.setSizeLimit(Infinity);

			var aValues = Object.keys(LocaleData.getInstance(oCurrentLocale).getUnitFormats()).map(function(sUnitCode) {
				return {name: sUnitCode};
			});
			oModel.setProperty("/cldrEntries", aValues);

			FormatHelper.bindHash(oModel, aHashParams, oSupportedOptions);

			// format options must be bound programmatically as the 'Options' type can't be configured in XML view
			this.byId("formatOptions").bindValue({
				path: "/formatOptions",
				type: new FormatHelper.Options(oSupportedOptions)
			});

			this.getView().setModel(oModel);
		},

		formatImageSrc: function(sLocale) {
			if (sLocale && sLocale.length > 3) {
				if (FormatHelper.territories.includes(sLocale.substr(3))) {
					return "flags/" + sLocale.substr(3) + ".png";
				}
			}
		},

		genericFormat: function(oNumber, sCurrency, sUnitCode, sType, oFormatOptions, sLocale) {
			var oLocale = new Locale(sLocale);
			var sFunctionName = "get" + sType + "Instance",
				oOptions = Object.assign({}, oFormatOptions),
				oNumberFormat = NumberFormat[sFunctionName](oOptions, oLocale);
			var sMeasure;
			if (sType == "Currency") {
				sMeasure = sCurrency;
			} else if (sType == "Unit") {
				sMeasure = sUnitCode;
			}
			return oNumberFormat.format(oNumber, sMeasure);
		},

		genericParse: function(oEvent) {
			var oSource = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var oModel = this.getView().getModel();
			var sLocale = oModel.getProperty("/locale");
			var oFormatOptions = oModel.getProperty("/formatOptions");
			var sType = oModel.getProperty("/type");
			var sFunctionName = "get" + sType + "Instance";
			var oLocale = new Locale(sLocale);
			var oOptions = Object.assign({}, oFormatOptions);
			var oNumberFormat = NumberFormat[sFunctionName](oOptions, oLocale);
			var aParsed = oNumberFormat.parse(sValue);
			if (Array.isArray(aParsed)) {
				oSource.setValueState("None");
				if (aParsed[0] != null) {
					oModel.setProperty("/number", aParsed[0]);
				}
				if (aParsed[1] != null) {
					if (sType == "Currency") {
						oModel.setProperty("/currency", aParsed[1]);
					} else if (sType == "Unit") {
						oModel.setProperty("/unit", aParsed[1]);
					}
				}
			} else if (aParsed) {
				oSource.setValueState("None");
				oModel.setProperty("/number", aParsed);
			} else if (!aParsed) {
				oSource.setValueState("Error");
			}

		},

		onFormatOptionChange: function(oEvent) {
			var oSource = oEvent.getSource(),
				sValue = oSource.getValue(),
				oValue;
			this.getView().getModel().setProperty("/sample", "custom");
			try {
				oValue = JSTokenizer.parseJS(sValue);
			} catch (e) {
				oSource.onChange(oEvent);
				return;
			}
			if (oSource.getValueState() === "Error" || !deepEqual(oValue, oSource.getBinding("value").getValue())) {
				oSource.onChange(oEvent);
			}
		},

		onTypeChange: function() {
			this.getView().getModel().setProperty("/sample", "custom");
		},

		onSampleChange: function(oEvent) {
			var oContext = oEvent.getParameter("selectedItem").getBindingContext();
			var oModel = this.getView().getModel();
			oModel.setProperty("/formatOptions", {});
			oModel.setProperty("/type", oContext.getProperty("type"));
			if (oContext.getProperty("unit")) {
				// if unit is specified in sample
				oModel.setProperty("/unit", oContext.getProperty("unit"));
			}
			oModel.setProperty("/formatOptions", oContext.getProperty("sample"));
		},

		onNumberLiveChange: function(oEvent) {
			// a number ending with "." is not valid
			if (!oEvent.getSource().getValue().endsWith(".")) {
				oEvent.getSource().onChange(oEvent);
			}
		},

		onCurrencyChange: function() {
			this.getView().getModel().setProperty("/sample", "custom");
		},

		onCurrencyLiveChange: function(oEvent) {
			oEvent.getSource().onChange(oEvent);
		},

		onUnitCodeChange: function() {
			this.getView().getModel().setProperty("/sample", "custom");
		},

		onUnitCodeLiveChange: function(oEvent) {
			oEvent.getSource().onChange(oEvent);
		},

		formatLocaleIcon: function(sLocale) {
			return "flags/" + sLocale.substr(3) + ".png";
		},

		onLocaleChange: function(oEvent) {
			this.getView().getModel().setProperty("/sample", "custom");
		},

		formatLocaleText: function(oNumber, sCurrency, sUnitCode, oFormatOptions, sType, sLocale) {
			var oLocale = new Locale(sLocale),
				sFunctionName = "get" + sType + "Instance",
				oOptions = Object.assign({}, oFormatOptions),
				oNumberFormat = NumberFormat[sFunctionName](oOptions, oLocale);
			var sMeasure;
			if (sType == "Currency") {
				sMeasure = sCurrency;
			} else if (sType == "Unit") {
				sMeasure = sUnitCode;
			}
			return oNumberFormat.format(oNumber, sMeasure);
		}
	});
});
