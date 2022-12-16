/**
 * Initialization Code of library sap.ui.customthemefallback.testlib.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"jquery.sap.global"
], function(Core) {
	"use strict";

	// delegate further initialization of this library to the Core
	return Core.initLibrary({
		name : "sap.ui.customthemefallback.testlib",
		version: "1.0.0",
		dependencies : ["sap.ui.core"],
		types: [],
		controls: [],
		elements: []
	});
});
