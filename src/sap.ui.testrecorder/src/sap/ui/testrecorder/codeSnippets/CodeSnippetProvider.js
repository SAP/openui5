/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/codeSnippets/OPA5CodeSnippetGenerator",
	"sap/ui/testrecorder/codeSnippets/RawCodeSnippetGenerator",
	"sap/ui/testrecorder/codeSnippets/UIVeri5CodeSnippetGenerator",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects"
], function (BaseObject, OPA5CodeSnippetGenerator, RawCodeSnippetGenerator, UIVeri5CodeSnippetGenerator, DialectRegistry, Dialects) {
	"use strict";

	var oCodeSnippetProvider = null;

	/**
	 * @class provides a code snippet based on a given control selector
	 * chooses the correct generation implementation according to the active test dialect
	 */
	var CodeSnippetProvider = BaseObject.extend("sap.ui.testrecorder.codeSnippets.CodeSnippetProvider", {
		constructor: function () {
			if (!oCodeSnippetProvider) {
				Object.apply(this, arguments);
			} else {
				return oCodeSnippetProvider;
			}
		}
	});

	/**
	 *
	 * @param {object} mData data from which to generate a snippet
	 * @param {string} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} oOptions.settings preferences for the snippet e.g. formatting, method wrapping
	 * @param {boolean} mData.settings.formatAsPOMethod true if selectors should be wrapped in a page object method. Default value is true.
	 * @returns {Promise<string>} Promise for a code snippet or error
	 */
	CodeSnippetProvider.prototype.getSnippet = function (mData) {
		var oGenerator = CodeSnippetProvider.getGenerator(DialectRegistry.getActiveDialect());
		return oGenerator.getSnippet(mData);
	};

	/**
	 *
	 * @param {object} sDialect the active dialect
	 * @returns {sap.ui.testrecorder.codeSnippets.CodeSnippetGenerator} code snippet generator
	 */
	CodeSnippetProvider.getGenerator = function (sDialect) {
		switch (sDialect) {
			case Dialects.OPA5: return OPA5CodeSnippetGenerator;
			case Dialects.RAW: return RawCodeSnippetGenerator;
			case Dialects.UIVERI5: return UIVeri5CodeSnippetGenerator;
			default: return RawCodeSnippetGenerator;
		}
	};

	oCodeSnippetProvider = new CodeSnippetProvider();

	return oCodeSnippetProvider;
});
