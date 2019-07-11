/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(ConnectorUtils) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistencies like back ends, local & session storage or work spaces.
	 *
	 * @namespace
	 * @name sap.ui.fl.write.internal.Connector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */

	function _findConnectorForLayer(sLayer, aConnectors) {
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

	/**
	 * Determines the connector in charge for a given layer.
	 *
	 * @param {string} sLayer Layer on which the file should be stored
	 * @returns {Promise<sap.ui.fl.write.connectors.BaseConnector>} Returns the connector in charge for the layer or rejects in case no connector can be determined
	 * @private
	 */
	function _getConnectorByLayer(sLayer) {
		return ConnectorUtils.getWriteConnectors()
			.then(_findConnectorForLayer.bind(this, sLayer));
	}

	var Connector = {};

	/**
	 * Stores the flex data by calling the according write of the connector in charge of the passed layer;
	 * The promise is rejected in case the writing failed or no connector is configured to handle the layer.
	 *
	 * @param {string} sLayer Layer on which the file should be stored
	 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} vPayload Data to be stored
	 * @returns {Promise} Promise resolving as soon as the writing was completed or rejects in case of an error
	 */
	Connector.writeChanges = function (sLayer, vPayload) {
		return _getConnectorByLayer(sLayer)
			.then(_writeChanges.bind(this, vPayload));
	};

	function _writeChanges (vPayload, oConnector) {
		return oConnector.writeChanges(vPayload);
	}

	return Connector;
}, true);
