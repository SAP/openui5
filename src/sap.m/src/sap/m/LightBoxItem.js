/*!
 * ${copyright}
 */

// Provides control sap.m.LightBoxItem
sap.ui.define([
	"./library",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/m/Image",
	"sap/m/Title",
	"sap/m/Label"
], function (
	library,
	coreLibrary,
	Element,
	Image,
	Title,
	Label
) {
	"use strict";

	// shortcut for sap.m.LightBoxLoadingStates
	var LightBoxLoadingStates = library.LightBoxLoadingStates;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new LightBoxItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents an item which is displayed within an sap.m.LightBox. This item holds all properties of the image as
	 * well as the title and subtitle.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42
	 * @alias sap.m.LightBoxItem
	 */
	var LightBoxItem = Element.extend("sap.m.LightBoxItem", /** @lends sap.m.LightBoxItem.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Source for the image. This property is mandatory. If not set the popup will not open.
				 */
				imageSrc: { type: "sap.ui.core.URI", group: "Appearance", multiple: false, defaultValue: "" },

				/**
				 * Alt value for the image.
				 */
				alt: { type: "string", group: "Appearance", multiple: false, defaultValue: "" },

				/**
				 * Title text for the image. This property is mandatory.
				 */
				title: { type: "string", group: "Appearance", multiple: false, defaultValue: "" },

				/**
				 * Subtitle text for the image.
				 */
				subtitle: { type: "string", group: "Appearance", multiple: false, defaultValue: "" }
			},

			aggregations: {
				/**
				 * The image aggregation inside the LightBoxItem control.
				 * @private
				 */
				_image: { type: "sap.m.Image", multiple: false, visibility: "hidden" },

				/**
				 * The title aggregation inside the LightBoxItem control.
				 * @private
				 */
				_title: { type: "sap.m.Title", multiple: false, visibility: "hidden" },

				/**
				 * The subtitle aggregation inside the LightBoxItem control.
				 * @private
				 */
				_subtitle: { type: "sap.m.Label", multiple: false, visibility: "hidden" }
			}
		}
	});

	LightBoxItem.prototype.init = function () {
		this._createNativeImage();

		this.setAggregation("_image", new Image({
			decorative: false,
			densityAware: false
		}), true);

		this.setAggregation("_title", new Title({
			level: TitleLevel.H2,
			wrapping: false
		}), true);

		this.setAggregation("_subtitle", new Label({
			wrapping: false
		}), true);
	};

	/**
	 * Creates a native JavaScript Image object.
	 * @private
	 */
	LightBoxItem.prototype._createNativeImage = function () {
		var that = this;

		this._sImageState = LightBoxLoadingStates.Loading;
		this._oImage = new window.Image();
		this._oImage.onload = function () {
			if (this.complete && that._sImageState === LightBoxLoadingStates.Loading) {
				that._setImageState(LightBoxLoadingStates.Loaded);
			}
		};

		this._oImage.onerror = function () {
			that._setImageState(LightBoxLoadingStates.Error);
		};
	};

	LightBoxItem.prototype.exit = function () {
		this._oImage = null;
	};

	/**
	 * Sets the state of the image. Possible values are "LOADING", "LOADED" and "ERROR"
	 * @private
	 * @param {sap.m.LightBoxLoadingStates} sImageState Current image state
	 */
	LightBoxItem.prototype._setImageState = function (sImageState) {
		if (sImageState !== this._sImageState) {
			this._sImageState = sImageState;
			if (this.getParent()) {
				this.getParent()._imageStateChanged(sImageState);
			}
		}
	};

	/**
	 * Returns the state of the image.
	 * @private
	 * @returns {string} State of the image
	 */
	LightBoxItem.prototype._getImageState = function () {
		return this._sImageState;
	};

	/**
	 * Returns the native JavaScript Image object.
	 * @private
	 * @method
	 * @returns {window.Image} The native window.Image object
	 */
	LightBoxItem.prototype._getNativeImage = function () {
		return this._oImage;
	};

	/**
	 * Sets the source of the image.
	 * @public
	 * @param {sap.ui.core.URI} sImageSrc The image URI
	 * @returns {this} Pointer to the control instance for chaining.
	 */
	LightBoxItem.prototype.setImageSrc = function (sImageSrc) {
		var oImage = this.getAggregation("_image"),
			oLightBox = this.getParent();

		if (this.getImageSrc() === sImageSrc) {
			return this;
		}

		this._sImageState = LightBoxLoadingStates.Loading;

		if (oLightBox && oLightBox._oPopup.getOpenState() === OpenState.OPEN) {
			this._oImage.src = sImageSrc;
		}

		this.setProperty("imageSrc", sImageSrc, false);
		oImage.setSrc(sImageSrc);

		return this;
	};

	/**
	 * Sets the alt text of the image.
	 * @public
	 * @param {string} alt The alt text
	 * @method
	 * @returns {this} Pointer to the control instance for chaining.
	 */
	LightBoxItem.prototype.setAlt = function (alt) {
		var oImage = this.getAggregation("_image");

		this.setProperty("alt", alt, false);
		oImage.setAlt(alt);

		return this;
	};

	/**
	 * Sets the title of the image.
	 * @public
	 * @param {string} title The image title
	 * @method
	 * @returns {this} Pointer to the control instance for chaining.
	 */
	LightBoxItem.prototype.setTitle = function (title) {
		var oTitle = this.getAggregation("_title");

		this.setProperty("title", title, false);
		oTitle.setText(title);

		return this;
	};

	/**
	 * Sets the subtitle of the image.
	 * @public
	 * @param {string} sSubtitleText The image subtitle
	 * @returns {this} Pointer to the control instance for chaining.
	 */
	LightBoxItem.prototype.setSubtitle = function (sSubtitleText) {
		var oSubtitle = this.getAggregation("_subtitle");

		this.setProperty("subtitle", sSubtitleText, false);
		oSubtitle.setText(sSubtitleText);

		return this;
	};

	return LightBoxItem;
});