/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONBaseDelegate"
], function (
	TableDelegate, Column, Text, Core, Filter, FilterOperator, JSONPropertyInfo,
	JSONBaseDelegate) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.name !== "$search");

	const _createColumn = (sId, oPropertyInfo) => {
		const sPropertyName = oPropertyInfo.name;
		return new Column(sId, {
			propertyKey: sPropertyName,
			header: oPropertyInfo.label,
			template: new Text({
				text: {
					path: "mountains>" + sPropertyName,
					type: oPropertyInfo.dataType
				}
			})
		});
	};

	JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName);
		const sId = oTable.getId() + "---col-" + sPropertyName;
		return Core.byId(sId) ?? await _createColumn(sId, oPropertyInfo);
	};

	JSONTableDelegate.removeItem = async (oTable, oColumn) => {
		oColumn.destroy();
		return true; // allow default handling
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
		oBindingInfo.templateShareable = true;
	};

	const _createSearchFilters = (sSearch, aKeys) => {
		const aFilters = aKeys.map((aKey) => new Filter({
			path: aKey,
			operator: FilterOperator.Contains,
			value1: sSearch
		}));
		return [new Filter(aFilters, false)];
	};

	JSONTableDelegate.getFilters = (oTable) => {
		const sSearch = Core.byId(oTable.getFilter()).getSearch();
		const aKeys = oTable.getPayload().searchKeys;
		let aFilters = TableDelegate.getFilters(oTable);
		if (sSearch && aKeys) {
			aFilters = aFilters.concat(_createSearchFilters(sSearch, aKeys));
		}
		return aFilters;
	};

	return JSONTableDelegate;
}, /* bExport= */false);