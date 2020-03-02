/*!
 * ${copyright}
 */

/**
 * This module is used only for testing purposes.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Page",
	"sap/ui/support/mock/StorageSynchronizer"
], function (
	Core,
	XMLView,
	Page,
	StorageSynchronizer
) {
	"use strict";

	StorageSynchronizer.prepareInitFrame();
	StorageSynchronizer.preparePreserveFrame();
	StorageSynchronizer.initializeFrame();

	Core.attachInit(function () {

		XMLView.create({
			viewName: "sap.ui.support.supportRules.ui.views.Main"
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
