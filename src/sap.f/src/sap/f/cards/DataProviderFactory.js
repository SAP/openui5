/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/ServiceDataProvider",
	"sap/f/cards/RequestDataProvider",
	"sap/f/cards/DataProvider"
],
function (ServiceDataProvider, RequestDataProvider, DataProvider) {
"use strict";

	/**
	 * @class
	 * A static factory class which creates a data provider based on data settings.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.65
	 * @alias sap.f.cards.DataProviderFactory
	 */
	var DataProviderFactory = {};

	/**
	 * Factory function which returns an instance of <code>DataProvider</code>.
	 *
	 * @param {Object} oDataSettings The data settings.
	 * @param {sap.ui.integration.util.ServiceManager} oServiceManager A reference to the service manager.
	 * @returns {sap.f.cards.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.create = function (oDataSettings, oServiceManager) {
		var oDataProvider;

		if (!oDataSettings) {
			return null;
		}

		if (oDataSettings.request) {
			oDataProvider = new RequestDataProvider();
		} else if (oDataSettings.service) {
			oDataProvider = new ServiceDataProvider();
		} else if (oDataSettings.json) {
			oDataProvider = new DataProvider();
		} else {
			return null;
		}

		oDataProvider.setSettings(oDataSettings);

		if (oDataProvider.isA("sap.f.cards.IServiceDataProvider")) {
			oDataProvider.createServiceInstances(oServiceManager);
		}

		if (oDataSettings.updateInterval) {
			oDataProvider.setUpdateInterval(oDataSettings.updateInterval);
		}

		return oDataProvider;
	};

	return DataProviderFactory;
});