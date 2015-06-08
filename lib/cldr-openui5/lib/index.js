var util = require("util"),
	events = require("events"),
	fs = require("fs"),
	path = require("path"),
	unzipper = require("./unzipper.js"),
	generate = require("./generate.js"),
	rimraf = require("rimraf"),
	request = require("request"),
	mkdirp = require("mkdirp"),
	statusBar = require("status-bar");

/**
 * Generate UI5 CLDR JSON file for each suppported locale using from the full JSON version CLDR file provided by unicode.org
 * If the full version JSON zip file is already downloaded from unicode.org, set the path to oOptions.zip. Otherwise give a
 * CLDR version number and the corresponding CLDR zip file is downloaded from unicode.org.
 *
 * The generated UI5 CLDR JSON files are saved under folder oOptions.output.
 *
 * @param {object} oOptions The options parameter which contains the necessary settings
 * @param {string} [oOptions.zip] The path of the CLDR JSON zip file. If this is not set, oOptions.download must be set.
 * @param {string} oOptions.output] The path of a folder where the generated UI5 JSON files are stored
 * @param {string} [oOptoins.temp="./temp"] The path of a folder where the temporary files are saved. This folder will be deleted after the generation.
 * @param {number} [oOptions.download] The version of full CLDR json file which is downloaded from unicode.org. Unicode provides JSON CLDR zips only from version 25.
 * @param {string} [oOptions.file="json-full.zip"] The name of the file from unicode.org. By default, the file with name 'json-full.zip' is downloaded. But in some
 *  other version CLDR, the file is named differently as 'json-full.zip', for example 'json_full.zip' in version 25.
 *
 * @class
 * @constructor
 *
 */
function CLDR(oOptions) {
		if (!(this instanceof CLDR)) {
			return new CLDR(oOptions);
		}
		this._oOptions = oOptions;
		events.EventEmitter.call(this);
}

util.inherits(CLDR, events.EventEmitter);

CLDR.prototype.start = function() {
	var self = this,
		oOptions = this._oOptions;

	if (oOptions.download) {
		oOptions.file = oOptions.file || "json-full.zip";
		var sPath = path.join(oOptions.tmp, oOptions.file),
				sUrl = "http://unicode.org/Public/cldr/" + oOptions.download + "/" + oOptions.file;

		this.emit("download", sUrl);
		request({
			url: sUrl,
			proxy: process.env.HTTP_PROXY
		}).on('response', function(response) {
			if (response.statusCode !== 200) {
				self.emit("error", new Error("The file " + sUrl + " can't be found"));
				return;
			}

			mkdirp.sync(oOptions.tmp);

			var oBar = statusBar.create({
				total: response.headers["content-length"]
			}).on("render", function(stats) {
				process.stdout.write(
					path.basename(sUrl) + " " +
					this.format.storage(stats.currentSize) + " " +
					this.format.speed(stats.speed) + " " +
					this.format.time(stats.elapsedTime) + " " +
					this.format.time(stats.remainingTime) + " [" +
					this.format.progressBar(stats.percentage) + "] " +
					this.format.percentage(stats.percentage));
				process.stdout.cursorTo(0);
			}).on("finish", function() {
				process.stdout.write("\n");
			});

			response.pipe(oBar);
			response.pipe(fs.createWriteStream(sPath))
			.on("finish", function() {
				self.emit("downloaded");
				oOptions.zip = sPath;
				self._start();
			});
		}).on("error", function(err) {
			self.emit("error", err);
		});
	} else {
		this._start();
	}

	return this;
};

CLDR.prototype._start = function() {
	var oOptions = this._oOptions,
		self = this;
	self.emit("unzip", oOptions.zip);
	unzipper()
	.extract(oOptions.zip, oOptions.tmp)
	.on("finish", function(paths) {
		self.emit("unzipped", paths);

		generate(oOptions.tmp, oOptions.output, oOptions.prettyPrint)
			.start()
			.on("allLocaleJSONReady", function(paths) {
				self.emit("generated", paths);
			})
			.on("error", function(err) {
				self.emit("error", err);
			});

		rimraf(oOptions.tmp, function(err) {
			if (err) {
				self.emit("error", err);
			} else {
				self.emit("tempFolderDeleted", oOptions.tmp);
			}
		});
	}).on("error", function(err) {
		self.emit("error", err);
	});
};

module.exports = CLDR;
