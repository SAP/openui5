sap.ui.require([
	"sap/ui/core/ComponentContainer"

], function (
		ComponentContainer
	) {
	"use strict";

	new ComponentContainer({
		name : "sap.ui.mdc.acc.field",
		settings: {
			id : "fieldexample"
		},
		height: "100%"
	}).placeAt("content");

});