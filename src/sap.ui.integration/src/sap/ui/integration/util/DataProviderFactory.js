/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/CacheAndRequestDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/ExtensionDataProvider",
	"sap/ui/integration/util/JSONBindingHelper",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/CsrfTokenHandler"
], function (BaseObject,
			 ServiceDataProvider,
			 RequestDataProvider,
			 CacheAndRequestDataProvider,
			 DataProvider,
			 ExtensionDataProvider,
			 JSONBindingHelper,
			 BindingHelper,
			 CsrfTokenHandler) {
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
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @since 1.65
	 * @alias sap.ui.integration.util.DataProviderFactory
	 */
	var DataProviderFactory = BaseObject.extend("sap.ui.integration.util.DataProviderFactory", {
		constructor: function (mSettings) {
			BaseObject.call(this);

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
	 * @param {Object} oDataSettings The data settings.
	 * @param {sap.ui.integration.util.ServiceManager} oServiceManager A reference to the service manager.
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {sap.ui.integration.util.DataProvider|null} A data provider instance used for data retrieval.
	 */
	DataProviderFactory.prototype.create = function (oDataSettings, oServiceManager, bIsFilter) {
		var oCard = this._oCard,
			oEditor = this._oEditor,
			oHost = this._oHost || (oCard && oCard.getHostInstance()) || (oEditor && oEditor.getHostInstance()),
			bUseExperimentalCaching = oHost && oHost.bUseExperimentalCaching,
			oConfig,
			oDataProvider;

		if (!oDataSettings) {
			return null;
		}

		if (oCard) {
			oConfig = {
				"baseRuntimeUrl": oCard.getRuntimeUrl("/"),
				"settingsJson": JSONBindingHelper.createJsonWithBindingInfos(oDataSettings, oCard.getBindingNamespaces())
			};
		} else if (oEditor) {
			oConfig = {
				"baseRuntimeUrl": oEditor.getRuntimeUrl("/"),
				"settingsJson": JSONBindingHelper.createJsonWithBindingInfos(oDataSettings, oEditor.getBindingNamespaces())
			};
		} else {
			oConfig = {
				"settingsJson": JSONBindingHelper.createJsonWithBindingInfos(oDataSettings, {})
			};
		}

		if (oDataSettings.request && bUseExperimentalCaching) {
			oDataProvider = new CacheAndRequestDataProvider(oConfig);
			oDataProvider.setHost(oHost);
		} else if (oDataSettings.request) {
			oDataProvider = new RequestDataProvider(oConfig);

			if (oHost) {
				oDataProvider.setHost(oHost);
			}
		} else if (oDataSettings.service) {
			oDataProvider = new ServiceDataProvider(oConfig);
		} else if (oDataSettings.json) {
			oDataProvider = new DataProvider(oConfig);
		} else if (oDataSettings.extension) {
			oDataProvider = new ExtensionDataProvider(oConfig, this._oExtension);
		} else {
			return null;
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
	 * @param oDataProvider {sap.ui.integration.util.DataProvider}
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

	return DataProviderFactory;
});