/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.ReasonMode
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible reasons for the search event.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.ReasonMode
	 */
	const ReasonMode = {
		/**
		 * The applied variant is marked as Apply Automatically.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Variant: "Variant",

		/**
		 * Enter pressed in filter field.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Enter: "Enter",

		/**
		 * Go button pressed.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Go: "Go",

		/**
		 * Used if the mentioned reasons are not applicable.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Unclear: ""
	};

	return ReasonMode;

}, /* bExport= */ true);
