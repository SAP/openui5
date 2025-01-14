/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/integration/delegate/PreventKeyboardScrolling"
], function (
	BaseObject,
	PreventKeyboardScrolling
) {
	"use strict";

	/**
	 * Constructor for a new <code>OverflowHandler</code>.
	 *
	 * @class
	 * Handles the card's and its content's overflowing. Determines the need for a "Show More" button and overlay gradient.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {sap.ui.integration.cards.BaseContent} oContent The card content.
	 * @private
	 * @alias sap.ui.integration.delegate.OverflowHandler
	 */
	const OverflowHandler = BaseObject.extend("sap.ui.integration.delegate.OverflowHandler", {
		constructor: function (oContent) {
			BaseObject.call(this);
			this._oContent = oContent;
			this._bIsOverflowing = false;

			this._oDelegate = {
				onAfterRendering: this._onAfterRendering.bind(this)
			};
		}
	});

	OverflowHandler.prototype.attach = function () {
		this._oContent.addEventDelegate(this._oDelegate);
	};

	OverflowHandler.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		if (this._oPreventKeyboardScrolling) {
			this._oPreventKeyboardScrolling.destroy();
			this._oPreventKeyboardScrolling = null;
		}

		if (this._oHeightObserver) {
			this._oHeightObserver.disconnect();
			this._oHeightObserver = null;
		}

		this._oContent.removeEventDelegate(this._oDelegate);
	};

	OverflowHandler.prototype._onAfterRendering = function () {
		const oContentSection = this._getContentSection();
		const oInnerContent = this._getInnerContent();
		if (!oContentSection || !oInnerContent) {
			// not fully rendered yet
			return;
		}

		if (this._oHeightObserver) {
			this._oHeightObserver.disconnect();
		}

		this._oHeightObserver = new ResizeObserver(() => {
			this._resize();
		});
		this._oHeightObserver.observe(oContentSection);
		this._oHeightObserver.observe(oInnerContent);
	};

	OverflowHandler.prototype._resize = function () {
		const bIsOverflowing = this._isOverflowing();

		if (bIsOverflowing === this._bIsOverflowing) {
			return;
		}

		this._bIsOverflowing = bIsOverflowing;

		const oCard = this._oContent.getCardInstance();

		oCard.getCardFooter().setShowMoreButton(bIsOverflowing);
		oCard.toggleStyleClass("sapUiIntCardIsOverflowing", bIsOverflowing);

		if (bIsOverflowing && !this._oPreventKeyboardScrolling) {
			this._oPreventKeyboardScrolling = new PreventKeyboardScrolling(this._oContent);
		}

		// @todo replace this with individual hiding of all elements which are not visible
		this._oPreventKeyboardScrolling?.toggle(bIsOverflowing);
	};

	OverflowHandler.prototype._getContentSection = function () {
		const oCard = this._oContent.getCardInstance();

		return oCard?.getDomRef("contentSection");
	};

	OverflowHandler.prototype._getInnerContent = function () {
		const oContent = this._oContent;

		let oInnerContent = oContent.getAggregation("_content")?.getDomRef();

		if (!oInnerContent) {
			// some contents do not have _content aggregation, so we use the first child
			oInnerContent = oContent.getDomRef()?.firstChild;
		}

		return oInnerContent;
	};

	OverflowHandler.prototype._isOverflowing = function () {
		const iHeight = this._getContentSection()?.getBoundingClientRect().height;
		const iHeightInner = this._getInnerContent()?.getBoundingClientRect().height;

		return iHeightInner > iHeight;
	};

	return OverflowHandler;
});