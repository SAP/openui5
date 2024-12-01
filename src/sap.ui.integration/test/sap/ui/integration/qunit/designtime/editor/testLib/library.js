sap.ui.define(["sap/ui/core/Lib"], function(Library) {
	"use strict";

	var thisLib = Library.init({
		name : "sap.ui.integration.cardeditor.test.testLib",
		apiVersion: 2,
		version: "1.0.0",
		elements: [
			"sap.ui.integration.cardeditor.test.testLib.SharedExtension"
		],
		noLibraryCSS: true
	});

	return thisLib;
});