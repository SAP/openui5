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
		crossLink: function (sLink) {
			if (sLink[0] === "#") {
				sLink = document.location.href.substring(0,document.location.href.search("demoapps\.html")) + sLink;
			}
			return sLink;
		},

		/**
		 * Formats a library namespace to link to the API reference if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {string} formatted link
		 */
		libraryLink: function (sNamespace) {
			if (sNamespace && sNamespace.search("sap\\.") === 0) {
				return this.formatter.crossLink("#docs/api/symbols/" + sNamespace + ".html");
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
			return !!this.formatter.libraryLink.bind(this)(sNamespace);
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
		},

		/**
		 * Formats a module name into a global namespace name.
		 *
		 * @public
		 * @param {string} sModuleName the value to be formatted
		 * @returns {string} the formatted text
		 */
		moduleNameToGlobalName: function (sModuleName) {
			if (sModuleName) {
				return sModuleName.replace(/[/]/g, ".");
			}
		},

		/**
		 * Formats a global namespace name into a module name.
		 *
		 * @public
		 * @param {string} sName the value to be formatted
		 * @returns {string} the formatted text
		 */
		globalNameToModuleName: function (sName) {
			if (sName) {
				return sName.replace(/[.]/g, "/");
			}
		},

		/**
		 * Formats an ApiRef entity name.
		 *
		 * @public
		 * @param {string} sOrigName the value to be formatted
		 * @returns {string} the formatted text
		 */
		apiRefEntityName: function(sOrigName) { // TODO: move this to preprocessor instead and remove this function
			if (sOrigName) {
				return sOrigName.replace("module:", "");
			}
		}
	};
});