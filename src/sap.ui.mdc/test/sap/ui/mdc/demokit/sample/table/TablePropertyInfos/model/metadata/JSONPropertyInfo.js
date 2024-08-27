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
		key: "rank",
		isKey: true,
		label: "Rank",
		path: "rank",
		dataType: "sap.ui.model.type.Integer"
	},{
		key: "name",
		label: "Name",
		path: "name",
		dataType: "sap.ui.model.type.String",
		visualSettings: {
			widthCalculation: {
				minWidth: 5,
				maxWidth: 15
			}
		}
	},{
		key: "height",
		label: "Height",
		path: "height",
		dataType: "sap.ui.model.type.Integer",
		formatOptions: {style: "short", decimals: 2},
		visualSettings: {
			widthCalculation: {minWidth: 5, maxWidth: 5}
		}
	},{
		key: "prominence",
		label: "Prominence",
		path: "prominence",
		dataType: "sap.ui.model.type.Integer",
		formatOptions: {decimals: 1},
		visualSettings: {
			widthCalculation: {minWidth: 5, maxWidth: 5}
		}
	},{
		key: "height_prominence_ComplexWithText",
		label: "Height / Prominence",
		tooltip: "Mountain height in relation to prominence",
		propertyInfos: ["height", "prominence"],
		exportSettings: {template: "{0} m / {1} m"},
		visualSettings: {
			widthCalculation: {includeLabel: true}
		}
	},{
		key: "range",
		label: "Range",
		path: "range",
		dataType: "sap.ui.model.type.String",
		visible: false,
		visualSettings: {
			widthCalculation: {minWidth: 5, maxWidth: 10}
		}
	},{
		key: "coordinates",
		label: "Coordinates",
		path: "coordinates",
		filterable: false,
		sortable: false,
		dataType: "sap.ui.model.type.String",
		visualSettings: {
			widthCalculation: {truncateLabel: true}
		}
	},{
		key: "parent_mountain",
		label: "Parent Mountain",
		path: "parent_mountain",
		dataType: "sap.ui.model.type.String",
		maxConditions: 1,
		constraints: {maxLength: 20}
	},{
		key: "first_ascent",
		label: "First Ascent",
		path: "first_ascent",
		dataType: "sap.ui.model.type.Integer"
	},{
		key: "countries",
		label: "Countries",
		path: "countries",
		dataType: "sap.ui.model.type.String",
		groupable: true,
		groupLabel: "Test"
	},{
		key: "name_range",
		label: "Name (Range)",
		propertyInfos: ["name", "range"],
		visualSettings: {
			widthCalculation: {verticalArrangement: true}
		}
	}];

	return aPropertyInfos;
}, /* bExport= */false);
