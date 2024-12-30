/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.PopoverEdgePlacement", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.Popover";

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	function screenshotPlacements(sOpenerId, aPlacements) {
		aPlacements.forEach(function (sPlacement) {
			element(by.control({
				id: "placementSelect",
				interaction: {
					idSuffix: "arrow"
				}
			})).click();

			element(by.control({
				controlType: "sap.ui.core.Item",
				properties: {
					key: sPlacement
				},
				searchOpenDialogs: true,
				ancestor: {
					id: "placementSelect"
				}
			})).click();

			element(by.control({
				id: sOpenerId
			})).click();

			expect(takeScreenshot()).toLookAs(sOpenerId + "_placement_" + sPlacement);
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	}

	it("Left edge opener", function () {
		screenshotPlacements("inputLeftEdge", ["Top", "Bottom"]);
	});

	it("Right edge opener", function () {
		screenshotPlacements("inputRightEdge", ["Top", "Bottom"]);
	});

	it("Top edge opener", function () {
		screenshotPlacements("inputTopEdge", ["Left", "Right"]);
	});

	it("Bottom edge opener", function () {
		screenshotPlacements("inputBottomEdge", ["Left", "Right"]);
	});

});