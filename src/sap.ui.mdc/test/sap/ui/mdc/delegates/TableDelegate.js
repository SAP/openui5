/*
 * ! ${copyright}
 */

sap.ui.define([
	"./TableDelegateUtils",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function(
	TableDelegateUtils,
	TableDelegate,
	Column,
	FilterUtil,
	Filter,
	Core
) {
	"use strict";

	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyName);
	};

	TestTableDelegate.updateBindingInfo = function(oMDCTable, oMetadataInfo, oBindingInfo) {
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;

		var oFilter = Core.byId(oMDCTable.getFilter());
		var bFilterEnabled = oMDCTable.isFilteringEnabled();
		var aFilters = [];

		if (bFilterEnabled) {
			var aTableProperties = oMDCTable.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, oMDCTable.getConditions(), aTableProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		if (oFilter) {
			var mConditions = oFilter.getConditions();

			if (mConditions) {
				var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				var oFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, aPropertiesMetadata);

				if (oFilterInfo.filters) {
					aFilters.push(oFilterInfo.filters);
				}
			}
		}

		oBindingInfo.filters = new Filter(aFilters, true);
	};

	return TestTableDelegate;
});