/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ObjectCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = [
		"cardDataHandling",
		"cardSnackAndObjectStatus",
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
		"cardImageAndOverlayWithFooter2",
		"cardImageWithFooter",
		"cardImageAndOverlayWithFooter",
		"cardImageNoHeaderNoFooter",
		"cardImageAndOverlayNoHeaderNoFooter",
		"cardJustImageWithOverlay",
		"cardJustImageWithOverlayTextPosition",
		"cardJustImageWithOverlayGradient",
		"justImageWithOverlayImagePosition",
		"justImageWithOverlayNotFullWidth",
		"justImageWithOverlayCalcHeight",
		"justImageWithOverlayImgHeight"
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
