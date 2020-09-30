/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new <code>Designtime</code>.
	 *
	 * @param {string} [sId] ID for the new Designtime, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Designtime.
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
	 * @alias sap.ui.integration.Designtime
	 */
	var Designtime = ManagedObject.extend("sap.ui.integration.Designtime", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (mSettings) {
			ManagedObject.apply(this);
			this.settings = mSettings || (this.create && this.create()) || {};
		}
	});

	Designtime.prototype.init = function () {
		this._oCard = null;
	};

	Designtime.prototype.exit = function () {
		this._oCard = null;
	};

	/**
	 * Called before any other method is called, so that the card is available there.
	 * Reconsider the name of the method before making it public and available for overriding.
	 *
	 * @param {object} oCardInterface A limited interface to the card.
	 * @param {object} oInternalCard Card instance for internal usage within this class.
	 * @private
	 */
	Designtime.prototype.onCardReady = function (oCardInterface, oInternalCard) {
		this._oCard = oCardInterface;
		this._oInternalCardInstance = oInternalCard;

	};

	Designtime.prototype._readyPromise = function (oCardInterface, oInternalCard) {
		this.onCardReady(oCardInterface, oInternalCard);
		//this promise can be used to later on to load the editors and create ui, before we tell the consumer
		//to continue after the loadDesigntime.
		return Promise.resolve();
	};

	/**
	 * Returns an interface to the card, which uses this extension.
	 * @public
	 * @returns {sap.ui.integration.widgets.CardFacade} An interface to the card.
	 */
	Designtime.prototype.getCard = function () {
		return this._oCard;
	};

	Designtime.prototype.getSettings = function () {
		return this.settings;
	};

	return Designtime;
});