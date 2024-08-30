/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/core/Element",
	"sap/ui/core/Supportability",
	"sap/base/util/fetch"
], function (
	library,
	Element,
	Supportability,
	fetch
) {
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
						destinationName: {type: "string"},

						/**
						 * The card that resolves the destination.
						 */
						card: {type: "sap.ui.integration.widgets.Card"}
					}
				}
			},
			events: {

				/**
				 * Fired when an action is triggered.
				 *
				 * When an action is triggered in the card it can be handled on several places by "action" event handlers. In consecutive order those places are: <code>Extension</code>, <code>Card</code>, <code>Host</code>.
				 * Each of them can prevent the next one to handle the action by calling <code>oEvent.preventDefault()</code>.
				 *
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
						 *
						 * <b>Disclaimer:</b> Since 1.129 the special parameter <code>data</code> for action <code>Submit</code> is deprecated and must not be used. Use event parameter <code>formData</code> instead.
						 */
						parameters: {
							type: "object"
						},

						/**
						 * All form data that is filled inside the card. This parameter is available only with action types <code>Submit</code> and <code>Custom</code>.
						 *
						 * The format will be the same as in the <code>form</code> model available in the card manifest. For more information look at the documentation for each individual form type.
						 * @since 1.129
						 */
						formData: {
							type: "object"
						},

						/**
						 * The type of the action.
						 */
						type: {
							type: "sap.ui.integration.CardActionType"
						}
					}
				},

				/**
				 * Fired when some card configuration settings are changed as a result of user interaction.
				 * For example - filter value is changed.
				 * @experimental since 1.96
				 */
				cardConfigurationChange: {
					parameters: {
						/**
						 * The card the changes are fired from.
						 */
						card: { type: "sap.ui.core.Control" },
						/**
						 * Changed configuration settings.
						 *
						 * Example:
						 * <pre>
						 *  {
						 *     "/sap.card/configuration/filters/shipper/value": "key3",
						 *     "/sap.card/configuration/filters/item/value": "key2"
						 *  }
						 * </pre>
						 */
						changes: {
							type: "object"
						}
					}
				},

				/**
				 * Fired when the state of a card is changed.
				 * For example - the card is ready, new page is selected inside the card, a filter is changed or data is refreshed.
				 * @experimental since 1.107
				 */
				cardStateChanged: {
					parameters: {
						/**
						 * The card the changes are fired from.
						 */
						card: { type: "sap.ui.core.Control" }
					}
				},

				/**
				 * Fired when the card is initially ready for the first time.
				 * Will not be fired for consecutive refreshes or data changes.
				 * @experimental since 1.116
				 */
				cardInitialized: {
					parameters: {
						/**
						 * The card.
						 */
						card: { type: "sap.ui.core.Control" }
					}
				},

				/**
				 * Fired when a message from channels like navigator.serviceWorker is received.
				 * @experimental since 1.91
				 */
				message: {
					parameters: {
						data: { type: 'object' }
					}
				}
			}
		}
	});

	/**
	 * Sets a new value for property {@link #setResolveDestination resolveDestination}.
	 *
	 * A function that resolves the given destination name to a URL.

	 * The Card calls this function when it needs to send a request to a destination. Function returns the URL to which the request is sent.

	 * If a card depends on a destination, but this callback is not implemented, an error will be logged.

	 * The callback receives <code>destinationName</code> as parameter and returns a string with the URL. Or alternatively the callback may return a <code>Promise</code> with the URL as an argument.
	 *
	 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
	 *
	 * @method
	 * @param {function(string, sap.ui.integration.widgets.Card): (string|Promise<string>)} [fnResolveDestination] New value for property <code>resolveDestination</code>
	 * @public
	 * @name sap.ui.integration.Host#setResolveDestination
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 */

	/**
	 * Gets current value of property {@link #getResolveDestination resolveDestination}.
	 *
	 * A function that resolves the given destination name to a URL.
	 *
	 * The Card calls this function when it needs to send a request to a destination. Function returns the URL to which the request is sent.
	 *
	 * If a card depends on a destination, but this callback is not implemented, an error will be logged.
	 *
	 * The callback receives <code>destinationName</code> as parameter and returns a string with the URL. Or alternatively the callback may return a <code>Promise</code> with the URL as an argument.
	 *
	 * @method
	 * @returns {function(string, sap.ui.integration.widgets.Card): (string|Promise<string>)|undefined} Value of property <code>resolveDestination</code>
	 * @public
	 * @name sap.ui.integration.Host#getResolveDestination
	 */

	Host.prototype.init = function () {
		this._handlePostMessageBound = this._handlePostMessage.bind(this);
	};

	/**
	 * Resolves the destination and returns its URL.
	 *
	 * @param {string} sDestinationName The name of the destination.
	 * @param {sap.ui.integration.widgets.Card} oCard The card that depends on the destination.
	 * @returns {Promise<string>} A promise which resolves with the URL of the destination.
	 *
	 * @public
	 */
	Host.prototype.getDestination = function (sDestinationName, oCard) {
		var fnResolveDestination = this.getResolveDestination(),
			vReturn;

		if (typeof fnResolveDestination !== "function") {
			return Promise.reject("Could not resolve destination '" + sDestinationName + "'. There is no 'resolveDestination' callback function configured in the host.");
		}

		vReturn = fnResolveDestination(sDestinationName, oCard);

		if (vReturn === null || vReturn === undefined) {
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
	 * @returns {Promise<null>} A promise which resolves with the value of this context.
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
	 * @returns {Promise<object[]>} A promise which resolves with the list of destinations.
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
	 * @returns {Promise<object>} A promise which contains the context structure.
	 * @since 1.83
	 * @public
	 */
	Host.prototype.getContexts = function () {
		return Promise.resolve({});
	};

	/**
	 * Call this method if you want to use the experimental caching for all cards.
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.91. The API might change.
	 */
	Host.prototype.useExperimentalCaching = function () {
		this.bUseExperimentalCaching = true;
		this.subscribeForMessages();
	};

	/**
	 * Stops the usage of the experimental caching for all cards.
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.91. The API might change.
	 */
	Host.prototype.stopUsingExperimentalCaching = function () {
		this.bUseExperimentalCaching = false;
		this.unsubscribeForMessages();
	};

	/**
	 * Starts the process of fetching a resource from the network, returning a promise that is fulfilled once the response is available.
	 * Use this method to override the default behavior when fetching network resources.
	 * Mimics the browser native Fetch API.
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.113. The API might change.
	 * @param {string} sResource This defines the resource that you wish to fetch.
	 * @param {object} mOptions An object containing any custom settings that you want to apply to the request.
	 * @param {object} mRequestSettings The map of request settings defined in the card manifest. Use this only for reading, they can not be modified.
	 * @param {sap.ui.integration.widgets.Card} oCard The card which initiated the request.
	 * @returns {Promise<Response>} A <code>Promise</code> that resolves to a <code>Response</code> object.
	 */
	Host.prototype.fetch = function (sResource, mOptions, mRequestSettings, oCard) {
		if (Supportability.isStatisticsEnabled()) {
			sResource = this._addStatisticsParameter(sResource);
		}

		if (this.bUseExperimentalCaching) {
			this._addCacheHeaders(mOptions.headers, mRequestSettings);
		}

		return fetch(sResource, mOptions);
	};

	/**
	 * Override this method to change the source for the analytics cloud widget script.
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.125. The API might change.
	 */
	Host.prototype.getAnalyticsCloudWidgetSrc = function () { };

	Host.prototype._addStatisticsParameter = function (sUrl) {
		var oUrl = new URL(sUrl, window.location.href);

		// add statistics parameter to every request (supported only on Gateway servers)
		oUrl.searchParams.set("sap-statistics", "true");

		return oUrl.href;
	};

	/**
	 * @private
	 * @param {Headers} mHeaders The current map of headers.
	 * @param {object} mRequestSettings The map of request settings defined in the card manifest.
	 */
	Host.prototype._addCacheHeaders = function (mHeaders, mRequestSettings) {
		var oCacheSettings = mRequestSettings.cache,
			aCacheControl = [];

		if (oCacheSettings.enabled === false) {
			// cache disabled
			aCacheControl.push("max-age=0");
			aCacheControl.push("no-store");
		} else {
			aCacheControl.push("max-age=" + parseInt(oCacheSettings.maxAge || 0));

			if (oCacheSettings.staleWhileRevalidate) {
				aCacheControl.push("x-stale-while-revalidate");
			}
		}

		if (aCacheControl.length) {
			mHeaders.set("Cache-Control", aCacheControl.join(", "));
		}

		mHeaders.set("x-sap-card", "true");
		mHeaders.set("x-use-cryptocache", "true");
	};

	/**
	 * By default subscribes to navigator.serviceWorker messages.
	 * Override to subscribe to different channels.
	 * @private
	 * @ui5-restricted
	 */
	Host.prototype.subscribeForMessages = function () {
		if (!navigator || !navigator.serviceWorker) {
			return;
		}

		navigator.serviceWorker.addEventListener("message", this._handlePostMessageBound);
	};

	/**
	 * Unsubscribes from navigator.serviceWorker messages.
	 * @private
	 * @ui5-restricted
	 */
	Host.prototype.unsubscribeForMessages = function () {
		if (!navigator || !navigator.serviceWorker) {
			return;
		}

		navigator.serviceWorker.removeEventListener("message", this._handlePostMessageBound);
	};

	/**
	 * Handler for a post message event
	 * @private
	 * @param {*} oEvent The post message event.
	 */
	Host.prototype._handlePostMessage = function (oEvent) {
		this.fireMessage({
			data: oEvent.data
		});
	};

	return Host;
});