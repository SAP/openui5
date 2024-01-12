sap.ui.define(["sap/ui/core/Lib"], function(Library) {
	"use strict";

	var thisLib = Library.init({
		name : "card.test.shared.lib",
		version: "1.0.0",
		elements: [
			"card.test.shared.lib.SharedExtension"
		],
		noLibraryCSS: true
	});

	return thisLib;
});