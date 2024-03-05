sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function(ComponentContainer) {
	"use strict";

	new ComponentContainer({
		height : "100%",
		name : "sap.m.sample.ComparisonPattern.app",
		settings : {
			id : "app"
		},
		manifest: true
	}).placeAt("content");
});