/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Icon.
sap.ui.define([
    'jquery.sap.global',
    'sap/base/assert',
    '../Device',
    './Control',
    './IconPool',
    './InvisibleText',
    './library',
    "./IconRenderer",
    'jquery.sap.keycodes'
],
	function(
	    jQuery,
		assert,
		Device,
		Control,
		IconPool,
		InvisibleText,
		library /* ,jQuerySapKeycodes */,
		IconRenderer
	) {
	"use strict";

	// shortcut
	var IconColor = library.IconColor;

	/**
	 * Constructor for a new Icon.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Icon uses embedded font instead of pixel image. Comparing to image, Icon is easily scalable, color can be altered live and various effects can be added using css.
	 *
	 * A set of built in Icons is available and they can be fetched by calling sap.ui.core.IconPool.getIconURI and set this value to the src property on the Icon.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.11.1
	 * @alias sap.ui.core.Icon
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Icon = Control.extend("sap.ui.core.Icon", /** @lends sap.ui.core.Icon.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.ui.core",
		designtime: "sap/ui/core/designtime/Icon.designtime",
		properties : {

			/**
			 * This property should be set by the return value of calling sap.ui.core.IconPool.getIconURI with an Icon name parameter and an optional collection parameter which is required when using application extended Icons. A list of standard FontIcon is available here.
			 */
			src : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Since Icon uses font, this property will be applied to the css font-size property on the rendered DOM element.
			 */
			size : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * The color of the Icon. If color is not defined here, the Icon inherits the color from its DOM parent.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			color : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * This color is shown when icon is hovered. This property has no visual effect when run on mobile device.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			hoverColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * This color is shown when icon is pressed/activated by the user.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			activeColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * This is the width of the DOM element which contains the Icon. Setting this property doesn't affect the size of the font. If you want to make the font bigger, increase the size property.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * This is the height of the DOM element which contains the Icon. Setting this property doesn't affect the size of the font. If you want to make the font bigger, increase the size property.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Background color of the Icon in normal state.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			backgroundColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Background color for Icon in hover state. This property has no visual effect when run on mobile device.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			hoverBackgroundColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Background color for Icon in active state.
			 *
			 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
			 */
			activeBackgroundColor : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * A decorative icon is included for design reasons. Accessibility tools will ignore decorative icons. Tab stop isn't affected by this property anymore and it's now controlled by the existence of press event handler and the noTabStop property.
			 * @since 1.16.4
			 */
			decorative : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * Decides whether a default Icon tooltip should be used if no tooltip is set.
			 * @since 1.30.0
			 */
			useIconTooltip : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * This defines the alternative text which is used for outputting the aria-label attribute on the DOM.
			 * @since 1.30.0
			 */
			alt : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * Defines whether the tab stop of icon is controlled by the existence of press event handler. When it's set to false, Icon control has tab stop when press event handler is attached.
			 * If it's set to true, Icon control never has tab stop no matter whether press event handler exists or not.
			 * @since 1.30.1
			 */
			noTabStop : {type : "boolean", group : "Accessibility", defaultValue : false}
		},
		aggregations: {

			/**
			 * Hidden aggregation for holding the InvisibleText instance which is used for outputing the text labeling the control
			 */
			_invisibleText : {type : "sap.ui.core.InvisibleText", multiple : false, visibility : "hidden"}
		},
		associations : {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * This event is fired when icon is pressed/activated by the user. When a handler is attached to this event, the Icon gets tab stop. If you want to disable this behavior, set the noTabStop property to true.
			 */
			press : {}
		}
	}});

	/* =========================================================== */
	/* Event handlers                                              */
	/* =========================================================== */

	/**
	 * Handle the mousedown event on the Icon.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Icon.prototype[Device.support.touch ? "ontouchstart" : "onmousedown"] = function(oEvent) {
		if (this.hasListeners("press")) {
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
		}

		var sActiveColor = this.getActiveColor(),
			sActiveBackgroundColor = this.getActiveBackgroundColor(),
			$Icon;

		if (sActiveColor || sActiveBackgroundColor) {

			// change the source only when the first finger is on the Icon, the following fingers doesn't affect
			if (!oEvent.targetTouches || (oEvent.targetTouches && oEvent.targetTouches.length === 1)) {
				$Icon = this.$();

				$Icon.addClass("sapUiIconActive");

				if (sActiveColor) {
					this._addColorClass(sActiveColor, "color");
				}

				if (sActiveBackgroundColor) {
					this._addColorClass(sActiveBackgroundColor, "background-color");
				}
			}
		}
	};

	/**
	 * Handle the mouseup event on the Icon.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Icon.prototype[Device.support.touch ? "ontouchend" : "onmouseup"] = function(oEvent) {

		// change the source back only when all fingers leave the icon
		if (!oEvent.targetTouches || (oEvent.targetTouches && oEvent.targetTouches.length === 0)) {

			this.$().removeClass("sapUiIconActive");
			this._restoreColors();
		}
	};

	/**
	 * Handle the mouseover event on the Icon.
	 *
	 * @private
	 */
	Icon.prototype.onmouseover = function() {

		var sHoverColor = this.getHoverColor(),
			sHoverBackgroundColor = this.getHoverBackgroundColor();

		if (sHoverColor) {
			this._addColorClass(sHoverColor, "color");
		}

		if (sHoverBackgroundColor) {
			this._addColorClass(sHoverBackgroundColor, "background-color");
		}
	};

	/**
	 * Handle the mouseout event on the Icon.
	 *
	 * @private
	 */
	Icon.prototype.onmouseout = function() {
		this._restoreColors();
	};

	/**
	 * Handle the click or tap event on the Icon.
	 *
	 * @private
	 */
	Icon.prototype[Device.support.touch && !Device.system.desktop ? "ontap" : "onclick"] = function(oEvent) {
		if (this.hasListeners("press")) {
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
		}

		this.firePress({/* no parameters */});
	};

	/* ----------------------------------------------------------- */
	/* Keyboard handling                                           */
	/* ----------------------------------------------------------- */

	/**
	 * Handle the key down event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Icon.prototype.onkeydown = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {

			// note: prevent document scrolling
			oEvent.preventDefault();

			var $Icon = this.$(),
				sActiveColor = this.getActiveColor(),
				sActiveBackgroundColor = this.getActiveBackgroundColor();

			$Icon.addClass("sapUiIconActive");

			if (sActiveColor) {
				this._addColorClass(sActiveColor, "color");
			}

			if (sActiveBackgroundColor) {
				this._addColorClass(sActiveBackgroundColor, "background-color");
			}
		}
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Icon.prototype.onkeyup = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {

			this.$().removeClass("sapUiIconActive");
			this._restoreColors();
			this.firePress({/* no parameters */});
		}
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	Icon.prototype._restoreColors = function() {
		this._addColorClass(this.getColor() || "", "color");
		this._addColorClass(this.getBackgroundColor() || "", "background-color");
	};

	/* =========================================================== */
	/* API method                                                  */
	/* =========================================================== */

	Icon.prototype.setSrc = function(sSrc) {
		assert(IconPool.isIconURI(sSrc), this + ": Property 'src' (value: '" + sSrc + "') should be a valid Icon URI (sap-icon://...)");

		var vIconInfo = IconPool.getIconInfo(sSrc, undefined, "mixed"),
			$Icon = this.$(),
			sIconLabel, sTooltip, bUseIconTooltip, aLabelledBy, oInvisibleText;

		// when the given sSrc can't be found in IconPool
		// rerender the icon is needed.
		this.setProperty("src", sSrc, !!vIconInfo);

		if (vIconInfo instanceof Promise) {
			// trigger a rerendering once the icon info is available
			vIconInfo.then(this.invalidate.bind(this));
		} else if (vIconInfo && $Icon.length) {
			$Icon.css("font-family", vIconInfo.fontFamily);
			$Icon.attr("data-sap-ui-icon-content", vIconInfo.content);
			$Icon.toggleClass("sapUiIconMirrorInRTL", !vIconInfo.suppressMirroring);

			sTooltip = this.getTooltip_AsString();
			aLabelledBy = this.getAriaLabelledBy();
			bUseIconTooltip = this.getUseIconTooltip();
			sIconLabel = this._getIconLabel(vIconInfo);

			if (sTooltip || (bUseIconTooltip && vIconInfo.text)) {
				$Icon.attr("title", sTooltip || vIconInfo.text);
			} else {
				$Icon.attr("title", null);
			}

			if (aLabelledBy.length === 0) { // Only adapt "aria-label" if there is no "labelledby" as this is managed separately
				if (sIconLabel) {
					$Icon.attr("aria-label", sIconLabel);
				} else {
					$Icon.attr("aria-label", null);
				}
			} else { // adapt the text in InvisibleText control
				oInvisibleText = this.getAggregation("_invisibleText");
				if (oInvisibleText) {
					oInvisibleText.setText(sIconLabel);
				}
			}

		}

		return this;
	};

	Icon.prototype.setWidth = function(sWidth) {
		this.setProperty("width", sWidth, true);
		this.$().css("width", sWidth);

		return this;
	};

	Icon.prototype.setHeight = function(sHeight) {
		this.setProperty("height", sHeight, true);
		this.$().css({
			"height": sHeight,
			"line-height": sHeight
		});

		return this;
	};

	Icon.prototype.setSize = function(sSize) {
		this.setProperty("size", sSize, true);
		this.$().css("font-size", sSize);

		return this;
	};

	Icon.prototype.setColor = function(sColor) {
		this.setProperty("color", sColor, true);
		this._addColorClass(sColor, "color");

		return this;
	};

	Icon.prototype._addColorClass = function(sColor, sCSSPropName) {
		var $Icon = this.$(),
				that = this;

		var sCSSClassNamePrefix = "";
		if (sCSSPropName === "color") {
			sCSSClassNamePrefix = "sapUiIconColor";
		} else if (sCSSPropName === "background-color") {
			sCSSClassNamePrefix = "sapUiIconBGColor";
		} else {
			return;
		}

		jQuery.each(IconColor, function(sPropertyName, sPropertyValue) {
			that.removeStyleClass(sCSSClassNamePrefix + sPropertyValue);
		});

		if (sColor in IconColor) {
			// reset the relevant css property
			$Icon.css(sCSSPropName, "");
			this.addStyleClass(sCSSClassNamePrefix + sColor);
		} else {
			$Icon.css(sCSSPropName, sColor);
		}
	};

	Icon.prototype.setActiveColor = function(sColor) {
		return this.setProperty("activeColor", sColor, true);
	};

	Icon.prototype.setHoverColor = function(sColor) {
		return this.setProperty("hoverColor", sColor, true);
	};

	Icon.prototype.setBackgroundColor = function(sColor) {
		this.setProperty("backgroundColor", sColor, true);
		this._addColorClass(sColor, "background-color");

		return this;
	};

	Icon.prototype.setActiveBackgroundColor = function(sColor) {
		return this.setProperty("activeBackgroundColor", sColor, true);
	};

	Icon.prototype.setHoverBackgroundColor = function(sColor) {
		return this.setProperty("hoverBackgroundColor", sColor, true);
	};

	Icon.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.attachEvent.apply(this, aMyArgs);

		if (this.hasListeners("press")) {
			this.$().toggleClass("sapUiIconPointer", true)
					.attr({
						role: "button",
						tabindex: this.getNoTabStop() ? undefined : 0
					});
		}

		return this;
	};

	Icon.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.detachEvent.apply(this, aMyArgs);

		if (!this.hasListeners("press")) {
			this.$().toggleClass("sapUiIconPointer", false)
					.attr({
						role: this.getDecorative() ? "presentation" : "img"
					})
					.removeAttr("tabindex");
		}

		return this;
	};

	/**
	 * Returns the string which is set to the 'title' attribute of the DOM output
	 * @param {object} oIconInfo icon metadata
	 * @return {string|undefined} the string which is output as title attribute
	 * @private
	 */
	Icon.prototype._getOutputTitle = function(oIconInfo) {
		var sTooltip = this.getTooltip_AsString(),
			bUseIconTooltip = this.getUseIconTooltip();

		if (sTooltip || (bUseIconTooltip && oIconInfo && oIconInfo.text)) {
			return sTooltip || oIconInfo.text;
		}
	};

	/**
	 * Returns the label which is output to either aria-label or the invisible text which
	 * is refered in the aria-labelledby attributes.
	 *
	 * Screen reader reads out the value which is set to the 'title' attribute. Thus the
	 * aria-label or aria-labelledBy is used only when the label string is different than
	 * the string used as 'title' attribute. When the label string is the same as the one
	 * which is set to the 'title' attribute of the DOM, this method returns undefined in
	 * order not to set the aria-label or aria-labelledby attribute.
	 *
	 * @param {object} oIconInfo icon metadata
	 * @return {string} the label when it's necessary to be output
	 * @private
	 */
	Icon.prototype._getIconLabel = function(oIconInfo) {
		var sAlt = this.getAlt(),
			sTooltip = this.getTooltip_AsString(),
			bUseIconTooltip = this.getUseIconTooltip(),
			sLabel = sAlt || sTooltip || (bUseIconTooltip && oIconInfo && (oIconInfo.text || oIconInfo.name)),
			sOutputTitle = this._getOutputTitle(oIconInfo);

		if (sLabel && sLabel !== sOutputTitle) {
			return sLabel;
		}
	};

	Icon.prototype._createInvisibleText = function(sText) {
		var oInvisibleText = this.getAggregation("_invisibleText");

		if (!oInvisibleText) {
			// create control without rerendering
			oInvisibleText = new InvisibleText(this.getId() + "-label", {
				text: sText
			});
			this.setAggregation("_invisibleText", oInvisibleText, true);
		} else {
			// avoid triggering invalidation during rendering
			oInvisibleText.setProperty("text", sText, true);
		}

		return oInvisibleText;
	};

	Icon.prototype._getAccessibilityAttributes = function(oIconInfo) {
		var aLabelledBy = this.getAriaLabelledBy(),
			mAccAttributes = {},
			sIconLabel = this._getIconLabel(oIconInfo),
			oInvisibleText;

		if (this.getDecorative()) {
			mAccAttributes.role = "presentation";
			mAccAttributes.hidden = "true";
		} else {
			if (this.hasListeners("press")) {
				mAccAttributes.role = "button";
			} else {
				mAccAttributes.role = "img";
			}
		}

		if (aLabelledBy.length > 0) {
			if (sIconLabel) {
				oInvisibleText = this._createInvisibleText(sIconLabel);
				aLabelledBy.push(oInvisibleText.getId());
			}
			mAccAttributes.labelledby = aLabelledBy.join(" ");
		} else if (sIconLabel) {
			mAccAttributes.label = sIconLabel;
		}

		return mAccAttributes;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Icon.prototype.getAccessibilityInfo = function() {
		if (this.getDecorative()) {
			return null;
		}

		var bHasPressListeners = this.hasListeners("press");
		var oIconInfo = IconPool.getIconInfo(this.getSrc(), undefined, "sync");

		return {
			role: bHasPressListeners ? "button" : "img",
			type: sap.ui.getCore().getLibraryResourceBundle("sap.ui.core").getText(bHasPressListeners ? "ACC_CTR_TYPE_BUTTON" : "ACC_CTR_TYPE_IMAGE"),
			description: this.getAlt() || this.getTooltip_AsString() || (oIconInfo ? oIconInfo.text || oIconInfo.name : ""),
			focusable: bHasPressListeners
		};
	};

	return Icon;

});
