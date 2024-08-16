/*!
* ${copyright}
*/

sap.ui.require([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/customElements/CustomElementBase",
	"sap/f/cards/CardBadgeCustomData"
], function (
	Card,
	CustomElementBase,
	CardBadgeCustomData
) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomElementCard</code>.
	 *
	 * @class
	 * @extends sap.ui.integration.customElements.CustomElementBase
	 * @alias sap.ui.integration.customElements.CustomElementCard
	 * @private
	 */
	var CustomElementCard = CustomElementBase.extend(Card, {
		privateProperties: ["width", "height"],
		customProperties: {
			"badge": {
				set: function(oCard, vValue) {
					// only one badge is allowed through this API, remove the old badge
					oCard.getCustomData().forEach((oData) => {
						if (oData.isA("sap.m.BadgeCustomData") || oData.isA("sap.f.cards.CardBadgeCustomData")) {
							oCard.removeCustomData(oData);
						}
						});
					oCard.addCustomData( new CardBadgeCustomData({value: vValue}));
				}
			}
		}
	});

	/* Public methods */

	/**
	 * Refreshes the card by re-applying the manifest settings and triggering all data requests.
	 *
	 * @public
	 */
	CustomElementCard.prototype.refresh = function () {
		this._getControl().refresh();
	};

	/**
	 * Loads the module designtime/Card.designtime or the module given in
	 * "sap.card": {
	 *    "designtime": "designtime/Own.designtime"
	 * }
	 * This file should contain the designtime configuration for the card.
	 *
	 * Returns a promise that resolves with an object
	 * {
	 *    designtime: the designtime modules response
	 *    manifest: the complete manifest json
	 * }
	 * The promise is rejected if the module cannot be loaded with an object:
	 * {
	 *     error: "Card.designtime not found"
	 * }
	 *
	 * @public
	 * @returns {Promise} Promise resolves after the designtime configuration is loaded.
	 */
	CustomElementCard.prototype.loadDesigntime = function () {
		return this._getControl().loadDesigntime();
	};

	CustomElementBase.define("ui-integration-card", CustomElementCard);
});
