/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.v2.BatchMode
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	* @class
	* Different modes for retrieving the count of collections
	*
	* @static
	* @public
	* @alias sap.ui.model.odata.CountMode
	*/
	var BatchMode = {
			/**
			 * No batch requests
			 * @public
			 */
			None: "None",

			/**
			 * Batch grouping enabled
			 * @public
			 */
			Group: "Group"
	};

	return BatchMode;

}, /* bExport= */ true);
