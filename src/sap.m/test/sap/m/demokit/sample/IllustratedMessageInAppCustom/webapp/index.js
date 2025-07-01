sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.m.sample.IllustratedMessageInAppCustom',
		height : "100%",
		settings : {
			id : "sap.m.sample.IllustratedMessageInAppCustom"
		},
		manifest: true
	}).placeAt('content');
});
