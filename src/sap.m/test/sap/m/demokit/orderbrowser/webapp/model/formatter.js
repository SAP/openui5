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
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		calculateItemTotal: function (iQuantity, fPrice, sCurrencyCode) {
			var oCurrency = new Currency({showMeasure: false});
			var fTotal = iQuantity * fPrice;
			return oCurrency.formatValue([fTotal.toFixed(2), sCurrencyCode], "string");
		},

		handleBinaryContent: function (vData) {
			if (vData) {
				var sMetaData1 = 'data:image/jpeg;base64,';
				var sMetaData2 = vData.substr(104);// stripping the first 104 bytes  from the binary data when using base64 encoding.
				return sMetaData1 + sMetaData2;
			} else {
				return "../images/Employee.png";
			}
		},

		/**
		 * Provides a text to indicate the delivery status based on shipped and required dates
		 *
		 * @public
		 * @param {object} oRequiredDate required date of the order
		 * @param {object} oShippedDate shipped date of the order
		 * @returns {string} delivery status text from the resource bundle
		 */
		deliveryText: function (oRequiredDate, oShippedDate) {
			var oResourceBundle = this.getModel("i18n").getResourceBundle();

			if (oShippedDate === null) {
				return "None";
			}

			//Delivery is urgent, real life case: delivery takes more than 7 days
			if (oRequiredDate - oShippedDate > 0 && oRequiredDate - oShippedDate <= 432000000) {
				return oResourceBundle.getText("formatterDeliveryUrgent");
			}
			//Delivery is too late
			else if (oRequiredDate < oShippedDate) {
				return oResourceBundle.getText("formatterDeliveryTooLate");
			}
			//Delivery is in time
			else {
				return oResourceBundle.getText("formatterDeliveryInTime");
			}
		},

		/**
		 * Provides a semantic state to indicate the delivery status based on shipped and required dates
		 *
		 * @public
		 * @param {object} oRequiredDate required date of the order
		 * @param {object} oShippedDate shipped date of the order
		 * @returns {string} semantic state of the order
		 */
		deliveryState: function (oRequiredDate, oShippedDate) {
			if (oShippedDate === null) {
				return "None";
			}

			if (oRequiredDate - oShippedDate > 0 && oRequiredDate - oShippedDate <= 432000000) {
				return "Warning";
			} else if (oRequiredDate < oShippedDate) {
				return "Error";
			} else {
				return "Success";
			}
		}
	}
});