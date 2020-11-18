/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	'sap/ui/core/Element'
], function (library,
			 Element) {
		"use strict";

		/**
		 * Constructor for a new <code>Host</code>.
		 *
		 * @param {string} [sId] ID for the new host, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new host.
		 *
		 * @class
		 * Provides application-level functions and services to an integration card.
		 *
		 * Examples may include, but are not limited to options like: share a card, remove a card.
		 *
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @experimental since 1.75
		 * @since 1.75
		 * @alias sap.ui.integration.Host
		 */
		var Host = Element.extend("sap.ui.integration.Host", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					/**
					 * The actions configuration.
					 * @experimental since 1.75
					 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
					 */
					actions: {
						type: "sap.ui.integration.CardMenuAction[]"
					},

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
							destinationName: { type: "string" }
						}
					}
				},
				events: {

					/**
					 * Fired when an action is triggered.
					 * @experimental since 1.75
					 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
					 */
					action: {

						allowPreventDefault: true,

						parameters: {
							/**
							 * The card the action is fired from.
							 */
							card: { type: "sap.ui.core.Control" },

							/**
							 * The action configuration.
							 */
							actionConfig: { type: 'object' },

							/**
							 * The action source.
							 */
							actionSource: {
								type: "sap.ui.core.Control"
							},

							/**
							 * The parameters related to the triggered action.
							 */
							parameters: {
								type: "object"
							},

							/**
							 * The type of the action.
							 */
							type: {
								type: "sap.ui.integration.CardActionType"
							}
						}
					}
				}
			}
		});

		/**
		 * Resolves the destination and returns its URL.
		 *
		 * @param {string} sDestinationName The name of the destination.
		 * Most often the name which is used in the SAP Cloud Platform.
		 * @returns {Promise} A promise which resolves with the URL of the destination.
		 *
		 * @public
		 */
		Host.prototype.getDestination = function (sDestinationName) {
			var fnResolveDestination = this.getResolveDestination(),
				vReturn;

			if (typeof fnResolveDestination !== "function") {
				return Promise.reject("Could not resolve destination '" + sDestinationName + "'. There is no 'resolveDestination' callback function configured in the host.");
			}

			vReturn = fnResolveDestination(sDestinationName);

			if (!vReturn) {
				return Promise.reject("Destination '" + sDestinationName + "' could not be resolved by the host.");
			}

			if (vReturn instanceof Promise) {
				return vReturn;
			}

			return Promise.resolve(vReturn);
		};

		/**
		 * Resolves the value for a given path in the context of the host
		 * Contexts can be used to configure Cards with information available in the host environment.
		 *
		 * Example Context Structure:
		 *   {
		 *     "sap.workzone": {
		 *       "currentUser: {
		 *         "id": {
		 *           "label": "Id of the Work Zone user",
		 *           "placeholder": "Work Zone user id",
		 *           "description": "The value will change based on the logged on user"
		 *         }
		 *       }
		 *     }
		 *     ...
		 *   }
		 *
		 * Example path to the current user id of the context
		 * sPath = "sap.workzone/currentUser/id"
		 * parameter: {
		 *     userId: {
		 *         value: "{context>sap.workzone/currentUser/id}" resolves to UserId
		 *     }
		 * }
		 *
		 * @param {string} sPath The path to a context
		 * @returns {Promise} A promise which resolves with the value of this context.
		 * @since 1.83
		 *
		 * @public
		 */
		Host.prototype.getContextValue = function (sPath) {
			if (!sPath) {
				return Promise.resolve(null);
			}
			return Promise.resolve(null);
		};

		/**
		 * Returns the list of destinations for the Card Editor design-time environment
		 * List entries are objects that contain at least the name.
		 * {
		 *    "name": "DestinationName"
		 * }
		 *
		 * @returns {Promise} A promise which resolves with the list of destinations.
		 * @since 1.83
		 *
		 * @public
		 */
		Host.prototype.getDestinations = function () {
			return Promise.resolve([]);
		};

		/**
		 * Returns the context object for the Card Editor design-time environment
		 * Contexts can be used to configure Cards with information available in the host environment.
		 * Each entry in the list should contain design-time information. A label, placeholder, and description should be provided.
		 *
		 * Example Context Structure:
		 *   {
		 *     "sap.workzone": {
		 *       "currentUser: {
		 *         "id": {
		 *           "label": "Id of the Work Zone user",
		 *           "placeholder": "Work Zone user id",
		 *           "description": "The value will change based on the logged on user"
		 *         }
		 *       }
		 *     }
		 *     ...
		 *   }
		 *
		 * The context information and texts should be translated as they appear in the design-time UI of the Card Editor.
		 *
		 * @returns {Promise} A promise which contains the context structure.
		 * @since 1.83
		 * @public
		 */
		Host.prototype.getContexts = function () {
			return Promise.resolve({});
		};

		return Host;
	});