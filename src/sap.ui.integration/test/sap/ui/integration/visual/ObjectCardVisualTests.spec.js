/* eslint-env node */
/* global describe, it, browser, expect, takeScreenshot */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ObjectCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("test initial page loading", function () {
		expect(takeScreenshot()).toLookAs("0_test_page");
	});

	var aCardIds = ["card1", "card2", "card3"];

	it("Object Card", function () {
		utils.navigateTo("Object Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ObjectContent",
					interaction: "root",
					id: sId
				}
			}, "Object_Card_" + sId);
		});
	});

	it("Object Card Compact", function () {
		utils.switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ObjectContent",
					interaction: "root",
					id: sId
				}
			}, "Compact_Object_Card_" + sId);
		});
	});
});
