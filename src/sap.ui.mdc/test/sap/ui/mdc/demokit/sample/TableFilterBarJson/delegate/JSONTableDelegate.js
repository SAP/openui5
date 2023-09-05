sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Core",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"mdc/sample/delegate/JSONBaseDelegate"
], function (
	TableDelegate, Column, Text, Filter, FilterOperator,
	Core, JSONPropertyInfo, JSONBaseDelegate) {
	"use strict";

	var JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);

	JSONTableDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo.filter((oPropertyInfo) => oPropertyInfo.name !== "$search"));
	};

	JSONTableDelegate.addItem = function (oTable, sPropertyName) {
		var oPropertyInfo = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return Promise.resolve(_addColumn(oPropertyInfo, oTable));
	};

	function _addColumn(oPropertyInfo, oTable) {
		var sName = oPropertyInfo.name;
		var sId = oTable.getId() + "---col-" + sName;
		var oColumn = Core.byId(sId);
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
		var oMetadataInfo = oTable.getPayload();
		oBindingInfo.path = oMetadataInfo.collectionPath;
	};

	JSONTableDelegate.getFilters = function(oTable) {
		var aSearchFilters = _createSearchFilters(Core.byId(oTable.getFilter()).getSearch());
		return TableDelegate.getFilters(oTable).concat(aSearchFilters);
	};

	function _createSearchFilters(sSearch) {
		var aFilters = [];
		if (sSearch) {
			var aPaths = ["name", "range", "parent_mountain", "countries"];
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
