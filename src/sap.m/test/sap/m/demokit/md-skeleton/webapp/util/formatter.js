sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Returns None for phone and SingleSelectMaster for other devices
		 *
		 * @public
		 * @param bIsPhone
		 * @returns {sap.m.ListMode}
		 */
		listMode : function (bIsPhone) {
			return (bIsPhone ? "None" : "SingleSelectMaster");
		},

		/**
		 * Returns Active for phone and Inactive for other devices
		 *
		 * @public
		 * @param bIsPhone
		 * @returns {string}
		 */
		listItemType : function (bIsPhone) {
			return (bIsPhone ? "Active" : "Inactive");
		},

		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param sValue
		 * @returns {string}
		 */
		currencyValue : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		}
	};

}, /* bExport= */ true);