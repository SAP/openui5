/*!
 * ${copyright}
 */

// Provides control sap.f.Avatar.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool"
], function (jQuery, library, Control, IconPool) {
	"use strict";

	/**
	 * Constructor for a new Avatar
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Avatar allows usage of different content, shapes, sizes depending on the use case.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.46
	 * @alias sap.f.Avatar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Avatar = Control.extend("sap.f.Avatar", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 *  Path to the desired image or icon
				 */
				src: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},
				/**
				 *  Property to hold the initials
				 */
				initials: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Defines the avatar shape. <code>Circle</code> shape is recommended to be used for people and the <code>Square</code> shape works better for products, company logos, different types of media
				 */
				displayShape: {type: "sap.f.AvatarShape", group: "Appearance", defaultValue: sap.f.AvatarShape.Circle},
				/**
				 * Option to set predefined size.
				 */
				displaySize: {type: "sap.f.AvatarSize", group: "Appearance", defaultValue: sap.f.AvatarSize.S},
				/**
				 * Specifies the display size of the avatar, when <code>displaySize</code> is set to <code>Custom</code>
				 */
				customDisplaySize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "3rem"},
				/**
				 * Specifies the avatar's font-size, when <code>displaySize</code> is set to <code>Custom</code>
				 */
				customFontSize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "1.125rem"},
				/**
				 * Property that specifies the fit of an image avatar.
				 */
				imageFitType: {type: "sap.f.AvatarImageFitType", group: "Appearance", defaultValue: sap.f.AvatarImageFitType.Cover}
			},
			events : {
				/**
				 * Event is fired when the user clicks on the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * This is the URI for the default icon, when <code>displayShape</code> is <code>Circle</code>.
	 *
	 * @type {string}
	 */
	Avatar.DEFAULT_CIRCLE_PLACEHOLDER = "sap-icon://person-placeholder";

	/**
	 * This is the URI for the default icon, when <code>displayShape</code> is <code>Square</code>.
	 *
	 * @type {string}
	 */
	Avatar.DEFAULT_SQUARE_PLACEHOLDER = "sap-icon://product";

	Avatar.prototype.init = function () {
		// Property holding the actual display type of the avatar
		this._sActualType = null;
		// Property that determines if the created icon is going to be the default one
		this._bIsDefaultIcon = true;
	};

	Avatar.prototype.exit = function () {
		if (this._icon) {
			this._icon.destroy();
		}
	};

	Avatar.prototype.attachPress = function() {
		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.attachEvent.apply(this, arguments);

		if (this.hasListeners("press")) {
			this.$().attr("tabindex", "0");
			this.$().attr("role", "button");
		}

		return this;
	};

	Avatar.prototype.detachPress = function() {
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
	 * Function is called when the <code>Avatar</code> is clicked.
	 *
	 * @private
	 */
	Avatar.prototype.ontap = function (oEvent) {
		this.firePress({/* no parameters */});
	};

	/**
	 * Handles the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Avatar.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.firePress({/* no parameters */});

			//stop the propagation, it is handled by the control
			oEvent.stopPropagation();
		}
	};

	/**
	 * Function that checks the validity of the <code>initials</code> parameter and returns true if the initials are correct.
	 *
	 * @param sInitials
	 * @returns {boolean}
	 * @private
	 */
	Avatar.prototype._areInitialsValid = function (sInitials) {
		var validInitials = /^[a-zA-Z]{1,2}$/;
		if (!validInitials.test(sInitials)) {
			jQuery.sap.log.warning("Initials should consist of only 1 or 2 latin letters", this);
			this._sActualType = sap.f.AvatarType.Icon;
			this._bIsDefaultIcon = true;
			return false;
		}

		return true;
	};

	/**
	 * Function that validates the <code>src</code> parameter, and sets the actual type appropriately
	 *
	 * @param sSrc
	 * @returns {sap.f.Avatar}
	 * @private
	 */
	Avatar.prototype._validateSrc = function (sSrc) {
		if (IconPool.isIconURI(sSrc)) {
			this._sActualType = sap.f.AvatarType.Icon;
			this._bIsDefaultIcon = false;
		} else {
			this._sActualType = sap.f.AvatarType.Image;
		}

		return this;
	};

	/**
	 * Function that validates the entered parameters, and returns what the actual display type parameter would be.
	 *
	 * @returns {string|*}
	 * @private
	 */
	Avatar.prototype._getActualDisplayType = function () {
		var sSrc = this.getSrc(),
			sInitials = this.getInitials();

		if (sSrc) {
			this._validateSrc(sSrc);
		} else if (sInitials && this._areInitialsValid(sInitials)) {
			this._sActualType = sap.f.AvatarType.Initials;
		} else {
			jQuery.sap.log.warning("No src and initials were provided", this);
			this._sActualType = sap.f.AvatarType.Icon;
			this._bIsDefaultIcon = true;
		}

		return this._sActualType;
	};

	/**
	 * Function that returns the path for the default icon, based on the avatar's shape.
	 *
	 * @param sDisplayShape
	 * @returns {*}
	 * @private
	 */
	Avatar.prototype._getDefaultIconPath = function (sDisplayShape) {
		var sDefaultIconPath = null;

		if (sDisplayShape === sap.f.AvatarShape.Circle) {
			sDefaultIconPath = Avatar.DEFAULT_CIRCLE_PLACEHOLDER;
		} else if (sDisplayShape === sap.f.AvatarShape.Square) {
			sDefaultIconPath = Avatar.DEFAULT_SQUARE_PLACEHOLDER;
		}

		return sDefaultIconPath;
	};

	/**
	 * Function returning a control of type <code>Icon</code>. This function just changes the <code>src</code> parameter if the Icon control was already created.
	 *
	 * @returns {sap.ui.core.Control}
	 * @private
	 */
	Avatar.prototype._getIcon = function () {
		var sSrc = this.getSrc(),
			sDisplayShape = this.getDisplayShape();

		if (this._bIsDefaultIcon) {
			sSrc = this._getDefaultIconPath(sDisplayShape);
		}

		if (!this._icon) {
			this._icon = IconPool.createControlByURI({
				alt: "Image placeholder",
				src: sSrc
			});
		} else if (this._icon.getSrc() !== sSrc) {
			this._icon.setSrc(sSrc);
		}

		return this._icon;
	};


	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Avatar.prototype.getAccessibilityInfo = function() {
		var bHasPressListeners = this.hasListeners("press");

		if (!bHasPressListeners) {
			return null;
		}

		return {
			role: bHasPressListeners ? "button" : "img",
			type: sap.ui.getCore().getLibraryResourceBundle("sap.f").getText(bHasPressListeners ? "ACC_CTR_TYPE_BUTTON" : "ACC_CTR_TYPE_IMAGE"),
			focusable: bHasPressListeners
		};
	};

	return Avatar;

}, /* bExport= */ true);
