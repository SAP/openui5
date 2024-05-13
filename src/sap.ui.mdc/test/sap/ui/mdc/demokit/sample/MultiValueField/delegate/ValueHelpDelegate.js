sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (
	ValueHelpDelegate,
	StateUtil,
	Filter,
	FilterOperator
) => {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	JSONValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(oValueHelp, oContent, oBindingInfo);

		// create search filters
		const oPayload = oValueHelp.getPayload();
		if (oPayload.searchKeys) { // TODO: Move filter generation in separate method?
			const aFilters = oPayload.searchKeys.map((sPath) => new Filter({path: sPath, operator: FilterOperator.Contains, value1: oContent.getSearch()}));
			const oSearchFilter = aFilters && aFilters.length && new Filter(aFilters, false);
			if (oSearchFilter) {
				oBindingInfo.filters = oBindingInfo.filters.concat(oSearchFilter);
			}
		}
	};

	// enable typeahead
	JSONValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return !!oValueHelp.getPayload()?.searchKeys;
	};

	return JSONValueHelpDelegate;

}

);