sap.ui.define([
	"delegates/odata/v4/TableDelegate"
], function(TableDelegateBase) {
	"use strict";

	const TableDelegate = Object.assign({}, TableDelegateBase);

	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegateBase.updateBindingInfo.apply(this, arguments);
		oBindingInfo.parameters.$count = false;
		oBindingInfo.parameters.$$aggregation = {
			hierarchyQualifier: oTable.getPayload().hierarchyQualifier
		};
	};

	return TableDelegate;
});