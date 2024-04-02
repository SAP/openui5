sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text"
], function(
	TableDelegate,
	Column,
	Text
) {
	"use strict";

	const CustomTableDelegate = Object.assign({}, TableDelegate);

	CustomTableDelegate.fetchProperties = function(oTable) {
		return Promise.resolve([{
			key: "SalesAmountLocalCurrency",
			path: "SalesAmountLocalCurrency",
			label: "Sales Amount (local currency)",
			dataType: "Edm.Decimal",
			aggregatable: true,
			unit: "LocalCurrency",
			extension: {
				customAggregate: {}
			}
		}, {
			key: "LocalCurrency",
			path: "LocalCurrency",
			label: "Local Currency",
			dataType: "Edm.String",
			groupable: true
		}, {
			key: "SalesNumber",
			path: "SalesNumber",
			label: "Sales Number",
			dataType: "Edm.Decimal",
			aggregatable: true,
			extension: {
				customAggregate: {}
			}
		}, {
			key: "AccountResponsible",
			path: "AccountResponsible",
			label: "Account Responsible",
			dataType: "Edm.String",
			groupable: true
		}, {
			key: "Country_Code",
			path: "Country_Code",
			label: "Country",
			dataType: "Edm.String",
			groupable: true,
			text: "Country"
		}, {
			key: "Country",
			path: "Country",
			label: "Country Name",
			dataType: "Edm.String",
			groupable: true
		}, {
			key: "Region",
			path: "Region",
			label: "Region",
			dataType: "Edm.String",
			groupable: true
		}, {
			key: "Segment",
			path: "Segment",
			label: "Segment",
			dataType: "Edm.String",
			groupable: true
		}]);
	};

	CustomTableDelegate.addItem = function(oTable, sPropertyKey, mPropertyBag) {
		if (sPropertyKey === "SalesAmountLocalCurrency") {
			const oProperty = oTable.getPropertyHelper().getProperty(sPropertyKey);
			return Promise.resolve(new Column({
				header: oProperty.label,
				propertyKey: oProperty.key,
				template: new Text({
					text: {
						parts: [
							"SalesAmountLocalCurrency",
							"LocalCurrency",
							{path: "/##@@requestCurrencyCodes", mode: "OneTime", targetType: "any"}
						],
						type: "sap.ui.model.odata.type.Currency"
					}
				})
			}));
		}

		return TableDelegate.addItem.apply(this, arguments);
	};

	CustomTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		oBindingInfo.parameters.$orderby = "Country desc,Region desc,Segment,AccountResponsible";
	};

	return CustomTableDelegate;
});