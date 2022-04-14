/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.AdaptiveCardVisualTestsInPlayground", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["adaptivecard1", "adaptivecard2", "adaptivecard3"];

	it("Adaptive Card", function () {
		utils.navigateTo("Adaptive Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AdaptiveCard",
					interaction: "root",
					id: sId
				}
			}, "Adaptive_Card_" + sId);
		});
	});
});
