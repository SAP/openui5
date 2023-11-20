sap.ui.define(["sap/ui/core/Core"], function () {
	"use strict";

	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.ui.integration.cardeditor.test.testLib",
		version: "1.0.0",
		elements: [
			"sap.ui.integration.cardeditor.test.testLib.SharedExtension"
		],
		noLibraryCSS: true
	});

	return thisLib;
});