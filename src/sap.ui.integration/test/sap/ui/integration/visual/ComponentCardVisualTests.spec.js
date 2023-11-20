/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ComponentCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["comp", "ticket"];

	it("Component Card", function () {
		utils.navigateTo("Component Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ComponentCard",
					interaction: "root",
					id: sId
				}
			}, "Component_Card_" + sId);
		});
	});

	it("Component Card Compact", function () {
		utils.switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ComponentCard",
					interaction: "root",
					id: sId
				}
			}, "Compact_Component_Card_" + sId);
		});
	});
});
