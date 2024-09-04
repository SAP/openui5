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
		dataType: "sap.ui.model.type.String",
		exportSettings: {
			label: "Name",
			property: "name",
			width: 30
		}
	},{
		key: "range",
		label: "Range",
		path: "range",
		dataType: "sap.ui.model.type.String",
		exportSettings: {
			label: "Range",
			property: "range",
			width: 30
		}
	},{
		key: "name_range",
		label: "Name (Range)",
		propertyInfos: ["name", "range"],
		exportSettings: {
			label: "Name (Range)",
			property: ["name", "range"],
			template: "{0} ({1})",
			width: 50
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
		exportSettings: {
			label: "Custom Label",
			property: "first_ascent",
			template: "{0}"
		}
	},{
		key: "height",
		label: "Height",
		path: "height",
		dataType: "sap.ui.model.type.Integer",
		exportSettings: {
			label: "Height",
			property: "height",
			type: "Number",
			delimiter: true,
			width: 5
		}
	},{
		key: "countries",
		label: "Countries",
		path: "countries",
		dataType: "sap.ui.model.type.String",
		exportSettings: {
			label: "Countries",
			property: "countries",
			width: 20
		}
	}];

	return aPropertyInfos;
}, /* bExport= */false);
