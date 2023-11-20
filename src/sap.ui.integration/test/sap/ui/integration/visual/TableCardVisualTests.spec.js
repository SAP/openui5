/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.TableCardVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	var aCardIds = ["tablecard1", "tablecard2", "tablecard3", "tablecard4", "tablecard5", "tablecard6"];

	it("Table Card", function () {
		utils.navigateTo("Table Card");

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "TableContent",
					interaction: "root",
					id: sId
				}
			}, "Table_Card_" + sId);
		});
	});

	it("Table Card Compact", function () {
		utils.switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "TableContent",
					interaction: "root",
					id: sId
				}
			}, "Compact_Table_Card_" + sId);
		});
	});
});
