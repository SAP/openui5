/*global describe, it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.SinglePlanningCalendarStickyHeader", function () {
	"use strict";

	var sCompactIdentifier = "_compact";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.SinglePlanningCalendar";

	// Tests on Cozy mode
	performTests("");

	it("Switching on Compact mode", function () {
		_scrollToTop();
		_checkForOverflowButton();
		_selectDayView();
		_checkForOverflowButton();
		element(by.id("size-mode-select")).click();
		element(by.id("__item4")).click();
	});

	// Tests on Compact mode
	performTests(sCompactIdentifier);




	function performTests(sEndIdentifier) {
		// ************************************
		// Day view
		// ************************************

		it("[Day view] Header should not stick for stickyMode: None", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("day_none" + sEndIdentifier);
		});

		it("[Day view] Whole header should stick stick for stickyMode: All", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectAllStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("day_all" + sEndIdentifier);
		});

		it("[Day view] Only navigation toolbar should stick for stickyMode: NavigationAndColHeaders", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectNavBarAndColHeadersStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("day_navandcol" + sEndIdentifier);
		});


		// ************************************
		// Work week view
		// ************************************

		it("[Work week view] Header should not stick for stickyMode: None", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectWorkWeekView();
			_selectNoneStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("work_week_none" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Work week view] Column headers should not stick for stickyMode: None after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("work_week_none_date_changed" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}

		it("[Work week view] Whole header should stick for stickyMode: All", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectAllStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("work_week_all" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Work week view] Column headers should stick for stickyMode: All after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("work_week_all_date_change" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}

		it("[Work week view] Only navigation toolbar & column headers should stick for stickyMode: NavigationAndColHeaders", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectNavBarAndColHeadersStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("work_week_navandcol" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Work week view] Column headers should stick for stickyMode: NavigationAndColHeaders after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("work_week_cols_date_change" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}


		// ************************************
		// Week view
		// ************************************

		it("[Week view] Header should not stick for stickyMode: None", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectWeekView();
			_selectNoneStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("week_none" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Week view] Column headers should not stick for stickyMode: None after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("week_none_date_change" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}

		it("[Week view] Whole header should stick stick for stickyMode: All", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectAllStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("week_all" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Week view] Column headers should stick for stickyMode: All after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("week_all_date_change" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}

		it("[Week view] Only navigation toolbar & column headers should stick for stickyMode: NavigationAndColHeaders", function () {
			var oSPC = element(by.id("SinglePlanningCalendar"));

			_scrollToTop();
			_selectNavBarAndColHeadersStickyMode();
			_scrollToBottom();

			expect(takeScreenshot(oSPC)).toLookAs("week_navandcol" + sEndIdentifier);
		});

		if (!sEndIdentifier) {
			it("[Week view] Column headers should stick for stickyMode: NavigationAndColHeaders after changing the start date", function () {
				var oSPC = element(by.id("SinglePlanningCalendar"));

				_scrollToTop();
				element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();
				_scrollToBottom();

				expect(takeScreenshot(oSPC)).toLookAs("week_cols_date_change" + sEndIdentifier);

				element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();
			});
		}

	}

	function _scrollToTop() {
		element(by.id("__appointment0-SinglePlanningCalendar-24")).click();
	}

	function _scrollToBottom() {
		element(by.id("__appointment0-SinglePlanningCalendar-38")).click();
	}

	function _selectNoneStickyMode() {
		_checkForOverflowButton();
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item0")).click();
	}

	function _selectAllStickyMode() {
		_checkForOverflowButton();
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item1")).click();
	}

	function _selectNavBarAndColHeadersStickyMode() {
		_checkForOverflowButton();
		element(by.id("sticky-mode-select")).click();
		element(by.id("__item2")).click();
	}

	function _selectDayView() {
		_checkForOverflowButton();
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			element(by.id("__view0--item-button")).click();
		} else {
			element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
			element(by.id("__item6")).click();
		}
	}

	function _selectWorkWeekView() {
		_checkForOverflowButton();
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			element(by.id("__view1--item-button")).click();
		} else {
			element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
			element(by.id("__item7")).click();
		}
	}

	function _selectWeekView() {
		_checkForOverflowButton();
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			element(by.id("__view2--item-button")).click();
		} else {
			element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
			element(by.id("__item8")).click();
		}
	}

	function _checkForOverflowButton() {
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented){
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			}
		});
	}
});