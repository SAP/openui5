/* eslint-env node */
/*global describe,it,takeScreenshot,expect,browser, element, by*/

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardStandaloneHeaderVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	const aDefaultCardIds = [
			"card1", "card2", "card3", "card4", "card5", "dataTimestamp", "withLargeIcon"],
		aNumericCardIds = [
			"kpicard1", "kpicard2", "kpicard3", "kpicard6",
			"indicators1", "indicators2", "indicators3", "indicators4", "indicators5"
		];

	it("should load test page",function(){
		utils.navigateTo("Cloned Header");
		expect(takeScreenshot()).toLookAs("initial");
	});


	it("Cloned Default Header", function () {
		aDefaultCardIds.forEach((cardId) => {
			utils.takePictureOfElement({
				control: {
					controlType: "sap.ui.integration.cards.Header",
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ClonedHeader",
					id: /.*-header-standalone/,
					ancestor: {
							id: `iHeaderContainer-${cardId}`,
							viewNamespace: "sap.f.cardsdemo.view.",
							viewName: "ClonedHeader"
					}
				}
			}, `Cloned_Default_Header_${cardId}`);
		});
	});

	it("Cloned Numeric Header", function () {
		aNumericCardIds.forEach((cardId) => {
			utils.takePictureOfElement({
				control: {
					controlType: "sap.ui.integration.cards.NumericHeader",
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ClonedHeader",
					id: /.*-header-standalone/,
					ancestor: {
							id: `iNumericHeaderContainer-${cardId}`,
							viewNamespace: "sap.f.cardsdemo.view.",
							viewName: "ClonedHeader"
					}
				}
			}, `Cloned_Numeric_Header_${cardId}`);
		});
	});

	it("sap.f.Headers", function () {
		const fheader = element(by.id("fHeader"));
		const fNumericHeader = element(by.id("fNumericHeader"));

		browser.executeScript(function (sId) {
			document.getElementById(sId).scrollIntoView();
		}, fheader.getWebElement().getAttribute("id"));
		expect(takeScreenshot(fheader)).toLookAs('fheader');

		browser.executeScript(function (sId) {
			document.getElementById(sId).scrollIntoView();
		}, fNumericHeader.getWebElement().getAttribute("id"));
		expect(takeScreenshot(fNumericHeader)).toLookAs('fNumericHeader');
	});
});