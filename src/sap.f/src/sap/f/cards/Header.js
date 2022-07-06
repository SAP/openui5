/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseHeader",
	"sap/m/library",
	"sap/f/library",
	"sap/m/Text",
	"sap/m/Avatar",
	"sap/f/cards/HeaderRenderer",
	"sap/ui/core/InvisibleText"
], function (
	BaseHeader,
	mLibrary,
	library,
	Text,
	Avatar,
	HeaderRenderer,
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
				 * Limits the number of lines for the title.
				 * @experimental since 1.101
				 */
				titleMaxLines: { type: "int", defaultValue: 3 },

				/**
				 * Defines the subtitle.
				 */
				subtitle: { type: "string", defaultValue: "" },

				/**
				 * Limits the number of lines for the subtitle.
				 * @experimental since 1.101
				 */
				subtitleMaxLines: { type: "int", defaultValue: 2 },

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
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" }
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
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner title aggregation
	 */
	Header.prototype._getTitle = function () {
		var oTitle = this.getAggregation("_title");
		if (!oTitle) {
			oTitle = new Text().addStyleClass("sapFCardTitle");
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
			oSubtitle = new Text().addStyleClass("sapFCardSubtitle");
			this.setAggregation("_subtitle", oSubtitle);
		}
		return oSubtitle;
	};

	/**
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.m.Avatar} The inner avatar aggregation
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

		this._getTitle()
			.setText(this.getTitle())
			.setMaxLines(this.getTitleMaxLines());

		this._getSubtitle()
			.setText(this.getSubtitle())
			.setMaxLines(this.getSubtitleMaxLines());

		var oAvatar = this._getAvatar();

		oAvatar.setDisplayShape(this.getIconDisplayShape());
		oAvatar.setSrc(this.getIconSrc());
		oAvatar.setInitials(this.getIconInitials());
		oAvatar.setTooltip(this.getIconAlt());
		oAvatar.setBackgroundColor(this.getIconBackgroundColor());
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	 Header.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		if (oElement === this.getAggregation("_title")) {
			mAriaProps.role = this.getTitleAriaRole();
			mAriaProps.level = this.getAriaHeadingLevel();
		}
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getAriaLabelledBy = function () {
		var sCardTypeId = "",
			sTitleId = "",
			sSubtitleId = "",
			sStatusTextId = "",
			sAvatarId = "",
			sIds;

		if (this.getParent() && this.getParent()._ariaText) {
			sCardTypeId = this.getParent()._ariaText.getId();
		}

		if (this.getTitle()) {
			sTitleId = this._getTitle().getId();
		}

		if (this.getSubtitle()) {
			sSubtitleId = this._getSubtitle().getId();
		}

		if (this.getStatusText()) {
			sStatusTextId = this.getId() + "-status";
		}

		if (this.getIconSrc() || this.getIconInitials()) {
			sAvatarId = this.getId() + "-ariaAvatarText";
		}

		sIds = sCardTypeId + " " + sTitleId + " " + sSubtitleId + " " + sStatusTextId + " " + sAvatarId;

		// remove whitespace from both sides
		// and merge consecutive spaces into one
		return sIds.replace(/ {2,}/g, ' ').trim();
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

	return Header;
});
