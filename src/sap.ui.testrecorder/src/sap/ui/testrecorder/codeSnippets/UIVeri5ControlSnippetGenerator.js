/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/ControlSnippetGenerator",
	"sap/ui/testrecorder/interaction/Commands"
], function (ControlSnippetGenerator, Commands) {
	"use strict";

	/**
	 * @class  generates a code snippet relevant to UIVeri5
	 */
	var UIVeri5ControlSnippetGenerator = ControlSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.UIVeri5ControlSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @returns {string} a stringified code snippet
	 */
	UIVeri5ControlSnippetGenerator.prototype._generate = function (mData) {
		var sElement = "element(by.control(" + this._getSelectorAsString(mData.controlSelector) + "))";
		return sElement + this._getActionAsString(mData.action) + ";";
	};

	UIVeri5ControlSnippetGenerator.prototype._getActionAsString = function (sAction) {
		switch (sAction) {
			case Commands.PRESS: return ".click()";
			case Commands.ENTER_TEXT: return '.sendKeys("test")';
			default: return "";
		}
	};

	return new UIVeri5ControlSnippetGenerator();
});
