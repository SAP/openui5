/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/base/Object"
], function (library, BaseObject) {
	"use strict";

	//Shortcut to sap.ui.integration.library.CarDataMode
	var CardDataMode = library.CardDataMode;

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
		}
	});


	/**
	 * Destroys cardObserver
	 *
	 */
	CardObserver.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);
		this._oCard = null;

		if (this.oObserver) {
			this.oObserver.disconnect();
			this.oObserver = null;
		}
	};

	/**
	 * Creates cardObserver.
	 *
	 */
	CardObserver.prototype.createObserver = function () {
		if (!this.oObserver) {
			this.oObserver = new window.IntersectionObserver(function (oEntries) {
				oEntries.forEach(function (oEntry) {
					if (oEntry.isIntersecting) {
						this.loadManifest();
					}
				}.bind(this), {
					threshold: [0.1]
				});
			}.bind(this));
		}
	};

	/**
	 * Loads card manifest.
	 *
	 */
	CardObserver.prototype.loadManifest = function () {
		var oCardDomRef = this._oCard.getDomRef();
		this._oCard.setDataMode(CardDataMode.Active);
		this.oObserver.unobserve(oCardDomRef);
	};

	return CardObserver;
});
