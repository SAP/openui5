sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";
	new ComponentContainer({
		name: "sap.ui.layout.cssgrid.gridplayground",
		settings: {
			id: "gridplayground"
		}
	}).placeAt("content");
});