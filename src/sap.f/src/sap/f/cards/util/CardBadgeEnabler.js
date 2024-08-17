/*!
 * ${copyright}
 */

// Provides helper sap.f.cards.util.CardBadgeEnabler
sap.ui.define([
	"sap/f/cards/CardBadgeCustomData",
	"sap/m/BadgeCustomData",
	"sap/m/ObjectStatus",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/f/library"
],
function(CardBadgeCustomData, BadgeCustomData, ObjectStatus, InvisibleText, Lib, coreLibrary, library) {
	"use strict";

	const CardBadgeVisibilityMode = library.CardBadgeVisibilityMode,
	IndicationColor = coreLibrary.IndicationColor;
	/**
	 *
	 * The class represents a utility for visualising and updating the badge indicator for
	 * <code>sap.f.CardBase</code> instances.
	 *
	 * @since 1.128
	 * @protected
	 * @alias sap.f.cards.util.CardBadgeEnabler
	 */
	var CardBadgeEnabler = function () {

		// Attaching eventDelegate
		this.initCardBadgeEnablement = function () {
			this.addEventDelegate({
				onBeforeRendering: createBadges
			}, this);

		};

		/**
		 * Creates <code>sap.m.ObjectStatus</code> from <code>sap.f.cards.CardBadgeCustomData</code>
		 *
		 * @returns {void}
	 	 * @private
		 */
		function createBadges () {
			const aCardBadgesCustomData = this._getCardBadgeCustomData();
			if (!aCardBadgesCustomData || this._aCardBadges ) {
				return;
			}

			this._aCardBadges = [];
			aCardBadgesCustomData.forEach( (oData) => {
				const sIcon = oData instanceof CardBadgeCustomData ? oData.getIcon() : "";

				const oCardBadge = new ObjectStatus({
					text: oData.getValue(),
					icon: sIcon,
					inverted: true,
					visible: oData.getVisible(),
					state: oData instanceof CardBadgeCustomData ? oData.getState() : IndicationColor.Indication05,
					stateAnnouncementText: oData instanceof CardBadgeCustomData ? oData.getAnnouncementText() : "",
					id: "badge" + oData.getId()
				});

				if (sIcon.length > 0 && oData.getValue()?.length > 0) {
					oCardBadge.addStyleClass("sapFCardBadgeTextIcon"); //ObjectStatus does not have CSS class to indicate icon and text presence
				}
				this._aCardBadges.push(oCardBadge);
			});
		}

		/**
		 * Returns all CardBadgeCustomData elements from customdata, or just an element corresponding to the key

		 * @returns {Array} aCardBadgeCustomData
		 */
		this._getCardBadgeCustomData  = function () {
			const aCardBadgeCustomData = this.getCustomData().filter(function(item) {return item instanceof CardBadgeCustomData || item instanceof BadgeCustomData;});

			return aCardBadgeCustomData;
		};

		/**
		 * Returns badges added to the aggregation of card "_cardBadges"
		 *
		 * @returns {Array} Cards _cardBadges aggregation
		 */
		this._getCardBadges  = function () {
			this._aCardBadges.forEach( (oCardBadge) => {
				this.addAggregation("_cardBadges", oCardBadge);
			});

			return this.getAggregation("_cardBadges");
		};

		/**
		 * Gets badge corresponding to the <code>sap.f.cards.CardBadgeCustomData</code>
		 *
		 * @param {string} sId ID of the <code>sap.f.cards.CardBadgeCustomData</code>
		 * @returns {object} oCardBadge
		 */
		this._getCardBadgeElement =  function (sId) {
			const oCardBadge = this._getCardBadges().find((oElement) => oElement.getId().indexOf(sId) > 0);

			return oCardBadge;
		};

		/**
		 * Creates invisibleText, which contains the card badge accessibility information
		 * @returns {object} _oInvisibleCardBadgeText
		 */
		this._getInvisibleCardBadgeText = function () {
			if (this._oInvisibleCardBadgeText) {

				return this._oInvisibleCardBadgeText;
			}

			this._oInvisibleCardBadgeText = new InvisibleText({id: this.getId() + "-ariaBadgeText", text: this._getCardBadgeAccessibilityText()});

			return this._oInvisibleCardBadgeText;
		};

		/**
		 * Gets accessibility text for badge
		 * @returns {string} sCardBadgeAccText
		 */
		this._getCardBadgeAccessibilityText = function () {
			const _oRb = Lib.getResourceBundleFor("sap.f");

			let sCardBadgeAccText = "";
			this._getCardBadges().forEach((oCardBadge) => {
				if (oCardBadge.getVisible() && oCardBadge.getStateAnnouncementText()) {
					sCardBadgeAccText += " " + oCardBadge.getStateAnnouncementText();
				} else if (oCardBadge.getVisible()) {
					sCardBadgeAccText += " " + _oRb.getText("CARD_BADGE", [oCardBadge.getAccessibilityInfo().description]);
				}
			});

			return sCardBadgeAccText;
		};

		/**
		 * Hides badges if necessary
		 * @returns {void}
		 */
		this._hideBadges = function () {
			this._getCardBadgeCustomData().forEach((oData) => {
				if (oData instanceof BadgeCustomData) {
					oData.setVisible(false);
				} else if (oData instanceof CardBadgeCustomData && oData.getVisibilityMode()  == CardBadgeVisibilityMode.Disappear) {
					oData.setVisible(false);
				}
			});
		};

		this._updateBadgeProperty = function (sId, sPropertyName, sValue) {
				const oCardBadge = this._getCardBadgeElement(sId);
				oCardBadge?.setProperty(sPropertyName, sValue);

			this._getInvisibleCardBadgeText()?.setText(this._getCardBadgeAccessibilityText());

			return this;
		};

		/* =========================================================== */
		/*           begin: functions needed to support BadgeCustomData */
		/* =========================================================== */

		this.updateBadgeVisibility = function (bVisible) {

			this._updateBadgeProperty(this.getBadgeCustomData().getId(), "visible", bVisible);
		};

		this.updateBadgeValue = function(sValue) {

			this._updateBadgeProperty(this.getBadgeCustomData().getId(), "text", sValue);
		};

		this.updateBadgeAnimation = function () {
		};

		this.getBadgeCustomData = function () {
			var oBadgeCustomData = this.getCustomData().filter(function(item) {return item instanceof BadgeCustomData;});
			return oBadgeCustomData.length ? oBadgeCustomData[0] : undefined;
		};

		/* =========================================================== */
		/*           end: functions needed to support BadgeCustomData  */
		/* =========================================================== */

	};

	return CardBadgeEnabler;
});