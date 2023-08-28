/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Page"
],	function (Core, XMLView, Page) {
	"use strict";

	Core.ready(function () {

		XMLView.create({
			viewName: "sap.ui.testrecorder.ui.views.Main"
		}).then(function (xmlView) {
			var oPage = new Page("page", {
				showHeader: false,
				backgroundDesign: "Solid",
				content: [
					xmlView
				]
			});

			oPage.placeAt("content");
		});
	});
});
