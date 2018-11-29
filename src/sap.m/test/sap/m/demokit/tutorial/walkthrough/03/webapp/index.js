sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/m/Text"
	], function (Text) {
		new Text({
			text: "Hello World"
		}).placeAt("content");
	});
});