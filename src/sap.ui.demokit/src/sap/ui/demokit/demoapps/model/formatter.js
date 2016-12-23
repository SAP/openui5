/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Formats a library namespace to link to the API reference if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {string} formatted link
		 */
		libraryLink: function (sNamespace) {
			if (sNamespace && sNamespace.search("sap\\.") === 0) {
				return "#docs/api/symbols/" + sNamespace + ".html";
			} else {
				return "";
			}
		},

		/**
		 * Formats a library namespace to true if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {boolean} true or false
		 */
		libraryLinkEnabled: function (sNamespace) {
			return !!this.formatter.libraryLink(sNamespace);
		},

		/**
		 * Formats a category id to a category name.
		 *
		 * @public
		 * @param {string} sCategoryId the value to be formatted
		 * @returns {string} the formatted text
		 */
		categoryName: function (sCategoryId) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			return oResourceBundle.getText("demoAppCategory" + sCategoryId);
		}
	};
});