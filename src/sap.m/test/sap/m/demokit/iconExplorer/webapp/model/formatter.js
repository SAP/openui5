sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Workaround for having to set an explicit height on the fixFlex surrounding container
			 * @public
			 * @param {string} sDummy does not matter
			 * @returns {string} sValue 4rem in compact mode, 5rem on cozy mode
			 */
			previewPanelHeight : function (sDummy) {
				if ($("body").hasClass("sapUiSizeCompact") || $("body").find(".sapUiSizeCompact").length) {
					return "6.0625rem";
				} else {
					return "8rem";
				}
			},

			/**
			 * Checks if an icon is in the favorite model
			 * @param {string} sName the name of the icon
			 * @return {boolean} true if the icon is a favorite
			 */
			isFavorite: function (sName) {
				return this.getModel("fav").isFavorite(sName);
			},

			/**
			 * Makes the first letter of a string uppercase
			 * @param {string} sValue the value to be formatted
			 * @return {string} the expected result
			 */
			uppercaseFirstLetter: function (sValue) {
				return sValue.charAt(0).toUpperCase() + sValue.slice(1);
			}

		};

	}
);