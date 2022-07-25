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
	 * @ui5-restricted SAPUI5 visual editor, UX Tools
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
		 * @ui5-restricted SAPUI5 visual editor, UX Tools
		 */
		loadFlexData: function (/* mPropertyBag */) {
			return Promise.reject("loadFlexData is not implemented");
		}
	};

	return BaseConnector;
});
