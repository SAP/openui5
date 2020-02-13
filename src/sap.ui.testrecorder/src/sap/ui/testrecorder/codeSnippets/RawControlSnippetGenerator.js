/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/ControlSnippetGenerator"
], function (ControlSnippetGenerator) {
	"use strict";

	/**
	 * @class  generates a common code snippet relevant to most supported frameworks
	 */
	var RawControlSnippetGenerator = ControlSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.RawControlSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @returns {string} a stringified code snippet
	 */
	RawControlSnippetGenerator.prototype._generate = function (mData) {
		return this._getSelectorAsString(mData.controlSelector);
	};

	return new RawControlSnippetGenerator();
});
