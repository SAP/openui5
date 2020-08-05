/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var oRawSnippetUtil = null;

	/**
	 * @class provides a formatted code snippet based on a set of control selectors and a settings object.
	 * Should only be used with active Raw dialect.
	 */
	var RawSnippetUtil = BaseObject.extend("sap.ui.testrecorder.codeSnippets.RawSnippetUtil", {
		constructor: function () {
			if (!oRawSnippetUtil) {
				Object.apply(this, arguments);
			} else {
				return oRawSnippetUtil;
			}
		}
	});

	/**
	 *
	 * @param {array} aSnippets an array of snippets - each for a single control
	 * @param {object} mSettings preferences for the snippet e.g. formatting
	 * @param {boolean} multipleSnippets whether the snippets for multiple controls should be combined, or
	 * @returns {string} a code snippet with the expected formatting
	 */
	RawSnippetUtil.prototype.getJSON = function (aSnippets, mSettings) {
		if (mSettings.multipleSnippets) {
			var sRawSnippet = aSnippets.map(function (sSnippet) {
				return sSnippet.replace(/^/gm, "        ");
			}).join(",\n");
			return "{\n    \"selectors\": [\n" + sRawSnippet + "\n    ]\n}";
		} else {
			return aSnippets[0];
		}
	};

	oRawSnippetUtil = new RawSnippetUtil();

	return oRawSnippetUtil;
});
