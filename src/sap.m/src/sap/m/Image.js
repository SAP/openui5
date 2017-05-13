/*!
 * ${copyright}
 */

// Provides control sap.m.Image.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new Image.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A wrapper around the IMG tag. The image can be loaded from a remote or local server.
	 *
	 * Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided. The valid desity values are 1, 1.5, 2. If the original devicePixelRatio isn't one of the three valid numbers, it's rounded up to the nearest one.
	 *
	 * There are various size setting options available, and the images can be combined with actions.
	 *
	 * From version 1.30, new image mode sap.m.ImageMode.Background is added. When this mode is set, the src property is set using the css style 'background-image'. The properties 'backgroundSize', 'backgroundPosition', 'backgroundRepeat' have effect only when image is in sap.m.ImageMode.Background mode. In order to make the high density image correctly displayed, the 'backgroundSize' should be set to the dimension of the normal density version.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Image
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Image = Control.extend("sap.m.Image", /** @lends sap.m.Image.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		properties : {

			/**
			 * Relative or absolute path to URL where the image file is stored. The path will be adapted to the density aware format according to the density of the device following the convention that [imageName]@[densityValue].[extension]
			 */
			src : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained. When 'mode' property is set to sap.m.ImageMode.Background, this property always needs to be set. Otherwise the output DOM element has a 0 size.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained. When 'mode' property is set to sap.m.ImageMode.Background, this property always needs to be set. Otherwise the output DOM element has a 0 size.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * A decorative image is included for design reasons. Accessibility tools will ignore decorative images.
			 *
			 * Note: If the Image has an image map (useMap is set), this property will be overridden (the image will not be rendered as decorative).
			 * A decorative image has no ALT attribute, so the Alt property is ignored if the image is decorative.
			 */
			decorative : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * The alternative text that is displayed in case the Image is not available, or cannot be displayed.
			 * If the image is set to decorative this property is ignored.
			 */
			alt : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * The name of the image map that defines the clickable areas
			 */
			useMap : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
			 *
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 *
			 * If bandwidth is the key for the application, set this value to false.
			 */
			densityAware : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * The source property which is used when the image is pressed.
			 */
			activeSrc : {type : "sap.ui.core.URI", group : "Data", defaultValue : ""},

			/**
			 * Defines how the src and the activeSrc is output to the Dom Element. When set to sap.m.ImageMode.Image which is the default value, the src (activeSrc) is set to the 'src' attribute of the 'img' tag. When set to sap.m.ImageMode.Background, the src (activeSrc) is set to the CSS style 'background-image' and the root DOM element is rendered as a 'span' tag instead of an 'img' tag.
			 * @since 1.30.0
			 */
			mode : {type : "sap.m.ImageMode", group : "Misc", defaultValue : "Image"},

			/**
			 * Defines the size of the image in sap.m.ImageMode.Background mode. This property is set on the output DOM element using CSS style 'background-size'. This property takes effect only when the 'mode' property is set to sap.m.ImageMode.Background.
			 * @since 1.30.0
			 */
			backgroundSize : {type : "string", group : "Appearance", defaultValue : "cover"},

			/**
			* Defines the position of the image in sap.m.ImageMode.Background mode. This property is set on the output DOM element using CSS style 'background-position'. This property takes effect only when the 'mode' property is set to sap.m.ImageMode.Background.
			* @since 1.30.0
			*/
			backgroundPosition : {type : "string", group : "Appearance", defaultValue : "initial"},

			/**
			* Defines whether the source image is repeated when the output DOM element is bigger than the source. This property is set on the output DOM element using CSS style 'background-repeat'. This property takes effect only when the 'mode' property is set to sap.m.ImageMode.Background.
			* @since 1.30.0
			*/
			backgroundRepeat : {type : "string", group : "Appearance", defaultValue : "no-repeat"}
		},
		aggregations : {
			/**
			 * A <code>sap.m.LightBox</code> instance, that will be opened automatically when the user interacts with the <code>Image</code> control.
			 *
			 * The <code>tap</code> event will still be fired.
			 * @public
			 */
			detailBox: {type: 'sap.m.LightBox', multiple: false, bindable: "bindable"}
		},
		events : {

			/**
			 * Event is fired when the user clicks on the control. (This event is deprecated, use the press event instead)
			 */
			tap : {},

			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {},

			/**
			 * Event is fired when the image resource is loaded.
			 * @since 1.36.2
			 */
			load : {},

			/**
			 * Event is fired when the image resource can't be loaded. If densityAware is set to true, the event is fired when none of the fallback resources can be loaded.
			 * @since 1.36.2
			 */
			error : {}
		},
		designTime: true
	}});

	Image._currentDevicePixelRatio = (function() {

		// if devicePixelRatio property is not available, value 1 is assumed by default.
		var ratio = (window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio);

		// for ratio in our library, only 1 1.5 2 are valid
		if (ratio <= 1) {
			ratio = 1;
		} else {

			// round it to the nearest valid value
			ratio *= 2;
			ratio = Math.round(ratio);
			ratio /= 2;
		}

		if (ratio > 2) {
			ratio = 2;
		}

		return ratio;
	}());

	/**
	 * Function is called when image is loaded successfully.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onload = function(oEvent) {
		var iWidth,
			iHeight;

		// This is used to fix the late load event handler problem on ios platform, if the event handler
		// has not been called right after image is loaded, event is triggered manually in onAfterRendering
		// method.
		if (!this._defaultEventTriggered) {
			this._defaultEventTriggered = true;
		}

		// reset the flag for the next rerendering
		this._bVersion2Tried = false;

		var $DomNode = this.$(),
			oDomRef = $DomNode[0];

		// set the src to the real dom node
		if (this.getMode() === sap.m.ImageMode.Background) {
			// In Background mode, the src is applied to the output DOM element only when the source image is finally loaded to the client side
			$DomNode.css("background-image", "url(\"" + this._oImage.src + "\")");
		}

		if (!this._isWidthOrHeightSet()) {
			if (this._iLoadImageDensity > 1) {
				iWidth = Math.round(oDomRef.getBoundingClientRect().width);
				iHeight = Math.round(oDomRef.getBoundingClientRect().height);

				if ((iWidth === oDomRef.naturalWidth) && (iHeight === oDomRef.naturalHeight)) {
					$DomNode.width(iWidth / this._iLoadImageDensity);
				}
			}
		}

		$DomNode.removeClass("sapMNoImg");

		this.fireLoad();
	};

	/**
	 * Function is called when error occurs during image loading.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onerror = function(oEvent) {

		// This is used to fix the late load event handler problem on ios platform, if the event handler
		// has not been called right after image is loaded with errors, event is triggered manually in onAfterRendering
		// method.
		if (!this._defaultEventTriggered) {
			this._defaultEventTriggered = true;
		}

		var $DomNode = this.$(),
			sMode = this.getMode(),
			// In Background mode, the src property should be read from the temp Image object
			sSrc = (sMode === sap.m.ImageMode.Image) ? $DomNode.attr("src") : this._oImage.src,
			d = Image._currentDevicePixelRatio,
			sCurrentSrc = this._isActiveState ? this.getActiveSrc() : this.getSrc();

		$DomNode.addClass("sapMNoImg");

		// if src is empty or there's no image existing, just stop
		if (!sSrc || this._iLoadImageDensity === 1) {
			// remove the "sapMNoImg" in order to show the alt text
			$DomNode.removeClass("sapMNoImg");
			this.fireError();
			return;
		}

		if (d === 2 || d < 1) {
			// load the default image
			this._iLoadImageDensity = 1;
			this._updateDomSrc(this._generateSrcByDensity(sCurrentSrc, 1));
		} else if (d === 1.5) {
			if (this._bVersion2Tried) {
				setTimeout(jQuery.proxy(function() {
					// if version 2 isn't on the server, load the default image
					this._iLoadImageDensity = 1;
					this._updateDomSrc(this._generateSrcByDensity(sCurrentSrc, 1));
				}, this), 0);
			} else {
				setTimeout(jQuery.proxy(function() {
					// special treatment for density 1.5
					// verify if the version for density 2 is provided or not
					this._iLoadImageDensity = 2;
					this._updateDomSrc(this._generateSrcByDensity(sCurrentSrc, 2));
					this._bVersion2Tried = true;
				}, this), 0);
			}
		}
	};

	/**
	 * Sets the <code>detailBox</code> aggregation.
	 * @param {sap.m.LightBox|undefined} oLightBox - Instance of the <code>LightBox</code> control or undefined
	 * @returns {object} <code>this</code> for chaining
	 * @override
	 * @public
	 */
	Image.prototype.setDetailBox = function (oLightBox) {
		var oCurrentDetailBox = this.getDetailBox();

		if (oLightBox) {
			// In case someone try's to set the same LightBox twice we don't do anything
			if (oLightBox === oCurrentDetailBox) {
				return this;
			}

			// If we already have a LightBox detach old one's event
			if (oCurrentDetailBox) {
				this.detachPress(this._fnLightBoxOpen, oCurrentDetailBox);
			}

			// Bind the LightBox open method to the press event of the Image
			this._fnLightBoxOpen = oLightBox.open;
			this.attachPress(this._fnLightBoxOpen, oLightBox);
		} else if (this._fnLightBoxOpen) {
			// If there was a LightBox - cleanup
			this.detachPress(this._fnLightBoxOpen, oCurrentDetailBox);
			this._fnLightBoxOpen = null;
		}

		return this.setAggregation("detailBox", oLightBox);
	};

	/**
	 * the 'beforeRendering' event handler
	 * @private
	 */
	Image.prototype.onBeforeRendering = function() {
		this._defaultEventTriggered = false;
	};

	/**
	 * This function is called to register event handlers for load and error event on the image DOM after it's rendered.
	 * It also check if the event handlers are called accordingly after the image is loaded, if not the event handlers are triggered
	 * manually.
	 *
	 * @private
	 */
	Image.prototype.onAfterRendering = function() {
		var $DomNode = this.$(),
			sMode = this.getMode(),
			oDomImageRef;

		if (sMode === sap.m.ImageMode.Image) {
			// bind the load and error event handler
			$DomNode.on("load", jQuery.proxy(this.onload, this));
			$DomNode.on("error", jQuery.proxy(this.onerror, this));

			oDomImageRef = $DomNode[0];
		}

		if (sMode === sap.m.ImageMode.Background) {
			oDomImageRef = this._oImage;
		}

		// if image has already been loaded and the load or error event handler hasn't been called, trigger it manually.
		if (oDomImageRef && oDomImageRef.complete && !this._defaultEventTriggered) {
			// need to use the naturalWidth property instead of jDomNode.width(),
			// the later one returns positive value even in case of broken image
			if (oDomImageRef.naturalWidth > 0) {
				this.onload({/* empty event object*/});
			} else {
				this.onerror({/* empty event object*/});
			}
		}
	};

	Image.prototype.exit = function() {
		if (this._oImage) {
			// deregister the events from the window.Image object
			jQuery(this._oImage).off("load", this.onload).off("error", this.onerror);
			this._oImage = null;
		} else {
			this.$().off("load", this.onload).off("error", this.onerror);
		}

		if (this._fnLightBoxOpen) {
			this._fnLightBoxOpen = null;
		}
	};

	/**
	 * This binds to the touchstart event to change the src property of the image to the activeSrc.
	 *
	 * @private
	 */
	Image.prototype.ontouchstart = function(oEvent) {
		if (oEvent.srcControl.mEventRegistry["press"] || oEvent.srcControl.mEventRegistry["tap"]) {
			// mark the event for components that needs to know if the event was handled by the Image
			oEvent.setMarked();
		}

		if (oEvent.targetTouches.length === 1 && this.getActiveSrc()) {
			// change the source only when the first finger is on the image, the following fingers doesn't affect
			this._updateDomSrc(this._getDensityAwareActiveSrc());
			this._isActiveState = true;
		}
	};

	/**
	 * This changes the src property of the image back to the src property of the image control.
	 *
	 * @private
	 */
	Image.prototype.ontouchend = function(oEvent) {
		// change the source back only when all fingers leave the image
		// avoid setting the normal state src again when there's no activeSrc property set
		if (oEvent.targetTouches.length === 0 && this.getActiveSrc()) {
			this._isActiveState = false;
			this._updateDomSrc(this._getDensityAwareSrc());
			this.$().removeClass("sapMNoImg");
		}
	};

	/**
	 * This overrides the default setter of the src property and update the dom node.
	 *
	 * @param {sap.ui.core.URI} sSrc
	 * @public
	 */
	Image.prototype.setSrc = function(sSrc) {
		if (sSrc === this.getSrc()) {
			return this;
		}

		this.setProperty("src", sSrc, true);

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			this._updateDomSrc(this._getDensityAwareSrc());
		}

		return this;
	};

	/**
	 * This overrides the default setter of the activeSrc property in order to avoid the rerendering.
	 *
	 * @param {sap.ui.core.URI} sActiveSrc
	 * @returns {sap.m.Image} <code>this</code> pointer for chaining
	 * @public
	 */
	Image.prototype.setActiveSrc = function(sActiveSrc) {
		if (!sActiveSrc) {
			sActiveSrc = "";
		}
		return this.setProperty("activeSrc", sActiveSrc, true);
	};

	Image.prototype.attachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		sap.ui.core.Control.prototype.attachEvent.apply(this, arguments);

		if (this.hasListeners("press")) {
			this.$().attr("tabindex", "0");
			this.$().attr("role", "button");
		}

		return this;
	};

	Image.prototype.detachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		sap.ui.core.Control.prototype.detachEvent.apply(this, arguments);

		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex");
			if (this.getDecorative()) {
				this.$().attr("role", "presentation");
			} else {
				this.$().removeAttr("role");
			}
		}

		return this;
	};

	/**
	 * Function is called when image is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.ontap = function(oEvent) {
		this.fireTap({/* no parameters */}); //	(This event is deprecated, use the press event instead)
		this.firePress({/* no parameters */});
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Image.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.firePress({/* no parameters */});

			// stop the propagation it is handled by the control
			oEvent.stopPropagation();
		}
	};

	/**
	* Update the source image either on the output DOM element (when in sap.m.ImageMode.Image mode) or on the window.Image object (when in sap.m.ImageMode.Background mode)
	* @private
	*/
	Image.prototype._updateDomSrc = function(sSrc) {
		var $DomNode = this.$(),
			sMode = this.getMode();

		if ($DomNode.length) {
			// the src is updated on the output DOM element when mode is set to Image
			// the src is updated on the temp Image object when mode is set to Background
			if (sMode === sap.m.ImageMode.Image) {
				$DomNode.attr("src", sSrc);
			} else {
				$DomNode.addClass("sapMNoImg");
				jQuery(this._oImage).attr("src", sSrc);
			}
		}
	};

	/**
	* When sap.m.ImageMode.Background mode is set, the availability of the source image (including the high density version) is checked via the window.Image object. Because when source
	* image is set via 'background-image' CSS style, browser doesn't fire 'load' or 'error' event anymore. These two events can still be fired when the source uri is set to an instance
	* of window.Image.
	*
	* @private
	*/
	Image.prototype._preLoadImage = function(sSrc) {
		if (this.getMode() !== sap.m.ImageMode.Background) {
			return;
		}

		var $InternalImage = jQuery(this._oImage);

		if (!this._oImage) {
			this._oImage = new window.Image();
			// register to the 'load' and 'error' events
			$InternalImage = jQuery(this._oImage);
			$InternalImage.on("load", jQuery.proxy(this.onload, this)).on("error", jQuery.proxy(this.onerror, this));
		}

		this._oImage.src = sSrc;
	};

	/**
	 * Test if at least one of the width and height properties is set.
	 *
	 * @private
	 */
	Image.prototype._isWidthOrHeightSet = function() {
		return (this.getWidth() && this.getWidth() !== '') || (this.getHeight() && this.getHeight() !== '');
	};

	/**
	 * This function returns the density aware source based on the deviceDensityRatio value.
	 * The return value is in the format [src]@[densityValue].[extension] if the densityValue not equal 1, otherwise it returns the src property.
	 *
	 * @private
	 */
	Image.prototype._getDensityAwareSrc = function() {
		var sSrc = this.getSrc(),
			bDensityAware = this.getDensityAware(),
			d = bDensityAware ? Image._currentDevicePixelRatio : 1;

		// this property is used for resizing the higher resolution image when image is loaded.
		this._iLoadImageDensity = d;

		// if the currect density equals 1, simply return the src property
		if (d === 1) {
			return sSrc;
		}

		return this._generateSrcByDensity(sSrc, d);
	};

	/**
	 * This function returns the density aware version of the Active source base on the deviceDensityRatio value.
	 *
	 * @private
	 */
	Image.prototype._getDensityAwareActiveSrc = function() {
		var sActiveSrc = this.getActiveSrc(),
			bDensityAware = this.getDensityAware(),
			d = bDensityAware ? Image._currentDevicePixelRatio : 1;

		// this property is used for resizing the higher resolution image when image is loaded.
		this._iLoadImageDensity = d;

		// if the currect density equals 1, simply return the src property
		if (d === 1) {
			return sActiveSrc;
		}

		return this._generateSrcByDensity(sActiveSrc, d);
	};

	/**
	 * This function generates the density aware version of the src property according to the iDensity provided.
	 * It returns the density aware version of the src property.
	 *
	 * @private
	 */
	Image.prototype._generateSrcByDensity = function(sSrc, iDensity) {
		if (!sSrc) {
			return "";
		}

		// if src is in data uri format, disable the density handling
		if (this._isDataUri(sSrc)) {
			this._iLoadImageDensity = 1;
			return sSrc;
		}

		if (iDensity === 1) {
			return sSrc;
		}

		var iLastDotPos = sSrc.lastIndexOf("."),
			iLastSlashPos = sSrc.lastIndexOf("/"),
			sName = sSrc.substring(0, iLastDotPos),
			sExtension = sSrc.substring(iLastDotPos);

		// if there's no extension
		// or there's slash after the last dot, this means that the dot may come from the host name
		if (iLastDotPos === -1 || (iLastSlashPos > iLastDotPos)) {
			return sSrc + "@" + iDensity;
		}

		sName = sName + "@" + iDensity;
		return sName + sExtension;
	};

	Image.prototype._isDataUri = function(src) {
		return src ? src.indexOf("data:") === 0 : false;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Image.prototype.getAccessibilityInfo = function() {
		var bHasPressListeners = this.hasListeners("press");

		if (this.getDecorative() && !this.getUseMap() && !bHasPressListeners) {
			return null;
		}

		return {
			role: bHasPressListeners ? "button" : "img",
			type: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText(bHasPressListeners ? "ACC_CTR_TYPE_BUTTON" : "ACC_CTR_TYPE_IMAGE"),
			description: this.getAlt() || this.getTooltip_AsString() || "",
			focusable: bHasPressListeners
		};
	};

	/*
	 * Image must not be stretched in Form because should have its original size.
	 */
	Image.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};


	return Image;

}, /* bExport= */ true);
