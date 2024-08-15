/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.ReasonMode
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";


	/**
	 * Enumeration of the possible reasons for the search event.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.ReasonMode
	 */
	const ReasonMode = {
		/**
		 * The applied variant is marked as Apply Automatically.
		 * @ui5-restricted sap.ui.mdc
		 * @public
		 */
		Variant: "Variant",

		/**
		 * Enter pressed in filter field.
		 * @public
		 */
		Enter: "Enter",

		/**
		 * Go button pressed.
		 * @public
		 */
		Go: "Go",

		/**
		 * Used if the mentioned reasons are not applicable.
		 * @public
		 */
		Unclear: ""
	};

	DataType.registerEnum("sap.ui.mdc.enums.ReasonMode", ReasonMode);

	return ReasonMode;

});