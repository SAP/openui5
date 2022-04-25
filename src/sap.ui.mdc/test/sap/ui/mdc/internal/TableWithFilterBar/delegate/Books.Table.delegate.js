sap.ui.define([
	"./GridTable.delegate",
	"./Books.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/model/odata/type/Int32",
	"sap/m/Text"
], function (ODataTableDelegate, BooksFBDelegate, Field, Link, FieldDisplay, EditMode, DelegateUtil, Int32Type, Text) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);

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
				}

				if (oProperty.name === "ID" || oProperty.name === "author_ID") {
					oProperty.typeConfig.typeInstance = new Int32Type({groupingEnabled: false}, {nullable: false}); // needed for Field in table
					oProperty.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
				}

			});

			return aProperties;
		});
	};

	BooksTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return BooksFBDelegate.addItem(sPropertyName, oTable)
				.then(function(oFilterField) {

					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					if (sPropertyName === "author_ID") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH1"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "title") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH4"));
					} else if (sPropertyName === "published") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHPublished"));
						oFilterField.setOperators(["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"]);
					} else if (sPropertyName === "language_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHLanguage"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "stock") {
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["BT"]);
					} else if (sPropertyName === "classification_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHClassification"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "genre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "subgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHSubGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "detailgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHDetailGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "currency_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH-Currency"));
						oFilterField.setDisplay(FieldDisplay.Value);
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["EQ"]);
					} else if (sPropertyName === "createdAt") {
						oFilterField.setMaxConditions(1); // to use DynamicDateRange
					}
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

		var oCtrlProperties = {
			id: getFullId(oTable, "F_" + oProperty.name),
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: EditMode.Display,
			width:"100%",
			multipleLines: false // set always to have property not initial
		};

		if (oProperty.name === "price") {
			oCtrlProperties.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		} else if (oProperty.name === "descr") {
			oCtrlProperties.multipleLines = true;
		} else if (oProperty.name === "language_code") {
			oCtrlProperties.additionalValue = "{language/name}";
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHLanguage");
		} else if (oProperty.name === "genre_code") {
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHGenreSingle");
		} else if (oProperty.name === "subgenre_code") {
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHSubGenreSingle");
		} else if (oProperty.name === "title") {
			oCtrlProperties.multipleLines = true;
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
			oCtrlProperties.additionalValue = "{author/name}";
			oCtrlProperties.display = FieldDisplay.DescriptionValue;
			oCtrlProperties.multipleLines = true;
			oCtrlProperties.fieldInfo = new Link({
					delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
				});
		} else if (oProperty.name === "classification_code") {
			oCtrlProperties.additionalValue = "{classification/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		} else if (oProperty.name === "detailgenre_code") {
			oCtrlProperties.additionalValue = "{detailgenre/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);
	};

	BooksTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			if (oColumn) { // in XML templating there is no column
				var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

				if (oProperty.name === "title") {
					oColumn.setWidth("15rem");
				} else if (oProperty.name === "currency_code") {
					oColumn.setWidth("5rem");
				} else if (oProperty.name != "descr") {
					oColumn.setWidth(["actions", "stock", "ID"].indexOf(oProperty.name) != -1 ? "6rem" : "10rem");
				}

				//oColumn.getTemplate().destroy();
				// if (oColumn._oTemplateClone) {
				// 	oColumn._oTemplateClone.destroy();
				// 	delete oColumn._oTemplateClone;
				// }

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
