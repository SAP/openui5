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
	 * @name sap.ui.fl.apply.connectors.LrepConnector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */
	var LrepConnector = merge({}, BaseConnector, {

		_URL_PREFIX: "/sap/bc/lrep"
	});

	return LrepConnector;
}, true);
