import { EventEmitter } from "node:events";
import { join, resolve } from "node:path";
import fs from "node:fs";
import j2j from "json2json";
import extend from "extend";
import { parallel, series } from "async";
import configs from "./config.js";
import util from "./util.js";
import trailingCurrencyCodeFormatter from "./trailingCurrencyCodeFormatter.js";
import fileContent from "./fileContent.js";
import Territories from "./Territories.js";
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
const rAllCurrencySigns = /¤/g;
const rAllNonASCIILetters = /[^a-zA-Z]/g;
const rAllSimpleStringLiterals = /'[^']*'/g;
const rAllSupportedDateTimeSymbols = /[GyYMLwWDdQqEcuaBHkKhmsSzZXV]/g;
// if a segment of a time zone ID starts with lower case it has to be checked and maybe replaced
const rUnusualTimezoneID = /(^[a-z]|\/[a-z])/;

const aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cnr", "cs", "cy", "da", "de", "de_AT", "de_CH", "el", "el_CY",
	"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
	"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
	"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt",
	"lv", "mk", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv",
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
	/**
	 * Maps unsupported date/time patterns to an object which maps a locale to a detailed information about the
	 * unsupported pattern, e.g. {"v": {"locale0": ["pattern0", ...], "locale1": ["patternx", ...]}}
	 */
	_mUnsupportedDateTimePatterns = null;

	constructor(sSourceFolder, sOutputFolder, sCLDRVersion) {
		super();
		this._sCLDRVersion = sCLDRVersion;
		// As of V43 we fill this array with the TZ IDs of the 'ar' locale
		this._aCompleteCLDRTimezoneIDs = [];
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
	 * Checks the generator result (<code>oResult</code>) of a locale for not yet supported date/time patterns.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 */
	checkAllDateTimePatterns(sUI5Tag, oResult) {
		[
			["ca-gregorian", "dateFormats"],
			["ca-gregorian", "timeFormats"],
			["ca-gregorian", "dateTimeFormats", "availableFormats"],
			["ca-gregorian", "dateTimeFormats", "intervalFormats"],
			["ca-islamic", "dateFormats"],
			["ca-islamic", "timeFormats"],
			["ca-islamic", "dateTimeFormats", "availableFormats"],
			["ca-islamic", "dateTimeFormats", "intervalFormats"],
			["ca-japanese", "dateFormats"],
			["ca-japanese", "timeFormats"],
			["ca-japanese", "dateTimeFormats", "availableFormats"],
			["ca-japanese", "dateTimeFormats", "intervalFormats"],
			["ca-persian", "dateFormats"],
			["ca-persian", "timeFormats"],
			["ca-persian", "dateTimeFormats", "availableFormats"],
			["ca-persian", "dateTimeFormats", "intervalFormats"],
			["ca-buddhist", "dateFormats"],
			["ca-buddhist", "timeFormats"],
			["ca-buddhist", "dateTimeFormats", "availableFormats"],
			["ca-buddhist", "dateTimeFormats", "intervalFormats"]
		].forEach((aPropertyPathNames) => {
			this.checkDateTimePatternsForPath(sUI5Tag, oResult, aPropertyPathNames);
		});
	}

	/**
	 * Checks the subset of the locale's generator result for the given property path for not yet supported date/time
	 * patterns.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 * @param {string[]} aPropertyPathNames
	 *   The array of property names to follow in the given objects to find the date or time patterns to be checked
	 */
	checkDateTimePatternsForPath(sUI5Tag, oResult, aPropertyPathNames) {
		const oDateOrTimePattern = Generator.getPropertyPathValue(oResult, aPropertyPathNames);

		for (const [sPatternKey, vPattern] of Object.entries(oDateOrTimePattern)) {
			if (typeof vPattern === "object") {
				this.checkDateTimePatternsForPath(sUI5Tag, oResult, [...aPropertyPathNames, sPatternKey]);
			} else if (sPatternKey !== "intervalFormatFallback") {
				// exclude intervalFormatFallback because it is not parsed and may contain symbols, e.g. "{0} a el {1}"
				let sUnsupportedSymbols = vPattern.replace(rAllSimpleStringLiterals, "")
					.replace(rAllNonASCIILetters, "") // remove not relevant characters
					.replace(rAllSupportedDateTimeSymbols, "");

				if (sUnsupportedSymbols.includes("e") || sUnsupportedSymbols.includes("v")) {
					const bAvailableFormatsInPath = aPropertyPathNames.includes("availableFormats");
					const iIntervalFormatsIndex = aPropertyPathNames.indexOf("intervalFormats");
					const bIntervalFormatsInPath = iIntervalFormatsIndex !== -1;
					const sKey = bIntervalFormatsInPath ? aPropertyPathNames[iIntervalFormatsIndex + 1] : sPatternKey;
					if ((bAvailableFormatsInPath || bIntervalFormatsInPath)) {
						["e", "v"].forEach((sPatternSymbol) => {
							if (sKey.includes(sPatternSymbol) && vPattern.includes(sPatternSymbol)) {
								sUnsupportedSymbols = sUnsupportedSymbols.replaceAll(sPatternSymbol, "");
							}
						});

						// The 'GyMMMEd/d' interval pattern in the Korean locale is a known issue which is
						// excluded from the log output temporarily and should be included if we decide to support
						// the format pattern "e"
						if (sUI5Tag === "ko" && sKey === "GyMMMEd" && sPatternKey === "d") {
							sUnsupportedSymbols = sUnsupportedSymbols.replaceAll("e", "");
						}
					}
				}

				if (sUnsupportedSymbols !== "") {
					this._mUnsupportedDateTimePatterns ??= {};
					this._mUnsupportedDateTimePatterns[sUnsupportedSymbols] ??= {};
					this._mUnsupportedDateTimePatterns[sUnsupportedSymbols][sUI5Tag] ??= [];
					this._mUnsupportedDateTimePatterns[sUnsupportedSymbols][sUI5Tag].push("\"" + vPattern
						+ "\" found in " + aPropertyPathNames.join("/") + "/" + sPatternKey);
				}
			}
		}
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

	/**
	 * Core function which generates the CLDR data result for a specific locale.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH" or "sr_Latn"
	 */
	generateLocaleFile(sUI5Tag) {
		const sCLDRTag = Generator.getCLDRTag(sUI5Tag);
		const sParentLocaleTag = Generator.getParentLocaleTag(this._sSourceFolder, sCLDRTag);
		const oResult = {
			"__license": "This file has been derived from Unicode Common Locale Data Repository (CLDR) files"
				+ " (http://cldr.unicode.org). See the copyright and permission notice in the"
				+ " Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit"
				+ " http://www.unicode.org/copyright.html",
			"__version": this._sCLDRVersion,
			"__buildtime": this._sTimestamp
		};
		configs.forEach((mConfig) => {
			Generator.processConfigTemplates(this._sSourceFolder, mConfig, sCLDRTag, oResult, sParentLocaleTag);
		});
		this.updateMonthAbbreviations(oResult, sUI5Tag);
		Generator.addMissingLanguageNameForMontenegrin(oResult, sUI5Tag);
		// Overwrite CLDR information with consolidated territory information
		this._oTerritories.updateLocaleTerritories(oResult, sUI5Tag);
		Generator.updateCurrencyFormats(sCLDRTag, oResult);
		this.updateTimezones(oResult, sCLDRTag);
		Generator.addStaticData(oResult, sCLDRTag);
		Generator.checkUnsupporedRTLCodes(sUI5Tag, oResult);
		this.checkAllDateTimePatterns(sUI5Tag, oResult);
		this.cleanupFileCacheAndWriteResult(sUI5Tag, oResult);
	}

	/**
	 * If there are unsupported date/time patterns write the findings to the console.
	 */
	logUnsupportedDateTimePatterns() {
		if (this._mUnsupportedDateTimePatterns) {
			console.log("ERROR: Unsupported date time patterns found: "
				+ JSON.stringify(this._mUnsupportedDateTimePatterns, (sKey, vValue) => {
					// to get the full information comment out the following if
					if (Array.isArray(vValue)) {
						return vValue.length + " occurrence(s)";
					}
					return vValue;
				}, "\t"));
		}
	}

	start() {
		const sFolderPathSupple = join(this._sSourceFolder, "cldr-core", "supplemental");

		util.setSupplePath(sFolderPathSupple);
		this._oTimezones.updateTimezones(mABAP2CLDRIDs);
		// Generate the CLDR JSON files
		aUI5Tags.forEach((sUI5Tag) => this.generateLocaleFile(sUI5Tag));
		this.logUnsupportedDateTimePatterns();

		this._aTasks.push(async () => {
			await this._oTerritories.writeTerritoriesCache();
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
	 * Enhances the month abbreviations in the given result object for the given language with historical alternatives.
	 *
	 * @param {Object<string,any>} oResult
	 *   The resulting CLDR object for the given language
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH" or "sr_Latn"
	 */
	updateMonthAbbreviations(oResult, sUI5Tag) {
		let oFormerResults;
		try {
			oFormerResults = fileContent.getContent(join(this._sOutputFolder, `${sUI5Tag}.json`));
		} catch (oError) {
			return; // new language tag -> nothing to do; keep the abbreviations as in current CLDR version
		}

		[
			["ca-gregorian", "months", "format", "abbreviated"],
			["ca-gregorian", "months", "stand-alone", "abbreviated"],
			["ca-islamic", "months", "format", "abbreviated"],
			["ca-islamic", "months", "stand-alone", "abbreviated"],
			["ca-japanese", "months", "format", "abbreviated"],
			["ca-japanese", "months", "stand-alone", "abbreviated"],
			["ca-persian", "months", "format", "abbreviated"],
			["ca-persian", "months", "stand-alone", "abbreviated"],
			["ca-buddhist", "months", "format", "abbreviated"],
			["ca-buddhist", "months", "stand-alone", "abbreviated"]
		].forEach((aPropertyPathNames) => {
			Generator.updateAlternatives(oFormerResults, oResult, aPropertyPathNames);
		});
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
		if (this._aCompleteCLDRTimezoneIDs.length === 0) {
			// As of CLDR version 44, this array is filled with the TZ IDs of the 'ar' locale
			// since, this is a reliable source to enumerate all CLDR TZ IDs as,
			// timezone key and language dependent text for 'ar' are guaranteed to be different
			this._aCompleteCLDRTimezoneIDs = Generator.getTimezoneIDs(oTimezoneNames);
		} else {
			Generator.generateTimeZoneNames(oTimezoneNames, this._aCompleteCLDRTimezoneIDs);
		}
		Generator.replaceOutdatedCLDRTimezoneNames(oTimezoneNames);
		Generator.replaceObjectValuesInTimezoneNames(sCLDRTag, oTimezoneNames);
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
	 * Adds missing language names that cannot be derived from existing language and region information, e.g. for "cnr".
	 *
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 */
	static addMissingLanguageNameForMontenegrin(oResult, sUI5Tag) {
		const oLanguages = oResult.languages;
		if (!oLanguages.cnr) {
			let sNewValue = oLanguages.sr_ME // take the language name from CLDR if available
				|| Generator.getResourceBundle(sUI5Tag)?.["languagename.cnr"]?.text; // use own translated name
			const bGenerateDefault = !sNewValue;
			if (bGenerateDefault) {
				sNewValue = oLanguages.sr + " (" + oResult.territories.ME + ")"; // use default name
			}
			const oNewObject = {};
			// clone the list of language names and insert the new language name at the right position
			Object.keys(oLanguages).forEach(function(sKey) {
				if (sNewValue && sKey > "cnr") {
					oNewObject["cnr"] = sNewValue;
					if (bGenerateDefault) {
						// avoid multiple occurrences of "Montenegro" in language name on the client for cnr_ME
						oNewObject["cnr_ME"] = sNewValue;
					}
					sNewValue = undefined;
				}
				oNewObject[sKey] = oLanguages[sKey];
			});
			oResult.languages = oNewObject;
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
	 * Checks the generator result for any not yet supported bidirectional (RTL) codes.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 * @param {object} oResult
	 *   The reference object of the generator's result into which the formatted CLDR data is written
	 * @throws {Error}
	 *   If <code>oResult</code> contains unsupported bidirectional (RTL) codes
	 */
	static checkUnsupporedRTLCodes(sUI5Tag, oResult) {
		const rUnsupportedRTLCharacters = /[\u202d\u202e\u2066\u2067\u2068\u2069]/;
		const sResult = JSON.stringify(oResult);
		const iOffset = sResult.search(rUnsupportedRTLCharacters);
		if (iOffset !== -1) {
			throw new Error(`Unsupported RTL character`
				+ ` \\u${sResult.codePointAt(iOffset).toString(16)} found for locale ${sUI5Tag}`);
		}
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
	 * Takes the raw CLDR data and formats it, utilizing the json2json <code>ObjectTemplate</code> API,
	 * according to a given configuration template. The configuration is provided via the <code>config.js</code>.
	 *
	 * @param {string} sSrcFolder
	 *   The source folder for the CLDR data
	 * @param {Object<string, any>} mConfig
	 *   A map of configurations for the json2json <code>ObjectTemplate</code> API for the transformation of the raw
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

	// maps the UI5 language tag to the corresponding CLDR tag
	static #mUI5toCLDRTag = {
		cnr: "sr-Latn-ME", // Montenegrin is the language name for sr_ME; preferred script is Latn
		"zh_CN": "zh-Hans-CN",
		"zh_SG": "zh-Hans-SG",
		"zh_TW": "zh-Hant-TW",
		"zh_HK": "zh-Hans-HK"
	};

	/**
	 * Gets the langugage tag as used in CLDR from the language tag as used in UI5.
	 *
	 * @param {string} sUI5Tag The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"
	 * @returns {string} The corresponding CLDR language tag (e.g. "en-US", "de", "zh-Hans-CN", "sr-Latn")
	 */
	static getCLDRTag(sUI5Tag) {
		return Generator.#mUI5toCLDRTag[sUI5Tag] || sUI5Tag.replace(/_/, "-");
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

	/**
	 * Returns the value in the given object by following the given chain of property names.
	 *
	 * @param {Object<string, any>} oSource
	 *   The source object
	 * @param {string[]} aPropertyPathNames
	 *   The array of property names to follow in the given object
	 * @returns {any}
	 *   The resulting value; or <code>undefined</code> if there is no data for the path of the given property names
	 */
	static getPropertyPathValue(oSource, aPropertyPathNames) {
		return aPropertyPathNames.reduce((oNode, sPropertyName) => oNode && oNode[sPropertyName], oSource);
	}

	/**
	 * Loads and parses the resource bundle file for the given UI5 language tag. If there is no resource bundle for the
	 * region or the script then fall back to the resource bundle for the language.
	 *
	 * @param {string} sUI5Tag
	 *   The UI5 language tag, e.g. "en", "de_CH", "zh_CN" or "sr_Latn"; if there is no resource bundle e.g. for "de_CH"
	 *   the resource bundle "de" is used, if available
	 * @returns {Object<string,Object<"text"|"comment",string>>|undefined}
	 *   The map of translated texts, mapping a resource bundle key to an object with the properties "text" containing
	 *   the translated text and optional "comment" containing a description for the resource bundle entry;
	 *   <code>undefined</code> if no resource bundle is found
	 */
	static getResourceBundle(sUI5Tag) {
		const sFileName = resolve("./lib/i18n/i18n_" + sUI5Tag + ".json");
		if (!fs.existsSync(sFileName)) {
			const i = sUI5Tag.indexOf("_");
			if (i > 0) { // try to get from parent bundle
				return Generator.getResourceBundle(sUI5Tag.slice(0, i));
			}
			return undefined;
		}
		return fileContent.getContent(sFileName);
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
	 * Gets the currency pattern with a trailing currency sign for the given <code>sCurrencyPattern</code>. Based on the
	 * given <code>bTransformTrailing</code> the currency format pattern is first transformed to have a trailing
	 * currency sign character before it is replaced with the given <code>sReplacement</code>.
	 *
	 * @param {string} sCurrencyPattern
	 *   The currency pattern to be transformed to a pattern with a trailing currency sign
	 * @param {string} sCurrencySpacingBefore
	 *   The characters which are placed between the amount and the currency in the trailing currency pattern
	 * @param {boolean} bTransformTrailing
	 *   Whether the given currency pattern has to be transformed to a pattern with a trailing currency
	 * @param {string} sReplacement
	 *   The locale specific replacement for the currency sign in the trailing currency format pattern
	 * @returns {string}
	 *   The currency format pattern with trailing currency sign
	 */
	static getTrailingCurrency(sCurrencyPattern, sCurrencySpacingBefore, bTransformTrailing, sReplacement) {
		return (bTransformTrailing
			? trailingCurrencyCodeFormatter.transformCurrencyPattern(sCurrencyPattern, sCurrencySpacingBefore)
			: sCurrencyPattern).replace(rAllCurrencySigns, sReplacement);
	}

	/**
	 * Gets the short currency pattern with a trailing currency sign for the given <code>sCurrencyPattern</code>. Based
	 * on the given <code>bTransformTrailing</code> the short currency format pattern is first transformed to have a
	 * trailing currency sign character before it is replaced with the given <code>sReplacement</code>.
	 *
	 * @param {string} sCurrencyPattern
	 *   The short currency pattern to be transformed to a pattern with a trailing currency sign
	 * @param {string} sCurrencySpacingBefore
	 *   The characters which are placed between the amount and the currency in the trailing currency pattern
	 * @param {boolean} bTransformTrailing
	 *   Whether the entered patterns have to be transformed to a pattern with a trailing currency
	 * @param {string} sReplacement
	 *   The locale specific replacement for the currency sign in the short trailing currency format pattern
	 * @returns {string}
	 *   The short currency format pattern with a trailing currency sign
	 */
	static getTrailingShortCurrency(sCurrencyPattern, sCurrencySpacingBefore, bTransformTrailing, sReplacement) {
		return (bTransformTrailing
			? trailingCurrencyCodeFormatter.transformShortCurrencyPattern(sCurrencyPattern, sCurrencySpacingBefore)
			: sCurrencyPattern).replace(rAllCurrencySigns, sReplacement);
	}

	/**
	 * Processes the configuration templates for a given CLDR tag and formats the data according to the templates. The
	 * process considers the data of the parent locale if, one is defined. The values child locale are prioritized
	 * over the parent locale values.
	 *
	 * @param {string} sSrcFolder
	 *   The source folder for the CLDR data
	 * @param {Object<string, any>} mConfig
	 *   A map of configurations for the json2json <code>ObjectTemplate</code> API for the transformation of the raw
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
	 * Replaces object values in the given <code>oTimezoneNames</code> with their defined string values.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale in which the object
	 *   time zone name values are replaced
	 */
	static replaceObjectValuesInTimezoneNames(sCLDRTag, oTimezoneNames) {
		// The replacement TZ IDs with their respective values since, those time zones are represented
		// as objects in the CLDR data
		const oReplacements = {
			"America/Thule": "Thule",
			"Europe/Dublin": "Dublin",
			"Europe/London": "London",
			"Pacific/Honolulu": "Honolulu"
		};
		for (const [sTimezoneID, sTimezoneName] of Object.entries(oReplacements)) {
			const aIDParts = sTimezoneID.split("/");
			const vCLDRValue = oTimezoneNames[aIDParts[0]][aIDParts[1]];
			if (typeof vCLDRValue !== "string") {
				console.log(sTimezoneID + "'s time zone name " + JSON.stringify(vCLDRValue)
					+ " was replaced by '" + sTimezoneName + "' for locale '" + sCLDRTag + "'");
				oTimezoneNames[aIDParts[0]][aIDParts[1]] = sTimezoneName;
			}
		}
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

	/**
	 * Updates the values of <code>accounting</code> and <code>standard</code> in the given <code>oCurrencyFormat</code>
	 * object by replacing the currency sign with the given <code>sCurrencySignReplacement</code>, and adds the SAP
	 * specific currency format patterns <code>sap-accounting</code> and <code>sap-standard</code> which always have a
	 * trailing currency. Based on the given <code>bTransformTrailingCurrency</code> the accounting/standard pattern is
	 * first transformed to have a trailing currency sign character before it is replaced with the given
	 * <code>sCurrencySignTrailingReplacement</code>.
	 *
	 * @param {Object<string, any>} oCurrencyFormat
	 *   The resulting "currencyFormat" value for the current locale; all changes are done in this object
	 * @param {string} sCurrencySignReplacement
	 *   The locale specific replacement for the currency sign in the "accounting" and "standard" currency format
	 *   patterns
	 * @param {string} sCurrencySpacingBefore
	 *   The characters which are placed between the amount and the currency in the trailing currency patterns
	 * @param {boolean} bTransformTrailingCurrency
	 *   Whether the "accounting"/"standard" patterns have to be transformed to a pattern with a trailing currency
	 * @param {string} sCurrencySignTrailingReplacement
	 *   The locale specific replacement for the currency sign in the "sap-accounting" and "sap-standard" currency
	 *   format patterns
	 */
	static updateAccountingAndStandardCurrencyFormat(oCurrencyFormat, sCurrencySignReplacement, sCurrencySpacingBefore,
		bTransformTrailingCurrency, sCurrencySignTrailingReplacement) {
		// compute sStandardTrailing and sAccountingTrailing before replacing the currency sign
		const sStandardTrailing = Generator.getTrailingCurrency(oCurrencyFormat.standard, sCurrencySpacingBefore,
			bTransformTrailingCurrency, sCurrencySignTrailingReplacement);
		const sAccountingTrailing = Generator.getTrailingCurrency(oCurrencyFormat.accounting, sCurrencySpacingBefore,
			bTransformTrailingCurrency, sCurrencySignTrailingReplacement);
		oCurrencyFormat.accounting = oCurrencyFormat.accounting.replace(rAllCurrencySigns, sCurrencySignReplacement);
		oCurrencyFormat.standard = oCurrencyFormat.standard.replace(rAllCurrencySigns, sCurrencySignReplacement);
		// to avoid larger diff, "sap-standard" before "sap-accounting"
		oCurrencyFormat["sap-standard"] = sStandardTrailing;
		oCurrencyFormat["sap-accounting"] = sAccountingTrailing;
	}

	/**
	 * Updates the values in the array for the given property path in the given object with historical alternatives.
	 * If there are no alternatives, the string value is not changed. If there are alternatives, then the value is
	 * replaced with an array of alternatives with the current value at position 0.
	 *
	 * @param {Object<string,any>} oFormerCLDRData
	 *   The CLDR object for the given language from former generation
	 * @param {Object<string,any>} oResult
	 *   The resulting CLDR object for the given language
	 * @param {string[]} aPropertyPathNames
	 *   The array of property names to follow in the given objects
	 */
	static updateAlternatives(oFormerCLDRData, oResult, aPropertyPathNames) {
		const aOldAbbreviations = Generator.getPropertyPathValue(oFormerCLDRData, aPropertyPathNames);
		const aAbbreviations = Generator.getPropertyPathValue(oResult, aPropertyPathNames);
		aAbbreviations.forEach((sAbbreviation, i) => {
			if (aOldAbbreviations[i] === sAbbreviation) {
				return; // nothing to do if both abbreviations are equal; can only happen for strings
			}

			if (typeof aOldAbbreviations[i] === "string") {
				// if there is more than one abbreviation replace the string by an array with both variants; the
				// latest variant is at position 0 in the array
				aAbbreviations[i] = [sAbbreviation, aOldAbbreviations[i]];
			} else {
				const iAt = aOldAbbreviations[i].indexOf(sAbbreviation);
				// if there is more than two abbreviation variants insert the latest variant at position 0
				aAbbreviations[i] = [sAbbreviation, ...aOldAbbreviations[i]];
				if (iAt >= 0) { // remove duplicate
					aAbbreviations[i].splice(iAt + 1, 1);
				}
			}
		});
	}

	static #oCurrencySignReplacements = {
		ar: {
			currencySign: "\u202b¤\u200e\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202b¤\u200e\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: true
		},
		fa: {
			currencySign: "\u202a¤\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202a¤\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: false
		},
		he: {
			currencySign: "¤\u200e",
			currencySignTrailing: "¤\u200e",
			shortCurrencySign: "\u200e¤",
			shortCurrencySignTrailing: "\u200e¤",
			transformTrailingCurrency: false
		},
		others: {
			currencySign: "¤",
			currencySignTrailing: "¤",
			shortCurrencySign: "¤",
			shortCurrencySignTrailing: "¤",
			transformTrailingCurrency: true
		}
	};

	/*
	 * CLDR defines for short number formats, in locale en-IN, the Laksh/Crore variant by default.
	 * The UI5 customers prefer the european decimal short formats for their numbers.
	 * These objects are used to overwrite the CLDR Laksh/Crore short formats in the en-IN locales.
	 */
	// If possible in future CLDR versions, remove this hard coded attributes for currencyFormats for en_IN
	static #oIndianCurrencyFormatShort = {
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
	static #oIndiaDecimalFormatShort = {
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

	/**
	 * Update currency format patterns by
	 * <ul>
	 *   <li>adding <code>sap-standard</code> and <code>sap-accounting<code> currency format patterns for all locales,
	 *       ensuring that they have a trailing currency,
	 *   <li>adding <code>currencyFormat-sap-short</code> with trailing currencies for all locales,
	 *   <li>fixing currency format patterns for RTL languages by adding additional RTL characters, e.g. \u202b,
	 *   <li>fixing <code>currencyFormat-short</code> and <code>decimalFormat-short</code> currency formats for
	 *       "en-IN" locale.
	 * </ul>
	 *
	 * @param {string} sCLDRTag The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string,any>} oResult The resulting CLDR object for the current locale
	 */
	static updateCurrencyFormats(sCLDRTag, oResult) {
		// Fix broken indian short currency patterns
		if (sCLDRTag === "en-IN") {
			oResult["currencyFormat-short"] = Generator.#oIndianCurrencyFormatShort;
			oResult["decimalFormat-short"] = Generator.#oIndiaDecimalFormatShort;
		}
		const oReplacements = Generator.#oCurrencySignReplacements[sCLDRTag.split("-")[0]]
			|| Generator.#oCurrencySignReplacements.others;

		const oCurrencyFormat = oResult.currencyFormat;
		const sCurrencySpacingBefore = oCurrencyFormat.currencySpacing.beforeCurrency.insertBetween;

		Generator.updateAccountingAndStandardCurrencyFormat(oCurrencyFormat, oReplacements.currencySign,
			sCurrencySpacingBefore, oReplacements.transformTrailingCurrency, oReplacements.currencySignTrailing);

		const oCurrencyFormatShort = oResult["currencyFormat-short"];
		oResult["currencyFormat-sap-short"] = Generator.updateShortCurrencyFormats(oCurrencyFormatShort,
			oReplacements.shortCurrencySign, sCurrencySpacingBefore, oReplacements.transformTrailingCurrency,
			oReplacements.shortCurrencySignTrailing);
	}

	/**
	 * Updates the values in the given <code>oCurrencyFormatShort</code> object by replacing the currency sign with
	 * the given <code>sShortCurrencySignReplacement</code>, and returns the SAP specific currency format patterns for
	 * <code>currencyFormat-sap-short</code> which always have a trailing currency. Based on the given
	 * <code>bTransformTrailingCurrency</code> the short currency format patterns are first transformed to have a
	 * trailing currency sign character before it is replaced with the given
	 * <code>sShortCurrencySignTrailingReplacement</code>.
	 *
	 * @param {Object<string, string>} oCurrencyFormatShort
	 *   The resulting "currencyFormat-short" value for the current locale; replacements for the short currency format
	 *   are done in this object
	 * @param {string} sShortCurrencySignReplacement
	 *   The locale specific replacement for the currency sign in the short currency format patterns
	 * @param {string} sCurrencySpacingBefore
	 *   The characters which are placed between the amount and the currency in the trailing currency patterns
	 * @param {boolean} bTransformTrailingCurrency
	 *   Whether the "accounting"/"standard" patterns have to be transformed to a pattern with a trailing currency
	 * @param {string} sShortCurrencySignTrailingReplacement
	 *   The locale specific replacement for the currency sign
	 * @returns {Object<string, string>}
	 *   The new value for the SAP specific short currency format patterns ("currencyFormat-sap-short") which have a
	 *   trailing currency
	 */
	static updateShortCurrencyFormats(oCurrencyFormatShort, sShortCurrencySignReplacement, sCurrencySpacingBefore,
		bTransformTrailingCurrency, sShortCurrencySignTrailingReplacement) {
		const oCurrencyFormatShortTrailing = {};
		Object.keys(oCurrencyFormatShort).forEach(function(sKey) {
			const sCurrencyFormatShortValue = oCurrencyFormatShort[sKey];
			oCurrencyFormatShort[sKey] = sCurrencyFormatShortValue
				.replace(rAllCurrencySigns, sShortCurrencySignReplacement);
			oCurrencyFormatShortTrailing[sKey] = Generator.getTrailingShortCurrency(sCurrencyFormatShortValue,
				sCurrencySpacingBefore, bTransformTrailingCurrency, sShortCurrencySignTrailingReplacement);
		});

		return oCurrencyFormatShortTrailing;
	}
}
