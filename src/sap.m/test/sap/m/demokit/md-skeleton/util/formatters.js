sap.ui.define([], function () {
	"use strict";

	/*
	 * Use this file to implement your custom formatters functions
	 * 
	 * The predefined custom functions are simple examples and might be replaced by custom implementations
	 *  
	 */
	
	return {
		
		/*
		 * Start of list mode formatters used in the view to set the list mode
		 */

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

		/*
		 * Start of predefined custom formatters
		 * Implement your own value formatters in this section
		 */

		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param sValue
		 * @returns {string}
		 */
		currencyValue : function (sValue) {
			if(!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		}
	};

}, /* bExport= */ true);