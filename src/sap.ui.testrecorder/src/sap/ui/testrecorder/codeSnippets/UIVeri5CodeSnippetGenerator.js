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
	 * @returns {string} a stringified code snippet
	 */
	UIVeri5CodeSnippetGenerator.prototype._generate = function (mData) {
		var sElement = "element(by.control(" + this._getSelectorAsString(mData.controlSelector) + "))";
		var sSnippet = sElement + this._getActionAsString(mData.action) + ";";
		return sSnippet;
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
