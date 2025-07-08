/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarTokenizer
sap.ui.define([
		'sap/m/Tokenizer',
		'sap/m/OverflowToolbarTokenizerRenderer',
		'sap/m/Button',
		'sap/m/Label',
		'sap/ui/core/IconPool',
		'./library',
		'sap/ui/core/library'
	],
	function(
		Tokenizer,
		OverflowToolbarTokenizerRenderer,
		Button,
		Label,
		IconPool,
		library,
		coreLibrary
	) {
	"use strict";

	const RenderMode = library.OverflowToolbarTokenizerRenderMode;
	const PlacementType = library.PlacementType;
	const ButtonAccessibleRole = library.ButtonAccessibleRole;
	const AriaHasPopup = coreLibrary.aria.HasPopup;

	const CSS_CLASS_OVERFLOWTOOLBAR_TOKENIZER_POPUP = "sapMOverflowToolbarTokenizerTokensPopup";

	/**
	 * Constructor for a new <code>OverflowToolbarTokenizer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents an {@link sap.m.Button} that shows its text only when in the overflow area of an {@link sap.m.OverflowToolbar}.
	 *
	 * <b>Note:</b> This control is intended to be used exclusively in the context of <code>sap.m.Toolbar</code> and <code>sap.m.OverflowToolbar</code>.
	 * Using more than one tokenizer in the same toolbar is not recomended, as it may lead to unexpected behavior.
	 * Do not use tokenizers within a toolbar if its active property is set to <code>true</code>.
	 * @extends sap.m.Button
	 *
	 * @implements sap.m.IOverflowToolbarContent
	 * @implements sap.m.IToolbarInteractiveControl
	 * @implements sap.m.IOverflowToolbarFlexibleContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental since 1.139
	 * @since 1.139
	 * @alias sap.m.OverflowToolbarTokenizer
	 */
	const OverflowToolbarTokenizer = Tokenizer.extend("sap.m.OverflowToolbarTokenizer", /** @lends sap.m.OverflowToolbarTokenizer.prototype */ {
		metadata: {
			library : "sap.m",

			properties : {

				/**
				 * Property for the text of a sap.m.Label displayed with sap.m.OverflowToolbarTokenizer. It is also displayed as an n-More button text when used inside a <code>sap.m.OverflowToolbar</code>.
				 */
				labelText : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the mode that the OverflowToolbarTokenizer will use:
				 * <ul>
				 * <li><code>sap.m.OverflowToolbarTokenizerRenderMode.Loose</code> mode shows all tokens, no matter the width of the Tokenizer</li>
				 * <li><code>sap.m.OverflowToolbarTokenizerRenderMode.Narrow</code> mode restricts the tokenizer to display only the maximum number of tokens that fit within its width, adding an n-More indicator for the remaining tokens</li>
				 * <li><code>sap.m.OverflowToolbarTokenizerRenderMode.Overflow</code> mode forces the tokenizer to show only <code>sap.m.Button</code> as an n-More indicator without visible tokens. It is used when <code>sap.m.OverflowToolbarTokenizer</code> is within the <code>sap.m.OverflowToolbar</code> overflow area</li>

				 * </ul>
				 *
				 * <b>Note</b>: Have in mind that the <code>renderMode</code> property is used internally by the OverflowToolbarTokenizer and controls that use the OverflowToolbarTokenizer. Therefore, modifying this property may alter the expected behavior of the control.
				 */
				renderMode: {type : "string", group : "Misc", defaultValue : RenderMode.Narrow}
			},
			interfaces: [
				"sap.m.IOverflowToolbarContent",
				"sap.m.IToolbarInteractiveControl",
				"sap.m.IOverflowToolbarFlexibleContent"
			],
			aggregations: {

				/**
				 * The n-More button showed in the bar's overflow area which opens the tokens popup
				 */
				moreItemsButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				/**
				 * Label for <code>sap.m.Tokenizer</code>. It is also displayed as an n-More button text when used inside a <code>sap.m.OverflowToolbar</code>.
				 */
				label : {type : "sap.m.Label", multiple : false, visibility : "hidden"}

			}
		},
		renderer: OverflowToolbarTokenizerRenderer
	});

	IconPool.insertFontFaceStyle();

	OverflowToolbarTokenizer.prototype.onBeforeRendering = function() {
		const sLabelText = this.getLabelText();
		const sLabelAggregationText = this.getAggregation("label")?.getText();
		const sMoreItemsButtonText = this.getAggregation("moreItemsButton")?.getText();

		Tokenizer.prototype.onBeforeRendering.call(this);

		if (sLabelText !== sLabelAggregationText) {
			this._updateLabel();
		}

		if (sLabelText !== sMoreItemsButtonText) {
			this._updateButton();
		}

		// Store initial width props to restore them to reset them if the control is
		// re-rendered from the overflow area to the the visible area of the toolbar
		if (this.getRenderMode() !== RenderMode.Overflow) {
			this._sOriginalWidth = this.getWidth();
			this._originalMaxWidth = this.getMaxWidth();
		}
	};

	/**
	 * Creates and updates an instance of <code>sap.m.Button</code> for the n-More indicator in the overflow area of <code>sap.m.OverflowToolbar</code>.
	 *
	 * @private
	 */
	OverflowToolbarTokenizer.prototype._updateButton = function () {
		const sLabelText = this.getLabelText();
		const oNMoreButton = this.getAggregation("moreItemsButton");

		if (!oNMoreButton) {
			this.setAggregation("moreItemsButton", new Button({
				text: sLabelText,
				accessibleRole:  ButtonAccessibleRole.Link,
				ariaHasPopup: AriaHasPopup.Dialog,
				width: "100%",
				icon: IconPool.getIconURI("slim-arrow-left"),
				press: this._handleNMoreIndicatorPress.bind(this)
			}).addStyleClass("sapMTokenizerIndicator sapMBarChild"));

			return;
		}

		oNMoreButton.setText(sLabelText);
	};

	/**
	 * Creates, removes and updates an instance of <code>sap.m.Label</code> for <code>sap.m.OverflowToolbarTokenizer</code> depending on whether the <code>labelText</code> property is set, removed or updated.
	 *
	 * @private
	 */
	OverflowToolbarTokenizer.prototype._updateLabel = function () {
		const sLabelText = this.getLabelText();

		if (!sLabelText) {
			this.removeAllAggregation("label");
			return;
		}

		if (!this.getAggregation("label")) {
			this.setAggregation(
				"label",
				new Label({
					text : sLabelText,
					tooltip: sLabelText
				})
			);
			return;
		}

		this.getAggregation("label").setText(sLabelText);
		this.getAggregation("label").setTooltip(sLabelText);
	};

	OverflowToolbarTokenizer.prototype._useCollapsedMode = function () {
		if (this.getRenderMode() === RenderMode.Overflow) {
			this._getVisibleTokens().forEach((oToken) => oToken.addStyleClass("sapMHiddenToken"));
			return;
		}

		Tokenizer.prototype._useCollapsedMode.call(this, this.getRenderMode());
	};

	/**
	 * Sets the mode of the tokenizer to 'Overflow' (collapsed) when the tokenizer is inside the overflow area or 'Narrow' when it is not overflown.
	 * @param {boolean} bOverflowMode true if the tokenizer should be displayed as a button in the overflow popup of the sap.m.OverflowToolbar
	 * @returns {this} this instance for method chaining
	 */
	OverflowToolbarTokenizer.prototype.setOverflowMode = function(bOverflowMode) {
		const oLabelText = this.getLabelText();
		const oMoreItemsButton = this.getAggregation("moreItemsButton");

		this.setRenderMode(bOverflowMode ? RenderMode.Overflow : RenderMode.Narrow);

		if (bOverflowMode) {
			oMoreItemsButton?.setText(oLabelText || this._oIndicator.html());

			this.setWidth(`auto`);
			this.setMaxWidth(`auto`);

			return this;
		}

		this._adjustTokensVisibility();
		this.setWidth(this._sOriginalWidth);
		this.setMaxWidth(this._originalMaxWidth);

		return this;
	};

	OverflowToolbarTokenizer.prototype._setPopoverMode = function () {
		const oPopup = Tokenizer.prototype.getTokensPopup.call(this);

		if (this.getRenderMode() !== RenderMode.Overflow) {
			oPopup.setPlacement(PlacementType.VerticalPreferredBottom);
			oPopup.setShowArrow(true);

			return;
		}

		oPopup.setShowArrow(false);
		oPopup.setPlacement(PlacementType.HorizontalPreferredRight);
		oPopup.setOffsetX(-10); // Avoid the Tokenizer popover ovarlap with the OverflowToolbar popover

		return;
	};

	OverflowToolbarTokenizer.prototype.addPopupClasses = function(oPopup) {
		Tokenizer.prototype.addPopupClasses.call(this, oPopup);
		oPopup.addStyleClass(CSS_CLASS_OVERFLOWTOOLBAR_TOKENIZER_POPUP);
	};

	OverflowToolbarTokenizer.prototype._getLabelWidth = function() {
		return this.getAggregation("label")?.getDomRef()?.offsetWidth || 0;
	};

	OverflowToolbarTokenizer.prototype.getFocusDomRef = function ()  {
		return this.getDomRef("inner");
	};

	OverflowToolbarTokenizer.prototype.onfocusin = function (oEvent) {
		if (this.getRenderMode() === RenderMode.Overflow) {
			return;
		}

		Tokenizer.prototype.onfocusin.call(this, oEvent);
	};

	/**
	 * Renders the n-More label.
	 * @private
	 *
	 * @param {number} iHiddenTokensCount The number of hidden tokens
	 */
	OverflowToolbarTokenizer.prototype._handleNMoreIndicator = function (iHiddenTokensCount) {
		const oLabelText = this.getLabelText();

		if (this.getRenderMode() !== RenderMode.Overflow) {
			Tokenizer.prototype._handleNMoreIndicator.call(this, iHiddenTokensCount);
		}

		if (this.getRenderMode() === RenderMode.Overflow && oLabelText) {
			this.getAggregation("moreItemsButton").setText(oLabelText);
		}
	};

	OverflowToolbarTokenizer.prototype._handleTokenizerAfterOpen = function (oEvent) {
		if (this.getRenderMode() === RenderMode.Overflow) {
			return;
		}

		Tokenizer.prototype._handleTokenizerAfterOpen.call(this, oEvent);
	};

	OverflowToolbarTokenizer.prototype.getOverflowToolbarConfig = function() {
		const oConfig = {
			canOverflow: true,
			propsUnrelatedToSize: ["hiddenTokensCount"],
			onBeforeEnterOverflow: function(oTokenizer) {
				oTokenizer.setOverflowMode(true);
			},
			onAfterExitOverflow: function(oTokenizer) {
				oTokenizer.setOverflowMode(false);
			}
		};

		return oConfig;
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	OverflowToolbarTokenizer.prototype._getToolbarInteractive = function () {
		return true;
	};

	return OverflowToolbarTokenizer;
});

