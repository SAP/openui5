/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/InvisibleText",
	"sap/f/CardRenderer",
	"sap/ui/core/Lib",
	"sap/f/cards/util/CardBadgeEnabler",
	"sap/f/library",
	"sap/base/Log",
	"sap/ui/events/KeyCodes"
], function (
	Control,
	InvisibleText,
	CardRenderer,
	Library,
	CardBadgeEnabler,
	library,
	Log,
	KeyCodes
) {
	"use strict";

	var BADGE_AUTOHIDE_TIME = 3000,
		SemanticRole = library.cards.SemanticRole;

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
				"sap.m.IBadge",
				"sap.f.IGridContainerItem"
			],
			properties: {

				/**
				 * Defines the width of the card.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%"},

				/**
				 * Defines the height of the card.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto"},

				/**
				 * Defines the accessibility role of the control.
				 *
				 * **Note:** When the control is placed inside a <code>sap.f.GridContainer</code>,
				 * its accessibility role is overridden by the accessibility role specified by the <code>sap.f.GridContainer</code>.
				 *
				 * @experimental since 1.131
				 */
				semanticRole: { type: "sap.f.cards.SemanticRole", defaultValue: SemanticRole.Region}
			},
			aggregations: {

				/**
				 * Defines the internally used <code>sap.m.ObjectStatus</code>.
				 */
				_cardBadges: {
					type: "sap.m.ObjectStatus",
					multiple: true,
					visibility: "hidden"
				},

				/**
				 * Holds the text used for announcing the card badges to the screen reader.
				 */
				_oInvisibleCardBadgeText: {
					type: "sap.ui.core.InvisibleText",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * Fired when action is added on card level.
				 *
				 * **Note**: Can be used only if <code>semanticRole</code> is <code>sap.f.cards.SemanticRole.ListItem</code>
				 * or the control is placed inside a <code>sap.f.GridContainer</code>.
				 * @experimental since 1.131
				 */
				press: {}
			}
		},
		renderer: CardRenderer
	});

	CardBadgeEnabler.call(CardBase.prototype);

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

		this._describedByInteractiveText = new InvisibleText({ id: this.getId() + "-describedByInteractive" });
		this._describedByInteractiveText.setText(this._oRb.getText("ARIA_ACTIVATE_CARD"));

		this._describedByCardTypeText = new InvisibleText({ id: this.getId() + "-describedByCardTypeText"});
		this._describedByCardTypeText.setText(this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD"));

		this._sGridItemRole = null;

		this.initCardBadgeEnablement();
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

		this._describedByInteractiveText.destroy();
		this._describedByInteractiveText = null;

		this._describedByCardTypeText.destroy();
		this._describedByCardTypeText = null;

		if (this._invisibleTitle) {
			this._invisibleTitle.destroy();
			this._invisibleTitle = null;
		}

		this.destroyCardBadgeEnablement();
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
		if (this.isRoleListItem()) {
			return this.getDomRef();
		}

		return this.getCardHeader() ? this.getCardHeader().getFocusDomRef() : this.getDomRef();
	};

	/**
	 * @private
	 * @returns {sap.f.cards.IHeader} The header of the card.
	 */
	CardBase.prototype._getHeaderAggregation = function () {
		return this.getCardHeader();
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
		const oCardBadgeCustomData = this._getCardBadgeCustomData();

		if (oCardBadgeCustomData?.length > 0) {
			this._hideBadges();
		}

		this._iHideBadgeTimeout = null;
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
		if (oHeader && oHeader.getVisible()) {
			if (oHeader._getTitle && oHeader._getTitle()) {
				if (sBlockingMessageAriaLabelsIds) {
					return oHeader._getTitle().getId() + " " + sBlockingMessageAriaLabelsIds;
				}
				return oHeader._getTitle().getId();
			}
		} else if (oHeader?.getTitle()) {
			if (!this._invisibleTitle) {
				this._invisibleTitle = new InvisibleText({ id: this.getId() + "-invisibleTitle" });
			}
			this._invisibleTitle.setText(oHeader.getTitle());

			return this._invisibleTitle.getId();
		}

		return this._ariaText.getId();
	};

	CardBase.prototype._getAriaDescribedByIds = function () {
		const bHasCardBadgeCustomData = this._getCardBadgeCustomData().length > 0;
		const aIds = [];

		aIds.push(this._describedByCardTypeText.getId());

		if (this.isInteractive() && this.isRoleListItem()) {
			aIds.push(this._describedByInteractiveText.getId());
		}

		if (bHasCardBadgeCustomData) {
			aIds.push(this._getInvisibleCardBadgeText().getId());
		}

		return aIds.join(" ");
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

	CardBase.prototype.onkeydown = function (oEvent) {

		if ((oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT)
			&& !oEvent.ctrlKey && !oEvent.metaKey) {

			if (oEvent.which === KeyCodes.ENTER) {
				this._handleTap(oEvent);
			}

			if (oEvent.which === KeyCodes.SPACE) {
				// To prevent the browser scrolling.
				oEvent.preventDefault();
			}

			if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
				this._bPressedEscapeOrShift = true;
			}
		}

	};

	CardBase.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift) {
				this._handleTap(oEvent);
			}
		}

		if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			this._bPressedEscapeOrShift = false;
		}
	};

	/**
	 * Listens for ontap event
	 *
	 * @param {object} oEvent event
	 */
	CardBase.prototype.ontap = function (oEvent) {
		if (this.isMouseInteractionDisabled()) {
			return;
		}
		this._handleTap(oEvent);
	};


	/**
	 * Handles interaction logic
	 *
	 * @param {object} oEvent event
	 */
	CardBase.prototype._handleTap = function (oEvent) {
		if (!this.isInteractive() ||
			oEvent.isMarked() ||
			!this.isRoleListItem()) {
			return;
		}

		if (this.getFocusDomRef()?.matches(":has(:focus-within)")) {
			return;
		}

		this.firePress({
			originalEvent: oEvent
		});

		oEvent.preventDefault();
		oEvent.stopPropagation();
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

	/**
	 * Checks if the card is interactive.
	 * @private
	 * @ui5-restricted sap.f.CardRenderer
	 * @returns {boolean} Whether the card is interactive.
	 */
	CardBase.prototype.isInteractive = function() {
		const bIsInteractive = this.hasListeners("press");

		if (bIsInteractive && !this.isRoleListItem()) {
			Log.error("The full card cannot be interactive if the 'semanticRole' is not 'ListItem' or the control is not placed inside a sap.f.GridContainer", this);
		}
		return bIsInteractive;
	};

	/**
	 * Checks if the card should be fully interactive with the mouse.
	 * @private
	 * @ui5-restricted sap.f.CardRenderer
	 * @returns {boolean} False if the card should not be fully interactive with the mouse.
	 */
	CardBase.prototype.isMouseInteractionDisabled = function() {
		return false;
	};

	/**
	 * Sets the accessibility role for the <code>sap.f.GridContainer</code> item.
	 *
	 * **Note:** This method is automatically called by the <code>sap.f.GridContainer</code> control.
	 *
	 * @param {string} sRole The accessibility role for the <code>sap.f.GridContainer</code> item
	 * @private
	 * @ui5-restricted sap.f.GridContainer
	 *
	 */
	CardBase.prototype.setGridItemRole = function (sRole) {
		this._sGridItemRole = sRole;
	};

	/**
	 * Returns the accessibility role for the <code>sap.f.GridContainer</code> item.
	 *
	 * @returns {string} The accessibility role for the <code>sap.f.GridContainer</code> item
	 * @public
	 */
	CardBase.prototype.getGridItemRole = function () {
		return this._sGridItemRole;
	};

	CardBase.prototype.isRoleListItem = function () {
		return (this.getSemanticRole() === SemanticRole.ListItem) || this.getGridItemRole();
	};

	return CardBase;
});
