/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Types of {@link sap.m.Avatar} based on the displayed content.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarType
	 * @since 1.73
	 */
	var AvatarType = {
		/**
		 * The displayed content is an icon.
		 * @public
		 */
		Icon: "Icon",
		/**
		 * The displayed content is an image.
		 * @public
		 */
		Image: "Image",
		/**
		 * The displayed content is initials.
		 * @public
		 */
		Initials: "Initials"
	};

	DataType.registerEnum("sap.m.AvatarType", AvatarType);

	return AvatarType;
});