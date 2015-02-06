/*!
 * ${copyright}
 */

// Provides control sap.m.Button.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Control, EnabledPropagator, IconPool, Parameters) {
	"use strict";

	/**
	 * Constructor for a new Button.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Enables users to trigger actions. For the button UI, you can define some text or an icon, or both.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Button
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Button = Control.extend("sap.m.Button", /** @lends sap.m.Button.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Button text
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Type of a button (e.g. Default, Accept, Reject, Back, etc.)
			 */
			type : {type : "sap.m.ButtonType", group : "Appearance", defaultValue : sap.m.ButtonType.Default},

			/**
			 * Defines the width of the button.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Icon to be displayed as graphical element within the button. This can be an image or an icon from the icon font.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * If set to true (default), the display sequence is 1. icon 2. control text
			 */
			iconFirst : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * The source property when this icon is tapped. Graphical element is changed to the new source as long as the icon is tapped.
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
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
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
			 * Event is fired when the user taps the control.
			 * @deprecated Since version 1.20.0.
			 * This event is deprecated, use the press event instead.
			 */
			tap : {deprecated: true},

			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {}
		}
	}});

	EnabledPropagator.call(Button.prototype);

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
	};

	/**
	 * Function is called when touchstart occurs on button .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchstart = function(oEvent) {

		// mark the event for components that needs to know if the event was handled by the button
		oEvent.setMarked();

		// change the source only when the first finger is on the control, the
		// following fingers doesn't affect
		if (oEvent.targetTouches.length === 1) {

			// set active button state
			this._activeButton();

			// set target which started the event
			this._target = oEvent.target;
		}
	};

	/**
	 * Function is called when touchend occurs on button .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchend = function() {

		// set inactive button state
		this._inactiveButton();
	};

	/**
	 * Function is called when touchcancel occurs .
	 * @param {jQuery.Event} oEvent - the touch event.
	 * @private
	 */
	Button.prototype.ontouchcancel = function() {

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
		if (this.getEnabled()) {

			// if target is empty set target (specially for selenium test)
			if (!this._target) {
				this._target = oEvent.target;
			}

			// check if target which started the event is the same
			if ((!!this._target) && (this._target === oEvent.target)) {
				this.fireTap({/* no parameters */}); // (This event is deprecated, use the "press" event instead)
				this.firePress({/* no parameters */});
			}
		}

		// reset target which started the event
		delete this._target;
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * This implementation differs from that of commons button.
	 * Commons listens to the click event and ignores touchstart.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Button.prototype.onkeydown = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {

			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();

			// set active button state
			this._activeButton();

			// set target which started the event
			this._target = oEvent.target;
		}
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Button.prototype.onkeyup = function(oEvent) {

		// if keydown isn't caught by button, ignore the keyup.
		if (!this._target) {
			return;
		}

		this._target = null;

		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {

			// mark the event for components that needs to know if the event was handled by the button
			oEvent.setMarked();

			// set inactive button state
			this._inactiveButton();
			this.firePress({/* no parameters */});
		}
	};

	/**
	 * Ensure that the active button state is removed by focus loss.
	 *
	 * @param {jQuery.Event} oEvent - the focus event
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
		if (this.getEnabled()) {
			if (this.getIcon() && this.getActiveIcon() && this._image instanceof sap.m.Image) {
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
		if (this.getEnabled()) {
			if (this.getIcon() && this.getActiveIcon() && this._image instanceof sap.m.Image) {
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
		return this.getEnabled() && sap.ui.Device.system.desktop;
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

		// check if image source has changed - if yes destroy and reset image control
		if (this._image && (this._image.getSrc() !== sSrc)) {
			this._image.destroy();
			this._image = undefined;
		}

		// update or create image control
		var oImage = this._image;

		if (!!oImage) {
			oImage.setSrc(sSrc);
			if (oImage instanceof sap.m.Image) {
				oImage.setActiveSrc(sActiveSrc);
				oImage.setDensityAware(bIconDensityAware);
			}
		} else {
			oImage = IconPool.createControlByURI({
				id: sImgId,
				src : sSrc,
				activeSrc : sActiveSrc,
				densityAware : bIconDensityAware
			}, sap.m.Image).addStyleClass("sapMBtnCustomIcon").setParent(this, null, true);
		}

		// add style classes to the object
		oImage.addStyleClass("sapMBtnIcon");

		// remove previous set style classes
		if (oImage.hasStyleClass("sapMBtnIconLeft")) {
			oImage.removeStyleClass("sapMBtnIconLeft");
		}
		if (oImage.hasStyleClass("sapMBtnIconRight")) {
			oImage.removeStyleClass("sapMBtnIconRight");
		}
		if (oImage.hasStyleClass("sapMBtnBackIconLeft")) {
			oImage.removeStyleClass("sapMBtnBackIconLeft");
		}

		if (this.getText()) {
			// check and set absolute position depending on icon and icon position
			if (this.getIconFirst()) {
				if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
					oImage.addStyleClass("sapMBtnBackIconLeft");
				} else {
					oImage.addStyleClass("sapMBtnIconLeft");
				}
			} else {
				oImage.addStyleClass("sapMBtnIconRight");
			}
		}

		this._image = oImage;
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
		if (!!oIcon) {
			oIcon.setSrc(sSrc);
		} else {
			oIcon = IconPool.createControlByURI(sSrc, sap.m.Image);
		}

		// add style classes to the object
		oIcon.addStyleClass("sapMBtnIcon");
		if (this.getText()) {
			oIcon.addStyleClass("sapMBtnIconLeft");
		}

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

		if (this.getType()	=== sap.m.ButtonType.Unstyled) {
			bUnstyled = true;
		}

		return bUnstyled;
	};

	/**
	 * Property setter for the text
	 *
	 * @param {string} sText - new value of the Text attribute
	 * @return {sap.m.Button} this to allow method chaining
	 * @public
	 */
	Button.prototype.setText = function(sText) {
		var sValue = this.getText();

		if (sText === null || sText === undefined) {
			sText = "";
		}

		if (sValue !== sText) {
			var oDomRef = this.getDomRef("content");
			var bShouldSupressRendering = !!oDomRef;

			// Render control if element is not available in the DOM
			this.setProperty("text", sText, bShouldSupressRendering);

			if (bShouldSupressRendering) {
				// Get text to have the type conversation for non-string values done by the framework
				sText = this.getText();
				oDomRef.innerHTML = jQuery.sap.escapeHTML(sText);

				// Check if an icon is set
				if (this.getIcon()) {
					// Remove all text padding classes
					this._removeTextPadding();

					// Add the text padding classes
					if (sText.length > 0) {
						this._addTextPadding(this.getIconFirst());
					}

					// extend  minimum button size if icon is set without text for button types back and up
					if (this.$().hasClass("sapMBtnBack")) {
						this.$().removeClass("sapMBtnBack");
					}
					if ((this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) && this.getIcon() && !this.getText()) {
						this.$().addClass("sapMBtnBack");
					}
				}
			}
		}

		return this;
	};

	/**
	 * Property setter for the icon
	 *
	 * @param {sap.ui.core.URI} sIcon - new value of the Icon property
	 * @return {sap.m.Button} this to allow method chaining
	 * @public
	 */
	Button.prototype.setIcon = function(sIcon) {
		var sValue = this.getIcon();

		if (sIcon === null || sIcon === undefined) {
			sIcon = "";
		}

		if (sValue !== sIcon) {
			var oDomRef = this.getDomRef("img");
			var bShouldSupressRendering = !!oDomRef;

			// Check if old and new icon URI is equal
			if (IconPool.isIconURI(sIcon) === IconPool.isIconURI(sValue)) {
				bShouldSupressRendering = true;
			} else {
				bShouldSupressRendering = false;
			}

			// Control needs to be re-rendered when icon should be removed
			if (sIcon.length === 0) {
				bShouldSupressRendering = false;
			}

			// Render control if element is not available in the DOM
			this.setProperty("icon", sIcon, bShouldSupressRendering);

			if (bShouldSupressRendering && this._image) {
				this._image.setSrc(sIcon);
			}
		}

		return this;
	};


	/**
	 * Property setter for the icon first
	 *
	 * @param {boolean} bIconFirst - true IFF the icon goes before the text
	 * @return {sap.m.Button} this to allow method chaining
	 * @public
	 */
	Button.prototype.setIconFirst = function(bIconFirst) {
		var sValue = this.getIconFirst();

		if (sValue !== bIconFirst) {
			var oDomRef = this.getDomRef("img");
			var bShouldSupressRendering = !!oDomRef;

			// Render control if element is not available in the DOM
			this.setProperty("iconFirst", bIconFirst, bShouldSupressRendering);

			if (bShouldSupressRendering) {

				// remove previous set style classes
				if (this.$("img").hasClass("sapMBtnIconLeft")) {
					this.$("img").removeClass("sapMBtnIconLeft");
				}
				if (this.$("img").hasClass("sapMBtnIconRight")) {
					this.$("img").removeClass("sapMBtnIconRight");
				}
				if (this.$("img").hasClass("sapMBtnBackIconLeft")) {
					this.$("img").removeClass("sapMBtnBackIconLeft");
				}
				if (this.$("content").hasClass("sapMBtnContentLeft")) {
					this.$("content").removeClass("sapMBtnContentLeft");
				}
				if (this.$("content").hasClass("sapMBtnContentRight")) {
					this.$("content").removeClass("sapMBtnContentRight");
				}
				if (this.$("content").hasClass("sapMBtnBackContentRight")) {
					this.$("content").removeClass("sapMBtnBackContentRight");
				}

				if (this.getText()) {
					// check and set absolute position depending on icon and icon position
					if (bIconFirst) {
						if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
							this.$("img").addClass("sapMBtnBackIconLeft");
							this.$("content").addClass("sapMBtnBackContentRight");
						} else {
							this.$("img").addClass("sapMBtnIconLeft");
							this.$("content").addClass("sapMBtnContentRight");
						}
					} else {
						if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
							this.$("content").addClass("sapMBtnContentRight");
						} else {
							this.$("content").addClass("sapMBtnContentLeft");
						}
						this.$("img").addClass("sapMBtnIconRight");
					}
				}

				// Remove all text padding classes
				this._removeTextPadding();

				// Add the text padding classes
				if (this.getText().length > 0) {
					this._addTextPadding(bIconFirst);
				}
			}
		}

		return this;
	};

	/**
	 * Function is called to remove the padding classes for the text
	 *
	 * @private
	 */
	Button.prototype._removeTextPadding = function() {

		// Search and remove padding classes
		if (this.$("inner").hasClass("sapMBtnPaddingLeft")) {
			this.$("inner").removeClass("sapMBtnPaddingLeft");
		} else if (this.$("inner").hasClass("sapMBtnPaddingRight")) {
			this.$("inner").removeClass("sapMBtnPaddingRight");
		}

		// Search and remove padding between icon and text
		if (!this.getText()) {
			if (this.$("content").hasClass("sapMBtnContentLeft")) {
				this.$("content").removeClass("sapMBtnContentLeft");
			}
			if (this.$("content").hasClass("sapMBtnContentRight")) {
				this.$("content").removeClass("sapMBtnContentRight");
			}
			if (this.$("content").hasClass("sapMBtnBackContentRight")) {
				this.$("content").removeClass("sapMBtnBackContentRight");
			}
		}
	};

	/**
	 * Function is called to add the padding classes for the text
	 *
	 * @param {boolean} bIconFirst - true IFF the icon goes before the text
	 * @private
	 */
	Button.prototype._addTextPadding = function( bIconFirst) {
		var sType = this.getType();

		// Add text padding classes
		if (bIconFirst) {
			this.$("inner").addClass("sapMBtnPaddingRight");
		} else if (sType != sap.m.ButtonType.Back && sType != sap.m.ButtonType.Up) {
			this.$("inner").addClass("sapMBtnPaddingLeft");
		}

		// Add text padding classes between icon and text
		if (this.getText()) {
			if (this.getIcon()) {
				if (this.getIconFirst()) {
					if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
						this.$("content").addClass("sapMBtnBackContentRight");
					} else {
						this.$("content").addClass("sapMBtnContentRight");
					}
				} else {
					if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
						this.$("content").addClass("sapMBtnContentRight");
					}
					this.$("content").addClass("sapMBtnContentLeft");
				}
			} else if (this.getType() === sap.m.ButtonType.Back || this.getType() === sap.m.ButtonType.Up) {
				this.$("content").addClass("sapMBtnContentRight");
			}
		}
	};

	/**
	 * Defines to which DOM reference the Popup should be docked
	 *
	 * @protected
	 * @return {DomNode} the DOM reference that Popup should dock to
	 */
	Button.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef("inner");
	};

	return Button;

}, /* bExport= */ true);
