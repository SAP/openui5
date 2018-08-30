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
		 * Encodes a module name that can be included in URL.
		 *
		 * @public
		 * @param {string} sModuleName the name of the module
		 * @returns {string} the encoded module name
		 */
		encodeModuleName: function (sModuleName) {
			if (sModuleName) {
				return encodeURIComponent(sModuleName);
			}
		},

		/**
		 * Decodes a module name that is comming from URL parameter.
		 *
		 * @public
		 * @param {string} sModuleName the encoded module name
		 * @returns {string} the decoded module name
		 */
		decodeModuleName: function (sModuleName) {
			if (sModuleName) {
				return decodeURIComponent(sModuleName);
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
		},

		/**
		 * Formats an ApiRef aggregation altTypes.
		 *
		 * @public
		 * @param {Array} altTypes the array of alternative types
		 * @returns {string | undefined} the formatted text
		 */
		apiRefAggregationAltTypes: function(altTypes) {
			return altTypes && altTypes.join(", ");
		}
	};
});