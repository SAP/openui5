sap.ui.define([
	"./GridTable.delegate",
	"./Authors.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	'delegates/util/DelegateCache'
], function (ODataTableDelegate, AuthorsFBDelegate, Field, FieldDisplay, FieldEditMode, DelegateCache) {
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
				} else if (oProperty.name === "countryOfOrigin/name") {
					oProperty.path = "countryOfOrigin/descr";
				} else if (oProperty.name === "countryOfOrigin_code") {
					oProperty.visible = false;
				} else if (oProperty.name === "regionOfOrigin_code") {
					oProperty.visible = false;
				} else if (oProperty.name === "cityOfOrigin_city") {
					oProperty.visible = false;
				} else if (oProperty.name === "countryOfOrigin_code_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
				} else if (oProperty.name === "regionOfOrigin_code_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
				} else if (oProperty.name === "cityOfOrigin_city_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
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
				"countryOfOrigin_code_ComplexWithText": {display: FieldDisplay.Description},
				"regionOfOrigin_code_ComplexWithText": {display: FieldDisplay.Description},
				"cityOfOrigin_city_ComplexWithText": {display: FieldDisplay.Description}
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

		let oValueBindingInfo;
		let oAdditionalValueBindingInfo;
		let sDisplay = FieldDisplay.Value;

		if (oProperty.name.endsWith("_ComplexWithText")) {
			// get single properties
			const aProperties = oProperty.getSimpleProperties();
			const oKeyProperty = aProperties[0];
			const oDescriptionProperty = aProperties[1];

			if (oKeyProperty) {
				oValueBindingInfo = {path: oKeyProperty.path || oKeyProperty.name, type: oKeyProperty.typeConfig.typeInstance};
			}
			if (oDescriptionProperty) {
				oAdditionalValueBindingInfo = {path: oDescriptionProperty.path || oDescriptionProperty.name, type: oDescriptionProperty.typeConfig.typeInstance};
			}

			if (oProperty.exportSettings.template === "{0} ({1})") {
				sDisplay = FieldDisplay.ValueDescription;
			} else if (oProperty.exportSettings.template === "{1} ({0})") {
				sDisplay = FieldDisplay.DescriptionValue;
			} else if (oProperty.exportSettings.template === "{1}") {
				sDisplay = FieldDisplay.Description;
			}
		} else {
			oValueBindingInfo = {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance};
		}

		var oCtrlProperties = DelegateCache.merge({
			id: "F_" + oProperty.name,
			value: oValueBindingInfo,
			additionalValue: oAdditionalValueBindingInfo,
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial,
			display: sDisplay,
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

			if (!oProperty.name.endsWith("_ComplexWithUnit")) {
				var oTemplate = AuthorsTableDelegate._createColumnTemplate(oTable, oProperty);
				oColumn.setTemplate(oTemplate);
			}

			return oColumn;
		});
	};

	return AuthorsTableDelegate;
});
