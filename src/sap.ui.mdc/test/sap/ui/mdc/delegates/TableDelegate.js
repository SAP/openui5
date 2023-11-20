/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableDelegateUtils",
	"sap/ui/core/Element",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/model/Filter"
], function(
	TableDelegateUtils,
	Element,
	TableDelegate,
	Column,
	FilterField,
	FilterUtil,
	Filter
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

		var oDataStateIndicator = oMDCTable.getDataStateIndicator();
		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			oBindingInfo.filters = this.getFilters(oMDCTable);
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