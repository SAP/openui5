/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/fl/write/_internal/StorageFeaturesMerger",
	"sap/base/util/ObjectPath"
], function(
	ApplyUtils,
	StorageFeaturesMerger,
	ObjectPath
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

	var WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/_internal/connectors/";

	/**
	 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
	 *
	 * @returns {Promise<map[]>} Resolving with a list of maps for all configured write connectors and their requested modules
	 */
	function _getWriteConnectors() {
		return ApplyUtils.getConnectors(WRITE_CONNECTOR_NAME_SPACE, false);
	}

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

	function _sendLoadFeaturesToConnector(aConnectors) {
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			return oConnectorConfig.writeConnectorModule.loadFeatures({url: oConnectorConfig.url})
				.then(function (oFeatures) {
					return {
						features: oFeatures,
						layers: oConnectorConfig.layers
					};
				})
				.catch(ApplyUtils.logAndResolveDefault.bind(null, {
					features: {},
					layers: oConnectorConfig.layers
				}, oConnectorConfig, "loadFeatures"));
		});

		return Promise.all(aConnectorPromises);
	}

	function _sendLoadVersionsToConnector(mPropertyBag, oConnectorConfig) {
		mPropertyBag.url = oConnectorConfig.url;
		return oConnectorConfig.writeConnectorModule.loadVersions(mPropertyBag);
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
		return _getWriteConnectors()
			.then(findConnectorConfigForLayer.bind(this, sLayer));
	}

	function executeActionByName(sActionName, mPropertyBag) {
		return getConnectorConfigByLayer(mPropertyBag.layer)
			.then(function (oConnectorConfig) {
				mPropertyBag.url = oConnectorConfig.url;
				var oConnector = ObjectPath.get(sActionName, oConnectorConfig.writeConnectorModule);
				return oConnector.call(oConnectorConfig.writeConnectorModule, mPropertyBag);
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
	 * @param {sap.ui.fl.Change[]} mPropertyBag.changes Changes of the selected layer and flex reference
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
	 * Provides a list of versions for a given application and layer.
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
	 * @param {string} mPropertyBag.reference Flex reference
	 * @returns {Promise<sap.ui.fl.Versions[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Storage.loadVersions = function(mPropertyBag) {
		return _getWriteConnectors()
			.then(findConnectorConfigForLayer.bind(this, mPropertyBag.layer))
			.then(_sendLoadVersionsToConnector.bind(this, mPropertyBag));
	};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @returns {Promise<Object>} Map feature flags and additional provided information from the connectors
	 */
	Storage.loadFeatures = function() {
		return _getWriteConnectors()
			.then(_sendLoadFeaturesToConnector)
			.then(StorageFeaturesMerger.mergeResults);
	};

	/**
	 * Transports all the UI changes and app variant descriptor (if exists) to the target system.
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.url Configured url for the connector
	 * @param {object} mPropertyBag.transportDialogSettings Settings for Transport dialog
	 * @param {object} mPropertyBag.transportDialogSettings.rootControl The root control of the running application
	 * @param {string} mPropertyBag.transportDialogSettings.styleClass Style class name to be added in the TransportDialog
	 * @param {string} mPropertyBag.layer Working layer
	 * @param {string} mPropertyBag.reference Flex reference of the application
	 * @param {string} mPropertyBag.appVersion Version of the application for which the reset takes place
	 * @param {sap.ui.fl.Change[]} mPropertyBag.localChanges Local changes to be published
	 * @param {object[]} [mPropertyBag.appVariantDescriptors] An array of app variant descriptors which needs to be transported
	 * @returns {Promise} Promise that resolves when all the artifacts are successfully transported
	 */
	Storage.publish = function(mPropertyBag) {
		return executeActionByName("publish", mPropertyBag);
	};

	return Storage;
}, true);
