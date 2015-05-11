/*!
 * ${copyright}
 */

/*global location *///declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.define(
	[
		"sap/m/Text"
	], function (Text) {
	"use strict";

	return {
		/**
		 * Returns None for phone and SingleSelectMaster for other devices
		 *
		 * @public
		 * @param {boolean} bIsPhone is app running on a phone
		 * @returns {sap.m.ListMode} list mode according to the device in use
		 */
		listMode : function (bIsPhone) {
			return (bIsPhone ? "None" : "SingleSelectMaster");
		},

		/**
		 * Returns list item type 'Active' for phone and 'Inactive' for other devices
		 *
		 * @public
		 * @param {boolean} bIsPhone is app running on a phone
		 * @returns {string} list item type according to the device in use
		 */
		listItemType : function (bIsPhone) {
			return (bIsPhone ? "Active" : "Inactive");
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
		},

		/**
		 * Returns a configuration object for the {@link sap.ushell.ui.footerbar.AddBookMarkButton} "appData" property
		 *
		 * @public
		 * @param {string} sTitle the title for the "save as tile" dialog
		 * @returns {object} the configuration object
		 */
		shareTileData: function(sTitle) {
			return {
				title: sTitle
			};
		}
	};

});
