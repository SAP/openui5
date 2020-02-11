/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/CodeSnippetGenerator",
	"sap/ui/testrecorder/interaction/Commands"
], function (CodeSnippetGenerator, Commands) {
	"use strict";

	/**
	 * @class  generates a code snippet relevant to OPA5
	 */
	var OPA5CodeSnippetGenerator = CodeSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.OPA5CodeSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {string} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @param {boolean} mData.settings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * @returns {string} a stringified code snippet
	 */
	OPA5CodeSnippetGenerator.prototype._generate = function (mData) {
		var sIdSuffix = mData.controlSelector.interaction && mData.controlSelector.interaction.idSuffix;
		var sAction = this._getActionAsString(mData.action, sIdSuffix);
		if (sAction) {
			// insert actions key in the selector
			mData.controlSelector.actions = [];
		}
		// remove interaction from the selector, as it is needed only in actions
		delete mData.controlSelector.interaction;

		var sSelector = this._getSelectorAsString(mData.controlSelector);
		var sSnippet = "this.waitFor(" + this._getSelectorWithAction(sSelector, sAction) + ");";

		if (mData.settings && mData.settings.formatAsPOMethod) {
			return this._asPOMethod(sSnippet);
		} else {
			return sSnippet;
		}
	};

	OPA5CodeSnippetGenerator.prototype._getActionAsString = function (sAction, sIdSuffix) {
		sIdSuffix = sIdSuffix ? 'idSuffix: "' + sIdSuffix + '"' : "";
		var sParams;
		switch (sAction) {
			case Commands.PRESS:
				sParams = sIdSuffix && "{\n" + this._getIndentation(3) + sIdSuffix + "\n" + this._getIndentation(2) + "}";
				return "new Press(" + sParams + ")";
			case Commands.ENTER_TEXT:
				sParams = "{\n" + this._getIndentation(2) + (sIdSuffix && sIdSuffix + ",\n" + this._getIndentation(2)) +
					'text: "test"' + "\n" + this._getIndentation(1) + "}";
				return "new EnterText(" + sParams + ")";
			default: return "";
		}
	};

	OPA5CodeSnippetGenerator.prototype._getSelectorWithAction = function (sSelector, sAction) {
		return sSelector.replace('actions: []', 'actions: ' + sAction);
	};

	return new OPA5CodeSnippetGenerator();
});
