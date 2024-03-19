sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo"
], function (FilterBarDelegate, JSONPropertyInfo) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = function (oFilterBar) {
		const aPropertyInfo = [];
		JSONPropertyInfo.forEach(function (oPI) {
			let oFilterBarPropertyInfo;
			if (oPI.key.match(/buildingCountry|buildingLocation|buildingRegion/)) {
				oFilterBarPropertyInfo = Object.assign({}, oPI);
				// 'sortable' is not supported in the FilterBar, hence we can delete it.
				delete oFilterBarPropertyInfo.sortable;
				aPropertyInfo.push(oFilterBarPropertyInfo);
			}
		});

		return Promise.resolve(aPropertyInfo);
	};

	return JSONFilterBarDelegate;
});