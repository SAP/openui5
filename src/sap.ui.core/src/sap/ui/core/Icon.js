/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Icon.
sap.ui.define([
	'sap/base/assert',
	'../Device',
	'./Control',
	'./_IconRegistry',
	'./InvisibleText',
	'./library',
	"./IconRenderer",
	"./Lib",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/util/each"
],
	function(
		assert,
		Device,
		Control,
		_IconRegistry,
		InvisibleText,
		library,
		IconRenderer,
		Library,
		KeyCodes,
		Log,
		each
	) {
	"use strict";

	// shortcuts
	var IconColor = library.IconColor;
	var CSSColor = library.CSSColor;

	/**
	 * Validates whether an input color is a valid color of type
	 * <code>sap.ui.core.CSSColor</code> or <code>sap.ui.core.IconColor</code>.
	 * undefined, null and an empty string are also valid.
	 * In case the color is not valid, an error gets logged to the console.
	 *
	 * @param {sap.ui.core.CSSColor|sap.ui.core.IconColor|null|undefined|string} vColor input color.
	 *            In case a string value other than <code>sap.ui.core.CSSColor</code>
	 *            or <code>sap.ui.core.IconColor</code> is passed, only an empty string is a valid value.
	 * @returns {boolean} True in case the color is valid and false in case it is not valid.
	 * @private
	 */
	var isColorValid = function (vColor) {
		if (vColor != null && vColor !== "" && !CSSColor.isValid(vColor) && !(vColor in IconColor)) {
			Log.error("\"" + vColor + "\" is not of type sap.ui.core.CSSColor nor of type sap.ui.core.IconColor.");
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Constructor for a new Icon.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Icon uses embedded font instead of pixel image. Comparing to image, Icon is easily scalable, color can be altered live and various effects can be added using css.
	 *
	 * A set of built in Icons is available in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
	 *
	 * For further information, see {@link topic:21ea0ea94614480d9a910b2e93431291 Icon and Icon Pool}.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.11.1
	 * @alias sap.ui.core.Icon
	 */
	var Icon = Control.extend("sap.ui.core.Icon", /** @lends sap.ui.core.Icon.prototype */ {
		metadata : {

			interfaces : ["sap.ui.core.IFormContent"],
			library : "sap.ui.core",
			designtime: "sap/ui/core/designtime/Icon.designtime",
			properties : {

				/**
				 * This property can be set by following options:
				 *
				 * <b>Option 1:</b></br>
				 * The value has to be matched by following pattern <code>sap-icon://collection-name/icon-name</code> where
				 * <code>collection-name</code> and <code>icon-name</code> have to be replaced by the desired values.
				 * In case the default UI5 icons are used the <code>collection-name</code> can be omited.</br>
				 * <i>Example:</i> <code>sap-icon://accept</code>
				 *
				 * <b>Option 2:</b>
				 * The value is determined by using {@link sap.ui.core.IconPool.getIconURI} with an Icon name parameter
				 * and an optional collection parameter which is required when using application extended Icons.</br>
				 * <i>Example:</i> <code>IconPool.getIconURI("accept")</code>
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
		},
		renderer: IconRenderer
	});

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

		// change the source only when the first finger is on the Icon, the following fingers doesn't affect
		if (!oEvent.targetTouches || (oEvent.targetTouches && oEvent.targetTouches.length === 1)) {
			this._activeIcon();
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
			this._deactiveIcon();
		}
	};


	/**
	 * Set the icon color and icon background color to active
	 * @private
	 */
	Icon.prototype._activeIcon = function() {
		var sActiveColor = this.getActiveColor(),
			sActiveBackgroundColor = this.getActiveBackgroundColor(),
			$Icon;

		if (sActiveColor || sActiveBackgroundColor) {
			// change the source only when the first finger is on the Icon, the following fingers doesn't affect
			$Icon = this.$();

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
	 * Restore the icon color and the icon background color
	 * @private
	 */
	Icon.prototype._deactiveIcon = function() {
		this.$().removeClass("sapUiIconActive");
		this._restoreColors(Device.system.desktop ? "hover" : undefined);
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
	 * @param {sap.ui.base.Event} oEvent The event
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
	Icon.prototype.onkeydown = function(oEvent) {
		if ((oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT)
			&& !oEvent.ctrlKey && !oEvent.metaKey) {
			if (this.hasListeners("press") && (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER)) {
				// mark the event for components that needs to know if the event was handled by the control
				oEvent.setMarked();

				this._activeIcon();
			}

			if (oEvent.which === KeyCodes.ENTER) {
				this.firePress({/* no parameters */});
			}

			if (oEvent.which === KeyCodes.SPACE) {
				this._bPressedSpace = true;
			}

			// set inactive state of the button and marked ESCAPE or SHIFT as pressed only if SPACE was pressed before it
			if (this._bPressedSpace) {
				if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
					this._bPressedEscapeOrShift = true;
					// set inactive button state
					this._deactiveIcon();
				}
			}

		} else {
			if (this._bPressedSpace) {
				oEvent.preventDefault();
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

		if (oEvent.which === KeyCodes.ENTER) {
			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();

			// set inactive button state
			this._deactiveIcon();
		}

		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift) {
				// mark the event for components that needs to know if the event was handled by the button
				oEvent.setMarked();

				// set inactive button state
				this._deactiveIcon();
				this.firePress({/* no parameters */});
			} else {
				this._bPressedEscapeOrShift = false;
			}
			this._bPressedSpace = false;
		}

		if (oEvent.which === KeyCodes.ESCAPE){
			this._bPressedSpace = false;
		}
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	Icon.prototype._restoreColors = function(sMode) {
		var sColor, sBackgroundColor;

		if (sMode === "hover") {
			sColor = this.getHoverColor();
			sBackgroundColor = this.getHoverBackgroundColor();
		}

		// always fallback to the normal color if no hover color exists
		sColor = sColor || this.getColor();
		sBackgroundColor = sBackgroundColor || this.getBackgroundColor();

		this._addColorClass(sColor || "", "color");
		this._addColorClass(sBackgroundColor || "", "background-color");
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

		each(IconColor, function(sPropertyName, sPropertyValue) {
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

	/* =========================================================== */
	/* API method                                                  */
	/* =========================================================== */

	Icon.prototype.setSrc = function(sSrc) {
		assert(sSrc == null || sSrc == "" || _IconRegistry.isIconURI(sSrc), this + ": Property 'src' (value: '" + sSrc + "') should be a valid Icon URI (sap-icon://...)");

		return this.setProperty("src", sSrc);
	};

	Icon.prototype.setColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("color", sColor, true);
			this._addColorClass(sColor, "color");
		}

		return this;
	};

	Icon.prototype.setActiveColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("activeColor", sColor, true);
		}

		return this;
	};

	Icon.prototype.setHoverColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("hoverColor", sColor, true);
		}

		return this;
	};

	Icon.prototype.setBackgroundColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("backgroundColor", sColor, true);
			this._addColorClass(sColor, "background-color");
		}

		return this;
	};

	Icon.prototype.setActiveBackgroundColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("activeBackgroundColor", sColor, true);
		}

		return this;
	};

	Icon.prototype.setHoverBackgroundColor = function(sColor) {
		if (isColorValid(sColor)) {
			this.setProperty("hoverBackgroundColor", sColor, true);
		}

		return this;
	};

	Icon.prototype.attachEvent = function (sEventId) {
		Control.prototype.attachEvent.apply(this, arguments);

		if (sEventId == "press" && this.hasListeners("press")) {
			this.invalidate();
		}

		return this;
	};

	Icon.prototype.detachEvent = function (sEventId) {
		Control.prototype.detachEvent.apply(this, arguments);

		if (sEventId == "press" && !this.hasListeners("press")) {
			this.invalidate();
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
	 * aria-label or aria-labelledby is used only when the label string is different than
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
			sLabel = sAlt || sTooltip || (bUseIconTooltip && oIconInfo && (oIconInfo.text || oIconInfo.name));

		if (sLabel) {
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
			oInvisibleText.setText(sText);
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
		} else if (this.hasListeners("press")) {
			mAccAttributes.role = "button";
		} else {
			mAccAttributes.role = "img";
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
	 * @returns {object} Current accessibility state of the Icon
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Icon.prototype.getAccessibilityInfo = function() {
		if (this.getDecorative()) {
			return null;
		}

		var bHasPressListeners = this.hasListeners("press");
		var oIconInfo = _IconRegistry.getIconInfo(this.getSrc(), undefined, "sync");

		return {
			role: bHasPressListeners ? "button" : "img",
			type: Library.getResourceBundleFor("sap.ui.core").getText(bHasPressListeners ? "ACC_CTR_TYPE_BUTTON" : "ACC_CTR_TYPE_IMAGE"),
			description: this.getAlt() || this.getTooltip_AsString() || (oIconInfo ? oIconInfo.text || oIconInfo.name : ""),
			focusable: bHasPressListeners
		};
	};

	return Icon;

});
