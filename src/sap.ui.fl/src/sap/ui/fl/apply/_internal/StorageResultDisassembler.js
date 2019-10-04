/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Disassembles a response with a variant section into one or more plain responses.
	 *
	 * @namespace sap.ui.fl.apply._internal.StorageResultDisassembler
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl._internal.apply.Storage
	 */

	return {
		/**
		 * Disassembles the response from connectors.
		 *
		 * @param {object} oResponse Flex data response from a <code>sap.ui.connectors.BaseConnector</code> implementation
		 * @returns {Object} Disassembled result
		 */
		disassemble: function(oResponse) {
			return oResponse;
		}
	};
});