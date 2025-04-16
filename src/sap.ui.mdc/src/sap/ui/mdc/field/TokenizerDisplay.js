/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Tokenizer',
	'sap/ui/mdc/field/TokenizerDisplayRenderer',
	'sap/ui/events/KeyCodes',
	'sap/m/library'
], (
	Tokenizer,
	TokenizerDisplayRenderer,
	KeyCodes,
	mLibrary
) => {
	"use strict";

	const { EmptyIndicatorMode, TokenizerRenderMode } = mLibrary;

	/**
	 * Constructor for a new <code>TokenizerDisplay</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>TokenizerDisplay</code> control is used to render a Tokenizer inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * It enhances the {@link sap.m.Tokenizer Tokenizer} control to support display only tokens.
	 * @extends sap.m.Tokenizer
	 * @implements sap.ui.core.ILabelable
	 * @version ${version}
	 * @constructor
	 * @abstract
	 *
	 * @borrows sap.ui.core.ILabelable.hasLabelableHTMLElement as #hasLabelableHTMLElement
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.99.0
	 * @alias sap.ui.mdc.field.TokenizerDisplay
	 */
	const TokenizerDisplay = Tokenizer.extend("sap.ui.mdc.field.TokenizerDisplay", /** @lends sap.ui.mdc.field.TokenizerDisplay.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: ["sap.ui.core.ILabelable"],
			properties: {

				/**
				 * Specifies if an empty indicator should be displayed when there is no token.
				 */
				emptyIndicatorMode: { type: "sap.m.EmptyIndicatorMode", group: "Appearance", defaultValue: EmptyIndicatorMode.Off }

			}
		},
		renderer: TokenizerDisplayRenderer
	});

	TokenizerDisplay.prototype.init = function() {
		Tokenizer.prototype.init.apply(this, arguments);

		this.setShouldRenderTabIndex(false);
		this.allowTextSelection(true);
		this.addStyleClass("sapUiMdcTokenizerDisplay");
	};

	TokenizerDisplay.prototype.onkeydown = function(oEvent) {
		Tokenizer.prototype.onkeydown.call(this, oEvent);

		if (!this.getEnabled()) {
			return;
		}

		if (oEvent.which === KeyCodes.ENTER) {
			if (this.getHiddenTokensCount() > 0) {
				this._handleNMoreIndicatorPress();
			}
		}

	};

	// ignore touch and tab events for displayed tokens to enable standard event handling if inside of Table
	TokenizerDisplay.prototype.ontouchstart = function(oEvent) {

		if (!this.hasOneTruncatedToken() && !oEvent.target.classList.contains("sapMTokenizerIndicator")) {
			return; // if no truncated token, do nothing
		}

		Tokenizer.prototype.ontouchstart.apply(this, arguments);

	};

	TokenizerDisplay.prototype.ontap = function(oEvent) {
		const oTargetToken = oEvent.getMark("tokenTap");

		if (oTargetToken && !this.hasOneTruncatedToken()) {
			return; // on click on token do nothing (on truncated token popover should open)
		}

		if (oEvent.target.classList.contains("sapMTokenizerIndicator")) {
			oEvent.setMark("tokenizerMoreIndicatorTap");
		}

		Tokenizer.prototype.ontap.apply(this, arguments);

	};

	TokenizerDisplay.prototype.onfocusin = function (oEvent) {
		// don't hide more-indicator
	};

	TokenizerDisplay.prototype.getTokensPopup = function () {
		const bInit = !this._oPopup;
		const oPopover = Tokenizer.prototype.getTokensPopup.apply(this, arguments);

		if (bInit) {
			const fnAfterOpen = (oEvent) => {
				this.setRenderMode(TokenizerRenderMode.Narrow); // prevent hiding of more indicator
				this.fireRenderModeChange({
					renderMode: TokenizerRenderMode.Narrow
				});
			};

			oPopover.attachAfterOpen(fnAfterOpen, this);
		}

		return oPopover;
	};

	TokenizerDisplay.prototype.afterPopupClose = function () {
		if (this.checkFocus()) {
			this._oIndicator.focus(); // restore focus on Idicator
		}
	};

	TokenizerDisplay.prototype.getFocusDomRef = function () {
		if (this.getHiddenTokensCount() === 0 || !this._oIndicator) {
			return Tokenizer.prototype.getFocusDomRef.apply(this, arguments);
		} else {
			return this._oIndicator[0];
		}
	};

	TokenizerDisplay.prototype.getAccessibilityInfo = function() {
		// just concatenate token texts and return it as description
		const sText = this.getTokens().map((oToken) => {
			return oToken.getText();
		}).join(" ");

		return { description: sText };
	};

	/**
	 * Returns if the control can be bound to a label
	 *
	 * @returns {boolean} <code>true</code> if the control can be bound to a label
	 * @public
	 * @since 1.121.0
	 */
	TokenizerDisplay.prototype.hasLabelableHTMLElement = function() {
		return false; // renders only SPANs -> cannot be labeled
	};

	return TokenizerDisplay;

});