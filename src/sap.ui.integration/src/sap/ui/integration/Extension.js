/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/base/util/fetch"
], function (library,
			 Log,
			 ManagedObject,
			 fetch) {
	"use strict";

	/**
	 * Constructor for a new <code>Extension</code>.
	 *
	 * @param {string} [sId] ID for the new extension, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new extension.
	 *
	 * @class
	 * Brings JavaScript capabilities for an {@link sap.ui.integration.widgets.Card} where custom logic can be implemented.
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.75
	 * @alias sap.ui.integration.Extension
	 */
	var Extension = ManagedObject.extend("sap.ui.integration.Extension", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * The formatters that can be used in the manifest.
				 * @experimental since 1.79
				 */
				formatters: {
					type: "object"
				}
			},
			events: {

				/**
				 * Fired when an action is triggered in the card.
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
						card: {type: "sap.ui.core.Control"},

						/**
						 * The action configuration.
						 */
						actionConfig: {type: 'object'},

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
				}
			}
		}
	});

	Extension.prototype.init = function () {
		this._oCardInterface = null;
		this._oCard = null;
	};

	Extension.prototype.exit = function () {
		this._oCardInterface = null;
		this._oCard = null;
	};

	/**
	 * Sets current value of property {@link #setFormatters formatters}.
	 *
	 * The formatters that can be used in the manifest.
	 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
	 *
	 * @method
	 * @param {Object<string, function>} [aFormatters] New value of property <code>formatters</code>
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @name sap.ui.integration.Extension#setFormatters
	 */
	Extension.prototype.setFormatters = function (aFormatters) {
		this.setProperty("formatters", aFormatters);

		if (!this._oCard) {
			return this;
		}

		if (!this._oCard._bApplyManifest ||
			this._oCard.getAggregation("_extension") !== this) {
			Log.error("Extension formatters must be set before the initialization of the card. Do this inside Extension#init().");
		}

		return this;
	};

	/**
	 * Gets current value of property {@link #getFormatters formatters}.
	 *
	 * The formatters that can be used in the manifest.
	 *
	 * @method
	 * @returns {Object<string, function>|undefined} Value of property <code>formatters</code>
	 * @public
	 * @name sap.ui.integration.Extension#getFormatters
	 */

	/**
	 * Called after the card is initialized.
	 * @public
	 */
	Extension.prototype.onCardReady = function () { };

	/**
	 * Override this method to lazy load dependencies for the extension.
	 *
	 * @public
	 * @experimental Since 1.108
	 * @returns {Promise} Returns a promise. The card will wait for this promise to be resolved before continuing with the initialization.
	 */
	Extension.prototype.loadDependencies = function () {
		return Promise.resolve();
	};

	/**
	 * Returns an interface to the card, which uses this extension.
	 * @public
	 * @returns {sap.ui.integration.widgets.CardFacade} An interface to the card.
	 */
	Extension.prototype.getCard = function () {
		return this._oCardInterface;
	};

	/**
	 * Starts the process of fetching a resource from the network, returning a promise that is fulfilled once the response is available.
	 * Use this method to override the default behavior when fetching network resources.
	 * Mimics the browser native Fetch API.
	 * @public
	 * @experimental Since 1.113. The API might change.
	 * @param {string} sResource This defines the resource that you wish to fetch.
	 * @param {object} mOptions An object containing any custom settings that you want to apply to the request.
	 * @param {object} mRequestSettings The map of request settings defined in the card manifest. Use this only for reading, they can not be modified.
	 * @returns {Promise<Response>} A <code>Promise</code> that resolves to a <code>Response</code> object.
	 */
	Extension.prototype.fetch = function (sResource, mOptions, mRequestSettings) {
		var oCard = this._oCard,
			oHost = this._oCard.getHostInstance();

		if (oHost) {
			return oHost.fetch(sResource, mOptions, mRequestSettings, oCard);
		} else {
			return fetch(sResource, mOptions);
		}
	};

	/**
	 * Override this method to provide a custom blocking message in case of an automatic blocking message shown by the card.
	 * It will be called when there is a <code>NoData</code> or an <code>Error</code> message.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {sap.ui.integration.BlockingMessageSettings} The blocking message settings.
	 */
	Extension.prototype.overrideBlockingMessage = function () {
		return null;
	};

	/**
	 * Sets the card.
	 *
	 * @param {object} oCard The card.
	 * @param {object} oCardInterface A limited interface to the card.
	 * @private
	 */
	Extension.prototype._setCard = function (oCard, oCardInterface) {
		this._oCard = oCard; // @ui5-restricted sap.insights.CardExtension
		this._oCardInterface = oCardInterface;
	};

	return Extension;
});