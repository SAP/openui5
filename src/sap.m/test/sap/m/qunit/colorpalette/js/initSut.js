sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function(
	ComponentContainer
) {
	"use strict";

	new ComponentContainer({
		height: "100%",
		width: "100%",
		name: "cp.opa.test.app",
		manifest: true
	}).placeAt("content");
});
