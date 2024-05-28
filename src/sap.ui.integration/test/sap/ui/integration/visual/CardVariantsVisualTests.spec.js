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

	function testTileVariant(aCardIds) {
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
	}

	it("TilesVariants - 2x2", function () {
		utils.navigateTo("Tiles Variants");

		testTileVariant(["card1", "card2", "card3", "card7", "card9", "card21", "card31", "card35", "card41"]);
	});

	it("TilesVariants - 4x2", function () {
		testTileVariant(["card4", "card5",  "card6", "card8", "card10", "card22", "card32", "card36"]);
	});

	it("TilesVariants - 2x1", function () {
		testTileVariant(["card11", "card12", "card13", "card17", "card19", "card23", "card33", "card37"]);
	});

	it("TilesVariants - 4x1", function () {
		testTileVariant(["card14", "card15", "card16",  "card18", "card20", "card24", "card34", "card38"]);

		utils.navigateBack();
	});
});