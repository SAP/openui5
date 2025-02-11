/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/core/Lib", "sap/ui/mdc/FilterBarDelegate"
], (Library, FilterBarDelegate) => {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	/**
	 * Delegate for {@link sap.ui.mdc.valuehelp.FilterBar FilterBar}.<br>
	 * @public
	 * @since 1.124.0
	 */
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