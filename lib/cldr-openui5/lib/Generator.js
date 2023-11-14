import { EventEmitter } from "node:events";
import { join, resolve } from "node:path";
import fs from "node:fs";
import j2j from "json2json";
import extend from "extend";
import { parallel, series } from "async";
import configs from "./config.js";
import util from "./util.js";
import { transformCurrencyPattern, transformShortCurrencyPattern } from "./trailingCurrencyCodeFormatter.js";
import fileContent from "./fileContent.js";
import Territories from "./Territories.js";
import LegacyUnitKeyMapping from "./LegacyUnitKeyMapping.js";
import Timezones from "./Timezones.js";

/*
 * Some CLDR timezone IDs are outdated, while ABAP systems know the up-to-date version of
 * the corresponding ID. The below map represents the (bijective) mapping of ABAP to CLDR
 * IDs and is used to consistently use the up-to-date ABAP timezone IDs and respectively replace the
 * corresponding CLDR ID if required.
 * The inverted mapping of CLDR timezone ID to ABAP timezone ID is required in openui5
 * runtime code in TimezoneUtils.getLocalTimezone. The method must always return up-to-date
 * (ABAP) timezone IDs.
 * Sample mapping: America/Buenos_Aires (CLDR) <-> America/Argentina/Buenos_Aires (ABAP)
 */
const mABAP2CLDRIDs = {
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

/*
 * CLDR defines for short number formats, in locale en-IN, the Laksh/Crore variant by default.
 * The UI5 customers prefer the european decimal short formats for their numbers.
 * These objects are used to overwrite the CLDR Laksh/Crore short formats in the en-IN locales.
 */
// If possible in future CLDR versions, remove this hard coded attributes for currencyFormats for en_IN
const oIndianCurrencyFormatShort = {
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

// If possible in future CLDR versions, remove this hard coded attributes for decimalFormats for en_IN
const oIndiaDecimalFormatShort = {
	"1000-one": "0K",
	"1000-other": "0K",
	"10000-one": "00K",
	"10000-other": "00K",
	"100000-one": "000K",
	"100000-other": "000K",
	"1000000-one": "0M",
	"1000000-other": "0M",
	"10000000-one": "00M",
	"10000000-other": "00M",
	"100000000-one": "000M",
	"100000000-other": "000M",
	"1000000000-one": "0B",
	"1000000000-other": "0B",
	"10000000000-one": "00B",
	"10000000000-other": "00B",
	"100000000000-one": "000B",
	"100000000000-other": "000B",
	"1000000000000-one": "0T",
	"1000000000000-other": "0T",
	"10000000000000-one": "00T",
	"10000000000000-other": "00T",
	"100000000000000-one": "000T",
	"100000000000000-other": "000T"
};

// if a segment of a time zone ID starts with lower case it has to be checked and maybe replaced
const rUnusualTimezoneID = /(^[a-z]|\/[a-z])/;

const aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "cy", "da", "de", "de_AT", "de_CH", "el", "el_CY",
	"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
	"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
	"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
	"lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv",
	"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

/**
 * Generates the UI5 locale JSON files using the original JSON files.
 *
 * @param {string} sSourceFolder
 *   Path to the source folder where the latest downloaded CLDR data is located
 * @param {string} sOutputFolder
 *   Path where the generated JSON locale files should be written
 * @param {string} sCLDRVersion
 *   Version of the CLDR data
 */
export default class Generator extends EventEmitter {
	constructor(sSourceFolder, sOutputFolder, sCLDRVersion) {
		super();
		this._sCLDRVersion = sCLDRVersion;
		// As of V43 we fill this array with the TZ IDs of the 'ar' locale
		this._aCompleteCLDRTimezoneIDs = [];
		this._oLegacyUnitMapper = new LegacyUnitKeyMapping(aUI5Tags);
		this._sOutputFolder = sOutputFolder;
		this._sSourceFolder = sSourceFolder;
		this._aTasks = [];
		this._oTerritories = new Territories();
		this._sTimestamp = new Date().toISOString();
		this._oTimezones = new Timezones();
		// store previous IANA timezone IDs to be able to compare them across all languages
		this._aLastTimezoneIDs = [];
	}

	/**
	 * Checks whether the time zone names are unique and whether the time zone IDs are as expected
	 * and the IDs for the current locale are the same as for the previous locale.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale
	 * @throws {Error}
	 *   If time zones are inconsistent over all languages, or if there are duplicate time zone names
	 */
	checkTimezonesConsistency(sCLDRTag, oTimezoneNames) {
		Generator.checkTimezoneNames(sCLDRTag, oTimezoneNames);

		const aTimezoneIDs = Generator.getTimezoneIDs(oTimezoneNames);
		if (this._aLastTimezoneIDs.length !== 0) {
			const aMissingTimezoneIDs = this._aLastTimezoneIDs.filter((sTimezoneId) => {
				return !aTimezoneIDs.includes(sTimezoneId);
			});
			const aUnexpectedTimezoneIDs = aTimezoneIDs.filter((sTimezoneId) => {
				return !this._aLastTimezoneIDs.includes(sTimezoneId);
			});
			if (aMissingTimezoneIDs.length || aUnexpectedTimezoneIDs.length) {
				throw new Error("'" + sCLDRTag + "' has inconsistent time zone IDs; missing IDs: "
					+ aMissingTimezoneIDs + "; unexpected IDs: " + aUnexpectedTimezoneIDs);
			}
		}
		this._aLastTimezoneIDs = aTimezoneIDs;
	}

	/**
	 * Cleans the file content cache and adds tasks for creating the directory and writing the
	 * the given <code>oResult</code> as JSON file for the given UI5 language tag.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH" or "sr_Latn"
	 * @param {Object<string,any>} oResult
	 *   The resulting CLDR object for the given language
	 */
	cleanupFileCacheAndWriteResult(sUI5Tag, oResult) {
		fileContent.clearCache();

		const aSubTasks = [
			(callback) => {
				fs.mkdir(this._sOutputFolder, {recursive: true}, (err) => {
					callback(err);
				});
			},
			(callback) => {
				const sPath = resolve(join(this._sOutputFolder, sUI5Tag + ".json"));
				fs.writeFile(sPath, JSON.stringify(oResult, null, "\t"), (err) => {
					callback(err, sPath);
				});
			}
		];

		this._aTasks.push((callback) => {
			series(aSubTasks, (err, results) => {
				if (!err) {
					this.emit("localeJSONReady", results[1]);
				} else {
					this.emit("error", err);
				}
				callback(err, results[1]);
			});
		});
	}

	async start() {
		const sFolderPathSupple = join(this._sSourceFolder, "cldr-core", "supplemental");

		util.setSupplePath(sFolderPathSupple);
		await this._oLegacyUnitMapper.importOldUnits(this._sOutputFolder);
		this._oTimezones.updateTimezones(mABAP2CLDRIDs);
		// Generate the CLDR JSON files
		aUI5Tags.forEach((sUI5Tag) => this.generateLocaleFile(sUI5Tag));

		this._aTasks.push(async () => {
			await this._oTerritories.writeTerritoriesCache();
			await this._oLegacyUnitMapper.writeUnitMappingToLocaleData();
			await this._oTimezones.ready();
		});

		// execute the this._aTasks
		parallel(this._aTasks, (err, results) => {
			if (!err) {
				this.emit("allLocaleJSONReady", results);
			} else {
				this.emit("error", err);
			}
		});

		return this;
	}

	/**
	 * Core function which generates the CLDR data result for a specific locale.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH" or "sr_Latn"
	 */
	generateLocaleFile(sUI5Tag) {
		const sCLDRTag = Generator.getCLDRTag(sUI5Tag);
		const sParentLocaleTag = Generator.getParentLocaleTag(this._sSourceFolder, sCLDRTag);
		// insert the license string and CLDR version info
		const oResult = {
			"__license": "This file has been derived from Unicode Common Locale Data Repository (CLDR) files"
			+ " (http://cldr.unicode.org). See the copyright and permission notice in the"
			+ " Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit"
			+ " http://www.unicode.org/copyright.html",
			"__version": this._sCLDRVersion,
			"__buildtime": this._sTimestamp
		};

		// process each of the configs
		configs.forEach((mConfig) => {
			Generator.processConfigTemplates(this._sSourceFolder, mConfig, sCLDRTag, oResult, sParentLocaleTag);
		});

		// Overwrite CLDR information with consolidated territory information
		this._oTerritories.updateLocaleTerritories(oResult, sUI5Tag);

		// Check CLDR information for renamed unit keys
		this._oLegacyUnitMapper.analyseUnits(oResult, sUI5Tag);

		// SAP trailing currency format for currency codes (ISO)
		// duplicate currency formatting information and ensure that currency symbol is positioned
		// next to the number (trailing): "¤ 00" -> "00 ¤"
		// since this might lead to strange output e.g. "100KUSD", a space between currency code and number is
		// inserted "¤00K" -> "00K ¤"
		const sCurrencySpacingBefore = oResult.currencyFormat.currencySpacing.beforeCurrency.insertBetween;
		const oCurrencyFormatShortTrailing = {};
		let sAccountingTrailing;
		let oCurrencyFormat;
		let oCurrencyFormatShort;
		let sStandardTrailing;

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

		// short:       \u202bSAR\u200e\u202c 10 ألف
		if (sCLDRTag.indexOf("ar") === 0) {
			oCurrencyFormat = oResult.currencyFormat;
			sStandardTrailing = transformCurrencyPattern(oCurrencyFormat.standard, sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
			sAccountingTrailing = transformCurrencyPattern(oCurrencyFormat.accounting, sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
			oCurrencyFormat.standard = oCurrencyFormat.standard.replace(/¤/g, "\u202b¤\u200e\u202c");
			oCurrencyFormat.accounting = oCurrencyFormat.accounting.replace(/¤/g, "\u202b¤\u200e\u202c");
			oCurrencyFormatShort = oResult["currencyFormat-short"];
			Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
				oCurrencyFormatShortTrailing[sKey] = transformShortCurrencyPattern(oCurrencyFormatShort[sKey], sCurrencySpacingBefore).replace(/¤/g, "\u202a¤\u202c");
				oCurrencyFormatShort[sKey] = oCurrencyFormatShort[sKey].replace(/¤/g, "\u202b¤\u200e\u202c");
			});
		}
		// Workaround for Persian currency format issues
		// standard:    LRM     LRE     ¤       PDF     SPACE   #
		// short:       #       SPACE   ARABIC-SCALE   SPACE   LRE     ¤   PDF

		// sap-standard:    LRM     LRE     ¤       PDF     SPACE   #
		// sap-short:       #       SPACE   ARABIC-SCALE   SPACE   LRE     ¤   PDF

		// short:       10 هزار \u202aIRR\u202c
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

		// short:   \u200eILS 10K
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
			oResult["currencyFormat-short"] = oIndianCurrencyFormatShort;
			oResult["decimalFormat-short"] = oIndiaDecimalFormatShort;
		}

		// SAP specific format for "standard" and "accounting"
		oResult.currencyFormat["sap-standard"] = sStandardTrailing
			|| transformCurrencyPattern(oResult.currencyFormat.standard, sCurrencySpacingBefore);
		oResult.currencyFormat["sap-accounting"] = sAccountingTrailing
			|| transformCurrencyPattern(oResult.currencyFormat.accounting, sCurrencySpacingBefore);

		// SAP specific format for style "short"
		oCurrencyFormatShort = oResult["currencyFormat-short"];
		const oCurrencyFormatShortTrailingResult = oResult["currencyFormat-sap-short"] = {};
		Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
			oCurrencyFormatShortTrailingResult[sKey] = oCurrencyFormatShortTrailing[sKey]
				|| transformShortCurrencyPattern(oCurrencyFormatShort[sKey], sCurrencySpacingBefore);
		});

		this.updateTimezones(oResult, sCLDRTag);
		Generator.addStaticData(oResult, sCLDRTag);

		this.cleanupFileCacheAndWriteResult(sUI5Tag, oResult);
	}

	/**
	 * Updates the time zone specific data in the given <code>oResult</code> object for the currently processed locale.
	 *
	 * @param {Object<string, any>} oResult
	 *   The resulting CLDR object for the current locale
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 */
	updateTimezones(oResult, sCLDRTag) {
		const oTimezoneNames = oResult["timezoneNames"];
		if (sCLDRTag === "de") {
			this._aCompleteCLDRTimezoneIDs = Generator.getTimezoneIDs(oTimezoneNames);
		} else {
			Generator.enrichEnglishTimezoneNames(sCLDRTag, oTimezoneNames, this._aCompleteCLDRTimezoneIDs);
		}
		Generator.replaceOutdatedCLDRTimezoneNames(oTimezoneNames);
		Generator.fixTimezoneNames(sCLDRTag, oTimezoneNames);
		Generator.cleanupTimezoneNames(oResult);
		oResult["timezoneNames"] = Generator.sort(oTimezoneNames);
		this.checkTimezonesConsistency(sCLDRTag, oResult["timezoneNames"]);
		// adjust Timezone appendItems for zh-Hans to avoid conflicts in parsing:
		// <code>"Timezone": "{1}{0}",</code> has no spaces
		// Without spaces "GMT+11995" cannot be distinguished, because there is GMT+1 and GMT+11.
		// unfortunately gmtFormat is calendar specific, therefore it cannot be adjusted more specifically
		if (sCLDRTag.startsWith("zh-Hans-")) {
			oResult["ca-gregorian"].dateTimeFormats.appendItems.Timezone = "{1} {0}";
		}
	}


	/**
	 * Adds static CLDR information for currency digits, plural rules, calendar, date and time data to the given object.
	 *
	 * @param {Object<string, any>} oResult
	 *   The resulting CLDR object for the current locale
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 */
	static addStaticData(oResult, sCLDRTag) {
		extend(oResult, {currencyDigits: util.getCurrencyDigits()});
		extend(oResult, util.getPluralRules(sCLDRTag));
		extend(oResult, util.getWeekData(sCLDRTag));
		extend(oResult, util.getTimeData(sCLDRTag));
		extend(oResult, util.getCalendarData());
		extend(oResult, util.getDayPeriodRules(sCLDRTag));

		const sCalendarPref = util.getCalendarPreference(sCLDRTag);
		if (sCalendarPref) {
			extend(oResult, {calendarPreference: sCalendarPref});
		}
	}

	/**
	 * Checks whether all time zone names are unique.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale in which the missing
	 *   time zone names are set
	 * @throws {Error}
	 *   If there are duplicate time zone names.
	 */
	static checkDuplicateTimezoneNames(sCLDRTag, oTimezoneNames) {
		// ensure city names are unique to be able to uniquely format/parse them
		const aTimezoneNames = Generator.getAllChildValues(oTimezoneNames);
		const aDuplicateTimezoneNames = aTimezoneNames.filter(function(sTimezoneName, iIndex) {
			return aTimezoneNames.indexOf(sTimezoneName) !== iIndex;
		});
		if (aDuplicateTimezoneNames.length) {
			throw new Error("'" + sCLDRTag + "' contains duplicate time zone names: "
				+ aDuplicateTimezoneNames.join(", "));
		}
	}

	/**
	 * Checks the <code>timezoneNames</code> property of the currently processed locale for duplicate time zone names
	 * and for unusual time zone IDs, like "London/short/daylight". It logs the respective time zone IDs if they are
	 * considered to be unusual.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale
	 * @throws {Error}
	 *   If there are duplicate time zone names
	 */
	static checkTimezoneNames(sCLDRTag, oTimezoneNames) {
		Generator.checkDuplicateTimezoneNames(sCLDRTag, oTimezoneNames);
		Generator.getTimezoneIDs(oTimezoneNames).forEach((sTimezoneID) => {
			if (rUnusualTimezoneID.test(sTimezoneID)) {
				console.log("WARNING: Unusual time zone ID found '" + sTimezoneID + "' for locale '" + sCLDRTag
					+ "', maybe check and replace.");
			}
		});
	}

	/**
	 * Add missing parent relations, fix UTC time zone names, delete unsupported time zone names,
	 * and delete time zone backzone IDs.
	 *
	 * @param {Object<string,any>} oResult The resulting CLDR object for the current locale
	 */
	static cleanupTimezoneNames(oResult) {
		const oTerritories = oResult.territories;
		const oTimezoneNames = oResult.timezoneNames;
		// Argentina is the only sub territory for which the cities do not have the sub territory in their
		// translation therefore provide the territory manually
		oTimezoneNames.America.Argentina["_parent"] = oTerritories.AR;
		// timezone translation data - use "_parent" key for the translation of the top level territories
		oTimezoneNames.America["_parent"] = oTerritories["019"];
		oTimezoneNames.Europe["_parent"] = oTerritories["150"];
		oTimezoneNames.Africa["_parent"] = oTerritories["002"];
		oTimezoneNames.Asia["_parent"] = oTerritories["142"];
		oTimezoneNames.Australia["_parent"] = oTerritories.AU;
		oTimezoneNames.Antarctica["_parent"] = oTerritories.AQ;

		// Adjust Etc/UTC values
		oTimezoneNames.Etc.Universal = oTimezoneNames.Etc.UTC.long.standard;
		oTimezoneNames.Etc.UTC = oTimezoneNames.Etc.UTC.short.standard;

		// remove invalid IANA timezone ID
		delete oTimezoneNames.Etc.Unknown;

		// delete tz backzone IDs
		delete oTimezoneNames.Australia.Currie;
		delete oTimezoneNames.Pacific.Johnston;
		delete oTimezoneNames.Pacific.Enderbury;
	}

	/**
	 * Enriches the <code>timezoneNames</code> property for English locales only.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 * @param {string[]} aCompleteCLDRTimezoneIDs
	 *   An array of IANA time zone IDs
	 */
	static enrichEnglishTimezoneNames(sCLDRTag, oTimezoneNames, aCompleteCLDRTimezoneIDs) {
		if (sCLDRTag.includes("en")) {
			Generator.generateTimeZoneNames(oTimezoneNames, aCompleteCLDRTimezoneIDs);
		}
	}

	/**
	 * Takes the raw CLDR data and formats it, utilizing the Json2Json <code>ObjectTemplate</code> API,
	 * according to a given configuration template. The configuration is provided via the <code>config.js</code>.
	 *
	 * @param {string} sSrcFolder
	 *   The source folder for the CLDR data
	 * @param {Object<string, any>} mConfig
	 *   A map of configurations for the Json2Json <code>ObjectTemplate</code> API for the transformation of the raw
	 *   CLDR data
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 */
	static formatLocaleData(sSrcFolder, mConfig, sCLDRTag, oResult) {
		const sFileName = join(sSrcFolder, mConfig.packageName, "main", sCLDRTag, mConfig.fileName);
		if (fs.existsSync(sFileName)) {
			const oData = fileContent.getContent(sFileName).main[sCLDRTag];
			const oOutputData = new j2j.ObjectTemplate(mConfig.template).transform(oData);
			if (mConfig.fileName === "currencies.json" && oResult["currencySymbols"]) {
				const oLoadedChildData = oData["numbers"]["currencies"];
				Object.keys(oResult["currencySymbols"]).forEach((sKey) => {
					if (oLoadedChildData[sKey]) {
						delete oResult["currencySymbols"][sKey];
					}
				});
			}
			extend(true, oResult, oOutputData);
		}
	}

	/**
	 * Generates an object containing the existing time zone names of a locale and the IANA time zone names from the
	 * "IANA" repository https://github.com/eggert/tz.
	 *
	 * @param {Object<string, object>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 * @param {string[]} aCompleteCLDRTimezoneIDs
	 *   An array of IANA time zone IDs
	 */
	static generateTimeZoneNames(oTimezoneNames, aCompleteCLDRTimezoneIDs) {
		aCompleteCLDRTimezoneIDs.forEach((sTimezoneID) => {
			const aTzIDParts = sTimezoneID.split("/");
			let oIANATimezones = oTimezoneNames;
			aTzIDParts.forEach((sPart, i) => {
				if (!oIANATimezones[sPart]) {
					oIANATimezones[sPart] = i === aTzIDParts.length - 1
						? oIANATimezones[sPart] = sPart.replaceAll("_", " ")
						: oIANATimezones[sPart] = {};
				}
				oIANATimezones = oIANATimezones[sPart];
			});
		});
	}

	/**
	 * Returns the parent locale tag for a given CLDR tag if one is mentioned in the supplemental.json of the downloaded
	 * CLDR data.
	 *
	 * @param {string} sSrcFolder
	 *   The source folder for the CLDR data
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @returns {string|undefined}
	 *   The CLDR tag of the parent locale for the given CLDR tag or <code>undefined</code> if no parent locale is
	 *   defined
	 */
	static getParentLocaleTag(sSrcFolder, sCLDRTag) {
		const sFileName = join(sSrcFolder, "cldr-core", "supplemental", "parentLocales.json");

		return fileContent.getContent(sFileName).supplemental.parentLocales.parentLocale[sCLDRTag];
	}

	// Maps a locale to a map of time zone name replacements, each time zone name replacement maps
	// the time zone ID to its locale specific name
	static #oTZNamesReplacements = {
		"ca": {"Europe/Mariehamn": "Mariehamn"},
		"cy": {"Atlantic/Cape_Verde": "Cape Verde", "Europe/Moscow": "Moscow", "Europe/Zaporozhye": "Zaporozhye"},
		"en": {"Europe/London": "London", "Europe/Dublin": "Dublin", "Pacific/Honolulu": "Honolulu"},
		"fr": {"America/Tegucigalpa": "Tégucigalpa"},
		"it": {"America/Panama": "Panamá", "Asia/Qostanay": "Qostanay", "Indian/Christmas": "Natale"},
		"pt": {"Asia/Makassar": "Makassar"},
		"*": {"Pacific/Kanton": "Kanton"}
	};

	/**
	 * Fix time zone names that have no translation in CLDR or which have no string representation.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale in which the missing
	 *   time zone names are set
	 */
	static fixTimezoneNames(sCLDRTag, oTimezoneNames) {
		const sLanguageKey = sCLDRTag.slice(0,2);
		const oReplacements = Generator.#oTZNamesReplacements[sLanguageKey];
		if (oReplacements) {
			Generator.replaceTimezoneNames(sCLDRTag, oReplacements, oTimezoneNames);
		}
		Generator.replaceTimezoneNames(sCLDRTag, Generator.#oTZNamesReplacements["*"], oTimezoneNames);
	}

	/**
	 * Gets all values of the leaves in the object structure. Path segments that start with "_" are skipped.
	 *
	 * @param {Object<string, any>} oNode The object to flatten; all leaves have to be of type string
	 * @returns {string[]} The leaves of the object tree
	 */
	static getAllChildValues(oNode) {
		let aResult = [];
		Object.keys(oNode).forEach(function(sChildKey) {
			if (typeof oNode[sChildKey] === "object") {
				aResult = aResult.concat(Generator.getAllChildValues(oNode[sChildKey]));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(oNode[sChildKey]);
			}
		});
		return aResult;
	}

	/**
	 * Gets the langugage tag as used in CLDR from the language tag as used in UI5.
	 *
	 * @param {string} sUI5Tag The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 * @returns {string} The corresponding CLDR language tag (e.g. "en-US", "de", "zh-Hans-CN", "sr-Latn")
	 */
	static getCLDRTag(sUI5Tag) {
		switch (sUI5Tag) {
			case "zh_CN": return "zh-Hans-CN";
			case "zh_SG": return "zh-Hans-SG";
			case "zh_TW": return "zh-Hant-TW";
			case "zh_HK": return "zh-Hans-HK";
			default: return sUI5Tag.replace(/_/, "-");
		}
	}

	/**
	 * Recursivly iterates over the given time zone names object and returns a list of time zone IDs.
	 *
	 * @param {Object<string, any>} oTimezoneNamesNode
	 *   The <code>timezoneNames</code> object of the currently processed locale, or a child object in that tree
	 * @param {string} [sTimezoneIDPrefix]
	 *   The time zone ID prefix for the given child object of the time zone names tree
	 * @returns {string[]}
	 *   The list of time zone IDs
	 */
	static getTimezoneIDs(oTimezoneNamesNode, sTimezoneIDPrefix) {
		let aResult = [];
		sTimezoneIDPrefix = sTimezoneIDPrefix || "";
		Object.keys(oTimezoneNamesNode).forEach(function(sChildKey) {
			if (typeof oTimezoneNamesNode[sChildKey] === "object") {
				aResult = aResult.concat(
					Generator.getTimezoneIDs(oTimezoneNamesNode[sChildKey], sTimezoneIDPrefix + sChildKey + "/"));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(sTimezoneIDPrefix + sChildKey);
			}
		});
		return aResult;
	}

	/**
	 * Iterates over the given time zone name replacements and replaces the time zone name if needed.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {object[]} oReplacements
	 *   Maps a time zone ID (e.g. "Pacific/Kanton") to its locale specific time zone name (e.g. "Kanton")
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale in which the missing
	 *   time zone names are set
	 */
	static replaceTimezoneNames(sCLDRTag, oReplacements, oTimezoneNames) {
		for (const [sTimezoneID, sTimezoneName] of Object.entries(oReplacements)) {
			const aIDParts = sTimezoneID.split("/");
			const vCLDRValue = oTimezoneNames[aIDParts[0]][aIDParts[1]];
			if (vCLDRValue !== sTimezoneName && typeof vCLDRValue !== "string") {
				console.log(sTimezoneID + "'s time zone name " + JSON.stringify(vCLDRValue)
					+ " was replaced by '" + sTimezoneName + "' for locale '" + sCLDRTag + "'");
				oTimezoneNames[aIDParts[0]][aIDParts[1]] = sTimezoneName;
			}
		}
	}

	/**
	 * Processes the configuration templates for a given CLDR tag and formats the data according to the templates. The
	 * process considers the data of the parent locale if, one is defined. The values child locale are prioritized
	 * over the parent locale values.
	 *
	 * @param {string} sSrcFolder
	 *   The source folder for the CLDR data
	 * @param {Object<string, any>} mConfig
	 *   A map of configurations for the Json2Json <code>ObjectTemplate</code> API for the transformation of the raw
	 *   CLDR data
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 * @param {string} [sParentLocaleTag]
	 *   The CLDR tag of the parent locale
	 */
	static processConfigTemplates(sSrcFolder, mConfig, sCLDRTag, oResult, sParentLocaleTag) {
		if (sCLDRTag === "zh-Hans-CN") {
			sCLDRTag = "zh-Hans";
		} else if (sCLDRTag === "zh-Hant-TW") {
			sCLDRTag = "zh-Hant";
		}

		if (sParentLocaleTag) {
			Generator.formatLocaleData(sSrcFolder, mConfig, sParentLocaleTag, oResult);
		}

		Generator.formatLocaleData(sSrcFolder, mConfig, sCLDRTag, oResult);
	}

	/**
	 * Replaces outdated CLDR time zone names with the new (ABAP / IANA) time zone names in the given object.
	 *
	 * @param {Object<string, object>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 */
	static replaceOutdatedCLDRTimezoneNames(oTimezoneNames) {
		Object.keys(mABAP2CLDRIDs).forEach(function(sTimezoneABAP) {
			const sTimezoneCLDR = mABAP2CLDRIDs[sTimezoneABAP];

			// CLDR element in oTimezoneNames and key
			const aCLDRTimezones = sTimezoneCLDR.split("/");
			const sLastKeyCLDR = aCLDRTimezones.pop();
			const oCurrentElementCLDR = aCLDRTimezones.reduce(function(oPrevious, sKey) {
				return oPrevious[sKey];
			}, oTimezoneNames);

			// ABAP element in oTimezoneNames and key
			const aABAPTimezones = sTimezoneABAP.split("/");
			const sLastKeyABAP = aABAPTimezones.pop();
			const oCurrentElementABAP = aABAPTimezones.reduce(function(oPrevious, sKey) {
				return oPrevious[sKey];
			}, oTimezoneNames);

			oCurrentElementABAP[sLastKeyABAP] = oCurrentElementCLDR[sLastKeyCLDR];
			delete oCurrentElementCLDR[sLastKeyCLDR];
		});
	}

	/**
	 * Create a new object from the given object, by cloning the object's properties in alphabetical order.
	 *
	 * @param {Object<string, any>} oObject The object to be cloned
	 * @returns {Object<string, any>}
	 *   The cloned object; <code>Objects.keys</code> returns the property names in alphabetical order
	 */
	static sort(oObject) {
		const oNewObject = {};
		const aKeys = Object.keys(oObject);
		aKeys.sort();
		aKeys.forEach(function(sKey) {
			if (oObject[sKey] && typeof oObject[sKey] === "object") {
				oNewObject[sKey] = Generator.sort(oObject[sKey]);
			} else {
				oNewObject[sKey] = oObject[sKey];
			}
		});
		return oNewObject;
	}
}
