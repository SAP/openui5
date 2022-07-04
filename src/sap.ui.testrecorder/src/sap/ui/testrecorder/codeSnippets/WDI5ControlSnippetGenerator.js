/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/ui/testrecorder/codeSnippets/ControlSnippetGenerator",
		"sap/ui/testrecorder/interaction/Commands"
	],
	function (ControlSnippetGenerator, Commands) {
		"use strict";

		/**
		 * @class  generates a code snippet relevant to UIVeri5
		 */
		var WDI5ControlSnippetGenerator = ControlSnippetGenerator.extend(
			"sap.ui.testrecorder.codeSnippets.WDI5ControlSnippetGenerator",
			{}
		);

		/**
		 * @param {object} mData data from which to generate a snippet
		 * @param {object} mData.controlSelector control selector in string format
		 * @param {string} mData.action name of the action to record for the control
		 * @param {object} mData.assertion assertion details - property name, type and expected value
		 * @returns {string} a stringified code snippet
		 */
		WDI5ControlSnippetGenerator.prototype._generate = function (mData) {
			var sBasicSelector =
				"await browser.asControl({\n\tselector: " +
				this._getSelectorAsString(mData.controlSelector) +
				"})";
			var sSelectorWithAssertion = this._getSelectorWithAssertion(
				sBasicSelector,
				mData.assertion
			);
			return (
				sSelectorWithAssertion +
				this._getActionAsString(mData.action) +
				";"
			);
		};

		WDI5ControlSnippetGenerator.prototype._getSelectorAsString = function (mControlSelector) {
			var sSelector = JSON.stringify(mControlSelector, undefined, 8);
			// remove quotes from keys. our key names are 'safe'
			return sSelector.replace(/\"([^(\")"]+)\":/g, "$1:");
		};

		WDI5ControlSnippetGenerator.prototype._getActionAsString = function (
			sAction
		) {
			switch (sAction) {
				case Commands.PRESS:
					return ".press()";
				case Commands.ENTER_TEXT:
					return '.enterText("test")';
				default:
					return "";
			}
		};

		WDI5ControlSnippetGenerator.prototype._getSelectorWithAssertion =
			function (sSelector, mAssertion) {
				if (mAssertion) {
					var sMatcher;
					if (
						!mAssertion.expectedValue ||
						mAssertion.expectedValue === "false"
					) {
						sMatcher = ".toBeFalsy()";
					} else if (mAssertion.propertyType === "boolean") {
						sMatcher = ".toBeTruthy()";
					} else {
						var sExpectedValue = this._escapeQuotes(
							mAssertion.expectedValue
						);
						sMatcher = '.toEqual("' + sExpectedValue + '")';
					}
					// we need the first letter upper case to build our getter
					var sPropertyNameWithFirstLetterUpperCase =
						mAssertion.propertyName[0].toUpperCase() +
						mAssertion.propertyName.slice(1);
					return (
						'const ' + mAssertion.propertyName + ' = ' + sSelector +
						'.get' + sPropertyNameWithFirstLetterUpperCase
						+ '();\nexpect(' + mAssertion.propertyName + ')' + sMatcher
					);
				} else {
					return sSelector;
				}
			};

		return new WDI5ControlSnippetGenerator();
	}
);