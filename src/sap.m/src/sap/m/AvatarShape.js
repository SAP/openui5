/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Types of shape for the {@link sap.m.Avatar} control.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarShape
	 * @since 1.73
	 */
	var AvatarShape = {
		/**
		 * Circular shape.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape.
		 * @public
		 */
		Square: "Square"
	};

	DataType.registerEnum("sap.m.AvatarShape", AvatarShape);

	return AvatarShape;
});