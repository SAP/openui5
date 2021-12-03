sap.ui.define([
	"./GridTable.delegate",
	"./Books.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	"sap/ui/model/odata/type/Int32",
	"sap/m/Text"
], function (ODataTableDelegate, BooksFBDelegate, Field, Link, FieldDisplay, FilterUtil, DelegateUtil, Core, Filter, FilterOperator, Int32Type, Text) {
	"use strict";
	var OrdersTableDelegate = Object.assign({}, ODataTableDelegate);

	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	// OrdersTableDelegate.fetchProperties = function (oTable) {
	// 	var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
	// 	return oODataProps.then(function (aProperties) {

	// 		// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
	// 		// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
	// 		// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
	// 		aProperties.forEach(function(oPropertyInfo){
	// 			if (oPropertyInfo.name === "OrderNo") {
	// 				oPropertyInfo.label = "Order Number";
	// 			}
	// 		});

	// 		return aProperties;
	// 	});
	// };

	OrdersTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return BooksFBDelegate.addItem(sPropertyName, oTable)
				.then(function(oFilterField) {
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
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: "Display",
			width:"100%",
			multipleLines: false
		};

		if (oProperty.name === "total") {
			oCtrlProperties.value = "{parts: [{path: 'total'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		return new Field(oCtrlProperties);

	};

	OrdersTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			if (oProperty.name === "OrderNo") {
				oColumn.setWidth("5rem");
			} else if (oProperty.name === "ID") {
				oColumn.setWidth("18rem");
			} else if (oProperty.name === "orderTime") {
				oColumn.setWidth("8rem");
			} else if (oProperty.name === "createdAt" || oProperty.name === "modifiedAt") {
				oColumn.setWidth("13rem");
			} else if (oProperty.name === "total") {
				oColumn.setWidth("10rem");
			} else if (oProperty.name === "currency_code") {
				oColumn.setWidth("5rem");
			}

			var oTemplate = OrdersTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return OrdersTableDelegate;
});
