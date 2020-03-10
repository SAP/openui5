/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./Extension'
],
	function (jQuery, Extension) {
		"use strict";

		/**
		 * Constructor for a new <code>Host</code>.
		 *
		 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new data provider.
		 *
		 * @class
		 * Provides application-level functions and services to an integration card.
		 *
		 * Examples may include, but are not limited to options like: share a card, remove a card.
		 *
		 * @extends sap.ui.integration.Extension
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @experimental
		 * @since 1.75
		 * @alias sap.ui.integration.Host
		 */
		var Host = Extension.extend("sap.ui.integration.Host", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					/**
					 * A function that resolves the given destination name to a URL.
					 *
					 * The Card calls this function when it needs to send a request to a destination.
					 * Function returns the URL to which the request is sent.
					 *
					 * If a card depends on a destination, but this callback is not implemented, an error will be logged.
					 *
					 * The callback receives <code>destinationName</code> as parameter and returns a string with the URL.
					 * Or alternatively the callback may return a <code>Promise</code> with the URL as an argument.
					 */
					resolveDestination: {
						type: "function",
						invalidate: false,
						parameters: {
							/**
							 * The name of the destination to resolve.
							 */
							destinationName: {type: "string"}
						}
					}
				},
				events: {}
			}
		});

		/**
		 * Resolves the destination and returns its URL.
		 *
		 * @param {string} sDestinationName The name of the destination.
		 * Most often the name which is used in the SAP Cloud Platform.
		 * @returns {Promise} A promise which resolves with the URL of the destination.
		 * @public
		 */
		Host.prototype.getDestination = function (sDestinationName) {
			var fnResolveDestination = this.getResolveDestination(),
				vReturn;

			if (!fnResolveDestination || !jQuery.isFunction(fnResolveDestination)) {
				return Promise.reject("Could not resolve destination '" + sDestinationName + "'. There is no 'resolveDestination' callback function configured in the host.");
			}

			vReturn = fnResolveDestination(sDestinationName);

			if (!vReturn) {
				return Promise.reject("Destination '" + sDestinationName + "' not found.");
			}

			if (vReturn instanceof Promise) {
				return vReturn;
			}

			return Promise.resolve(vReturn);
		};

		return Host;
	});