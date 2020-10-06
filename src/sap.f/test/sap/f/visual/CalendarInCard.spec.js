/* global describe, it, element, by, takeScreenshot, browser, expect, protractor */

describe("sap.f.CalendarInCard", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.CalendarInCard";

	function navigateTo(sTitle) {
		element(by.control({
			controlType: "sap.m.CustomListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: { text: sTitle }
			}
		})).click();
	}

	it("Calendar Card", function () {
		navigateTo("Calendar Card");

		expect(takeScreenshot()).toLookAs("calendar_card_initialization");
	});

	it('Tab should move from calendar to more button', function() {
		// Arrange
		browser.executeScript('document.getElementsByClassName("sapUiCalItem")[6].focus()');
		// Act
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("calendar_card_tab_check");
	});

	it('Shift Tab should move from first button to header', function() {
		// Arrange
		browser.executeScript('document.getElementsByClassName("sapMBtn","sapMBarChild")[0].focus()');
		// Act
		browser.actions().sendKeys(protractor.Key.SHIFT, protractor.Key.TAB).perform();
		// Assert
		expect(takeScreenshot()).toLookAs("calendar_card_shift_tab");
	});

});