sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib"
], function(Log, Library) {
	"use strict";

	var thisLib = Library.init({
		name : "cardWithDependencies.innerLibs.lib1",
		apiVersion: 2,
		version: "1.0.0",
		noLibraryCSS: true
	});

	Log.info("cardWithDependencies.innerLibs.lib1 loaded");

	return thisLib;
});