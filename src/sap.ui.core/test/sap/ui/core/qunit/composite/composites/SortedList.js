sap.ui.define([
	"sap/ui/core/XMLComposite"
], function (XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.SortedList", {
		metadata : {
			aggregations : {
				sortedItems : { type : "sap.ui.core.Item"}
			}
		}
	});
});