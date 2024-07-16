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

	const aPropertyInfos = [
        {
          key: "buildingId",
          path: "id",
          label: "Id",
          isKey: true,
          dataType: "sap.ui.model.type.String",
          sortable: true
        },
        {
          key: "buildingName",
          path: "name",
          label: "Building Name",
          dataType: "sap.ui.model.type.String",
          sortable: true
        },
        {
          key: "buildingLocation",
          path: "locationId",
          label: "Location",
          dataType: "sap.ui.model.type.String",
          sortable: false
        },
        {
          key: "buildingCountry",
          path: "countryId",
          label: "Country",
          dataType: "sap.ui.model.type.String",
          sortable: false
        },
        {
          key: "buildingRegion",
          path: "regionId",
          label: "Region",
          dataType: "sap.ui.model.type.String",
          sortable: false
        },
        {
          key: "$search",
          label: "Search",
          visible: true,
          maxConditions: 1,
          dataType: "sap.ui.model.type.String"
        }
      ];

	return aPropertyInfos;
});
