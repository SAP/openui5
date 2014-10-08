/*!
 * ${copyright}
 */

// Provides enumeration for changes in model
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	* @class
	* Change Reason for ListBindings.
	*
	* @static
	* @public
	* @name sap.ui.model.ChangeReason
	*/
	var ChangeReason = {
	
			/**
			 * The list was sorted
			 * @public
			 */
			Sort: "sort",
	
			/**
			 * The List was filtered
			 * @public
			 */
			Filter: "filter",
	
			/**
			 * The list has changed
			 * @public
			 */
			Change: "change",
	
			/**
			 * The list context has changed
			 * @public
			 */
			Context: "context",
			/**
			 * The list was refreshed
			 * @public
			 */
			Refresh: "refresh"
	};

	return ChangeReason;

}, /* bExport= */ true);
