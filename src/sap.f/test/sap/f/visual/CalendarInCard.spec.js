/* global describe, it, element, by, takeScreenshot, browser, expect, protractor */

describe("sap.f.CalendarInCard", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.f.CalendarInCard";

	function navigateTo(sTitle) {
		element(by.control({
			controlType: "sap.m.CustomListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: { text: sTitle }
			}
		})).click();
	}

	// open calendar card sample
	it("Calendar Card", function () {
		navigateTo("Calendar Card");

		expect(takeScreenshot()).toLookAs("calendar_card_initialization");
	});

	// start tabbing
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