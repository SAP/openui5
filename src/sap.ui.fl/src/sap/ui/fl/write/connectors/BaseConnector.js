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
		 * Interface called to write flex data; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		write: function (/* mPropertyBag */) {
			return Promise.reject("write is not implemented");
		},

		/**
		 * Interface called to delete flex data.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} [mParameters.flexObject] The definition of the flex Object
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove: function (/* mPropertyBag */) {
			return Promise.reject("remove is not implemented");
		},

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Resolves as soon as the reset is completed without data
		 */
		reset: function (/* mPropertyBag */) {
			return Promise.reject("reset is not implemented");
		},

		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Resolves as soon as the publish is completed without data
		 */
		publish: function (/* mPropertyBag */) {
			return Promise.reject("publish is not implemented");
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Versio1n of the application
		 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
		 */
		getFlexInfo: function (/* mPropertyBag */) {
			return Promise.resolve({});
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @returns {Promise<object>} Resolves with an object containing the data for the flex features
		 */
		loadFeatures: function () {
			return Promise.reject("loadFeatures is not implemented");
		}
	};

	return BaseConnector;
}, true);
