sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link"
], function (ODataTableDelegate, Field, Link) {
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
					oProperty.fieldHelp = "FHGenre";
					oProperty.label = "Genre";
				}

				if (oProperty.name === "subgenre_code") {
					oProperty.fieldHelp = "FHSubGenreSingle";
					oProperty.label = "Sub Genre";
				}

				if (oProperty.name === "title") {
					oProperty.caseSensitive = false;
				}

			});

			return aProperties;
		});
	};

	BooksTableDelegate._createColumnTemplate = function (oProperty) {

		var oCtrlProperties = {
			value: "{" + (oProperty.path || oProperty.name) + "}",
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
				value: "{author/name}",
				additionalValue:"{author_ID}",
				display: "ValueDescription",
				editMode: "Display",
				fieldInfo: new Link({
					delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
				})
			});

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
