/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	'use strict';

	/**
	 * This utility class is a collection of helper functions for asyncHints.
	 *
	 * @class Utility class for asyncHints
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 */
	var AsyncHintsHelper = {};

	/**
	 * The helper function rewrites URLs of an asyncHints object using a
	 * callback function with specific string manipulations, especially
	 * for 'sap.ui.core.Component.create' and 'sap.ui.core.Component.load'.
	 * Only URLs of defined components and libs are affected.
	 *
	 * @param {object} oAsyncHints An object that provides hints for asynchronous loading (@see sap.ui.core.Component#load)
	 * @param {function} fnUrlModifier A callback function that gets a URL string passed and returns its manipulated value
	 * @return {object} The manipulated asyncHints object
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 */
	AsyncHintsHelper.modifyUrls = function(oAsyncHints, fnUrlModifier) {
		// Function to remove url property if its value is undefined
		function _removeUrlIfUndefined(oAsyncHint, sUrl) {
			if (sUrl === undefined) {
				delete oAsyncHint.url;
			}
		}

		// Modify components and libs
		[oAsyncHints.components, oAsyncHints.libs].forEach(function(aItems) {
			if (Array.isArray(aItems)) {
				aItems.forEach(function(vAsyncHint) {
					if (typeof vAsyncHint !== "object") {
						return;
					}

					if (typeof vAsyncHint.url === "string") {
						vAsyncHint.url = fnUrlModifier(vAsyncHint.url);
						_removeUrlIfUndefined(vAsyncHint, vAsyncHint.url);
					} else if (typeof vAsyncHint.url === "object" && typeof vAsyncHint.url.url === "string") {
						vAsyncHint.url.url = fnUrlModifier(vAsyncHint.url.url);
						_removeUrlIfUndefined(vAsyncHint, vAsyncHint.url.url);
					}
				});
			}
		});

		return oAsyncHints;
	};

	return AsyncHintsHelper;
});