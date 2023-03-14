/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ObjectCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = [
		"cardDataHandling",
		"cardStaticData",
		"cardForm",
		"cardLongLabelAvatar",
		"cardImageNoHeader",
		"cardImage",
		"cardImageOnlyInGroup",
		"cardImageSmall",
		"cardImageOnly",
		"cardJustImage",
		"cardImageOnlyWithFooter",
		"cardImageWithFooter",
		"cardImageNoHeaderNoFooter"
	];

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
			}, "Object_" + sId);
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
			}, "Compact_Object_" + sId);
		});
	});
});
