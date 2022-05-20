/*global describe,it,takeScreenshot,browser,expect,element,by*/

describe("sap.m.PlanningCalendarWidth", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

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

});
