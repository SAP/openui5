/*!
* ${copyright}
*/

// Provides control sap.ui.integration.controls.ImageWithOverlay
sap.ui.define([
	"./ImageWithOverlayRenderer",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/m/Text",
	"sap/ui/core/Control",
	"sap/m/VBox",
	"sap/m/library"
], function (
	ImageWithOverlayRenderer,
	AnimationMode,
	ControlBehavior,
	Text,
	Control,
	VBox,
	mLibrary
) {
	"use strict";


	var FlexJustifyContent = mLibrary.FlexJustifyContent;
	var FlexAlignItems = mLibrary.FlexAlignItems;
	var FlexDirection = mLibrary.FlexDirection;
	var FlexRendertype = mLibrary.FlexRendertype;

	/**
	 * Constructor for a new ImageWithOverlay.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.ImageWithOverlay
	 */
	var ImageWithOverlay = Control.extend("sap.ui.integration.controls.ImageWithOverlay", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Defines the text that will be displayed before the title.
				 */
				supertitle: {type : "string", group: "Misc", defaultValue: "" },
				/**
				 * Defines the title.
				 */
				title: {type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Defines the text that will be displayed after the title.
				 */
				subTitle: {type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Defines vertical position of the texts.
				 */
				verticalPosition: {type: "sap.m.FlexJustifyContent", group: "Appearance", defaultValue: FlexJustifyContent.Start},
				/**
				 * Defines horizontal position of the texts.
				 */
				horizontalPosition: {type: "sap.m.FlexAlignItems", group: "Appearance", defaultValue: FlexAlignItems.Start},
				/**
				 * Defines the color of the text.
				 * Note: If set, the text color would not be themeable (will stay the same as provided with this property and won't change with the theme).
				 * Note: The card developer is responsible for the contrast ratio - right text color and overlay background effect should be set
				 */
				textColor: {type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Defines the CSS filter for the text.
				 * Note: The card developer is responsible for the contrast ratio - right text color and overlay background effect should be set
				 */
				textFilter: {type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Defines the color of the background, which is placed under the texts and over the image.
				 * Note: If set, the text background color would not be themeable (will stay the same as provided with this property and won't change with the theme).
				 * Note: The card developer is responsible for the contrast ratio - right text color and overlay background effect should be set
				 */
				background: {type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Set to <code>MediumStart</code> to have medium size inline padding at the start of the overlay.
				 */
				padding: {type: "string", group: "Misc", defaultValue: "" },
				/*
				 * Defines the animation that should be used to show up the overlay. Possible values are <code>None</code>(default), and <code>FadeIn</code>.
				 * Note: this property will take effect only if <code>animationMode</code> is set to <code>full</code>
				 */
				animation: {type: "string", group: "Misc", defaultValue: "None" }
			},
			aggregations: {
				image: { type: "sap.m.Image", multiple: false },
				_textsLayout: { type: "sap.m.VBox", multiple: false, visibility: "hidden" }
			}
		},

		renderer: ImageWithOverlayRenderer
	});

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	ImageWithOverlay.prototype.onBeforeRendering = function () {
		Control.prototype.onBeforeRendering.apply(this, arguments);
		var sAnimationMode = ControlBehavior.getAnimationMode();

		this._getSupertitleText().setText(this.getSupertitle());
		this._getTitleText().setText(this.getTitle());
		this._getSubTitleText().setText(this.getSubTitle());

		this._getTextsLayout().setJustifyContent(this.getVerticalPosition())
			.setAlignItems(this.getHorizontalPosition());

		if (sAnimationMode === AnimationMode.full && this.getAnimation() === "FadeIn") {
			this.getImage()?.attachLoad(() => {
				this.addStyleClass("sapUiIntImgWithOverlayLoaded");
			});
		} else {
			this.addStyleClass("sapUiIntImgWithOverlayNoAnimation");
		}
	};

	/**
	 * Called after the control is rendered.
	 * @private
	 */
	ImageWithOverlay.prototype.onAfterRendering = function () {
		Control.prototype.onAfterRendering.apply(this, arguments);

		var sTextColor = this.getTextColor(),
			sTextFilter = this.getTextFilter(),
			sBackground = this.getBackground(),
			aOverlayTexts;

		if (sTextColor || sTextFilter) {
			aOverlayTexts = this.getDomRef().getElementsByClassName("sapMText");

			for (let i = 0; i < aOverlayTexts.length; i++) {
				const text = aOverlayTexts[i];
				if (sTextColor) {
					text.style.color = sTextColor;
				}
				if (sTextFilter) {
					text.style.filter = sTextFilter;
				}
			}
		}

		if (sBackground) {
			this.getDomRef().getElementsByClassName("sapUiIntImgWithOverlayLayout")[0].style.background = sBackground;
		}
	};

	ImageWithOverlay.prototype._getSupertitleText = function () {
		if (!this._oSupertitleText) {
			this._oSupertitleText = new Text({
				text: this.getSupertitle()
			});
		}

		return this._oSupertitleText;
	};

	ImageWithOverlay.prototype._getTitleText = function () {
		if (!this._oTitleText) {
			this._oTitleText = new Text({
				text: this.getTitle()
			}).addStyleClass("sapUiIntImgWithOverlayTitle");
		}

		return this._oTitleText;
	};

	ImageWithOverlay.prototype._getSubTitleText = function () {
		if (!this._oSubTitleText) {
			this._oSubTitleText = new Text({
				text: this.getSubTitle()
			});
		}

		return this._oSubTitleText;
	};

	ImageWithOverlay.prototype._getTextsLayout = function () {
		var oTextsLayout = this.getAggregation("_textsLayout");
		if (!oTextsLayout) {
			oTextsLayout = new VBox({
				direction: FlexDirection.Column,
				renderType: FlexRendertype.Bare,
				justifyContent: this.getVerticalPosition(),
				alignItems: this.getHorizontalPosition(),
				items: [
					this._getSupertitleText(),
					this._getTitleText(),
					this._getSubTitleText()
				]
			}).addStyleClass("sapUiIntImgWithOverlayLayout");

			this.setAggregation("_textsLayout", oTextsLayout);
		}

		return oTextsLayout;
	};

	return ImageWithOverlay;
});