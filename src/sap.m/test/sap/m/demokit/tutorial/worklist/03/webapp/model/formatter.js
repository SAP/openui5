sap.ui.define([
	"sap/ui/core/ValueState"],
	function(ValueState) {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},


		/**
		 * Defines a value state based on the stock level
		 * @public
		 * @param {number} iValue the stock level of a product
		 * @returns {sap.ui.core.ValueState} the value state for the stock level
	 	*/
		quantityState: function(iValue) {
			if (iValue === 0) {
				return ValueState.Error;
			} else if (iValue <= 10) {
				return ValueState.Warning;
			} else {
				return ValueState.Success;
			}
        }

	};

});