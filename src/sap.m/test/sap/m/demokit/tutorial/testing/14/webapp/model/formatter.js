sap.ui.define([
	"sap/m/Text",
	"sap/ui/demo/bulletinboard/model/DateFormatter"
], function (Text, DateFormatter) {
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
		 * Defines a value state based on the price
		 *
		 * @public
		 * @param {number} iPrice the price of a post
		 * @returns {string} sValue the state for the price
		 */
		priceState: function (iPrice) {
			if (iPrice < 50) {
				return "Success";
			} else if (iPrice >= 50 && iPrice < 250 ) {
				return "None";
			} else if (iPrice >= 250 && iPrice < 2000 ) {
				return "Warning";
			} else {
				return "Error";
			}
		},

		/**
		 * Creates a human readable date
		 *
		 * @public
		 * @param {date} oDate the date of the property.
		 * @returns {string} sValue the formatted date
		 */
		date: function(oDate) {
			return new DateFormatter({ now: Date.now }).format(oDate);
		}
};

});
