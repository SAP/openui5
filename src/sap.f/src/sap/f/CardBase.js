/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/f/library",
	"sap/m/library",
	"sap/ui/core/InvisibleText",
	"sap/m/BadgeEnabler",
	"sap/f/CardRenderer",
	"sap/ui/core/Lib"
], function (
	Control,
	library,
	mLibrary,
	InvisibleText,
	BadgeEnabler,
	CardRenderer,
	Library
) {
	"use strict";

	var BadgeState = mLibrary.BadgeState;
	var BADGE_AUTOHIDE_TIME = 3000;

	/**
	 * Constructor for a new <code>CardBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A base class for controls that represent a container with a predefined header and content.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.f.CardBase
	 */
	var CardBase = Control.extend("sap.f.CardBase", /** @lends sap.f.Card.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: [
				"sap.f.ICard",
				"sap.m.IBadge"
			],
			properties: {

				/**
				 * Defines the width of the card.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%"},

				/**
				 * Defines the height of the card.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto"}
			},
			aggregations: {}
		},
		renderer: CardRenderer
	});

	BadgeEnabler.call(CardBase.prototype);

	/**
	 * Initialization hook.
	 *
	 *
	 * @private
	 */
	CardBase.prototype.init = function () {
		this._oRb = Library.getResourceBundleFor("sap.f");

		this._ariaContentText = new InvisibleText({id: this.getId() + "-ariaContentText"});
		this._ariaContentText.setText(this._oRb.getText("ARIA_LABEL_CARD_CONTENT"));

		this._ariaText = new InvisibleText({id: this.getId() + "-ariaText"});
		this._ariaText.setText(this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD"));

		this.initBadgeEnablement();
	};

	CardBase.prototype.exit = function () {

		this._oRb = null;

		if (this._ariaContentText) {
			this._ariaContentText.destroy();
			this._ariaContentText = null;
		}

		if (this._ariaText) {
			this._ariaText.destroy();
			this._ariaText = null;
		}
	};

	CardBase.prototype.setAggregation = function (sAggregationName, oObject) {
		var oPrevObject;

		if (sAggregationName === "header" || sAggregationName === "_header") {
			oPrevObject = this.getAggregation(sAggregationName);

			if (oPrevObject) {
				oPrevObject.detachEvent("_change", this._onHeaderVisibilityChange, this);
			}

			if (oObject) {
				oObject.attachEvent("_change", this._onHeaderVisibilityChange, this);
			}
		}

		return Control.prototype.setAggregation.apply(this, arguments);
	};

	CardBase.prototype._onHeaderVisibilityChange = function (oEvent) {
		if (oEvent.getParameters().name === "visible") {
			setTimeout(function() {
				this.invalidate();
			}.bind(this), 0);
		}
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @ui5-restricted
	 * @private
	 * @returns {sap.f.cards.IHeader} The header of the card.
	 */
	CardBase.prototype.getCardHeader = function () {
		return null;
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @ui5-restricted
	 * @private
	 * @returns {sap.f.cards.HeaderPosition} The position of the header of the card.
	 * @since 1.65
	 */
	CardBase.prototype.getCardHeaderPosition = function () {
		return null;
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.core.Control} The content of the card.
	 */
	CardBase.prototype.getCardContent = function () {
		return null;
	};

	/**
	 * Returns the DOM Element that should get the focus.
	 *
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	CardBase.prototype.getFocusDomRef = function () {
		return this.getCardHeader() ? this.getCardHeader().getFocusDomRef() : this.getDomRef();
	};

	CardBase.prototype.onmousedown = function () {
		this._hideBadge();
	};

	CardBase.prototype.onsapenter = function () {
		this._hideBadge();
	};

	CardBase.prototype.onfocusin = function () {
		this._startBadgeHiding();
	};

	CardBase.prototype._startBadgeHiding = function () {
		if (this._iHideBadgeTimeout) {
			return;
		}

		this._iHideBadgeTimeout = setTimeout(this._hideBadge.bind(this), BADGE_AUTOHIDE_TIME);
	};

	CardBase.prototype._hideBadge = function () {

		var oBadgeCustomData = this.getBadgeCustomData();
		if (oBadgeCustomData) {
			oBadgeCustomData.setVisible(false);
		}

		this._iHideBadgeTimeout = null;
	};

	CardBase.prototype.onBadgeUpdate = function (sValue, sState, sBadgeId) {

		var oHeader = this.getCardHeader(),
			oDomRef,
			sAriaLabelledBy;

		if (oHeader) {
			oDomRef = oHeader.getFocusDomRef();
		} else {
			oDomRef = this.getDomRef("contentSection");
		}

		if (!oDomRef) {
			return;
		}

		sAriaLabelledBy = oDomRef.getAttribute("aria-labelledby") || "";

		switch (sState) {
			case BadgeState.Appear:
				sAriaLabelledBy = sBadgeId + " " + sAriaLabelledBy;
				oDomRef.setAttribute("aria-labelledby", sAriaLabelledBy);
				break;
			case BadgeState.Disappear:
				sAriaLabelledBy = sAriaLabelledBy.replace(sBadgeId, "").trim();
				oDomRef.setAttribute("aria-labelledby", sAriaLabelledBy);
				break;
		}
	};

	CardBase.prototype.getAriaLabelBadgeText = function () {
		return this.getBadgeCustomData().getValue();
	};

	/**
	 * Gets the ids of the elements labelling the Card container.
	 *
	 * @return {string} sAriaLabelledBy ids of elements that have to be labelled
	 * @private
	 */
	CardBase.prototype._getAriaLabelledIds = function () {
		var oHeader = this.getCardHeader();
		const sBlockingMessageAriaLabelsIds = this._getBlockingMessageAriaLabelledByIds();

		if (oHeader) {
			if (this._isInsideGridContainer()) {
				if (sBlockingMessageAriaLabelsIds) {
					return oHeader._getAriaLabelledBy() + " " + sBlockingMessageAriaLabelsIds;
				}
				return oHeader._getAriaLabelledBy();
			}

			if (oHeader._getTitle && oHeader._getTitle()) {
				if (sBlockingMessageAriaLabelsIds) {
					return oHeader._getTitle().getId() + " " + sBlockingMessageAriaLabelsIds;
				}
				return oHeader._getTitle().getId();
			}
		}

		return this._ariaText.getId();
	};

	/**
	 * Gets the ids of the elements in the illustrated message that have to be labelled.
	 *
	 * @return {string} sAriaLabelledBy ids of elements that have to be labelled
	 * @private
	 */
	CardBase.prototype._getBlockingMessageAriaLabelledByIds = function () {
		if (!this.getCardContent()?.getAggregation("_blockingMessage")) {
			return "";
		}
		const oIllustration = this.getCardContent().getAggregation("_blockingMessage")._getIllustratedMessage();
		const sTitleId = oIllustration._getTitle().sId;
		const sDescriptionId = oIllustration._getDescription()?.sId;

		if (oIllustration._getDescription().getText()) {
			return sTitleId + " " + sDescriptionId;
		}
		return sTitleId;
	};

	/**
	 * Returns if the control is inside a sap.f.GridContainer
	 *
	 * @private
	 */
	CardBase.prototype._isInsideGridContainer = function() {
		var oParent = this.getParent();
		return oParent && oParent.isA("sap.f.GridContainer");
	};

	/**
	 * @ui5-restricted
	 */
	CardBase.prototype.getAriaRoleDescription = function () {
		var oHeader = this.getCardHeader();

		if (oHeader) {
			return oHeader.getAriaRoleDescription();
		}

		return null;
	};

	return CardBase;
});
