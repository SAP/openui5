/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/Log",
	"sap/ui/base/ManagedObject"
], function (library,
			 Log,
			 ManagedObject) {
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
				 * The actions configuration.
				 * @experimental since 1.75
				 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 * @deprecated Since version 1.85
				 * This property is replaced by the <code>actions</code> aggregation of the card;
				 */
				actions: {
					type: "sap.ui.integration.CardMenuAction[]",
					deprecated: true
				},

				/**
				 * The formatters, which can be used in the manifest.
				 * @experimental since 1.79
				 */
				formatters: {
					type: "object"
				}
			},
			events: {

				/**
				 * Fired when an action is triggered in the card.
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

	Extension.prototype.init = function () {
		this._oCardInterface = null;
		this._oCard = null;
	};

	Extension.prototype.exit = function () {
		this._oCardInterface = null;
		this._oCard = null;
	};

	/**
	 * See generated JSDoc
	 */
	Extension.prototype.setActions = function (aActions) {
		this.setProperty("actions", aActions);

		if (this._oCard) {
			this._oCard._refreshActionsMenu();
		}
	};

	/**
	 * See generated JSDoc
	 */
	Extension.prototype.setFormatters = function (aFormatters) {
		this.setProperty("formatters", aFormatters);

		if (!this._oCard) {
			return;
		}

		if (!this._oCard._bApplyManifest ||
			this._oCard.getAggregation("_extension") !== this) {
			Log.error("Extension formatters must be set before the initialization of the card. Do this inside Extension#init().");
		}
	};

	/**
	 * Called when the card is ready.
	 * @public
	 */
	Extension.prototype.onCardReady = function () { };

	/**
	 * Returns an interface to the card, which uses this extension.
	 * @public
	 * @returns {sap.ui.integration.widgets.CardFacade} An interface to the card.
	 */
	Extension.prototype.getCard = function () {
		return this._oCardInterface;
	};

	/**
	 * Sets the card.
	 *
	 * @param {object} oCard The card.
	 * @param {object} oCardInterface A limited interface to the card.
	 * @private
	 */
	Extension.prototype._setCard = function (oCard, oCardInterface) {
		this._oCard = oCard;
		this._oCardInterface = oCardInterface;
	};

	return Extension;
});