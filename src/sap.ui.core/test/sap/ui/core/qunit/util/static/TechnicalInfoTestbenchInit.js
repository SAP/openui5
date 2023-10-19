sap.ui.require([
	"sap/ui/core/Core",
	"sap/m/Text"
], function(
	Core,
	Text
) {
	"use strict";
	Core.ready().then(function() {
		new Text({text: "A simple test page that is used to trigger the Technical Information Dialog"}).placeAt("content");
	});
});