import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let mContent = {};

const fileContent = {
	/**
	 * Returns the content of a given file path. The file has to be a JSON file.
	 *
	 * @param {string} sFilePath The path to the file
	 *
	 * @returns {Object<string, any>} Returns an object with the content of the given file path
	 */
	getContent(sFilePath) {
		const sFileName = resolve(sFilePath);
		if (!mContent[sFileName]) {
			mContent[sFileName] = JSON.parse(readFileSync(sFilePath, "utf8"));
		}

		return mContent[sFileName];
	},

	/**
	 * Clears the cache.
	 */
	clearCache() {
		mContent = {};
	}
};

export default fileContent;