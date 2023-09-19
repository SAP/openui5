sap.ui.define([
	"delegates/odata/v4/TableDelegate"
], function(TableDelegate) {
	"use strict";

	const CustomTableDelegate = Object.assign({}, TableDelegate);

	CustomTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		oBindingInfo.parameters.$count = false;
		oBindingInfo.parameters.$$aggregation = {
			expandTo: 999,
			hierarchyQualifier: 'OrgChart'
		};
	};

	return CustomTableDelegate;
});