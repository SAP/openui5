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
		 * Layers available to make modifying operations.
		 */
		layers: [],

		/**
		 * Interface called to write new flex data; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {boolean} [mPropertyBag.draft=false] - Indicates if changes should be written as a draft
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		write: function (/* mPropertyBag */) {
			return Promise.reject("write is not implemented");
		},

		/**
		 * Interface called to update an existing flex data.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be updated
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the data should be updated
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update: function (/* mPropertyBag */) {
			return Promise.reject("write is not implemented");
		},

		/**
		 * Interface called to delete an existing flex data.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be deleted
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the data should be deleted
		 * @param {string} [mPropertyBag.transport] The transport ID
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
		 * Interface to publish flexibility files for a given application and layer.
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
		 * Interface to retrieve the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
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
		},

		versions: {
			/**
			 * Interface called to get the flex versions.
			 *
			 * @param {object} mPropertyBag Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
			 * @param {string} mPropertyBag.reference Flex reference
			 * @returns {Promise<sap.ui.fl.Version[]>} Resolves with an object containing the data for the versions
			 */
			load: function () {
				return Promise.reject("versions.load is not implemented");
			},

			/**
			 * Interface called to activate a draft.
			 *
			 * @param {object} mPropertyBag Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
			 * @param {string} mPropertyBag.reference Flex reference
			 * @returns {Promise<sap.ui.fl.Version[]>} Resolves with list of versions after the activation took place.
			 */
			activateDraft: function () {
				return Promise.reject("versions.activateDraft is not implemented");
			},

			/**
			 * Interface called to discard a draft.
			 *
			 * @param {object} mPropertyBag Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
			 * @param {string} mPropertyBag.reference Flex reference
			 * @returns {Promise<>} Resolves after the draft is discarded.
			 */
			discardDraft: function () {
				return Promise.reject("versions.discardDraft is not implemented");
			}
		}
	};

	return BaseConnector;
}, true);
