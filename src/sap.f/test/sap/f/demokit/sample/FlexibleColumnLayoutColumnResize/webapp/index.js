sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.f.FlexibleColumnLayoutColumnResize',
		height : "100%",
		settings : {
			id : "sap.f.FlexibleColumnLayoutColumnResize"
		},
		manifest: true
	}).placeAt('content');
});
