/*global describe, it,element,by,takeScreenshot,expect,process,browser,protractor*/

describe("sap.m.SinglePlanningCalendar", function() {
	"use strict";

	var CTRL_KEY = process.platform === 'darwin' ? protractor.Key.META : protractor.Key.CONTROL;

	it('should load test page on day view', function () {
		element(by.id("overrideTime")).click();

		expect(takeScreenshot(element(by.id("SinglePlanningCalendar")))).toLookAs("day_view");
	});

	it("should navigate to work week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__item1-button")).click();
		element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_view");
	});

	it("should navigate to week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__item2-button")).click();
		element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("week_view");
	});

	it("should open calendar picker", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("opened_picker");
	});

	it("should select 2 appointments with Ctrl/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__appointment0-SinglePlanningCalendar-0")).click();
		browser.actions().mouseMove(element(by.id("__appointment0-SinglePlanningCalendar-13"))).sendKeys(CTRL_KEY).click().sendKeys(CTRL_KEY).perform();

		expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_mouse");
	});

	it("should select another appointments with CTRL/Cmd + Click", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__appointment0-SinglePlanningCalendar-38")).click();

		expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_mouse");
	});

	it("should select 2 appointments with Ctrl/Cmd + Space", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__appointment0-SinglePlanningCalendar-0")).sendKeys(protractor.Key.SPACE);
		element(by.id("__appointment0-SinglePlanningCalendar-13")).sendKeys(CTRL_KEY, protractor.Key.SPACE, CTRL_KEY);

		expect(takeScreenshot(oSPC)).toLookAs("2_selected_appointments_with_kb");
	});

	it("should select another appointments with Ctrl/Cmd + Enter", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__appointment0-SinglePlanningCalendar-38")).sendKeys(protractor.Key.ENTER);

		expect(takeScreenshot(oSPC)).toLookAs("1_selected_appointment_with_kb");
	});

});
