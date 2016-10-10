sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Provides the full title for an ObjectListItem in the master list,
			 * consisting of a translated text ("Order") and the order ID.
			 * @param {int} orderId ID of the order
			 * @returns {string} 
			 */
			masterItemTitle : function (orderId) {
				return this.getResourceBundle().getText("masterItemTitle", [ orderId ]);
			},

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
			}
		};

	}
);