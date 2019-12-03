/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Page",
	"sap/ui/testrecorder/recorderMock/CommunicationMock"
],	function (Core, XMLView, Page, CommunicationMock) {
	"use strict";

	Core.attachInit(function () {
		CommunicationMock.setup();

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
