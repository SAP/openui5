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
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.v4.FilterBarDelegate
	 */
	var FB0Delegate = Object.assign({}, FilterBarDelegate);

    FB0Delegate.fetchProperties = function (oFilterBar) {
       return Promise.resolve(["salesOrganization", "distributionChannel", "division"].map(function (sProp) {
			return {
				caseSensitive: false,
				filterable: true,
				groupable: false,
				key: sProp === "key",
				label: sProp,
				maxConditions: -1,
				name: sProp,
				path: sProp,
				sortable: true,
				text: undefined,
				typeConfig: FB0Delegate.getTypeUtil().getTypeConfig("String"),
				unit: undefined
			};
		}));
	};

	return FB0Delegate;
});
