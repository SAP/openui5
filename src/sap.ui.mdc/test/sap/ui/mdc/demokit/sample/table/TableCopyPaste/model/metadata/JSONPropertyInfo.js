sap.ui.define([
], function() {
	"use strict";

	/* Property Example:
	{
	  "rank": 1,
	  "name": "Mount Everest",
	  "height": 8848,
	  "prominence": 8848,
	  "range": "Mahalangur Himalaya",
	  "coordinates": "27°59'17''N 86°55'31''E",
	  "parent_mountain": "-",
	  "first_ascent": 1953,
	  "countries": "Nepal, China"
	} */

	const aPropertyInfos = [{
		key: "name",
		label: "Name",
		path: "name",
		dataType: "sap.ui.model.type.String"
	},{
		key: "range",
		label: "Range",
		path: "range",
		dataType: "sap.ui.model.type.String"
	},{
		key: "name_range",
		label: "Name (Range)",
		propertyInfos: ["name", "range"],
		clipboardSettings: {
			template: "{0} ({1})"
		}
	},{
		key: "parent_mountain",
		label: "Parent Mountain",
		path: "parent_mountain",
		dataType: "sap.ui.model.type.String"
	},{
		key: "first_ascent",
		label: "First Ascent",
		path: "first_ascent",
		dataType: "sap.ui.model.type.Integer",
		clipboardSettings: {
			template: "Year {0}"
		}
	},{
		key: "height",
		label: "Height",
		path: "height",
		dataType: "sap.ui.model.type.Integer"
	},{
		key: "countries",
		label: "Countries",
		path: "countries",
		dataType: "sap.ui.model.type.String",
		clipboardSettings: null
	}];

	return aPropertyInfos;
}, /* bExport= */false);