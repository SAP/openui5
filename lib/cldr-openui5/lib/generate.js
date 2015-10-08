require('coffee-script/register');

var nodeUtil = require("util"),
	events = require("events"),
	path = require("path"),
	fs = require("fs"),
	// pull request already submitted to json2json project
	// TODO: swtich back to json2json module once the pull request is merged
	j2j = require('json2json-openui5'),
	extend = require('extend'),
	mkdirp = require("mkdirp"),
	async = require("async"),
	configs = require("./config.js"),
	util = require("./util.js"),
	fileContent = require("./fileContent.js");

var aUI5Tags = ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY",
                	"en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es",
                	"es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr",
                	"fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "ko", "lt",
                	"lv", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sv",
                	"th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"];

/**
 * Generates the UI5 locale JSON files using the original JSON files.
 */
function Generator(sOutputFolder, bPrettyPrint) {
	if (!(this instanceof Generator)) {
		return new Generator(sOutputFolder, bPrettyPrint);
	}
	this._sOutputFolder = sOutputFolder;
	this._bPrettyPrint = bPrettyPrint;
	events.EventEmitter.call(this);
}

function getCLDRTag(sUI5Tag) {
	switch(sUI5Tag) {
		case "zh_CN": return "zh-Hans-CN";
		case "zh_SG": return "zh-Hans-SG";
		case "zh_TW": return "zh-Hant-TW";
		case "zh_HK": return "zh-Hans-HK";
		default: return sUI5Tag.replace(/_/, "-");
	}
}

nodeUtil.inherits(Generator, events.EventEmitter);

Generator.prototype.start = function() {
	var sSrcFolder = "node_modules",
		sOutputFolder = this._sOutputFolder,
		self = this,
		sLicense = "This file has been derived from Unicode Common Locale Data Repository (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice in the Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit http://www.unicode.org/copyright.html",
		sFolderPathSupple = path.join(sSrcFolder, "cldr-core", "supplemental"),
		sFilePath,
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
			sLanguage = sUI5Tag.split("_")[0],
			sCalendarPref = util.getCalendarPreference(sCLDRTag),
			aSubTasks;

		// insert the license string
		oResult = {"__license": sLicense};

		// process each of the configs
		configs.forEach(function(mConfig) {
			// Ugly file path fallback, latest CLDR does not contain CN/TW files anymore
			if (sCLDRTag == "zh-Hans-CN") sPathTag = "zh-Hans";
			if (sCLDRTag == "zh-Hant-TW") sPathTag = "zh-Hant";
			sFileName = path.join(sSrcFolder, mConfig.packageName, "main", sPathTag, mConfig.fileName);
			oData = fileContent.getContent(sFileName).main[sPathTag];
			oOutputData = new j2j.ObjectTemplate(mConfig.template).transform(oData);
			// extends the result with transformed data using the config
			extend(true, oResult, oOutputData);
		});

		// extend result with static data:
		//	currencyDigits
		//	weekData
		//  calendarData
		extend(oResult, {currencyDigits: mCurrencyDigits});
		extend(oResult, util.getWeekData(sCLDRTag));
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
					fs.writeFile(sPath, JSON.stringify(r, null, self._bPrettyPrint ? '\t' : 0), function(err) {
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
					self.emit("localeJSONReady", results[1]);
				} else {
					self.emit("error", err);
				}
				callback(err, results[1]);
			});
		});
	});

	// execute the aTasks
	async.parallel(aTasks, function(err, results) {
		if (!err) {
			self.emit("allLocaleJSONReady", results);
		} else {
			self.emit("error", err);
		}
	});

	return this;
};

module.exports = Generator;
