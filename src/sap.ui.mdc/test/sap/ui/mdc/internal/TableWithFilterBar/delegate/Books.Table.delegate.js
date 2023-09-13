sap.ui.define([
	"./GridTable.delegate",
	"./Books.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/String",
	"sap/m/Text",
	'delegates/util/DelegateCache'
], function (ODataTableDelegate, BooksFBDelegate, Field, Link, FieldDisplay, FieldEditMode, DelegateUtil, CurrencyType, DecimalType, Int32Type, StringType, Text, DelegateCache) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);
	BooksTableDelegate.apiVersion = 2;//CLEANUP_DELEGATE
	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	BooksTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);

		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty){
				if (oProperty.name === "title") {
					oProperty.caseSensitive = false;
				}

				if (oProperty.name === "subgenre_code") {
					oProperty.label = "Sub Genre";
					oProperty.visualSettings = {widthCalculation: {maxWidth: 10}}; // as Text is normally short
				}
				if (oProperty.name === "genre_code") {
					oProperty.visualSettings = {widthCalculation: {maxWidth: 10}}; // as Text is normally short
				}

				if (oProperty.name === "ID" || oProperty.name === "author_ID") {
					oProperty.dataType = "Edm.Int32";
					oProperty.constraints = {nullable: false};
					oProperty.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
					oProperty.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown too
				} else if (oProperty.name === "descr") {
					oProperty.visualSettings = {widthCalculation: {minWidth: 40}};
				}

			});

			DelegateCache.add(oTable, {
				"author_ID": {valueHelp: "FH1", display: FieldDisplay.Description},
				"title": {valueHelp: "FH4"},
				"published": {valueHelp: "FHPublished", operators: ["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"]},
				"language_code": {dataTypeConstraints: {nullable: false, maxLength: 3}, valueHelp: "FHLanguage", maxConditions: 1, display: FieldDisplay.Description},
				"stock": {maxConditions: 1, operators: ["BT"]},
				"classification_code": {valueHelp: "FHClassification", display: FieldDisplay.Description},
				"genre_code": {valueHelp: "FHGenre", display: FieldDisplay.Description},
				"subgenre_code": {valueHelp: "FHSubGenre", display: FieldDisplay.Description},
				"detailgenre_code": {valueHelp: "FHDetailGenre", display: FieldDisplay.Description},
				"currency_code": {valueHelp: "FH-Currency", display: FieldDisplay.Value, maxConditions: 1, operators: ["EQ"]},
				"createdAt": {maxConditions: 1, operators: ["MYDATE", "MYDATERANGE", "EQ", "GE", "LE", "BT", "LT", "TODAY", "YESTERDAY", "TOMORROW", "LASTDAYS", "MYNEXTDAYS", "THISWEEK", "THISMONTH", "THISQUARTER", "THISYEAR", "NEXTHOURS", "NEXTMINUTES", "LASTHOURS"]}
			}, "$Filters");

			DelegateCache.add(oTable, {
				"descr": {multipleLines: true},
				"author_ID": {multipleLines: true, display: FieldDisplay.DescriptionValue, additionalValue: "{author/name}"},
				"classification_code": {display: FieldDisplay.Description, additionalValue: "{classification/title}"},
				"detailgenre_code": {display: FieldDisplay.Description, additionalValue: "{detailgenre/title}"},
				"language_code": {display: FieldDisplay.Description, additionalValue: "{language/name}", valueHelp: "FHLanguage"},
				"genre_code": {display: FieldDisplay.Description, valueHelp: "FHGenreSingle"},
				"subgenre_code": {display: FieldDisplay.Description, valueHelp: "FHSubGenreSingle"},
				"title": {multipleLines: true}
			}, "$Columns");

			return aProperties;
		});
	};

	BooksTableDelegate.getFilterDelegate = function() {
		return {
			apiVersion: 2,//CLEANUP_DELEGATE
			addItem: function(oTable, sPropertyName) {
				return BooksFBDelegate.addItem(oTable, sPropertyName)
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

	BooksTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		if (oProperty.name === "currency_code") { // Just use text to test rendering Text vs Field
			return new Text(getFullId(oTable, "T_" + oProperty.name), {
				text: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
				width:"100%"
			});
		}

		var oCtrlProperties = DelegateCache.merge({
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.name, "$Columns"));

		if (oProperty.name === "price") {
			oCtrlProperties.value = {
				parts: [
					{path:'price', type: new DecimalType(undefined, {precision: 9, scale: 2})},
					{path:'currency_code', type: new StringType(undefined, {maxLength: 3})},
					{path:'/##@@requestCurrencyCodes', mode:'OneTime', targetType:'any'}
				],
				type: new CurrencyType(),
				mode:'TwoWay'
			};
		}  else if (oProperty.name === "title") {
			oCtrlProperties.fieldInfo = new Link({
					sourceControl:"tFieldLinkTitle",
					delegate: {
						name: "sap/ui/mdc/flp/FlpLinkDelegate",
						payload: {
							semanticObjects: ["FakeFlpSemanticObject"],
							mainSemanticObject: "FakeFlpSemanticObject"
						}
					}
				});
		} else if (oProperty.name === "author_ID") {
			oCtrlProperties.fieldInfo = new Link({
					delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
				});
		}

		return new Field(oCtrlProperties);
	};

	BooksTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {

//		if (sPropertyName === "createdAt") {
//			return null;
//		}

		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			if (oColumn) { // in XML templating there is no column
				var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

				var oTemplate = BooksTableDelegate._createColumnTemplate(oTable, oProperty);
				oColumn.setTemplate(oTemplate);
			}

			return oColumn;
		});
	};

	BooksTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		ODataTableDelegate.updateBindingInfo.apply(this, arguments);

		// always select fields needed as InParameters (only if corresponding field displayed?)
		oBindingInfo.parameters.$select = ["classification_code", "genre_code"]; // Comment this out to test late loading of InParameters

	};

	return BooksTableDelegate;
});
