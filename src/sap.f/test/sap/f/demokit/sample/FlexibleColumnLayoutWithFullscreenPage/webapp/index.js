sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.f.FlexibleColumnLayoutWithFullscreenPage',
		height : "100%",
		settings : {
			id : "sap.f.FlexibleColumnLayoutWithFullscreenPage"
		},
		manifest: true
	}).placeAt('content');
});
