/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateRangeSelection", function() {
	"use strict";

	it("should highlight the hovered month", function() {
		var oCalendar;
		element(by.id("DRS9-icon")).click();
		element(by.id("DRS9-cal--MP-m5")).click();
		browser.actions().mouseMove(element(by.id("DRS9-cal--MP-m10"))).perform();
		oCalendar = element(by.css("#DRS9-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("month_hovered");
		element(by.id("DRS9-cal--MP-m10")).click();
	});

	it("should select a range of months", function() {
		var oCalendar;
		element(by.id("DRS9-icon")).click();
		oCalendar = element(by.css("#DRS9-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("month_range_selected");
	});

	it("should move mouse over a year", function() {
		var oCalendar;
		element(by.id("DRS11-icon")).click();
		element(by.id("DRS11-cal--YP-y20140101")).click();
		browser.actions().mouseMove(element(by.id("DRS11-cal--YP-y20230101"))).perform();
		oCalendar = element(by.css("#DRS11-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("hovered");
		element(by.id("DRS11-cal--YP-y20230101")).click();
	});

	it("should select a range of months", function() {
		var oCalendar;
		element(by.id("DRS11-icon")).click();
		oCalendar = element(by.css("#DRS11-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("year_range_selected");
	});

	it("calendar selection in GMT+12 timezone", testDRS12WithTimezoneBtn.bind(null, "btnEtcGMT12", "GMT12"));
	it("calendar selection in GMT-12 timezone", testDRS12WithTimezoneBtn.bind(null, "btnEtcGMT-12", "GMT-12"));
	it("calendar selection in UTC timezone", testDRS12WithTimezoneBtn.bind(null, "btnUTC", "UTC"));

	function testDRS12WithTimezoneBtn(sBtnId, sTimezone) {
		var oInput = element(by.css("#DRS12")),
			oValueHelpIcon = element(by.id("DRS12-icon")),
			oCalendar;

		element(by.id(sBtnId)).click(); //change the timezone

		oInput.click();
		browser.actions().sendKeys("Mar 2, 2022 - Mar 4, 2022").perform(); //type

		oValueHelpIcon.click(); //open the picker

		oCalendar = element(by.css("#DRS12-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("calendar_Mar_2_4_2022_" + sTimezone);

		element(by.id("DRS12-cal--Month0-20220309")).click(); //select Mar 9, 2022
		element(by.id("DRS12-cal--Month0-20220318")).click(); //select Mar 18, 2022
		expect(takeScreenshot(oInput)).toLookAs("input_Mar_9_18_2022_" + sTimezone);

		oValueHelpIcon.click(); //open the picker
		expect(takeScreenshot(oCalendar)).toLookAs("select_Mar_9_18_2022_" + sTimezone);
	}

});
