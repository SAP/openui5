/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Types of image size and position that determine how an image fits in the {@link sap.m.Avatar} control area.
	 *
	 * @enum {string}
	 * @alias sap.m.AvatarImageFitType
	 * @public
	 * @since 1.73
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AvatarImageFitType = {
		/**
		 * The image is scaled to be large enough so that the control area is completely covered.
		 * @public
		 */
		Cover: "Cover",
		/**
		 * The image is scaled to the largest size so that both its width and height can fit in the control area.
		 * @public
		 */
		Contain: "Contain"
	};

	return AvatarImageFitType;
});