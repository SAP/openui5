/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enum.SelectType
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible selection types
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.90.1
	 * @alias sap.ui.mdc.enum.SelectType
     * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ValueHelpSelectionType}
	 */
	var SelectType = {
		/**
		 * The given conditions are set and replace the existing ones.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Set: "Set",

		/**
		 * The given conditions are just added to the existing ones, if they don't already exist.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Add: "Add",

		/**
		 * The given conditions are removed.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Remove: "Remove"
	};

	return SelectType;

}, /* bExport= */ true);
