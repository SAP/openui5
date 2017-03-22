/*!
 * ${copyright}
 */

sap.ui.define("sap/ui/fl/support/apps/contentbrowser/utils/HtmlEscapeUtils", function () {
	"use strict";

	/**
	 * Provides utility for handling the URL format of HTML requests in Content Browser.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.utils.HtmlEscapeUtils
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	var HtmlEscapeUtils = {};
	HtmlEscapeUtils.sUnescapedSlash = "/";
	HtmlEscapeUtils.sEscapedSlash = "%2F";

	/**
	 * Replaces all "unescapeSlashes" with "escapeSlashes".
	 * @param {String} sString - input string
	 * @returns {String} - string after replacement
	 * @public
	 */
	HtmlEscapeUtils.escapeSlashes = function (sString) {
		return this._replaceAll(sString, HtmlEscapeUtils.sUnescapedSlash, HtmlEscapeUtils.sEscapedSlash);
	};

	/**
	 * Replaces all "escapeSlashes" with "unescapeSlashes".
	 * @param {String} sString - input string
	 * @returns {String} - string after replacement
	 * @public
	 */
	HtmlEscapeUtils.unescapeSlashes = function (sString) {
		return this._replaceAll(sString, HtmlEscapeUtils.sEscapedSlash, HtmlEscapeUtils.sUnescapedSlash);
	};

	/**
	 * Replaces all specific strings with target strings.
	 * @param {String} sString - input string
	 * @param {String} sSearchString - specific string that needs to be replaced
	 * @param {String} sReplaceString - replacement string
	 * @returns {String} - string after replacement
	 * @private
	 */
	HtmlEscapeUtils._replaceAll = function (sString, sSearchString, sReplaceString) {
		if (sString.indexOf(sSearchString) === -1) {
			return sString;
		}
		return this._replaceAll(sString.replace(sSearchString, sReplaceString), sSearchString, sReplaceString);
	};

	return HtmlEscapeUtils;
});
