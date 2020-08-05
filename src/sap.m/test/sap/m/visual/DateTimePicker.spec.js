/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateTimePicker", function() {
	"use strict";

	// verify DateTimePicker is opened and the right date is initially focused
	it("should open second DateTimePicker and 13th of June 2017 should be focused", function() {
		element(by.id("DTP1_v0-icon")).click();
		_takeScreenshot("initial_focused_and_selected");
	});

	// verify action change month selects the current day in the different month
	it("should select the same day and year if the month is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B1")).click();
		element(by.id("DTP1_v0-cal--MP-m7")).click();
		_takeScreenshot("month_changed");
	});

	// verify action change year selects the current day in the different year
	it("should select the same day and month if the year is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B2")).click();
		element(by.id("DTP1_v0-cal--YP-y20130101")).click();
		_takeScreenshot("year_changed");
	});

	it("focus cells", function () {
		if (browser.testrunner.runtime.platformName === "android" && browser.testrunner.runtime.platformName === "ios") {
			// Navigate to pickers part
			element(by.id("DTP1_v0-PC-Switch-Sli-button")).click();
			// Focus cell
			element(by.css("[class='sapMTimePickerItem sapMTimePickerItemSelected']")).click();
		} else {
			// Focus cell
			element(by.css("[class='sapMTimePickerItem']")).click();
		}

		//Assert
		_takeScreenshot("cell_focused");
	});

	function _takeScreenshot(img) {
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			var oCalendar = element(by.css("#DTP1_v0-RP-popover"));
			expect(takeScreenshot(oCalendar)).toLookAs(img);
		} else {
			expect(takeScreenshot()).toLookAs(img);
		}
	}
});
