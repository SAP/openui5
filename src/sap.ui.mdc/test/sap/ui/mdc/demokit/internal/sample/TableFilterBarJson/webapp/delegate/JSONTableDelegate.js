sap.ui.define([
	"sap/ui/mdc/TableDelegate", "sap/ui/mdc/table/Column", "sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Core",
	"sap/ui/mdc/sample/TableFilterBarJson/webapp/model/metadata/JSONPropertyInfo"
], function(TableDelegate, Column, Text,
	Filter,
	FilterOperator,
	Core,
	JSONPropertyInfo) {
	"use strict";

	var JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);

		var oMetadataInfo = oTable.getPayload();
		oBindingInfo.path = oMetadataInfo.collectionPath;
	};

	JSONTableDelegate.getFilters = function(oTable) {
		var aSearchFilters = _createSearchFilters(Core.byId(oTable.getFilter()).getSearch());
		return TableDelegate.getFilters.apply(this, arguments).concat(aSearchFilters);
	};

	function _createSearchFilters(sSearch) {
		if (sSearch) {
			var aPaths = [ "name", "range", "parent_mountain", "countries" ];
			var aFilters = aPaths.map(function(sPath) {
				return new Filter({
					path: sPath,
					operator: FilterOperator.Contains,
					value1: sSearch
				});
			});

			return [ new Filter(aFilters, false) ];
		}
		return [];
	}

	JSONTableDelegate.fetchProperties = function() {
		return Promise.resolve(JSONPropertyInfo.filter(function(oPropertyInfo) {
			return oPropertyInfo.name !== "$search";
		}));
	};

	JSONTableDelegate.addItem = function(oTable, sPropertyName, mPropertyBag) {
		var oPropertyInfo = JSONPropertyInfo.find(function(oPropertyInfo) {
			return oPropertyInfo.name === sPropertyName;
		});
		var sId = oTable.getId() + "---col-" + sPropertyName;
		var oColumn = Core.byId(sId);
		if (!oColumn) {
			oColumn = new Column(sId, {
				propertyKey: sPropertyName,
				header: oPropertyInfo.label,
				template: new Text({
					text: sPropertyName === "height" ?
					{
						path: "mountains>" + sPropertyName,
						// oTable.getParent().getParent() returns the view
						formatter: oTable.getParent().getParent().getController().formatHeight
					} : "{mountains>" + sPropertyName + "}"
				})
			});
		}
		return Promise.resolve(oColumn);
	};

	return JSONTableDelegate;
}, /* bExport= */false);
