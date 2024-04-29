/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate"
	], function (FilterBarDelegate) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * @author SAP SE
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.v4.FilterBarDelegate
	 */
	const FB0Delegate = Object.assign({}, FilterBarDelegate);

    FB0Delegate.fetchProperties = function (oFilterBar) {
       return Promise.resolve(["salesOrganization", "distributionChannel", "division"].map(function (sProp) {
			return {
				caseSensitive: false,
				label: sProp,
				maxConditions: -1,
				name: sProp,
				path: sProp,
				dataType: "String"
			};
		}));
	};

	return FB0Delegate;
});
