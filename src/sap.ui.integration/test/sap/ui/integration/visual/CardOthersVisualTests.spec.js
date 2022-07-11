/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardOthersVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	function focusElement(oConfig) {
		var oElement = utils.getElement(oConfig);
		browser.executeScript("arguments[0].focus()", oElement.getWebElement());
	}

	it("No Header", function () {
		utils.navigateTo("No Header / No Content");

		var aCards = [
			{ id: "i1" },
			{ id: "f3" },
			{ id: "i4", focus: true }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NoHeaderNoContent",
					interaction: "root",
					id: oCard.id
				}
			};

			if (oCard.focus) {
				focusElement(oElement);
			}

			utils.takePictureOfElement(oElement, "1_NoHeader_" + oCard.id);
		});
	});

	it("No Content", function () {
		var aCards = [
			{ id: "i2", focus: true },
			{ id: "i5", focus: true },
			{ id: "i6-error", focus: true }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NoHeaderNoContent",
					interaction: "root",
					id: oCard.id
				}
			};

			if (oCard.focus) {
				focusElement(oElement);
			}

			utils.takePictureOfElement(oElement, "2_NoContent_" + oCard.id);
		});
	});

	it("Error Messages", function () {
		var aCards = [
			{ id: "i7-error", focus: true },
			{ id: "ListNodata-error", focus: true },
			{ id: "TableNodata-error", focus: true },
			{ id: "Custom-error", focus: true },
			{ id: "BadUrl-error", focus: true }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NoHeaderNoContent",
					interaction: "root",
					id: oCard.id
				}
			};

			if (oCard.focus) {
				focusElement(oElement);
			}

			utils.takePictureOfElement(oElement, "3_ErrorMessage_" + oCard.id);
		});

		utils.navigateBack();
	});

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

	it("Pagination", function () {
		utils.navigateTo("Pagination");
		var aCardIds = ["card1", "card2"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Pagination",
					interaction: "root",
					id: sId
				}
			}, "8_Pagination_" + sId);
		});

		utils.navigateBack();
	});

	it("Transparent Card", function () {
		utils.navigateTo("Transparent");
		var aCardIds = ["containerCard", "list1", "object1", "todo3"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Transparent",
					interaction: "root",
					id: sId
				}
			}, "9_Transparent_Card_" + sId);
		});

		utils.navigateBack();
	});

	it("Parameters", function () {
		utils.navigateTo("Parameters");
		var aCardIds = ["weatherCard", "manifestOnly", "listCard", "defaultFromManifest", "defaultFromManifestOverwrite"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Parameters",
					interaction: "root",
					id: sId
				}
			}, "10_Parameters_" + sId);
		});

		utils.navigateBack();
	});
});
