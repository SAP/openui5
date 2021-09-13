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
	 */
	var SelectType = {
		/**
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Set: "Set",

		/**
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Add: "Add",

		/**
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Remove: "Remove"
	};

	return SelectType;

}, /* bExport= */ true);
