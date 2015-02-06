/*!
 * ${copyright}
 */

// Provides control sap.m.BusyIndicator.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Control, Parameters) {
	"use strict";


	
	/**
	 * Constructor for a new BusyIndicator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Control to indicate that the system is busy with some task and the user has to wait.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.BusyIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BusyIndicator = Control.extend("sap.m.BusyIndicator", /** @lends sap.m.BusyIndicator.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Defines the text displayed next to the busy indicator (optional)
			 */
			text : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Set to false to make the control invisible.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Icon URL if an icon is used as the busy indicator.
			 */
			customIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * Defines the rotation speed of the given image. If a .gif is used, the speed has to be set to 0. The unit is in ms.
			 */
			customIconRotationSpeed : {type : "int", group : "Appearance", defaultValue : 1000},
	
			/**
			 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
			 * 
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			customIconDensityAware : {type : "boolean", defaultValue : true},
	
			/**
			 * Width of the provided icon. By default 44px are used.
			 */
			customIconWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},
	
			/**
			 * Height of the provided icon. By default 44px are used.
			 */
			customIconHeight : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},
	
			/**
			 * Defines the size of the busy indicator.
			 */
			size : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},
	
			/**
			 * The design defines how the BusyIndicator should look like. There are 3 possibilities:
			 * auto: automatically sets the design according to the context
			 * dark: dark theme, useful within a light context
			 * light: light theme, useful within a dark context
			 */
			design : {type : "string", group : "Appearance", defaultValue : 'auto'}
		},
		associations: {
			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.27.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		aggregations : {
	
			/**
			 * The hidden aggregation for internal maintained icon image.
			 */
			_iconImage : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}, 
	
			/**
			 * The hidden aggregation for internal maintained busy label.
			 */
			_busyLabel : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		}
	}});
	
	
	BusyIndicator.prototype.init = function(){
		// Blue crystal design: rotating arc
		// bugs.webkit.org: id=82647, id=74801 dynamically created SVG does not animate
		// do not use SVG in ios and android < 4.2 
		if (sap.ui.Device.browser.chrome
				|| sap.ui.Device.os.blackberry
				|| sap.ui.Device.os.android && sap.ui.Device.os.version > 4.1) {
			// Browsers with correct SMIL animation show SVG (crisp rendering)
			this._bUseSvg = true;
		} else {
			// Fall-back for other browsers: show canvas animation (aliased rendering)
			this._bUseCanvas = true;
		}
	
		this._sBColor = Parameters.get("sapUiPageBG") || "rgba(0, 0, 0, 0)";
	};
	
	BusyIndicator.prototype.exit = function(){
		this._cancelAnimation();
	};
	
	// Request canvas animation
	if (window.requestAnimationFrame) {
		BusyIndicator.prototype._requestAnimation = function(fCallback){
			return window.requestAnimationFrame(fCallback);
		};
	} else if (window.webkitRequestAnimationFrame) {
		BusyIndicator.prototype._requestAnimation = function(fCallback, oDOM){
			return window.webkitRequestAnimationFrame(fCallback, oDOM);
		};
	} else if (window.mozRequestAnimationFrame) {
		BusyIndicator.prototype._requestAnimation = function(fCallback){
			return window.mozRequestAnimationFrame(fCallback);
		};
	} else {
		BusyIndicator.prototype._requestAnimation = function(fCallback){
			return window.setTimeout(fCallback, 1000 / 60);
		};
	}
	
	// Stop canvas animation
	BusyIndicator.prototype._cancelAnimation = function(){
		if (!this._animationId) { return;}
	
		if (window.cancelAnimationFrame) {
			window.cancelAnimationFrame(this._animationId);
		} else if (window.webkitCancelAnimationFrame) {
			window.webkitCancelAnimationFrame(this._animationId);
		} else if (window.mozCancelAnimationFrame) {
			window.mozCancelAnimationFrame(this._animationId);
		} else {
			window.clearTimeout(this._animationId);
		}
		this._animationId = undefined;
	};
	
	// Do the next animation step
	BusyIndicator.prototype._animateCanvas = function(){
		if (!this.oCanvas) { return; }
	
		var clientWidth = this.oCanvas.clientWidth,
			clientHeight = this.oCanvas.clientHeight;
	
		if (!this.getVisible() || !clientWidth || !clientHeight) {
				// if the indicator becomes invisible, client width and height are set to 0.
				// Stop animation
				this._animationId = undefined;
				return;
		}
	
		// Adjust the canvas size to avoid aliasing artifacts
		// This is needed only once after first rendering and only for custom size
		if (clientWidth != this.oCanvas.width) {
			this.oCanvas.setAttribute("width", clientWidth);
		}
		if (clientHeight != this.oCanvas.height) {
			this.oCanvas.setAttribute("height", clientHeight);
		}
	
		var context = this.oCanvas.getContext("2d"),
			w = this.oCanvas.width,
			h = this.oCanvas.height,
			x = Math.round(w / 2),
			y = Math.round(h / 2),
			r = Math.round(x * 0.7),
			t = new Date(),
			startAngle = 0.9 * (t.getSeconds() + t.getMilliseconds() / 1000) * 2 * Math.PI,
			endAngle = startAngle + 1.25 * Math.PI, // 225 grad
			counterClock = false,
			strokeStyle = window.getComputedStyle(this.oCanvas).color,
			lineWidth = Math.round(w / 10) * 2;
	
		context.clearRect(0,0,w,h);
	
		// clearRect does not clear canvas in Android browser 4.1,
		// workaround: draw a white circle underneath
		if (sap.ui.Device.os.android && sap.ui.Device.os.version == 4.1 && !sap.ui.Device.browser.chrome) {
			context.strokeStyle = this._sBColor;
			context.lineWidth = lineWidth + 2;
			context.beginPath();
			context.arc(x, y, r, 0, 2 * Math.PI);
			context.stroke();
		}
	
		context.strokeStyle = strokeStyle;
		context.lineWidth = lineWidth;
		context.beginPath();
		context.arc(x, y, r, startAngle, endAngle, counterClock);
		context.stroke();
	
		this._animationId = this._requestAnimation(this._fAnimateCallback, this.oCanvas);
	};
	
	// Start the canvas based animation
	BusyIndicator.prototype._doCanvas = function(){
		this.oCanvas = this.getDomRef("canvas");
		this._fAnimateCallback = jQuery.proxy(this._animateCanvas, this);
		this._animationId = this._requestAnimation(this._fAnimateCallback, this.oCanvas);
	};
	
	// Start/stop SVG animation
	// Though SVG animates itself, stop it when invisible to avoid unneeded layer updates
	BusyIndicator.prototype._setSvg = function(){
		var oSvg = this.getDomRef("svg");
		if (oSvg) {
			if ( this.getVisible() ) {
				oSvg.unpauseAnimations();
			} else {
				oSvg.pauseAnimations();
			}
		}
	};
	
	// Create internal icon image
	BusyIndicator.prototype._createCustomIcon = function(sName, sValue){
		var that = this;
		if (!this._iconImage) {
			this._iconImage = new sap.m.Image(this.getId() + "-icon", {
					width: "44px",
					height: "44px"
				}).addStyleClass('sapMBsyIndIcon');
			this._iconImage.addDelegate({onAfterRendering : function() {
					that._setRotationSpeed();
				}
			});
			this.setAggregation("_iconImage", this._iconImage, true);
		}
		this._iconImage[sName](sValue);
		this._setRotationSpeed();
	};
	
	// Create internal label
	BusyIndicator.prototype._createLabel = function(sName, sValue){
		if (!this._oLabel) {
			this._oLabel = new sap.m.Label(this.getId() + "-label", {labelFor: this.getId()}).addStyleClass("sapMBsyIndLabel");
			this.setAggregation("_busyLabel", this._oLabel);
		}
		this._oLabel[sName](sValue);
	};
	
	// Set the rotation speed of the image
	BusyIndicator.prototype._setRotationSpeed = function(){
	
		if (!this._iconImage) {
			return;
		}
	
		if (jQuery.support.cssAnimations) {
			var $icon = this._iconImage.$();
			var sRotationSpeed = this.getCustomIconRotationSpeed() + "ms";
			$icon.css("-webkit-animation-duration", sRotationSpeed)
				.css("animation-duration", sRotationSpeed);
			//Bug in Chrome: After changing height of image -> changing the rotationspeed will have no affect
			//chrome needs a rerendering of this element.
			$icon.css("display", "none");
			setTimeout(function() {
				$icon.css("display", "inline");
			}, 0);
		} else { // IE9
			this._rotateCustomIcon();
		}
	};
	
	//Animate custom icon in IE9
	BusyIndicator.prototype._rotateCustomIcon = function(){
	
		if (!this._iconImage) {
			return;
		}
		var $icon = this._iconImage.$();
	
		// stop if the custom icon is not available or hidden:
		if (!$icon[0] || !$icon[0].offsetWidth) {
			return;
		}
	
		var iRotationSpeed = this.getCustomIconRotationSpeed();
		if (!iRotationSpeed) {
			return;
		}
	
		if (!this._fnRotateCustomIcon) {
			this._fnRotateCustomIcon = jQuery.proxy(this._rotateCustomIcon, this);
		}
		var fnRotateCustomIcon = this._fnRotateCustomIcon;
	
		if (!this._$CustomRotator) {
			this._$CustomRotator = jQuery({deg: 0});
		}
		var $rotator = this._$CustomRotator;
	
		if ($rotator.running) {
			return;
		}
	
		// restart animation
		$rotator[0].deg = 0;
	
		$rotator.animate({deg: 360}, {
			duration: iRotationSpeed,
			easing: "linear",
			step: function(now) {
				$rotator.running = true;
				$icon.css("-ms-transform", 'rotate(' + now + 'deg)');
			},
			complete: function(){
				$rotator.running = false;
				window.setTimeout(fnRotateCustomIcon, 10);
			}
		});
	};
	
	BusyIndicator.prototype.onBeforeRendering = function(){
		this._cancelAnimation();
	};
	
	BusyIndicator.prototype.onAfterRendering = function(){
		// SVG animates itself, canvas animates by JavaScript:
		if (this._bUseCanvas) {
			this._doCanvas();
		} else {
			this._setSvg();
		}
	};
	
	BusyIndicator.prototype.setText = function(sText){
		this.setProperty("text", sText, true);
		this._createLabel("setText", sText);
		return this;
	};
	
	BusyIndicator.prototype.setTextDirection = function(sDirection){
		this.setProperty("textDirection", sDirection, true);
		this._createLabel("setTextDirection", sDirection);
		return this;
	};
	
	BusyIndicator.prototype.setCustomIcon = function(iSrc){
		this.setProperty("customIcon", iSrc, false);
		this._createCustomIcon("setSrc", iSrc);
		return this;
	};
	
	BusyIndicator.prototype.setCustomIconRotationSpeed = function(iSpeed){
		if (isNaN(iSpeed) || iSpeed < 0) {
			iSpeed = 0;
		}
		if (iSpeed !== this.getCustomIconRotationSpeed()) {
			this.setProperty("customIconRotationSpeed", iSpeed, true);
			this._setRotationSpeed();
		}
		return this;
	};
	
	BusyIndicator.prototype.setCustomIconDensityAware = function(bAware){
		this.setProperty("customIconDensityAware", bAware, true);
		this._createCustomIcon("setDensityAware", bAware);
		return this;
	};
	
	BusyIndicator.prototype.setCustomIconWidth = function(sWidth){
		this.setProperty("customIconWidth", sWidth, true);
		this._createCustomIcon("setWidth", sWidth);
		return this;
	};
	
	BusyIndicator.prototype.setCustomIconHeight = function(sHeight){
		this.setProperty("customIconHeight", sHeight, true);
		this._createCustomIcon("setHeight", sHeight);
		return this;
	};
	
	BusyIndicator.prototype.setDesign = function(sDesign) {
		this.setProperty("design", sDesign, true);
		this.$().toggleClass("sapMBusyIndicatorLight", (this.getDesign() === "light"));
		this.$().toggleClass("sapMBusyIndicatorDark", (this.getDesign() === "dark"));
		return this;
	};
	
	/**
	 * Setter for property <code>visible</code>.
	 *
	 * Default value is <code>true</code>
	 *
	 * The default implementation of the "setVisible" function is enhanced 
	 * in order to toggle the "visibility:hidden;" attribute over the control.
	 *
	 * @param {boolean} bVisible  new value for property <code>visible</code>
	 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
	 * @public
	 */
	BusyIndicator.prototype.setVisible = function(bVisible){
		var oDomRef = this.getDomRef();
		//only suppress rerendering when it's already rendered
		this.setProperty("visible", bVisible, !!oDomRef);
		
		if (oDomRef) {
			this.getDomRef().style.visibility = bVisible ? "visible" : "hidden";
			if (this._bUseCanvas) {
				if (bVisible && !this._animationId) {
					this._animateCanvas();
				}
			} else {
				this._setSvg();
			}
		}
		
		return this;
	};
	

	return BusyIndicator;

}, /* bExport= */ true);
