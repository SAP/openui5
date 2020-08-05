/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Possible background color options for the {@link sap.m.Avatar} control.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>Keep in mind that the colors are theme-dependent and can differ based
	 * on the currently used theme.</li>
	 * <li> If the <code>Random</code> value is assigned, a random color is
	 * chosen from the accent options (Accent1 to Accent10).</li>
	 * </ul>
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarColor
	 * @since 1.73
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AvatarColor = {
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
		Accent10: "Accent10",
		/**
		 * Random color, chosen from the accent options (Accent1 to Accent10)
		 *
		 * @public
		 */
		Random: "Random",
		/**
		 * Transparent
		 *
		 * @public
		 */
		Transparent: "Transparent",
		/**
		 * Recommended when used as an icon in a tile.
		 *
		 * @public
		 */
		TileIcon: "TileIcon",
		/**
		 * Recommended when used as a placeholder (no image or initials are provided).
		 *
		 * @public
		 */
		Placeholder: "Placeholder"
	};

	return AvatarColor;
});