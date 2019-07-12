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
	 * @namespace
	 * @name sap.ui.fl.write.connectors.BaseConnector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */
	var BaseConnector = {

		/**
		 * Interface called to write changes and variants.
		 *
		 * @param {sap.ui.fl.Change|sap.ui.fl.Change[]} vPayload Data to be stored
		 * @returns {Promise} Promise resolving as soon as the writing was completed
		 */
		writeChanges:function (/* vPayload */) {
			return Promise.reject("writeChanges is not implemented");
		}
	};

	return BaseConnector;
}, true);
