sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.v4demo",
		settings : {
			id : "v4demo"
		},
		height: "100%"
	}).placeAt("content");
});
