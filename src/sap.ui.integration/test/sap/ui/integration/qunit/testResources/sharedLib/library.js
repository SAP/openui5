sap.ui.define(["sap/ui/core/Core"], function () {
	"use strict";

	var thisLib = sap.ui.getCore().initLibrary({
		name : "card.test.shared.lib",
		version: "1.0.0",
		elements: [
			"card.test.shared.lib.SharedExtension"
		],
		noLibraryCSS: true
	});

	return thisLib;
});