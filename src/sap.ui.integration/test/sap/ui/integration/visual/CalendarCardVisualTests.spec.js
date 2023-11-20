/* eslint-env node */
/* global describe, it, takeScreenshot, browser, expect, protractor */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CalendarCardVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.cards.CalendarContent";

	// open calendar card sample
	it("Calendar Card", function () {
		utils.navigateTo("Calendar Card");

		expect(takeScreenshot()).toLookAs("calendar_card_initialization");
	});

	// start tabbing
	it('Tab should move from header to calendar and selected date in it', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_calendar");
	});

	it('Tab should move from header to left arrow', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_left_arrow");
	});

	it('Tab should move from left arrow to today button', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_today_button");
	});

	it('Tab should move from today button to right arrow', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_right_arrow");
	});

	it('Tab should move from right arrow to picker button', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_picker_button");
	});

	it('Tab should move from picker button to grid', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_grid");
	});

	it('Tab should move from grid to more button', function() {
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("CalCard_tab_to_more_button");
	});

});