/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/StorageFeaturesMerger"
], function(
	ApplyUtils,
	WriteUtils,
	StorageFeaturesMerger
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistencies like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.write._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	function findConnectorConfigForLayer(sLayer, aConnectors) {
		var aFilteredConnectors = aConnectors.filter(function (oConnector) {
			return oConnector.layers.indexOf("ALL") !== -1 || oConnector.layers.indexOf(sLayer) !== -1;
		});

		if (aFilteredConnectors.length === 1) {
			return aFilteredConnectors[0];
		}

		if (aFilteredConnectors.length === 0) {
			throw new Error("No Connector configuration could be found to write into layer: " + sLayer);
		}

		if (aFilteredConnectors.length > 1) {
			throw new Error("sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: Multiple Connector configurations were found to write into layer: " + sLayer);
		}
	}

	function sendLoadFeaturesToConnector(aConnectors) {
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			return oConnectorConfig.connectorModule.loadFeatures({url: oConnectorConfig.url})
				.catch(ApplyUtils.logAndResolveDefault.bind(null, {}, oConnectorConfig, "loadFeatures"));
		});

		return Promise.all(aConnectorPromises);
	}

	/**
	 * Determines the connector in charge for a given layer.
	 *
	 * @param {string} sLayer Layer on which the file should be stored
	 * @returns {Promise<sap.ui.fl.write.connectors.BaseConnector>} Returns the connector in charge for the layer or rejects in case no connector can be determined
	 */
	function getConnectorConfigByLayer(sLayer) {
		if (!sLayer) {
			return Promise.reject("No layer was provided");
		}
		return WriteUtils.getWriteConnectors()
			.then(findConnectorConfigForLayer.bind(this, sLayer));
	}

	function executeActionByName(sActionName, mPropertyBag) {
		return getConnectorConfigByLayer(mPropertyBag.layer)
			.then(function (oConnectorConfig) {
				mPropertyBag.url = oConnectorConfig.url;
				return oConnectorConfig.connectorModule[sActionName](mPropertyBag);
			});
	}

	var Storage = {};

	/**
	 * Stores the flex data by calling the according write of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag Contains additional information for all the Connectors
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the file should be stored
	 * @param {object[]} mPropertyBag.flexObjects Data to be stored
	 * @param {string} [mPropertyBag._transport] The transport ID which will be handled internally, so there is no need to be passed
	 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the update data has file type .variant or not
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.write = function(mPropertyBag) {
		return executeActionByName("write", mPropertyBag);
	};

	/**
	 * Delete an existing flex data by calling the according remove of the connector in charge of the passed layer;
	 * The promise is rejected in case the removing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag Contains additional information for all the Connectors
	 * @param {sap.ui.fl.Change} mPropertyBag.flexObject Flex Object to be deleted
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the data should be deleted
	 * @param {string} [mPropertyBag._transport] The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.remove = function(mPropertyBag) {
		return executeActionByName("remove", mPropertyBag);
	};

	/**
	 * Update an existing flex data by calling the according update of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag Contains additional information for all the Connectors
	 * @param {object} mPropertyBag.flexObject Flex object to be deleted
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the data should be deleted
	 * @param {string} [mPropertyBag._transport] The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Storage.update = function(mPropertyBag) {
		return executeActionByName("update", mPropertyBag);
	};

	/**
	 * Resets the flex data by calling the according reset of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {object} mPropertyBag Contains additional information for all the Connectors
	 * @param {string} mPropertyBag.reference Flexibility reference
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the reset should take place
	 * @param {string} [mPropertyBag.appVersion] Version of the application
	 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
	 * @param {string[]} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter
	 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset
	 * @returns {Promise} Resolves after the reset is completed and rejects in case of an error
	 */
	Storage.reset = function (mPropertyBag) {
		return executeActionByName("reset", mPropertyBag);
	};

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
	 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
	 */
	Storage.getFlexInfo = function (mPropertyBag) {
		return executeActionByName("getFlexInfo", mPropertyBag);
	};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @returns {Promise<Object>} Map feature flags and additional provided information from the connectors
	 */
	Storage.loadFeatures = function() {
		return WriteUtils.getWriteConnectors()
			.then(sendLoadFeaturesToConnector)
			.then(StorageFeaturesMerger.mergeResults);
	};

	return Storage;
}, true);
