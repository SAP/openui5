/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.FilterType
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	* @class
	* Operators for the Filter.
	*
	* @static
	* @public
	* @name sap.ui.model.FilterType
	*/
	var FilterType = {
			/**
			 * Filters which are changed by the application
			 * @name sap.ui.model.FilterType#Application
			 * @public
			 */
			Application: "Application",
	
			/**
			 * Filters which are set by the different controls
			 * @name sap.ui.model.FilterType#Control
			 * @public
			 */
			Control: "Control"
	};

	return FilterType;

}, /* bExport= */ true);
