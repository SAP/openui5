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
	 * @private
	 */
	var BaseConnector = /** @lends sap.ui.fl.write.connectors.BaseConnector */{

		/**
		 * Interface called to write changes and variants.
		 *
		 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} vPayload - Data to be stored
		 * @returns {Promise} Promise that resolves as soon as the writing is completed
		 */
		writeChanges:function (/* vPayload */) {
			return Promise.reject("writeChanges is not implemented");
		}
	};

	return BaseConnector;
}, true);
