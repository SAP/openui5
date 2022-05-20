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
	  ----------------------------------------------------------------- Calendar control  ---------------------------------------------------------------------------------
																				||
																				\/
	  */

	 /*
	  26. Popups on hours,days,months,1week,1month on 100% screensize
	  */
	 it("should check that date,month,year picker work properly on hours view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Hours")).click();
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
	 it("should check that date,month,year picker work properly on days view", function() {
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
	 it("should check infotoolbar for months view that is rendering properly", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		 element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		 expect(takeScreenshot(element(by.id("PC1-Header-YearCal")))).toLookAs("yearpicker_months_view");
		 element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	 });
	 it("should check infotoolbar for 1week view that is rendering properly", function() {
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
	it("should check infotoolbar for 1month view that is rendering properly", function () {
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
	 it("should check that date,month,year picker work properly on hours view", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Hours")).click();
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_1")).click();
		 element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		 expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("dayview_on_hoursview");
		 element(by.id("PC1-Header-Cal--Head-B1")).click();
		 expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthview_on_hoursview");
		 element(by.id("PC1-Header-Cal--Head-B2")).click();
		 expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearview_on_hoursview");
		 element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	 });
	it("should check that month and year view work properly on days view", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("dayview_on_days_view");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthview_on_days_view");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearview_on_days_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check year view on months view that is rendering properly", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-YearCal")))).toLookAs("yearView_on_monthview");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check infotoolbar for 1week view that is rendering properly", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("dayview_1week_view");
		element(by.id("PC1-Header-Cal--Head-B1")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthview_on_1week_view");
		element(by.id("PC1-Header-Cal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearview_on_1week_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check infotoolbar for 1month view that is rendering properly", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("monthview_on_1month_view");
		element(by.id("PC1-Header-MonthCal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-MonthCal")))).toLookAs("yearview_on_1month_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	/*
																				/\
																				||
	 ----------------------------------------------------------------- Calendar control  ---------------------------------------------------------------------------------
	 */
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
});
