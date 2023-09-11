sap.ui.define([
	"./GridTable.delegate",
	"./Orders.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/util/FilterUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	"sap/ui/model/odata/type/Int32",
	"sap/m/Text",
	"delegates/util/DelegateCache"
], function (ODataTableDelegate, OrdersFBDelegate, Field, Link, FieldDisplay, FieldEditMode, FilterUtil, DelegateUtil, Core, Filter, FilterOperator, Int32Type, Text, DelegateCache) {
	"use strict";
	var OrderItemssTableDelegate = Object.assign({}, ODataTableDelegate);

	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	OrderItemssTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oPropertyInfo){
				if (oPropertyInfo.name === "book_ID") {
					oPropertyInfo.dataType = "Edm.Int32";
					// oPropertyInfo.typeConfig.typeInstance = new Int32Type({groupingEnabled: false}, {nullable: false}); // needed for Field in table
					oPropertyInfo.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
					oPropertyInfo.constraints = {nullable: false};
					oPropertyInfo.label = "Book";
					oPropertyInfo.visualSettings = {widthCalculation: {minWidth: 25}}; // as the title is shown
				}
			});

			DelegateCache.add(oTable, {"book_ID": {display: FieldDisplay.Description, additionalValue: "{book/title}"}}, "$Columns");
			DelegateCache.add(oTable, {"book_ID": {valueHelp: "FH-Books"}}, "$Filters");

			return aProperties;
		});
	};

	OrderItemssTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return OrdersFBDelegate.addItem(sPropertyName, oTable)
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

	OrderItemssTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		var oCtrlProperties = DelegateCache.merge({
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.name, "$Columns"));

		return new Field(oCtrlProperties);

	};

	OrderItemssTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			var oTemplate = OrderItemssTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return OrderItemssTableDelegate;
});
