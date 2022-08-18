/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardHeadersVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Default Header", function () {
		utils.navigateTo("Default Header");
		var aCardIds = ["card1", "card2", "card3", "card4", "defaultDataTimestamp", "hiddenHeader"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "DefaultHeader",
					interaction: "root",
					id: sId
				}
			}, "Default_Header_" + sId);
		});

		utils.navigateBack();
	});

	it("Numeric Header", function () {
		utils.navigateTo("Numeric Header");
		var aCardIds = ["fcard1", "fcard2", "kpicard1", "kpicard2", "kpicard3", "kpicard4", "kpicard5", "tablecard1", "tablecard123", "unitOfMeasurementOnly", "hiddenHeader"];

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NumericHeader",
					interaction: "root",
					id: sId
				}
			}, "NumericHeader_" + sId);
		});
	});
});
