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
		 * Returns the speaking name for the technical name of the icon font
		 * @public
		 * @param sName
		 * @returns {string}
		 */
		fontName: function (sName) {
			if (!sName) {
				return;
			}

			var resourceBundle = this.getResourceBundle();

			// remove special chars and camel case from the name to make legit i18n keys
			sName = sName.split("-").map(function(sPart) {
				return sPart.charAt(0).toUpperCase() + sPart.slice(1);
			}).join("");

			return resourceBundle.getText("fontName_" + sName);
		},

		/**
		 * Checks if an icon is in the favorite model
		 * @public
		 * @param {string} sName the name of the icon
		 * @return {boolean} true if the icon is a favorite
		 */
		isFavorite: function (sName) {
			return this.getModel("fav").isFavorite(sName);
		},

		/**
		 * Returns the approriate rating based on the favorite state
		 * @public
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
		 * @public
		 * @param {string} sValue the value to be formatted
		 * @return {string} the expected result
		 */
		uppercaseFirstLetter: function (sValue) {
			return sValue.charAt(0).toUpperCase() + sValue.slice(1);
		},

		/**
		 * Indicates the availability of the icon font
		 * @public
		 * @param {string} sDelivery the delivery channel of the icon
		 * @return {string} the expected result
		 */
		deliveryState: function (sDelivery) {
			if (sDelivery === "OpenUI5") {
				return sap.ui.core.ValueState.Success;
			} else {
				return sap.ui.core.ValueState.Error;
			}
		},

		/**
			* Returns the relative URL to a product picture
		 	* @public
			* @param {string} sUrl image URL
			* @return {string} relative image URL
			*/
			pictureUrl: function(sUrl) {
				return sap.ui.require.toUrl("sap/ui/demo/iconexplorer/") + sUrl;
			}

	};

});