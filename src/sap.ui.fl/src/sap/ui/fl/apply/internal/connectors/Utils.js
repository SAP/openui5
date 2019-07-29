/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/StaticFileConnector"
], function (
	StaticFileConnector
) {
	"use strict";

	/**
	 * Util class for Connector implementations (apply and write)
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.internal.connectors.Utils
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */


	var _mApplyConnectors;
	var _mWriteConnectors;
	var _APPLY_CONNECTOR_NAME_SPACE = "sap/ui/fl/apply/internal/connectors/";
	var _WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/internal/connectors/";

	function _getConnectors (sNameSpace, bIncludingStaticFileConnector) {
		var aConfiguredConnectors = sap.ui.getCore().getConfiguration().getFlexibilityServices();
		var mConnectors = [];
		if (bIncludingStaticFileConnector) {
			mConnectors = [StaticFileConnector.CONFIGURATION];
		}

		mConnectors = mConnectors.concat(aConfiguredConnectors);

		return new Promise(function (resolve) {
			var aConnectorNames = mConnectors.map(function (mConnectorConfiguration) {
				var sConnectorName = mConnectorConfiguration.connectorName;
				return mConnectorConfiguration.custom ? sConnectorName : sNameSpace + sConnectorName;
			});

			sap.ui.require(aConnectorNames, function () {
				Array.from(arguments).forEach(function (oConnector, iIndex) {
					mConnectors[iIndex].connector = oConnector;
				});

				resolve(mConnectors);
			});
		});
	}

	return {
		/**
		 * Provides all mandatory connectors required to read data for the apply case; these are the static file connector as well as all connectors
		 * mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getApplyConnectors: function () {
			if (!_mApplyConnectors) {
				_mApplyConnectors = _getConnectors(_APPLY_CONNECTOR_NAME_SPACE, true);
			}
			return _mApplyConnectors;
		},


		/**
		 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getWriteConnectors: function () {
			if (!_mWriteConnectors) {
				_mWriteConnectors = _getConnectors(_WRITE_CONNECTOR_NAME_SPACE, false);
			}
			return _mWriteConnectors;
		}
	};
});
