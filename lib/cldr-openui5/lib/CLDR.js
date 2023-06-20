import { EventEmitter } from "node:events";
import Generator from "./Generator.js";

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
export default class CLDR extends EventEmitter {
	constructor(oOptions) {
		super();
		this._oOptions = oOptions;
	}

	async start() {
		const oOptions = this._oOptions;
		const oGenerator = new Generator(oOptions.source, oOptions.output, oOptions.prettyPrint, oOptions.version);
		(await oGenerator.start())
			.on("allLocaleJSONReady", (paths) => this.emit("generated", paths))
			.on("error", (err) => this.emit("error", err));
	}
}
