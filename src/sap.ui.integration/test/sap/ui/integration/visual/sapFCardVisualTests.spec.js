/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.sapFCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.f.Card";

	var aCardIds = ["card1", "card2", "card3", "card4"];

	it("sap.f.Card", function () {
		utils.navigateTo("sap.f.Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "sapfCard",
					interaction: "root",
					id: sId
				}
			}, "sap_f_Card_" + sId);
		});
	});
});
