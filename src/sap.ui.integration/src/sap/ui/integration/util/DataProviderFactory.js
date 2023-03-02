/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/integration/library",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/CacheAndRequestDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/ExtensionDataProvider",
	"sap/ui/integration/util/JSONBindingHelper",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/CsrfTokenHandler"
], function (
	EventProvider,
	library,
	ServiceDataProvider,
	RequestDataProvider,
	CacheAndRequestDataProvider,
	DataProvider,
	ExtensionDataProvider,
	JSONBindingHelper,
	BindingHelper,
	CsrfTokenHandler
) {
	"use strict";

	var CardPreviewMode = library.CardPreviewMode;

	/**
	 * @class
	 * A factory class which creates a data provider based on data settings and stores the created instance.
	 * When destroyed, all data providers created by this class are also destroyed.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @since 1.65
	 * @alias sap.ui.integration.util.DataProviderFactory
	 */
	var DataProviderFactory = EventProvider.extend("sap.ui.integration.util.DataProviderFactory", {
		constructor: function (mSettings) {
			EventProvider.call(this);

			mSettings = mSettings || {};

			this._oDestinations = mSettings.destinations;
			this._oExtension = mSettings.extension;
			this._oCsrfTokenHandler = mSettings.csrfTokenHandler;
			this._oCard = mSettings.card;
			this._oEditor = mSettings.editor;
			this._oHost = mSettings.host;

			if (mSettings.csrfTokensConfig) {
				this._oCsrfTokenHandler = new CsrfTokenHandler({
					host: mSettings.host,
					configuration: mSettings.csrfTokensConfig
				});
			}

			this._aDataProviders = [];
			this._aFiltersProviders = [];
		}
	});

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 */
	DataProviderFactory.prototype.destroy = function () {
		EventProvider.prototype.destroy.apply(this, arguments);

		if (this._aDataProviders) {
			this._aDataProviders.forEach(function(oDataProvider) {
				if (!oDataProvider.bIsDestroyed) {
					oDataProvider.destroy();
				}
			});

			this._aDataProviders = null;
			this._aFiltersProviders = null;
		}

		if (this._oCsrfTokenHandler) {
			this._oCsrfTokenHandler.destroy();
			this._oCsrfTokenHandler = null;
		}

		this._oCard = null;
		this._oExtension = null;
		this._bIsDestroyed = true;
	};

	/**
	 * Returns if this factory is destroyed.
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {boolean} if this manifest is destroyed
	 */
	DataProviderFactory.prototype.isDestroyed = function () {
		return this._bIsDestroyed;
	};

	/**
	 * Factory function which returns an instance of <code>DataProvider</code>.
	 *
	 * @param {object} oDataConfiguration The data configuration.
	 * @param {sap.ui.integration.util.ServiceManager} [oServiceManager] A reference to the service manager.
	 * @param {boolean} [bIsFilter=false] Whether the caller of this method is Filter.
	 * @param {boolean} [bConfigurationAlreadyResolved=false] Whether configuration bindings are already resolved. Useful, when they depend on user input. In this case they should already be resolved.
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {sap.ui.integration.util.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataConfiguration, oServiceManager, bIsFilter, bConfigurationAlreadyResolved) {
		var oCard = this._oCard;

		if (!this._isProvidingConfiguration(oDataConfiguration) || oCard && oCard.getPreviewMode() === CardPreviewMode.Abstract) {
			return null;
		}

		if (oCard && oCard.getPreviewMode() === CardPreviewMode.MockData) {
			oDataConfiguration = this._applyMockDataConfiguration(oDataConfiguration);
		}

		var oEditor = this._oEditor,
			oHost = this._oHost || (oCard && oCard.getHostInstance()) || (oEditor && oEditor.getHostInstance()),
			bUseExperimentalCaching = oHost && oHost.bUseExperimentalCaching,
			oSettings = this._createDataProviderSettings(oDataConfiguration, bConfigurationAlreadyResolved),
			oDataProvider;

		if (oDataConfiguration.request && bUseExperimentalCaching) {
			oDataProvider = new CacheAndRequestDataProvider(oSettings);
			oDataProvider.setHost(oHost);
		} else if (oDataConfiguration.request) {
			oDataProvider = new RequestDataProvider(oSettings);

			if (oHost) {
				oDataProvider.setHost(oHost);
			}
		} else if (oDataConfiguration.service) {
			oDataProvider = new ServiceDataProvider(oSettings);
		} else if (oDataConfiguration.json) {
			oDataProvider = new DataProvider(oSettings);
		} else if (oDataConfiguration.extension) {
			oDataProvider = new ExtensionDataProvider(oSettings, this._oExtension);
		}

		if (oCard) {
			oDataProvider.setCard(oCard);
			BindingHelper.propagateModels(oCard, oDataProvider);
		} else if (oEditor) {
			BindingHelper.propagateModels(oEditor, oDataProvider);
		}
		oDataProvider.bindObject("/");

		oDataProvider.setDestinations(this._oDestinations);

		if (this._oCsrfTokenHandler) {
			oDataProvider.setCsrfTokenHandler(this._oCsrfTokenHandler);
			this._oCsrfTokenHandler.setDataProviderFactory(this);
		}

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
	 * @param {sap.ui.integration.util.DataProvider} oDataProvider The data provider to be removed
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
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

	DataProviderFactory.prototype.setHost = function (oHost) {
		this._oHost = oHost;

		if (this._oCsrfTokenHandler) {
			this._oCsrfTokenHandler.setHost(oHost);
		}
	};

	DataProviderFactory.prototype._createDataProviderSettings = function (oDataConfiguration, bConfigurationAlreadyResolved) {
		var oCard = this._oCard;
		var oEditor = this._oEditor;
		var oConfig = {};

		if (oCard) {
			oConfig.baseRuntimeUrl = oCard.getRuntimeUrl("/");

			if (bConfigurationAlreadyResolved) {
				oConfig.settings = oDataConfiguration;
			} else {
				oConfig.settingsJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, oCard.getBindingNamespaces());
			}
		} else if (oEditor) {
			oConfig.baseRuntimeUrl = oEditor.getRuntimeUrl("/");
			oConfig.settingsJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, oEditor.getBindingNamespaces());
		} else {
			oConfig.settingsJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, {});
		}

		return oConfig;
	};

	DataProviderFactory.prototype._applyMockDataConfiguration = function (oDataConfiguration) {
		if (oDataConfiguration.mockData && this._isProvidingConfiguration(oDataConfiguration.mockData)) {
			var oNewDataConfiguration = Object.assign({}, oDataConfiguration);
			delete oNewDataConfiguration.request;
			delete oNewDataConfiguration.service;
			delete oNewDataConfiguration.json;
			delete oNewDataConfiguration.extension;

			return Object.assign(oNewDataConfiguration, oDataConfiguration.mockData);
		}

		this.fireEvent("liveDataFallback");

		return oDataConfiguration;
	};

	/**
	 * @param {object} oDataCfg Data configuration
	 * @returns {boolean} Whether the configuration provides data
	 */
	DataProviderFactory.prototype._isProvidingConfiguration = function (oDataCfg) {
		return oDataCfg && (oDataCfg.request || oDataCfg.service || oDataCfg.json || oDataCfg.extension);
	};

	return DataProviderFactory;
});