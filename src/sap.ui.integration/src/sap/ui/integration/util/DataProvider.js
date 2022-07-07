/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/performance/Measurement"
], function (
	ManagedObject,
	Measurement
) {
	"use strict";

	/**
	 * Constructor for a new <code>DataProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 * Provides data for the card, card header and card content by reading the "data" part of the card manifest.
	 * Hides the complexity of working with different data providers like:
	 *  - static JSON data
	 * 	- data services which implements the interface <code>sap.ui.integration.services.Data</code> class
	 *  - AJAX calls like <code>sap.ui.integration.cards.Data</code> class
	 * Allows for an extensible way to add more data providers.
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @since 1.65
	 * @alias sap.ui.integration.util.DataProvider
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var DataProvider = ManagedObject.extend("sap.ui.integration.util.DataProvider", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Data settings in json format. Will override any other settings.
				 */
				settingsJson: {
					type: "string"
				},

				/**
				 * The base url where resources for card or editor are located.
				 */
				baseRuntimeUrl: {
					type : "string"
				}
			},
			events: {

				/**
				 * Event fired when new data is requested.
				 */
				dataRequested: {
					parameters : {

					}
				},

				/**
				 * Event fired when new data is available.
				 */
				dataChanged: {
					parameters : {

						/**
						 * The data JSON.
						 */
						data : { type : "object" }
					}
				},

				/**
				 * Event fired when an error is thrown.
				 */
				error: {
					parameters : {

						/**
						 * The error message.
						 */
						message : { type : "string" }
					}
				}
			},
			associations: {
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				}
			}
		}
	});

	DataProvider.prototype.init = function () {
		this._iCurrentRequestNumber = 0;
	};

	/**
	 * Sets the destinations resolver
	 *
	 * @param {sap.ui.integration.util.Destinations} oDestinations The destinations resolver.
	 */
	DataProvider.prototype.setDestinations = function (oDestinations) {
		this._oDestinations = oDestinations;
	};

	/**
	 * Sets the CSRF token handler
	 *
	 * @param {sap.ui.integration.util.CsrfTokenHandler} oCsrfTokenHandler The CSRF token handler.
	 */
	DataProvider.prototype.setCsrfTokenHandler = function (oCsrfTokenHandler) {
		this._oCsrfTokenHandler = oCsrfTokenHandler;
	};

	/**
	 * Sets a list of <code>sap.ui.integration.util.DataProvider</code> which will be considered dependencies of the current one.
	 * @param {sap.ui.integration.util.DataProvider[]} aDependencies The list of dependencies.
	 */
	DataProvider.prototype.setDependencies = function (aDependencies) {
		this._aDependencies = aDependencies;
	};

	/**
	 * Sets the data settings for the <code>DataProvider</code> in json format.
	 *
	 * @param {string} sSettingsJson The data settings in json format.
	 */
	DataProvider.prototype.setSettingsJson = function (sSettingsJson) {
		this.setProperty("settingsJson", sSettingsJson);

		this.setSettings(JSON.parse(sSettingsJson));

		if (this._bActive) {
			this._scheduleDataUpdate();
		}
	};

	/**
	 * @private
	 * @param {string} sUrl
	 */
	DataProvider.prototype._getRuntimeUrl = function(sUrl) {
		if (sUrl.startsWith("http://") ||
			sUrl.startsWith("https://") ||
			sUrl.startsWith("//")) {
			return sUrl;
		}
		var sSanitizedUrl = sUrl && sUrl.trim().replace(/^\//, "");
		return this.getBaseRuntimeUrl() + sSanitizedUrl;
	};

	/**
	 * Sets the data settings for the <code>DataProvider</code>
	 *
	 * @param {Object} oSettings The data settings.
	 */
	DataProvider.prototype.setSettings = function (oSettings) {
		this._oSettings = oSettings;
	};

	/**
	 * Returns the data settings for the <code>DataProvider</code>
	 *
	 * @returns {Object} The data settings.
	 */
	DataProvider.prototype.getSettings = function () {
		return this._oSettings;
	};

	/**
	 * Triggers a data update which results in either "dataChanged" event or an "error" event.
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {Promise} A promise resolved when the update has finished.
	 */
	DataProvider.prototype.triggerDataUpdate = function () {
		var pDependencies,
			pDataUpdate;

		this.fireDataRequested();

		// wait for any dependencies before the first initial data request
		pDependencies = this._waitDependencies();

		pDataUpdate = pDependencies.then(this._triggerDataUpdate.bind(this));

		if (!this._pInitialRequestPromise) {
			this._pInitialRequestPromise = pDataUpdate;
		}

		return pDataUpdate;
	};

	DataProvider.prototype._triggerDataUpdate = function () {
		this._bActive = true;
		this._iCurrentRequestNumber++;
		var oGetDataMeasurement;

		if (this.getCard()) {
			oGetDataMeasurement = Measurement.start("UI5 Integration Cards - " + this.getCard() +  "-" + this.getId() + "---getData#" + this._iCurrentRequestNumber);
		}

		return this.getData()
			.then(function (oData) {
				if (oGetDataMeasurement) {
					Measurement.end(oGetDataMeasurement.id);
				}

				this.fireDataChanged({data: oData});
				this.onDataRequestComplete();
			}.bind(this))
			.catch(function (oResult) {
				if (oGetDataMeasurement) {
					Measurement.end(oGetDataMeasurement.id);
				}

				if (Array.isArray(oResult) && oResult.length > 0) {
					this.fireError({message: oResult[0], jqXHR: oResult[1]});
				} else {
					this.fireError({message: oResult});
				}
				this.onDataRequestComplete();
			}.bind(this));
	};

	/**
	 * Triggers a data update and returns the result data.
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {Promise} A promise resolved when the data is available and rejected in case of an error.
	 */
	DataProvider.prototype.getData = function () {
		var oDataSettings = this.getSettings();
		return new Promise(function (resolve, reject) {
			if (oDataSettings.json) {
				resolve(oDataSettings.json);
			} else {
				reject("Could not get card data.");
			}
		});
	};

	DataProvider.prototype.destroy = function () {
		if (this._iIntervalId) {
			clearInterval(this._iIntervalId);
			this._iIntervalId = null;
		}

		if (this._iDataUpdateCallId) {
			clearTimeout(this._iDataUpdateCallId);
			this._iDataUpdateCallId = null;
		}

		this._oSettings = null;
		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	DataProvider.prototype.getInitialRequestPromise = function () {
		return this._pInitialRequestPromise;
	};

	DataProvider.prototype.onDataRequestComplete = function () {
		var iInterval;

		if (!this._oSettings || !this._oSettings.updateInterval) {
			return;
		}

		iInterval = parseInt(this._oSettings.updateInterval);

		if (isNaN(iInterval)) {
			return;
		}

		setTimeout(function () {
			this.triggerDataUpdate();
		}.bind(this), iInterval * 1000);
	};


	/**
	 * Schedules the call to triggerDataUpdate.
	 * @private
	 */
	DataProvider.prototype._scheduleDataUpdate = function () {
		if (this._iDataUpdateCallId) {
			clearTimeout(this._iDataUpdateCallId);
		}

		this._iDataUpdateCallId = setTimeout(this.triggerDataUpdate.bind(this), 0);
	};

	/**
	 * Wait for other data providers which are marked as dependencies.
	 * @private
	 * @return {Promise} Promise which fulfills when all dependencies are ready.
	 */
	DataProvider.prototype._waitDependencies = function () {
		var aDependencies = this._aDependencies || [],
			aPromises = [];

		aDependencies.forEach(function (oDataProvider) {
			aPromises.push(oDataProvider.getInitialRequestPromise());
		});

		return Promise.all(aPromises);
	};

	return DataProvider;
});