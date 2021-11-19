sap.ui.define([
	"./GridTable.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/model/odata/type/Int32"
], function (ODataTableDelegate, Field, Link, FieldDisplay, Int32Type) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);

	BooksTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty){
				if (oProperty.name === "language_code") {
					oProperty.fieldHelp = "FHLanguage";
				}

				if (oProperty.name === "genre_code") {
					oProperty.fieldHelp = "FHGenreSingle";
					oProperty.label = "Genre";
				}

				if (oProperty.name === "subgenre_code") {
					oProperty.fieldHelp = "FHSubGenreSingle";
					oProperty.label = "Sub Genre";
				}

				if (oProperty.name === "title") {
					oProperty.caseSensitive = false;
				}

				if (oProperty.name === "ID" || oProperty.name === "author_ID") {
					oProperty.typeConfig.typeInstance = new Int32Type({groupingEnabled: false}, {nullable: false}); // needed for Field in table
					oProperty.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
				}

			});

			return aProperties;
		});
	};

	BooksTableDelegate._createColumnTemplate = function (oProperty) {

		var oCtrlProperties = {
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: "Display",
			width:"100%",
			multipleLines: false
		};


		if (oProperty.name === "price") {
			oCtrlProperties.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oProperty.name) != -1) {
			oCtrlProperties.multipleLines = true;
		}

		if (oProperty.name === "language_code") {

			return new Field({
				id: "tFieldLink",
				value: "{language/name}",
				editMode: "Display"
			});

		}

		if (oProperty.name === "title") {

			return new Field({
				id: "tFieldLinkTitle",
				value: "{title}",
				editMode: "Display",
				multipleLines: true,
				fieldInfo: new Link({
					sourceControl:"tFieldLinkTitle",
					delegate: {
						name: "sap/ui/mdc/flp/FlpLinkDelegate",
						payload: {
							semanticObjects: ["FakeFlpSemanticObject"],
							mainSemanticObject: "FakeFlpSemanticObject"
						}
					}
				})
			});

		}

		if (oProperty.name === "author_ID") {

			return new Field({
				id: "tFieldLinkAuthor",
				value: {path: 'author_ID', type: new Int32Type({groupingEnabled: false}, {nullable: false})},
				additionalValue:"{author/name}",
				display: FieldDisplay.DescriptionValue,
				editMode: "Display",
				fieldInfo: new Link({
					delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
				})
			});

		}

		if (oProperty.name === "classification_code") {
			oCtrlProperties.additionalValue = "{classification/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		if (oProperty.name === "detailgenre_code") {
			oCtrlProperties.additionalValue = "{detailgenre/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);
	};

	BooksTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			if (oProperty.name === "title") {
				oColumn.setWidth("15rem");
			} else if (oProperty.name != "descr") {
				oColumn.setWidth(["actions", "stock", "ID"].indexOf(oProperty.name) != -1 ? "6rem" : "10rem");
			}

			//oColumn.getTemplate().destroy();
			// if (oColumn._oTemplateClone) {
			// 	oColumn._oTemplateClone.destroy();
			// 	delete oColumn._oTemplateClone;
			// }

			var oTemplate = BooksTableDelegate._createColumnTemplate(oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return BooksTableDelegate;
});
