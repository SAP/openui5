/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/ExtensionDataProvider",
	"sap/ui/integration/util/JSONBindingHelper",
	"sap/ui/integration/util/BindingHelper"
],
function (BaseObject, ServiceDataProvider, RequestDataProvider, DataProvider, ExtensionDataProvider, JSONBindingHelper, BindingHelper) {
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
	 * @alias sap.ui.integration.util.DataProviderFactory
	 */
	var DataProviderFactory = BaseObject.extend("sap.ui.integration.util.DataProviderFactory", {
		constructor: function (oDestinations, oExtension, oCard) {
			BaseObject.call(this);
			this._oDestinations = oDestinations;
			this._oExtension = oExtension;
			this._oCard = oCard;

			this._aDataProviders = [];
			this._aFiltersProviders = [];
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
			this._aFiltersProviders = null;
		}

		this._oCard = null;
		this._oExtension = null;
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
	 * @returns {sap.ui.integration.util.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataSettings, oServiceManager, bIsFilter) {
		var oCard = this._oCard,
			oConfig,
			oDataProvider;

		if (!oDataSettings) {
			return null;
		}

		oConfig = {
			"card": oCard,
			"settingsJson": JSONBindingHelper.createJsonWithBindingInfos(oDataSettings, oCard.getBindingNamespaces())
		};

		if (oDataSettings.request) {
			oDataProvider = new RequestDataProvider(oConfig);
		} else if (oDataSettings.service) {
			oDataProvider = new ServiceDataProvider(oConfig);
		} else if (oDataSettings.json) {
			oDataProvider = new DataProvider(oConfig);
		} else if (oDataSettings.extension) {
			oDataProvider = new ExtensionDataProvider(oConfig, this._oExtension);
		} else {
			return null;
		}

		BindingHelper.propagateModels(oCard, oDataProvider);
		oDataProvider.bindObject("/");

		oDataProvider.setDestinations(this._oDestinations);

		if (oDataProvider.isA("sap.ui.integration.util.IServiceDataProvider")) {
			oDataProvider.createServiceInstances(oServiceManager);
		}

		this._aDataProviders.push(oDataProvider);

		if (bIsFilter) {
			this._aFiltersProviders.push(oDataProvider);
		} else {
			oDataProvider.setDependencies(this._aFiltersProviders);
		}

		return oDataProvider;
	};

	/**
	 * Removes a DataProvider from Factory's registry.
	 *
	 * @param oDataProvider {sap.ui.integration.util.DataProvider}
	 * @experimental
	 */
	DataProviderFactory.prototype.remove = function (oDataProvider) {
		var iProviderIndex = this._aDataProviders.indexOf(oDataProvider);

		if (iProviderIndex > -1) {
			this._aDataProviders.splice(iProviderIndex, 1);
		}

		if (oDataProvider && !oDataProvider.bDestroyed && oDataProvider._bIsDestroyed) {
			oDataProvider.destroy();
		}
	};

	return DataProviderFactory;
});