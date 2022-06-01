/*global describe,it,takeScreenshot,browser,expect,element,by*/

describe("sap.m.PlanningCalendarPicker", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

	/*
	 26. Popups on hours,days,months,1week,1month on 100% screensize
	 */
	it("should check that date, month and year picker work properly in hours view", function() {
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_hours_view");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_hours_view");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_hours_view");
		element(by.id("inputFocusHelper")).click(); //close the popup in order to open it again afterwards
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_hours_view_opened_again");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that date, month and year picker work properly in days view", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn-inner")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_days_view");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_days_view");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_days_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that year picker works properly in months view", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-YearCal")))).toLookAs("yearpicker_months_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that date, month and year picker work properly on 1 week view", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_1week_view");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_1week_view");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_1week_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that month and year picker work properly in 1 month view", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("monthpicker_1month_view");
		element(by.id("PC1-Header-MonthCal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("yearpicker_1month_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	/*
	 27. Popups on hours,days,months,1week,1month on < 600px screensize
	 */
	it("should check that date, month, year picker work properly in hours view under 600px", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Hours")).click();
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_1")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_hours_view_600px");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_hours_view_600px");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_hours_view_600px");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that date, month, year picker work properly in days view under 600px", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_days_view_600px");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_days_view_600px");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_days_view_600px");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that year picker works properly in months view under 600px", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-YearCal")))).toLookAs("yearpicker_months_view_600px");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that date, month and year picker work properly in 1 week view under 600px", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_1week_view_600px");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_1week_view_600px");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_1week_view_600px");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check that month and year picker work properly in 1 month view under 600px", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("monthpicker_1month_view_600px");
		element(by.id("PC1-Header-MonthCal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("yearpicker_1month_view_600px");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});

});
