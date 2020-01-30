/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects"
], function (BaseObject, DialectRegistry, Dialects) {
	"use strict";

	var oPOMethodUtil = null;

	/**
	 * @class provides a formatted code snippet based on a set of control selectors and a settings object
	 */
	var POMethodUtil = BaseObject.extend("sap.ui.testrecorder.codeSnippets.POMethodUtil", {
		constructor: function () {
			if (!oPOMethodUtil) {
				Object.apply(this, arguments);
			} else {
				return oPOMethodUtil;
			}
		}
	});

	/**
	 *
	 * @param {array} aSnippets an array of snippets - each for a single control
	 * @param {object} mSettings preferences for the snippet e.g. formatting
	 * @param {boolean} mSettings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * Note that the result depends on the globally active dialect. The raw dialect will not be formatted!
	 * @returns {string} a code snippet with the expected formatting
	 */
	POMethodUtil.prototype.getPOMethod = function (aSnippets, mSettings) {
		if (mSettings && mSettings.formatAsPOMethod && DialectRegistry.getActiveDialect() !== Dialects.RAW) {
			var sSnippet = aSnippets.map(function (sSnippet) {
				return sSnippet.replace(/^/gm, "    ");
			}).join("\n\n");
			return "<iDoAction>: function () {\n" + sSnippet + "\n}";
		} else {
			return aSnippets.join("\n\n");
		}
	};

	oPOMethodUtil = new POMethodUtil();

	return oPOMethodUtil;
});
