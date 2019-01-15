/*!
 * ${copyright}
 */
sap.ui.define(['./Service'], function (Service) {
	"use strict";

	/**
	 * @class Data
	 * Provides an interface for a simple DataService
	 * @experimental
	 * @sap-restricted sap.ushell
	 * @extends Service
	 */
	var Data = Service.extend();

	/**
	 * @callback fnDataChangeCallback
	 * @param {Object} oEvent The event object.
	 * @param {Object} oEvent.data The data.
	 * @param {Object} oData Additional parameters which should be send along with the callback. Provided by attachDataChange function.
	 */

	/**
	 * Attaches an event handler to the event with the given identifier.
	 * @param {function} fnDataChangeCallback The handler function to call when the dataChange event occurs.
	 * @param {Object} [oData] An object that will be passed to the handler along with the event object when the event is fired
	 * @abstract
	 */
	Data.prototype.attachDataChanged = function (fnDataChangeCallback, oData) {};

	/**
	 * Expected by a consumer of a data service to retrieve updates of the data.
	 * The consumer might implement a polling mechanism for data and therefore could ask
	 * periodically for the data.
	 * It is up to the service to decide how to handle such periodic requests and whether they result
	 * in real fetching of data from a backend service.
	 *
	 * @param {object} [oInfo] an info object that gives the service more information about this getData call.
	 * @returns {Promise} the JSON of the data that should be updated or a promise that resolves with the data.
	 * @abstract
	 */
	Data.prototype.getData = function (oInfo) {
		return Promise.resolve(false);
	};

	return Data;
});
