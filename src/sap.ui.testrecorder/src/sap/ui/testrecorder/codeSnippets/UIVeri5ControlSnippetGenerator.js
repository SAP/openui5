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
	 * @param {object} mData.assertion assertion details - property name, type and expected value
	 * @returns {string} a stringified code snippet
	 */
	UIVeri5ControlSnippetGenerator.prototype._generate = function (mData) {
		var sBasicSelector = "element(by.control(" + this._getSelectorAsString(mData.controlSelector) + "))";
		var sSelectorWithAssertion = this._getSelectorWithAssertion(sBasicSelector, mData.assertion);
		return sSelectorWithAssertion + this._getActionAsString(mData.action) + ";";
	};

	UIVeri5ControlSnippetGenerator.prototype._getActionAsString = function (sAction) {
		switch (sAction) {
			case Commands.PRESS: return ".click()";
			case Commands.ENTER_TEXT: return '.sendKeys("test")';
			default: return "";
		}
	};

	UIVeri5ControlSnippetGenerator.prototype._getSelectorWithAssertion = function (sSelector, mAssertion) {
		if (mAssertion) {
			var sMatcher;
			if (!mAssertion.expectedValue || mAssertion.expectedValue === "false") {
				sMatcher = ".toBeFalsy()";
			} else if (mAssertion.propertyType === "boolean") {
				sMatcher = ".toBeTruthy()";
			} else {
				var sExpectedValue = this._escapeQuotes(mAssertion.expectedValue);
				sMatcher = '.toEqual("' + sExpectedValue + '")';
			}

			return 'expect(' + sSelector + '.asControl().getProperty("' + mAssertion.propertyName + '"))' + sMatcher;
		} else {
			return sSelector;
		}
	};

	return new UIVeri5ControlSnippetGenerator();
});
