/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/core/Core"
], function(FilterBarDelegate, Core) {
	"use strict";

	const mdcMessageBundle = Core.getLibraryResourceBundle("sap.ui.mdc");

	const ValueHelpFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	ValueHelpFilterBarDelegate.fetchProperties = function(oFilterBar) {
		const oFilterableListContent = oFilterBar.getParent();
		let sSearchPath = "$search";

		/**
		 *  @deprecated since 1.120.2
		 */
		if (oFilterableListContent && !oFilterableListContent.isPropertyInitial("filterFields")) {
			sSearchPath = oFilterableListContent.getFilterFields();
		}

		return Promise.resolve([{
			name: sSearchPath,
			label: mdcMessageBundle.getText("filterbar.SEARCH"),
			dataType: "sap.ui.model.type.String"
		}]);
	};

	return ValueHelpFilterBarDelegate;
});
