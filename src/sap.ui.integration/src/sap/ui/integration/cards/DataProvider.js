/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
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
	 * @since 1.65
	 * @alias sap.ui.integration.cards.DataProvider
	 */
	var DataProvider = ManagedObject.extend("sap.ui.integration.cards.DataProvider", {
		metadata: {
			events: {

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
			}
		}
	});

	/**
	 * Sets the destinations resolver
	 *
	 * @param {sap.ui.integration.util.Destinations} oDestinations The destinations resolver.
	 */
	DataProvider.prototype.setDestinations = function (oDestinations) {
		this._oDestinations = oDestinations;
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
	 * Gets the data settings for the <code>DataProvider</code>
	 *
	 * @returns {Object} The data settings.
	 */
	DataProvider.prototype.getSettings = function () {
		return this._oSettings;
	};

	/**
	 * Triggers a data update which results in either "dataChanged" event or an "error" event.
	 *
	 * @returns {Promise} A promise resolved when the update has finished.
	 */
	DataProvider.prototype.triggerDataUpdate = function () {
		return this.getData()
			.then(function (oData) {
				this.fireDataChanged({ data: oData });
			}.bind(this))
			.catch(function (sError) {
				this.fireError({ message: sError });
			}.bind(this));
	};

	/**
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

	/**
	 * Sets a data update interval.
	 *
	 * @param {number} iInterval The data update interval in seconds.
	 */
	DataProvider.prototype.setUpdateInterval = function (iInterval) {
		var iValue = parseInt(iInterval);
		if (!iValue) {
			return;
		}

		if (this._iIntervalId) {
			clearInterval(this._iIntervalId);
		}

		this._iIntervalId = setInterval(function () {
			this.triggerDataUpdate();
		}.bind(this), iValue * 1000);
	};

	DataProvider.prototype.destroy = function () {
		if (this._iIntervalId) {
			clearInterval(this._iIntervalId);
			this._iIntervalId = null;
		}
		this._oSettings = null;
		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	return DataProvider;
});