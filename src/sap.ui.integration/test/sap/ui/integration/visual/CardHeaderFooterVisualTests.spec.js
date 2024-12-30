/* eslint-env node */
/* global describe, element, by, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardHeaderFooterVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Default Header", function () {
		utils.navigateTo("Default Header");
		var aCardIds = ["card1", "card2", "card3", "card4", "defaultDataTimestamp", "hiddenHeader", "withLargeIcon", "hyphenated"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "DefaultHeader",
					interaction: "root",
					id: sId
				}
			}, "Default_Header_" + sId);
		});

		utils.navigateBack();
	});

	it("Numeric Header", function () {
		utils.navigateTo("Numeric Header");
		var aCardIds = [
			"fcard1", "fcard2", "kpicard1", "kpicard2", "kpicard3", "kpicard4", "kpicard5", "tablecard1", "tablecard123",
			"unitOfMeasurementOnly", "hiddenHeader", "indicatorsVisibility1", "indicatorsVisibility2", "indicatorsVisibility3",
			"indicatorsVisibility4", "indicatorsVisibility5", "withLargeIcon", "hyphenated"
		];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NumericHeader",
					interaction: "root",
					id: sId
				}
			}, "NumericHeader_" + sId);
		});

		utils.navigateBack();
	});

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

			function focusElement(oConfig) {
				var oElement = utils.getElement(oConfig);
				browser.executeScript(function (sId) {
					document.getElementById(sId).focus();
				}, oElement.getWebElement().getAttribute("id"));
			}

			if (oCard.focus) {
				focusElement(oElement);
			}

			utils.takePictureOfElement(oElement, "1_NoHeader_" + oCard.id);
		});

		utils.navigateBack();
	});

	it("Footer", function () {
		utils.navigateTo("Footer");

		var aCards = [
			{ id: "card1" },
			{ id: "card2" },
			{ id: "card3" }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Footer",
					interaction: "root",
					id: oCard.id
				}
			};

			utils.takePictureOfElement(oElement, "10_Footer_" + oCard.id);
		});
		utils.navigateBack();
	});

	it("Card Actions Label", function () {
		utils.navigateTo("Footer");

		var oCard = {id: "card3"};

		var oElement = {
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Footer",
				interaction: "root",
				id: oCard.id
			}
		};

		element(by.control({
			controlType: "sap.ui.core.Icon",
			viewNamespace: "sap.f.cardsdemo.view.",
			viewName: "Footer",
			properties: {
				src: {
					regex: {
						source: "overflow"
					}
				}
			},
			ancestor: {
				id: "cardsplayground---footer--card3"
			}
		})).click();

		utils.takePictureOfElement(oElement, "10_Card_Actions_Label" + oCard.id);

		utils.navigateBack();
	});
});