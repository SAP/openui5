/*!
 * ${copyright}
 */
sap.ui.define(["sap/f/cards/DataProvider"], function (DataProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>ServiceDataProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.f.cards.DataProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.f.cards.ServiceDataProvider
	 */
	var ServiceDataProvider = DataProvider.extend("sap.f.cards.ServiceDataProvider", {
		metadata: {
			interfaces: ["sap.f.cards.IServiceDataProvider"]
		}
	});

	/**
	 * Destroys the <code>DataProvider</code> instance.
	 */
	ServiceDataProvider.prototype.destroy = function () {
		this._oDataServicePromise = null;
		if (this._oServiceManager) {
			this._oServiceManager = null;
		}
		DataProvider.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Sets a reference to a service manager and creates an instance
	 * for the required data service.
	 *
	 * @param {sap.ui.integration.util.ServiceManager} oServiceManager A reference to a pre-configured service manager instance.
	 */
	ServiceDataProvider.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		this._setServiceInstance();
	};

	/**
	 * Creates an instance of the required data service.
	 */
	ServiceDataProvider.prototype._setServiceInstance = function () {
		var oDataSettings = this._oSettings;

		this._oDataServicePromise = this._oServiceManager
			.getService("sap.ui.integration.services.Data")
			.then(function (oDataService) {
				oDataService.attachDataChanged(function (oEvent) {
					this.fireDataChanged({ data: oEvent.data });
				}.bind(this), oDataSettings.service.parameters);

				return oDataService;
			}.bind(this));
	};

	/**
	 * @override
	 * @returns {Promise} A promise resolved when the data is available and rejected in case of an error.
	 */
	ServiceDataProvider.prototype.getData = function () {
		var oDataSettings = this.getSettings();
		var oService = oDataSettings.service;

		return new Promise(function (resolve, reject) {
			if (oService && this._oDataServicePromise) {
				this._oDataServicePromise
					.then(function (oDataServiceInstance) {
						oDataServiceInstance.getData()
							.then(function (data) {
								resolve(data);
							})
							.catch(function () {
								reject("Card data service failed to get data.");
							});
					})
					.catch(function () {
						reject("Card data service unavailable.");
					});
			} else {
				reject("Could not get card data.");
			}
		}.bind(this));
	};

	return ServiceDataProvider;
});