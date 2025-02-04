/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for a new <code>PreventKeyboardScrolling</code>.
	 *
	 * @class
	 * Prevents the card's content from scrolling with the arrows or tab. Handles where the tab should go when the content is overflowing.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {sap.ui.integration.cards.BaseContent} oContent The card content.
	 * @private
	 * @alias sap.ui.integration.delegate.PreventKeyboardScrolling
	 */
	const PreventKeyboardScrolling = BaseObject.extend("sap.ui.integration.delegate.PreventKeyboardScrolling", {
		constructor: function (oContent) {
			BaseObject.call(this);
			this._oContent = oContent;

			this._cardKeydownBound = this._cardKeydown.bind(this);
			this._scrollBound = this._scroll.bind(this);
		}
	});

	PreventKeyboardScrolling.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		this.detach();
	};

	PreventKeyboardScrolling.prototype.toggle = function (bAttach) {
		if (bAttach) {
			this.attach();
		} else {
			this.detach();
		}
	};

	PreventKeyboardScrolling.prototype.attach = function () {
		const oCardRef = this._oContent.getCardInstance()?.getDomRef();
		const oContentSection = this._getContentSection();

		oCardRef.addEventListener("keydown", this._cardKeydownBound);

		oContentSection.addEventListener("scroll", this._scrollBound);
	};

	PreventKeyboardScrolling.prototype.detach = function () {
		const oCardRef = this._oContent.getCardInstance()?.getDomRef();
		const oContentSection = this._getContentSection();

		oCardRef?.removeEventListener("keydown", this._cardKeydownBound);
		oContentSection?.removeEventListener("scroll", this._scrollBound);
	};

	PreventKeyboardScrolling.prototype._getContentSection = function () {
		const oCard = this._oContent.getCardInstance();

		return oCard?.getDomRef("contentSection");
	};

	PreventKeyboardScrolling.prototype._cardKeydown = function () {
		this._oLastFocusedElement = document.activeElement;
	};

	PreventKeyboardScrolling.prototype._scroll = function () {
		const oContent = this._oContent;
		const oCard = oContent.getCardInstance();
		const oCardRef = oCard.getDomRef();
		const oContentSection = this._getContentSection();

		// prevents the focus to move the scroll
		oContentSection.scrollTop = 0;

		const oFooter = oCard.getCardFooter();
		if (!oFooter || !oFooter.getDomRef()) {
			return;
		}

		// moves the focus to the first button from the footer
		const oFirstItem = oFooter.getFirstFocusableItem();
		if (!oFirstItem) {
			return;
		}

		oFirstItem.focus();

		// shift + tab returns the focus on the previous selected item
		const oFirstItemRef = oFirstItem.getDomRef();
		const fnHandleFocusBack = (oEvent) => {
			// shift + tab
			if (oEvent.shiftKey && oEvent.keyCode == 9) {
				this._oLastFocusedElement?.focus();
				oEvent.preventDefault();

				oFirstItemRef?.removeEventListener("keydown", fnHandleFocusBack);
				oCardRef?.addEventListener("keydown", this._cardKeydownBound);
			}
		};

		oCardRef.removeEventListener("keydown", this._cardKeydownBound);
		oFirstItemRef.addEventListener("keydown", fnHandleFocusBack);
	};

	return PreventKeyboardScrolling;
});