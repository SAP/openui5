/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.PopoverPlacement", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Popover';

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open Popover with PlacementType Auto ", function () {
		/* placement auto - left button */
		element(by.id("btn0")).click();
		expect(takeScreenshot()).toLookAs("popover-auto-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement auto - right button */
		element(by.id("btn1")).click();
		expect(takeScreenshot()).toLookAs("popover-auto-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

	});

	it("Should open Popover with PlacementType Bottom", function () {
		element(by.id("btn2")).click();
		expect(takeScreenshot()).toLookAs("popover-bottom");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType Horizontal ", function () {
		/* placement horizontal - left button */
		element(by.id("btn3")).click();
		expect(takeScreenshot()).toLookAs("popover-horizontal-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement horizontal - right button */
		element(by.id("btn4")).click();
		expect(takeScreenshot()).toLookAs("popover-horizontal-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType HorizontalPreferredLeft", function () {
		/* placement HorizontalPreferredLeft - left button */
		element(by.id("btn5")).click();
		expect(takeScreenshot()).toLookAs("popover-HorizontalPreferredLeft-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement HorizontalPreferredLeft - right button */
		element(by.id("btn6")).click();
		expect(takeScreenshot()).toLookAs("popover-HorizontalPreferredLeft-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType HorizontalPreferredRight", function () {
		/* placement HorizontalPreferredRight - left button */
		element(by.id("btn7")).click();
		expect(takeScreenshot()).toLookAs("popover-HorizontalPreferredRight-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement HorizontalPreferredRight - right button */
		element(by.id("btn8")).click();
		expect(takeScreenshot()).toLookAs("popover-HorizontalPreferredRight-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType Left", function () {
		element(by.id("btn9")).click();
		expect(takeScreenshot()).toLookAs("popover-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType Right", function () {
		element(by.id("btn10")).click();
		expect(takeScreenshot()).toLookAs("popover-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType PreferredBottomOrFlip", function () {
		/* placement PreferredBottomOrFlip - left button */
		element(by.id("btn11")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredBottomOrFlip-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement PreferredBottomOrFlip - right button */
		element(by.id("btn12")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredBottomOrFlip-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType PreferredLeftOrFlip", function () {
		/* placement PreferredLeftOrFlip - left button */
		element(by.id("btn13")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredLeftOrFlip-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement PreferredLeftOrFlip - right button */
		element(by.id("btn14")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredLeftOrFlip-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType PreferredRightOrFlip", function () {
		/* placement PreferredRightOrFlip - left button */
		element(by.id("btn15")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredRightOrFlip-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement PreferredRightOrFlip - right button */
		element(by.id("btn16")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredRightOrFlip-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType PreferredTopOrFlip", function () {
		/* placement PreferredTopOrFlip - left button */
		element(by.id("btn17")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredTopOrFlip-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement PreferredTopOrFlip - right button */
		element(by.id("btn18")).click();
		expect(takeScreenshot()).toLookAs("popover-PreferredTopOrFlip-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType Top", function () {
		element(by.id("btn19")).click();
		expect(takeScreenshot()).toLookAs("popover-top");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType Verical ", function () {
		/* placement verical - left button */
		element(by.id("btn20")).click();
		expect(takeScreenshot()).toLookAs("popover-verical-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement verical - right button */
		element(by.id("btn21")).click();
		expect(takeScreenshot()).toLookAs("popover-verical-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType VerticalPreferredBottom", function () {
		/* placement VerticalPreferredBottom - left button */
		element(by.id("btn22")).click();
		expect(takeScreenshot()).toLookAs("popover-VerticalPreferredBottom-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement VerticalPreferredBottom - right button */
		element(by.id("btn23")).click();
		expect(takeScreenshot()).toLookAs("popover-VerticalPreferredBottom-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Should open Popover with PlacementType VerticalPreferredTop", function () {
		/* placement VerticalPreferredTop - left button */
		element(by.id("btn24")).click();
		expect(takeScreenshot()).toLookAs("popover-VerticalPreferredTop-left");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

		/* placement VerticalPreferredTop - right button */
		element(by.id("btn25")).click();
		expect(takeScreenshot()).toLookAs("popover-VerticalPreferredTop-right");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});
});