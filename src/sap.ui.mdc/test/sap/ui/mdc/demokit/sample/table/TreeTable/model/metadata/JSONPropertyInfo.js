sap.ui.define([
], function() {
	"use strict";
	const aPropertyInfos = [{
		key: "name",
		label: "Name",
		path: "name",
		dataType: "sap.ui.model.type.String"
	},{
		key: "amount",
		label: "Amount",
		path: "amount",
		dataType: "sap.ui.model.type.Float"
	},{
		key: "currency",
		label: "Currency",
		path: "currency",
		dataType: "sap.ui.model.type.String"
	},{
		key: "size",
		label: "Size",
		path: "size",
		dataType: "sap.ui.model.type.String"
	},{
		key: "price",
		label: "Price",
		propertyInfos: ["amount", "currency"]
	}];

	return aPropertyInfos;
}, /* bExport= */false);
