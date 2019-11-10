/*!
 * ${copyright}
 */

// Provides control sap.m.Image.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/base/DataType',
	'./ImageRenderer',
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/encodeCSS"
],
	function(library, Control, DataType, ImageRenderer, KeyCodes, jQuery, encodeCSS) {
	"use strict";



	// shortcut for sap.m.ImageMode
	var ImageMode = library.ImageMode;



	/**
	 * Constructor for a new Image.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A wrapper around the &lt;img&gt; tag; the image can be loaded from a remote or local server.
	 *
	 * If property <code>densityAware</code> is true, a density-specific image will be loaded by constructing
	 * a density-specific image name in format <code>[imageName]@[densityValue].[extension]</code> from the
	 * given <code>src</code> and the <code>devicePixelRatio</code> of the current device. The only supported
	 * density values are 1, 1.5 and 2. If the original <code>devicePixelRatio</code> ratio isn't one of the
	 * three valid numbers, it will be rounded to the nearest one.
	 *
	 * There are various size setting options available, and the images can be combined with actions.
	 *
	 * From version 1.30, a new image mode {@link sap.m.ImageMode.Background} is added. When this mode
	 * is set, the <code>src</code> property is set using the CSS style <code>background-image</code>.
	 * The properties <code>backgroundSize</code>, <code>backgroundPosition</code>, and <code>backgroundRepeat</code>
	 * take effect only when the image is in <code>sap.m.ImageMode.Background</code> mode. In order to display
	 * the high density image correctly, the <code>backgroundSize</code> should be set to the dimension of the
	 * normal density version.
	 *
	 * @see {@link topic:f86dbe9d7f7d48dea5286003b1322165 Image}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/image/ Image}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.m.Image
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Image = Control.extend("sap.m.Image", /** @lends sap.m.Image.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		designtime: "sap/m/designtime/Image.designtime",
		properties : {

			/**
			 * Relative or absolute path to URL where the image file is stored.
			 *
			 * The path will be adapted to the density-aware format according to the density of the device
			 * following the naming convention [imageName]@[densityValue].[extension].
			 */
			src : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed.
			 *
			 * It is also possible to make settings for width or height only, in which case the original
			 * ratio between width/height is maintained. When the <code>mode</code> property is set to
			 * <code>sap.m.ImageMode.Background</code>, this property always needs to be set.
			 * Otherwise the output DOM element has a 0 size.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed.
			 *
			 * It is also possible to make settings for width or height only, in which case the original
			 * ratio between width/height is maintained. When the <code>mode</code> property is set to
			 * <code>sap.m.ImageMode.Background</code>, this property always needs to be set.
			 * Otherwise the output DOM element has a 0 size.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * A decorative image is included for design reasons; accessibility tools will ignore decorative images.
			 *
			 * Note: If the image has an image map (<code>useMap</code> is set), this property will be overridden
			 * (the image will not be rendered as decorative). A decorative image has no <code>ALT</code> attribute,
			 * so the <code>alt</code> property is ignored if the image is decorative.
			 */
			decorative : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * The alternative text that is displayed in case the image is not available, or cannot be displayed.
			 *
			 * If the image is set to decorative, this property is ignored.
			 */
			alt : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * The name of the image map that defines the clickable areas.
			 */
			useMap : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If this is set to <code>true</code>, one or more network requests will be made
			 * that try to obtain the density perfect version of the image.
			 *
			 * By default, this is set to <code>false</code>, so the <code>src</code> image is loaded
			 * directly without attempting to fetch the density perfect image for high-density devices.
			 *
			 * <b>Note:</b> Before 1.60, the default value was set to <code>true</code>, which
			 * brought redundant network requests for apps that used the default but did not
			 * provide density perfect image versions on server-side.
			 * You should set this property to <code>true</code> only if you also provide the
			 * corresponding image versions for high-density devices.
			 */
			densityAware : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * The source property which is used when the image is pressed.
			 */
			activeSrc : {type : "sap.ui.core.URI", group : "Data", defaultValue : ""},

			/**
			 * Defines how the <code>src</code> and the <code>activeSrc</code> is output to the DOM Element.
			 *
			 * When set to <code>sap.m.ImageMode.Image</code>, which is the default value, the <code>src</code>
			 * (<code>activeSrc</code>) is set to the <code>src</code> attribute of the &lt;img&gt; tag. When
			 * set to <code>sap.m.ImageMode.Background</code>, the <code>src</code> (<code>activeSrc</code>)
			 * is set to the CSS style <code>background-image</code> and the root DOM element is rendered as a
			 * &lt;span&gt; tag instead of an &lt;img&gt; tag.
			 * @since 1.30.0
			 */
			mode : {type : "sap.m.ImageMode", group : "Misc", defaultValue : "Image"},

			/**
			 * Defines the size of the image in <code>sap.m.ImageMode.Background</code> mode.
			 *
			 * This property is set on the output DOM element using the CSS style <code>background-size</code>.
			 * It takes effect only when the <code>mode</code> property is set to <code>sap.m.ImageMode.Background</code>.
			 * @since 1.30.0
			 */
			backgroundSize : {type : "string", group : "Appearance", defaultValue : "cover"},

			/**
			* Defines the position of the image in <code>sap.m.ImageMode.Background</code> mode.
			*
			* This property is set on the output DOM element using the CSS style <code>background-position</code>.
			* It takes effect only when the <code>mode</code> property is set to <code>sap.m.ImageMode.Background</code>.
			* @since 1.30.0
			*/
			backgroundPosition : {type : "string", group : "Appearance", defaultValue : "initial"},

			/**
			* Defines whether the source image is repeated when the output DOM element is bigger than the source.
			*
			* This property is set on the output DOM element using the CSS style <code>background-repeat</code>.
			* It takes effect only when the <code>mode</code> property is set to <code>sap.m.ImageMode.Background</code>.
			* @since 1.30.0
			*/
			backgroundRepeat : {type : "string", group : "Appearance", defaultValue : "no-repeat"}
		},
		aggregations : {
			/**
			 * A <code>sap.m.LightBox</code> instance that will be opened automatically when the user interacts
			 * with the <code>Image</code> control.
			 *
			 * The <code>tap</code> event will still be fired.
			 */
			detailBox: {type: 'sap.m.LightBox', multiple: false, bindable: "bindable"}
		},
		associations : {
			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledBy).
			 */
			ariaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
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
		dnd: { draggable: true, droppable: false }
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
		if (this.getMode() === ImageMode.Background) {
			// In Background mode, the src is applied to the output DOM element only when the source image is finally loaded to the client side
			$DomNode.css("background-image", "url(\"" + encodeCSS(this._oImage.src) + "\")");
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
			sSrc = (sMode === ImageMode.Image) ? this._getDomImg().attr("src") : this._oImage.src,
			d = Image._currentDevicePixelRatio,
			sCurrentSrc = this._isActiveState ? this.getActiveSrc() : this.getSrc();

		$DomNode.addClass("sapMNoImg");

		// if src is empty or there's no image existing, just stop
		if (!sSrc || this._iLoadImageDensity === 1) {
			// BCP: 1880526262
			if (this.getAlt() && !this.getDecorative()) {
				// remove the "sapMNoImg" in order to show the alt text
				$DomNode.removeClass("sapMNoImg");
			}
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

	/*
	 * @override
	 */
	Image.prototype.clone = function () {
		var oClone = Control.prototype.clone.apply(this, arguments),
			oCloneDetailBox = oClone.getDetailBox();

		// Handle press event if DetailBox is available
		if (oCloneDetailBox) {

			// Detach the old event
			oClone.detachPress(this._fnLightBoxOpen, this.getDetailBox());

			// Attach new event with the cloned detail box
			oClone._fnLightBoxOpen = oCloneDetailBox.open;
			oClone.attachPress(oClone._fnLightBoxOpen, oCloneDetailBox);

		}

		return oClone;
	};

	/**
	 * the 'beforeRendering' event handler
	 * @private
	 */
	Image.prototype.onBeforeRendering = function() {
		this._defaultEventTriggered = false;
		if (this.getMode() == ImageMode.Image) {
			var $DomNode = this.getDetailBox() ? this.$().find(".sapMImg") : this.$();
			$DomNode.off("load").off("error");
		}
	};

	/**
	 * This function is called to register event handlers for load and error event on the image DOM after it's rendered.
	 * It also check if the event handlers are called accordingly after the image is loaded, if not the event handlers are triggered
	 * manually.
	 *
	 * @private
	 */
	Image.prototype.onAfterRendering = function() {
		// BCP 1870456103. Error should be thrown when we have invalid src and DetailBox present.
		var $DomNode = this.getDetailBox() ? this.$().find(".sapMImg") : this.$(),
			sMode = this.getMode(),
			oDomImageRef;

		if (sMode === ImageMode.Image) {
			// bind the load and error event handler
			$DomNode.on("load", jQuery.proxy(this.onload, this));
			$DomNode.on("error", jQuery.proxy(this.onerror, this));

			oDomImageRef = $DomNode[0];
		}

		if (sMode === ImageMode.Background) {
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

	Image.prototype.attachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.attachEvent.apply(this, arguments);

		if (this.hasListeners("press")) {
			this.$().attr("tabindex", "0");
			this.$().attr("role", "button");
		}

		return this;
	};

	Image.prototype.detachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.detachEvent.apply(this, arguments);

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
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			this.firePress({/* no parameters */});

			// stop the propagation it is handled by the control
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the keydown event for SPACE on which we have to prevent the browser scrolling.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Image.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
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
			if (sMode === ImageMode.Image) {
				this._getDomImg().attr("src", sSrc);
			} else {
				$DomNode.addClass("sapMNoImg");
				jQuery(this._oImage).attr("src", sSrc);
			}
		}
	};

	/**
	 * Returns the img Dom element
	 * @private
	 */
	Image.prototype._getDomImg = function() {
		var $DomNode = this.$();

		return this.getDetailBox() ? $DomNode.children("img") : $DomNode;
	};

	/**
	* When sap.m.ImageMode.Background mode is set, the availability of the source image (including the high density version) is checked via the window.Image object. Because when source
	* image is set via 'background-image' CSS style, browser doesn't fire 'load' or 'error' event anymore. These two events can still be fired when the source uri is set to an instance
	* of window.Image.
	*
	* @private
	*/
	Image.prototype._preLoadImage = function(sSrc) {
		if (this.getMode() !== ImageMode.Background) {
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

        // if the density equals 1, simply return the src property
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
	 * Checks if the given value is valid for the <code>background-size</code>
	 * CSS property
	 *
	 * @param {string} sValue the value to check
	 * @protected
	 * @returns {boolean} the check result
	 */
	Image.prototype._isValidBackgroundSizeValue = function (sValue) {
		var whitespaceRegEx = /\s+/g;

		// compress whitespace
		sValue = jQuery.trim(sValue).replace(whitespaceRegEx, " ");

		return isSubSet(sValue.split(" "), ["auto", "cover", "contain", "initial"])
			|| DataType.getType("sap.ui.core.CSSSizeShortHand").isValid(sValue);
	};

	/**
	 * Checks if the given value is valid for the <code>background-position</code>
	 * CSS property
	 *
	 * @param {string} sValue the value to check
	 * @protected
	 * @returns {boolean} the check result
	 */
	Image.prototype._isValidBackgroundPositionValue = function (sValue) {
		var whitespaceRegEx = /\s+/g;

		// compress whitespace
		sValue = jQuery.trim(sValue).replace(whitespaceRegEx, " ");

		return isSubSet(sValue.split(" "), ["left", "right", "top", "center", "bottom", "initial"])
			|| DataType.getType("sap.ui.core.CSSSizeShortHand").isValid(sValue);
	};

	/**
	 * Returns the <code>sap.m.Image</code>  accessibility information.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {Object} The <code>sap.m.Image</code> accessibility information
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

	/**
	 * @see sap.ui.core.Element.prototype.getFocusDomRef
	 * @private
	 */
	Image.prototype.getFocusDomRef = function() {
		return this.getDomRef("inner") || this.getDomRef();
	};

	/*
	 * Image must not be stretched in Form because should have its original size.
	 */
	Image.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};

	/**
	 * Utility function that checks if the content of an array
	 * is a subset of the content of a second (reference) array
	 */
	function isSubSet (aTestArray, aRefArray) {
		function isOutsideSet(sTestValue) {
			return aRefArray.indexOf(sTestValue) < 0; // value is not part of the reference set
		}
		return aTestArray && aRefArray && !aTestArray.some(isOutsideSet);
	}


	return Image;

});