sap.ui.define([
		"sap/ui/model/type/Currency"
	], function (Currency) {
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
			calculateItemTotal : function (iQuantity, fPrice, sCurrencyCode) {
				var oCurrency = new Currency({showMeasure: false});
				var fTotal = iQuantity * fPrice;
				return oCurrency.formatValue([fTotal.toFixed(2), sCurrencyCode], "string");
			},

			handleBinaryContent: function(vData){
				if(vData) {
					var sMetaData1 = 'data:image/jpeg;base64,';
					var sMetaData2 = vData.substr(104);// stripping the first 104 bytes  from the binary data when using base64 encoding.
					return sMetaData1 + sMetaData2;
				} else {
					return "../images/Employee.png";
				}
			}
		};

	}
);