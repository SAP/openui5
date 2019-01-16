/*global describe, it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.SinglePlanningCalendarStickyHeader", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.SinglePlanningCalendar";

	// ************************************
	// Day view
	// ************************************

	it("[Day view] Header should not stick for stickyMode: None", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("day_sticky_none_scrolled");
	});

	it("[Day view] Whole header should stick stick for stickyMode: All", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectAllStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("day_sticky_all_scrolled");
	});

	it("[Day view] Only navigation toolbar should stick for stickyMode: NavigationAndColHeaders", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectNavBarAndColHeadersStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("day_sticky_navandcol_scrolled");
	});



	// ************************************
	// Work week view
	// ************************************

	it("[Work week view] Header should not stick for stickyMode: None", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectWorkWeekView();
		_selectNoneStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_sticky_none_scrolled");
	});

	it("[Work week view] Whole header should stick stick for stickyMode: All", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectAllStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_sticky_all_scrolled");
	});

	it("[Work week view] Only navigation toolbar & column headers should stick for stickyMode: NavigationAndColHeaders", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectNavBarAndColHeadersStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_sticky_navandcols_scrolled");
	});



	// ************************************
	// Week view
	// ************************************

	it("[Week view] Header should not stick for stickyMode: None", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectWeekView();
		_selectNoneStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("week_sticky_none_scrolled");
	});

	it("[Week view] Whole header should stick stick for stickyMode: All", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectAllStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("week_sticky_all_scrolled");
	});

	it("[Week view] Only navigation toolbar & column headers should stick for stickyMode: NavigationAndColHeaders", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_scrollToTop();
		_selectNavBarAndColHeadersStickyMode();
		_overrideTime();
		_scrollToBottom();

		expect(takeScreenshot(oSPC)).toLookAs("week_sticky_navandcols_scrolled");
	});



	function _overrideTime() {
		element(by.id("overrideTime")).click();
	}

	function _scrollToTop() {
		element(by.id("__appointment0-SinglePlanningCalendar-24")).click();
	}

	function _scrollToBottom() {
		element(by.id("__appointment0-SinglePlanningCalendar-38")).click();
	}

	function _selectNoneStickyMode() {
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item0")).click();
	}

	function _selectAllStickyMode() {
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item1")).click();
	}

	function _selectNavBarAndColHeadersStickyMode() {
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item2")).click();
	}

	function _selectWorkWeekView() {
		element(by.id("__item4-button")).click();
	}

	function _selectWeekView() {
		element(by.id("__item5-button")).click();
	}
});