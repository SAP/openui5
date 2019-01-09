/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	"sap/f/cards/HeaderRenderer"
], function (
	library,
	Control,
	Text,
	Avatar,
	Device,
	HeaderRenderer
) {
	"use strict";

	var AvatarShape = library.AvatarShape;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.60
	 * @see {@link TODO Card}
	 * @alias sap.f.cards.Header
	 */
	var Header = Control.extend("sap.f.cards.Header", {
		metadata: {
			interfaces: ["sap.f.cards.IHeader"],
			properties: {
				title: { type: "string", defaultValue: "" },
				subtitle: { type: "string", defaultValue: "" },
				statusText: { type: "string", defaultValue: "" },
				iconDisplayShape: { type: "sap.f.AvatarShape", defaultValue: AvatarShape.Circle },
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },
				iconInitials: { type: "string", defaultValue: "" }
			},
			aggregations: {
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_avatar: { type: "sap.f.Avatar", multiple: false, visibility: "hidden" }
			},
			events: {
				press: {}
			}
		}
	});

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

	Header.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
	};

	Header.prototype.onBeforeRendering = function () {
		this._getTitle().setText(this.getTitle());
		this._getSubtitle().setText(this.getSubtitle());
		this._getAvatar().setDisplayShape(this.getIconDisplayShape());
		this._getAvatar().setSrc(this.getIconSrc());
		this._getAvatar().setInitials(this.getIconInitials());
	};

	/**
	 * Called after control is rendered.
	 * @private
	 */
	Header.prototype.onAfterRendering = function() {
		//TODO performance will be afected, but text should clamp on IE also - TBD
		if (Device.browser.msie) {
			if (this.getTitle()) {
				this._getTitle().clampText();
			}
			if (this.getSubtitle()) {
				this._getSubtitle().clampText();
			}
		}
	};

	Header.prototype.ontap = function () {
		this.firePress();
	};

	/**
	 * Creates an instance of Header with the given options
	 *
	 * @private
	 * @static
	 * @param {map} mConfiguration A map containing the header configuration options.
	 * @return {sap.f.cards.Header} The created Header
	 */
	Header.create = function(mConfiguration) {
		var mSettings = {
			title: mConfiguration.title,
			subtitle: mConfiguration.subtitle
		};

		if (mConfiguration.icon) {
			mSettings.iconSrc = mConfiguration.icon.src;
			mSettings.iconDisplayShape = mConfiguration.icon.shape;
			mSettings.iconInitials = mConfiguration.icon.text;
		}

		if (mConfiguration.status) {
			mSettings.statusText = mConfiguration.status.text;
		}

		var oHeader = new Header(mSettings);

		return oHeader;
	};

	return Header;
});