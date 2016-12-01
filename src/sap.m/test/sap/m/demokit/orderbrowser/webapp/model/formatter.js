sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},

			calculateItemTotal : function (iQuantity, fPrice) {
				var fTotal = iQuantity * fPrice;
				return fTotal.toFixed(2);
			},

			handleBinaryContent: function(bData){
				if(bData) {
					var sSource1 = 'data:image/jpeg;base64,';
					var sSource2 = bData.substr(104);// stripping the first 104 bytes  from the binary data when using base64 encoding.
					return sSource1 + sSource2;
				} else {
					return "../localService/images/employee.jpg"
				}
			}
		};

	}
);