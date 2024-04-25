sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"testlibs/scenario15/lib10/library"
], function(Library) {
	"use strict";
	return Library.init({
		name: "testlibs.scenario15.lib9",
		apiVersion: 2,
		dependencies: [
			"testlibs.scenario15.lib10"
		],
		noLibraryCSS: true
	});
});