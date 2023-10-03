import { EventEmitter } from "node:events";
import { join, resolve } from "node:path";
import fs from "node:fs";
import j2j from "json2json";
import extend from "extend";
import { parallel, series } from "async";
import configs from "./config.js";
import * as util from "./util.js";
import { transformCurrencyPattern, transformShortCurrencyPattern } from "./trailingCurrencyCodeFormatter.js";
import fileContent from "./fileContent.js";
import Territories from "./Territories.js";
import LegacyUnitKeyMapping from "./LegacyUnitKeyMapping.js";
import Timezones from "./Timezones.js";

const aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "cy", "da", "de", "de_AT", "de_CH", "el", "el_CY",
	"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
	"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
	"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
	"lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv",
	"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

const rLowerCapitalLetter = /^[a-z]/;
/**
 * Generates the UI5 locale JSON files using the original JSON files.
 */
export default class Generator extends EventEmitter {
	constructor(sSourceFolder, sOutputFolder, bPrettyPrint, sCLDRVersion) {
		super();
		this._sSourceFolder = sSourceFolder;
		this._sOutputFolder = sOutputFolder;
		this._bPrettyPrint = bPrettyPrint;
		this._sCLDRVersion = sCLDRVersion;
	}

	async start() {
		const sSrcFolder = this._sSourceFolder;
		const sOutputFolder = this._sOutputFolder;
		const that = this;
		const sTimestamp = new Date().toISOString();
		const sLicense = "This file has been derived from Unicode Common Locale Data Repository (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice in the Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit http://www.unicode.org/copyright.html";
		const sFolderPathSupple = join(sSrcFolder, "cldr-core", "supplemental");
		const aTasks = [];

		util.setSupplePath(sFolderPathSupple);

		const mCurrencyDigits = util.getCurrencyDigits();
		const oTerritories = new Territories();
		const oLegacyUnitMapper = new LegacyUnitKeyMapping(aUI5Tags);
		await oLegacyUnitMapper.importOldUnits(sOutputFolder);
		const oTimezones = new Timezones();
		oTimezones.updateTimezones();
		let aGermanTimezoneIDs;

		// store previous IANA timezone IDs to be able
		// to compare them across all languages
		let aLastTimezoneIDs;

		aUI5Tags.forEach(function(sUI5Tag) {
			const sCLDRTag = getCLDRTag(sUI5Tag);
			const sCalendarPref = util.getCalendarPreference(sCLDRTag);
			let oCurrencyFormat;
			let oCurrencyFormatShort;
			// insert the license string and CLDR version info
			const oResult = {
				"__license": sLicense,
				"__version": that._sCLDRVersion,
				"__buildtime": sTimestamp
			};

			const sParentLocaleTag = Generator.getParentLocaleTag(sSrcFolder, sCLDRTag);
			// process each of the configs
			configs.forEach((mConfig) => {
				Generator.processConfigTemplates(sSrcFolder, mConfig, sCLDRTag, oResult, sParentLocaleTag);
			});

			// Overwrite CLDR information with consolidated territory information
			oTerritories.updateLocaleTerritories(oResult, sUI5Tag);

			// Check CLDR information for renamed unit keys
			oLegacyUnitMapper.analyseUnits(oResult, sUI5Tag);

			// SAP trailing currency format for currency codes (ISO)
			// duplicate currency formatting information and ensure that currency symbol is positioned
			// next to the number (trailing): "¤ 00" -> "00 ¤"
			// since this might lead to strange output e.g. "100KUSD", a space between currency code and number is
			// inserted "¤00K" -> "00K ¤"
			const sCurrencySpacingBefore = oResult.currencyFormat.currencySpacing.beforeCurrency.insertBetween;
			const oCurrencyFormatShortTrailing = {};
			let sAccountingTrailing;
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
				// eslint-disable-next-line no-warning-comments
				//TODO: Remove this hard coded attribute to support Laksh/Crore for decimalFormats for en_IN
				oResult["decimalFormat-short"] = {
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

			/*
			 * The timezoneNames contains the timezone IDs in a JSON structure.
			 */
			const oTimezoneNames = oResult["timezoneNames"];
			// TODO: POC TDD
			if (sCLDRTag === "de") {
				aGermanTimezoneIDs = getTimezoneIDs(oTimezoneNames);
			}
			// TODO: POC TDD
			if (aGermanTimezoneIDs && aGermanTimezoneIDs.length > 0) {
				Generator.enrichEnglishTimezoneNames(sCLDRTag, oTimezoneNames, aGermanTimezoneIDs);
			}
			/*
			 * Not all ABAP time zone IDs are represented in CLDR but some have a link to the same city,
			 * To have a unique mapping of key to value, we must replace the CLDR time zone ID with the
			 * respective ABAP time zone ID.
			 * e.g. America/Buenos_Aires (CLDR) -> America/Argentina/Buenos_Aires (ABAP)
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

			// Missing ABAP timezone IDs (different location/city):
			// Pacific/Kanton -> ???
			// tz > Link	Pacific/Kanton		Pacific/Enderbury

			// replace CLDR keys with ABAP keys
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
				const oCurrentElementABAP =  aABAPTimezones.reduce(function(oPrevious, sKey) {
					return oPrevious[sKey];
				}, oTimezoneNames);

				oCurrentElementABAP[sLastKeyABAP] = oCurrentElementCLDR[sLastKeyCLDR];
				delete oCurrentElementCLDR[sLastKeyCLDR];
			});

			// TODO: POC TDD
			// fix missing timezone translations
			const oTZNamesReplacements = {
				"ca": [
					{keys: ["Europe", "Mariehamn"], replacement: "Mariehamn"}
				],
				"cy": [
					{keys: ["Atlantic", "Cape_Verde"], replacement: "Cape Verde"},
					{keys: ["Europe", "Moscow"], replacement: "Moscow"},
					{keys: ["Europe", "Zaporozhye"], replacement: "Zaporozhye"}
				],
				"en": [
					{keys: ["Europe", "London"], replacement: "London"},
					{keys: ["Europe", "Dublin"], replacement: "Dublin"},
					{keys: ["Pacific", "Honolulu"], replacement: "Honolulu"}
				],
				"fr": [
					{keys: ["America", "Tegucigalpa"], replacement: "Tégucigalpa"}
				],
				"it": [
					{keys: ["America", "Panama"], replacement: "Panamá"},
					{keys: ["Asia", "Qostanay"], replacement: "Qostanay"},
					{keys: ["Indian", "Christmas"], replacement: "Natale"}
				],
				"pt": [
					{keys: ["Asia", "Makassar"], replacement: "Makassar"}
				],
				"*": [
					{keys: ["Pacific", "Kanton"], replacement: "Kanton"}
				]
			};

			Generator.iterateTimezoneNameReplacements(sCLDRTag, oTimezoneNames, oTZNamesReplacements);

			// Argentina is the only sub territory for which the cities do not have the sub territory in their
			// translation therefore provide the territory manually
			oTimezoneNames["America"]["Argentina"]["_parent"] = oResult["territories"]["AR"];
			// timezone translation data - use "_parent" key for the translation of the top level territories
			oTimezoneNames["America"]["_parent"] = oResult["territories"]["019"];
			oTimezoneNames["Europe"]["_parent"] = oResult["territories"]["150"];
			oTimezoneNames["Africa"]["_parent"] = oResult["territories"]["002"];
			oTimezoneNames["Asia"]["_parent"] = oResult["territories"]["142"];
			oTimezoneNames["Australia"]["_parent"] = oResult["territories"]["AU"];
			oTimezoneNames["Antarctica"]["_parent"] = oResult["territories"]["AQ"];

			// Adjust Etc/UTC values
			const sLongUTC = oTimezoneNames["Etc"]["UTC"]["long"]["standard"];
			const sShortUTC = oTimezoneNames["Etc"]["UTC"]["short"]["standard"];
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

			Generator.checkTimezoneNames(sCLDRTag, oTimezoneNames);

			// consistency check
			// list of timezones must be consistent among all languages
			const aTimezoneIDs = getTimezoneIDs(oTimezoneNames);
			if (aLastTimezoneIDs && aLastTimezoneIDs.length !== aTimezoneIDs.length) {
				if (aLastTimezoneIDs.length > aTimezoneIDs.length) {
					const aMissingTimezoneIds = aLastTimezoneIDs.filter(function (sTimezoneId) {
						return !aTimezoneIDs.includes(sTimezoneId);
					});
					throw new Error("'" + sCLDRTag + "' keys missing in 'timezoneNames': " + aMissingTimezoneIds);
				} else {
					const aUnexpectedTimezoneIds = aTimezoneIDs.filter(function (sTimezoneId) {
						return !aLastTimezoneIDs.includes(sTimezoneId);
					});
					throw new Error("'" + sCLDRTag + "' keys unexpected in 'timezoneNames': " + aUnexpectedTimezoneIds);
				}
			}
			aLastTimezoneIDs = aTimezoneIDs;

			// ensure city names are unique to be able to uniquely format/parse them
			const aCityNames = getAllChildValues(oTimezoneNames);
			const aDuplicateCityNames = aCityNames.filter(function(sCityName, iIndex) {
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

			// extend result with static data
			extend(oResult, {currencyDigits: mCurrencyDigits});
			extend(oResult, util.getPluralRules(sCLDRTag));
			extend(oResult, util.getWeekData(sCLDRTag));
			extend(oResult, util.getTimeData(sCLDRTag));
			extend(oResult, util.getCalendarData());
			extend(oResult, util.getDayPeriodRules(sCLDRTag));

			if (sCalendarPref) {
				// if calendar preference exits, also extend the result with it
				extend(oResult, {
					"calendarPreference": sCalendarPref
				});
			}

			fileContent.clearCache();

			// The following two tasks are run in series: create folder and write file
			const aSubTasks = [
				function(callback) {
					fs.mkdir(sOutputFolder, {recursive: true}, function(err) {
						callback(err);
					});
				},
				(function(r) {
					return function(callback) {
						const sPath = resolve(join(sOutputFolder, sUI5Tag + ".json"));
						fs.writeFile(sPath, JSON.stringify(r, null, that._bPrettyPrint ? "\t" : 0), function(err) {
							callback(err, sPath);
						});
					};
				})(oResult)
			];

			// The task for writing each JSON file is done in parallel with the other file writing
			aTasks.push(function(callback) {
				// execute the aSubTasks
				series(aSubTasks, function(err, results) {
					if (!err) {
						that.emit("localeJSONReady", results[1]);
					} else {
						that.emit("error", err);
					}
					callback(err, results[1]);
				});
			});
		});

		aTasks.push(async function () {
			await oTerritories.writeTerritoriesCache();
			await oLegacyUnitMapper.writeUnitMappingToLocaleData();
			await oTimezones.ready();
		});

		// execute the aTasks
		parallel(aTasks, function(err, results) {
			if (!err) {
				that.emit("allLocaleJSONReady", results);
			} else {
				that.emit("error", err);
			}
		});

		return this;
	}

	// TODO: POC TDD
	/**
	 * Checks the <code>timezoneNames</code> property of the currently processed locale for unusual time zone IDs,
	 * like "London/short/daylight". It logs the respective time zone IDs if they are considered to be unusual.
	 *
	 * @param {string} sCLDRTag
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
	 * @param {Object<string, any>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 */
	static checkTimezoneNames(sCLDRTag, oTimezoneNames) {
		const aTimezoneIDs = getTimezoneIDs(oTimezoneNames);
		aTimezoneIDs.forEach((sTimezoneID) => {
			if (sTimezoneID.split("/").find((sTimezoneIDPart) => rLowerCapitalLetter.test(sTimezoneIDPart))) {
				console.log("WARNING: Unusual time zone ID found '" + sTimezoneID + "' for locale '" + sCLDRTag
					+ "', maybe check and replace.");
			}
		});
	}

	/**
	 * Enriches the <code>timezoneNames</code> property for English locales only.
	 *
	 * @param {string} sCLDRTag
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
	 * @param {Object<string, any>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 * @param {string[]} aGermanTimezoneIDs
	 *   An array of IANA time zone IDs
	 */
	static enrichEnglishTimezoneNames(sCLDRTag, oTimezoneNames, aGermanTimezoneIDs) {
		if (sCLDRTag.includes("en")) {
			Generator.generateTimeZoneNames(oTimezoneNames, aGermanTimezoneIDs);
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
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
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
	 * @param {Object<string, any>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 * @param {string[]} aGermanTimezoneIDs
	 *   An array of IANA time zone IDs
	 */
	static generateTimeZoneNames(oTimezoneNames, aGermanTimezoneIDs) {
		aGermanTimezoneIDs.forEach((sTimezoneID) => {
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
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
	 *
	 * @returns {string|undefined}
	 *   The CLDR tag of the parent locale for the given CLDR tag or <code>undefined</code> if no parent locale is
	 *   defined
	 */
	static getParentLocaleTag(sSrcFolder, sCLDRTag) {
		const sFileName = join(sSrcFolder, "cldr-core", "supplemental", "parentLocales.json");

		return fileContent.getContent(sFileName).supplemental.parentLocales.parentLocale[sCLDRTag];
	}

	// TODO: POC TDD
	/**
	 * Iterates the replacements configuration of the generator and picks the configs for the corresponding locales.
	 *
	 * @param {string} sCLDRTag
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
	 * @param {Object<string, any>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the currently processed locale
	 * @param {Object<string, any>} oTZNamesReplacements
	 *   The replacement object containing the replacement configurations and values, for certain locales
	 */
	static iterateTimezoneNameReplacements(sCLDRTag, oTimezoneNames, oTZNamesReplacements) {
		const sLanguageKey = sCLDRTag.slice(0,2);
		if (oTZNamesReplacements[sLanguageKey]) {
			Generator.logTimezoneNameReplacements(sCLDRTag, sLanguageKey, oTimezoneNames, oTZNamesReplacements);
		}
		Generator.logTimezoneNameReplacements(sCLDRTag, "*", oTimezoneNames, oTZNamesReplacements);
	}

	// TODO: POC TDD
	/**
	 * Logs and replaces missing or wrong time zone name values for a given CLDR tag, if this CLDR tag is defined in the
	 * configuration object <code>oTZNamesReplacements</code>.
	 *
	 * @param {string} sCLDRTag
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
	 * @param {string|"*"} sLanguageKey
	 *   The language part of the <code>sCLDRTag</code> string or <code>"*"</code> if the configuration applies to all
	 *   languages
	 * @param {Object<string, any>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the currently processed locale
	 * @param {Object<string, any>} oTZNamesReplacements
	 *   The replacement object containing the replacement configurations and values, for certain locales
	 */
	static logTimezoneNameReplacements(sCLDRTag, sLanguageKey, oTimezoneNames, oTZNamesReplacements) {
		oTZNamesReplacements[sLanguageKey].forEach((oReplaceConfig) => {
			const vReplacementValue = oTimezoneNames[oReplaceConfig.keys[0]][oReplaceConfig.keys[1]];
			if (vReplacementValue !== oReplaceConfig.replacement && typeof vReplacementValue !== "string") {
				console.log("Time zone name value '" + JSON.stringify(vReplacementValue)
					+ "' was replaced by '" + oReplaceConfig.replacement + "' for loacle '" + sCLDRTag + "'");
				oTimezoneNames[oReplaceConfig.keys[0]][oReplaceConfig.keys[1]] = oReplaceConfig.replacement;
			}
		});
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
	 *   A language code as defined by the IETF BCP 47 standard consisting of a language code, a script code (optional),
	 *   a region code (optional), and other subtags (optional) that specify additional language or cultural variations
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

function getAllChildValues(node) {
	let aResult = [];
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
	let aResult = [];
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
	const oNewObject = {};
	const aKeys = Object.keys(node);
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
