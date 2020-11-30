sap.ui.define([
	'sap/ui/mdc/odata/v4/TableDelegateDemo',
	'sap/ui/mdc/table/Column',
	'sap/m/Text',
	'sap/m/VBox'
], function(TableDelegate, Column, Text, VBox) {
	"use strict";

	var CustomTableDelegate = Object.assign({}, TableDelegate);

	CustomTableDelegate.fetchProperties = function(oTable) {
		return TableDelegate.fetchProperties.apply(this, arguments).then(function(aProperties) {
			var oProductIdName = {
				name: "ProductID_Name",
				label: "Product Name & Id",
				propertyInfos: ["ProductID", "Name"],
				exportSettings: {
					template: "{0} ({1})"
				}
			};

			aProperties.push(oProductIdName);

			return aProperties;
		});
	};

	CustomTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		var oPropertyHelper = oTable.getPropertyHelper();
		if (oPropertyHelper.isComplex(sPropertyName)) {
			return this._createComplexColumn(sPropertyName, oTable);
		}

		return TableDelegate.addItem.apply(this, arguments);
	};

	CustomTableDelegate._createComplexColumn = function(sPropertyInfoName, oTable) {
		return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
			var oPropertyInfo = oPropertyHelper.getProperty(sPropertyInfoName);

			if (!oPropertyInfo) {
				return null;
			}

			return this._createComplexColumnTemplate(oPropertyInfo).then(function(oTemplate) {
				var sPropertyName = oPropertyInfo.getName();
				var oColumnInfo = {
					header: oPropertyInfo.getLabel(),
					dataProperty: sPropertyName,
					template: oTemplate
				};
				return new Column(oTable.getId() + "--" + sPropertyName, oColumnInfo);
			});
		}.bind(this));
	};

	CustomTableDelegate._createComplexColumnTemplate = function(oPropertyInfo) {
		var oVBox = new VBox({
			renderType: "Bare"
		});

		oPropertyInfo.getReferencedProperties().forEach(function(oSimplePropertyInfo) {
			var oText = new Text({
				text: {
					path: oSimplePropertyInfo.getPath()
				}
			});
			oVBox.addItem(oText);
		});

		return Promise.resolve(oVBox);
	};

	return CustomTableDelegate;
});