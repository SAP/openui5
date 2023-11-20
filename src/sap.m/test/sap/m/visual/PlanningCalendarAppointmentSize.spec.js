/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.PlanningCalendarAppointmentSize", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

	it("should render the whole page", function() {
		expect(takeScreenshot()).toLookAs("calendar_appointment_size_regular_size");
	});

	it("should render the appointment with Half-Size", function() {
		element(by.id("select_height")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Half-Size")).click();

		expect(takeScreenshot()).toLookAs("calendar_appointment_size_halfSize_size");
	});

	it("should render the appointment with Large", function() {
		element(by.id("select_height")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Large")).click();

		expect(takeScreenshot()).toLookAs("calendar_appointment_size_large_size");
	});

	it("should render the appointment with Automatic", function() {
		element(by.id("select_height")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Automatic")).click();

		expect(takeScreenshot()).toLookAs("calendar_appointment_size_automatic_size");
	});

	it("should render the appointment with ReducedHeight", function() {
		element(by.id("select_height")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Regular")).click();
		element(by.id("reduced_height")).click();

		expect(takeScreenshot()).toLookAs("calendar_appointment_reduced_height");
	});

	it("should render the whole days page", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("days_page");
	});

	it("should render the whole months page", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page");
	});

	it("should change the month page", function() {
		element(by.id("PC1-Header-NavToolbar-NextBtn")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page_nex_page");
	});

	it("should render the appointment with Half Size width", function() {
		element(by.id("select_rounding")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Half Column")).click();
		expect(takeScreenshot()).toLookAs("calendar_appointment_half_size_width");
	});

	it("should render the appointment with Half Size width 1024px", function() {
		element(by.id("select_width")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1024px < x")).click();
		expect(takeScreenshot()).toLookAs("cal_app_half_size_width_1024px");
	});

});
