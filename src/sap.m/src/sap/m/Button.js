/*!
 * ${copyright}
 */

// Provides control sap.m.Button.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/AccessKeysEnablement",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/ui/core/ContextMenuSupport",
	"sap/ui/core/library",
	"./ButtonRenderer",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/LabelEnablement",
	"sap/m/BadgeEnabler",
	"sap/ui/core/InvisibleText",
	"sap/base/Log",
	"sap/m/Image"
], function(
	library,
	Control,
	Library,
	ShortcutHintsMixin,
	EnabledPropagator,
	AccessKeysEnablement,
	IconPool,
	Device,
	ContextMenuSupport,
	coreLibrary,
	ButtonRenderer,
	KeyCodes,
	LabelEnablement,
	BadgeEnabler,
	InvisibleText,
	Log,
	Image
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.ButtonAccessibilityType
	var ButtonAccessibilityType = library.ButtonAccessibilityType;

	// shortcut for sap.m.ButtonAccessibleRole
	var ButtonAccessibleRole = library.ButtonAccessibleRole;

	// shortcut for sap.m.BadgeState
	var BadgeState = library.BadgeState;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

	// constraints for the minimum and maximum Badge value
	var BADGE_MIN_VALUE = 1,
		BADGE_MAX_VALUE = 9999;

	/**
	 * Constructor for a new <code>Button</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables users to trigger actions.
	 *
	 * <h3>Overview</h3>
	 *
	 * The user triggers an action by clicking or tapping the <code>Button</code> or by pressing
	 * certain keyboard keys, such as Enter.
	 *
	 * <h3>Usage</h3>
	 *
	 * For the <code>Button</code> UI, you can define text, icon, or both. You can also specify
	 * whether the text or the icon is displayed first.
	 *
	 * You can choose from a set of predefined {@link sap.m.ButtonType ButtonTypes} that offer
	 * different styling to correspond to the triggered action.
	 *
	 * You can set the <code>Button</code> as enabled or disabled. An enabled <code>Button</code> can be
	 * pressed by clicking or tapping it and it changes its style to provide visual feedback to the user
	 * that it is pressed or hovered over with the mouse cursor. A disabled <code>Button</code> appears
	 * inactive and cannot be pressed.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.core.IAccessKeySupport
	 * @mixes sap.ui.core.ContextMenuSupport
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Button
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/button/ Button}
	 */
	var Button = Control.extend("sap.m.Button", /** @lends sap.m.Button.prototype */ {
		metadata : {

			interfaces : [
				"sap.ui.core.IFormContent",
				"sap.ui.core.IAccessKeySupport",
				"sap.m.IToolbarInteractiveControl"
			],
			library : "sap.m",
			properties : {

				/**
				 * Determines the text of the <code>Button</code>.
				 */
				text : {type : "string", group : "Misc", defaultValue: "" },

				/**
				 * Defines the <code>Button</code> type.
				 */
				type : {type : "sap.m.ButtonType", group : "Appearance", defaultValue : ButtonType.Default},

				/**
				 * Defines the <code>Button</code> width.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

				/**
				 * Determines whether the <code>Button</code> is enabled (default is set to <code>true</code>).
				 * A disabled <code>Button</code> has different colors depending on the {@link sap.m.ButtonType ButtonType}.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Defines the icon to be displayed as graphical element within the <code>Button</code>.
				 * It can be an image or an icon from the icon font.
				 */
				icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue: "" },

				/**
				 * Determines whether the icon is displayed before the text.
				 */
				iconFirst : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * The source property of an alternative icon for the active (depressed) state of the button.
				 * Both active and default icon properties should be defined and have the same type: image or icon font.
				 * If the <code>icon</code> property is not set or has a different type, the active icon is not displayed.
				 */
				activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

				/**
				 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
				 *
				 * If only one version of image is provided, set this value to false to avoid the attempt of fetching density perfect image.
				 */
				iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * Specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
				 * @since 1.28.0
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Specifies the value of the <code>aria-haspopup</code> attribute
				 *
				 * If the value is <code>None</code>, the attribute will not be rendered. Otherwise it will be rendered with the selected value.
				 *
				 * NOTE: Use this property only when a button is related to a popover/popup. The value needs to be equal to the main/root role of the popup - e.g. dialog,
				 * menu or list (examples: if you have dialog -> dialog, if you have menu -> menu; if you have list -> list; if you have dialog containing a list -> dialog).
				 * Do not use it, if you open a standard sap.m.Dialog, MessageBox or other type of dialogs displayed as on overlay over the application.
				 *
				 * @since 1.84.0
				 */
				ariaHasPopup : {type : "sap.ui.core.aria.HasPopup", group : "Accessibility", defaultValue : AriaHasPopup.None},

				/**
				 * Describes the accessibility role of the button:<ul>
				 * <li><code>ButtonAccessibleRole.Default</code> - The accessibility semantics is derived from the button tag and no role attribute is rendered.
				 * <li><code>ButtonAccessibleRole.Link</code> - The accessibility semantics is derived from a custom role attribute with "link" value.
				 *
				 * NOTE: Use link role only with a press handler, which performs a navigation. In all other scenarios the default button semantics is recommended.
				 *
				 * @since 1.114.0
				 */
				 accessibleRole : {type : "sap.m.ButtonAccessibleRole", group : "Accessibility", defaultValue : ButtonAccessibleRole.Default},

				/**
				 * Indicates whether the access keys ref of the control should be highlighted.
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				highlightAccKeysRef: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Indicates which keyboard key should be pressed to focus the access key ref
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				accesskey: { type: "string", defaultValue: "", visibility: "hidden" }

			},
			associations : {

				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}

			},
			events : {
				/**
				 * Fired when the user clicks or taps on the control.
				 */
				press : {}
			},
			designtime: "sap/m/designtime/Button.designtime",
			dnd: { draggable: true, droppable: false }
		},

		renderer: ButtonRenderer
	});


	/**
	 * Specifies whether the button should be excluded (default false) from tab chain.
	 * @type {boolean}
	 * @protected
	 */
	//this._bExcludeFromTabChain

	EnabledPropagator.call(Button.prototype);
	ContextMenuSupport.apply(Button.prototype);
	BadgeEnabler.call(Button.prototype);

	Button.prototype.init = function() {
		this._onmouseenter = this._onmouseenter.bind(this);
		this._buttonPressed = false;

		ShortcutHintsMixin.addConfig(this, {
				event: "press",
				position: "0 0",
				addAccessibilityLabel: true
			}, this);

		this.initBadgeEnablement({
			position: "topRight",
			selector: {suffix: "inner"}
		});
		this._oBadgeData = {
			value: "",
			state: ""
		};

		this._badgeMinValue = BADGE_MIN_VALUE;
		this._badgeMaxValue = BADGE_MAX_VALUE;

		AccessKeysEnablement.registerControl(this);
	};

	//Formatter callback of the badge pre-set value, before it is visualized

	Button.prototype.badgeValueFormatter = function(vValue) {
		var iValue = parseInt(vValue),
			oBadgeCustomData = this.getBadgeCustomData(),
			bIsBadgeVisible = oBadgeCustomData.getVisible();

		if (isNaN(iValue)) {return false;}

		// limit value of the badge
		if (iValue < this._badgeMinValue) {
			bIsBadgeVisible && oBadgeCustomData.setVisible(false);
		} else  {
			!bIsBadgeVisible && oBadgeCustomData.setVisible(true);

			if (iValue > this._badgeMaxValue && vValue.indexOf("+") === -1) {
				vValue = this._badgeMaxValue < 1000 ? this._badgeMaxValue + "+" : "999+";
			}
		}

		return vValue;
	};

	/**
	 * Badge minimum value setter - called when someone wants to change the value
	 * below which the badge is hidden.
	 *
	 * @param {number} iMin minimum visible value of the badge (not less than minimum Badge value - 1)
	 * @return {this} this to allow method chaining
	 * @public
	 */
	Button.prototype.setBadgeMinValue = function(iMin) {
		var iValue = this.getBadgeCustomData().getValue();

		if (iMin && !isNaN(iMin) && iMin >= BADGE_MIN_VALUE && iMin != this._badgeMinValue && iMin <= this._badgeMaxValue) {
			this._badgeMinValue = iMin;
			this.badgeValueFormatter(iValue);
			this.invalidate();
		} else {
			Log.warning("minValue is not valid (it is is less than minimum allowed badge value [" + BADGE_MIN_VALUE + "] or greater than maximum badge value [" + this._badgeMaxValue + "])", this);
		}
		return this;
	};

	/**
	 * Badge maximum value setter - called when someone wants to change the value
	 * above which the badge value is displayed with + after the value (ex. 999+)
	 *
	 * @param {number} iMax maximum visible value of the badge (not greater than maximum Badge value - 9999)
	 * @return {this} this to allow method chaining
	 * @public
	 */
	Button.prototype.setBadgeMaxValue = function(iMax) {
		if (iMax && !isNaN(iMax) && iMax <= BADGE_MAX_VALUE && iMax != this._badgeMaxValue && iMax >= this._badgeMinValue) {
			this._badgeMaxValue = iMax;
			this.invalidate();
		} else {
			Log.warning("maxValue is not valid (it is is greater than than maximum allowed badge value [" + BADGE_MAX_VALUE + "] or less than minimum badge value [" + this._badgeMinValue + "])", this);
		}
		return this;
	};

	/**
	 * Badge update handler - called when there is Badge value and/or state update
	 *
	 * @param {number | string} vValue value of the badge
	 * @param {string} sState state of the badge
	 * @private
	 */
	Button.prototype.onBadgeUpdate = function(vValue, sState) {

		if (this._oBadgeData.value !== vValue || this._oBadgeData.state !== sState) {
			if (sState === BadgeState.Disappear) {
				vValue = "";
			}
			this._updateBadgeInvisibleText(vValue);
			this._oBadgeData = {
				value: vValue,
				state: sState
			};
		}
	};

	/**
	 * Updates invisible text values after Badge value and/or state update
	 *
	 * @param {number | string} vValue value of the badge
	 * @private
	 */
	Button.prototype._updateBadgeInvisibleText = function(vValue) {
		var oRb = Library.getResourceBundleFor("sap.m"),
			sInvisibleTextValue,
			iPlusPos;

		// set invisible text with badge value
		vValue = vValue.toString().trim();

		iPlusPos = vValue.indexOf("+");
		if (iPlusPos !== -1) {
			sInvisibleTextValue = oRb.getText("BUTTON_BADGE_MORE_THAN_ITEMS", [vValue.substr(0, iPlusPos)]);
		} else {
			switch (vValue) {
				case "":		sInvisibleTextValue = ""; break;
				case "1":		sInvisibleTextValue = oRb.getText("BUTTON_BADGE_ONE_ITEM", [vValue]); break;
				default:		sInvisibleTextValue = oRb.getText("BUTTON_BADGE_MANY_ITEMS", [vValue]);
			}
		}

		this._getBadgeInvisibleText().setText(sInvisibleTextValue);
	};

	/**
	 * Returns an instance of the badge invisible text
	 *
	 * @returns {sap.ui.core.InvisibleText}
	 * @private
	 */
	Button.prototype._getBadgeInvisibleText = function() {
		if (!this._oBadgeInvisibleText) {
			this._oBadgeInvisibleText = new InvisibleText(this.getId() + "-badge").toStatic();
		}
		return this._oBadgeInvisibleText;
	};

	/**
	 * Function is called when exiting the control.
	 *
	 * @private
	 */
	Button.prototype.exit = function() {

		// destroy image controls if initialized
		if (this._image) {
			this._image.destroy();
		}

		if (this._iconBtn) {
			this._iconBtn.destroy();
		}

		if (this._oBadgeInvisibleText) {
			this._oBadgeInvisibleText.destroy();
			this._oBadgeData = null;
		}

		this._bFocused = null;

		this.$().off("mouseenter", this._onmouseenter);
	};

	Button.prototype.setType = function(sButtonType) {
		this.setProperty("type", sButtonType);

		switch (sButtonType) {
			case ButtonType.Critical:
				this._sTypeIconURI = "sap-icon://alert";
				break;
			case ButtonType.Negative:
				this._sTypeIconURI = "sap-icon://error";
				break;
			case ButtonType.Success:
				this._sTypeIconURI = "sap-icon://sys-enter-2";
				break;
			case ButtonType.Neutral:
				this._sTypeIconURI = "sap-icon://information";
				break;
			case ButtonType.Back:
			case ButtonType.Up:
				this._sTypeIconURI = "sap-icon://nav-back";
				break;
			default:
				this._sTypeIconURI = null;
		}

		return this;
	};

	/*
	 * Remember active state if the button was depressed before re-rendering.
	 */
	Button.prototype.onBeforeRendering = function() {
		this._bRenderActive = this._bActive;

		this._updateAccessKey();
		this.$().off("mouseenter", this._onmouseenter);
	};

	Button.prototype._updateAccessKey = function () {
		var sText = this.getText();

		if (sText) {
			this.setProperty("accesskey", sText[0].toLowerCase());
		}
	};

	/*
	 * Restore active state if the button was depressed before re-rendering.
	 */
	Button.prototype.onAfterRendering = function() {
		if (this._bRenderActive) {
			this._activeButton();
			// now, this._bActive may be false if the button was disabled
			this._bRenderActive = this._bActive;
		}

		if (this._bFocused) {
			this._toggleLiveChangeAnnouncement("polite");
		}

		this.$().on("mouseenter", this._onmouseenter);
	};

	/**
	 * Function is called when touchstart occurs on button .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchstart = function(oEvent) {

		// mark the event for components that needs to know if the event was handled by the button
		oEvent.setMarked();
		if (this._bRenderActive) {
			delete this._bRenderActive;
		}

		// change the source only when the first finger is on the control, the
		// following fingers doesn't affect
		if (oEvent.targetTouches.length === 1) {
			this._buttonPressed = true;
			// set active button state
			this._activeButton();
		}

		if (this.getEnabled() && this.getVisible()) {
			// Safari and Firefox doesn't set the focus to the clicked button tag but to the nearest parent DOM which is focusable
			// That is why we re-set the focus manually after the browser sets the focus.
			if ((Device.browser.safari || Device.browser.firefox) && (oEvent.originalEvent && oEvent.originalEvent.type === "mousedown")) {
				this._setButtonFocus();
			}

			// set the tag ID where the touch event started
			this._sTouchStartTargetId = oEvent.target.id.replace(this.getId(), '');
		} else {
			// clear the starting tag ID in case the button is not enabled and visible
			this._sTouchStartTargetId = '';
		}
	};

	/**
	 * Function is called when touchend occurs on button .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchend = function(oEvent) {
		var sEndingTagId;

		this._buttonPressed = oEvent.originalEvent && oEvent.originalEvent.buttons & 1;

		// set inactive button state
		this._inactiveButton();

		if (this._bRenderActive) {
			delete this._bRenderActive;

			const bIsRightClick = oEvent.which === 3 || (oEvent.ctrlKey && oEvent.which === 1);
			if (!bIsRightClick) {
				this.ontap(oEvent, true);
			}
		}

		// get the tag ID where the touch event ended
		sEndingTagId = oEvent.target.id.replace(this.getId(), '');
		// there are some cases when tap event won't come. Simulate it:
		if (this._buttonPressed === 0
			&& ((this._sTouchStartTargetId === "-BDI-content"
				&& (sEndingTagId === '-content' || sEndingTagId === '-inner' || sEndingTagId === '-img'))
				|| (this._sTouchStartTargetId === "-content" && (sEndingTagId === '-inner' || sEndingTagId === '-img'))
				|| (this._sTouchStartTargetId === '-img' && sEndingTagId !== '-img'))) {
			this.ontap(oEvent, true);
		}

		// clear the starting target
		this._sTouchStartTargetId = '';
	};

	/**
	 * Function is called when touchcancel occurs .
	 * @private
	 */
	Button.prototype.ontouchcancel = function() {
		this._buttonPressed = false;
		this._sTouchStartTargetId = '';
		// set inactive button state
		this._inactiveButton();
	};

	/**
	 * Function is called when tap occurs on button.
	 * @param {jQuery.Event} oEvent - the touch event
	 * @private
	 */
	Button.prototype.ontap = function(oEvent, bFromTouchEnd) {
		// mark the event for components that needs to know if the event was handled by the button
		oEvent.setMarked();
		delete this._bRenderActive;

		if (this.bFromTouchEnd) {
			return;
		}

		// fire tap event
		if (this.getEnabled() && this.getVisible()) {
			// note: on mobile, the press event should be fired after the focus is on the button
			if ((oEvent.originalEvent && oEvent.originalEvent.type === "touchend")) {
					this.focus();
			}

			this.firePress({/* no parameters */ });
		}

		this.bFromTouchEnd = bFromTouchEnd;

		if (this.bFromTouchEnd) {
			setTimeout(function() {
				delete this.bFromTouchEnd;
			}.bind(this), 0);
		}
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * This implementation differs from that of commons button.
	 * Commons listens to the click event and ignores touchstart.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Button.prototype.onkeydown = function(oEvent) {

		if ((oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT)
			&& !oEvent.ctrlKey && !oEvent.metaKey) {

			if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
				// mark the event for components that needs to know if the event was handled by the button
				oEvent.setMarked();

				// set active button state
				this._activeButton();
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
					this._inactiveButton();
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
	Button.prototype.onkeyup = function(oEvent) {

		if (oEvent.which === KeyCodes.ENTER) {
			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();

			// set inactive button state
			this._inactiveButton();
		}

		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift) {
				// mark the event for components that needs to know if the event was handled by the button
				oEvent.setMarked();

				// set inactive button state
				this._inactiveButton();
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

	Button.prototype._onmouseenter = function(oEvent) {
		if (this._buttonPressed && oEvent.originalEvent && oEvent.originalEvent.buttons & 1) {
			this._activeButton();
		}
	};

	/**
	 * Add aria-live attributes.
	 *
	 * @private
	 */
	Button.prototype.onfocusin = function() {
		this._bFocused = true;
		this._toggleLiveChangeAnnouncement("polite");
	};

	/**
	 * Ensure that the active button state is removed by focus loss.
	 * Disable aria-live attributes.
	 *
	 * @private
	 */
	Button.prototype.onfocusout = function() {
		this._buttonPressed = false;
		this._bFocused = false;
		this._sTouchStartTargetId = '';
		// set inactive button state
		this._inactiveButton();
		this._toggleLiveChangeAnnouncement("off");
	};

	/**
	 * Enables or disables dynamic text or icon change announcmenets
	 *
	 * @param {*} sValue aria-live attribute value
	 * @private
	 */
	Button.prototype._toggleLiveChangeAnnouncement = function(sValue) {
		if (this._getText()) {
			this.$("BDI-content").attr("aria-live", sValue);
		} else if (this._getAppliedIcon()) {
			this.$("tooltip").attr("aria-live", sValue);
		}
	};

	/**
	 * Function is called when button is active.
	 *
	 * @private
	 */
	Button.prototype._activeButton = function() {
		if (!this._isUnstyled()) {
			this.$("inner").addClass("sapMBtnActive");
		}

		// handling active icon
		this._bActive = this.getEnabled();
		if (this._bActive) {
			if (this._getAppliedIcon() && this.getActiveIcon() && this._image) {
				this._image.setSrc(this.getActiveIcon());
			}
		}
	};

	/**
	 * Function is called when button is inactive.
	 *
	 * @private
	 */
	Button.prototype._inactiveButton = function() {
		if (!this._isUnstyled()) {
			this.$("inner").removeClass("sapMBtnActive");
		}

		// handling active icon
		this._bActive = false;
		if (this.getEnabled()) {
			if (this._getAppliedIcon() && this.getActiveIcon() && this._image) {
				this._image.setSrc(this._getAppliedIcon());
			}
		}
	};

	/**
	 * Function to determine if the button is hoverable
	 *
	 * @return {boolean} Whether the button is hoverable
	 * @private
	 */
	Button.prototype._isHoverable = function() {
		return this.getEnabled() && Device.system.desktop;
	};

	/**
	 * Function is called when image control needs to be loaded.
	 *
	 * @param {string} sImgId - id to be used for the image
	 * @param {sap.ui.core.URI} sSrc - URI indicating the image to use as image source
	 * @param {sap.ui.core.URI} sActiveSrc - URI indicating the image to use as active image source
	 * @param {boolean} bIconDensityAware - value for DensityAware attribute of images
	 * @return {sap.m.Image} The created image
	 * @private
	 */
	Button.prototype._getImage = function(sImgId, sSrc, sActiveSrc, bIconDensityAware) {
		var bIsIconURI = IconPool.isIconURI(sSrc),
			bIconFirst;

		// check if image control type and src match - destroy it, if they don't
		if (this._image && this._image.isA("sap.m.Image") && bIsIconURI ||
			this._image && this._image.isA("sap.ui.core.Icon") && !bIsIconURI) {
			this._image.destroy();
			this._image = undefined;
		}

		// update or create image control
		bIconFirst = this.getIconFirst();

		if (this._image) {
			this._image.setSrc(sSrc);
			if (this._image.isA("sap.m.Image")) {
				this._image.setActiveSrc(sActiveSrc);
				this._image.setDensityAware(bIconDensityAware);
			}
		} else {
			this._image = IconPool.createControlByURI({
				id: sImgId,
				src : sSrc,
				activeSrc : sActiveSrc,
				densityAware : bIconDensityAware,

				// do not use default tooltip in icon as the button renders it's own tooltip
				useIconTooltip: false

			}, Image).addStyleClass("sapMBtnCustomIcon").setParent(this, null, true);
		}

		// add style classes to the object
		this._image.addStyleClass("sapMBtnIcon");

		// check and set absolute position depending on icon and icon position
		this._image.toggleStyleClass("sapMBtnIconLeft", bIconFirst);
		this._image.toggleStyleClass("sapMBtnIconRight", !bIconFirst);

		return this._image;
	};

	/**
	 * Function is called when internal image control needs to be loaded.
	 *
	 * @param {string} sImgId - id to be used for the image
	 * @param {sap.ui.core.URI} sSrc - URI indicating the image to use as image source
	 * @return {sap.m.Image} The created icon button
	 * @private
	 */
	Button.prototype._getInternalIconBtn = function(sImgId, sSrc) {
		var oIcon = this._iconBtn;

		// update or create image control
		if (oIcon) {
			oIcon.setSrc(sSrc);
		} else {
			oIcon = IconPool.createControlByURI({
				id: sImgId,
				src : sSrc,

				// do not use default tootip in icon as the button renders it's own tooltip
				useIconTooltip: false

			}, Image).setParent(this, null, true);
		}

		// add style classes to the object
		oIcon.addStyleClass("sapMBtnIcon");
		oIcon.addStyleClass("sapMBtnIconLeft");

		this._iconBtn = oIcon;
		return this._iconBtn;
	};

	/**
	 * Function is called to determine if the button is unstyled.
	 *
	 * @return {boolean} Whether the button is unstyled
	 * @private
	 */
	Button.prototype._isUnstyled = function() {
		var bUnstyled = false;

		if (this.getType()	=== ButtonType.Unstyled) {
			bUnstyled = true;
		}

		return bUnstyled;
	};

	/**
	 * Defines to which DOM reference the Popup should be docked
	 *
	 * @protected
	 * @return {Element} the DOM reference that Popup should dock to
	 */
	Button.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef("inner");
	};

	/**
	 * A hook to be used by controls that extend <code>sap.m.Button</code> and display the text in a different way,
	 * such as <code>sap.uxap.ObjectPageHeaderActionButton</code>, <code>sap.m.OverflowToolbarButton</code>.
	 *
	 * @private
	 */
	Button.prototype._getText = function() {
		return this.getText();
	};

	// A hook to be used by controls that extend sap.m.Button and want to display the tooltip in a different way
	Button.prototype._getTooltip = function() {
		var sTooltip,
			oIconInfo;

		sTooltip = this.getTooltip_AsString();

		if (!sTooltip && !this._getText()) {
			// get icon-font info. will return null if the icon is an image
			oIconInfo = IconPool.getIconInfo(this._getAppliedIcon());

			// add tooltip if available
			if (oIconInfo) {
				// Fall back to the icon's name if there's no semantic text
				sTooltip = oIconInfo.text ? oIconInfo.text : oIconInfo.name;
			}
		}

		return sTooltip;
	};

	/**
	 * Gets the icon, if none - gets the icon implied from the type.
	 *
	 * @private
	 */
	Button.prototype._getAppliedIcon = function() {
		return this.getIcon() || this._sTypeIconURI;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control
	 * @protected
	 */
	Button.prototype.getAccessibilityInfo = function() {
		var sDesc = this._getText() || this.getTooltip_AsString(),
			sAccessibleRole = this.getAccessibleRole();

		if (!sDesc && this._getAppliedIcon()) {
			var oIconInfo = IconPool.getIconInfo(this._getAppliedIcon());
			if (oIconInfo) {
				sDesc = oIconInfo.text || oIconInfo.name;
			}
		}

		return {
			role: sAccessibleRole === ButtonAccessibleRole.Default ? "button" : sAccessibleRole.toLowerCase(),
			type: Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_BUTTON"),
			description: sDesc,
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
	};

	/*
	* Helper function which sets the focus on the button manually.
	*
	* @private
	*/
	Button.prototype._setButtonFocus = function() {
		setTimeout(function() { this.focus(); }.bind(this), 0);
	};

	/*
	* Determines whether self-reference should be added.
	*
	* @returns {boolean}
	* @private
	*/
	Button.prototype._determineSelfReferencePresence = function() {
		var aAriaLabelledBy = this.getAriaLabelledBy(),
			bAlreadyHasSelfReference = aAriaLabelledBy.indexOf(this.getId()) !== -1,
			bHasReferencingLabels = LabelEnablement.getReferencingLabels(this).length > 0,
			oParent = this.getParent(),
			bAllowEnhancingByParent = !!(oParent && oParent.enhanceAccessibilityState);

		return !bAlreadyHasSelfReference && this._getText() &&
			(aAriaLabelledBy.length > 0 || bHasReferencingLabels || bAllowEnhancingByParent || this._isBadgeButton());
	};

	/*
	 * Determines what combination of labels/descriptions does the Button have.
	 *
	 * @returns {string}
	 * @private
	 */
	Button.prototype._determineAccessibilityType = function () {
		var bHasAriaLabelledBy = this.getAriaLabelledBy().length > 0,
			bHasAriaDescribedBy = this.getAriaDescribedBy().length > 0,
			bHasReferencingLabels = LabelEnablement.getReferencingLabels(this).length > 0,
			bHasSemanticType = this.getType() !== ButtonType.Default,
			bHasLabelling = bHasAriaLabelledBy || bHasReferencingLabels || this._determineSelfReferencePresence(),
			bHasDescription = bHasAriaDescribedBy || bHasSemanticType || this._isBadgeButton(),
			sAccType;

		// Conditions are separated instead of grouped to improve readability afterwards.
		if (!bHasLabelling && !bHasDescription) {
			sAccType = ButtonAccessibilityType.Default;
		} else if (bHasLabelling && !bHasDescription) {
			sAccType = ButtonAccessibilityType.Labelled;
		} else if (!bHasLabelling && bHasDescription) {
			sAccType = ButtonAccessibilityType.Described;
		} else if (bHasLabelling && bHasDescription) {
			sAccType = ButtonAccessibilityType.Combined;
		}

		return sAccType;
	};

	Button.prototype._isBadgeButton = function() {
		return (this._oBadgeData && this._oBadgeData.value !== "" && this._oBadgeData.State !== BadgeState.Disappear);
	};

	//gets the title attribute for the given dom node id
	Button.prototype._getTitleAttribute = function(sDOMID) {
		return this.getTooltip();
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	 Button.prototype._getToolbarInteractive = function () {
		return true;
	};


	return Button;

});