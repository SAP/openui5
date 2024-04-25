/**
 * Initialization Code of library sap.ui.failingcssimport.testlib.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Library) {
	"use strict";

	// delegate further initialization of this library to the framework
	return Library.init({
		name : "sap.ui.failingcssimport.testlib",
		apiVersion:2,
		version: "1.0.0",
		dependencies : ["sap.ui.core"],
		types: [],
		controls: [],
		elements: []
	});
});
