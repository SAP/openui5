/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Predefined sizes for the {@link sap.m.Avatar} control.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarSize
	 * @since 1.73
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AvatarSize = {
		/**
		 * Control size - 2rem
		 * Font size - 0.75rem
		 * @public
		 */
		XS: "XS",

		/**
		 * Control size - 3rem
		 * Font size - 1.125rem
		 * @public
		 */
		S: "S",

		/**
		 * Control size - 4rem
		 * Font size - 1.625rem
		 * @public
		 */
		M: "M",

		/**
		 * Control size - 5rem
		 * Font size - 2rem
		 * @public
		 */
		L: "L",

		/**
		 * Control size - 7rem
		 * Font size - 2.75rem
		 * @public
		 */
		XL: "XL",

		/**
		 * Custom size
		 * @public
		 */
		Custom: "Custom"
	};

	return AvatarSize;
});