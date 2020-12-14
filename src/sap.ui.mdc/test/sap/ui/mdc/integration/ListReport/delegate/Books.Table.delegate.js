/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/m/Column"
], function (ODataTableDelegate, Field, Column) {
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

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLink",
				value: "{language/name}",
				editMode: "Display"
			}));

		}

		if (oInfo.name === "title") {

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLinkTitle",
				value: "{title}",
				editMode: "Display",

				multipleLines: true,
				fieldInfo: new sap.ui.mdc.Link({ sourceControl:"fTitle", delegate: {
					name: "sap/ui/mdc/flp/FlpLinkDelegate", payload: {
						semanticObjects: ["FakeFlpSemanticObject"],
						mainSemanticObject: "FakeFlpSemanticObject"
					}
				} })
			}));

		}

		if (oInfo.name === "author_name") {

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLink",
				value: "{author/name}",
				editMode: "Display",
				multipleLines: true,
				fieldInfo: new sap.ui.mdc.Link({ delegate: { name: 'sap/ui/v4demo/delegate/Books.Link.delegate' } })
			}));

		}

		return Promise.resolve(new Field(oProps));
	};

	BooksTableDelegate._createColumn = function (sPropertyInfoName, oTable) {
		return ODataTableDelegate._createColumn.apply(this, arguments).then(function (oColumn) {

			var sProp = oColumn.getDataProperty(),
				aSmallCols = ["actions", "stock", "ID"];

			if (sProp === "title") {
				oColumn.setWidth("15rem");
			} else if (sProp != "descr") {
				oColumn.setWidth(aSmallCols.indexOf(sProp) != -1 ? "6rem" : "10rem");
			}



			return oColumn;
		});
	};

	return BooksTableDelegate;
});
