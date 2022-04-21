/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility to replace whitespaces with special characters.
	 * The main purpose is to enable properly displaying of whitespaces in HTML.
	 *
	 * This utility takes as an input a whitespace character, like " ", "\t" and replaces it with
	 * a unicode character, like "\u00A0" (Non-breaking whitespace). The replacement is handled
	 * in the following manner:
	 * <ul>
	 *		<li> If there's a single space (" ") it leaves it as it is. HTML handles properly single whitespaces. </li>
	 *		<li> If there are multiple, consecutive whitespaces "     " or "\t"), it starts to alternate a space with
	 *	\u00A0 (Non-breaking whitespace) character. </li>
	 *		<li> If there is a tab character, it's first converted to 2 spaces and then processed by the steps above. </li>
	 * </ul>
	 *
	 * <b> Note: </b> This utility handles " " (consecutive spaces) and "\t" (tabs). New lines ("\n") would not be handled.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/whitespaceReplacer"], function(whitespaceReplacer){
	 *      whitespaceReplacer("Foo    bar"); // "Foo \u00A0 \u00A0bar"
	 * });
	 *
	 * @function
	 * @since 1.94
	 * @alias module:sap/base/strings/whitespaceReplacer
	 * @param {string} sInput The input string
	 * @returns {string | *} The transformed string or the original input in case the input is not a string
	 * @private
	 * @ui5-restricted sap.m, sap.ui.comp, sap.fe
	 */
	var fnWhitespacesReplacer = function (sInput) {
		var sWhitespace = " ",
			sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

		if (typeof sInput !== "string") {
			return sInput;
		}

		return sInput
			.replaceAll("\t", sWhitespace + sWhitespace) // replace tabs with 2 spaces
			.replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter)); // replace spaces
	};

	return fnWhitespacesReplacer;
});
