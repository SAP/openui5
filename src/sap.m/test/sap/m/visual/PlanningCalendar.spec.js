/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.PlanningCalendar", function() {
	"use strict";

	 /*
		 Back and next button functionality
	  */

	/*
	 21. 2670
	 */
	 it("should check that back/next button is working properly on hours view", function() {
		 element(by.id("PC1-Header-NavToolbar-PrevBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-TimesRow")))).toLookAs("back_button_hours_view");
		 element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-TimesRow")))).toLookAs("next_button_hours_view");
	 });
	 /*
	  22. 2680
	  */
	 it("should check that back/next button is working properly on days view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		 element(by.id("PC1-Header-NavToolbar-PrevBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-DatesRow")))).toLookAs("back_button_days_view");
		 element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-DatesRow")))).toLookAs("next_button_days_view");
	 });
	 /*
	  23. 2689
	  */
	 it("should check that back/next button is working properly on months view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		 element(by.id("PC1-Header-NavToolbar-PrevBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-MonthsRow")))).toLookAs("back_button_months_view");
		 element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-MonthsRow")))).toLookAs("next_button_months_view");
	 });
	 /*
	 24. 2697
	 */
	 it("should check that back/next button is working properly on 1week view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		 element(by.id("PC1-Header-NavToolbar-PrevBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-WeeksRow")))).toLookAs("back_button_1week_view");
		 element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-WeeksRow")))).toLookAs("next_button_1week_view");
	 });
	 /*
	 25. 2704
	 */
	 it("should check that back/next button is working properly on 1month view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		 element(by.id("PC1-Header-NavToolbar-PrevBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-OneMonthsRow")))).toLookAs("back_button_1month_view");
		 element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		 expect(takeScreenshot(element(by.id("PC1-OneMonthsRow")))).toLookAs("next_button_1month_view");
	 });
	/*
	 Today button's functionality
	*/
	/*
	 28. 2676
	 */
	it("should render hour's today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Hours")).click();
		element(by.id("page1-cont")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("hours_today_button");
		});
	/*
	 29. 2685
	 */
	it("should render days' today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		element(by.id("page1-cont")).click();
		element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("days_today_button");
	});
	/*
	 30. 2693
	 */
	it("should render  months today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("page1-cont")).click();
		element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("months_today_button");
	});
	/*
	 31. 2701
	 */
	it("should render 1week today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		element(by.id("page1-cont")).click();
		element(by.id("PC1-Header-NavToolbar-NextBtn-inner")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("1week_today_button");
	});
	/*
	 32. 2708
	 */
	it("should render 1month today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("1month_today_button");
	});

	it("should display an Illustrated Message when noData is set and rows are removed", function() {
		var oPage = element(by.id("PC1"));

		element(by.id("B_SetDay")).click();
		element(by.id("B_DeleteAllRows")).click();
		expect(takeScreenshot(oPage)).toLookAs('PC_with_illustrated_message');
	});
});
