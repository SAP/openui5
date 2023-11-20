sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field"
], function (ODataTableDelegate, Field) {
	"use strict";
	const BooksTableDelegate = Object.assign({}, ODataTableDelegate);

	BooksTableDelegate._createColumnTemplate = function (oInfo) {
		const oProps = { value: "{" + (oInfo.path || oInfo.name) + "}", editMode: "Display", width:"100%", multipleLines: false };

		if (oInfo.name === "price") {
			oProps.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oInfo.name) != -1) {
			oProps.multipleLines = true;
		}

		return new Field(oProps);
	};

	BooksTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			const oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);
			const aSmallCols = ["actions", "stock", "ID"];

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
