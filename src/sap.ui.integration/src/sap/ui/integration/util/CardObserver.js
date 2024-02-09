/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	/**
	 * Constructor for a new <code>CardObserver</code>.
	 *
	 * @param {object} [oCard] Instance of card to observe.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 */
	var CardObserver = BaseObject.extend("sap.ui.integration.util.CardObserver", {
		constructor: function (oCard) {
			BaseObject.call(this);
			this._oCard = oCard;
			this._oObservedDomRef = null;
		}
	});

	/**
	 * Destroys cardObserver
	 *
	 */
	CardObserver.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);
		this._oCard = null;

		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver = null;
		}
	};

	/**
	 * Creates cardObserver.
	 *
	 */
	CardObserver.prototype._createObserver = function () {
		if (!this._oObserver) {
			this._oObserver = new window.IntersectionObserver(function (oEntries) {
				oEntries.forEach(function (oEntry) {
					if (oEntry.isIntersecting) {
						this._bIsIntersected = true;
						this.loadManifest();
					}
				}.bind(this), {
					threshold: [0.1]
				});
			}.bind(this));
		}
	};

	/**
	 * Starts observing the target card.
	 * @param {Object} oDomRef The domRef of the card to be observed.
	 */
	CardObserver.prototype.observe = function (oDomRef) {
		if (!this._oObserver) {
			this._createObserver();
		}

		if (oDomRef !== this._oObservedDomRef) {
			if (this._oObservedDomRef) {
				this._oObserver.unobserve(this._oObservedDomRef);
			}

			this._oObserver.observe(oDomRef);
			this._oObservedDomRef = oDomRef;
			this._bIsIntersected = false;
		}
	};

	/**
	 * Stops observing the target card.
 	 * @param {Object} oDomRef The domRef of the card to be unobserved.
	 */
	CardObserver.prototype.unobserve = function (oDomRef) {
		if (this._oObserver && this._oObservedDomRef === oDomRef) {
			this._oObserver.unobserve(oDomRef);
			this._oObservedDomRef = null;
		}
	};

	/**
	 * Loads card manifest.
	 *
	 */
	CardObserver.prototype.loadManifest = function () {
		var oCardDomRef = this._oCard.getDomRef();
		this.unobserve(oCardDomRef);

		this._oCard.refresh();
	};

	/*
	 * @ui5-restricted sap.ui.integration
	 * @private
	 */
	CardObserver.prototype.isIntersected = function () {
		return this._bIsIntersected;
	};

	return CardObserver;
});
