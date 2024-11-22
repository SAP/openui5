/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Possible badge color options for the {@link sap.m.Avatar} control.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>Keep in mind that the colors are theme-dependent and can differ based
	 * on the currently used theme.</li>
	 * </ul>
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarBadgeColor
	 * @since 1.132.0
	 */
	var AvatarBadgeColor = {
		/**
		 * Accent 1
		 *
		 * @public
		 */
		Accent1: "Accent1",
		/**
		 * Accent 2
		 *
		 * @public
		 */
		Accent2: "Accent2",
		/**
		 * Accent 3
		 *
		 * @public
		 */
		Accent3: "Accent3",
		/**
		 * Accent 4
		 *
		 * @public
		 */
		Accent4: "Accent4",
		/**
		 * Accent 5
		 *
		 * @public
		 */
		Accent5: "Accent5",
		/**
		 * Accent 6
		 *
		 * @public
		 */
		Accent6: "Accent6",
		/**
		 * Accent 7
		 *
		 * @public
		 */
		Accent7: "Accent7",
		/**
		 * Accent 8
		 *
		 * @public
		 */
		Accent8: "Accent8",
		/**
		 * Accent 9
		 *
		 * @public
		 */
		Accent9: "Accent9",
		/**
		 * Accent 10
		 *
		 * @public
		 */
		Accent10: "Accent10"
	};

	DataType.registerEnum("sap.m.AvatarBadgeColor", AvatarBadgeColor);

	return AvatarBadgeColor;
});