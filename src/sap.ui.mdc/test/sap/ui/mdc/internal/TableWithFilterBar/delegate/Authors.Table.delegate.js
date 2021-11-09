sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/model/odata/type/Int32"
], function (ODataTableDelegate, Field, FieldDisplay, Int32Type) {
	"use strict";

	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);

	AuthorsTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty){
				if (oProperty.name === "ID") {
					oProperty.typeConfig.typeInstance = new Int32Type({groupingEnabled: false}, {nullable: false});
				}
			});

			return aProperties;
		});
	};

	AuthorsTableDelegate._createColumnTemplate = function (oProperty) {

		var oCtrlProperties = { value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance}, editMode: "Display", multipleLines: false};

		if (oProperty.name === "countryOfOrigin_code") {
			oCtrlProperties.additionalValue = "{countryOfOrigin/descr}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		if (oProperty.name === "regionOfOrigin_code") {
			oCtrlProperties.additionalValue = "{regionOfOrigin/text}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		if (oProperty.name === "cityOfOrigin_city") {
			oCtrlProperties.additionalValue = "{cityOfOrigin/text}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);
	};

	AuthorsTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			if (oProperty.name === "ID") {
				oColumn.setWidth("5rem");
			} else {
				oColumn.setWidth("15rem");
			}

			// oColumn.getTemplate().destroy();
			// if (oColumn._oTemplateClone) {
			// 	oColumn._oTemplateClone.destroy();
			// 	delete oColumn._oTemplateClone;
			// }

			var oTemplate = AuthorsTableDelegate._createColumnTemplate(oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return AuthorsTableDelegate;
});
