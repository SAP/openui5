sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";

	return {
		/**
		 * Rounds the number unit value to 2 digits
		 *
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * Formats the integer value from the model to a boolean for the pressed state of the flagged button
		 *
		 * @public
		 * @param {string} iFlagged the integer value from the model
		 * @returns {boolean} bValue converted to boolean
		 */
		flagged: function (iFlagged) {
			if (iFlagged === 1) {
				return true;
			}
			return false;
		}
	};

});
