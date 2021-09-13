sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field"
], function (ODataTableDelegate, Field) {
	"use strict";

	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);

	AuthorsTableDelegate._createColumnTemplate = function (oProperty) {

		var oCtrlProperties = { value: "{" + (oProperty.path || oProperty.name) + "}", editMode: "Display", multipleLines: false};

		if (oProperty.name === "countryOfOrigin_code") {
			oCtrlProperties.value = "{countryOfOrigin/descr}";
		}

		if (oProperty.name === "regionOfOrigin_code") {
			oCtrlProperties.value = "{regionOfOrigin/text}";
		}

		if (oProperty.name === "cityOfOrigin_city") {
			oCtrlProperties.value = "{cityOfOrigin/text}";
		}

		return new Field(oCtrlProperties);
	};

	AuthorsTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			// oColumn.getTemplate().destroy();
			// if (oColumn._oTemplateClone) {
			// 	oColumn._oTemplateClone.destroy();
			// 	delete oColumn._oTemplateClone;
			// }

			var oTemplate = AuthorsTableDelegate._createColumnTemplate(oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	return AuthorsTableDelegate;
});
