sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated"
], function (
	ValueHelpDelegate,
	StateUtil,
	Filter,
	FilterOperator,
	Condition,
	ConditionValidated
) {
	"use strict";

	const SearchValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	SearchValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return !!oValueHelp.getPayload()?.searchKeys;
	};

	// this delegate method creates the filters for the search functionality
	SearchValueHelpDelegate.getFilters = function (oValueHelp, oContent) {
		const aFilters = ValueHelpDelegate.getFilters.call(this, oValueHelp, oContent);

		const oPayload = oValueHelp.getPayload();
		if (oPayload.searchKeys) {
			const aSearchFilters = oPayload.searchKeys.map((sPath) => new Filter({ path: sPath, operator: FilterOperator.Contains, value1: oContent.getSearch() }));
			const oSearchFilter = aSearchFilters && aSearchFilters.length && new Filter(aSearchFilters, false);
			if (oSearchFilter) {
				aFilters.push(oSearchFilter);
			}
		}

		return aFilters;
	};

	return SearchValueHelpDelegate;
});