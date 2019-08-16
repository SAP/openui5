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
		 * @param {sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		writeFlexData:function (/* mPropertyBag */) {
			return Promise.reject("writeFlexData is not implemented");
		},

		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} [mPropertyBag.changelist] Transport Id
		 * @param {string} [mPropertyBag.appVersion] Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
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
		 * @param {string} [mPropertyBag.package] ABAP package (mandatory when layer is 'VENDOR')
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as the publish has completed
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
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		getFlexInfo: function (/* mPropertyBag */) {
			return Promise.reject("getFlexInfo is not implemented");
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @returns {Promise<Object>} Promise resolves with an object containing a flex features response
		 */
		loadFeatures: function () {
			return Promise.reject("loadFeatures is not implemented");
		}
	};

	return BaseConnector;
}, true);
