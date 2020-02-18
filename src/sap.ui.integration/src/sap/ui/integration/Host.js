/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./Extension',
	"sap/base/Log"
],
	function (jQuery, Extension, Log) {
		"use strict";

		/**
		 * Constructor for a new <code>Host</code>.
		 *
		 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new data provider.
		 *
		 * @class
		 *
		 *
		 * @extends sap.ui.integration.Extension
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.75
		 * @alias sap.ui.integration.Host
		 */
		var Host = Extension.extend("sap.ui.integration.Host", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					/**
					 * A function which resolves the given destination name to an url.
					 *
					 * The Card will call that function when it needs to send a request to a destination. The result of the function will must be the url to which the request is sent.
					 *
					 * If a card depends on a destination, but this callback is not implemented, an error will be logged.vement.
					 *
					 * The callback receives <code>destinationName</code> as parameter and must return a string with the url or a Promise which resolves with one argument which is the url.
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
		 * Resolves the destination and returns its Url.
		 *
		 * @param {string} sDestinationName The name of the destination. Most oftne the name which is used in Cloud Platform.
		 * @returns {Promise} A promise which resolves with the url of the destination.
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