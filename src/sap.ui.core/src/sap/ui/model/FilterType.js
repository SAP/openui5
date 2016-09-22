/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.FilterType
sap.ui.define(function() {
	"use strict";


	/**
	* Types of Filters.
	*
	* @enum {string}
	* @public
	* @alias sap.ui.model.FilterType
	*/
	var FilterType = {
			/**
			 * Filters which are changed by the application
			 * @public
			 */
			Application: "Application",

			/**
			 * Filters which are set by the different controls
			 * @public
			 */
			Control: "Control"
	};

	return FilterType;

}, /* bExport= */ true);
