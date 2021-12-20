/*
 * ! ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/core/Core"
], function(
	TableDelegate,
	Core
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var ODataTableDelegate = Object.assign({}, TableDelegate);

	/**
	 * Updates the binding info with the relevant path and model from the metadata.
	 *
	 * @param {Object} oTable The MDC table instance
	 * @param {Object} oBindingInfo The bindingInfo of the table
	 */
	ODataTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);

		var oFilterBar = Core.byId(oTable.getFilter());

		if (oFilterBar) {
			// get the basic search
			var sSearchText = oFilterBar.getSearch instanceof Function ? oFilterBar.getSearch() :  "";
			if (sSearchText && sSearchText.indexOf(" ") === -1) { // to allow search for "(".....
				sSearchText = '"' + sSearchText + '"'; // TODO: escape " in string
			} // if it contains spaces allow opeartors like OR...
			oBindingInfo.parameters.$search = sSearchText || undefined;
		}

	};

	return ODataTableDelegate;
});
