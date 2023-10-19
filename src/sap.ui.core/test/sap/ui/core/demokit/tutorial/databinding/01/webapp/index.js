sap.ui.require([
	"sap/ui/core/Core",
	"sap/m/Text"
], function (
	Core,
	Text
) {
	"use strict";

	// Chain an anonymous function to the SAPUI5 'ready' Promise
	Core.ready().then(function () {
		// Create a text UI element that displays a hardcoded text string
		new Text({text: "Hi, my name is Harry Hawk"}).placeAt("content");
	});
});