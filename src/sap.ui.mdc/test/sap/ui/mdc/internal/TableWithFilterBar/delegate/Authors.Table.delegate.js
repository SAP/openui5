sap.ui.define([
	"./GridTable.delegate",
	"./Authors.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/model/odata/type/Int32",
	'delegates/util/DelegateCache'
], function (ODataTableDelegate, AuthorsFBDelegate, Field, FieldDisplay, FieldEditMode, Int32Type, DelegateCache) {
	"use strict";

	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);

	AuthorsTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);

		const oFilterSettings = {
			"name": { "valueHelp": "fhName" },
			"dateOfBirth": { "valueHelp": "fhAdob", "operators": ["RENAISSANCE", "MEDIEVAL", "MODERN", "CUSTOMRANGE", "NOTINRANGE"] },
			"dateOfDeath": {maxConditions: 1},
			"cityOfOrigin_city": { "valueHelp": "IOFFVHCity", "display": FieldDisplay.ValueDescription},
			"countryOfOrigin_code": { "valueHelp": "IOFFVHCountry", "display": FieldDisplay.ValueDescription},
			"regionOfOrigin_code": { "valueHelp": "IOFFVHRegion", "display": FieldDisplay.ValueDescription}
		};

		return oODataProps.then(function (aProperties) {
			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the ValueHelp for some of the properties. Without ValueHelp the filter panel will not provide the expected VH.
			// TODO ValueHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty) {
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

				if (oProperty.maxConditions === -1 ) {
					const oCurrentSettings = DelegateCache.get(oTable, oProperty.name) || oFilterSettings[oProperty.name] || {};
					if (!oCurrentSettings.valueHelp) {
						oFilterSettings[oProperty.name] = {...oCurrentSettings, valueHelp: "FVH_Generic_Multi"};
					}
				}
			});

			DelegateCache.add(oTable, oFilterSettings, "$Filters");
			DelegateCache.add(oTable, {
				"countryOfOrigin_code": {display: FieldDisplay.Description, additionalValue: "{countryOfOrigin/descr}"},
				"regionOfOrigin_code": {display: FieldDisplay.Description, additionalValue: "{regionOfOrigin/text}"},
				"cityOfOrigin_city": {display: FieldDisplay.Description, additionalValue: "{cityOfOrigin/text}"}
			}, "$Columns");

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

					return oFilterField;
				});
			}
		};
	};

	AuthorsTableDelegate._createColumnTemplate = function (oTable, oProperty) {


		var oCtrlProperties = DelegateCache.merge({
			id: "F_" + oProperty.name,
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.name, "$Columns"));

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
