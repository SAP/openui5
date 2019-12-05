/*!
 * ${copyright}
 */

// Provides control sap.m.Button.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/ui/core/ContextMenuSupport',
	'sap/ui/core/library',
	'./ButtonRenderer',
	"sap/ui/events/KeyCodes",
	"sap/ui/core/LabelEnablement"
], function(
	library,
	Control,
	EnabledPropagator,
	IconPool,
	Device,
	ContextMenuSupport,
	coreLibrary,
	ButtonRenderer,
	KeyCodes,
	LabelEnablement
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

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
	 * @implements sap.ui.core.IFormContent
	 * @mixes sap.ui.core.ContextMenuSupport
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Button
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/button/ Button}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Button = Control.extend("sap.m.Button", /** @lends sap.m.Button.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
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
			 * This property specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
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
			 * Fired when the user taps the control.
			 * @deprecated as of version 1.20, replaced by <code>press</code> event
			 */
			tap : {deprecated: true},

			/**
			 * Fired when the user clicks or taps on the control.
			 */
			press : {}
		},
		designtime: "sap/m/designtime/Button.designtime",
		dnd: { draggable: true, droppable: false }
	}});


	/**
	 * Specifies whether the button should be excluded (default false) from tab chain.
	 * @type {boolean}
	 * @protected
	 */
	//this._bExcludeFromTabChain

	EnabledPropagator.call(Button.prototype);
	ContextMenuSupport.apply(Button.prototype);

	Button.prototype.init = function() {
		this._onmouseenter = this._onmouseenter.bind(this);
		this._buttonPressed = false;
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

		this.$().off("mouseenter", this._onmouseenter);
	};

	Button.prototype.setType = function(sButtonType) {
		this.setProperty("type", sButtonType, false);


		if (sButtonType === ButtonType.Critical && !this.getIcon()) {
			this.setIcon("sap-icon://message-error");
		} else if (sButtonType === ButtonType.Negative && !this.getIcon()) {
			this.setIcon("sap-icon://message-warning");
		} else if (sButtonType === ButtonType.Success && !this.getIcon()) {
			this.setIcon("sap-icon://message-success");
		} else if (sButtonType === ButtonType.Neutral && !this.getIcon()) {
			this.setIcon("sap-icon://message-information");
		}

		return this;
	};

	/*
	 * Remember active state if the button was depressed before re-rendering.
	 */
	Button.prototype.onBeforeRendering = function() {
		this._bRenderActive = this._bActive;

		this.$().off("mouseenter", this._onmouseenter);
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
			// Safari doesn't set the focus to the clicked button tag but to the nearest parent DOM which is focusable
			// This behavior has to be stopped by calling prevent default when the original event is 'mousedown'
			// and set the focus explicitly to the button.
			if (Device.browser.safari && (oEvent.originalEvent && oEvent.originalEvent.type === "mousedown")) {
				this.focus();
				oEvent.preventDefault();
			}
			if (!sap.ui.Device.browser.msie) {
				// set the tag ID where the touch event started
				this._sStartingTagId = oEvent.target.id.replace(this.getId(), '');
			}
		} else {
			if (!sap.ui.Device.browser.msie) {
				// clear the starting tag ID in case the button is not enabled and visible
				this._sStartingTagId = '';
			}
		}
	};

	/**
	 * Function is called when touchend occurs on button .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchend = function(oEvent) {
		this._buttonPressed = oEvent.originalEvent && oEvent.originalEvent.buttons & 1;

		// set inactive button state
		this._inactiveButton();

		if (this._bRenderActive) {
			delete this._bRenderActive;
		}

		if (!sap.ui.Device.browser.msie) {
			// get the tag ID where the touch event ended
			this._sEndingTagId = oEvent.target.id.replace(this.getId(), '');
			// there are some cases when tap event won't come. Simulate it:
			if (this._buttonPressed === 0 && ((this._sStartingTagId === "-BDI-content" && (this._sEndingTagId === '-content' || this._sEndingTagId === '-inner' || this._sEndingTagId === '-img')) || (this._sStartingTagId === "-content" && (this._sEndingTagId === '-inner' || this._sEndingTagId === '-img')) || (this._sStartingTagId === '-img' && this._sEndingTagId !== '-img'))) {
				this.ontap(oEvent);
			}
		}

	};

	/**
	 * Function is called when touchcancel occurs .
	 * @private
	 */
	Button.prototype.ontouchcancel = function() {
		this._buttonPressed = false;
		// set inactive button state
		this._inactiveButton();
	};

	/**
	 * Function is called when tap occurs on button.
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontap = function(oEvent) {
		// mark the event for components that needs to know if the event was handled by the button
		oEvent.setMarked();

		// fire tap event
		if (this.getEnabled() && this.getVisible()) {
			// note: on mobile, the press event should be fired after the focus is on the button
			if ((oEvent.originalEvent && oEvent.originalEvent.type === "touchend")) {
					this.focus();
			}

			this.fireTap({/* no parameters */}); // (This event is deprecated, use the "press" event instead)
			this.firePress({/* no parameters */});
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

		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT) {

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
	 * Ensure that the active button state is removed by focus loss.
	 *
	 * @private
	 */
	Button.prototype.onfocusout = function() {

		// set inactive button state
		this._inactiveButton();
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
			if (this.getIcon() && this.getActiveIcon() && this._image) {
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
			if (this.getIcon() && this.getActiveIcon() && this._image) {
				this._image.setSrc(this.getIcon());
			}
		}
	};

	/**
	 * Function to determine if the button is hoverable
	 *
	 * @return {sap.m.Button} this to allow method chaining
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
	 * @return {sap.m.Button} this to allow method chaining
	 * @private
	 */
	Button.prototype._getImage = function(sImgId, sSrc, sActiveSrc, bIconDensityAware) {
		var bIsIconURI = IconPool.isIconURI(sSrc),
			bIconFirst;

		// check if image control type and src match - destroy it, if they don't
		if (this._image instanceof sap.m.Image && bIsIconURI ||
			this._image instanceof sap.ui.core.Icon && !bIsIconURI) {
			this._image.destroy();
			this._image = undefined;
		}

		// update or create image control
		bIconFirst = this.getIconFirst();

		if (this._image) {
			this._image.setSrc(sSrc);
			if (this._image instanceof sap.m.Image) {
				this._image.setActiveSrc(sActiveSrc);
				this._image.setDensityAware(bIconDensityAware);
			}
		} else {
			this._image = IconPool.createControlByURI({
				id: sImgId,
				src : sSrc,
				activeSrc : sActiveSrc,
				densityAware : bIconDensityAware,

				// do not use default tootip in icon as the button renders it's own tooltip
				useIconTooltip: false

			}, sap.m.Image).addStyleClass("sapMBtnCustomIcon").setParent(this, null, true);
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
	 * @return {sap.m.Button} this to allow method chaining
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

			}, sap.m.Image).setParent(this, null, true);
		}

		// add style classes to the object
		oIcon.addStyleClass("sapMBtnIcon");
		oIcon.addStyleClass("sapMBtnIconLeft");

		this._iconBtn = oIcon;
		return this._iconBtn;
	};

	/**
	 * Function is called to determine if the button is.unstyled
	 *
	 * @return {sap.m.Button} this to allow method chaining
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

	// A hook to be used by controls that extend sap.m.Button and want to display the text in a different way
	Button.prototype._getText = function() {
		return this.getText();
	};

	// A hook to be used by controls that extend sap.m.Button and want to display the tooltip in a different way
	Button.prototype._getTooltip = function() {

		var sTooltip = this.getTooltip_AsString();

		if (!sTooltip && !this.getText()) {
			// get icon-font info. will return null if the icon is an image
			var oIconInfo = IconPool.getIconInfo(this.getIcon());

			// add tooltip if available
			if (oIconInfo && oIconInfo.text) {
				sTooltip = oIconInfo.text;
			}
		}

		return sTooltip;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	Button.prototype.getAccessibilityInfo = function() {
		var sDesc = this.getText() || this.getTooltip_AsString();
		if (!sDesc && this.getIcon()) {
			var oIconInfo = IconPool.getIconInfo(this.getIcon());
			if (oIconInfo) {
				sDesc = oIconInfo.text || oIconInfo.name;
			}
		}

		return {
			role: "button",
			type: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"),
			description: sDesc,
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
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
			(aAriaLabelledBy.length > 0 || bHasReferencingLabels || bAllowEnhancingByParent);
	};

	return Button;

});