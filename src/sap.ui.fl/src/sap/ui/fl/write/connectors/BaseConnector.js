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
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		writeChanges:function (/* mPropertyBag */) {
			return Promise.reject("writeChanges is not implemented");
		},

		/**
		 * Interface called to reset data for a given application.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the reset should happen
		 * @param {string} mPropertyBag.reference Flex reference
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string[]} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		reset: function (/* mPropertyBag */) {
			return Promise.reject("reset is not implemented");
		},

		/**
		 * Interface called to publish data for a given application.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the reset should happen
		 * @param {string} mPropertyBag.reference Flex reference
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string[]} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		publish: function (/* mPropertyBag */) {
			return Promise.reject("publish is not implemented");
		},

		/**
		 * Interface called to publish data for a given application.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the reset should happen
		 * @param {string} mPropertyBag.reference Flex reference
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		getFlexInfo: function (/* mPropertyBag */) {
			return Promise.reject("getFlexInfo is not implemented");
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @param {map} mPropertyBag Property bag
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise<Object>} Promise resolves with an object containing a flex data response
		 */
		loadFeatures: function (/* mPropertyBag */) {
			return Promise.reject("loadFeatures is not implemented");
		}
	};

	return BaseConnector;
}, true);
