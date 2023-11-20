/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/util/Measurement"
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
	 */
	var DataProvider = ManagedObject.extend("sap.ui.integration.util.DataProvider", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Data provider configuration from the manifest
				 */
				configuration: {
					type: "object"
				},

				/**
				 * Data settings.
				 */
				settings: {
					type: "object"
				},

				/**
				 * Data settings in json format. Will override <code>settings</code>.
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
		this._oDependencies = new Set();
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
	 * @param {sap.ui.integration.util.DataProvider} oDependency The new dependency.
	 */
	DataProvider.prototype.addDependency = function (oDependency) {
		this._oDependencies.add(oDependency);
	};

	/**
	 * Sets the data settings for the <code>DataProvider</code> in json format.
	 *
	 * @param {string} sSettingsJson The data settings in json format.
	 * @override
	 */
	DataProvider.prototype.setSettingsJson = function (sSettingsJson) {
		this.setProperty("settingsJson", sSettingsJson);
		this.setSettings(JSON.parse(sSettingsJson));

		if (this._bActive) {
			this._scheduleDataUpdate(0);
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

		pDataUpdate.catch((e) => {
			this.fireError({
				message: e
			});
		});

		return pDataUpdate;
	};

	DataProvider.prototype._triggerDataUpdate = function () {
		var oCard = this.getCard(),
			sMeasureId;

		this._bActive = true;
		this._iCurrentRequestNumber++;

		if (oCard) {
			sMeasureId = "UI5 Integration Cards " + oCard + " " + this.getId() + " getData#" + this._iCurrentRequestNumber;
			Measurement.start(sMeasureId, this.getDetails());
		}

		return this.getData()
			.then(function (oData) {
				if (oCard) {
					Measurement.end(sMeasureId);
				}

				this.fireDataChanged({data: oData});
				this.onDataRequestComplete();
			}.bind(this))
			.catch(function (oResult) {
				if (oCard) {
					Measurement.end(sMeasureId);
				}

				if (Array.isArray(oResult) && oResult.length > 0) {
					this.fireError({
						message: oResult[0],
						response: oResult[1],
						responseText: oResult[2],
						settings: oResult[3]
					});
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

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	DataProvider.prototype.load = function () {
		return this._pInitialRequestPromise;
	};

	DataProvider.prototype.onDataRequestComplete = function () {
		var iInterval;
		var oSettings = this.getSettings();

		if (!oSettings || !oSettings.updateInterval) {
			return;
		}

		iInterval = parseInt(oSettings.updateInterval);

		if (isNaN(iInterval)) {
			return;
		}

		this._scheduleDataUpdate(iInterval * 1000);
	};

	/**
	 * Schedules the call to triggerDataUpdate.
	 * @param {int} iTimeout timeout in ms
	 * @private
	 */
	DataProvider.prototype._scheduleDataUpdate = function (iTimeout) {
		if (this._iDataUpdateCallId) {
			clearTimeout(this._iDataUpdateCallId);
		}

		this._iDataUpdateCallId = setTimeout(this.triggerDataUpdate.bind(this), iTimeout);
	};

	/**
	 * Wait for other data providers which are marked as dependencies.
	 * @private
	 * @return {Promise} Promise which fulfills when all dependencies are ready.
	 */
	DataProvider.prototype._waitDependencies = function () {
		const aPromises = [];

		this._oDependencies.forEach((oDependency) => {
			aPromises.push(oDependency.load());
		});

		return Promise.all(aPromises);
	};

	/**
	 * @protected
	 * @returns {string} Details about the provider, to be used for logging.
	 */
	DataProvider.prototype.getDetails = function () {
		return "Static JSON data provided in the manifest.";
	};

	return DataProvider;
});