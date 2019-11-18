/*!
 * ${copyright}
 */

// Provides control sap.f.AvatarGroupItem.
sap.ui.define([
	"./library",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
	"./Avatar",
	"./AvatarGroupItemRenderer"
], function(library, ManagedObject, Control, Avatar, AvatarGroupItemRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>AvatarGroupItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a single avatar item displayed in the {@link sap.f.AvatarGroup} control.
	 *
	 *  <h3>Overview</h3>
	 *  The <code>AvatarGroupItem</code> control allows you to define additional properties
	 *  that are applied when rendering each <code>AvatarGroupItem</code> instance
	 *  in the {@link sap.f.AvatarGroup} control.
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since 1.73. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.73
	 * @alias sap.f.AvatarGroupItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AvatarGroupItem = Control.extend("sap.f.AvatarGroupItem", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * Determines the path to the desired image or icon.
				 */
				src: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},
				/**
				 * Defines the displayed initials.
				 */
				initials: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Defines the fallback icon displayed in case of wrong image src and no initials set.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>If not set, a default fallback icon is displayed.</li>
				 * <li>Accepted values are only icons from the SAP icon font.</li>
				 * </ul>
				 *
				 */
				fallbackIcon: {type: "string", group: "Data", defaultValue: null}
			}
		}
	});

	AvatarGroupItem.prototype.onBeforeRendering = function () {
		this._getAvatar();
	};

	AvatarGroupItem.prototype.destroy = function () {
		if (this._oAvatar) {
			this._oAvatar.destroy();
			this._oAvatar = null;
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		ManagedObject.prototype.destroy.apply(this);
	};

	AvatarGroupItem.prototype.setSrc = function (sValue) {
		if (this.getSrc() === sValue) {
			return this;
		}

		this._getAvatar().setSrc(sValue);

		return this.setProperty("src", sValue);
	};

	AvatarGroupItem.prototype.setInitials = function (sValue) {
		if (this.getInitials() === sValue) {
			return this;
		}

		this._getAvatar().setInitials(sValue);

		return this.setProperty("initials", sValue);
	};

	AvatarGroupItem.prototype.setFallbackIcon = function (sValue) {
		if (this.getFallbackIcon() === sValue) {
			return this;
		}

		this._getAvatar().setFallbackIcon(sValue);

		return this.setProperty("fallbackIcon", sValue);
	};

	/**
	 * Returns the color of the avatar.
	 *
	 * @returns {string} The color of the avatar
	 * @public
	 */
	AvatarGroupItem.prototype.getAvatarColor = function () {
		return this._sAvatarColor;
	};


	AvatarGroupItem.prototype._setGroupType = function (sValue) {
		this._sGroupType = sValue;

		this.invalidate();
	};

	AvatarGroupItem.prototype._getGroupType = function () {
		return this._sGroupType;
	};

	AvatarGroupItem.prototype._setAvatarColor = function (sValue) {
		this._sAvatarColor = sValue;
		this._getAvatar().setBackgroundColor(sValue);
	};

	AvatarGroupItem.prototype._setDisplaySize = function (sValue) {
		this._sAvatarDisplaySize = sValue;
		this._getAvatar().setDisplaySize(sValue);
	};

	AvatarGroupItem.prototype._getDisplaySize = function () {
		return this._sAvatarDisplaySize;
	};

	/**
	 * Returns the <code>Avatar</code>
	 *
	 * @returns {sap.f.Avatar} The <code>Avatar</code> instance
	 * @private
	 */
	AvatarGroupItem.prototype._getAvatar = function () {
		if (!this._oAvatar) {
			this._oAvatar = new Avatar({
				src: this.getSrc(),
				initials: this.getInitials(),
				fallbackIcon: this.getFallbackIcon(),
				backgroundColor: this.getAvatarColor(),
				showBorder: true,
				displaySize: this._getDisplaySize()
			});
		}

		return this._oAvatar;
	};

	return AvatarGroupItem;
});