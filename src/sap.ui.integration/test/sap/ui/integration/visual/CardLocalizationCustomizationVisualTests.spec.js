/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardLocalizationCustomizationVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Translation", function () {
		utils.navigateTo("Translations & Header Count");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Translation",
				interaction: "root",
				id: "card"
			}
		}, "4_Translations");

		utils.navigateBack();
	});

	it("Badges", function () {
		utils.navigateTo("Badges");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Badges",
				id: "badgesPage"
			}
		}, "5_Badges");

		utils.navigateBack();
	});

	it("Preview", function () {
		utils.navigateTo("Preview");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Preview",
				id: "previewPage"
			}
		}, "6_Preview");

		utils.navigateBack();
	});

	it("Filters", function () {
		utils.navigateTo("Filters");
		var aCardIds = ["card", "cardDateRange", "cardDateRangeParam", "cardDateRangeParam2"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Filters",
					interaction: "root",
					id: sId
				}
			}, "7_Filters_" + sId);
		});

		utils.navigateBack();
	});
});