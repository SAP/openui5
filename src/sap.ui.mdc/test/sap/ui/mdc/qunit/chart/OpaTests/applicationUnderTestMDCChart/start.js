sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "applicationUnderTestMDCChart",
		settings : {
			id : "applicationUnderTestMDCChart"
		},
		async: true
	}).placeAt("content");
});