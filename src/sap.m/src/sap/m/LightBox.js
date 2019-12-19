/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Popup',
	'sap/m/Text',
	'sap/m/Button',
	'sap/ui/core/ResizeHandler',
	'sap/ui/Device',
	'sap/ui/core/Icon',
	'sap/ui/layout/VerticalLayout',
	'./InstanceManager',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/library',
	'./LightBoxRenderer',
	'sap/m/BusyIndicator',
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Core'
],
	function(
		library,
		Control,
		Popup,
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
		Core
	) {

		'use strict';

		// shortcut for sap.ui.core.OpenState
		var OpenState = coreLibrary.OpenState;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for sap.m.LightBoxLoadingStates
		var LightBoxLoadingStates = library.LightBoxLoadingStates;

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
		 * Check out the <a href="/#docs/api/symbols/sap.m.LightBox.html" >API Reference</a>.
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
		var LightBox = Control.extend('sap.m.LightBox', /** @lends sap.m.LightBox.prototype */ {
			metadata: {
				interfaces: [
					'sap.ui.core.PopupInterface'
				],
				library: 'sap.m',
				aggregations: {
					/**
					 * Aggregation which holds data about the image and its description. Although multiple LightBoxItems
					 * may be added to this aggregation only the first one in the list will be taken into account.
					 * @public
					 */
					imageContent: {type: 'sap.m.LightBoxItem', multiple: true, bindable: "bindable"},
					/**
					 * The close button aggregation inside the LightBox control. This button has to have text in it.
					 * @private
					 */
					_closeButton: {type: 'sap.m.Button', multiple: false, visibility: 'hidden'},
					/**
					 * The error icon displayed when the image could not be loaded in time.
					 * @private
					 */
					_errorIcon: {type: 'sap.ui.core.Icon', multiple: false, visibility: 'hidden'},
					/**
					 * The main error message displayed when the image could not be loaded.
					 * @private
					 */
					_errorTitle: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'},
					/**
					 * The detailed error message displayed when the image could not be loaded.
					 * @private
					 */
					_errorSubtitle: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'},
					/**
					 * A layout control used to display the error texts when the image could not be loaded.
					 * @private
					 */
					_verticalLayout: {type: 'sap.ui.layout.VerticalLayout', multiple: false, visibility: 'hidden'},
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
				events: {},
				defaultAggregation: 'imageContent',
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
			this._width = 0; //to be calculated later
			this._height = 0; //to be calculated later
			this._isRendering = true;

			this._resizeListenerId = null;
			this._$lightBox = null;

			this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			this._closeButtonText = this._rb.getText("LIGHTBOX_CLOSE_BUTTON");

			// create an ARIA announcement for enlarged image
			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				this.setAggregation("_invisiblePopupText", new InvisibleText());
			}
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
				oInvisiblePopupText = this.getAggregation('_invisiblePopupText'),
				sInvisiblePopupText = this._rb.getText("LIGHTBOX_ARIA_ENLARGED", [oImageContent.getTitle(), oImageContent.getSubtitle()]),
				errorMessageTitle = this._rb.getText('LIGHTBOX_IMAGE_ERROR'),
				errorMessageSubtitle = this._rb.getText('LIGHTBOX_IMAGE_ERROR_DETAILS');

			this._createErrorControls();

			// Prevents image having 0 width and height when the LightBox rendered
			// busy state first and then loaded the image in the meantime
			if (oNativeImage.getAttribute('src') !== sImageSrc) {
				oNativeImage.src = sImageSrc;
			}

			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResizeHandler);
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			switch (sState) {
				case LightBoxLoadingStates.Loading:
					this._timeoutId = setTimeout(function () {
						oImageContent._setImageState(LightBoxLoadingStates.TimeOutError);
					}, 10000);
					break;
				case LightBoxLoadingStates.Loaded:
					clearTimeout(this._timeoutId);
					this._calculateSizes(oNativeImage);
					break;
				case LightBoxLoadingStates.Error:
					clearTimeout(this._timeoutId);
					sInvisiblePopupText += " " +  errorMessageTitle + " " + errorMessageSubtitle;
					break;
				default:
					break;
			}

			if (oImageContent && oInvisiblePopupText) {
				oInvisiblePopupText.setText(sInvisiblePopupText);
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

			if (!this._resizeListenerId) {
				this._onResizeHandler = this._onResize.bind(this);
				Device.resize.attachHandler(this._onResizeHandler);
				this._resizeListenerId = ResizeHandler.register(this, this._onResizeHandler);
			}
		};

		LightBox.prototype.forceInvalidate = Control.prototype.invalidate;

		/**
		 * Rerenders the LightBox.
		 *
		 * @public
		 * @param {object} oOrigin Origin of the invalidation.
		 * @returns {sap.m.LightBox} this LightBox reference for chaining.
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
				this._oPopup.detachOpened(this._fnOpened, this);
				this._oPopup.detachClosed(this._fnClosed, this);
				this._oPopup.destroy();
				this._oPopup = null;
			}

			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResizeHandler);
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
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
		 * @returns {sap.m.LightBox} Pointer to the control instance for chaining.
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		LightBox.prototype.open = function () {
			/** @type {sap.m.LightBoxItem} */
			var imageContent = this._getImageContent();

			this._oPopup.setContent(this);

			if (imageContent && imageContent.getImageSrc()) {
				this._oPopup.open(300, 'center center', 'center center', document.body, null);
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
		 * @returns {sap.m.LightBox} Pointer to the control instance for chaining.
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		LightBox.prototype.close = function () {
			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResizeHandler);
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
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
			var closeButton = this.getAggregation('_closeButton');

			if (!closeButton) {
				closeButton = new Button({
					id: this.getId() + '-closeButton',
					text: this._closeButtonText,
					type: ButtonType.Transparent,
					press: function () {
						this.close();
					}.bind(this)
				});
				this.setAggregation('_closeButton', closeButton, true);
			}

			return closeButton;
		};

		/**
		 * Instantiates (if not defined) and returns the BusyIndicator for the LightBox.
		 *
		 * @private
		 * @returns {sap.m.BusyIndicator} The BusyIndicator displayed while the image is loading.
		 */
		LightBox.prototype._getBusyIndicator = function () {
			var busyIndicator = this.getAggregation("_busy");

			if (!busyIndicator) {
				busyIndicator = new BusyIndicator();
				this.setAggregation("_busy", busyIndicator, true);
			}

			return busyIndicator;
		};

		/**
		 * Forces rerendering of the control when an image loads/fails to load.
		 *
		 * @private
		 * @param {string} newState The new state of the image. Possible values are: "LOADING", "LOADED" and "ERROR".
		 */
		LightBox.prototype._imageStateChanged = function (newState) {
			var stateUnfinished = newState === LightBoxLoadingStates.Loaded || newState === LightBoxLoadingStates.Error;

			if (stateUnfinished && !this._isRendering) {
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
			this._oPopup.attachOpened(this._fnOpened, this);
			this._oPopup.attachClosed(this._fnClosed, this);
		};

		/**
		 * Adds event listener to the blocklayer area to close the lightbox when the area is clicked.
		 *
		 * @private
		 */
		LightBox.prototype._fnOpened = function() {
			var that = this;
			that._onResize();

			jQuery('#sap-ui-blocklayer-popup').on("click", function() {
				that.close();
			});
		};

		/**
		 * Removes the event listener.
		 *
		 * @private
		 */
		LightBox.prototype._fnClosed = function() {
			jQuery('#sap-ui-blocklayer-popup').off("click");
		};

		/**
		 * Creates the controls used to display error state of the LightBox.
		 *
		 * @private
		 */
		LightBox.prototype._createErrorControls = function() {
			var resourceBundle = this._rb;
			var errorMessageTitle;
			var errorMessageSubtitle;

			if (this._getImageContent()._getImageState() === LightBoxLoadingStates.TimeOutError) {
				errorMessageTitle = resourceBundle.getText('LIGHTBOX_IMAGE_TIMED_OUT');
				errorMessageSubtitle = resourceBundle.getText('LIGHTBOX_IMAGE_TIMED_OUT_DETAILS');
			} else {
				errorMessageTitle = resourceBundle.getText('LIGHTBOX_IMAGE_ERROR');
				errorMessageSubtitle = resourceBundle.getText('LIGHTBOX_IMAGE_ERROR_DETAILS');
			}

			if (!this.getAggregation('_verticalLayout')) {
				var errorTitle = new Text({
					text : errorMessageTitle,
					textAlign : TextAlign.Center
				}).addStyleClass("sapMLightBoxErrorTitle"),
					errorSubtitle = new Text({
						text : errorMessageSubtitle,
						textAlign : TextAlign.Center
					}).addStyleClass("sapMLightBoxErrorSubtitle"),
					errorIcon = new Icon({
						src : "sap-icon://picture"
					}).addStyleClass("sapMLightBoxErrorIcon");

				this.setAggregation('_verticalLayout', new VerticalLayout({
					content : [ errorIcon, errorTitle, errorSubtitle]
				}).addStyleClass('sapMLightBoxVerticalLayout'));
			}
		};

		/**
		 * Handles the resize of the LightBox (usually caused by window resize).
		 *
		 * @private
		 */
		LightBox.prototype._onResize = function () {
			var minimumSideOffset = calculateOffset() / 2 + 'px',
				top = minimumSideOffset,
				left = minimumSideOffset,
				marginTop = '',
				marginLeft = '',
				oImageContent = this._getImageContent(),
				lightBoxContainer = this.getDomRef(),
				lightBoxWidth,
				lightBoxHeight,
				minimumOffset = calculateOffset(),
				hcbBorderSize = 2;

			if (oImageContent._getImageState() === LightBoxLoadingStates.Loaded) {
				this._calculateSizes(oImageContent._getNativeImage());

				lightBoxWidth = this._width;
				lightBoxHeight = this._height;

				this._$lightBox.width(lightBoxWidth);
				this._$lightBox.height(lightBoxHeight);
			} else {
				lightBoxWidth = lightBoxContainer.clientWidth;
				lightBoxHeight = lightBoxContainer.clientHeight;
			}

			if (window.innerWidth > lightBoxWidth + minimumOffset) {
				left = '50%';
				marginLeft = Math.round(-lightBoxWidth / 2);
			}

			if (window.innerHeight > lightBoxHeight + minimumOffset) {
				top = '50%';
				marginTop = Math.round(-lightBoxHeight / 2);
			}

			if (sap.ui.getCore().getConfiguration().getTheme() === 'sap_hcb') {
				marginTop -= hcbBorderSize;
				marginLeft -= hcbBorderSize;
			}

			this._$lightBox.css({
				'top' : top,
				'margin-top' :  marginTop,
				'left' : left,
				'margin-left' : marginLeft
			});
		};

		/**
		 * Calculates the target size of the image and the lightbox based on the size of the image that will be loaded.
		 *
		 * @private
		 * @param {window.Image} internalImage The javascript native object referring to the image that will be loaded.
		 */
		LightBox.prototype._calculateSizes = function (internalImage) {
			var iFooterHeightPx = this._calculateFooterHeightInPx(),
				imageMinHeight = 288 - iFooterHeightPx, // 18rem * 16px = 288px
				image = this._getImageContent().getAggregation("_image"),
				height;

			this._setImageSize(image, internalImage.naturalWidth, internalImage.naturalHeight);
			this._calculateAndSetLightBoxSize(image);

			height = this._pxToNumber(image.getHeight());

			this.toggleStyleClass('sapMLightBoxMinSize', (height < imageMinHeight));

			this._isBusy = false;
		};

		/**
		 * Calculates the height of the footer of the LightBox in pixels.
		 *
		 * @private
		 * @returns {int} The height of the footer.
		 */
		LightBox.prototype._calculateFooterHeightInPx = function () {
			var compact = this.$().parents().hasClass('sapUiSizeCompact');
			var subtitle = this._getImageContent().getSubtitle();

			var footerHeightRem = 2.5; // base height of the footer in rem

			if (!compact) {
			    footerHeightRem += 0.5;
			}

			if (subtitle) {
			    footerHeightRem += 1.5;
			}

			return footerHeightRem * 16; // 1rem == 16px
		};

		/**
		 * Calculates and sets in private properties the width and height of the LightBox.
		 *
		 * @private
		 * @param {sap.m.Image} image The image of the LightBoxItem.
		 */
		LightBox.prototype._calculateAndSetLightBoxSize = function (image) {
			var imageHeight,
				imageWidth,
				lightBoxMinWidth = (20 /*rem*/ * 16 /*px*/),
				lightBoxMinHeight = (18 /*rem*/ * 16 /*px*/),
				iFooterHeightPx = this._calculateFooterHeightInPx();

			imageHeight = this._pxToNumber(image.getHeight());
			imageWidth = this._pxToNumber(image.getWidth());

			this._width = Math.max(lightBoxMinWidth, imageWidth);
			this._height = Math.max(lightBoxMinHeight, imageHeight + iFooterHeightPx);

			this._isLightBoxBiggerThanMinDimensions = (imageWidth >= lightBoxMinWidth) && (imageHeight >= (lightBoxMinHeight - iFooterHeightPx));
		};

		/**
		 * Calculates and sets the Image size in the LightBox.
		 *
		 * @private
		 * @param {sap.m.Image} image The image instance.
		 * @param {int} imageWidth The width of the internal image.
		 * @param {int} imageHeight The height of the internal image.
		 */
		LightBox.prototype._setImageSize = function (image, imageWidth, imageHeight) {
			var footerHeight = this._calculateFooterHeightInPx(),
				dimensions = this._getDimensions(imageWidth, imageHeight, footerHeight),
				width = dimensions.width + 'px',
				height = dimensions.height + 'px',
				imgDomRef = image.getDomRef();

			image.setProperty('width', width, true);
			image.setProperty('height', height, true);

			if (imgDomRef) {
				imgDomRef.style.width = width;
				imgDomRef.style.height = height;
			}
		};

		/**
		 * Calculates the size for an image inside the LightBox.
		 *
		 * @private
		 * @param {int} imageWidth The natural width of the loaded images in px.
		 * @param {int} imageHeight The natural height of the loaded images in px.
		 * @param {int} footerHeight The footer height in px.
		 * @returns {Object} An object holding the calculated dimensions of the image
		 */
		LightBox.prototype._getDimensions = function (imageWidth, imageHeight, footerHeight) {
			// minimum size of the lightbox
			var lightboxMinWidth = 20 /*rem*/ * 16 /*px*/,
				lightboxMinHeight = 18 /*rem*/ * 16 /*px*/,
				// window size
				$window = jQuery(window),
				windowHeight = $window.height(),
				windowWidth = $window.width(),
				minimumOffset = calculateOffset(),
				// the size available for the image
				availableWidth = Math.max(windowWidth - minimumOffset, lightboxMinWidth),
				availableHeight = Math.max(windowHeight - minimumOffset, lightboxMinHeight),
				// the ratio to which the image will be scaled
				scaleRatio;

			availableHeight -= footerHeight;

			if (imageHeight <= availableHeight) {
				if (imageWidth <= availableWidth) {
					// do nothing, image has enough space and will be displayed as it is
				} else {
					// image is wider than the space available
					imageHeight *= availableWidth / imageWidth;
					imageWidth = availableWidth;
				}
			} else {
				if (imageWidth <= availableWidth) {
					imageWidth *= availableHeight / imageHeight;
					imageHeight = availableHeight;
				} else {
					scaleRatio = Math.max(imageWidth / availableWidth, imageHeight / availableHeight);
					imageWidth /= scaleRatio;
					imageHeight /= scaleRatio;
				}
			}

			return {width : Math.round(imageWidth), height : Math.round(imageHeight)};
		};

		/**
		 * Converts size from px to a number.
		 *
		 * @private
		 * @param {string} sizeToConvert The size to be converted
		 * @returns {int} The size in number value
		 */
		LightBox.prototype._pxToNumber = function (sizeToConvert) {
			return (sizeToConvert.substring(0, (sizeToConvert.length - 2)) ) * 1;
		};

		/**
		 * Returns the first LightBoxItem in the aggregation.
		 *
		 * @private
		 * @returns {sap.m.LightBoxItem|null} The first LightBoxItem in the imageContent aggregation.
		 */
		LightBox.prototype._getImageContent = function () {
			var rgImageContent = this.getAggregation('imageContent');

			return rgImageContent && rgImageContent[0];
		};

		/**
		 * Helper function for calculating offset.
		 *
		 * @private
		 * @returns {int} Calculated offset.
		 */
		function calculateOffset() {
			var system = Device.system;

			if (system.desktop) {
				return 4 /*rem*/ * 16 /*px*/;
			}

			if (system.tablet) {
				return 2 /*rem*/ * 16 /*px*/;
			}

			if (system.phone && Device.resize.width > 320) {
				return 1 /*rem*/ * 16 /*px*/;
			}

			return 0;
		}

		/**
		 * Event handler for the escape key pressed event.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		LightBox.prototype.onsapescape = function(oEvent) {
			var eOpenState = this._oPopup.getOpenState();
			if (eOpenState !== OpenState.CLOSED && eOpenState !== OpenState.CLOSING) {
				this.close();
				//event should not trigger any further actions
				oEvent.stopPropagation();
			}

		};


		return LightBox;
	});
