/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	ConnectorUtils
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistencies like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.write.internal.Connector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl
	 */

	function findConnectorForLayer(sLayer, aConnectors) {
		var aFilteredConnectors = aConnectors.filter(function (oConnector) {
			return oConnector.layerFilter.indexOf("ALL") !== -1 || oConnector.layerFilter.indexOf(sLayer) !== -1;
		});

		if (aFilteredConnectors.length === 1) {
			return aFilteredConnectors[0].connector;
		}

		if (aFilteredConnectors.length === 0) {
			throw new Error("No Connector could be found to write into layer: " + sLayer);
		}

		if (aFilteredConnectors.length > 1) {
			throw new Error("sap.ui.core.Configuration 'xx-flexibilityConnectors' has a misconfiguration: Multiple Connectors were found to write into layer: " + sLayer);
		}
	}

	function sendLoadFeaturesToConnector (mPropertyBag, aConnectors) {
		mPropertyBag.urls = {};
		var aConnectorPromises = aConnectors.map(function (oConnectorConfig) {
			if (oConnectorConfig.url) {
				mPropertyBag.urls[oConnectorConfig.connectorName] = oConnectorConfig.url;
			}

			return new Promise(function (resolve) {
				return oConnectorConfig.connector.loadFeatures(mPropertyBag)
					.then(resolve, ConnectorUtils.logAndResolveDefault.bind(null, resolve, {}, oConnectorConfig, "loadFeatures"));
			});
		});

		return Promise.all(aConnectorPromises);
	}

	/**
	 * Determines the connector in charge for a given layer.
	 *
	 * @param {string} sLayer Layer on which the file should be stored
	 * @returns {Promise<sap.ui.fl.write.connectors.BaseConnector>} Returns the connector in charge for the layer or rejects in case no connector can be determined
	 * @private
	 */
	function getConnectorByLayer(sLayer) {
		return ConnectorUtils.getWriteConnectors()
			.then(findConnectorForLayer.bind(this, sLayer));
	}

	function sendWriteFlexDataToConnector (mPropertyBag, oConnector) {
		return oConnector.writeFlexData(mPropertyBag);
	}

	var Connector = {};

	/**
	 * Stores the flex data by calling the according write of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the file should be stored
	 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} mPropertyBag.payload Data to be stored
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Connector.writeFlexData = function (mPropertyBag) {
		return getConnectorByLayer(mPropertyBag.layer)
			.then(sendWriteFlexDataToConnector.bind(this, mPropertyBag));
	};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @returns {Promise<Object>} map feature flags and additional provided information form the connectors
	 */
	Connector.loadFeatures = function () {
		return ConnectorUtils.getApplyConnectors()
			.then(sendLoadFeaturesToConnector)
			.then(ConnectorUtils.mergeResults);
	};

	return Connector;
}, true);
