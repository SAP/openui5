/* eslint-env node */
/* global describe, it, browser, expect, takeScreenshot */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.AnalyticalCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["line", "stackedColumn", "stackedBar", "donut", "bubble"];

	it("test initial page loading", function () {
		expect(takeScreenshot()).toLookAs("0_test_page");
	});

	it("Analytical Card", function () {
		utils.navigateTo("Analytical Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AnalyticalContent",
					interaction: "root",
					id: sId
				}
			}, "Analytical_Card_" + sId);
		});
	});
});
