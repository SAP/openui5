/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	'sap/f/cards/Data',
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/HeaderRenderer"
], function (
	library,
	Control,
	Text,
	Avatar,
	Device,
	Data,
	JSONModel,
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
	 * A control used to group a set of card attributes in a header.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.62
	 * @alias sap.f.cards.Header
	 */
	var Header = Control.extend("sap.f.cards.Header", {
		metadata: {
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
				iconDisplayShape: { type: "sap.f.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 */
				iconInitials: { type: "string", defaultValue: "" }
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
		}
	});

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
		this._getTitle().setText(this.getTitle());
		this._getSubtitle().setText(this.getSubtitle());
		this._getAvatar().setDisplayShape(this.getIconDisplayShape());
		this._getAvatar().setSrc(this.getIconSrc());
		this._getAvatar().setInitials(this.getIconInitials());
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getHeaderAccessibility = function () {
		var sTitleId = this._getTitle() ? this._getTitle().getId() : "",
			sSubtitleId = this._getSubtitle() ? this._getSubtitle().getId() : "",
			sAvatarId = this._getAvatar() ? this._getAvatar().getId() : "";

		return sTitleId + " " + sSubtitleId + " " + sAvatarId;
	};

	/**
	 * Called after the control is rendered.
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

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.ontap = function () {
		this.firePress();
	};

	/**
	 * Creates an instance of Header with the given options.
	 *
	 * @private
	 * @static
	 * @param {Object} mConfiguration A map containing the header configuration options
	 * @return {sap.f.cards.Header} The created Header
	 */
	Header.create = function(mConfiguration) {
		var mSettings = {
			title: mConfiguration.title,
			subtitle: mConfiguration.subTitle
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

	Header._handleData = function (oHeader, oData) {
		var oModel = new JSONModel();

		var oRequest = oData.request;
		if (oData.json && !oRequest) {
			oModel.setData(oData.json);
		}

		if (oRequest) {
			Data.fetch(oRequest).then(function (data) {
				oModel.setData(data);
				oModel.refresh();
				this.fireEvent("_updated");
			}.bind(this)).catch(function (oError) {
				// TODO: Handle errors. Maybe add error message
			});
		}

		oHeader.setModel(oModel)
			.bindElement({
				path: oData.path || "/"
			});

		// TODO Check if model is destroyed when header is destroyed
	};

	return Header;
});