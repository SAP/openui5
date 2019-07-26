/*global describe, it,element,by,takeScreenshot,expect,process,browser,protractor*/

describe("sap.m.SinglePlanningCalendar", function() {
	"use strict";

	var CTRL_KEY = process.platform === 'darwin' ? protractor.Key.META : protractor.Key.CONTROL;

	it('should load test page on day view', function () {
		_checkForOverflowButton();
		element(by.id("overrideTime")).click();

		expect(takeScreenshot(element(by.id("SinglePlanningCalendar")))).toLookAs("day_view");
	});

	it("should navigate to work week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//click on overflow button if available
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element.all(by.cssContainingText(".sapMSelectListItem", "Work Week")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element.all(by.cssContainingText(".sapMSegBBtn .sapMSegBBtnInner", "Work Week")).click();
			}
		});

		element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_view");
	});

	it("should navigate to week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element.all(by.cssContainingText(".sapMSelectListItem", "Full Week")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element.all(by.cssContainingText(".sapMSegBBtn .sapMSegBBtnInner", "Full Week")).click();
			}
		});

		element(by.id("overrideTime")).click();
		expect(takeScreenshot(oSPC)).toLookAs("week_view");
	});

	it("should open calendar picker", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("opened_picker");
	});

	it("should close calendar picker on focusout", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("closed_picker");
	});

	it("should focus the selected date after choosing it from calendar picker", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();
		element(by.id("SinglePlanningCalendar-Header-Cal--Month0-20180711")).click();

		expect(takeScreenshot(oSPC)).toLookAs("focused_date");
	});

	it("should select 2 appointments with Ctrl/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
			element(by.id("__appointment0-SinglePlanningCalendar-0")).click();
			browser.actions().mouseMove(element(by.id("__appointment0-SinglePlanningCalendar-13"))).sendKeys(CTRL_KEY).click().sendKeys(CTRL_KEY).perform();

			expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_mouse");
		}
	});

	it("should select another appointments with CTRL/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("__appointment0-SinglePlanningCalendar-38")).click();

			expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_mouse");
		}
	});

	it("should select 2 appointments with Ctrl/Cmd + Space", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("__appointment0-SinglePlanningCalendar-0")).sendKeys(protractor.Key.SPACE);
			element(by.id("__appointment0-SinglePlanningCalendar-13")).sendKeys(CTRL_KEY, protractor.Key.SPACE, CTRL_KEY);

			expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_kb");
		}
	});

	it("should select another appointments with Ctrl/Cmd + Enter", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("__appointment0-SinglePlanningCalendar-38")).sendKeys(protractor.Key.ENTER);

			expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_kb");
		}
	});

	it("should focus a grid cell with Click", function() {
		var oSPC = element(by.id("SinglePlanningCalendar"));
		//there is no focus on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.css("[data-sap-start-date='20180711-0200']")).click();
			expect(takeScreenshot(oSPC)).toLookAs("focused_cell_with_mouse");
		}
	});

	it("should focus another cell in the right with ARROW RIGHT keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0200']", "focused_cell_with_arrow_right_kb", protractor.Key.ARROW_RIGHT);
	});

	it("should focus another cell in the left with ARROW LEFT keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0200']", "focused_cell_with_arrow_left_kb", protractor.Key.ARROW_LEFT);
	});

	it("should focus another cell up with ARROW UP keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0200']", "focused_cell_with_arrow_up_kb", protractor.Key.ARROW_UP);
	});

	it("should focus another cell down with ARROW DOWN keyboard key", function () {
		_focusFromCellToCell("[data-sap-start-date='20180711-0200']", "focused_cell_with_arrow_down_kb", protractor.Key.ARROW_DOWN);
	});

	it("should focus a cell in the right with ARROW RIGHT keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25", "focused_cell_with_arrow_right_kb_app", protractor.Key.ARROW_RIGHT);
	});

	it("should focus a cell in the left with ARROW LEFT keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25", "focused_cell_with_arrow_left_kb_app", protractor.Key.ARROW_LEFT);
	});

	it("should focus a cell up with ARROW UP keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25", "focused_cell_with_arrow_up_kb_app", protractor.Key.ARROW_UP);
	});

	it("should focus a cell down with ARROW DOWN keyboard key", function () {
		_focusFromAppToCell("__appointment0-SinglePlanningCalendar-25", "focused_cell_with_arrow_down_kb_app", protractor.Key.ARROW_DOWN);
	});

	function _focusFromCellToCell(sSelector, sRefImage, iControl) {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.css(sSelector)).sendKeys(iControl);
			expect(takeScreenshot(oSPC)).toLookAs(sRefImage);
		}
	}

	function _focusFromAppToCell(sSelector, sRefImage, iControl) {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id(sSelector)).sendKeys(iControl);
			expect(takeScreenshot(oSPC)).toLookAs(sRefImage);
		}
	}

	// click on overflow button if available
	function _checkForOverflowButton() {
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented){
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			}
		});
	}
});
