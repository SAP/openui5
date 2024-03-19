sap.ui.define([
	"delegates/json/TableDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/core/Element",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/plugins/PluginBase",
	"sap/ui/mdc/enums/TableType"
], function (TableDelegate, JSONPropertyInfo, Element, Filter, FilterOperator, PluginBase, TableType) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = function (oTable) {
		return Promise.resolve(JSONPropertyInfo);
	};

	JSONTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.call(this, oTable, oBindingInfo);
		const oMetadataInfo = oTable.getPayload();
		oBindingInfo.path = oMetadataInfo.collectionPath || oBindingInfo.path;
		oBindingInfo.model = oMetadataInfo.model || oBindingInfo.model;
	};

	return JSONTableDelegate;
});