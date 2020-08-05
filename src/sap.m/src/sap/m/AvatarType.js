/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Types of {@link sap.m.Avatar} based on the displayed content.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarType
	 * @since 1.73
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	return AvatarType;
});