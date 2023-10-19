/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardVariantsVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Transparent Card", function () {
		utils.navigateTo("Transparent");
		var aCardIds = ["component1", "containerCard", "list1", "object1", "todo3", "table1"];

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

	it("TilesVariants", function () {
		utils.navigateTo("Tiles Variants");

		var aCardIds = [
			"card1", "card2", "card3", "card4", "card5", "card6", "card7", "card8", "card9", "card10",
			"card11", "card12", "card13", "card14", "card15", "card16", "card17", "card18", "card19", "card20",
			"card21", "card22", "card23", "card24"
		];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "TilesVariants",
					interaction: "root",
					id: sId
				}
			}, "11_TilesVariants_" + sId);
		});

		utils.navigateBack();
	});
});