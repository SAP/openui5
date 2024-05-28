/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.ObjectCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	const aCardIds = [
		"cardDataHandling",
		"cardSnackAndObjectStatus",
		"cardStaticData",
		"cardForm",
		"cardLongLabelAvatar"
	];

	const aCardWithImageIds1 = [
		"cardImageNoHeader",
		"cardImage",
		"cardImageOnlyInGroup",
		"cardImageSmall",
		"cardImageOnly"
	];

	const aCardWithImageIds2 = [
		"cardImageOnly",
		"cardJustImage",
		"cardImageOnlyWithFooter",
		"cardImageWithFooter",
		"cardImageNoHeaderNoFooter"
	];

	const aCardWithImageOverlayIds1 = [
		"cardImgOvWithFooter2",
		"cardImgOvWithFooter",
		"cardImgOvNoHeaderNoFooter",
		"cardJustImageWithOverlay",
		"cardImgOvTextPosition"
	];

	const aCardWithImageOverlayIds2 = [
		"cardImgOverlayGradient",
		"cardImgOvImagePosition",
		"cardImgOvNotFullWidth",
		"cardImgOvCalcHeight",
		"cardImgOvImgHeight"
	];

	function testObjectCard(sPrefix, aCardIds) {
		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ObjectContent",
					interaction: "root",
					id: sId
				}
			}, sPrefix + sId);
		});
	}

	it("Object Card", function () {
		utils.navigateTo("Object Card");

		testObjectCard("Object_", aCardIds);
	});

	it("Object Card with Image", function () {
		testObjectCard("Object_", aCardWithImageIds1);
	});

	it("Object Card with Image", function () {
		testObjectCard("Object_", aCardWithImageIds2);
	});

	it("Object Card with Overlay Image", function () {
		testObjectCard("Object_", aCardWithImageOverlayIds1);
	});

	it("Object Card with Overlay Image", function () {
		testObjectCard("Object_", aCardWithImageOverlayIds2);
	});

	it("Object Card - Compact", function () {
		utils.switchToCompactDensity();

		testObjectCard("Compact_Object_", aCardIds);
	});

	it("Object Card with Image - Compact", function () {
		testObjectCard("Compact_Object_", aCardWithImageIds1);
	});

	it("Object Card with Image - Compact", function () {
		testObjectCard("Compact_Object_", aCardWithImageIds2);
	});

	it("Object Card with Overlay Image - Compact", function () {
		testObjectCard("Compact_Object_", aCardWithImageOverlayIds1);
	});

	it("Object Card with Overlay Image - Compact", function () {
		testObjectCard("Compact_Object_", aCardWithImageOverlayIds2);
	});
});
