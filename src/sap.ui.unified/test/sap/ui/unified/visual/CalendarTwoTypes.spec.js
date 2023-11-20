/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.ui.unified.CalendarTwoTypes", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var oCalGregIslam = element(by.id("Cal-Gregorian-Islamic")),
		oCalPerJap = element(by.id("Cal-Persian-Japanese")),
		oCalGregBud = element(by.id("Cal-Gregorian-Buddhist"));

	it("should show calendar with two types - Gregorian and Islamic", function () {
		expect(takeScreenshot(oCalGregIslam)).toLookAs("day_picker_greg_islam");
		element(by.id("Cal-Gregorian-Islamic--Head-B1")).click();
		expect(takeScreenshot(oCalGregIslam)).toLookAs("month_picker_greg_islam");
		element(by.id("Cal-Gregorian-Islamic--Head-B2")).click();
		expect(takeScreenshot(oCalGregIslam)).toLookAs("year_picker_greg_islam");
		element(by.id("Cal-Gregorian-Islamic--Head-B2")).click();
		expect(takeScreenshot(oCalGregIslam)).toLookAs("year_range_picker_greg_islam");
	});

	it("should show calendar with two types - Persian and Japanese", function () {
		expect(takeScreenshot(oCalPerJap)).toLookAs("day_picker_per_jap");
		element(by.id("Cal-Persian-Japanese--Head-B1")).click();
		expect(takeScreenshot(oCalPerJap)).toLookAs("month_picker_per_jap");
		element(by.id("Cal-Persian-Japanese--Head-B2")).click();
		expect(takeScreenshot(oCalPerJap)).toLookAs("year_picker_per_jap");
		element(by.id("Cal-Persian-Japanese--Head-B2")).click();
		expect(takeScreenshot(oCalPerJap)).toLookAs("year_range_picker_per_jap");
	});

	it("should show calendar with two months and with two types - Gregorian and Buddhist", function () {
		expect(takeScreenshot(oCalGregBud)).toLookAs("day_picker_greg_bud_two_months");
		element(by.id("Cal-Gregorian-Buddhist--Head-B1")).click();
		expect(takeScreenshot(oCalGregBud)).toLookAs("month_picker_greg_bud_two_months");
		element(by.id("Cal-Gregorian-Buddhist--Head-B2")).click();
		expect(takeScreenshot(oCalGregBud)).toLookAs("year_picker_greg_bud_two_months");
		element(by.id("Cal-Gregorian-Buddhist--Head-B2")).click();
		expect(takeScreenshot(oCalGregBud)).toLookAs("year_range_picker_greg_bud_two_months");
	});

});