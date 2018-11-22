sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/mvc/XMLView"
	], function (XMLView) {
		XMLView.create({
			viewName: "sap.ui.demo.walkthrough.view.App"
		}).then(function (oView) {
			oView.placeAt("content");
		});
	});
});