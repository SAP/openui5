/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.AnalyticsCloudCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["card1", "card2"];

	it("AnalyticsCloud Card", function () {
		utils.navigateTo("AnalyticsCloud Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AnalyticsCloudContent",
					interaction: "root",
					id: sId
				}
			}, "AnalyticsCloud_Card" + sId);
		});
	});
});
