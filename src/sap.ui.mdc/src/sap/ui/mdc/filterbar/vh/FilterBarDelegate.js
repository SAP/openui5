/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(["sap/ui/mdc/FilterBarDelegate"], function(FilterBarDelegate) {
	"use strict";

	var ValueHelpFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	ValueHelpFilterBarDelegate.fetchProperties = function(oFilterBar) {
		return Promise.resolve([{
			name: "$search",
			typeConfig: FilterBarDelegate.getTypeUtil().getTypeConfig("String", null, null)
		}]);
	};

	return ValueHelpFilterBarDelegate;
});
