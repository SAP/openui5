/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"mdc/sample/delegate/JSONBaseDelegate"
], function (
	ValueHelpDelegate,
    Filter,
    FilterOperator,
    JSONBaseDelegate) {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate, JSONBaseDelegate);

	JSONValueHelpDelegate.getFilters = function (oValueHelp, oContent) {
		// create search filters
		const oPayload = oValueHelp.getPayload();
		const aFilters = oPayload.searchKeys?.map((sPath) => new Filter({path: sPath, operator: FilterOperator.Contains, value1: oContent.getSearch()}));
		const oSearchFilter = aFilters?.length && new Filter(aFilters, false);
		return oSearchFilter ? [oSearchFilter] : [];
	};

	// enable typeahead
	JSONValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return !!oValueHelp.getPayload()?.searchKeys;
	};


	return JSONValueHelpDelegate;
});