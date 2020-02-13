/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object"
], function ($, BaseObject) {
	"use strict";

	 /**
	 * @class  generic class that generates a code snippet based on some control selector
	 * every class that extends it, should implement the _generate method
	 */
	var ControlSnippetGenerator = BaseObject.extend("sap.ui.testrecorder.codeSnippets.ControlSnippetGenerator", {});

	/**
	 *
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @param {boolean} mData.settings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * @returns {Promise<string>} Promise for a code snippet or error
	 */
	ControlSnippetGenerator.prototype.getSnippet = function (mData) {
		return new Promise(function (resolve, reject) {
			if (!mData || !mData.controlSelector) {
				reject(new Error("Control selector is required!"));
			}
			var sSnippet = this._generate($.extend(true, {}, mData));
			resolve(sSnippet);
		}.bind(this));
	};

	/**
	 * Implement this method by each dialect-specific snippet generator
	 *
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @param {boolean} mData.settings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * Note that this setting makes no sense for the Raw snippet generator and therefore doesn't change its output.
	 * @returns {string} a stringified code snippet
	 */
	ControlSnippetGenerator.prototype._generate = function () {
		return "";
	};

	ControlSnippetGenerator.prototype._getSelectorAsString = function (sControlSelector) {
		var sSelector = JSON.stringify(sControlSelector, undefined, 4);
		// remove quotes from keys. our key names are 'safe'
		return sSelector.replace(/\"([^(\")"]+)\":/g, "$1:");
	};

	ControlSnippetGenerator.prototype._getIndentation = function (iTimes) {
		var sResult = "";
		for (var i = 0; i < iTimes * 4; i += 1) {
			sResult += " ";
		}
		return sResult;
	};

	return ControlSnippetGenerator;
});
