/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject) {
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
	 * @experimental Since 1.75
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
				 */
				actions: {
					type: "sap.ui.integration.CardMenuAction[]"
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
		this._oCard = null;
	};

	Extension.prototype.exit = function () {
		this._oCard = null;
	};

	/**
	 * Called before any other method is called, so that the card is available there.
	 * Reconsider the name of the method before making it public and available for overriding.
	 *
	 * @param {object} oCardInterface A limited interface to the card.
	 * @private
	 */
	Extension.prototype.onCardReady = function (oCardInterface) {
		this._oCard = oCardInterface;
	};

	/**
	 * Returns an interface to the card, which uses this extension.
	 * @public
	 * @returns {sap.ui.integration.widgets.CardFacade} An interface to the card.
	 */
	Extension.prototype.getCard = function () {
		return this._oCard;
	};

	return Extension;
});