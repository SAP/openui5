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
		name: "rank",
		label: "Rank",
		visible: true,
		path: "rank",
		dataType: "sap.ui.model.type.Integer"
	},{
		name: "name",
		label: "Name",
		visible: true,
		path: "name",
		dataType: "sap.ui.model.type.String"
	},{
		name: "height",
		label: "Height",
		visible: true,
		path: "height",
		dataType: "mdc.sample.model.type.LengthMeter"
	},{
		name: "prominence",
		label: "Prominence",
		visible: true,
		path: "prominence",
		dataType: "mdc.sample.model.type.LengthMeter"
	},{
		name: "range",
		label: "Range",
		visible: true,
		path: "range",
		dataType: "sap.ui.model.type.String"
	},{
		name: "coordinates",
		label: "Coordinates",
		visible: true,
		path: "coordinates",
		dataType: "sap.ui.model.type.String"
	},{
		name: "parent_mountain",
		label: "Parent Mountain",
		visible: true,
		path: "parent_mountain",
		dataType: "sap.ui.model.type.String"
	},{
		name: "first_ascent",
		label: "First Ascent",
		visible: true,
		path: "first_ascent",
		dataType: "sap.ui.model.type.Integer"
	},{
		name: "countries",
		label: "Countries",
		visible: true,
		path: "countries",
		dataType: "sap.ui.model.type.String"
	},{
		name: "$search",
		label: "Search",
		visible: true,
		maxConditions: 1,
		dataType: "sap.ui.model.type.String"
	}];

	return aPropertyInfos;
}, /* bExport= */false);
