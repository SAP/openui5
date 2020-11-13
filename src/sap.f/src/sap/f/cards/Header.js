/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseHeader",
	"sap/m/library",
	"sap/f/library",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	"sap/f/cards/HeaderRenderer",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText"
], function (
	BaseHeader,
	mLibrary,
	library,
	Text,
	Avatar,
	Device,
	HeaderRenderer,
	Core,
	InvisibleText
) {
	"use strict";

	var AvatarShape = mLibrary.AvatarShape;
	var AvatarColor = mLibrary.AvatarColor;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.f.Card}.
	 *
	 * You can configure the title, subtitle, status text and icon, using the provided properties.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>You should always set a title.</li>
	 * <li>To show a KPI or any numeric information, use {@link sap.f.cards.NumericHeader} instead.</li>
	 * <ul>
	 *
	 * @extends sap.f.cards.BaseHeader
	 * @implements sap.f.cards.IHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.cards.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Header = BaseHeader.extend("sap.f.cards.Header", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * Defines the title.
				 */
				title: { type: "string", defaultValue: "" },

				/**
				 * Defines the subtitle.
				 */
				subtitle: { type: "string", defaultValue: "" },

				/**
				 * Defines the status text.
				 */
				statusText: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines an alt text for the avatar or icon.
				 *
				 * @experimental Since 1.81 this feature is experimental and the API may change.
				 */
				iconAlt: { type: "string", defaultValue: "" },

				/**
				 * Defines a background color for the avatar or icon.
				 *
				 * @experimental Since 1.83 this feature is experimental and the API may change.
				 */
				iconBackgroundColor: { type: "sap.m.AvatarColor", defaultValue: AvatarColor.Transparent }
			},
			aggregations: {

				/**
				 * Defines the inner title control.
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner subtitle control.
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.f.Avatar", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		},
		renderer: HeaderRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Header.prototype.init = function () {
		BaseHeader.prototype.init.apply(this, arguments);

		this._oRb = Core.getLibraryResourceBundle("sap.f");
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oAriaAvatarText = new InvisibleText({id: this.getId() + "-ariaAvatarText"});
		this._oAriaAvatarText.setText(this._oRb.getText("ARIA_HEADER_AVATAR_TEXT"));

	};

	Header.prototype.exit = function () {
		BaseHeader.prototype.exit.apply(this, arguments);

		if (this._oAriaAvatarText) {
			this._oAriaAvatarText.destroy();
			this._oAriaAvatarText = null;
		}
		this._oRb = null;
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner title aggregation
	 */
	Header.prototype._getTitle = function () {
		var oTitle = this.getAggregation("_title");
		if (!oTitle) {
			oTitle = new Text({
				maxLines: 3
			}).addStyleClass("sapFCardTitle");
			this.setAggregation("_title", oTitle);
		}
		return oTitle;
	};

	/**
	 * Lazily creates a subtitle and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner subtitle aggregation
	 */
	Header.prototype._getSubtitle = function () {
		var oSubtitle = this.getAggregation("_subtitle");
		if (!oSubtitle) {
			oSubtitle = new Text({
				maxLines: 2
			}).addStyleClass("sapFCardSubtitle");
			this.setAggregation("_subtitle", oSubtitle);
		}
		return oSubtitle;
	};

	/**
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.f.Avatar} The inner avatar aggregation
	 */
	Header.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	Header.prototype.onBeforeRendering = function () {
		BaseHeader.prototype.onBeforeRendering.apply(this, arguments);

		var oAvatar = this._getAvatar();

		this._getTitle().setText(this.getTitle());
		this._getSubtitle().setText(this.getSubtitle());

		oAvatar.setDisplayShape(this.getIconDisplayShape());
		oAvatar.setSrc(this.getIconSrc());
		oAvatar.setInitials(this.getIconInitials());
		oAvatar.setTooltip(this.getIconAlt());
		oAvatar.setBackgroundColor(this.getIconBackgroundColor());

		this._setAccessibilityAttributes();
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getHeaderAccessibility = function () {
		var sSubtitleId = this.getSubtitle() ? this._getSubtitle().getId() : "",
			sStatusTextId = this.getStatusText() ? this.getId() + "-status" : "",
			sAvatarId = this.getIconSrc() || this.getIconInitials() ? this.getId() + "-ariaAvatarText " : "",
			sIds = sSubtitleId + " " + sStatusTextId + " " + sAvatarId;

		// remove whitespace from both sides
		// and merge the consecutive whitespaces into one
		return sIds.replace(/ {2,}/g, ' ').trim();
	};

	/**
	 * Called after the control is rendered.
	 */
	Header.prototype.onAfterRendering = function() {
		//TODO performance will be affected, but text should clamp on IE also - TBD
		if (Device.browser.msie) {
			if (this.getTitle()) {
				this._getTitle().clampText();
			}
			if (this.getSubtitle()) {
				this._getSubtitle().clampText();
			}
		}
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.ontap = function (oEvent) {
		var srcControl = oEvent.srcControl;
		if (srcControl && srcControl.getId().indexOf("overflowButton") > -1) { // better way?
			return;
		}

		this.firePress();
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.onsapselect = function () {
		this.firePress();
	};

	/**
	 * Sets accessibility to the header to the header.
	 *
	 * @private
	 */
	Header.prototype._setAccessibilityAttributes = function () {
		if (this.hasListeners("press")) {
			this._sAriaRole = "button";
			this._sAriaHeadingLevel = undefined;
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER");
		} else {
			this._sAriaRole = "heading";
			this._sAriaHeadingLevel = "3";
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER");
		}
	};

	Header.prototype.isLoading = function () {
		return false;
	};

	Header.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	Header.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	/**
	 * Returns if the control is inside a sap.f.GridContainer
	 *
	 * @private
	 */
	Header.prototype._isInsideGridContainer = function() {
		var oParent = this.getParent();
		if (!oParent) {
			return false;
		}

		oParent = oParent.getParent();
		if (!oParent) {
			return false;
		}

		return oParent.isA("sap.f.GridContainer");
	};

	return Header;
});
