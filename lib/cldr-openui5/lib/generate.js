require('coffee-script/register');

var nodeUtil = require("util"),
	events = require("events"),
	path = require("path"),
	fs = require("fs"),
	j2j = require('json2json'),
	extend = require('extend'),
	mkdirp = require("mkdirp"),
	async = require("async"),
	configs = require("./config.js"),
	util = require("./util.js"),
	trailingCurrencyCodeFormatter = require("./trailingCurrencyCodeFormatter.js"),
	fileContent = require("./fileContent.js");

var aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY",
				"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
				"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
				"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
				"lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sv",
				"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

/**
 * Generates the UI5 locale JSON files using the original JSON files.
 */
function Generator(sSourceFolder, sOutputFolder, bPrettyPrint) {
	if (!(this instanceof Generator)) {
		return new Generator(sSourceFolder, sOutputFolder, bPrettyPrint);
	}
	this._sSourceFolder = sSourceFolder;
	this._sOutputFolder = sOutputFolder;
	this._bPrettyPrint = bPrettyPrint;
	events.EventEmitter.call(this);
}

function getCLDRTag(sUI5Tag) {
	switch (sUI5Tag) {
		case "zh_CN": return "zh-Hans-CN";
		case "zh_SG": return "zh-Hans-SG";
		case "zh_TW": return "zh-Hant-TW";
		case "zh_HK": return "zh-Hans-HK";
		default: return sUI5Tag.replace(/_/, "-");
	}
}

nodeUtil.inherits(Generator, events.EventEmitter);

Generator.prototype.start = function() {
	var sSrcFolder = this._sSourceFolder,
		sOutputFolder = this._sOutputFolder,
		that = this,
		sLicense = "This file has been derived from Unicode Common Locale Data Repository (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice in the Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit http://www.unicode.org/copyright.html",
		sFolderPathSupple = path.join(sSrcFolder, "cldr-core", "supplemental"),
		sFileName,
		oData,
		oResult = {},
		oOutputData,
		aTasks = [];

	util.setSupplePath(sFolderPathSupple);

	var mCurrencyDigits = util.getCurrencyDigits();

	aUI5Tags.forEach(function(sUI5Tag) {
		var sCLDRTag = getCLDRTag(sUI5Tag),
			sPathTag = sCLDRTag,
			sCalendarPref = util.getCalendarPreference(sCLDRTag),
			aSubTasks,
			oCurrencyFormat,
			oCurrencyFormatShort;

		// insert the license string
		oResult = {"__license": sLicense};

		// process each of the configs
		configs.forEach(function(mConfig) {
			// Ugly file path fallback, latest CLDR does not contain CN/TW files anymore
			if (sCLDRTag == "zh-Hans-CN") {
				sPathTag = "zh-Hans";
			}
			if (sCLDRTag == "zh-Hant-TW") {
				sPathTag = "zh-Hant";
			}
			sFileName = path.join(sSrcFolder, mConfig.packageName, "main", sPathTag, mConfig.fileName);
			oData = fileContent.getContent(sFileName).main[sPathTag];
			oOutputData = new j2j.ObjectTemplate(mConfig.template).transform(oData);
			// extends the result with transformed data using the config
			extend(true, oResult, oOutputData);
		});

		// SAP trailing currency format for currency codes (ISO)
		// duplicate currency formatting information and ensure that currency symbol is positioned
		// next to the number (trailing): "¤ 00" -> "00 ¤"
		// since this might lead to strange output e.g. "100KUSD", a space between currency code and number is inserted "¤00K" -> "00K ¤"
		var sCurrencySpacingBefore = oResult.currencyFormat.currencySpacing.beforeCurrency.insertBetween;

		var sStandardTrailing;
		var sAccountingTrailing;
		var oCurrencyFormatShortTrailing = {};

		// RTL characters:
		// http://unicode.org/reports/tr9/

		// Workaround for Arabic currency format issues

		// plain-standard:  ¤   SPACE   #
		// plain-short:     ¤   SPACE   #       ARABIC-SCALE

		// standard:    RLE ¤       LRM     PDF     SPACE   #
		// short:       RLE ¤       LRM     PDF     SPACE   #   ARABIC-SCALE

		// converted to "fa" format it uses also the ARABIC-SCALE, while "he" has LATIN-SCALE
		// Bidirectional markers/expressions behave different for LATIN/ARABIC characters
		// sap-standard:    #   SPACE   LRE     ¤   PDF
		// sap-short:       #   SPACE   ARABIC-SCALE  SPACE   LRE     ¤   PDF

		// short:       ‫SAR‎‬ 10 ألف
		if (sCLDRTag.indexOf("ar") === 0) {
			oCurrencyFormat = oResult.currencyFormat;
			sStandardTrailing = trailingCurrencyCodeFormatter.transformCurrencyPattern(oCurrencyFormat.standard, sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
			sAccountingTrailing = trailingCurrencyCodeFormatter.transformCurrencyPattern(oCurrencyFormat.accounting, sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
			oCurrencyFormat.standard = oCurrencyFormat.standard.replace(/¤/g, "\u202b¤\u200e\u202c");
			oCurrencyFormat.accounting = oCurrencyFormat.accounting.replace(/¤/g, "\u202b¤\u200e\u202c");
			oCurrencyFormatShort = oResult["currencyFormat-short"];
			Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
				oCurrencyFormatShortTrailing[sKey] = trailingCurrencyCodeFormatter.transformShortCurrencyPattern(oCurrencyFormatShort[sKey], sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
				oCurrencyFormatShort[sKey] = oCurrencyFormatShort[sKey].replace(/¤/g, "\u202b¤\u200e\u202c");
			});
		}
		// Workaround for Persian currency format issues
		// standard:    LRM     LRE     ¤       PDF     SPACE   #
		// short:       #       SPACE   ARABIC-SCALE   SPACE   LRE     ¤   PDF

		// sap-standard:    LRM     LRE     ¤       PDF     SPACE   #
		// sap-short:       #       SPACE   ARABIC-SCALE   SPACE   LRE     ¤   PDF

		// short:       10 هزار ‪IRR‬
		if (sCLDRTag.indexOf("fa") === 0) {
			oCurrencyFormat = oResult.currencyFormat;
			// wrap currency placeholder in LRE and PDF -> LRE ¤ PDF
			oCurrencyFormat.standard = oCurrencyFormat.standard.replace(/¤/g, "\u202a¤\u202c");
			oCurrencyFormat.accounting = oCurrencyFormat.accounting.replace(/¤/g, "\u202a¤\u202c");
			sStandardTrailing = oCurrencyFormat.standard;
			sAccountingTrailing = oCurrencyFormat.accounting;
			oCurrencyFormatShort = oResult["currencyFormat-short"];
			Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
				oCurrencyFormatShort[sKey] = oCurrencyFormatShort[sKey].replace(/¤/g, "\u202a¤\u202c");
				oCurrencyFormatShortTrailing[sKey] = oCurrencyFormatShort[sKey];
			});
		}
		// Workaround for Hebrew currency format issues
		// standard:    RLM #   SPACE   ¤   LRM
		// short:       LRM ¤   SPACE   #   LATIN-SCALE

		// sap-standard:    RLM #   SPACE   ¤   LRM
		// sap-short:       LRM ¤   SPACE   #   LATIN-SCALE

		// short:   ‎ILS 10K
		if (sCLDRTag.indexOf("he") === 0) {
			oCurrencyFormat = oResult.currencyFormat;
			oCurrencyFormat.standard = oCurrencyFormat.standard.replace(/¤/g, "¤\u200e");
			oCurrencyFormat.accounting = oCurrencyFormat.accounting.replace(/¤/g, "¤\u200e");
			sStandardTrailing = oCurrencyFormat.standard;
			sAccountingTrailing = oCurrencyFormat.accounting;
			oCurrencyFormatShort = oResult["currencyFormat-short"];
			Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
				oCurrencyFormatShort[sKey] = oCurrencyFormatShort[sKey].replace(/¤/g, "\u200e¤");
				oCurrencyFormatShortTrailing[sKey] = oCurrencyFormatShort[sKey];
			});
		}
		// Fix broken indian short currency patterns
		if (sCLDRTag === "en-IN") {
			oResult["currencyFormat-short"] = {
				"1000-one": "¤0K",
				"1000-other": "¤0K",
				"10000-one": "¤00K",
				"10000-other": "¤00K",
				"100000-one": "¤000K",
				"100000-other": "¤000K",
				"1000000-one": "¤0M",
				"1000000-other": "¤0M",
				"10000000-one": "¤00M",
				"10000000-other": "¤00M",
				"100000000-one": "¤000M",
				"100000000-other": "¤000M",
				"1000000000-one": "¤0B",
				"1000000000-other": "¤0B",
				"10000000000-one": "¤00B",
				"10000000000-other": "¤00B",
				"100000000000-one": "¤000B",
				"100000000000-other": "¤000B",
				"1000000000000-one": "¤0T",
				"1000000000000-other": "¤0T",
				"10000000000000-one": "¤00T",
				"10000000000000-other": "¤00T",
				"100000000000000-one": "¤000T",
				"100000000000000-other": "¤000T"
			};
		}


		// SAP specific format for "standard" and "accounting"
		oResult.currencyFormat["sap-standard"] = sStandardTrailing || trailingCurrencyCodeFormatter.transformCurrencyPattern(oResult.currencyFormat.standard, sCurrencySpacingBefore);
		oResult.currencyFormat["sap-accounting"] = sAccountingTrailing || trailingCurrencyCodeFormatter.transformCurrencyPattern(oResult.currencyFormat.accounting, sCurrencySpacingBefore);

		// SAP specific format for style "short"
		oCurrencyFormatShort = oResult["currencyFormat-short"];
		var oCurrencyFormatShortTrailingResult = oResult["currencyFormat-sap-short"] = {};
		Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
			oCurrencyFormatShortTrailingResult[sKey] = oCurrencyFormatShortTrailing[sKey] || trailingCurrencyCodeFormatter.transformShortCurrencyPattern(oCurrencyFormatShort[sKey], sCurrencySpacingBefore);
		});

		// extend result with static data:
		//	currencyDigits
		//  pluralRules
		//	weekData
		//  calendarData
		extend(oResult, {currencyDigits: mCurrencyDigits});
		extend(oResult, util.getPluralRules(sCLDRTag));
		extend(oResult, util.getWeekData(sCLDRTag));
		extend(oResult, util.getTimeData(sCLDRTag));
		extend(oResult, util.getCalendarData());

		if (sCalendarPref) {
			// if calendar preference exits, also extend the result with it
			extend(oResult, {
				"calendarPreference": sCalendarPref
			});
		}

		fileContent.clearCache();

		// The following two tasks are run in series: create folder and write file
		aSubTasks = [
			function(callback) {
				mkdirp(sOutputFolder, function(err) {
					callback(err);
				});
			},
			(function(r) {
				return function(callback) {
					var sPath = path.resolve(path.join(sOutputFolder, sUI5Tag + '.json'));
					fs.writeFile(sPath, JSON.stringify(r, null, that._bPrettyPrint ? '\t' : 0), function(err) {
						callback(err, sPath);
					});
				};
			})(oResult)
		];

		// The task for writing each JSON file is done in parallel with the other file writing
		aTasks.push(function(callback) {
			// execute the aSubTasks
			async.series(aSubTasks, function(err, results) {
				if (!err) {
					that.emit("localeJSONReady", results[1]);
				} else {
					that.emit("error", err);
				}
				callback(err, results[1]);
			});
		});
	});

	// execute the aTasks
	async.parallel(aTasks, function(err, results) {
		if (!err) {
			that.emit("allLocaleJSONReady", results);
		} else {
			that.emit("error", err);
		}
	});

	return this;
};

module.exports = Generator;
