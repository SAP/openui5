/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ListCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["card1", "card2", "card3", "card4", "card5", "card6", "card7", "card8", "card9"];

	it("List Card", function () {
		utils.navigateTo("List Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ListContent",
					interaction: "root",
					id: sId
				}
			}, "List_Card_" + sId);
		});
	});

	it("List Card Compact", function () {
		utils.switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ListContent",
					interaction: "root",
					id: sId
				}
			}, "Compact_List_Card_" + sId);
		});
	});
});
