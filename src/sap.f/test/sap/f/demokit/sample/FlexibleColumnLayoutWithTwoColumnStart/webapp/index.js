sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.f.FlexibleColumnLayoutWithTwoColumnStart',
		height : "100%",
		settings : {
			id : "sap.f.FlexibleColumnLayoutWithTwoColumnStart"
		},
		manifest: true
	}).placeAt('content');
});
