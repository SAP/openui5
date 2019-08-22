/*!
 * ${copyright}
 */

// Provides type sap.ui.unified.ColorPickerDisplayMode
sap.ui.define([], function() {
	"use strict";

	/**
	 * Types of a color picker display mode
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.ColorPickerDisplayMode
	 * @public
	 * @since 1.58.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	return ColorPickerDisplayMode;

});