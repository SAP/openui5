/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/CodeSnippetGenerator"
], function (CodeSnippetGenerator) {
	"use strict";

	/**
	 * @class  generates a common code snippet relevant to most supported frameworks
	 */
	var RawCodeSnippetGenerator = CodeSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.RawCodeSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {string} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @returns {string} a stringified code snippet
	 */
	RawCodeSnippetGenerator.prototype._generate = function (mData) {
		return this._getSelectorAsString(mData.controlSelector);
	};

	return new RawCodeSnippetGenerator();
});
