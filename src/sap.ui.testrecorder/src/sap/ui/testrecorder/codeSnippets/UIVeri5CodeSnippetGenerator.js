/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/CodeSnippetGenerator",
	"sap/ui/testrecorder/interaction/Commands"
], function (CodeSnippetGenerator, Commands) {
	"use strict";

	/**
	 * @class  generates a code snippet relevant to UIVeri5
	 */
	var UIVeri5CodeSnippetGenerator = CodeSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.UIVeri5CodeSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {string} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	* @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @param {boolean} mData.settings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * @returns {string} a stringified code snippet
	 */
	UIVeri5CodeSnippetGenerator.prototype._generate = function (mData) {
		var sElement = "element(by.control(" + this._getSelectorAsString(mData.controlSelector) + "))";
		var sSnippet = sElement + this._getActionAsString(mData.action) + ";";

		if (mData.settings && mData.settings.formatAsPOMethod) {
			return this._asPOMethod(sSnippet);
		} else {
			return sSnippet;
		}
	};

	UIVeri5CodeSnippetGenerator.prototype._getActionAsString = function (sAction) {
		switch (sAction) {
			case Commands.PRESS: return ".click()";
			case Commands.ENTER_TEXT: return '.sendKeys("test")';
			default: return "";
		}
	};

	return new UIVeri5CodeSnippetGenerator();
});
