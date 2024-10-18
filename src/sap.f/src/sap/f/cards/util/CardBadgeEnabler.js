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
	"sap/f/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/base/Log"
],
function(CardBadgeCustomData, BadgeCustomData, ObjectStatus, InvisibleText, Lib, coreLibrary, library, ManagedObjectObserver, Log) {
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

		/**
		 * Initializes the card badge enablement.
		 * Attaching the customData observer.
		 */
		this.initCardBadgeEnablement = function () {
			this._customDataObserver = new ManagedObjectObserver(this._onCustomDataChange.bind(this));
			this._customDataObserver.observe(this, {aggregations: ["customData"]});

			// Following is a temporary workaround covering problem with the old code in Work Zone. Can be deleted after they upgrade to UI5 1.130.
			this._aCardBadges = ["temporary"];
		};

		/**
		 * Destroys the card badge enablement.
		 */
		this.destroyCardBadgeEnablement = function () {
			if (this._customDataObserver) {
				this._customDataObserver.disconnect();
				this._customDataObserver = null;
			}
		};

		this._createBadge = function (oData) {
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

			const iIndex = this._getCardBadgeCustomData()?.indexOf(oData);
			this.insertAggregation("_cardBadges", oCardBadge, iIndex);
		};

		this._onCustomDataChange = function (oChanges) {
			const sMutation = oChanges.mutation,
				oCustomData = oChanges.child;

			if (!this._isBadgeCustomData(oCustomData)) {
				return;
			}

			switch (sMutation) {
				case "insert":
					this._createBadge(oCustomData);
					break;
				case "remove": {
					const oCardBadge = this._getCardBadgeElement(oCustomData.getId());
					if (oCardBadge) {
						this.removeAggregation("_cardBadges", oCardBadge);
						oCardBadge.destroy();
					}
					break;
				}
				default:
					Log.error(`Mutation ${sMutation} is unexpected for card badge custom data.`, this);
					break;
			}

			this._updateInvisibleCardBadgeText();
		};

		/**
		 * Returns all CardBadgeCustomData elements from customdata, or just an element corresponding to the key
		 * @returns {Array} aCardBadgeCustomData
		 */
		this._getCardBadgeCustomData  = function () {
			const aCardBadgeCustomData = this.getCustomData().filter(function(item) {
				return this._isBadgeCustomData(item);
			}.bind(this));

			return aCardBadgeCustomData;
		};

		/**
		 * Returns badges added to the aggregation of card "_cardBadges"
		 * @returns {Array} Cards _cardBadges aggregation
		 */
		this._getCardBadges  = function () {
			return this.getAggregation("_cardBadges");
		};

		/**
		 * Gets badge corresponding to the <code>sap.f.cards.CardBadgeCustomData</code>
		 * @param {string} sId ID of the <code>sap.f.cards.CardBadgeCustomData</code>
		 * @returns {sap.m.ObjectStatus} oCardBadge
		 */
		this._getCardBadgeElement =  function (sId) {
			const oCardBadge = this._getCardBadges()?.find((oElement) => oElement.getId().endsWith("badge" + sId));

			return oCardBadge;
		};

		/**
		 * Creates invisibleText, which contains the card badge accessibility information
		 * @returns {sap.ui.core.InvisibleText} The invisible text control for badges.
		 */
		this._getInvisibleCardBadgeText = function () {
			let oText = this.getAggregation("_oInvisibleCardBadgeText");

			if (oText) {
				return oText;
			}

			oText = new InvisibleText({id: this.getId() + "-ariaBadgeText", text: this._getCardBadgeAccessibilityText()});

			this.setAggregation("_oInvisibleCardBadgeText", oText);

			return oText;
		};

		/**
		 * Updates the text of the invisible card badge text.
		 */
		this._updateInvisibleCardBadgeText = function () {
			this._getInvisibleCardBadgeText()?.setText(this._getCardBadgeAccessibilityText());
		};

		/**
		 * Gets accessibility text for badge
		 * @returns {string} sCardBadgeAccText
		 */
		this._getCardBadgeAccessibilityText = function () {
			const _oRb = Lib.getResourceBundleFor("sap.f");

			let sCardBadgeAccText = "";
			this._getCardBadges()?.forEach((oCardBadge) => {
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
				} else if (oData instanceof CardBadgeCustomData && oData.getVisibilityMode() === CardBadgeVisibilityMode.Disappear) {
					oData.setVisible(false);
				}
			});
		};

		this._updateBadgeProperty = function (sId, sPropertyName, sValue) {
			const oCardBadge = this._getCardBadgeElement(sId);
			oCardBadge?.setProperty(sPropertyName, sValue);

			this._updateInvisibleCardBadgeText();

			return this;
		};

		this._isBadgeCustomData = function (oData) {
			return oData instanceof CardBadgeCustomData || oData instanceof BadgeCustomData;
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