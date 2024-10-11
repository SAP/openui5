/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Measurement"
], function (
	merge,
	ManagedObject,
	Element,
	BindingHelper,
	BindingResolver,
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
				 * Data provider configuration in manifest format. May contain FormData.
				 */
				configuration: {
					type: "object"
				},

				/**
				 * Configuration in stringified JSON format. Should be used when binding resolving is wanted.
				 * Anytime this value is changed, a new data update is triggered.
				 */
				configurationJson: {
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
	 * Sets the configuration for the <code>DataProvider</code> in JSON format.
	 *
	 * @param {string} sConfigurationJson The data settings in JSON format.
	 * @override
	 */
	DataProvider.prototype.setConfigurationJson = function (sConfigurationJson) {
		this.setProperty("configurationJson", sConfigurationJson);

		if (this._bActive) {
			this._scheduleDataUpdate(0);
		}
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {object} The resolved configuration.
	 */
	DataProvider.prototype.getResolvedConfiguration = function () {
		if (this.getConfigurationJson()) {
			return JSON.parse(this.getConfigurationJson());
		}

		return this.getConfiguration();
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
		const iCurrentRequestNumber = this._iCurrentRequestNumber;

		if (oCard) {
			sMeasureId = "UI5 Integration Cards " + oCard + " " + this.getId() + " getData#" + this._iCurrentRequestNumber;
			Measurement.start(sMeasureId, this.getDetails());
		}

		return this.getData()
			.then(function (oData) {
				if (oCard) {
					Measurement.end(sMeasureId);
				}

				if (iCurrentRequestNumber === this._iCurrentRequestNumber) {
					this.fireDataChanged({data: oData});
					this.onDataRequestComplete();
				}
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
		const oConfiguration = this.getResolvedConfiguration();

		return new Promise(function (resolve, reject) {
			if (oConfiguration.json) {
				resolve(oConfiguration.json);
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
		var oSettings = this.getResolvedConfiguration();

		if (!oSettings || !oSettings.updateInterval) {
			return;
		}

		iInterval = parseInt(oSettings.updateInterval);

		if (isNaN(iInterval)) {
			return;
		}

		this._scheduleDataUpdate(iInterval * 1000);
	};

	DataProvider.prototype.getCardInstance = function () {
		return Element.getElementById(this.getCard());
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
			if (oDependency instanceof Promise) {
				aPromises.push(oDependency);
			} else {
				aPromises.push(oDependency.load());
			}
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