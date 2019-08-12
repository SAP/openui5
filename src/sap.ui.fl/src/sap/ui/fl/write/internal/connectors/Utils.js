/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/Utils"
], function (
	ApplyUtils
) {
	"use strict";

	/**
	 * Util class for Connector implementations (write).
	 *
	 * @namespace sap.ui.fl.write.internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.write.internal
	 */

	var WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/internal/connectors/";

	return {
		/**
		 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured write connectors and their requested modules
		 */
		getWriteConnectors: function () {
			return ApplyUtils.getConnectors(WRITE_CONNECTOR_NAME_SPACE, false);
		}
	};
});
