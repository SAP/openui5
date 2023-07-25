sap.ui.define([
	"./GridTable.delegate",
	"./Authors.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/model/odata/type/Int32"
], function (ODataTableDelegate, AuthorsFBDelegate, Field, FieldDisplay, FieldEditMode, Int32Type) {
	"use strict";

	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);
	AuthorsTableDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	AuthorsTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty){
				if (oProperty.name === "ID") {
					// oProperty.dataType = new Int32Type({groupingEnabled: false}, {nullable: false});
					oProperty.formatOptions = {groupingEnabled: false};
					oProperty.constraints.nullable = false;
				} else if (oProperty.name === "countryOfOrigin_code") {
					oProperty.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown
				} else if (oProperty.name === "regionOfOrigin_code") {
					oProperty.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown
				} else if (oProperty.name === "cityOfOrigin_city") {
					oProperty.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown
				} else if (oProperty.name === "createdAt") {
					oProperty.maxConditions = 1;
				}
			});

			return aProperties;
		});
	};

	AuthorsTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyName) {
				return AuthorsFBDelegate.addItem(oTable, sPropertyName)
				.then(function(oFilterField) {

					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					if (sPropertyName === "name") {
						oFilterField.setValueHelp(getFullId(oTable, "fhName"));
					} else if (sPropertyName === "dateOfBirth") {
						oFilterField.setValueHelp(getFullId(oTable, "fhAdob"));
					} else if (sPropertyName === "dateOfDeath") {
						oFilterField.setMaxConditions(1);
					} else if (sPropertyName === "countryOfOrigin_code") {
						oFilterField.setValueHelp(getFullId(oTable, "IOFFVHCountry"));
						oFilterField.setDisplay(FieldDisplay.ValueDescription);
					} else if (sPropertyName === "regionOfOrigin_code") {
						oFilterField.setValueHelp(getFullId(oTable, "IOFFVHRegion"));
						oFilterField.setDisplay(FieldDisplay.ValueDescription);
					} else if (sPropertyName === "cityOfOrigin_city") {
						oFilterField.setValueHelp(getFullId(oTable, "IOFFVHCity"));
						oFilterField.setDisplay(FieldDisplay.ValueDescription);
					}

					if (oFilterField.getMaxConditions() === -1 && !oFilterField.getValueHelp()) {
						oFilterField.setValueHelp(getFullId(oTable, "FVH_Generic_Multi"));
					}
					return oFilterField;
				});
			}
		};
	};

	AuthorsTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		var oCtrlProperties = {
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		};

		if (oProperty.name === "countryOfOrigin_code") {
			oCtrlProperties.additionalValue = "{countryOfOrigin/descr}";
			oCtrlProperties.display = FieldDisplay.Description;
		} else if (oProperty.name === "regionOfOrigin_code") {
			oCtrlProperties.additionalValue = "{regionOfOrigin/text}";
			oCtrlProperties.display = FieldDisplay.Description;
		} else if (oProperty.name === "cityOfOrigin_city") {
			oCtrlProperties.additionalValue = "{cityOfOrigin/text}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);
	};

	AuthorsTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			// oColumn.getTemplate().destroy();
			// if (oColumn._oTemplateClone) {
			// 	oColumn._oTemplateClone.destroy();
			// 	delete oColumn._oTemplateClone;
			// }

			var oTemplate = AuthorsTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return AuthorsTableDelegate;
});
