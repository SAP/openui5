/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/NeoLrepConnector"
], function(
	merge,
	LrepConnector,
	InitialConnector
) {
	"use strict";


	/**
	 * Connector for requesting data from a Neo LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.NeoLrepConnector
	 * @since 1.81
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	return merge({}, LrepConnector, /** @lends sap.ui.fl.write._internal.connectors.NeoLrepConnector */ {
		initialConnector: InitialConnector,
		layers: InitialConnector.layers,

		/**
		 * Check if context sharing is enabled in the backend.
		 *
		 * @returns {Promise<boolean>} Promise resolves with false
		 */
		isContextSharingEnabled: function () {
			return Promise.resolve(false);
		}
	});
}, true);
