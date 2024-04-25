/**
 * Initialization Code of library sap.ui.customthemefallback.testlib.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";

	// delegate further initialization of this library to the Core
	return Library.init({
		name : "sap.ui.customthemefallback.testlib",
		apiVersion:2,
		version: "1.0.0",
		dependencies : ["sap.ui.core"],
		types: [],
		controls: [],
		elements: []
	});
});
