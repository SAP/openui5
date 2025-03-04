sap.ui.define([
	"sap/ui/core/Locale",
	"sap/ui/model/ParseException",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (Locale, ParseException, SimpleType, ValidateException) {
	"use strict";

	const aLocales = [
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

	return SimpleType.extend("local.LocaleType", {
		constructor: function(oFormatOptions, oConstraints) {
				SimpleType.call(this);
				this.sName = "LocaleType";
			},
			parseValue(sValue) {
				let oLocale;
				try {
					oLocale = new Locale(sValue);
				} catch (e) {
					throw new ParseException("Not a valid locale: " + e.message);
				}
				return oLocale.toString();
			},
			formatValue(oValue) {
				return new Locale(oValue).toString();
			},
			validateValue(sValue) {
				if (aLocales.includes(sValue)) {
					return true;
				}
				const oLocale = new Locale(sValue);
				if (oLocale.getRegion() && aLocales.includes(oLocale.getLanguage() + "-" + oLocale.getRegion())) {
					return true;
				}

				// As the list of locales above (aLocales) is not complete, but "curated", the best we can do
				// is to check for a locale with the same language. Regions might differ, but CLDR will fall
				// back to the language then, so basic support should exist.
				if (aLocales.some((oCandidate) => new Locale(oCandidate).getLanguage()) === oLocale.getLanguage()) {
					return true;
				}

				throw new ValidateException(`'${sValue}' is not a supported locale`);
			}
		}
	);
});