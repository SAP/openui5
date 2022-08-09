/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ObjectCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["card1", "card2", "card3", "cardLongLabelAvatar"];

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
