sap.ui.define([
	'jquery.sap.global'
] , function ($) {
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
		 * Returns the approriate rating based on the favorite state
		 * @param {string} sName the name of the icon
		 * @return {int} 1 if favorite, 0 otherwise
		 */
		favoriteRating: function (sName) {
			return (this.getModel("fav").isFavorite(sName) ? 1 : 0);
		},

		/**
		 * Retrieves formatted text containing the unicode of the icon identified by the icon's name. Used as a formatter in the view.
		 * @param {string} name the icon's name
		 * @return {strng} the formattet text taht contains unicode of the queried icon
		 * @public
		 */
		getUnicodeTextByName: function (name) {
			name = name || "";
			var sUnicode = this.getModel().getUnicodeHTML(name.toLowerCase()),
				sFormattedText;
			sUnicode = sUnicode.substring(2, sUnicode.length - 1);
			sFormattedText = this.getResourceBundle().getText("previewInfoUnicodeWithParams", [sUnicode]);
			return sFormattedText;
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

});