sap.ui.define([
	], function () {
		"use strict";

		/*
		 * Use this file to implement your custom grouping functions
		 * The predefined functions are simple examples and might be replaced by your more complex implementations
		 * to be called with .bind() and handed over to a sap.ui.model.Sorter
		 * return value for all your functions is an object with  key-text pairs
		 * the oContext parameter is not under your control!
		 */

		return {

			/**
			 * Groups the items by a price in two groups: Lesser equal than 20 and greater than 20
			 * This grouping function needs the resource bundle so we pass it as a dependency
			 * @param {sap.ui.model.resource.ResourceModel} oResourceBundle the resource bundle of your i18n model
			 * @returns {Function} the grouper function you can pass to your sorter
			 */
			UnitNumber : function (oResourceBundle) {
				return function (oContext) {
					var iPrice = oContext.getProperty("UnitNumber"),
						sKey,
						sText;

					if (iPrice <= 20) {
						sKey = "LE20";
						sText = oResourceBundle.getText("masterGroup1Header1");
					} else {
						sKey = "GT20";
						sText = oResourceBundle.getText("masterGroup1Header2");
					}

					return {
						key: sKey,
						text: sText
					};
				};
			}

		};
	}
);
