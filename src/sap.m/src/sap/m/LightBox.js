/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/Popup', 'sap/m/Text',
		'sap/m/Button', 'sap/m/Image', 'sap/ui/core/ResizeHandler', 'sap/ui/Device', 'sap/m/MessagePage',
		'sap/ui/core/Icon', 'sap/ui/layout/VerticalLayout', './InstanceManager', 'sap/ui/core/InvisibleText'],
	function (jQuery, library, Control, Popup, Text,
			Button, Image, ResizeHandler, Device, MessagePage,
			Icon, VerticalLayout, InstanceManager, InvisibleText) {

		'use strict';

		/**
		 * Constructor for a new Lightbox.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <strong><i>Overview</i></strong>
		 * <br><br>
		 * A {@link sap.m.LightBox} control represents a popup containing an image and a footer.
		 * The purpose of the control is to display an image in its original size as long as this is possible. On smaller screens, images are scaled down to fit.
		 * <br><br>
		 * <strong>Notes:</strong>
		 * <ul>
		 *     <li>If the image doesn't load in 10 seconds an error is displayed. </li>
		 *     <li>Setting the <code>imageContent</code> aggregation of the control as well as the source of the image and the title of the image is <u>mandatory</u>.
		 *          If the image source is not set, the control will not open.</li>
		 * </ul>
		 * <strong><i>Structure</i></strong>
		 * <br><br>
		 * Each LightBox holds a {@link sap.m.LightBoxItem LightBoxItem} which keeps the properties of the image:
		 * <ul>
		 *     <li> imageSrc - The source URI of the image </li>
		 *     <li> title - The title of the image </li>
		 *     <li> subtitle - The subtitle of the image </li>
		 *     <li> alt - The alt text of the image </li>
		 * </ul>
		 * <strong><i>Usage</i></strong>
		 * <br><br>
		 * The most common usecase is to click on an image thumbnail to view it in bigger size.
		 * When the image that should be displayed in the control cannot be loaded, an error is displayed in the popup.
		 * <br><br>
		 * <strong><i>Responsive Behavior</i></strong>
		 * <br><br>
		 * On a mobile device, flipping the device to landscape will flip the lightbox and the image will be adjusted to fit the new dimensions.
		 * <br><br>
		 * <strong><i>Additional Information</i></strong>
		 * <br><br>
		 * Check out the <a href="/#docs/api/symbols/sap.m.LightBox.html" >API Reference</a>.
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.LightBox
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
				defaultAggregation: 'imageContent'
			}
		});

		//================================================================================
		// Lifecycle methods
		//================================================================================

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

		LightBox.prototype.onBeforeRendering = function () {
			var oImageContent = this._getImageContent(),
				oNativeImage = oImageContent._getNativeImage(),
				sState = oImageContent._getImageState();

			this._createErrorControls();
			oNativeImage.src = oImageContent.getImageSrc();

			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResize);
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			switch (sState) {
				case sap.m.LightBoxLoadingStates.Loading:
					this._timeoutId = setTimeout(function () {
						oImageContent._setImageState(sap.m.LightBoxLoadingStates.TimeOutError);
					}, 10000);
					break;
				case sap.m.LightBoxLoadingStates.Loaded:
					clearTimeout(this._timeoutId);
					this._calculateSizes(oNativeImage);
					break;
				case sap.m.LightBoxLoadingStates.Error:
					clearTimeout(this._timeoutId);
					break;
				default:
					break;
			}

			var oInvisiblePopupText = this.getAggregation('_invisiblePopupText');
			if (oImageContent && oInvisiblePopupText) {
				oInvisiblePopupText.setText(this._rb.getText("LIGHTBOX_ARIA_ENLARGED", oImageContent.getTitle()));
			}

			this._isRendering = true;
		};

		LightBox.prototype.onAfterRendering = function () {
			this._isRendering = false;
			this._$lightBox = this.$();

			if (!this._resizeListenerId) {
				Device.resize.attachHandler(this._onResize.bind(this));
				this._resizeListenerId = ResizeHandler.register(this, this._onResize.bind(this));
			}
		};

		LightBox.prototype.forceInvalidate = Control.prototype.invalidate;

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

		LightBox.prototype.exit = function () {
			if (this._oPopup) {
				this._oPopup.detachOpened(this._fnOpened, this);
				this._oPopup.detachClosed(this._fnClosed, this);
				this._oPopup.destroy();
				this._oPopup = null;
			}

			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResize);
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
		 * @public
		 * @returns {sap.m.LightBox} Pointer to the control instance for chaining.
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		LightBox.prototype.open = function () {
			var oImageContent = this._getImageContent();

			this._oPopup.setContent(this);

			if (oImageContent && oImageContent.getImageSrc()) {
				this._oPopup.open(300, 'center center', 'center center', document.body, null);
				InstanceManager.addLightBoxInstance(this);
			}

			return this;
		};

		/**
		 * Returns if the LightBox is open.
		 * @returns {boolean}
		 */
		LightBox.prototype.isOpen = function() {
			if (this._oPopup && this._oPopup.isOpen()) {
				return true;
			}

			return false;
		};

		/**
		 * Closes the LightBox.
		 * @public
		 * @returns {sap.m.LightBox} Pointer to the control instance for chaining.
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		LightBox.prototype.close = function () {
			if (this._resizeListenerId) {
				Device.resize.detachHandler(this._onResize);
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
		 * @returns {sap.m.Button} - the close button
		 * @private
		 */
		LightBox.prototype._getCloseButton = function () {
			var closeButton = this.getAggregation('_closeButton');

			if (!closeButton) {
				closeButton = new Button({
					id: this.getId() + '-closeButton',
					text: this._closeButtonText,
					type: sap.m.ButtonType.Transparent,
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
		 * @returns {sap.m.BusyIndicator} - the BusyIndicator
		 * @private
		 */
		LightBox.prototype._getBusyIndicator = function () {
			var oBusy = this.getAggregation("_busy");
			if (!oBusy) {
				oBusy = new sap.m.BusyIndicator();
				this.setAggregation("_busy", oBusy, true);
			}

			return oBusy;
		};

		/**
		 * Forces rerendering of the control when an image loads/fails to load.
		 * @param {string} sNewState - the new state of the image possible values are "LOADING", "LOADED" and "ERROR"
		 * @private
		 */
		LightBox.prototype._imageStateChanged = function (sNewState) {
			if ((sNewState === sap.m.LightBoxLoadingStates.Loaded || sNewState === sap.m.LightBoxLoadingStates.Error) && !this._isRendering) {
				this.rerender();
			}
		};

		/**
		 * Creates the popup in which the LightBox is displayed and adds event handlers. Event handlers are necessary
		 * to close the popup when the user clicks on the overlay around the popup.
		 * @private
		 */
		LightBox.prototype._createPopup = function () {
			this._oPopup = new Popup(this, true, true);
			this._oPopup.attachOpened(this._fnOpened, this);
			this._oPopup.attachClosed(this._fnClosed, this);
		};

		/**
		 * Adds event listener to the blocklayer area to close the lightbox when the area is clicked.
		 * @private
		 */
		LightBox.prototype._fnOpened = function() {
			var that = this;
			jQuery('#sap-ui-blocklayer-popup').on("click", function() {
				that.close();
			});
		};

		/**
		 * Removes the event listener.
		 * @private
		 */
		LightBox.prototype._fnClosed = function() {
			jQuery('#sap-ui-blocklayer-popup').off("click");
		};

		/**
		 * Creates the controls used to display error state of the LightBox.
		 * @private
		 */
		LightBox.prototype._createErrorControls = function() {
			var resourceBundle = this._rb;
			var errorMessageTitle;
			var errorMessageSubtitle;

			if (this._getImageContent()._getImageState() === sap.m.LightBoxLoadingStates.TimeOutError) {
				errorMessageTitle = resourceBundle.getText('LIGHTBOX_IMAGE_TIMED_OUT');
				errorMessageSubtitle = resourceBundle.getText('LIGHTBOX_IMAGE_TIMED_OUT_DETAILS');
			} else {
				errorMessageTitle = resourceBundle.getText('LIGHTBOX_IMAGE_ERROR');
				errorMessageSubtitle = resourceBundle.getText('LIGHTBOX_IMAGE_ERROR_DETAILS');
			}

			if (!this.getAggregation('_verticalLayout')) {
				var errorTitle = new Text({
					text : errorMessageTitle,
					textAlign : sap.ui.core.TextAlign.Center
				}).addStyleClass("sapMLightBoxErrorTitle"),
					errorSubtitle = new Text({
						text : errorMessageSubtitle,
						textAlign : sap.ui.core.TextAlign.Center
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
		 * Handles the resize of the LightBox (usually caused by window resize)
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

			if (oImageContent._getImageState() === sap.m.LightBoxLoadingStates.Loaded) {
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
		 * Calculates the target size of the image and the lightbox based on the size of the image that will be loaded
		 * @param {window.Image} internalImage The javascript native object referring to the image that will be loaded
		 * @private
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
		 * Calculates the height of the footer of the LightBox in pixels
		 * @returns Number The height of the footer
		 * @private
		 */
		LightBox.prototype._calculateFooterHeightInPx = function (image) {
			var bCompact = this.$().parents().hasClass('sapUiSizeCompact');
			var subtitle = this._getImageContent().getSubtitle();

			var iFooterHeightRem = 2.5; // base height of the footer in rem

			if (!bCompact) {
				iFooterHeightRem += 0.5;
			}

			if (subtitle) {
				iFooterHeightRem += 1.5;
			}

			return iFooterHeightRem * 16; // 1rem == 16px
		};

		/**
		 * Calculates and sets in private properties the width and height of the LightBox
		 * @private
		 */
		LightBox.prototype._calculateAndSetLightBoxSize = function (image) {
			var imageHeight,
				lightBoxMinWidth = (20 /*rem*/ * 16 /*px*/),
				lightBoxMinHeight = (18 /*rem*/ * 16 /*px*/),
				iFooterHeightPx = this._calculateFooterHeightInPx();

			imageHeight = this._pxToNumber(image.getHeight());

			this._width = Math.max(lightBoxMinWidth, this._pxToNumber(image.getWidth()));
			this._height = Math.max(lightBoxMinHeight, imageHeight + iFooterHeightPx);
		};

		/**
		 * Calculates and sets the Image size in the Light box.
		 * @param {number} imageWidth The width of the internal image.
		 * @param {number} imageHeight The height of the internal image.
		 * @private
		 */
		LightBox.prototype._setImageSize = function (image, imageWidth, imageHeight) {
			var footerHeight = this._calculateFooterHeightInPx(),
				dimensions = this._getDimensions(imageWidth, imageHeight, footerHeight);

			image.setWidth(dimensions.width + 'px');
			image.setHeight(dimensions.height + 'px');
		};

		/**
		 * Calculates the size for an image inside the LightBox
		 * @param {number} imageWidth The natural width of the loaded images in px
		 * @param {number} imageHeight The natural height of the loaded images in px
		 * @param {number} footerHeight The footer height in px
		 * @param {jQuery} $window jQuery reference to the window object
		 * @returns {Object} An object holding the calculated dimensions of the image
		 * @private
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
		 * Converts size in px to a number
		 * @param {string} sizeToConvert The size to be converted
		 * @returns {number} The size in number value
		 * @private
		 */
		LightBox.prototype._pxToNumber = function (sizeToConvert) {
			return (sizeToConvert.substring(0, (sizeToConvert.length - 2)) ) * 1;
		};

		/**
		 * Returns the first LightBoxItem in the aggregation.
		 * @returns {sap.m.LightBoxItem|null}
		 * @private
		 */
		LightBox.prototype._getImageContent = function () {
			var rgImageContent = this.getAggregation('imageContent');

			return rgImageContent && rgImageContent[0];
		};

		function calculateOffset() {
			var system = sap.ui.Device.system;

			if (system.desktop) {
				return 4 /*rem*/ * 16 /*px*/;
			}

			if (system.tablet) {
				return 2 /*rem*/ * 16 /*px*/;
			}

			return 0;
		}

		return LightBox;
	}, /* bExport= */ true);