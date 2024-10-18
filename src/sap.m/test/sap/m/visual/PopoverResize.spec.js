/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.PopoverResize", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Popover';

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should have correct resize handler when PlacementType Top", function () {
		// offsetX = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-top");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = -100
		element(by.id("offsetXM100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-top-offsetX-M100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = 100
		element(by.id("offsetX100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-top-offsetX-100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetX0-button")).click();
	});

	it("Should have correct resize handler when PlacementType Bottom", function () {
		element(by.id("bottom-button")).click();

		// offsetX = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-bottom");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = -100
		element(by.id("offsetXM100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-bottom-offsetX-M100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = 100
		element(by.id("offsetX100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-bottom-offsetX-100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetX0-button")).click();
	});

	it("Should have correct resize handler when PlacementType Left", function () {
		element(by.id("left-button")).click();

		// offsetY = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetY = -50
		element(by.id("offsetYM50-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-left-offsetY-M50");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetY = 50
		element(by.id("offsetY50-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-left-offsetY-50");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetY0-button")).click();
	});

	it("Should have correct resize handler when PlacementType Right", function () {
		element(by.id("right-button")).click();

		// offsetY = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetY = -50
		element(by.id("offsetYM50-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-right-offsetY-M50");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetY = 50
		element(by.id("offsetY50-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-right-offsetY-50");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetY0-button")).click();
	});

	it("Should have correct resize handler when PlacementType Top and No Arrow", function () {
		element(by.id("showArrow")).click();
		element(by.id("top-button")).click();

		// offsetX = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-top");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = -100
		element(by.id("offsetXM100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-top-offsetX-M100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = 100
		element(by.id("offsetX100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-top-offsetX-100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetX0-button")).click();
		element(by.id("showArrow")).click();
	});

	it("Should have correct resize handler when PlacementType Bottom and No Arrow", function () {
		element(by.id("showArrow")).click();
		element(by.id("bottom-button")).click();

		// offsetX = 0
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-bottom");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = -100
		element(by.id("offsetXM100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-bottom-offsetX-M100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		// offsetX = 100
		element(by.id("offsetX100-button")).click();
		element(by.id("btnOpen")).click();
		expect(takeScreenshot()).toLookAs("prh-no-arrow-bottom-offsetX-100");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		element(by.id("offsetX0-button")).click();
		element(by.id("showArrow")).click();
	});
});