sap.ui.define(["sap/ui/core/Lib", "sap/ui/core/Core"], function(Library) {
	"use strict";

	var thisLib = Library.init({
		name : "sap.ui.integration.cardeditor.test.testLib",
		version: "1.0.0",
		elements: [
			"sap.ui.integration.cardeditor.test.testLib.SharedExtension"
		],
		noLibraryCSS: true
	});

	return thisLib;
});