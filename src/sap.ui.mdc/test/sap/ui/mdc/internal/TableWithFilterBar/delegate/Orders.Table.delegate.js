sap.ui.define([
	"./GridTable.delegate",
	"./Orders.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	'sap/ui/mdc/enums/OperatorName',
	"sap/ui/mdc/util/FilterUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/String",
	"sap/m/Text",
	"delegates/util/DelegateCache"
], function (ODataTableDelegate, OrdersFBDelegate, Field, Link, FieldDisplay, FieldEditMode, OperatorName, FilterUtil, DelegateUtil, Core, Filter, FilterOperator, CurrencyType, DecimalType, Int32Type, StringType, Text, DelegateCache) {
	"use strict";
	var OrdersTableDelegate = Object.assign({}, ODataTableDelegate);

	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	OrdersTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the ValueHelp for some of the properties. Without ValueHelp the filter panel will not provide the expected VH.
			// TODO ValueHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oPropertyInfo){
				if (oPropertyInfo.name === "customer_ID") {
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown
				} else if (oPropertyInfo.name === "total") {
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 8}}; // as currency is shown too
				}
			});

			DelegateCache.add(oTable, {
				"customer_ID": {additionalValue: "{customer/name}", display: FieldDisplay.Description}
			}, "$Columns");
			DelegateCache.add(oTable, {
				"OrderNo": {valueHelp: "FH1"},
				"currency_code": {display: FieldDisplay.Value, maxConditions: 1, operators: [OperatorName.EQ], valueHelp: "FH-Currency"}
			}, "$Filters");

			return aProperties;
		});
	};

	OrdersTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyName) {
				return OrdersFBDelegate.addItem(oTable, sPropertyName)
				.then(function(oFilterField) {
					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					return oFilterField;
				});
			}
		};
	};

	OrdersTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		if (oProperty.name === "currency_code") { // Just use text to test rendering Text vs Field
			return new Text({
				text: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
				width:"100%"
			});
		}

		var oCtrlProperties = DelegateCache.merge({
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.name, "$Columns"));

		if (oProperty.name === "total") {
			oCtrlProperties.value = {
				parts: [
					{path:'total', type: new DecimalType(undefined, {precision: 9, scale: 2})},
					{path:'currency_code', type: new StringType(undefined, {maxLength: 3})},
					{path:'/##@@requestCurrencyCodes', mode:'OneTime', targetType:'any'}
				],
				type: new CurrencyType(),
				mode:'TwoWay'
			};
		}

		return new Field(oCtrlProperties);

	};

	OrdersTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			var oTemplate = OrdersTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return OrdersTableDelegate;
});
