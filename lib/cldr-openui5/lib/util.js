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

		console.log("failed to determine territory for language tag ", sTag, " falling back to 'world'");
		return "001";
	},

	getCurrencyDigits: function() {
		var sFilePath = path.join(sFilePathSupple, "currencyData.json"),
			mFractions = fileContent.getContent(sFilePath).supplemental.currencyData.fractions,
			sCurrencyCode,
			res = {};

		for (sCurrencyCode in mFractions) {
			res[sCurrencyCode] = parseInt(mFractions[sCurrencyCode]["_digits"], 10);
		}

		return res;
	},

	getWeekData: function(sTag) {
		var mWeekData = fileContent.getContent(path.join(sFilePathSupple, "weekData.json")).supplemental.weekData,
			sTerritory = this.getTerritory(sTag),
			res = {};

		["minDays", "firstDay", "weekendStart", "weekendEnd"].forEach(function(sName) {
			var sValue = mWeekData[sName][sTerritory] || mWeekData[sName]["001"];
			res["weekData-" + sName] = (sName === "minDays") ? parseInt(sValue, 10) : aDayNames.indexOf(sValue); 
		});

		return res;
	},

	getCalendarPreference: function(sTag) {
		var mCalenderPref = fileContent.getContent(path.join(sFilePathSupple, "calendarPreferenceData.json")).supplemental.calendarPreferenceData,
			sTerritory = this.getTerritory(sTag);
		return mCalenderPref[sTerritory];
	}
};