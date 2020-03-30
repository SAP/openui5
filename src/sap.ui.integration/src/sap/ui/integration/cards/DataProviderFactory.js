/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/integration/cards/ServiceDataProvider",
	"sap/ui/integration/cards/RequestDataProvider",
	"sap/ui/integration/cards/DataProvider"
],
function (BaseObject, ServiceDataProvider, RequestDataProvider, DataProvider) {
"use strict";

	/**
	 * @class
	 * A factory class which creates a data provider based on data settings and stores the created instance.
	 * When destroyed, all data providers created by this class are also destroyed.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.65
	 * @alias sap.ui.integration.cards.DataProviderFactory
	 */
	var DataProviderFactory = BaseObject.extend("sap.ui.integration.cards.DataProviderFactory", {
		constructor: function (oDestinations) {
			BaseObject.call(this);
			this._oDestinations = oDestinations;
			this._aDataProviders = [];
		}
	});

	DataProviderFactory.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		if (this._aDataProviders) {
			this._aDataProviders.forEach(function(oDataProvider) {
				if (!oDataProvider.bIsDestroyed) {
					oDataProvider.destroy();
				}
			});

			this._aDataProviders = null;
		}

		this._bIsDestroyed = true;
	};

	/**
	 * Returns if this factory is destroyed.
	 *
	 * @returns {boolean} if this manifest is destroyed
	 */
	DataProviderFactory.prototype.isDestroyed = function () {
		return this._bIsDestroyed;
	};

	/**
	 * Factory function which returns an instance of <code>DataProvider</code>.
	 *
	 * @param {Object} oDataSettings The data settings.
	 * @param {sap.ui.integration.util.ServiceManager} oServiceManager A reference to the service manager.
	 * @returns {sap.ui.integration.cards.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataSettings, oServiceManager) {
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

		oDataProvider.setDestinations(this._oDestinations);
		oDataProvider.setSettings(oDataSettings);

		if (oDataProvider.isA("sap.ui.integration.cards.IServiceDataProvider")) {
			oDataProvider.createServiceInstances(oServiceManager);
		}

		if (oDataSettings.updateInterval) {
			oDataProvider.setUpdateInterval(oDataSettings.updateInterval);
		}

		this._aDataProviders.push(oDataProvider);

		return oDataProvider;
	};

	return DataProviderFactory;
});