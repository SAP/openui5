/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Base class for connectors.
	 *
	 * @name sap.ui.fl.interfaces.BaseLoadConnector
	 * @since 1.79
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted SAP Web IDE (Visual Editor), UX Tools
	 * @interface
	 */
	var BaseConnector = /** @lends sap.ui.fl.interfaces.BaseLoadConnector */ {
		/**
		 * Interface called to get the flex data, including changes and variants.
		 *
		 * @param {object} mPropertyBag Properties needed by the connectors
		 * @param {string} mPropertyBag.flexReference Reference of the application
		 * @param {string} [mPropertyBag.url] Configured URL for the connector
		 * @param {string} [mPropertyBag.cacheKey] Key which can be used to etag / cachebuster the request
		 * @returns {Promise<Object>} Promise resolving with an object containing a flex data response
		 *
		 * @private
		 * @ui5-restricted SAP Web IDE (Visual Editor), UX Tools
		 */
		loadFlexData(/* mPropertyBag */) {
			return Promise.reject("loadFlexData is not implemented");
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @returns {Promise<object>} Resolves with an object containing the data for the flex features
		 */
		loadFeatures() {
			return Promise.reject("loadFeatures is not implemented");
		},

		/**
		 * Get the names of variants' authors.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @param {string} [mPropertyBag.url] - Configured URL for the connector
		 * @returns {Promise<object>} Resolves with a map between variant IDs and their authors' names containing the data for the flex features
		 */
		loadVariantsAuthors() {
			return Promise.reject("loadVariantsAuthors is not implemented");
		},

		/**
		 * Fetches all flex objects related to the given variant reference
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @param {string} mPropertyBag.variantReference - Variant reference to be loaded
		 * @param {string} [mPropertyBag.url] - Configured URL for the connector
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer of the objects to be loaded
		 * @returns {Promise<object>} Resolves with the data for variant
		 */
		loadFlVariant() {
			return Promise.reject("loadFlVariant is not implemented");
		}
	};

	return BaseConnector;
});
