/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardLayoutsVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Fit Container", function () {
		utils.navigateTo("Fit Container");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Splitter",
				interaction: "root",
				id: "container"
			}
		}, "1_Fit_Container");


		utils.navigateBack();
	});

	it("Grid Container", function () {
		utils.navigateTo("Grid Container");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "GridContainer",
				interaction: "root",
				id: "grid1"
			}
		}, "2_Grid_Container");

		utils.navigateBack();
	});

	it("Grid Container DnD", function () {
		utils.navigateTo("GridContainer Drag and Drop with Target Position");

		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Dnd3",
				id: "grid4"
			}
		}, "3_Grid_Container_DnD");

		utils.navigateBack();
	});

	var aMinHeightCardIds = [
		"donutChart", "largeList", "staticData", "noContent", "sapFCardMinHeight", "webPageCard"
	];

	it("Min-height", function () {
		utils.navigateTo("Min-height of the Card Content");

		aMinHeightCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "MinHeight",
					interaction: "root",
					id: sId
				}
			}, "4_Min_Height_" + sId);
		});

	});

	it("Compact Min-height", function () {
		utils.switchToCompactDensity();

		aMinHeightCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "MinHeight",
					interaction: "root",
					id: sId
				}
			}, "4_Compact_Min_Height_" + sId);
		});

		utils.navigateBack();
	});
});
