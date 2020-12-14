/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/m/Column"
], function (ODataTableDelegate, Field, Column) {
	"use strict";
	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);

	AuthorsTableDelegate._createColumnTemplate = function (oInfo) {

		var oProps = { value: "{" + (oInfo.path || oInfo.name) + "}", editMode: "Display", multipleLines: false};

		if (oInfo.name === "countryOfOrigin_code") {
			oProps.value = "{countryOfOrigin/descr}";
		}

		if (oInfo.name === "regionOfOrigin_code") {
			oProps.value = "{regionOfOrigin/text}";
		}

		if (oInfo.name === "cityOfOrigin_city") {
			oProps.value = "{cityOfOrigin/text}";
		}

		return Promise.resolve(new Field(oProps));
	};

	return AuthorsTableDelegate;
});
