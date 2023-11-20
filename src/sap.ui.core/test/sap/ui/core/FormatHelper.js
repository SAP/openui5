sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/ListItemBase",
	"sap/m/Text",
	"sap/base/util/deepEqual",
	"sap/base/util/JSTokenizer",
	"sap/ui/core/Locale",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/CompositeType",
	"sap/ui/model/ParseException",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (Button, Dialog, ListItemBase, Text, deepEqual, JSTokenizer, Locale, UI5Date,
		NumberFormat, CompositeBinding, CompositeType, ParseException, SimpleType, ValidateException
) {
	"use strict";

	var aLocales = [
		"ar-SA",
		"da-DK",
		"de-DE",
		"en-GB",
		"en-US",
		"es-MX",
		"es-ES",
		"fa-IR",
		"fr-FR",
		"ja-JP",
		"id-ID",
		"it-IT",
		"he-IL",
		"hi-IN",
		"ko-KR",
		"ms-SG",
		"nl-NL",
		"pl-PL",
		"pt-BR",
		"ro-RO",
		"ru-RU",
		"th-TH",
		"tr-TR",
		"zh-CN",
		"zh-TW"
	];

	var aRTLLocales = [
		"ar-SA",
		"fa-IR",
		"he-IL"
	];

	var aTerritories = aLocales.map(function(sLocale) {
		if (sLocale === "zh-TW") {
			return;
		}
		return sLocale.slice(3);
	}).filter(Boolean);

	var LocaleListItem = ListItemBase.extend("LocaleListItem", {
		metadata: {
			properties: {
				locale: {type: "string"},
				text: {type: "string"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRM, oControl) {
				var sLocale = oControl.getLocale(),
					sText = oControl.getText();

				oRM.openStart("div", oControl)
					.style("display", "flex")
					.style("align-items", "center")
					.style("height", "40px")
					.openEnd();

					if (aTerritories.includes(sLocale.substr(3))) {
						oRM.voidStart("img")
							.attr("title", sLocale)
							.attr("src", "flags/" + sLocale.substr(3) + ".png")
							.style("width", "30px")
							.style("margin", "10px")
							.voidEnd();
					} else {
						oRM.voidStart("div")
							.style("width", "30px")
							.style("margin", "10px")
							.voidEnd();
					}
					oRM.openStart("span")
						.style("margin", "0 5px")
						.openEnd()
						.text("\"" + sLocale + "\"")
						.close("span");
					oRM.openStart("span");
					if (aRTLLocales.indexOf(sLocale) >= 0) {
						oRM.attr("dir", "rtl");
					}
					oRM.openEnd();
					oRM.text(sText);
					oRM.close("span");

				oRM.close("div");
			}
		}
	});

	function indent(iDepth) {
		var sResult = "";
		for (var i = 0; i < iDepth; i++) {
			sResult += " ";
		}
		return sResult;
	}

	function formatValue(oValue) {
		switch (typeof oValue) {
			case "string":
				return "\"" + oValue + "\"";
			default:
				return oValue;
		}
	}

	function formatObject(oObject, bFormatted, iDepth, sResult) {
		var sName, oValue, bFirst = true;
		if (!iDepth) {
			iDepth = 0;
		}
		if (!sResult) {
			sResult = "";
		}
		if (Array.isArray(oObject)) {
			sResult += "[";
			for (var i = 0; i < oObject.length; i++) {
				oValue = oObject[i];
				if (bFirst) {
					bFirst = false;
				} else {
					sResult += "," + (bFormatted ? " " : "");
				}
				sResult += formatValue(oValue);
			}
			sResult += "]";
		} else {
			sResult += "{" + (bFormatted ? "\n" : "");
			for (sName in oObject) {
				oValue = oObject[sName];
				if (bFirst) {
					bFirst = false;
				} else {
					sResult += "," + (bFormatted ? "\n" : "");
				}
				if (bFormatted) {
					sResult += indent(iDepth + 1);
				}

				//ensure keys which contain non-word characters [A-Za-z0-9_] are double quoted
				if (!/^\w+$/.test(sName)) {
					sName = "\"" + sName + "\"";
				}

				sResult += sName + ":" + (bFormatted ? " " : "");
				if (typeof oValue === "object") {
					sResult += formatObject(oValue, bFormatted, iDepth + 1);
				} else {
					sResult += formatValue(oValue);
				}
			}
			sResult += (bFormatted ? "\n" : "");
			if (bFormatted) {
				sResult += indent(iDepth - 1);
			}
			sResult += "}";
		}
		return sResult;
	}

	function validateFormatOptions(oOptions, oSupportedOptions) {
		var oOption, vValue, bError;
		for (var sName in oOptions) {
			oOption = oSupportedOptions[sName];
			if (!oOption) {
				return "Unknown format option \"" + sName + "\"";
			}
			vValue = oOptions[sName];
			bError = false;
			switch (oOption.type) {
				case "enum":
					bError = (typeof vValue !== "string") || oOption.values.indexOf(vValue) === -1;
					break;
				case "int":
					bError = (typeof vValue !== "number") || Math.floor(vValue) !== vValue || (oOption.min !== undefined && vValue < oOption.min);
					break;
				case "float":
					bError = (typeof vValue !== "number") || (oOption.hasOwnProperty("min") && vValue < oOption.min);
					break;
				case "string":
					bError = (typeof vValue !== "string") || (oOption.regex && !oOption.regex.test(vValue));
					break;
				case "boolean":
					bError = vValue !== true && vValue !== false;
					break;
			}
			if (bError) {
				return "Invalid value \"" + vValue + "\" for format option \"" + sName + "\". " + oOption.help;
			}
		}
	}

	var Options = SimpleType.extend("Options", {
		constructor: function(oSupportedOptions) {
			SimpleType.apply(this, arguments);
			this.sName = "Options";
			this.oSupportedOptions = oSupportedOptions;
		},
		parseValue: function(sValue) {
			var oFormatOptions;
			try {
				oFormatOptions = JSTokenizer.parseJS(sValue);
			} catch (e) {
				throw new ParseException("Could not parse format options: " + e.message);
			}
			return oFormatOptions;
		},
		formatValue: function(oValue) {
			return formatObject(oValue, true);
		},
		validateValue: function(oOptions) {
			var sError = validateFormatOptions(oOptions, this.oSupportedOptions);
			if (sError) {
				throw new ValidateException(sError);
			}
			return true;
		}
	});

	var LocaleType = SimpleType.extend("local.LocaleType", {
		constructor: function() {
			SimpleType.call(this);
			this.sName = "LocaleType";
		},
		parseValue: function(sValue) {
			var oLocale;
			try {
				oLocale = new Locale(sValue);
			} catch (e) {
				throw new ParseException("Not a valid locale: " + e.message);
			}
			return oLocale.toString();
		},
		formatValue: function(oValue) {
			return new Locale(oValue).toString();
		},
		validateValue: function(sValue) {
			if ( aLocales.includes(sValue) ) {
				return true;
			}
			var oLocale = new Locale(sValue);
			if ( oLocale.getRegion() && aLocales.includes(oLocale.getLanguage() + "-" + oLocale.getRegion()) ) {
				return true;
			}

			// As the list of locales above (aLocales) is not complete, but "curated", the best we can do
			// is to check for a locale with the same language. Regions might differ, but CLDR will fall
			// back to the language then, so basic support should exist.
			if ( aLocales.some(
					function(oCandidate) {
						return (new Locale(oCandidate).getLanguage()) === oLocale.getLanguage();
					}) ) {
				return true;
			}

			throw new ValidateException("'" + sValue + "' is not a supported locale");
		}
	});

	var HashParams = CompositeType.extend("HashParams", {
		constructor: function(aParams, oSupportedOptions) {
			CompositeType.apply(this, arguments);
			this.sName = "HashParams";
			this.aParams = aParams;
			this.oSupportedOptions = oSupportedOptions;
			this.bUseRawValues = true;
		},
		parseValue: function(sValue) {
			var aParts = sValue.substr(1).split("&"),
				oParams = {}, aParams, vValue;
			aParts.forEach(function(oParam) {
				var aSplit = oParam.split("="),
					sName = aSplit[0],
					vValue = decodeURIComponent(aSplit[1]);
				if (sName === "formatOptions") {
					vValue = JSTokenizer.parseJS(vValue);
				}
				if (sName === "date" || sName === "todate") {
					vValue = UI5Date.getInstance(parseFloat(vValue));
				}
				if (sName === "number") {
					vValue = NumberFormat.getFloatInstance({
						groupingEnabled: false,
						groupingSeparator: ",",
						decimalSeparator: ".",
						parseAsString: true
					}).parse(vValue);
				}
				oParams[sName] = vValue;
			});
			aParams = this.aParams.map(function(oParam) {
				vValue = oParams[oParam.name];
				return vValue === undefined ? oParam.default : vValue;
			});
			return aParams;
		},
		formatValue: function(aValue) {
			var aParams = [];
			this.aParams.forEach(function(oParam, iIndex) {
				var vValue = aValue[iIndex];
				if (oParam.name === "formatOptions") {
					vValue = formatObject(vValue);
				}
				if (oParam.name === "date" || oParam.name === "todate") {
					vValue = vValue.valueOf();
				}
				if (!deepEqual(vValue, oParam.default)) {
					aParams.push(oParam.name + "=" + encodeURIComponent(vValue));
				}
			});
			return "#" + aParams.join("&");
		},
		validateValue: function(aValue) {
			var sError;
			this.aParams.forEach(function(oParam, iIndex) {
				var vValue = aValue[iIndex];
				if (oParam.name === "formatOptions") {
					sError = validateFormatOptions(vValue, this.oSupportedOptions);
				}
			}.bind(this));
			if (sError) {
				throw new ValidateException(sError);
			}
			return true;
		}
	});

	function bindHash(oModel, aHashParams, oSupportedOptions) {
		var aHashBindings = aHashParams.map(function(sParam) {
			return oModel.bindProperty("/" + sParam.name);
		});
		var oHashBinding = new CompositeBinding(aHashBindings, true);
		oHashBinding.setType(new HashParams(aHashParams, oSupportedOptions));
		oHashBinding.attachChange(function() {
			location.hash = oHashBinding.getExternalValue();
		});
		window.addEventListener("hashchange", function() {
			try {
				oHashBinding.setExternalValue(location.hash);
			} catch (e) {
				showError("Parse Error", "Could not parse hash: " + e.message);
			}
		});
		try {
			oHashBinding.setExternalValue(location.hash);
		} catch (e) {
			showError("Parse Error", "Could not parse hash: " + e.message);
		}
	}

	function showError(sTitle, sMessage) {
		var dialog = new Dialog({
			title: sTitle,
			type: 'Message',
			state: 'Error',
			content: new Text({
				text: sMessage
			}),
			beginButton: new Button({
				text: 'OK',
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});
		dialog.open();
	}

	return {
		bindHash: bindHash,
		locales: aLocales,
		territories: aTerritories,
		LocaleListItem: LocaleListItem,
		Options: Options,
		LocaleType: LocaleType
	};
});