/*!
 * ${copyright}
 */

// Provides control sap.f.Avatar.
sap.ui.define([
  "sap/m/Avatar",
	"sap/m/AvatarRenderer",
	"./library"
], function(MAvatar, AvatarRenderer/*, library */) {
	"use strict";

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
	 * Up to two Latin letters can be displayed as initials in an <code>Avatar</code>. If there
	 * are more than two letters, or if there's a non-Latin character present, a default image
	 * placeholder will be created.
	 *
	 * @extends sap.m.Avatar
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.73. Use the {@link sap.m.Avatar} instead.
	 * @since 1.46
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/avatar/ Avatar}
	 * @alias sap.f.Avatar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Avatar = MAvatar.extend("sap.f.Avatar", {
		metadata: {
			library: "sap.f",
			properties: { },
			designtime: "sap/f/designtime/Avatar.designtime"
		},
		renderer: AvatarRenderer
	});

	Avatar.prototype._getDefaultTooltip = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.f").getText("AVATAR_TOOLTIP");
	};

	return Avatar;
});