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

	const TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.fetchProperties = function (oTable) {
		return Promise.resolve(['key', 'text', 'salesOrganization', 'division'].map(function (sProp) {
			return {
				caseSensitive: false,
				filterable: true,
				groupable: false,
				key: sProp === "key",
				label: sProp,
				maxConditions: -1,
				name: sProp,
				path: sProp,
				sortable: true,
				text: undefined,
				dataType: "String",
				unit: undefined
			};
		}));
	};

	TestTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyName);
	};

	TestTableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		const oMetadataInfo = oMDCTable.getPayload();
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;

		const oFilter = Core.byId(oMDCTable.getFilter());
		const bFilterEnabled = oMDCTable.isFilteringEnabled();
		const aFilters = [];
		const oDataStateIndicator = oMDCTable.getDataStateIndicator();

		if (bFilterEnabled) {
			const aTableProperties = oMDCTable.getPropertyHelper().getProperties();
			const oInnerFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), oMDCTable.getConditions(), aTableProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		if (oFilter) {
			const mConditions = oFilter.getConditions();

			if (mConditions) {
				const aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				const oFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

				if (oFilterInfo.filters) {
					aFilters.push(oFilterInfo.filters);
				}
			}
		}

		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			oBindingInfo.filters = new Filter(aFilters, true);
		}
	};

	return TestTableDelegate;
});