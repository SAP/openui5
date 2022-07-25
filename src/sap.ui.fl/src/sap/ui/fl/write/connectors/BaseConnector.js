/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Base class for connectors.
	 *
	 * @namespace sap.ui.fl.write.connectors.BaseConnector
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl
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
		 * Interface called to write new flex data; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Map of condensed changes
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer in which the data should be stored
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @param {boolean} [mPropertyBag.draft=false] - Indicates if changes should be written as a draft
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		condense: function (/* mPropertyBag */) {
			return Promise.reject("condense is not implemented");
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
		 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
		 */
		getFlexInfo: function (/* mPropertyBag */) {
			return Promise.resolve({});
		},

		/**
		 * Interface to retrieve the variant management context information.
		 * The context information is a JSON object that has boolean property 'lasthitreached'
		 * indicating that the result is paginated and whether there are more contexts that can be fetched from the backend.
		 * The context information also has JSON object 'types' which has a string property 'type' denoting the type of context (e.g. 'ROLE')
		 * and an array property 'values' containing the id and description of each context.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.type Type of context, currently only 'role' is supported
		 * @param {string} [mPropertyBag.$skip] Offset for paginated request
		 * @param {string} [mPropertyBag.$filter] Filters full raw data
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise<object>} Promise resolves as soon as context has been retrieved
		 */
		getContexts: function (/* mPropertyBag */) {
			return Promise.reject("getContexts is not implemented");
		},

		/**
		 * Interface to retrieve the variant management context description in the correct language based on the browser configuration.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.flexObjects Payload for the post request
		 * @returns {Promise<object>} Promise resolves as soon as context descriptions have has been retrieved
		 */
		loadContextDescriptions: function (/* mPropertyBag */) {
			return Promise.reject("loadContextDescriptions is not implemented");
		},

		/**
		 * Interface called to check if variant management context sharing is enabled.
		 *
		 * @returns {Promise<object>} Resolves with an object containing the data for the flex features
		 */
		isContextSharingEnabled: function () {
			return Promise.resolve(false);
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
			 * @param {string} mPropertyBag.title Title of the to be activated version
			 * @returns {Promise<sap.ui.fl.Version>} Resolves with list of versions after the activation took place.
			 */
			activate: function () {
				return Promise.reject("versions.activate is not implemented");
			},

			/**
			 * Interface called to discard a draft.
			 *
			 * @param {object} mPropertyBag Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
			 * @param {string} mPropertyBag.reference Flex reference
			 * @returns {Promise} Resolves after the draft is discarded.
			 */
			discardDraft: function () {
				return Promise.reject("versions.discardDraft is not implemented");
			}
		},

		translation: {
			/**
			 * Interface called to get the source languages for the given application
			 *
			 * @param {object} mPropertyBag - Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
			 * @param {string} mPropertyBag.reference - Flex reference
			 * @returns {Promise} Promise resolving after the languages are retrieved;
			 * rejects if an error occurs
			 */
			getSourceLanguages: function () {
				return Promise.reject("translation.getSourceLanguages is not implemented");
			},

			/**
			 * Interface called to get the translatable texts for the given source & target language for the given application
			 *
			 * @param {object} mPropertyBag - Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
			 * @param {string} mPropertyBag.sourceLanguage - Source language for for which the request should be made
			 * @param {string} mPropertyBag.targetLanguage - Target language for for which the request should be made
			 * @param {string} mPropertyBag.reference - Flex reference
			 * @returns {Promise} Promise resolving after the download was started;
			 * rejects if an error occurs
			 */
			getTexts: function () {
				return Promise.reject("translation.getTexts is not implemented");
			},

			/**
			 * Interface called to upload an XLIFF file.
			 *
			 * @param {object} mPropertyBag - Property bag
			 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer
			 * @param {object} mPropertyBag.payload - The file to be uploaded
			 * @returns {Promise} Resolves after the file was uploaded;
			 * rejects if an error occurs or a parameter is missing
			 */
			postTranslationTexts: function () {
				return Promise.reject("translation.postTranslationTexts is not implemented");
			}
		}
	};

	return BaseConnector;
});
