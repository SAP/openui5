/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableDelegateUtils",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/model/Filter",
	"sap/ui/core/Core",
	"sap/ui/core/Element"
], function(
	TableDelegateUtils,
	TableDelegate,
	Column,
	FilterField,
	FilterUtil,
	Filter,
	Core,
	Element
) {
	"use strict";

	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.addItem = function(oTable, sPropertyName, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyName);
	};

	TestTableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		var oMetadataInfo = oMDCTable.getPayload();
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;

		var oFilter = Element.registry.get(oMDCTable.getFilter());
		var bFilterEnabled = oMDCTable.isFilteringEnabled();
		var aFilters = [];
		var oDataStateIndicator = oMDCTable.getDataStateIndicator();

		if (bFilterEnabled) {
			var aTableProperties = oMDCTable.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), oMDCTable.getConditions(), aTableProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		if (oFilter) {
			var mConditions = oFilter.getConditions();

			if (mConditions) {
				var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				var oFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

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

	TestTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyName) {
				return this.fetchProperties(oTable).then(function(aProperties) {
					var oProperty = aProperties.find(function(oProperty) {
						return oProperty.name === sPropertyName;
					});

					return new FilterField({
						label: oProperty.label,
						conditions: "{$filters>/conditions/" + oProperty.name + "}",
						propertyKey: oProperty.name
					});
				});
			}.bind(this)
		};
	};

	return TestTableDelegate;
});