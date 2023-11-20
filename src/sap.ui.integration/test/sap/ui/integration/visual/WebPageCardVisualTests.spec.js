/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.WebPageCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.cards.WebPageContent";

	it("WebPage Card", function () {
		utils.navigateTo("WebPage Card");
		var aCardIds = ["webPageCardLocal"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "WebPageContent",
					interaction: "root",
					id: sId
				}
			}, "WebPage_Card_" + sId);
		});
	});
});
