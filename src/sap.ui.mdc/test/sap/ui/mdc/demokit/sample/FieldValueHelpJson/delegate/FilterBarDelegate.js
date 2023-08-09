sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo"
	], function (FilterBarDelegate, JSONPropertyInfo) {
	"use strict";

	var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

    JSONFilterBarDelegate.fetchProperties = function(oFilterBar) {
		var aPropertyInfo = [];
		JSONPropertyInfo.forEach(function(oPI) {
			var oFilterBarPropertyInfo;
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