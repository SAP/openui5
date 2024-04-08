/*!
 * ${copyright}
 */

// Provides control sap.m.Avatar.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"./AvatarRenderer",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/core/Icon",
	"./library",
	"sap/ui/core/library",
	'sap/ui/core/InvisibleText',
	'sap/m/imageUtils/getCacheBustedUrl'
], function(Control, IconPool, AvatarRenderer, Library, KeyCodes, Log, Icon, library, coreLibrary, InvisibleText, getCacheBustedUrl) {
	"use strict";

	// shortcut for sap.m.AvatarType
	var AvatarType = library.AvatarType;

	// shortcut for sap.m.AvatarImageFitType
	var AvatarImageFitType = library.AvatarImageFitType;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = library.AvatarColor;

	// shortcut for sap.m.AvatarSize
	var AvatarSize = library.AvatarSize;

	// shortcut for sap.m.AvatarShape
	var AvatarShape = library.AvatarShape;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for Accent colors keys only (from AvatarColor enum)
	var AccentColors = Object.keys(AvatarColor).filter(function (sCurrColor) {
		return sCurrColor.indexOf("Accent") !== -1;
	});

	/**
	 * Constructor for a new <code>Avatar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An image-like control that has different display options for representing images, initials,
	 * and icons.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>Avatar</code> control allows the usage of different content, shapes, and sizes
	 * depending on the use case.
	 *
	 * The content types that can be displayed are either images, icons, or initials. The shape
	 * can be circular or square. There are several predefined sizes, as well as an option to
	 * set a custom size.
	 *
	 * <h3>Usage</h3>
	 *
	 * Up to three Latin letters can be displayed as initials in an <code>Avatar</code>. If there
	 * are more than three letters, or if there's a non-Latin character present, a default image
	 * placeholder will be created.
	 *
	 * There are two options for how the displayed image can fit inside the
	 * available area:
	 * <ul>
	 * <li>Cover - the image is scaled to cover all of the available area</li>
	 * <li>Contain - the image is scaled as large as possible while both
	 * its height and width fit inside the avalable area</li>
	 * </ul>
	 * <b>Note:</b> To set a custom size for the <code>Avatar</code>, you have to choose the <code>Custom</code>
	 * value for the <code>displaySize</code> property. Then, you have to set both the
	 * <code>customDisplaySize</code> and <code>customFontSize</code> properties.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.73
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/avatar/ Avatar}
	 * @alias sap.m.Avatar
	 */
	var Avatar = Control.extend("sap.m.Avatar", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Determines the path to the desired image or icon.
				 */
				src: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},
				/**
				 * Defines the displayed initials. They should consist of only 1,2 or 3 latin letters.
				 */
				initials: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Defines the shape of the <code>Avatar</code>.
				 */
				displayShape: {type: "sap.m.AvatarShape", group: "Appearance", defaultValue: AvatarShape.Circle},
				/**
				 * Sets a predefined display size of the <code>Avatar</code>.
				 */
				displaySize: {type: "sap.m.AvatarSize", group: "Appearance", defaultValue: AvatarSize.S},
				/**
				 * Specifies custom display size of the <code>Avatar</code>.
				 *
				 *<b>Note:</b> It takes effect if the <code>displaySize</code> property is set to <code>Custom</code>.
				 */
				customDisplaySize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "3rem"},
				/**
				 * Specifies custom font size of the <code>Avatar</code>.
				 *
				 *<b>Note:</b> It takes effect if the <code>displaySize</code> property is set to <code>Custom</code>.
				 */
				customFontSize: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "1.125rem"},
				/**
				 * Specifies how an image would fit in the <code>Avatar</code>.
				 */
				imageFitType: {type: "sap.m.AvatarImageFitType", group: "Appearance", defaultValue: AvatarImageFitType.Cover},
				/**
				 * Defines the fallback icon displayed in case of wrong image src and no initials set.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>If not set, a default fallback icon is displayed depending on the set <code>displayShape</code> property.</li>
				 * <li>Accepted values are only icons from the SAP icon font.</li>
				 * </ul>
				 */
				fallbackIcon: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Determines the background color of the control.
				 */
				backgroundColor: {type: "sap.m.AvatarColor", group: "Appearance", defaultValue: AvatarColor.Accent6},

				/**
				 * Determines whether the control is displayed with border.
				 */
				showBorder: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines what type of icon is displayed as visual affordance. It can be predefined or custom.
				 *
				 * The predefined icons are recommended for:
				 * <ul>
				 * <li>Suggesting a zooming action: <code>sap-icon://zoom-in</code></li>
				 * <li>Suggesting an image change: <code>sap-icon://camera</code></li>
				 * <li>Suggesting an editing action: <code>sap-icon://edit</code></li>
				 * </ul>
				 *
				 * @since 1.77
				 */
				badgeIcon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""},
				/**
				 * Defines a custom tooltip for the <code>badgeIcon</code>. If set, it overrides the available default values.
				 *
				 * If not set, default tooltips are used as follows:
				 * <ul>
				 * <li>Specific default tooltips are displayed for each of the predefined <code>badgeIcons</code>.</li>
				 * <li>For any other icons, the displayed tooltip is the same as the main control tooltip.</li>
				 * <ul>
				 *
				 * @since 1.77
				 */
				badgeTooltip: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Defines whether the <code>sap.m.Avatar</code> is used for decorative purposes and is ignored by accessibility tools.
				 *
				 * <b>Note:</b> This property doesn't take effect if <code>sap.m.Avatar</code> has a <code>press</code> handler.
				 *
				 * @since 1.97
				 */
				decorative : {type : "boolean", group : "Accessibility", defaultValue : false},

				/**
				 * Specifies the value of the <code>aria-haspopup</code> attribute
				 *
				 * If the value is <code>None</code>, the attribute will not be rendered. Otherwise it will be rendered with the selected value.
				 *
				 * NOTE: Use this property only when an avatar is related to a popover/popup. The value needs to be equal to the main/root role of the popup - e.g. dialog,
				 * menu or list (examples: if you have dialog -> dialog, if you have menu -> menu; if you have list -> list; if you have dialog containing a list -> dialog).
				 * Do not use it, if you open a standard sap.m.Dialog, MessageBox or other type of dialogs displayed as on overlay over the application.
				 *
				 * @since 1.99.0
				 */
				ariaHasPopup : {type : "sap.ui.core.aria.HasPopup", group : "Accessibility", defaultValue : AriaHasPopup.None},

				/**
				 * Visualizes the validation state of the badge, e.g. <code>Error</code>, <code>Warning</code>,
				 * <code>Success</code>, <code>Information</code>.
				 * @since 1.116.0
				 */
				badgeValueState: {
					type: "sap.ui.core.ValueState",
					group: "Appearance",
					defaultValue: ValueState.None
				},

				/**
				 * Determines whether the <code>Avatar</code> is enabled (default is set to <code>true</code>).
				 * A disabled <code>Button</code> has different colors depending on the {@link sap.m.AvatarColor AvatarColor}.
				 * @since 1.117.0
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Determines whether the <code>Avatar</code> is active/toggled (default is set to <code>false</code>).
				 * Active state is meant to be toggled when user clicks on the <code>Avatar</code>.
				 * The Active state is only applied, when the <code>Avatar</code> has <code>press</code> listeners.
				 * @since 1.120.0
				 */
				active : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			aggregations : {
				/**
				 * A <code>sap.m.LightBox</code> instance, that will be opened automatically when the user interacts with the <code>Avatar</code> control.
				 *
				 * The <code>press</code> event will still be fired.
				 * @public
				 */
				detailBox: {type: 'sap.m.LightBox', multiple: false, bindable: "bindable"},
				/**
				 * A <code>sap.ui.core.Icon</code> instance that shows the badge icon of the <code>Avatar</code> control.
				 * @private
				 */
				_badge: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				/**
				 * A <code>sap.ui.core.Icon</code> instance that shows the icon of the <code>Avatar</code> control.
				 * @private
				 */
				_icon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
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
				 * Fired when the user selects the control.
				 */
				press: {}
			},
			dnd: { draggable: true, droppable: false },
			designtime: "sap/m/designtime/Avatar.designtime"
		},

		renderer: AvatarRenderer
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

	/**
	 * The predefined values for tooltip, when <code>badgeIcon</code> is set.
	 *
	 * @type {string}
	 */
	Avatar.AVATAR_BADGE_TOOLTIP = {
		"sap-icon://zoom-in" : Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),
		"sap-icon://camera": Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP_CAMERA"),
		"sap-icon://edit": Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP_EDIT")
	};

	Avatar.prototype.init = function () {
		// Property holding the actual display type of the avatar
		this._sActualType = null;
		// Property that determines if the created icon is going to be the default one
		this._bIsDefaultIcon = true;
		this._sImageFallbackType = null;

		// Property holding the currently picked random background color of the avatar, if any
		this._sPickedRandomColor = null;

		//Reference to badge hidden aggregation
		this._badgeRef = null;

		this._bImageLoadError = false;
	};

	Avatar.prototype.onBeforeRendering = function () {
		if (this._getImageCustomData() && !this._iCacheBustingValue) {
			this._setNewCacheBustingValue();
			this._validateSrc(this._getAvatarSrc());
		}
	};

	Avatar.prototype.onAfterRendering = function() {
		this._checkInitialsHolderWidth();

		if (this._bImageLoadError) {
			this._cleanCSS();
		}
	};

	Avatar.prototype.setSrc = function (sSrc) {
		this._bImageLoadError = false;

		this.setProperty("src", sSrc);
		this._validateSrc(this._getAvatarSrc());

		return this;
	};

	Avatar.prototype.onThemeChanged = function() {
		this._checkInitialsHolderWidth();
	};

	Avatar.prototype.exit = function () {
		if (this._fnLightBoxOpen) {
			this._fnLightBoxOpen = null;
		}

		if (this._badgeRef) {
			this._badgeRef.destroy();
		}

		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			this._oInvisibleText = null;
		}

		this._sPickedRandomColor = null;
	};

	/**
	 * Sets the <code>detailBox</code> aggregation.
	 * @param {sap.m.LightBox|undefined} oLightBox - Instance of the <code>LightBox</code> control or undefined
	 * @returns {this} <code>this</code> for chaining
	 * @override
	 * @public
	 */
	Avatar.prototype.setDetailBox = function (oLightBox) {
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

			// Bind the LightBox open method to the press event of the Avatar
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
	 * Destroys the <code>detailBox</code> aggregation.
	 * @returns {this} <code>this</code> for chaining
	 * @override
	 * @public
	 */
	Avatar.prototype.destroyDetailBox = function () {
		var oCurrentDetailBox = this.getDetailBox();

		if (oCurrentDetailBox) {
			this.detachPress(this._fnLightBoxOpen, oCurrentDetailBox);
			this._fnLightBoxOpen = null;

		}

		return this.destroyAggregation("detailBox");
	};

	Avatar.prototype.setBadgeValueState = function(sValue) {

		Object.keys(ValueState).forEach(function(val){
			this.toggleStyleClass('sapFAvatar' + val, val === sValue);
		}.bind(this));

		this.setProperty("badgeValueState", sValue, true);
		return this;
	};

	/*
	 * @override
	 */
	Avatar.prototype.clone = function () {
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
			this.$().attr("role", "img");
		}

		return this;
	};

	/**
	 * Called when the <code>Avatar</code> is selected.
	 *
	 * @private
	 */
	Avatar.prototype.ontap = function () {
		this._handlePress();
	};

	/**
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Avatar.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			this._bShouldInterupt = this._bSpacePressed;
		}

		if (oEvent.which === KeyCodes.SPACE) {
			this._bSpacePressed = true;

			// To prevent the browser scrolling.
			oEvent.preventDefault();
		}

		if (oEvent.which === KeyCodes.ENTER) {
			this._handlePress();
		}
	};

	/**
	 * Handles the key up event for SPACE.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Avatar.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bShouldInterupt) {
				this._handlePress();
			}

			this._bShouldInterupt = false;
			this._bSpacePressed = false;

			//stop the propagation, it is handled by the control
			oEvent.stopPropagation();
		}
	};

	Avatar.prototype._handlePress = function () {
		if (!this.getEnabled() || (this._bIsDefaultIcon && this.getDetailBox())) {
			return;
		}
		this.firePress({/* no parameters */});
	};

	/**
	 * Checks the validity of the <code>initials</code> parameter and returns <code>true</code> if the
	 * initials are correct.
	 *
	 * @param {string} sInitials The initials value
	 * @returns {boolean} The initials are valid or not
	 * @private
	 */
	 Avatar.prototype._areInitialsValid = function (sInitials) {
		var validInitials = /^[a-zA-Z\xc0-\xd6\xd8-\xdc\xe0-\xf6\xf8-\xfc]{1,3}$/;
		if (!validInitials.test(sInitials)) {
			Log.warning("Initials should consist of only 1,2 or 3 latin letters", this);
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = true;
			return false;
		}

		return true;
	};

	/**
	 * Validates the <code>src</code> parameter, and sets the actual type appropriately.
	 *
	 * @param {string} sSrc
	 * @returns {this}
	 * @private
	 */
	Avatar.prototype._validateSrc = function (sSrc) {
		if (IconPool.isIconURI(sSrc)) {
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = IconPool.getIconInfo(sSrc) ? false : true;
		} else {
			this._sActualType = AvatarType.Image;

			// we perform this action in order to validate the image source and
			// take further actions depending on that
			this.preloadedImage = new window.Image();
			this.preloadedImage.src = sSrc;
			this.preloadedImage.onload = this._onImageLoad.bind(this);
			this.preloadedImage.onerror = this._onImageError.bind(this);
		}

		return this;
	};

	/**
	 * Validates the <code>src</code> parameter, and returns sap.ui.core.Icon object.
	 *
	 * @param {string} sSrc
	 * @returns {sap.ui.core.Icon|null}
	 * @private
	 */
	Avatar.prototype._getDisplayIcon = function (sSrc) {

		return IconPool.isIconURI(sSrc) && IconPool.getIconInfo(sSrc) ?
			IconPool.createControlByURI({
				src: sSrc
			}) : null;
	};

	/**
	 * Validates the entered parameters, and returns what the actual display type parameter would be.
	 *
	 * @returns {sap.m.AvatarType}
	 * @private
	 */
	Avatar.prototype._getActualDisplayType = function () {
		var sSrc = this._getAvatarSrc(),
			sInitials = this.getInitials();

		if (sSrc) {
			return this._sActualType;
		} else if (sInitials && this._areInitialsValid(sInitials)) {
			this._sActualType = AvatarType.Initials;
		} else {
			Log.warning("No src and initials were provided", this);
			this._sActualType = AvatarType.Icon;
			this._bIsDefaultIcon = true;
		}

		return this._sActualType;
	};

	/**
	 * Indicates what type of fallback we should show if there is invalid image source.
	 *
	 * @returns {sap.m.AvatarType}
	 * @private
	 */
	Avatar.prototype._getImageFallbackType = function () {
		var sInitials = this.getInitials();

		this._sImageFallbackType = sInitials && this._areInitialsValid(sInitials) ?
			AvatarType.Initials : AvatarType.Icon;

		return this._sImageFallbackType;
	};

	/**
	 * Returns the path for the default icon, based on the value of the <code>DisplayShape</code> property.
	 *
	 * @param {sap.m.AvatarShape} sDisplayShape
	 * @returns {string} the default icon
	 * @private
	 */
	Avatar.prototype._getDefaultIconPath = function (sDisplayShape) {
		var sDefaultIconPath = null,
			sFallbackIcon = this.getFallbackIcon();

		if (sFallbackIcon && IconPool.isIconURI(sFallbackIcon)) {
			sDefaultIconPath = sFallbackIcon;
		} else if (sDisplayShape === AvatarShape.Circle) {
			sDefaultIconPath = Avatar.DEFAULT_CIRCLE_PLACEHOLDER;
		} else if (sDisplayShape === AvatarShape.Square) {
			sDefaultIconPath = Avatar.DEFAULT_SQUARE_PLACEHOLDER;
		}

		return sDefaultIconPath;
	};

	/**
	 * Returns a control of type <code>Icon</code> and changes the <code>src</code> value if the
	 * <code>Icon</code> control was already created.
	 *
	 * @returns {sap.ui.core.Control}
	 * @private
	 */
	Avatar.prototype._getIcon = function () {
		var sSrc = this.getSrc(),
			oIcon = this.getAggregation("_icon"),
			sDisplayShape = this.getDisplayShape(),
			bIsIconURI = IconPool.isIconURI(sSrc),
			sDefaultIconPath = this._getDefaultIconPath(sDisplayShape);

		if (this._bIsDefaultIcon) {
			sSrc = sDefaultIconPath;
		}

		if (!oIcon) {
			oIcon = IconPool.createControlByURI({
				alt: "Image placeholder",
				src: bIsIconURI ? sSrc : sDefaultIconPath
			});
			this.setAggregation("_icon", oIcon);
		} else if (oIcon.getSrc() !== sSrc && (bIsIconURI || sSrc === sDefaultIconPath)) {
			oIcon.setSrc(sSrc);
		}

		return oIcon;
	};

	Avatar.prototype._getDefaultTooltip = function() {
		return Library.getResourceBundleFor("sap.m").getText("AVATAR_TOOLTIP");
	};

	Avatar.prototype._getBadgeIconSource = function() {
		var sBadgeIconPath;

		if (this.getDetailBox()) {
			sBadgeIconPath = "sap-icon://zoom-in";
		} else if (this.getBadgeIcon() !== "") {
			if (this._getDisplayIcon(this.getBadgeIcon())) {
				sBadgeIconPath = this.getBadgeIcon();
			} else {
				Log.warning("No valid Icon URI source for badge affordance was provided");
			}
		}

		return sBadgeIconPath;
	};

	Avatar.prototype._getBadgeTooltip = function() {
		var sBadgeTooltip = this._getDefaultTooltip(),
			sBadgeIcon = this.getBadgeIcon();

		if (this.getBadgeTooltip()) {
			sBadgeTooltip = this.getBadgeTooltip();
		} else if ( sBadgeIcon && Avatar.AVATAR_BADGE_TOOLTIP[this.getBadgeIcon()]) {
			sBadgeTooltip = Avatar.AVATAR_BADGE_TOOLTIP[sBadgeIcon];
		}
		return sBadgeTooltip;
	};


	Avatar.prototype._getBadge = function () {
		var sBadgeIconSrc = this._getBadgeIconSource(),
			sBadgeTooltip = this._getBadgeTooltip();

		if (!sBadgeIconSrc) {return;}

		if (!this._badgeRef) {
			this.setAggregation("_badge", new Icon({
				src: sBadgeIconSrc,
				tooltip: sBadgeTooltip
			}));
		}

		this._badgeRef = this.getAggregation("_badge");
		return this._badgeRef;
	};

	/**
	 * We use this callback to make sure we hide fallback content if our original image source
	 * is loaded.
	 *
	 * @private
	 */
	Avatar.prototype._onImageLoad = function() {
		//we need to remove fallback content
		if (this._bIsDefaultIcon) {
			this._bIsDefaultIcon = false;
			this.getDetailBox() && this.invalidate();
		}
		delete this.preloadedImage;
	};

	/**
	 * We use the negative callback to clean the useless property.
	 *
	 * @private
	 */
	 Avatar.prototype._onImageError = function() {
		this._cleanCSS();

		if (!this._bIsDefaultIcon) {
			this._bIsDefaultIcon = true;
			this.getDetailBox() && this.invalidate();
		}
		delete this.preloadedImage;
		this._bImageLoadError = true;
	};

	Avatar.prototype._cleanCSS = function () {
		var sFallBackType = this._getImageFallbackType();

		this.$().removeClass("sapFAvatarImage")
			.addClass("sapFAvatar" + sFallBackType);
	};

	/**
	 * Returns the actual background color.
	 *
	 * @returns {sap.m.AvatarColor} The actual background color
	 * @private
	 */
	Avatar.prototype._getActualBackgroundColor = function() {
		var sBackground = this.getBackgroundColor();

		if (sBackground === AvatarColor.Random) {

			// If the last time the "backgroundColor" property was "Random", we return the last rolled color.
			// This is needed in order to prevent picking different colors on re-rendering
			// of the control if the property keeps being "Random".
			if (this._sPickedRandomColor) {
				return this._sPickedRandomColor;
			}

			// Picking a random Accent property from the AvatarColor enum
			// << 0 truncates the digits after the decimal (it's the same as Math.trunc())
			sBackground = this._sPickedRandomColor = AvatarColor[AccentColors[AccentColors.length * Math.random() << 0]];
		} else {
			// In case the "backgroundColor" is different from "Random", we set the
			// this._sPickedRandomColor to "null". This is needed in order to generate
			// a new random color the next time "backgroundColor" is "Random".
			this._sPickedRandomColor = null;
		}

		return sBackground;
	};

	// Checks the scrollWidth of the initials holder inside the control.
	// This is related with the initials property and the case where there are 3 letter initials,
	// which width is bigger than the initials holder`s width.

	Avatar.prototype._checkInitialsHolderWidth = function() {
		var $this = this.$(),
			iInitials = this.getInitials().length;

		this.$oInitialsHolder = $this.children(".sapFAvatarInitialsHolder");

			if (this.$oInitialsHolder.length !== 0 && iInitials === 3) {
				var iAvatarWidth = $this[0].offsetWidth,
				iInitialsHolderWidth = this.$oInitialsHolder[0].offsetWidth;

				if (iInitialsHolderWidth >= iAvatarWidth) {
					this._wideInitialsIcon();
				}
			}
	};

	// In case when there are 3 initials set to the avatar and they are overflowing,
	// we want to show icon inatead of the initials.

	Avatar.prototype._wideInitialsIcon = function() {
		var $this = this.$(),
			$oHiddenIcon = 	$this.children(".sapFAvatarHiddenIcon");

		$oHiddenIcon.removeClass("sapFAvatarHiddenIcon");
		this.$oInitialsHolder.css("display", "none");

		$this.removeClass("sapFAvatarInitials");
		$this.addClass("sapFAvatarIcon");
	};

	Avatar.prototype._getInvisibleText = function() {

		if (!this._oInvisibleText && this.sInitials) {
			this._oInvisibleText = new InvisibleText({ id: this.getId() + "-InvisibleText"});
			this._oInvisibleText.setText(this.sInitials).toStatic();
		}

		return this._oInvisibleText;
	};

	Avatar.prototype._getAriaLabelledBy = function () {
		var aLabelledBy = this.getAriaLabelledBy(),
			sInitialsAriaLabelledBy;
			this.sInitials = this.getInitials();

		if (this.sInitials && aLabelledBy.length > 0) {
			sInitialsAriaLabelledBy = this._getInvisibleText().getId();
			aLabelledBy.push(sInitialsAriaLabelledBy);
		}
		return aLabelledBy;
	};

	/**
	 * Retrieves the custom data object for the Avatar control.
	 *
	 * @function
	 * @param {sap.m.Avatar} oAvatar - The Avatar control to retrieve the custom data for.
	 * @returns {sap.m.ImageCustomData|undefined} The custom data object or undefined if no custom data is found.
	 * @private
	 */
	Avatar.prototype._getImageCustomData = function (oAvatar) {
		var oImageCustomData = this.getCustomData().filter(function (item) {
			return item.isA("sap.m.ImageCustomData");
		});
		return oImageCustomData.length ? oImageCustomData[0] : undefined;
	};

	/**
	 * Sets the cache busting value for the Avatar control.
	 * This is needed in order to force the browser to reload the image.
	 *
	 * @function
	 * @private
	 */
	Avatar.prototype._setNewCacheBustingValue = function () {
		if (this._getImageCustomData()) {
			this._iCacheBustingValue = Date.now();
		}
	};

	/**
	 * Returns the Avatar control's source URL with cache busting applied if necessary, based on the ImageCustomData configuration.
	 * If cache busting is applied, the source URL is updated; otherwise, the original source URL is returned.
	 *
	 * @function
	 * @returns {string} sSrc - The Avatar control's source URL
	 * @private
	 */
	Avatar.prototype._getAvatarSrc = function () {
		var aImageCustomData = this._getImageCustomData(),
			sSrc = this.getSrc();

		if (aImageCustomData && sSrc) {
			var oConfig = {
				sUrl: sSrc,
				sParamName: aImageCustomData.getParamName(),
				sParamValue: this._iCacheBustingValue
			};

			return getCacheBustedUrl(oConfig);
		}

		return sSrc;
	};

	/**
 	 * Refreshes the cache busting value for the Avatar and invalidates the control.
	 * It can be used when you have applied ImageCustomData to the Avatar control and you want to force the browser to reload the image.
	 *
	 * @function
	 * @private
	 * @ui5-restricted sap.fe
	 */
	Avatar.prototype.refreshAvatarCacheBusting = function () {
		this._setNewCacheBustingValue();
		this._validateSrc(this._getAvatarSrc());
		this.invalidate();
	};

	return Avatar;

});