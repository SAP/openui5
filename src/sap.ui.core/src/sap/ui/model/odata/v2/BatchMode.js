/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.v2.BatchMode
sap.ui.define(function() {
	"use strict";


	/**
	* Different modes for retrieving the count of collections.
	*
	* @enum {string}
	* @public
	* @alias sap.ui.model.odata.v2.BatchMode
	* @deprecated Use {@link sap.ui.model.odata.CountMode} to specify how the count of collections
	*   is retrieved. Use the <code>useBatch</code> parameter of the
	*   {@link sap.ui.model.odata.v2.ODataModel} constructor to specify whether requests are sent in
	*   $batch.
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
