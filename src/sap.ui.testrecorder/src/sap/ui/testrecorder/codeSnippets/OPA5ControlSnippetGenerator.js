/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/ControlSnippetGenerator",
	"sap/ui/testrecorder/interaction/Commands"
], function (ControlSnippetGenerator, Commands) {
	"use strict";

	/**
	 * @class  generates a code snippet relevant to OPA5
	 */
	var OPA5ControlSnippetGenerator = ControlSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.OPA5ControlSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @returns {string} a stringified code snippet
	 */
	OPA5ControlSnippetGenerator.prototype._generate = function (mData) {
		var sIdSuffix = mData.controlSelector.interaction && mData.controlSelector.interaction.idSuffix;
		var sAction = this._getActionAsString(mData.action, sIdSuffix);
		if (sAction) {
			// insert actions key in the selector
			mData.controlSelector.actions = [];
		}
		// remove interaction from the selector, as it is needed only in actions
		delete mData.controlSelector.interaction;

		var sSelector = this._getSelectorAsString(mData.controlSelector);
		return "this.waitFor(" + this._getSelectorWithAction(sSelector, sAction) + ");";
	};

	OPA5ControlSnippetGenerator.prototype._getActionAsString = function (sAction, sIdSuffix) {
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

	OPA5ControlSnippetGenerator.prototype._getSelectorWithAction = function (sSelector, sAction) {
		return sSelector.replace('actions: []', 'actions: ' + sAction);
	};

	return new OPA5ControlSnippetGenerator();
});
