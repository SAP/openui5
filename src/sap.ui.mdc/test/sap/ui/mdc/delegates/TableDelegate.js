/*!
 * ${copyright}
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

	TestTableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		var oMetadataInfo = oMDCTable.getPayload();
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;

		var oFilter = Core.byId(oMDCTable.getFilter());
		var bFilterEnabled = oMDCTable.isFilteringEnabled();
		var aFilters = [];
		var oDataStateIndicator = oMDCTable.getDataStateIndicator();

		if (bFilterEnabled) {
			var aTableProperties = oMDCTable.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeUtil(), oMDCTable.getConditions(), aTableProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		if (oFilter) {
			var mConditions = oFilter.getConditions();

			if (mConditions) {
				var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				var oFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeUtil(), mConditions, aPropertiesMetadata);

				if (oFilterInfo.filters) {
					aFilters.push(oFilterInfo.filters);
				}
			}
		}

		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			oBindingInfo.filters = new Filter(aFilters, true);
		}
	};

	TestTableDelegate.getSupportedP13nModes = function() {
		return ["Sort", "Filter", "Column", "Group"];
	};

	return TestTableDelegate;
});