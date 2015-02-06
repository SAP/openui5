sap.ui.define([], function () {
	"use strict";

		/*
		 * Use this file to implement your custom grouping functions
		 * 
		 * The predefined functions are simple examples and might be replaced by your more complex implementations
		 * 
		 * to be called with jQuery.proxy and handed over to a sap.ui.model.Sorter
		 *  
		 * return value for all your functions is an object with  key-text pairs
		 * 
		 * the oContext parameter is not under your control!
		 */

	return {
		/**
		 * Grouping function to group the master list by rating
		 *
		 * @public
		 * @param oContext the current list item context
		 * @returns {object} an object with the rating as key and a text for the group header
		 */
		Group1 : function (oContext){
			var sKey = oContext.getProperty("Rating"),
				oResourceBundle = this.getModel("i18n").getResourceBundle(); // this is the source control

			return {
				key : sKey,
				text : oResourceBundle.getText("masterGroup1Header", [sKey])
			};
		},

		
		/**
		 * Grouping function to group the master list by price
		 *
		 * @public
		 * @param oContext the current list item context
		 * @returns {object} an object with the rating as key and a text for the group headers
		 */
		Group2 : function (oContext){
			var iPrice = oContext.getProperty("UnitNumber"),
				sKey,
				sText,
				oResourceBundle = this.getModel("i18n").getResourceBundle(); // this is the source control

			if (iPrice <= 20) {
				sKey = "LE20";
				sText = oResourceBundle.getText("masterGroup2Header1");
			} else {
				sKey = "GT20";
				sText = oResourceBundle.getText("masterGroup2Header2");
			}
			return {
				key : sKey,
				text : sText
			};
		}
	};

}, /* bExport= */ true);