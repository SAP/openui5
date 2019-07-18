/*
 * ! ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Base class for connectors.
	 *
	 * @namespace sap.ui.fl.write.connectors.BaseConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @public
	 */
	var BaseConnector = /** @lends sap.ui.fl.write.connectors.BaseConnector */{

		/**
		 * Interface called to write changes and variants.
		 *
		 * @param {map} mPropertyBag
		 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		writeChanges:function (/* mPropertyBag */) {
			return Promise.reject("writeChanges is not implemented");
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @param {map} mPropertyBag
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise<Object>} Promise resolves with an object containing a flex data response
		 */
		loadFeatures: function (/* mPorpertyBag */) {
			return Promise.reject("loadFeatures is not implemented");
		}
	};

	return BaseConnector;
}, true);
