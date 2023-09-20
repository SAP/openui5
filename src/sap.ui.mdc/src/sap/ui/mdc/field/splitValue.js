/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Splits the given value on line-breaks and return an array of single values.
	 *
	 * @param {any} vValue The value to be splitted
	 * @param {boolean} bSplitOnTab If <code>true</code>, TAB is also used for splitting. (If <code>BT</code> operator is supported, only real linebreaks are used.)
	 * @return {any[]} Array of single values
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const fnSplitValue = function(vValue, bSplitOnTab) {

		let aSeparatedText;
		if (typeof vValue === "string") {
			// Pasting from Excel on Windows always adds "\r\n" at the end, even if a single cell is selected
			if (vValue.length && vValue.endsWith("\r\n")) {
				vValue = vValue.substring(0, vValue.lastIndexOf("\r\n"));
			}

			if (bSplitOnTab) {
				aSeparatedText = vValue.split(/\r\n|\r|\n|\t/g);
			} else {
				aSeparatedText = vValue.split(/\r\n|\r|\n/g); // use tap as delemiter for between
			}
		} else {
			aSeparatedText = [vValue];
		}

		return aSeparatedText;

	};

	return fnSplitValue;
});
