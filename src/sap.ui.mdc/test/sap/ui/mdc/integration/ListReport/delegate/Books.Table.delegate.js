/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link"
], function (ODataTableDelegate, Field, Link) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);

	BooksTableDelegate.fetchProperties = function () {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (oProps) {
			var aFrontProps = [{
				description: undefined,
				filterable: true,
				label: "Author",
				maxLength: undefined,
				name: "author_name",
				path: "author/name",
				precision: undefined,
				scale: undefined,
				sortable: true,
				type: "Edm.String"
			}];
			return aFrontProps.concat(oProps);
		});
	};

	BooksTableDelegate._createColumnTemplate = function (oInfo) {

		var oProps = { value: "{" + (oInfo.path || oInfo.name) + "}", editMode: "Display", multipleLines: false };


		if (oInfo.name === "price") {
			oProps.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oInfo.name) != -1) {
			oProps.multipleLines = true;
		}

		if (oInfo.name === "language_code") {

			return new Field({
				id: "tFieldLink",
				value: "{language/name}",
				editMode: "Display"
			});

		}

		if (oInfo.name === "title") {

			return new Field({
				id: "tFieldLinkTitle",
				value: "{title}",
				editMode: "Display",

				multipleLines: true,
				fieldInfo: new Link({ sourceControl:"fTitle", delegate: {
					name: "sap/ui/mdc/flp/FlpLinkDelegate", payload: {
						semanticObjects: ["FakeFlpSemanticObject"],
						mainSemanticObject: "FakeFlpSemanticObject"
					}
				} })
			});

		}

		if (oInfo.name === "author_name") {

			return new Field({
				id: "tFieldLink",
				value: "{author/name}",
				editMode: "Display",
				multipleLines: true,
				fieldInfo: new Link({ delegate: { name: 'sap/ui/v4demo/delegate/Books.Link.delegate' } })
			});

		}

		return new Field(oProps);
	};

	BooksTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);
			var aSmallCols = ["actions", "stock", "ID"];

			if (oProperty.name === "title") {
				oColumn.setWidth("15rem");
			} else if (oProperty.name != "descr") {
				oColumn.setWidth(aSmallCols.indexOf(oProperty.name) != -1 ? "6rem" : "10rem");
			}

			oColumn.getTemplate().destroy();
			oColumn.setTemplate(BooksTableDelegate._createColumnTemplate(oProperty));

			return oColumn;
		});
	};

	return BooksTableDelegate;
});
