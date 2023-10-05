sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Core",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONBaseDelegate",
	"sap/ui/core/Element"
], function(
	TableDelegate,
	Column,
	Text,
	Filter,
	FilterOperator,
	Core,
	JSONPropertyInfo,
	JSONBaseDelegate,
	Element
) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);

	JSONTableDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo.filter((oPropertyInfo) => oPropertyInfo.name !== "$search"));
	};

	JSONTableDelegate.addItem = function (oTable, sPropertyName) {
		const oPropertyInfo = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return Promise.resolve(_addColumn(oPropertyInfo, oTable));
	};

	function _addColumn(oPropertyInfo, oTable) {
		const sName = oPropertyInfo.name;
		const sId = oTable.getId() + "---col-" + sName;
		let oColumn = Element.registry.get(sId);
		if (!oColumn) {
			oColumn = new Column(sId, {
				propertyKey: sName,
				header: oPropertyInfo.label,
				template: new Text({
					text: {
						path: "mountains>" + sName,
						type: oPropertyInfo.dataType
					}
				})
			});
		}
		return oColumn;
	}

	JSONTableDelegate.removeItem = function(oTable, oColumn) {
		oColumn.destroy();
		return Promise.resolve(true);
	};

	JSONTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	JSONTableDelegate.getFilters = function(oTable) {
		const aSearchFilters = _createSearchFilters(Element.registry.get(oTable.getFilter()).getSearch());
		return TableDelegate.getFilters(oTable).concat(aSearchFilters);
	};

	function _createSearchFilters(sSearch) {
		let aFilters = [];
		if (sSearch) {
			const aPaths = ["name", "range", "parent_mountain", "countries"];
			aFilters = aPaths.map(function (sPath) {
				return new Filter({
					path: sPath,
					operator: FilterOperator.Contains,
					value1: sSearch
				});
			});
			aFilters = [new Filter(aFilters, false)];
		}
		return aFilters;
	}

	return JSONTableDelegate;
}, /* bExport= */false);
