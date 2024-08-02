/*global describe, it,element,by,takeScreenshot,expect*/

describe("sap.m.SinglePlanningCalendar", function() {
	"use strict";

	it('should load test page on day view', function () {
		_checkForOverflowButton();
		element(by.id("overrideTime")).click();

		expect(takeScreenshot(element(by.id("SinglePlanningCalendar")))).toLookAs("day_view");
	});

	it("should navigate to work week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//click on overflow button if available
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item25")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item10")).click();
			}
		});

		element(by.id("overrideTime")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view");
	});

	it('Should check that non-work periods are displayed correctly in work week view', function () {
		expect(takeScreenshot(element(by.id("SinglePlanningCalendar")))).toLookAs("non_working_work_week_view");
	});

	it("should navigate to month view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		//click on overflow button if available
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item43")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item23")).click();
			}
		});

		element(by.id("overrideTime")).click();
		expect(takeScreenshot(oSPC)).toLookAs("month_view");
	});

	it("should be possible to select an appointment", function (){
		var oSPC = element(by.id("SinglePlanningCalendar"));
		element(by.id("__appointment0-SinglePlanningCalendar-62-5_0")).click();
		expect(takeScreenshot(oSPC)).toLookAs("appointment_select");
		element(by.id("__appointment0-SinglePlanningCalendar-62-5_0")).click();
		expect(takeScreenshot(oSPC)).toLookAs("deselect_appointment");
	});

	it("should navigate to week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item56")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item31")).click();
			}
		});

		element(by.id("overrideTime")).click();
		expect(takeScreenshot(oSPC)).toLookAs("week_view");
	});

	it("should open calendar picker", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("opened_picker");
	});

	it("should close calendar picker on focusout", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PrevBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("closed_picker");
	});

	it("should focus the selected date after choosing it from calendar picker", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		_checkForOverflowButton();

		element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();
		element(by.id("SinglePlanningCalendar-Header-Cal--Month0-20180711")).click();

		expect(takeScreenshot(oSPC)).toLookAs("focused_date");
	});


	it("should see appointments in August", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		// open menu
		element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();

		// select month view
		element(by.css(".sapUiSimpleFixFlexFlexContent ul.sapMSelectList .sapMSelectListItem:last-child")).click();

		// click on next month button.
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn-inner")).click();

		expect(takeScreenshot(oSPC)).toLookAs("1_month_view_overflowing_appointments");
	});

	it("should scale factor in day view", function() {
		var oSPC = element(by.id("SinglePlanningCalendar"));
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();
		element(by.id("SinglePlanningCalendar-Header-Cal--Month0-20180723")).click();

		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item79")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item59")).click();
			}
		});

		element(by.id("overrideTime")).click();

		element(by.id("SinglePlanningCalendar-Header-NavToolbar-NextBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_one");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_two");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_three");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_four");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_five");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("day_view_scale_factor_six");

		_checkForOverflowButton();
		element(by.id("resetScaleFactor")).click();
	});

	it("should scale factor in work week view", function() {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item125")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item105")).click();
			}
		});

		element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_one");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_two");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_three");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_four");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_five");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("work_week_view_scale_factor_six");

		_checkForOverflowButton();
		element(by.id("resetScaleFactor")).click();
	});

	it("should scale factor in Month view", function() {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented) {
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();
				element(by.id("__item173")).click();
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			} else {
				element(by.id("SinglePlanningCalendar-Header-ViewSwitch")).click();

				element(by.id("__item148")).click();
			}
		});

		element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("month_view_scale_factor_one");
		_checkForOverflowButton();
		element(by.id("zoomIn")).click();
		expect(takeScreenshot(oSPC)).toLookAs("month_week_view_scale_factor_two");

		_checkForOverflowButton();
		element(by.id("resetScaleFactor")).click();
	});

	// click on overflow button if available
	function _checkForOverflowButton() {
		element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).isPresent().then(function(presented){
			if (presented){
				element(by.id("SinglePlanningCalendar-Header-ActionsToolbar-overflowButton")).click();
			}
		});
	}
});
