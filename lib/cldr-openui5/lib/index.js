var util = require("util"),
	events = require("events"),
	generate = require("./generate.js");

/**
 * Generate UI5 CLDR JSON file for each suppported locale using from the modern JSON version CLDR file provided by unicode.org
 * The CLDR data is defined as a npm dependency, use npm update to fetch the latest released version.
 *
 * The generated UI5 CLDR JSON files are saved under folder oOptions.output.
 *
 * @param {object} oOptions The options parameter which contains the necessary settings
 * @param {string} oOptions.output] The path of a folder where the generated UI5 JSON files are stored
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
	var oOptions = this._oOptions,
		that = this;
	generate(oOptions.source, oOptions.output, oOptions.prettyPrint)
		.start()
		.on("allLocaleJSONReady", function(paths) {
			that.emit("generated", paths);
		})
		.on("error", function(err) {
			that.emit("error", err);
		});
};

module.exports = CLDR;
