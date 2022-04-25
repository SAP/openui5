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

var mTerritories = require("./resources/territories.json");

var aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cy", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY",
				"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
				"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
				"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
				"lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv",
				"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

/**
 * Generates the UI5 locale JSON files using the original JSON files.
 */
function Generator(sSourceFolder, sOutputFolder, bPrettyPrint, sCLDRVersion) {
	if (!(this instanceof Generator)) {
		return new Generator(sSourceFolder, sOutputFolder, bPrettyPrint, sCLDRVersion);
	}
	this._sSourceFolder = sSourceFolder;
	this._sOutputFolder = sOutputFolder;
	this._bPrettyPrint = bPrettyPrint;
	this._sCLDRVersion = sCLDRVersion;
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
		sTimestamp = new Date().toISOString(),
		sLicense = "This file has been derived from Unicode Common Locale Data Repository (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice in the Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit http://www.unicode.org/copyright.html",
		sFolderPathSupple = path.join(sSrcFolder, "cldr-core", "supplemental"),
		sFileName,
		oData,
		oResult = {},
		oOutputData,
		aTasks = [];

	util.setSupplePath(sFolderPathSupple);

	var mCurrencyDigits = util.getCurrencyDigits();

	// store previous IANA timezone IDs to be able
	// to compare them across all languages
	var aLastTimezoneIDs;

	aUI5Tags.forEach(function(sUI5Tag) {
		var sCLDRTag = getCLDRTag(sUI5Tag),
			sPathTag = sCLDRTag,
			sCalendarPref = util.getCalendarPreference(sCLDRTag),
			aSubTasks,
			oCurrencyFormat,
			oCurrencyFormatShort;

		// insert the license string and CLDR version info
		oResult = {
			"__license": sLicense,
			"__version": that._sCLDRVersion,
			"__buildtime": sTimestamp
		};

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


		// Overwrite CLDR information with consolidated territory information
		var mLocaleTerritory = mTerritories[sUI5Tag];
		if (mLocaleTerritory) {
			Object.keys(mLocaleTerritory).forEach(function(sKey) {
				oResult.territories[sKey] = mLocaleTerritory[sKey];
			});
		}


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

		/*
		 * The timezoneNames contains the timezone IDs in a JSON structure.
		 * Not all ABAP timezone IDs are represented in CLDR but some have a link to the same city,
		 * To have a unique mapping of keys to values we must replace the CLDR timezone ID with the
		 * respective ABAP timezone ID.
		 * e.g. America/Buenos_Aires (CLDR) -> America/Argentina/Buenos_Aires (ABAP)
		 */
		var oTimezoneNames = oResult["timezoneNames"];

		/*
		 * Not all ABAP timezone IDs are represented in CLDR but some have a link to the same city,
		 * To have a unique mapping of key to value, we must replace the CLDR timezone ID with the
		 * respective ABAP timezone ID.
		 * e.g. America/Buenos_Aires (CLDR) -> America/Argentina/Buenos_Aires (ABAP)
		 */
		var mABAP2CLDRIDs = {
			"America/Argentina/Buenos_Aires": "America/Buenos_Aires",
			"America/Argentina/Catamarca": "America/Catamarca",
			"America/Argentina/Cordoba": "America/Cordoba",
			"America/Argentina/Jujuy": "America/Jujuy",
			"America/Argentina/Mendoza": "America/Mendoza",
			"America/Indiana/Indianapolis": "America/Indianapolis",
			"America/Kentucky/Louisville": "America/Louisville",
			"Africa/Asmara": "Africa/Asmera",
			"Asia/Kathmandu": "Asia/Katmandu",
			"Asia/Kolkata": "Asia/Calcutta",
			"Atlantic/Faroe": "Atlantic/Faeroe",
			"Pacific/Pohnpei": "Pacific/Ponape",
			"Asia/Yangon": "Asia/Rangoon",
			"Pacific/Chuuk": "Pacific/Truk",
			"America/Nuuk": "America/Godthab",
			"Asia/Ho_Chi_Minh": "Asia/Saigon",
			"America/Atikokan": "America/Coral_Harbour"
		};
		// Missing ABAP timezone IDs (different location/city):
		// Pacific/Kanton -> ???
		// tz > Link	Pacific/Kanton		Pacific/Enderbury

		// replace CLDR keys with ABAP keys
		Object.keys(mABAP2CLDRIDs).forEach(function(sTimezoneABAP) {
			var sTimezoneCLDR = mABAP2CLDRIDs[sTimezoneABAP];

			// CLDR element in oTimezoneNames and key
			var aCLDRTimezones = sTimezoneCLDR.split("/");
			var sLastKeyCLDR = aCLDRTimezones.pop();
			var oCurrentElementCLDR = aCLDRTimezones.reduce(function(oPrevious, sKey) {
				return oPrevious[sKey];
			}, oTimezoneNames);

			// ABAP element in oTimezoneNames and key
			var aABAPTimezones = sTimezoneABAP.split("/");
			var sLastKeyABAP = aABAPTimezones.pop();
			var oCurrentElementABAP =  aABAPTimezones.reduce(function(oPrevious, sKey) {
				return oPrevious[sKey];
			}, oTimezoneNames);

			oCurrentElementABAP[sLastKeyABAP] = oCurrentElementCLDR[sLastKeyCLDR];
			delete oCurrentElementCLDR[sLastKeyCLDR];
		});

		// fix missing timezone translations
		if (["en-AU", "en-GB", "en-HK", "en-IE", "en-IN", "en-NZ", "en-PG", "en-SG", "en-ZA", "en"].includes(sCLDRTag)) {
			oTimezoneNames["Pacific"]["Honolulu"] = "Honolulu";
			oTimezoneNames["America"]["Santa_Isabel"] = "Santa Isabel";
		}

		// timezone translation data - use "_parent" key for the translation of the top level territories
		oTimezoneNames["America"]["_parent"] = oResult["territories"]["019"];
		// Argentina is the only sub territory for which the cities do not have the sub territory in their translation
		// therefore provide the territory manually
		oTimezoneNames["America"]["Argentina"]["_parent"] = oResult["territories"]["AR"];
		oTimezoneNames["Europe"]["_parent"] = oResult["territories"]["150"];
		oTimezoneNames["Africa"]["_parent"] = oResult["territories"]["002"];
		oTimezoneNames["Asia"]["_parent"] = oResult["territories"]["142"];
		oTimezoneNames["Australia"]["_parent"] = oResult["territories"]["AU"];
		oTimezoneNames["Antarctica"]["_parent"] = oResult["territories"]["AQ"];

		// Adjust Etc/UTC values
		var sLongUTC = oTimezoneNames["Etc"]["UTC"]["long"]["standard"];
		var sShortUTC = oTimezoneNames["Etc"]["UTC"]["short"]["standard"];
		oTimezoneNames["Etc"]["UTC"] = sShortUTC;
		oTimezoneNames["Etc"]["Universal"] = sLongUTC;


		// remove invalid IANA timezone ID
		delete oTimezoneNames["Etc"]["Unknown"];

		// delete tz backzone IDs
		delete oTimezoneNames["Australia"]["Currie"];
		delete oTimezoneNames["Pacific"]["Johnston"];
		delete oTimezoneNames["Pacific"]["Enderbury"];

		// sort
		oResult["timezoneNames"] = sort(oTimezoneNames);

		// consistency check
		// list of timezones must be consistent among all languages
		var aTimezoneIDs = getTimezoneIDs(oTimezoneNames);
		if (aLastTimezoneIDs && aLastTimezoneIDs.length !== aTimezoneIDs.length) {
			if (aLastTimezoneIDs.length > aTimezoneIDs.length) {
				var aMissingTimezoneIds = aLastTimezoneIDs.filter(function (sTimezoneId) {
					return !aTimezoneIDs.includes(sTimezoneId);
				});
				throw new Error("'" + sCLDRTag + "' keys missing in 'timezoneNames': " + aMissingTimezoneIds);
			} else {
				var aUnexpectedTimezoneIds = aTimezoneIDs.filter(function (sTimezoneId) {
					return !aLastTimezoneIDs.includes(sTimezoneId);
				});
				throw new Error("'" + sCLDRTag + "' keys unexpected in 'timezoneNames': " + aUnexpectedTimezoneIds);
			}
		}
		aLastTimezoneIDs = aTimezoneIDs;

		// ensure city names are unique to be able to uniquely format/parse them
		var aCityNames = getAllChildValues(oTimezoneNames);
		var aDuplicateCityNames = aCityNames.filter(function(sCityName, iIndex) {
			return aCityNames.indexOf(sCityName) !== iIndex;
		});
		if (aDuplicateCityNames.length) {
			throw new Error("'" + sCLDRTag + "' contains duplicates in 'timezoneNames': " + aDuplicateCityNames);
		}

		// adjust Timezone appendItems for zh-Hans to avoid conflicts in parsing:
		// <code>"Timezone": "{1}{0}",</code> has no spaces
		// Without spaces "GMT+11995" cannot be distinguished, because there is GMT+1 and GMT+11.
		// unfortunately gmtFormat is calendar specific, therefore it cannot be adjusted more specifically
		if (sCLDRTag.startsWith("zh-Hans-")) {
			oResult["ca-gregorian"]["dateTimeFormats"]["appendItems"]["Timezone"] = "{1} {0}";
		}

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

	function getAllChildValues(node) {
		var aResult = [];
		Object.keys(node).forEach(function(sChildKey) {
			if (typeof node[sChildKey] === "object") {
				aResult = aResult.concat(getAllChildValues(node[sChildKey]));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(node[sChildKey]);
			}
		});
		return aResult;
	}

	function getTimezoneIDs(node, sKey) {
		var aResult = [];
		sKey = sKey || "";
		Object.keys(node).forEach(function(sChildKey) {
			if (typeof node[sChildKey] === "object") {
				aResult = aResult.concat(getTimezoneIDs(node[sChildKey], sKey + sChildKey + "/"));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(sKey + sChildKey);
			}
		});
		return aResult;
	}

	function sort(node) {
		var oNewObject = {};
		var aKeys = Object.keys(node);
		aKeys.sort();
		aKeys.forEach(function(sKey) {
			if (typeof node[sKey] === "object") {
				oNewObject[sKey] = sort(node[sKey]);
			} else {
				oNewObject[sKey] = node[sKey];
			}
		});
		return oNewObject;
	}

	return this;
};

module.exports = Generator;
