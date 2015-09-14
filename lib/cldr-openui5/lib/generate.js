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

/**
 * Generates the UI5 locale JSON files using the original JSON files.
 */
function Generator(sSrcFolder, sOutputFolder, bPrettyPrint) {
	if (!(this instanceof Generator)) {
		return new Generator(sSrcFolder, sOutputFolder, bPrettyPrint);
	}
	this._sSrcFolder = sSrcFolder;
	this._sOutputFolder = sOutputFolder;
	this._bPrettyPrint = bPrettyPrint;
	events.EventEmitter.call(this);
}

nodeUtil.inherits(Generator, events.EventEmitter);

Generator.prototype.start = function() {
	var sSrcFolder = this._sSrcFolder,
		sOutputFolder = this._sOutputFolder,
		self = this,
		sLicense = "This file has been derived from Unicode Common Locale Data Repository (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice in the Unicode-Data-Files-LICENSE.txt available at the same location as this file or visit http://www.unicode.org/copyright.html",
		sFolderPathMain = path.join(sSrcFolder, "main"),
		sFolderPathSupple = path.join(sSrcFolder, "supplemental"),
		sFilePath,
		sFileName,
		oData,
		oResult = {},
		oOutputData,
		aTasks = [];

	util.setSupplePath(sFolderPathSupple);

	var aSubFolders = fs.readdirSync(sFolderPathMain),
		mCurrencyDigits = util.getCurrencyDigits();

	aSubFolders.forEach(function(sTag) {
		var aTagSplit = sTag.split("-"),
			sLanguage = aTagSplit[0],
			sNewTag = aTagSplit.join("_"),
			sCalendarPref = util.getCalendarPreference(sTag),
			aSubTasks;

		// compose the UI5 locale name from the original CLDR locale name
		if (aTagSplit.length === 3) {
			aTagSplit.splice(1, 1);
			sNewTag = aTagSplit.join("_");
		}

		// insert the license string
		oResult = {"__license": sLicense};

		sFilePath = path.join(sFolderPathMain, sTag);

		// process each of the configs
		configs.forEach(function(mConfig) {
			sFileName = path.join(sFilePath, mConfig.fileName);
			oData = fileContent.getContent(sFileName).main[sTag];
			oOutputData = new j2j.ObjectTemplate(mConfig.template).transform(oData);
			// extends the result with transformed data using the config
			extend(true, oResult, oOutputData);
		});

		// extend result with static data:
		//	currencyDigits
		//	weekData
		extend(oResult, {currencyDigits: mCurrencyDigits});
		extend(oResult, util.getWeekData(sTag));

		if (sCalendarPref) {
			// if calendar preference exits, also extend the result with it
			extend(oResult, {
				"calendarPreference": sCalendarPref
			});
		}
		
		// For asian short number remove the 1000-other property. This already has been
		// done in the new CLDR GitHub repository and can be removed once the generation
		// has been migrated to the new source.
		// See http://unicode.org/cldr/trac/ticket/8773
		if (sLanguage == "ja" || sLanguage == "ko" || sLanguage == "zh") {
			if (sNewTag != "zh_TW") { // Taiwan uses K in short notation
				delete oResult["decimalFormat-short"]["1000-other"];
			}
			delete oResult["decimalFormat-long"]["1000-other"];
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
					var sPath = path.resolve(path.join(sOutputFolder, sNewTag + '.json'));
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
