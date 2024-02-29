/*!
 * ${copyright}
 */

// Provides type sap.ui.unified.ColorPickerDisplayMode
sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Types of a color picker display mode
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.ColorPickerDisplayMode
	 * @public
	 * @since 1.58.0
	 */
	var ColorPickerDisplayMode = {

		/**
		 * Default display mode.
		 * @public
		 */
		Default : "Default",

		/**
		 * Large display mode.
		 * @public
		 */
		Large : "Large",

		/**
		 * Simplified display mode.
		 * @public
		 */
		Simplified : "Simplified"

	};

	DataType.registerEnum("sap.ui.unified.ColorPickerDisplayMode", ColorPickerDisplayMode);

	return ColorPickerDisplayMode;

});