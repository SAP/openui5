/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/base/Log",
	"sap/ui/integration/library",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/CacheAndRequestDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/ExtensionDataProvider",
	"sap/ui/integration/util/JSONBindingHelper",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/CsrfTokenHandler",
	"sap/ui/model/json/JSONModel"
], function (
	EventProvider,
	Log,
	library,
	ServiceDataProvider,
	RequestDataProvider,
	CacheAndRequestDataProvider,
	DataProvider,
	ExtensionDataProvider,
	JSONBindingHelper,
	BindingHelper,
	CsrfTokenHandler,
	JSONModel
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
			this._oCard = mSettings.card;
			this._oEditor = mSettings.editor;
			this._oHost = mSettings.host;

			if (mSettings.csrfTokensConfig) {
				this._oCsrfTokensModel = new JSONModel();
				this._oCsrfTokenHandler = new CsrfTokenHandler({
					configuration: mSettings.csrfTokensConfig,
					model: this._oCsrfTokensModel,
					dataProviderFactory: this
				});
			}

			this._aDataProviders = [];
			this._aFiltersProviders = [];
			this._pFilterBarReady = new Promise((resolve) => {
				this._oCard?.attachEventOnce("_filterBarReady", resolve);
			});
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
	 * @param {boolean} [bConfigurationResolved=false] Whether parsing and resolving of the configuration is done.
	 * @param {boolean} [bApiCardRequest=false] Whether the request is coming from a card API.
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {sap.ui.integration.util.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataConfiguration, oServiceManager, bIsFilter, bConfigurationResolved, bApiCardRequest) {
		var oCard = this._oCard;

		if (!DataProviderFactory.isProvidingConfiguration(oDataConfiguration) || oCard && oCard.getPreviewMode() === CardPreviewMode.Abstract) {
			return null;
		}

		if (oCard && oCard.getPreviewMode() === CardPreviewMode.MockData) {
			oDataConfiguration = this._applyMockDataConfiguration(oDataConfiguration);
		}

		var oEditor = this._oEditor,
			oHost = this._oHost || (oCard && oCard.getHostInstance()) || (oEditor && oEditor.getHostInstance()),
			bUseExperimentalCaching = oHost && oHost.bUseExperimentalCaching,
			oSettings = this._createDataProviderSettings(oDataConfiguration, bConfigurationResolved),
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

		oDataProvider.setConfiguration(oDataConfiguration);

		if (oCard) {
			BindingHelper.propagateModels(oCard, oDataProvider);
		} else if (oEditor) {
			BindingHelper.propagateModels(oEditor, oDataProvider);
		}

		oDataProvider.bindObject("/");
		oDataProvider.setDestinations(this._oDestinations);

		if (oDataProvider.isA("sap.ui.integration.util.IServiceDataProvider")) {
			oDataProvider.createServiceInstances(oServiceManager);
		}

		this._aDataProviders.push(oDataProvider);

		if (this._oCsrfTokenHandler) {
			const oToken = this._oCsrfTokenHandler.getUsedToken(oDataConfiguration);

			if (oToken) {
				oDataProvider.setCsrfTokenHandler(this._oCsrfTokenHandler);
				oDataProvider.addDependency(oToken);
				oDataProvider.setModel(this._oCsrfTokensModel, "csrfTokens");
			}
		}

		if (bIsFilter) {
			this._aFiltersProviders.push(oDataProvider);
		} else if (!bApiCardRequest && this._oCard && this._oCard.getAggregation("_filterBar")) {
			oDataProvider.addDependency(this._pFilterBarReady);
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
	};

	DataProviderFactory.prototype._createDataProviderSettings = function (oDataConfiguration, bConfigurationResolved) {
		const oSettings = {};
		const oCard = this._oCard;
		const oEditor = this._oEditor;

		if (oCard) {
			oSettings.baseRuntimeUrl = oCard.getRuntimeUrl("/");
			oSettings.card = oCard;

			if (!bConfigurationResolved) {
				oSettings.configurationJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, oCard.getBindingNamespaces());
			}
		} else if (oEditor) {
			oSettings.baseRuntimeUrl = oEditor.getRuntimeUrl("/");
			oSettings.configurationJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, oEditor.getBindingNamespaces());
		} else {
			oSettings.configurationJson = JSONBindingHelper.createJsonWithBindingInfos(oDataConfiguration, {});
		}

		return oSettings;
	};

	DataProviderFactory.prototype._applyMockDataConfiguration = function (oDataConfiguration) {
		if (!oDataConfiguration.mockData || !DataProviderFactory.isProvidingConfiguration(oDataConfiguration.mockData)) {
			Log.error("There is no mock data configured.", "sap.ui.integration.widgets.Card");
			return null;
		}

		var oNewDataConfiguration = Object.assign({}, oDataConfiguration);
		delete oNewDataConfiguration.request;
		delete oNewDataConfiguration.service;
		delete oNewDataConfiguration.json;
		delete oNewDataConfiguration.extension;

		return Object.assign(oNewDataConfiguration, oDataConfiguration.mockData);
	};

	/**
	 * @param {object} oDataCfg Data configuration
	 * @returns {boolean} Whether the configuration provides data
	 */
	DataProviderFactory.isProvidingConfiguration = function (oDataCfg) {
		return oDataCfg && (oDataCfg.request || oDataCfg.service || oDataCfg.json || oDataCfg.extension);
	};

	return DataProviderFactory;
});