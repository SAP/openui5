sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.f.FlexibleColumnLayoutWithOneColumnStart',
		height : "100%",
		settings : {
			id : "sap.f.FlexibleColumnLayoutWithOneColumnStart"
		},
		manifest: true
	}).placeAt('content');
});
