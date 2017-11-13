/**
 * Initialization Code of library sap.ui.customthemefallback.testlib.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/library"
], function() {
	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.customthemefallback.testlib",
		version: "1.0.0",
		dependencies : ["sap.ui.core"],
		types: [],
		controls: [],
		elements: []
	});

	return sap.ui.customthemefallback.testlib;

});
