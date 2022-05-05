/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/interaction/Commands"
], function (BaseObject, Commands) {
	"use strict";

	var oPOMethodUtil = null;

	/**
	 * @class provides a formatted code snippet based on a set of control selectors and a settings.
	 * Should not be used with active Raw dialect
	 */
	var POMethodUtil = BaseObject.extend("sap.ui.testrecorder.codeSnippets.POMethodUtil", {
		constructor: function () {
			if (!oPOMethodUtil) {
				BaseObject.apply(this, arguments);
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
	 * @param {boolean} mSettings.multipleSnippets true if the snippets for multiple controls should be combined
	 * @param {string} mSettings.action name of the current (latest) action
	 * @param {boolean} bAsync whether the page object method should be async or not
	 * @returns {string} a code snippet with the expected formatting
	 */
	POMethodUtil.prototype.getPOMethod = function (aSnippets, mSettings, bAsync) {
		if (mSettings && mSettings.formatAsPOMethod) {
			var sSnippet = aSnippets.map(function (sSnippet) {
				return sSnippet.replace(/^/gm, "    ");
			}).join("\n\n");
			if (bAsync) {
				return this._getMethodName(mSettings) + ": async () => {\n" + sSnippet + "\n}";
			} else {
				return this._getMethodName(mSettings) + ": function () {\n" + sSnippet + "\n}";
			}
		} else {
			return aSnippets.join("\n\n");
		}
	};

	POMethodUtil.prototype._getMethodName = function (mSettings) {
		if (mSettings.multipleSnippets) {
			switch (mSettings.action) {
				case Commands.PRESS:
				case Commands.ENTER_TEXT: return "iInteractWithTheControls";
				default: return "iAssertTheUIState";
			}
		} else {
			switch (mSettings.action) {
				case Commands.PRESS: return "iPressTheControl";
				case Commands.ENTER_TEXT: return "iEnterTextInTheControl";
				default: return "iAssertTheControlState";
			}
		}
	};

	oPOMethodUtil = new POMethodUtil();

	return oPOMethodUtil;
});
