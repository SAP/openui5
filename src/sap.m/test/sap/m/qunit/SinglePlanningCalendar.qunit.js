/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarDayView",
	"sap/m/SinglePlanningCalendarWeekView",
	"sap/m/CalendarAppointment",
	"sap/base/Log",
	"sap/ui/core/library"
], function(
	qutils,
	jQuery,
	mobileLibrary,
	SinglePlanningCalendar,
	SinglePlanningCalendarDayView,
	SinglePlanningCalendarWeekView,
	CalendarAppointment,
	Log,
	coreLibrary
) {
	"use strict";

	QUnit.module("API");

	QUnit.test("setTitle", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			sTitle = "Single Planning Calendar";

		oSPC.setTitle(sTitle);

		//assert
		assert.equal(oSPC._getHeader().getTitle(), sTitle, "The title is set correctly");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("default SatartDate", function (assert) {
		var oSPC = new SinglePlanningCalendar();

		//assert
		assert.ok(oSPC.getStartDate(), "if no date is given, the current date is set as StartDate");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("setSatartDate", function (assert) {
		var oDate = new Date(2018, 10, 23),
			oSPC = new SinglePlanningCalendar({
				startDate: oDate,
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					})
				]
			});

		//assert
		assert.strictEqual(oSPC.getStartDate(), oDate, "StartDate is set correctly");
		assert.equal(oSPC._getHeader().getStartDate().toString(), oDate.toString(), "StartDate is set correctly");
		assert.equal(oSPC._getGrid().getStartDate().toString(), oDate.toString(), "StartDate is set correctly");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointments aggregation", function (assert) {
		var oDate = new Date(2018, 11, 24),
			oAppointment = new CalendarAppointment({
				title: "Appointment",
				text: "new appointment",
				type: "Type01",
				icon: "../ui/unified/images/m_01.png",
				color: "#FF0000",
				fullDay: false,
				startDate: new Date(2018, 11, 24, 15, 30, 0),
				endDate: new Date(2018, 11, 24, 16, 30, 0)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oDate,
				appointments : [
					oAppointment
				]
			});

		//assert
		assert.strictEqual(oSPC.getAppointments().length, 1, "One appointment is set");
		assert.strictEqual(oSPC._getGrid().getAppointments().length, 1, "One appointment is set to the grid");
		assert.strictEqual(oSPC._getGrid().getAppointments()[0], oAppointment, "Appointment set to the calendar is the same that is set to the grid");

		//clean up
		oSPC.destroy();
	});


	QUnit.test("selectedView", function (assert) {
		var oSPC = new SinglePlanningCalendar();

		//assert
		assert.ok(oSPC.getAssociation("selectedView"), "selectedView is set correctly");
		assert.strictEqual(oSPC.getAssociation("selectedView"), oSPC._oDefaultView.getId(), "selectedView is the default view");

		//clean up
		oSPC.destroy();
	});


	QUnit.module("Views");

	QUnit.test("addView", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oViewsButton;

		//assert
		assert.strictEqual(oSPC.getAggregation("views").length, 0, "No view is set");

		//act
		oSPC.addView(oDayView);
		oViewsButton = oSPC._getHeader()._getOrCreateViewSwitch();

		//assert
		assert.strictEqual(oSPC.getAggregation("views").length, 1, "One view is set");
		assert.strictEqual(oSPC.getAggregation("views")[0].getKey(), "DayView", "View with key 'DayView' is set");
		assert.strictEqual(oViewsButton.getItems().length, 1, "One button is set in the 'view switch'");
		assert.strictEqual(oViewsButton.getItems()[0].getKey(), "DayView", "DayView button is set in the 'view switch'");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("addView with duplicate key", function (assert) {
		var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oDayViewDuplicate = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Second Day View"
			}),
			oSPC = new SinglePlanningCalendar({
				views: [oDayView]
			}),
			oErrorLogSpy = sinon.spy(Log, "error");

		//assert
		assert.ok(!oSPC.addView(oDayViewDuplicate), "the view with same key was not added");
		assert.strictEqual(oErrorLogSpy.callCount, 1, "Error: 'There is an existing view with the same key.' was logged");

		//clean up
		oSPC.destroy();
		Log.error.restore();
	});

	QUnit.test("insertView", function (assert) {
		var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oWeekView = new SinglePlanningCalendarWeekView({
				key: "WeekView",
				title: "Week View"
			}),
			oSPC = new SinglePlanningCalendar({
				views: [oDayView]
			}),
			oViewsButton = oSPC._getHeader()._getOrCreateViewSwitch();

		//assert
		assert.strictEqual(oSPC.getAggregation("views")[0].getKey(), "DayView", "'DayView' is on first position");
		assert.strictEqual(oViewsButton.getItems()[0].getKey(), "DayView", "DayView button is set in the 'view switch' on first position");

		//act
		oSPC.insertView(oWeekView, 0);

		//assert
		assert.strictEqual(oSPC.getAggregation("views")[0].getKey(), "WeekView", "'WeekView' is inserted on first position");
		assert.strictEqual(oSPC.getAggregation("views")[1].getKey(), "DayView", "'DayView' is now on second position");
		assert.strictEqual(oViewsButton.getItems()[0].getKey(), "WeekView", "WeekView button is set in the 'view switch' on first position");
		assert.strictEqual(oViewsButton.getItems()[1].getKey(), "DayView", "DayView button is set in the 'view switch' is now on second position");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("removeView", function (assert) {
		var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oSPC = new SinglePlanningCalendar({
				views: [oDayView]
			});

		//act
		oSPC.removeView(oDayView);

		//assert
		assert.strictEqual(oSPC.getAggregation("views").length, 0, "Day view is removed");
		assert.strictEqual(oSPC._oDefaultView.getId(), oSPC.getAssociation("selectedView"), "selectedView is the default view");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("removeAllViews", function (assert) {
		var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oSPC = new SinglePlanningCalendar({
				views: [oDayView]
			}),
			oViewsButton = oSPC._getHeader()._getOrCreateViewSwitch();

		//act
		oSPC.removeAllViews();

		//assert
		assert.strictEqual(oSPC.getAggregation("views"), null, "All views are removed");
		assert.strictEqual(oViewsButton.getItems().length, 0, "Button in the 'view switch' was removed");
		assert.strictEqual(oSPC._oDefaultView.getId(), oSPC.getAssociation("selectedView"), "selectedView is the default view");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("destroyViews", function (assert) {
		var oDayView = new SinglePlanningCalendarDayView({
				key: "DayView",
				title: "Day View"
			}),
			oSPC = new SinglePlanningCalendar({
				views: [oDayView]
			});

		//act
		oSPC.destroyViews();

		//assert
		assert.strictEqual(oSPC.getAggregation("views"), null, "All views are destroyed");
		assert.strictEqual(oSPC._oDefaultView.getId(), oSPC.getAssociation("selectedView"), "selectedView is the default view");

		//clean up
		oSPC.destroy();
	});

});