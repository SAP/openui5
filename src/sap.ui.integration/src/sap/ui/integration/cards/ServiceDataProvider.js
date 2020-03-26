/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/cards/DataProvider"], function (DataProvider) {
	"use strict";

	/**
	 * Constructor for a new <code>ServiceDataProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.cards.DataProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.ui.integration.cards.ServiceDataProvider
	 */
	var ServiceDataProvider = DataProvider.extend("sap.ui.integration.cards.ServiceDataProvider", {
		metadata: {
			interfaces: ["sap.ui.integration.cards.IServiceDataProvider"]
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
	ServiceDataProvider.prototype.createServiceInstances = function (oServiceManager) {
		this._oServiceManager = oServiceManager;

		if (!this._oSettings || !this._oSettings.service) {
			return;
		}

		var vService = this._oSettings.service;
		if (vService && typeof vService === "object") {
			vService = vService.name;
		}

		this._createServiceInstance(vService);
	};

	/**
	 * Creates an instance of the required data service.
	 *
	 * @param {string} sServiceName The name of the service to create an instance of.
	 */
	ServiceDataProvider.prototype._createServiceInstance = function (sServiceName) {
		var oDataSettings = this._oSettings;

		this._oDataServicePromise = this._oServiceManager
			.getService(sServiceName)
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