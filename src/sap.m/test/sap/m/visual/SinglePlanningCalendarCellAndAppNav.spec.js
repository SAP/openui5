/*global describe, it,element,by,takeScreenshot,expect,process,browser,protractor*/

describe("sap.m.SinglePlanningCalendarCellAndAppNav", function() {
	"use strict";

	var CTRL_KEY = process.platform === 'darwin' ? protractor.Key.META : protractor.Key.CONTROL;

	browser.testrunner.currentSuite.meta.controlName = "sap.m.SinglePlanningCalendar";

	it("should select 2 appointments with Ctrl/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("overrideTime")).click();
			element(by.id("__appointment0-SinglePlanningCalendar-0-0_0")).click();
			browser.actions().mouseMove(element(by.id("__appointment0-SinglePlanningCalendar-13-0_10"))).sendKeys(CTRL_KEY).click().sendKeys(CTRL_KEY).perform();

			expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_mouse");
		}
	});

	it("should select another appointment with CTRL/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("overrideTime")).click();
			element(by.id("__appointment0-SinglePlanningCalendar-38-4_2")).click();

			expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_mouse");
		}
	});

	it("should select 2 appointments with Ctrl/Cmd + Space", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("overrideTime")).click();
			element(by.id("__appointment0-SinglePlanningCalendar-0-0_0")).sendKeys(protractor.Key.SPACE);
			element(by.id("__appointment0-SinglePlanningCalendar-13-0_10")).sendKeys(CTRL_KEY, protractor.Key.SPACE, CTRL_KEY);

			expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_kb");
		}
	});

	it("should select another appointment with Ctrl/Cmd + Enter", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("overrideTime")).click();
			element(by.id("__appointment0-SinglePlanningCalendar-38-4_2")).sendKeys(protractor.Key.ENTER);

			expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_kb");
		}
	});

	it("should focus a grid cell via mouse click", function() {
		var oSPC = element(by.id("SinglePlanningCalendar"));
		//there is no focus on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("overrideTime")).click();
			element(by.css("[data-sap-start-date='20180711-0900']")).click();
			expect(takeScreenshot(oSPC)).toLookAs("focused_cell_with_mouse");
		}
	});

	it("should focus another cell in the right with ARROW RIGHT keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0900']", "focused_cell_with_arrow_right_kb", protractor.Key.ARROW_RIGHT);
	});

	it("should focus another cell in the left with ARROW LEFT keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0900']", "focused_cell_with_arrow_left_kb", protractor.Key.ARROW_LEFT);
	});

	it("should focus another cell up with ARROW UP keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0900']", "focused_cell_with_arrow_up_kb", protractor.Key.ARROW_UP);
	});

	it("should focus another cell down with ARROW DOWN keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0900']", "focused_cell_with_arrow_down_kb", protractor.Key.ARROW_DOWN);
	});

	it("should focus a cell in the right with ARROW RIGHT keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25-1_8", "focused_cell_with_arrow_right_kb_app", protractor.Key.ARROW_RIGHT);
	});

	it("should focus a cell in the left with ARROW LEFT keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25-1_8", "focused_cell_with_arrow_left_kb_app", protractor.Key.ARROW_LEFT);
	});

	it("should focus a cell up with ARROW UP keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25-1_8", "focused_cell_with_arrow_up_kb_app", protractor.Key.ARROW_UP);
	});

	it("should focus a cell down with ARROW DOWN keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25-1_8", "focused_cell_with_arrow_down_kb_app", protractor.Key.ARROW_DOWN);
	});

	function _focusFromCellToCell(sSelector, sRefImage, iControl) {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			element(by.id("overrideTime")).click();
			element(by.css(sSelector)).sendKeys(iControl);
			expect(takeScreenshot(oSPC)).toLookAs(sRefImage);
		}
	}

	function _focusFromAppToCell(sSelector, sRefImage, iControl) {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			element(by.id("overrideTime")).click();
			element(by.id(sSelector)).sendKeys(iControl);
			expect(takeScreenshot(oSPC)).toLookAs(sRefImage);
		}
	}

});