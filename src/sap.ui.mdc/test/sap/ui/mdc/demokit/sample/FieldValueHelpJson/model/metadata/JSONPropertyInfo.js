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
        name : "buildingId",
        path : "id",
        label : "Id",
        key : true,
        dataType : "sap.ui.model.type.String",
        sortable : true
    },{
        name : "buildingName",
        path : "name",
        label : "Building Name",
        dataType : "sap.ui.model.type.String",
        sortable : true
    },{
        name : "buildingLocation",
        path : "locationId",
        label : "Location",
        dataType : "sap.ui.model.type.String",
        sortable : false
    },{
        name : "buildingCountry",
        path : "countryId",
        label : "Country",
        dataType : "sap.ui.model.type.String",
        sortable : false
    },{
        name : "buildingRegion",
        path : "regionId",
        label : "Region",
        dataType : "sap.ui.model.type.String",
        sortable : false
    }];

	return aPropertyInfos;
}, /* bExport= */false);
