/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector"
], function(
	merge,
	BaseConnector
) {
	"use strict";

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.internal.connectors.StaticFileConnector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */
	var StaticFileConnector = merge({}, BaseConnector, {
		/**
		 * Configuration used in the sap.ui.fl.Connector to always load the static files
		 */
		CONFIGURATION: {
			layerFilter: [],
			connectorName: "StaticFileConnector"
		}
	});

	return StaticFileConnector;
}, true);
