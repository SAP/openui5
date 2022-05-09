sap.ui.define([
	"./GridTable.delegate",
	"./Orders.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	"sap/ui/model/odata/type/Int32",
	"sap/m/Text"
], function (ODataTableDelegate, OrdersFBDelegate, Field, Link, FieldDisplay, EditMode, FilterUtil, DelegateUtil, Core, Filter, FilterOperator, Int32Type, Text) {
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
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oPropertyInfo){
				if (oPropertyInfo.name === "customer_ID") {
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown
				} else if (oPropertyInfo.name === "total") {
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 8}}; // as currency is shown too
				}
			});

			return aProperties;
		});
	};

	OrdersTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return OrdersFBDelegate.addItem(sPropertyName, oTable)
				.then(function(oFilterField) {
					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					if (sPropertyName === "OrderNo") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH1"));
					} else if (sPropertyName === "currency_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH-Currency"));
						oFilterField.setDisplay(FieldDisplay.Value);
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["EQ"]);
					}
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

		var oCtrlProperties = {
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: EditMode.Display,
			width:"100%",
			multipleLines: false
		};

		if (oProperty.name === "total") {
			oCtrlProperties.value = "{parts: [{path: 'total'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		} else if (oProperty.name === "customer_ID") {
			oCtrlProperties.additionalValue = "{customer/name}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);

	};

	OrdersTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			var oTemplate = OrdersTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return OrdersTableDelegate;
});
