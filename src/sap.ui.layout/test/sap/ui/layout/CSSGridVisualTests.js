sap.ui.require([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.layout.cssgrid.gridplayground",
		async: true,
		settings: {
			id: "gridplayground"
		}
	}).placeAt("content");

});