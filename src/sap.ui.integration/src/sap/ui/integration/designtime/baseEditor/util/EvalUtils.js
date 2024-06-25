/* eslint-disable no-eval */

/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var bIsEvalAllowed;

	// Checks if eval can be used in the current platform (based on CSP restrictions)
	try {
		eval("");
		bIsEvalAllowed = true;
	} catch (e) {
		bIsEvalAllowed = false;
	}

	return {
		/**
		 * @returns {boolean} Whether eval can be used in the current environment
		 */
		isEvalAllowed: function () {
			return bIsEvalAllowed;
		},

		/**
		 * Evaluates a json string which may contains function
         * eg:
         *     "{'type': 'warning','validate': function (value) {return value !== 8;},'message': '8 might not be the best value'}"
		 * @param {string} sJsonString json string
		 * @returns {object} Evaluated json object
		 * @throws Error why eval failed, for example invalid syntax
		 */
		evalJson: function (sJsonString) {
            return eval("(" + sJsonString + ")");
		}
	};
});