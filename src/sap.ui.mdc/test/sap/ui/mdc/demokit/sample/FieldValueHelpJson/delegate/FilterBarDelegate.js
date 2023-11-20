sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo"
	], function (FilterBarDelegate, JSONPropertyInfo) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

    JSONFilterBarDelegate.fetchProperties = function(oFilterBar) {
		const aPropertyInfo = [];
		JSONPropertyInfo.forEach(function(oPI) {
			let oFilterBarPropertyInfo;
			if (oPI.name.match(/Region|Country|Location/)) {
				oFilterBarPropertyInfo = Object.assign({}, oPI);
				delete oFilterBarPropertyInfo.sortable;
				aPropertyInfo.push(oFilterBarPropertyInfo);
			}
		});

		return Promise.resolve(aPropertyInfo);
	};

	return JSONFilterBarDelegate;
});