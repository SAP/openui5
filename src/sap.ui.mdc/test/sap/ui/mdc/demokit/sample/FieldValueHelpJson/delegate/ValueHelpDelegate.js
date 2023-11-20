sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(
	ValueHelpDelegate,
	StateUtil,
	Filter,
	FilterOperator
) {
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

	// called when ValueHelp for one of the three FilterFields is called
	JSONValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oConditions = ValueHelpDelegate.getFilterConditions(oValueHelp, oContent, oConfig);
		const oFilterBar = oValueHelp.getParent().getParent();
		return StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
			oValueHelp.getPayload()?.filterConditions?.forEach((filterCondition) => {
				oConditions[filterCondition.condition] = oState.filter[filterCondition.filter];
			});
			return oConditions;
		});
	};

	return JSONValueHelpDelegate;

}

);