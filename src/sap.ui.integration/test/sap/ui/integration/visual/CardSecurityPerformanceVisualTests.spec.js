/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardSecurityPerformanceVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

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
});