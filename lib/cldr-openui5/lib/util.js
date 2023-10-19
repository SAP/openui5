import { join } from "node:path";
import fileContent from "./fileContent.js";

const aDayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
let sFilePathSupple;

export function setSupplePath(sPath) {
	sFilePathSupple = sPath;
}

export function getTerritory(sTag) {
	const mLikelySubtags = fileContent.getContent(join(sFilePathSupple, "likelySubtags.json")).supplemental
		.likelySubtags;
	const sSubtag = mLikelySubtags[sTag] || sTag;
	const aSplit = sSubtag.split("-");

	if (aSplit.length === 2 && aSplit[1].length === 2) {
		return aSplit[1];
	}

	if (aSplit.length >= 3 && aSplit[1].length === 4 && aSplit[2].length === 2) {
		return aSplit[2];
	}
	console.log("failed to determine territory for language tag ", sTag, " falling back to 'world'");
	return "001";
}

export function getCurrencyDigits() {
	const sFilePath = join(sFilePathSupple, "currencyData.json");
	const mFractions = fileContent.getContent(sFilePath).supplemental.currencyData.fractions;
	const sDefault = mFractions["DEFAULT"] && mFractions["DEFAULT"]["_digits"];
	const res = {};

	for (const sCurrencyCode in mFractions) {
		const sDigits = mFractions[sCurrencyCode]["_digits"];
		res[sCurrencyCode] = parseInt(sDigits);

		// remove values which are the same as the default (redundant)
		if ( sCurrencyCode !== "DEFAULT" && sDigits === sDefault ) {
			res[sCurrencyCode] = undefined; //set to undefined instead of delete to keep the order
		}
	}
	// manually set the HUF and TWD digits to 0
	// as the reasonable default expected by the application
	res["HUF"] = 0;
	res["TWD"] = 0;

	return res;
}

export function getWeekData(sTag) {
	const mWeekData = fileContent.getContent(join(sFilePathSupple, "weekData.json")).supplemental.weekData;
	const sTerritory = this.getTerritory(sTag);
	const res = {};

	["minDays", "firstDay", "weekendStart", "weekendEnd"].forEach(function(sName) {
		const sValue = mWeekData[sName][sTerritory] || mWeekData[sName]["001"];
		res["weekData-" + sName] = (sName === "minDays") ? parseInt(sValue) : aDayNames.indexOf(sValue);
	});

	return res;
}

export function getTimeData(sTag) {
	const mTimeData = fileContent.getContent(join(sFilePathSupple, "timeData.json")).supplemental.timeData;
	const sTerritory = this.getTerritory(sTag);
	const res = {};

	res["timeData"] = mTimeData[sTerritory] || mTimeData["001"];

	return res;
}

export function getCalendarData() {
	const mCalendarData = fileContent.getContent(join(sFilePathSupple, "calendarData.json")).supplemental.calendarData;
	const res = {};

	res["eras-gregorian"] = mCalendarData.gregorian.eras;
	res["eras-islamic"] = mCalendarData.islamic.eras;
	res["eras-persian"] = mCalendarData.persian.eras;
	res["eras-buddhist"] = mCalendarData.buddhist.eras;

	// To reduce file size, just include japanese emperors (Modern Japan - eras from 1868)
	res["eras-japanese"] = {};
	["232", "233", "234", "235", "236"].forEach(function(sEra) {
		res["eras-japanese"][sEra] = mCalendarData.japanese.eras[sEra];
	});

	return res;
}

export function getCalendarPreference(sTag) {
	const sFilePath = join(sFilePathSupple, "calendarPreferenceData.json");
	const mCalenderPref = fileContent.getContent(sFilePath).supplemental.calendarPreferenceData;
	const sTerritory = this.getTerritory(sTag);

	return mCalenderPref[sTerritory];
}

export function getPluralRules(sTag) {
	const mPluralRules = fileContent.getContent(join(sFilePathSupple, "plurals.json"))
		.supplemental["plurals-type-cardinal"];
	const sLanguage = sTag.split("-")[0];
	const oRules = mPluralRules[sLanguage];
	const oResult = {};

	["zero", "one", "two", "few", "many"].forEach(function(sKey) {
		const sRule = oRules["pluralRule-count-" + sKey];
		if (sRule) {
			oResult[sKey] = sRule.replace(/ +@.*$/, "");
		}
	});

	return {plurals: oResult};
}

/**
 * Retrieves the "dayPeriodRuleSet" property from a given "dayPeriods.json" of a specified
 * locale.
 *
 * @param {string} sTag The given CLDR language tag of the locale
 * @returns {{dayPeriodRules: Object<string, object>}}
 *   The JSON object, containing the "dayPeriodRules" values for the locale file of the given
 *   language tag
 * @throws {Error}
 *   If the given CLDR day period rule set contains the deprecated properties '_to' or '_after'
 *
 * @private
 */
export function getDayPeriodRules(sTag) {
	const mDayPeriodRuleSet = fileContent.getContent(join(sFilePathSupple, "dayPeriods.json"))
		.supplemental.dayPeriodRuleSet;
	const oDayPeriods = mDayPeriodRuleSet[sTag];

	for (const sDayPeriodKey in oDayPeriods) {
		if (oDayPeriods[sDayPeriodKey].hasOwnProperty("_to")) {
			throw new Error("'" + sTag + "' contains deprecated property '_to'");
		} else if (oDayPeriods[sDayPeriodKey].hasOwnProperty("_after")) {
			throw new Error("'" + sTag + "' contains deprecated property '_after'");
		}
	}

	return {dayPeriodRules : mDayPeriodRuleSet[sTag.split("-")[0]]};
}