/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.HeaderInfoSectionVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["card1", "card2"];

	it("Header Info Section", function () {
		utils.navigateTo("Header Info Section");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "HeaderInfoSection",
					interaction: "root",
					id: sId
				}
			}, "Header_Info_Section_" + sId);
		});
	});
});
