sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.mdc.sample.ValueHelp",
		settings : {
			id : "valuehelpdemo"
		},
		height: "100%"
	}).placeAt("content");
});
