sap.ui.define([
	"delegates/odata/v4/TableDelegate"
], function(TableDelegate) {
	"use strict";

	const CustomTableDelegate = Object.assign({}, TableDelegate);

	CustomTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		oBindingInfo.parameters.$$aggregation = {
			expandTo: 2,
			hierarchyQualifier: 'OrgChart'
		};
	};

	return CustomTableDelegate;
});