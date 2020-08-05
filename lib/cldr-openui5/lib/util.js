var path = require("path"),
	fileContent = require("./fileContent.js");

var sFilePathSupple,
	aDayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

module.exports = {
	setSupplePath: function(sPath) {
		sFilePathSupple = sPath;
	},

	getTerritory: function(sTag) {
		var mLikelySubtags = fileContent.getContent(path.join(sFilePathSupple, 'likelySubtags.json')).supplemental.likelySubtags,
			sSubtag = mLikelySubtags[sTag] || sTag,
			aSplit = sSubtag.split("-");

		if (aSplit.length === 2 && aSplit[1].length === 2) {
			return aSplit[1];
		}

		if (aSplit.length >= 3 && aSplit[1].length === 4 && aSplit[2].length === 2) {
			return aSplit[2];
		}
		/*eslint-disable no-console*/
		console.log("failed to determine territory for language tag ", sTag, " falling back to 'world'");
		/*eslint-enable no-console*/
		return "001";
	},

	getCurrencyDigits: function() {
		var sFilePath = path.join(sFilePathSupple, "currencyData.json"),
			mFractions = fileContent.getContent(sFilePath).supplemental.currencyData.fractions,
			sDigits,
			sCurrencyCode,
			res = {};

		var sDefault = mFractions["DEFAULT"] && mFractions["DEFAULT"]["_digits"];

		for (sCurrencyCode in mFractions) {
			sDigits = mFractions[sCurrencyCode]["_digits"];
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
	},

	getWeekData: function(sTag) {
		var mWeekData = fileContent.getContent(path.join(sFilePathSupple, "weekData.json")).supplemental.weekData,
			sTerritory = this.getTerritory(sTag),
			res = {};

		["minDays", "firstDay", "weekendStart", "weekendEnd"].forEach(function(sName) {
			var sValue = mWeekData[sName][sTerritory] || mWeekData[sName]["001"];
			res["weekData-" + sName] = (sName === "minDays") ? parseInt(sValue) : aDayNames.indexOf(sValue);
		});

		return res;
	},

	getTimeData: function(sTag) {
		var mTimeData = fileContent.getContent(path.join(sFilePathSupple, "timeData.json")).supplemental.timeData,
			sTerritory = this.getTerritory(sTag),
			res = {};

		res["timeData"] = mTimeData[sTerritory] || mTimeData["001"];

		return res;
	},

	getCalendarData: function() {
		var mCalendarData = fileContent.getContent(path.join(sFilePathSupple, "calendarData.json")).supplemental.calendarData,
			res = {};

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
	},

	getCalendarPreference: function(sTag) {
		var mCalenderPref = fileContent.getContent(path.join(sFilePathSupple, "calendarPreferenceData.json")).supplemental.calendarPreferenceData,
			sTerritory = this.getTerritory(sTag);
		return mCalenderPref[sTerritory];
	},

	getPluralRules: function(sTag) {
		var mPluralRules = fileContent.getContent(path.join(sFilePathSupple, "plurals.json")).supplemental["plurals-type-cardinal"],
			sLanguage = sTag.split("-")[0],
			oRules = mPluralRules[sLanguage],
			sRule,
			oResult = {};

		["zero", "one", "two", "few", "many"].forEach(function(sKey) {
			sRule = oRules["pluralRule-count-" + sKey];
			if (sRule) {
				oResult[sKey] = sRule.replace(/ +@.*$/, "");
			}
		});

		return {plurals: oResult};
	}
};
