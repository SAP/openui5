/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/codeSnippets/OPA5ControlSnippetGenerator",
	"sap/ui/testrecorder/codeSnippets/RawControlSnippetGenerator",
	"sap/ui/testrecorder/codeSnippets/UIVeri5ControlSnippetGenerator",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/Dialects"
], function (BaseObject, OPA5ControlSnippetGenerator, RawControlSnippetGenerator, UIVeri5ControlSnippetGenerator, DialectRegistry, Dialects) {
	"use strict";

	var oControlSnippetProvider = null;

	/**
	 * @class provides a code snippet based on a given control selector
	 * chooses the correct generation implementation according to the active test dialect
	 */
	var ControlSnippetProvider = BaseObject.extend("sap.ui.testrecorder.codeSnippets.ControlSnippetProvider", {
		constructor: function () {
			if (!oControlSnippetProvider) {
				Object.apply(this, arguments);
			} else {
				return oControlSnippetProvider;
			}
		}
	});

	/**
	 *
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @returns {Promise<string>} Promise for a code snippet or error
	 */
	ControlSnippetProvider.prototype.getSnippet = function (mData) {
		var oGenerator = ControlSnippetProvider.getGenerator(DialectRegistry.getActiveDialect());
		return oGenerator.getSnippet(mData).then(function (sSnippet) {
			return sSnippet;
		});
	};

	/**
	 *
	 * @param {object} sDialect the active dialect
	 * @returns {sap.ui.testrecorder.codeSnippets.ControlSnippetGenerator} code snippet generator
	 */
	ControlSnippetProvider.getGenerator = function (sDialect) {
		switch (sDialect) {
			case Dialects.OPA5: return OPA5ControlSnippetGenerator;
			case Dialects.RAW: return RawControlSnippetGenerator;
			case Dialects.UIVERI5: return UIVeri5ControlSnippetGenerator;
			default: return RawControlSnippetGenerator;
		}
	};

	oControlSnippetProvider = new ControlSnippetProvider();

	return oControlSnippetProvider;
});
