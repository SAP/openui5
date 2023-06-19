sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core"
], function (Log) {
	"use strict";

	var thisLib = sap.ui.getCore().initLibrary({
		name : "cardWithDependencies.innerLibs.lib1",
		version: "1.0.0",
		noLibraryCSS: true
	});

	Log.info("cardWithDependencies.innerLibs.lib1 loaded");

	return thisLib;
});