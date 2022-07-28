/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Popup",
	"sap/ui/core/Core",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/core/Icon",
	"sap/ui/layout/VerticalLayout",
	"./InstanceManager",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/library",
	"./LightBoxRenderer",
	"sap/m/BusyIndicator",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/units/Rem"
], function (
	library,
	Control,
	Popup,
	Core,
	Text,
	Button,
	ResizeHandler,
	Device,
	Icon,
	VerticalLayout,
	InstanceManager,
	InvisibleText,
	coreLibrary,
	LightBoxRenderer,
	BusyIndicator,
	jQuery,
	DomUnitsRem
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.LightBoxLoadingStates
	var LightBoxLoadingStates = library.LightBoxLoadingStates;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	/**
	 * Constructor for a new LightBox.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a popup containing an image and a footer.
	 *
	 * <h3>Overview</h3>
	 *
	 * The purpose of the control is to display an image in its original size as long as this is possible.
	 * On smaller screens images are scaled down to fit.
	 *
	 * <strong>Notes:</strong>
	 * <ul>
	 *     <li>If the image doesn't load in 10 seconds, an error is displayed.</li>
	 *     <li>Setting the <code>imageContent</code> aggregation of the control as well as the source of the image and the title of the image is <u>mandatory</u>.
	 *          If the image source is not set, the control will not open.</li>
	 * </ul>
	 * <h3>Structure</h3>
	 *
	 * Each LightBox holds a {@link sap.m.LightBoxItem LightBoxItem} which keeps the properties of the image:
	 * <ul>
	 *     <li> imageSrc - The source URI of the image </li>
	 *     <li> title - The title of the image </li>
	 *     <li> subtitle - The subtitle of the image </li>
	 *     <li> alt - The alt text of the image </li>
	 * </ul>
	 * <h3>Usage</h3>
	 *
	 * The most common use case is to click on an image thumbnail to view it in bigger size.
	 * When the image that should be displayed in the control cannot be loaded, an error is displayed in the popup.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * On a mobile device, flipping the device to landscape will flip the lightbox and the image will be adjusted to fit the new dimensions.
	 *
	 * <h3>Additional Information</h3>
	 *
	 * Check out the {@link sap.m.LightBoxItem API Reference}.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.LightBox
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/lightbox/ Light Box}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LightBox = Control.extend("sap.m.LightBox", /** @lends sap.m.LightBox.prototype */ {
		metadata: {
			library: "sap.m",
			interfaces: [
				"sap.ui.core.PopupInterface"
			],
			aggregations: {
				/**
				 * Aggregation which holds data about the image and its description. Although multiple LightBoxItems
				 * may be added to this aggregation only the first one in the list will be taken into account.
				 * @public
				 */
				imageContent: {type: "sap.m.LightBoxItem", multiple: true, bindable: "bindable"},

				/**
				 * The close button aggregation inside the LightBox control. This button has to have text in it.
				 * @private
				 */
				_closeButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 * A layout control used to display the error texts when the image could not be loaded.
				 * @private
				 */
				_verticalLayout: {type: "sap.ui.layout.VerticalLayout", multiple: false, visibility: "hidden"},

				/**
				 * Hidden text used for accessibility of the popup.
				 * @private
				 */
				_invisiblePopupText: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"},

				/**
				 * BusyIndicator for loading state.
				 * @private
				 */
				_busy: {type: "sap.m.BusyIndicator", multiple: false, visibility: "hidden"}

			},
			defaultAggregation: "imageContent",
			events: {},
			designtime: "sap/m/designtime/LightBox.designtime"
		}
	});

	//================================================================================
	// Lifecycle methods
	//================================================================================

	/**
	 * Sets up the initial values of the control.
	 *
	 * @protected
	 */
	LightBox.prototype.init = function () {
		this._createPopup();
		this._iWidth = 0; //to be calculated later
		this._iHeight = 0; //to be calculated later
		this._isRendering = true;

		this._iResizeListenerId = null;
		this._$lightBox = null;

		this._oRB = Core.getLibraryResourceBundle("sap.m");

		// create an ARIA announcement for enlarged image
		this.setAggregation("_invisiblePopupText", new InvisibleText());
	};

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @public
	 */
	LightBox.prototype.onBeforeRendering = function () {
		var oImageContent = this._getImageContent(),
			oNativeImage = oImageContent._getNativeImage(),
			sImageSrc = oImageContent.getImageSrc(),
			sState = oImageContent._getImageState(),
			sInvisiblePopupText = this._oRB.getText("LIGHTBOX_ARIA_ENLARGED", [oImageContent.getTitle(), oImageContent.getSubtitle()]),
			sErrorMessageTitle = this._oRB.getText("LIGHTBOX_IMAGE_ERROR"),
			sErrorMessageSubtitle = this._oRB.getText("LIGHTBOX_IMAGE_ERROR_DETAILS");

		this._createErrorControls();

		// Prevents image having 0 width and height when the LightBox rendered
		// busy state first and then loaded the image in the meantime
		if (oNativeImage.getAttribute("src") !== sImageSrc) {
			oNativeImage.src = sImageSrc;
		}

		if (this._iResizeListenerId) {
			Device.resize.detachHandler(this._fnResizeListener);
			ResizeHandler.deregister(this._iResizeListenerId);
			this._iResizeListenerId = null;
		}

		switch (sState) {
			case LightBoxLoadingStates.Loading:
				if (!this._iTimeoutId) {
					this._iTimeoutId = setTimeout(function () {
						oImageContent._setImageState(LightBoxLoadingStates.TimeOutError);
					}, 10000);
				}
				break;
			case LightBoxLoadingStates.Loaded:
				clearTimeout(this._iTimeoutId);
				this._calculateSizes(oNativeImage);
				break;
			case LightBoxLoadingStates.Error:
				clearTimeout(this._iTimeoutId);
				sInvisiblePopupText += " " + sErrorMessageTitle + " " + sErrorMessageSubtitle;
				break;
			default:
				break;
		}

		if (oImageContent) {
			this.getAggregation("_invisiblePopupText").setText(sInvisiblePopupText);
		}

		this._isRendering = true;
	};

	/**
	 * Overwrites the onAfterRendering.
	 *
	 * @public
	 */
	LightBox.prototype.onAfterRendering = function () {
		this._isRendering = false;
		this._$lightBox = this.$();

		if (!this._iResizeListenerId) {
			this._fnResizeListener = this._onResize.bind(this);
			Device.resize.attachHandler(this._fnResizeListener);
			this._iResizeListenerId = ResizeHandler.register(this, this._fnResizeListener);
		}
	};

	LightBox.prototype.forceInvalidate = Control.prototype.invalidate;

	/**
	 * Invalidates the LightBox.
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oOrigin Origin of the invalidation.
	 * @returns {this} this LightBox reference for chaining.
	 */
	LightBox.prototype.invalidate = function (oOrigin) {
		var oImageContent = this._getImageContent();

		if (this.isOpen()) {
			if (oImageContent && oImageContent.getImageSrc()) {
				this.forceInvalidate(oOrigin);
			} else {
				this.close();
			}
		}

		return this;
	};

	/**
	 * Detaches all handlers and destroys the instance.
	 *
	 * @public
	 */
	LightBox.prototype.exit = function () {
		if (this._oPopup) {
			this._oPopup.detachOpened(this._fnPopupOpened, this);
			this._oPopup.detachClosed(this._fnPopupClosed, this);
			this._oPopup.destroy();
			this._oPopup = null;
		}

		if (this._iResizeListenerId) {
			Device.resize.detachHandler(this._fnResizeListener);
			ResizeHandler.deregister(this._iResizeListenerId);
			this._iResizeListenerId = null;
		}

		InstanceManager.removeLightBoxInstance(this);
	};

	//================================================================================
	// Control methods
	//================================================================================

	/**
	 * Opens the LightBox.
	 *
	 * @public
	 * @returns {this} Pointer to the control instance for chaining.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	LightBox.prototype.open = function () {
		/** @type {sap.m.LightBoxItem} */
		var oImageContent = this._getImageContent();

		this._oPopup.setContent(this);

		if (oImageContent && oImageContent.getImageSrc()) {
			this._oPopup.open(300, "center center", "center center", document.body, null);
			InstanceManager.addLightBoxInstance(this);
		}

		return this;
	};

	/**
	 * Returns if the LightBox is open.
	 *
	 * @public
	 * @returns {boolean} Is the LightBox open
	 */
	LightBox.prototype.isOpen = function() {
		if (this._oPopup && this._oPopup.isOpen()) {
			return true;
		}

		return false;
	};

	/**
	 * Closes the LightBox.
	 *
	 * @public
	 * @returns {this} Pointer to the control instance for chaining.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	LightBox.prototype.close = function () {
		if (this._iResizeListenerId) {
			Device.resize.detachHandler(this._fnResizeListener);
			ResizeHandler.deregister(this._iResizeListenerId);
			this._iResizeListenerId = null;
		}

		this._oPopup.close();
		InstanceManager.removeLightBoxInstance(this);

		return this;
	};

	//================================================================================
	// Private methods
	//================================================================================

	/**
	 * Instantiates (if not defined) and returns the close button for the LightBox.
	 *
	 * @private
	 * @returns {sap.m.Button} The close button.
	 */
	LightBox.prototype._getCloseButton = function () {
		var oCloseButton = this.getAggregation("_closeButton");

		if (!oCloseButton) {
			oCloseButton = new Button({
				id: this.getId() + "-closeButton",
				text: this._oRB.getText("LIGHTBOX_CLOSE_BUTTON"),
				type: ButtonType.Transparent,
				press: this.close.bind(this)
			});
			this.setAggregation("_closeButton", oCloseButton, true);
		}

		return oCloseButton;
	};

	/**
	 * Instantiates (if not defined) and returns the BusyIndicator for the LightBox.
	 *
	 * @private
	 * @returns {sap.m.BusyIndicator} The BusyIndicator displayed while the image is loading.
	 */
	LightBox.prototype._getBusyIndicator = function () {
		var oBusyIndicator = this.getAggregation("_busy");

		if (!oBusyIndicator) {
			oBusyIndicator = new BusyIndicator();
			this.setAggregation("_busy", oBusyIndicator, true);
		}

		return oBusyIndicator;
	};

	/**
	 * Forces invalidation of the control when an image loads/fails to load.
	 *
	 * @private
	 * @param {sap.m.LightBoxLoadingStates} sNewState The new state of the image. Possible values are: "LOADING", "LOADED" and "ERROR".
	 */
	LightBox.prototype._imageStateChanged = function (sNewState) {
		var bEndState = sNewState === LightBoxLoadingStates.Loaded || sNewState === LightBoxLoadingStates.Error;

		if (bEndState && !this._isRendering) {
			this.rerender();
		}
	};

	/**
	 * Creates the popup in which the LightBox is displayed and adds event handlers. Event handlers are necessary
	 * to close the popup when the user clicks on the overlay around the popup.
	 *
	 * @private
	 */
	LightBox.prototype._createPopup = function () {
		this._oPopup = new Popup(this, true, true);
		this._oPopup.attachOpened(this._fnPopupOpened, this);
		this._oPopup.attachClosed(this._fnPopupClosed, this);
	};

	/**
	 * Adds event listener to the blocklayer area to close the lightbox when the area is clicked.
	 *
	 * @private
	 */
	LightBox.prototype._fnPopupOpened = function() {
		this._onResize();

		jQuery("#sap-ui-blocklayer-popup").on("click", function() {
			this.close();
		}.bind(this));
	};

	/**
	 * Removes the event listener.
	 *
	 * @private
	 */
	LightBox.prototype._fnPopupClosed = function() {
		jQuery("#sap-ui-blocklayer-popup").off("click");
	};

	/**
	 * Creates the controls used to display error state of the LightBox.
	 *
	 * @private
	 */
	LightBox.prototype._createErrorControls = function() {
		var sErrorTitle,
			sErrorSubtitle,
			oTitle,
			oSubtitle,
			oIcon;

		if (this.getAggregation("_verticalLayout")) {
			return;
		}

		if (this._getImageContent()._getImageState() === LightBoxLoadingStates.TimeOutError) {
			sErrorTitle = this._oRB.getText("LIGHTBOX_IMAGE_TIMED_OUT");
			sErrorSubtitle = this._oRB.getText("LIGHTBOX_IMAGE_TIMED_OUT_DETAILS");
		} else {
			sErrorTitle = this._oRB.getText("LIGHTBOX_IMAGE_ERROR");
			sErrorSubtitle = this._oRB.getText("LIGHTBOX_IMAGE_ERROR_DETAILS");
		}

		oTitle = new Text({
			text: sErrorTitle,
			textAlign: TextAlign.Center
		}).addStyleClass("sapMLightBoxErrorTitle");

		oSubtitle = new Text({
			text: sErrorSubtitle,
			textAlign: TextAlign.Center
		}).addStyleClass("sapMLightBoxErrorSubtitle");

		oIcon = new Icon({
			src: "sap-icon://picture"
		}).addStyleClass("sapMLightBoxErrorIcon");

		this.setAggregation("_verticalLayout", new VerticalLayout({
			content: [oIcon, oTitle, oSubtitle]
		}).addStyleClass("sapMLightBoxVerticalLayout"));
	};

	/**
	 * Handles the resize of the LightBox (usually caused by window resize).
	 *
	 * @private
	 */
	LightBox.prototype._onResize = function () {
		var iMinimumSideOffset = this._calculateOffset() / 2 + "px",
			vTop = iMinimumSideOffset,
			vLeft = iMinimumSideOffset,
			vMarginTop = "",
			vMarginLeft = "",
			oImageContent = this._getImageContent(),
			oDomRef = this.getDomRef(),
			vLightBoxWidth,
			vLightBoxHeight,
			iMinimumOffset = this._calculateOffset();

		if (oImageContent._getImageState() === LightBoxLoadingStates.Loaded) {
			this._calculateSizes(oImageContent._getNativeImage());

			vLightBoxWidth = this._iWidth;
			vLightBoxHeight = this._iHeight;

			this._$lightBox.width(vLightBoxWidth);
			this._$lightBox.height(vLightBoxHeight);
		} else {
			vLightBoxWidth = oDomRef.clientWidth;
			vLightBoxHeight = oDomRef.clientHeight;
		}

		if (window.innerWidth > vLightBoxWidth + iMinimumOffset) {
			vLeft = "50%";
			vMarginLeft = Math.round(-vLightBoxWidth / 2);
		}

		if (window.innerHeight > vLightBoxHeight + iMinimumOffset) {
			vTop = "50%";
			vMarginTop = Math.round(-vLightBoxHeight / 2);
		}

		this._$lightBox.css({
			"top": vTop,
			"margin-top": vMarginTop,
			"left": vLeft,
			"margin-left": vMarginLeft
		});
	};

	/**
	 * Calculates the target size of the image and the lightbox based on the size of the image that will be loaded.
	 *
	 * @private
	 * @param {window.Image} oNativeImage The javascript native object referring to the image that will be loaded.
	 */
	LightBox.prototype._calculateSizes = function (oNativeImage) {
		var iFooterHeightPx = this._calculateFooterHeightInPx(),
			iImageMinHeight = 288 - iFooterHeightPx, // 18rem * 16px = 288px
			oImage = this._getImageContent().getAggregation("_image"),
			iHeight;

		this._setImageSize(oImage, oNativeImage.naturalWidth, oNativeImage.naturalHeight);
		this._calculateAndSetLightBoxSize(oImage);

		iHeight = this._pxToNumber(oImage.getHeight());

		this.toggleStyleClass("sapMLightBoxMinSize", iHeight < iImageMinHeight);

		this._isBusy = false;
	};

	/**
	 * Calculates the height of the footer of the LightBox in pixels.
	 *
	 * @private
	 * @returns {int} The height of the footer.
	 */
	LightBox.prototype._calculateFooterHeightInPx = function () {
		var bCompact = this.$().parents().hasClass("sapUiSizeCompact"),
			oSubtitle = this._getImageContent().getSubtitle(),
			iFooterHeightRem = 3; // base height of the footer in rem

		if (bCompact && !oSubtitle) {
			iFooterHeightRem -= 0.5;
		}

		if (oSubtitle) {
			iFooterHeightRem += 0.5;
		}

		return DomUnitsRem.toPx(iFooterHeightRem); // 1rem * iFooterHeightRem
	};

	/**
	 * Calculates and sets in private properties the width and height of the LightBox.
	 *
	 * @private
	 * @param {sap.m.Image} oImage The Image instance of the LightBoxItem.
	 */
	LightBox.prototype._calculateAndSetLightBoxSize = function (oImage) {
		var iImageHeight,
			iImageWidth,
			iLightBoxMinWidth = 20 /*rem*/ * 16 /*px*/,
			iLightBoxMinHeight = 18 /*rem*/ * 16 /*px*/,
			iFooterHeightPx = this._calculateFooterHeightInPx();

		iImageHeight = this._pxToNumber(oImage.getHeight());
		iImageWidth = this._pxToNumber(oImage.getWidth());

		this._iWidth = Math.max(iLightBoxMinWidth, iImageWidth);
		this._iHeight = Math.max(iLightBoxMinHeight, iImageHeight + iFooterHeightPx);

		this._bIsLightBoxBiggerThanMinDimensions = (iImageWidth >= iLightBoxMinWidth) && (iImageHeight >= (iLightBoxMinHeight - iFooterHeightPx));
	};

	/**
	 * Calculates and sets the Image size in the LightBox.
	 *
	 * @private
	 * @param {sap.m.Image} oImage The image instance.
	 * @param {int} iWidth The width of the internal image.
	 * @param {int} iHeight The height of the internal image.
	 */
	LightBox.prototype._setImageSize = function (oImage, iWidth, iHeight) {
		var iFooterHeight = this._calculateFooterHeightInPx(),
			oDimensions = this._getDimensions(iWidth, iHeight, iFooterHeight);

		oImage.setWidth(oDimensions.width + "px");
		oImage.setHeight(oDimensions.height + "px");
	};

	/**
	 * Calculates the size for an image inside the LightBox.
	 *
	 * @private
	 * @param {int} iImageWidth The natural width of the loaded images in px.
	 * @param {int} iImageHeight The natural height of the loaded images in px.
	 * @param {int} iFooterHeight The footer height in px.
	 * @returns {{width: int, height: int}} An object holding the calculated dimensions of the image
	 */
	LightBox.prototype._getDimensions = function (iImageWidth, iImageHeight, iFooterHeight) {
		// minimum size of the lightbox
		var iLightboxMinWidth = 20 /*rem*/ * 16 /*px*/,
			iLightboxMinHeight = 18 /*rem*/ * 16 /*px*/,

			// window size
			$window = jQuery(window),
			iWindowHeight = $window.height(),
			iWindowWidth = $window.width(),
			iMinimumOffset = this._calculateOffset(),

			// the size available for the image
			iAvailableWidth = Math.max(iWindowWidth - iMinimumOffset, iLightboxMinWidth),
			iAvailableHeight = Math.max(iWindowHeight - iMinimumOffset, iLightboxMinHeight),

			// the ratio to which the image will be scaled
			fScaleRatio;

		iAvailableHeight -= iFooterHeight;

		if (iImageHeight <= iAvailableHeight) {
			if (iImageWidth <= iAvailableWidth) {
				// do nothing, image has enough space and will be displayed as it is
			} else {
				// image is wider than the space available
				iImageHeight *= iAvailableWidth / iImageWidth;
				iImageWidth = iAvailableWidth;
			}
		} else if (iImageWidth <= iAvailableWidth) {
			iImageWidth *= iAvailableHeight / iImageHeight;
			iImageHeight = iAvailableHeight;
		} else {
			fScaleRatio = Math.max(iImageWidth / iAvailableWidth, iImageHeight / iAvailableHeight);
			iImageWidth /= fScaleRatio;
			iImageHeight /= fScaleRatio;
		}

		return {
			width: Math.round(iImageWidth),
			height: Math.round(iImageHeight)
		};
	};

	/**
	 * Converts size from px to a number.
	 *
	 * @private
	 * @param {string} sSizeToConvert The size to be converted
	 * @returns {int} The size in number value
	 */
	LightBox.prototype._pxToNumber = function (sSizeToConvert) {
		return (sSizeToConvert.substring(0, (sSizeToConvert.length - 2)) ) * 1;
	};

	/**
	 * Returns the first LightBoxItem in the aggregation.
	 *
	 * @private
	 * @returns {sap.m.LightBoxItem|null} The first LightBoxItem in the imageContent aggregation.
	 */
	LightBox.prototype._getImageContent = function () {
		var aImageContent = this.getAggregation("imageContent");

		return aImageContent && aImageContent[0];
	};

	/**
	 * Helper function for calculating offset.
	 *
	 * @private
	 * @returns {int} Calculated offset.
	 */
	LightBox.prototype._calculateOffset = function () {
		if (Device.system.desktop) {
			return 4 /*rem*/ * 16 /*px*/;
		}

		if (Device.system.tablet) {
			return 2 /*rem*/ * 16 /*px*/;
		}

		if (Device.system.phone && Device.resize.width > 320) {
			return 1 /*rem*/ * 16 /*px*/;
		}

		return 0;
	};

	/**
	 * Event handler for the escape key pressed event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	LightBox.prototype.onsapescape = function (oEvent) {
		var sOpenState = this._oPopup.getOpenState();

		if (sOpenState !== OpenState.CLOSED || sOpenState !== OpenState.CLOSING) {
			this.close();
			//event should not trigger any further actions
			oEvent.stopPropagation();
		}
	};

	return LightBox;
});