/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableDelegateUtils",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/FilterField"
], function(
	TableDelegateUtils,
	TableDelegate,
	FilterField
) {
	"use strict";

	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.fetchProperties = function(oTable) {
		const oPayload = oTable.getPayload();

		if (oPayload?.propertyInfo) {
			return Promise.resolve(oPayload.propertyInfo);
		} else {
			return TableDelegate.fetchProperties.apply(this, arguments);
		}
	};

	TestTableDelegate.addItem = function(oTable, sPropertyKey, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyKey);
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

	TestTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyKey) {
				return this.fetchProperties(oTable).then(function(aProperties) {
					var oProperty = aProperties.find(function(oProperty) {
						return oProperty.key === sPropertyKey;
					});

					return new FilterField({
						label: oProperty.label,
						conditions: "{$filters>/conditions/" + oProperty.key + "}",
						propertyKey: oProperty.key
					});
				});
			}.bind(this)
		};
	};

	return TestTableDelegate;
});