sap.ui.require([
	"sap/ui/core/ComponentContainer"

], function (
		ComponentContainer
	) {
	"use strict";

	new ComponentContainer({
		name : "sap.ui.mdc.acc.link",
		settings: {
			id : "LinkAccessibility"
		},
		height: "100%"
	}).placeAt("content");
});