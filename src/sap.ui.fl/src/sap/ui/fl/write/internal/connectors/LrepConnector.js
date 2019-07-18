/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector"
], function(
	merge,
	BaseConnector
) {
	"use strict";

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write.internal.connectors.LrepConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var LrepConnector = merge({}, BaseConnector,  /** @lends sap.ui.fl.write.internal.connectors.LrepConnector */ {});

	return LrepConnector;
}, true);
