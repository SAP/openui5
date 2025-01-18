/*!
 * ${copyright}
 */

/**
 * @class LocaleHelper
 * @classdesc
 * A helper class for working with locales.
 * @private
 * @ui5-restricted sap.ui.documentation
 * @since 1.133.0
 * @namespace
 * @name sap.ui.documentation.sdk.controller.util.LocaleHelper
 * @returns {object} The LocaleHelper object.
 */
sap.ui.define([],
function() {
	"use strict";

	const mLanguageToRegion = {
		"ar": "SA",
		"bg": "BG",
		"ca": "ES",
		"cnr": "ME",
		"cs": "CZ",
		"cy": "GB",
		"da": "DK",
		"de": "DE",
		"el": "GR",
		"en": ["US", "GB"],
		"es": ["ES", "MX"],
		"et": "EE",
		"fi": "FI",
		"fr": ["FR", "CA"],
		"hi": "IN",
		"hr": "HR",
		"hu": "HU",
		"id": "ID",
		"it": "IT",
		"iw": "IL",
		"ja": "JP",
		"kk": "KZ",
		"ko": "KR",
		"lt": "LT",
		"lv": "LV",
		"mk": "MK",
		"ms": "MY",
		"nl": "NL",
		"no": "NO",
		"pl": "PL",
		"pt": ["BR", "PT"],
		"ro": "RO",
		"ru": "RU",
		"sh": "RS",
		"sk": "SK",
		"sl": "SI",
		"sr": "RS",
		"sv": "SE",
		"th": "TH",
		"tr": "TR",
		"uk": "UA",
		"vi": "VN",
		"zh": "CN"
	};

	return {

		hasRegion: function(sLocale) {
			return sLocale.indexOf("_") > -1;
		},

		appendDefaultRegion: function(sLocale) {
			if (this.hasRegion(sLocale)) {
				return sLocale;
			}
			var vRegion = mLanguageToRegion[sLocale];
			if (Array.isArray(vRegion)) {
				vRegion = vRegion[0];
			}
			return sLocale + "_" + vRegion;
		}
	};

});