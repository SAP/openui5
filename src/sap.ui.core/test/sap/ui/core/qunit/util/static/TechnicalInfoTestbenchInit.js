sap.ui.getCore().attachInit(function () {
	"use strict";
	sap.ui.require(["sap/m/Text"], function (Text) {
		new Text({text: "A simple test page that is used to trigger the Technical Information Dialog"}).placeAt("content");
	});
});