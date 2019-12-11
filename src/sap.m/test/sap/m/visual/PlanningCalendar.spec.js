/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.PlanningCalendar", function() {
	"use strict";

	/*
	 1. 2683
	 */
	it("should render the whole page", function() {
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("hours_page");
	});
	/*
	 2. 2683
	 */
	it("should render page under 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_3")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("hours_page_under_1024px_width");
	});
	/*
	 3. 2675
	 */
	it("should render page between 600 px and 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_2")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("hours_page_between_6001024px_width");
	});
	/*
	 4. 2675
	 */
	it("should render page under 600px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_1")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("hours_page_under_600px_width");
	});
	/*
	 5. 2677
	*/
	it("should render the whole days page", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Days")).click();
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_0")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("days_page");
	});
	/*
	 6. 2677
	 */
	it("should render days page under 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_3")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("days_page_under_1024px_width");
	});
	/*
	 7. 2678
	 */
	it("should render  days page between 600 px and 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_2")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("days_page_between_6001024px_width");
	});
	/*
	 8. 2678
	 */
	it("should render days page under 600px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_1")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("days_page_under_600px_width");
	});
	/*
	 9. 2686
	 */
	it("should render the whole months page", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_0")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page");
	});
	/*
	 10. 2686
	 */
	it("should render months page under 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_3")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page_under_1024px_width");
	});
	/*
	 11. 2687
	 */
	it("should render months page between 600 px and 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_2")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page_between_6001024px_width");
	});
	/*
	 12. 2688
	 */
	it("should render months page under 600px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_1")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("months_page_under_600px_width");
	});
	/*
	 13. 2695
	 */
	it("should render the whole 1week page", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_0")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1week_page");
	});
	/*
	 14. 2695
	 */
	it("should render 1week page under 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_3")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1week_page_under_1024px_width");
	});
	/*
	 15. 2696
	 */
	it("should render 1week page between 600 px and 1024px width", function() {
		element(by.id("select_width-label")).click();
		element(by.id("select_width_item_2")).click();
		expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1week_page_between_6001024px_width");
	});
	/*
	 16. 2696
	 */
	 it("should render 1week page under 600px width", function() {
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_1")).click();
		 expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1week_page_under_600px_width");
	 });
	/*
	 17. 2702
	 */
	 it("should render the whole 1month page", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_0")).click();
		 expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1month_page");
	 });
	/*
	 18. 2702
	 */
	 it("should render 1month page under 1024px width", function() {
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_3")).click();
		 expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1month_page_under_1024px_width");
	 });
	/*
	 19. 2703
	 */
	 it("should render 1month page between 600 px and 1024px width", function() {
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_2")).click();
		 expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1month_page_between_6001024px_width");
	 });
	/*
	 20. 2703
	 */
	 it("should render 1month page under 600px width", function() {
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_1")).click();
		 expect(takeScreenshot(element(by.id("page1-cont")))).toLookAs("1month_page_under_600px_width");
	 });

	 /*
		 Back and next button functionality
	  */

	/*
	 21. 2670
	 */
	 it("should check that back/next button is working properly on hours view", function() {
		 element(by.id("select_width-label")).click();
		 element(by.id("select_width_item_0")).click();
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "Hours")).click();
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
		 expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("datepicker_hours_view");
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
		 expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_months_view");
		 element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	 });
	 it("should check infotoolbar for 1week view that is rendering properly", function() {
		 element(by.id("PC1-Header-ViewSwitch")).click();
		 element(by.cssContainingText(".sapMSelectListItem", "1 Week")).click();
		 element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		 expect(takeScreenshot(element(by.id("PPC1-Header-Cal")))).toLookAs("datepicker_1week_view");
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
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthpicker_1month_view");
		element(by.id("PC1-Header-MonthCal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearpicker_1month_view");
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
		expect(takeScreenshot(element(by.id("PC1-DateInt--Cal")))).toLookAs("yearview_on_days_view");
		element(by.id("inputFocusHelper")).click(); //clean up - make sure no popups are opened
	});
	it("should check year view on months view that is rendering properly", function () {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "Months")).click();
		element(by.id("PC1-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearView_on_monthview");
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
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("monthview_on_1month_view");
		element(by.id("PC1-Header-MonthCal--Head-B2")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-Cal")))).toLookAs("yearview_on_1month_view");
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
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("1week_today_button");
	});
	/*
	 32. 2708
	 */
	it("should render 1month today button under 600px width", function() {
		element(by.id("PC1-Header-ViewSwitch")).click();
		element(by.cssContainingText(".sapMSelectListItem", "1 Month")).click();
		element(by.id("page1-cont")).click();
		element(by.id("PC1-Header-NavToolbar-TodayBtn")).click();
		expect(takeScreenshot(element(by.id("PC1-Header-NavToolbar-TodayBtn")))).toLookAs("1month_today_button");
	});
});
