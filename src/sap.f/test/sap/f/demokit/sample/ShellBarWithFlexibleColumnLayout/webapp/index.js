sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.f.ShellBarWithFlexibleColumnLayout',
		height : "100%",
		settings : {
			id : "sap.f.ShellBarWithFlexibleColumnLayout"
		},
		manifest: true
	}).placeAt('content');
});
