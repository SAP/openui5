/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarGrid",
	"sap/m/SinglePlanningCalendarDayView",
	"sap/m/SinglePlanningCalendarWeekView",
	"sap/m/SinglePlanningCalendarWorkWeekView",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/m/PlanningCalendarLegend",
	"sap/m/Button",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library",
	"sap/ui/core/InvisibleText",
	'sap/ui/events/KeyCodes',
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateRange",
	"sap/ui/core/Icon"
], function(
	Localization,
	Element,
	nextUIUpdate,
	jQuery,
	SinglePlanningCalendar,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarDayView,
	SinglePlanningCalendarWeekView,
	SinglePlanningCalendarWorkWeekView,
	SinglePlanningCalendarMonthView,
	PlanningCalendarLegend,
	Button,
	CalendarAppointment,
	CalendarLegendItem,
	DateTypeRange,
	unifiedLibrary,
	InvisibleText,
	KeyCodes,
	JSONModel,
	Log,
	createAndAppendDiv,
	UI5Date,
	DateRange,
	Icon
) {
	"use strict";
	createAndAppendDiv("bigUiArea").style.width = "1024px";
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

	QUnit.test("setStartDate", function (assert) {
		var oDate = UI5Date.getInstance(2018, 10, 23),
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
		assert.equal(oSPC.getAggregation("_grid").getStartDate().toString(), oDate.toString(), "StartDate is set correctly");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointments aggregation", function (assert) {
		var oDate = UI5Date.getInstance(2018, 11, 24),
			oAppointment = new CalendarAppointment({
				title: "Appointment",
				text: "new appointment",
				type: "Type01",
				icon: "../ui/unified/images/m_01.png",
				color: "#FF0000",
				startDate: UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oDate,
				appointments : [
					oAppointment
				]
			});

		//assert
		assert.strictEqual(oSPC.getAppointments().length, 1, "One appointment is set");
		assert.strictEqual(oSPC.getAggregation("_grid").getAppointments().length, 1, "One appointment is set to the grid");
		assert.strictEqual(oSPC.getAggregation("_grid").getAppointments()[0], oAppointment, "Appointment set to the calendar is the same that is set to the grid");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("special dates aggregation", function (assert) {
		var oDate = UI5Date.getInstance(2018, 11, 24),
			oSpecialDate = new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 8),
				endDate: UI5Date.getInstance(2018, 6, 9),
				type: unifiedLibrary.CalendarDayType.Type02
			}),
			oSpecialDate2 = new DateTypeRange({
				startDate: UI5Date.getInstance(2018, 6, 18),
				type: unifiedLibrary.CalendarDayType.Type03,
				secondaryType: unifiedLibrary.CalendarDayType.NonWorking
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oDate,
				specialDates : [
					oSpecialDate,
					oSpecialDate2
				]
			});

		//assert
		assert.strictEqual(oSPC.getSpecialDates().length, 2, "One special date is set");
		assert.strictEqual(oSPC.getAggregation("_grid").getSpecialDates().length, 2, "One special date is set to the grid");
		assert.strictEqual(oSPC.getAggregation("_grid").getSpecialDates()[0], oSpecialDate, "Special date set to the calendar is the same that is set to the grid");
		assert.strictEqual(oSPC.getAggregation("_grid")._getSpecialDates()[1].getType(), unifiedLibrary.CalendarDayType.Type03, "Special date set to the calendar is the same that is set to the grid");
		assert.strictEqual(oSPC.getAggregation("_grid")._getSpecialDates()[2].getType(), unifiedLibrary.CalendarDayType.NonWorking, "Special date set to the calendar is the same that is set to the grid");

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

	QUnit.test("selectedView: Simulate PRESS on segmented button of a view", async function(assert) {
		var	oSPC = new SinglePlanningCalendar({
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					}),
					new SinglePlanningCalendarDayView({
						key: "MonthView",
						title: "Month View"
					})
				]
			}),
			oMonthViewSegmentedButtonItem = oSPC._getHeader()._getOrCreateViewSwitch().getItems()[1],
			sMonthViewId = oSPC.getViews()[1].getId(),
			oDayViewSegmentedButtonItem = oSPC._getHeader()._getOrCreateViewSwitch().getItems()[0],
			sDayViewId = oSPC.getViews()[0].getId();

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oMonthViewSegmentedButtonItem.oButton.firePress();
		await nextUIUpdate();

		// assert
		assert.equal(oSPC.getSelectedView(), sMonthViewId, "The proper View Id is stored in selectedView association");

		// Act
		oDayViewSegmentedButtonItem.oButton.firePress();
		await nextUIUpdate();

		// assert
		assert.equal(oSPC.getSelectedView(), sDayViewId, "The proper View Id is stored in selectedView association");

		// cleanup
		oSPC.removeAllViews();
		oSPC = null;
	});

	QUnit.test("getSelectedAppointments", function (assert) {
		var oAppointment1 = new CalendarAppointment({
				title: "Appointment1",
				startDate: UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0)
			}),
			oAppointment2 = new CalendarAppointment({
				title: "Appointment1",
				startDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 17, 30, 0),
				selected: true
			}),
			oSPC = new SinglePlanningCalendar({
				appointments: [
					oAppointment1,
					oAppointment2
				]
			});

		//assert
		assert.ok(oSPC.getSelectedAppointments().length, 1, "one appointment selected");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("setLegend", function (assert){
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oLegend = new PlanningCalendarLegend();

		// act
		oSPC.setLegend(oLegend);

		//assert
		assert.equal(oSPC.getAssociation("legend"), oLegend.getId(), "the legend is successfully set");

		//cleanup
		oSPC.destroy();
	});

	QUnit.test("setEnableAppointmentsDragAndDrop propagates to the internal grid", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGridSetEnableAppointmentsDragAndDropSpy = this.spy(oSPC.getAggregation("_grid"), "setEnableAppointmentsDragAndDrop");

		// act
		oSPC.setEnableAppointmentsDragAndDrop(true);

		// assert
		assert.ok(oGridSetEnableAppointmentsDragAndDropSpy.calledWith(true), "setEnableAppointmentsDragAndDrop of the grid is called with right params");

		// cleanup
		oGridSetEnableAppointmentsDragAndDropSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("setEnableAppointmentsResize propagates to the internal grid", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGridSetEnableAppointmentsResizeSpy = this.spy(oSPC.getAggregation("_grid"), "setEnableAppointmentsResize");

		// act
		oSPC.setEnableAppointmentsResize(true);

		// assert
		assert.ok(oGridSetEnableAppointmentsResizeSpy.calledWith(true), "setEnableAppointmentsResize of the grid is called with right params");

		// cleanup
		oGridSetEnableAppointmentsResizeSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("setEnableAppointmentsCreate propagates to the internal grid", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGridSetEnableAppointmentsCreateSpy = this.spy(oSPC.getAggregation("_grid"), "setEnableAppointmentsCreate");

		// act
		oSPC.setEnableAppointmentsCreate(true);

		// assert
		assert.ok(oGridSetEnableAppointmentsCreateSpy.calledWith(true), "setEnableAppointmentsCreate of the grid is called with right params");

		// cleanup
		oGridSetEnableAppointmentsCreateSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("When the setStartHour/setEndHour is set, it is passed to the Grid", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oSPCGrid = oSPC._getCurrentGrid();

		// act
		oSPC.setStartHour(8);
		oSPC.setEndHour(20);

		// assert
		assert.equal(oSPCGrid.getStartHour(), 8, "The start hour is passed to the grid.");
		assert.equal(oSPCGrid.getEndHour(), 20, "The end hour is passed to the grid.");

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("getViewByKey: Return the view with matching key, or null if there is no match", function(assert) {

		var oSPC = new SinglePlanningCalendar({
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					}),
					new SinglePlanningCalendarDayView({
						key: "MonthView",
						title: "Month View"
					})
				]
			}),
			oView;

		// Act: try to find a view with "DayView" key
		oView = oSPC.getViewByKey("DayView");

		// assert
		assert.equal(oSPC._isViewKeyExisting("DayView"), true, "View with key 'DayView' exists, dedicated method _isViewKeyExisting returns true");
		assert.deepEqual(oSPC.getViews()[0], oView, "Returned View with key 'DayView' is correct");

		// Act: try to find a view with "MonthView" key
		oView = oSPC.getViewByKey("MonthView");

		// assert
		assert.equal(oSPC._isViewKeyExisting("MonthView"), true, "View with key 'MonthView' exists, dedicated method _isViewKeyExisting returns true");
		assert.deepEqual(oSPC.getViews()[1], oView, "Returned View with key 'MonthView' is correct");

		// Act: try to find a view with "WeekView" key
		oView = oSPC.getViewByKey("WeekView");

		// assert
		assert.equal(oSPC._isViewKeyExisting("WeekView"), false, "View with key 'WeekView' is missing, dedicated method _isViewKeyExisting returns false");
		assert.equal(oView, null, "View with key 'WeekView' is missing, null is returned");

		// cleanup
		oSPC.removeAllViews();
		oSPC.destroy();
		oSPC = null;

	});

	QUnit.test("calculateStartDate of month view should return the first date of the month", function (assert) {
		var oSPC = new SinglePlanningCalendar({
				views: new SinglePlanningCalendarMonthView({
					key: "MonthView",
					title: "Month View"
				})
			}),
			oTestDate = UI5Date.getInstance(2020, 2, 31, 0, 0, 0),
			oExpectedDate = UI5Date.getInstance(2020, 2, 1, 0, 0, 0);

		//act
		var oCalculatedDate = oSPC.getAggregation("views")[0].calculateStartDate(oTestDate);

		//assert
		assert.deepEqual(oExpectedDate, oCalculatedDate, "The correct date was calculated");
		//clean up
		oSPC.destroy();
	});

	QUnit.test("firstDayOfWeek", async function(assert) {
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2015, 0, 1, 8),
				views: [
					new SinglePlanningCalendarDayView("DayView", {
						key: "DayView",
						title: "Day View"
					}),
					new SinglePlanningCalendarWeekView("WeekView", {
						key: "WeekView",
						title: "Week View"
					}),
					new SinglePlanningCalendarWorkWeekView("WorkWeekView", {
						key: "WorkWeekView",
						title: "Work Week View"
					}),
					new SinglePlanningCalendarMonthView("MonthView", {
						key: "MonthView",
						title: "Month View"
					})
				]
			}),
			oStartDate = UI5Date.getInstance(2015, 0, 1, 8),
			sCurrentPickerId, oPicker, oRow, aDays, $Date, oErrorSpy;

		// Prepare
		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		sCurrentPickerId = oSPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = oSPC.getAggregation("_grid").getAggregation("_columnHeaders");

		// Act
		oSPC.setFirstDayOfWeek(3);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Days view propagated to picker");
		assert.strictEqual(oSPC._getSelectedView().getFirstDayOfWeek(), 3, "firstDayOfWeek in Day view propagated to view");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of TimesRow not changed");

		// Act
		oSPC.setSelectedView("WorkWeekView");
		await nextUIUpdate();

		sCurrentPickerId = oSPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = oSPC.getAggregation("_grid").getAggregation("_columnHeaders");
		oStartDate.setFullYear(2014, 11, 29);
		oStartDate.setHours(0);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Work Week view propagated to picker");
		assert.strictEqual(oSPC._getSelectedView().getFirstDayOfWeek(), 3, "firstDayOfWeek in Work Week view propagated to view");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow not changed");

		// Act
		oSPC.setSelectedView("MonthView");
		await nextUIUpdate();

		sCurrentPickerId = oSPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Month view propagated to picker");
		assert.strictEqual(oSPC._getSelectedView().getFirstDayOfWeek(), 3, "firstDayOfWeek in Month view propagated to view");
		assert.strictEqual(oSPC.getAggregation("_mvgrid").getFirstDayOfWeek(), 3, "firstDayOfWeek in Month view propagated to month grid");

		// Act
		oSPC.setSelectedView("WeekView");
		await nextUIUpdate();

		sCurrentPickerId = oSPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = oSPC.getAggregation("_grid").getAggregation("_columnHeaders");
		oStartDate.setFullYear(2014, 11, 31);
		oStartDate.setHours(0);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Week view propagated to picker");
		assert.strictEqual(oSPC._getSelectedView().getFirstDayOfWeek(), 3, "firstDayOfWeek in Week view propagated to view");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of WeeksRow changed");

		// Act
		oSPC.setFirstDayOfWeek(-1);
		await nextUIUpdate();

		aDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");
		$Date = aDays[0];
		oStartDate.setFullYear(2014, 11, 28);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), -1, "firstDayOfWeek in Week view propagated to picker (locale)");
		assert.strictEqual(oSPC._getSelectedView().getFirstDayOfWeek(), -1, "firstDayOfWeek in Week view propagated to view");
		assert.strictEqual(oRow.getFirstDayOfWeek(), -1, "firstDayOfWeek of WeeksRow changed");
		assert.strictEqual($Date.getAttribute("data-sap-day"), "20141228", "correct first rendered date");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow not changed");

		oErrorSpy = this.spy(Log, "error");

		// Act
		oSPC.setFirstDayOfWeek(10);

		// Assert
		assert.strictEqual(oErrorSpy.callCount, 1, "There is an error in the console when invalid value is passed.");
		assert.strictEqual(oSPC.getFirstDayOfWeek(), -1, "The value is not set.");

		oSPC.destroy();
	});

	QUnit.test("CalendarWeekNumbering - correct week day", async function(assert) {
		var sInitialWeekNumbering = "ISO_8601";
		var sViewKey = "WeekView";
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2015, 0, 1, 8),
				views: [
					new SinglePlanningCalendarWeekView("WeekView", {
						key: "WeekView",
						title: "Week View"
					}),
					new SinglePlanningCalendarMonthView("MonthView", {
						key: "MonthView",
						title: "Month View"
					})
				]
			});

		// Prepare
		oSPC.placeAt("qunit-fixture");

		// Act
		oSPC.setSelectedView(sViewKey);
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();

		var oRow = oSPC.getAggregation("_grid").getAggregation("_columnHeaders"),
			aHeaderDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");

		// Assert
		assert.strictEqual(aHeaderDays.length, 7, "7 weekheaders rendered");
		assert.strictEqual(oSPC.getViewByKey(sViewKey).getCalendarWeekNumbering(), sInitialWeekNumbering, sViewKey + "has proper calendarWeekNumbering after changing the SinglePlanningCalendar property");
		assert.strictEqual(aHeaderDays[0].children[1].textContent, "Mon", "Monday is the first weekday for ISO_8601");

		// Act
		sInitialWeekNumbering = "MiddleEastern";
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();
		aHeaderDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");

		// Assert
		assert.strictEqual(aHeaderDays.length, 7, "7 weekheaders rendered");
		assert.strictEqual(oSPC.getViewByKey(sViewKey).getCalendarWeekNumbering(), sInitialWeekNumbering, sViewKey + "has proper calendarWeekNumbering after changing the SinglePlanningCalendar property");
		assert.strictEqual(aHeaderDays[0].children[1].textContent, "Sat", "Saturday is the first weekday for MiddleEastern");

		// Act
		sInitialWeekNumbering = "WesternTraditional";
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();
		aHeaderDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");

		// Assert
		assert.strictEqual(aHeaderDays.length, 7, "7 weekheaders rendered");
		assert.strictEqual(oSPC.getViewByKey(sViewKey).getCalendarWeekNumbering(), sInitialWeekNumbering, sViewKey + "has proper calendarWeekNumbering after changing the SinglePlanningCalendar property");
		assert.strictEqual(aHeaderDays[0].children[1].textContent, "Sun", "Sunday is the first weekday for WesternTraditional");

		// Act
		sInitialWeekNumbering = "ISO_8601";
		sViewKey = "MonthView";
		oSPC.setSelectedView(sViewKey);
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();
		aHeaderDays = oSPC.getDomRef().querySelectorAll(".sapUiCalWH");

		// Assert
		assert.strictEqual(aHeaderDays[0].textContent, "Mon", "Monday is the first weekday for ISO_8601");

		// Act
		sInitialWeekNumbering = "MiddleEastern";
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();
		aHeaderDays = oSPC.getDomRef().querySelectorAll(".sapUiCalWH");

		// Assert
		assert.strictEqual(aHeaderDays[0].textContent, "Sat", "Saturday is the first weekday for MiddleEastern");
		assert.strictEqual(oSPC.getViewByKey(sViewKey).getCalendarWeekNumbering(), sInitialWeekNumbering, sViewKey + "has proper calendarWeekNumbering after changing the SinglePlanningCalendar property");

		// Act
		sInitialWeekNumbering = "WesternTraditional";
		oSPC.setCalendarWeekNumbering(sInitialWeekNumbering);
		await nextUIUpdate();
		aHeaderDays = oSPC.getDomRef().querySelectorAll(".sapUiCalWH");

		// Assert
		assert.strictEqual(aHeaderDays[0].textContent, "Sun", "Saturday is the first weekday for WesternTraditional");
		assert.strictEqual(oSPC.getViewByKey(sViewKey).getCalendarWeekNumbering(), sInitialWeekNumbering, sViewKey + "has proper calendarWeekNumbering after changing the SinglePlanningCalendar property");

		oSPC.destroy();
	});

	QUnit.module("Multi dates selection");

	QUnit.test("Multi dates selection - add/remove/get selectedDates", async function(assert) {
		var sViewKey = "WeekView";
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2015, 0, 1, 8),
				views: [
					new SinglePlanningCalendarWeekView("WeekView", {
						key: "WeekView",
						title: "Week View"
					}),
					new SinglePlanningCalendarMonthView("MonthView", {
						key: "MonthView",
						title: "Month View"
					})
				],
				selectedDates: [
					new DateRange({startDate: UI5Date.getInstance(2015, 0, 1, 8)}),
					new DateRange({startDate: UI5Date.getInstance(2015, 0, 2, 8)}),
					new DateRange({startDate: UI5Date.getInstance(2015, 0, 3, 8)})
				]
			});

		// Prepare
		oSPC.placeAt("qunit-fixture");

		// Act
		oSPC.setSelectedView(sViewKey);
		await nextUIUpdate();

		//assert
		assert.strictEqual(oSPC.getSelectedDates().length, 3, "the selected dates are correctly added");
		assert.strictEqual(oSPC.getAggregation("_grid").getSelectedDates().length, 3, "the selected dates are correctly added in the selected view");

		// Act
		sViewKey = "MonthView";
		oSPC.setSelectedView(sViewKey);
		await nextUIUpdate();

		//assert
		assert.strictEqual(oSPC.getAggregation("_mvgrid").getSelectedDates().length, 3, "the selected dates are correctly added in the selected view");

		// Act
		oSPC.addSelectedDate(new DateRange({startDate: UI5Date.getInstance(2015, 0, 4, 8)}));

		//assert
		assert.strictEqual(oSPC.getSelectedDates().length, 4, "the selected dates are correctly added");
		assert.strictEqual(oSPC.getAggregation("_mvgrid").getSelectedDates().length, 4, "the selected dates are correctly added in the selected view");

		// Act
		sViewKey = "WeekView";
		oSPC.setSelectedView(sViewKey);
		await nextUIUpdate();

		//assert
		assert.strictEqual(oSPC.getAggregation("_grid").getSelectedDates().length, 4, "the selected dates are correctly added in the selected view");

		// Act
		oSPC.removeAllSelectedDates();
		await nextUIUpdate();

		//assert
		assert.strictEqual(oSPC.getSelectedDates().length, 0, "the selected dates are correctly removed");
		assert.strictEqual(oSPC.getAggregation("_grid").getSelectedDates().length, 0, "the selected dates are correctly removed in the selected view");

		//clean up
		oSPC.destroy();
	});

	QUnit.module("Events");

	QUnit.test("appointmentSelect: select a single appointment in day-based view", function (assert) {
		var oAppointment = new CalendarAppointment(),
			oSPC = new SinglePlanningCalendar({
				appointments: [
					oAppointment
				]
			}),
			oFakeEvent = {
				target: {
					classList: {
						contains: function() {
							return false;
						}
					}
				},
				srcControl: oAppointment
			},
			fnFireAppointmentSelectSpy = this.spy(oSPC, "fireAppointmentSelect");

		//act
		oSPC.getAggregation("_grid").onmouseup(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
			appointment: oAppointment,
			appointments: [oAppointment],
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointmentSelect: deselect all appointments in day-based view", function (assert) {
		var oSPC = new SinglePlanningCalendar({
				appointments: [
					new CalendarAppointment({
						startDate: UI5Date.getInstance(2018, 6, 8, 5),
						endDate: UI5Date.getInstance(2018, 6, 8, 6),
						selected: true
					}),
					new CalendarAppointment({
						startDate: UI5Date.getInstance(2018, 6, 9, 4),
						endDate: UI5Date.getInstance(2018, 6, 10, 4),
						selected: true
					})
				]
			}),
			oFakeEvent = {
				target: jQuery("<div></div>").attr({
					"data-sap-start-date": "20180708-0300",
					"data-sap-end-date": "20180708-0400",
					"class": "sapMSinglePCRow"
				}).get(0)
			},
			fnFireAppointmentSelectSpy = this.spy(oSPC, "fireAppointmentSelect");

		//act
		oSPC.getAggregation("_grid").onmouseup(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
			appointment: undefined,
			appointments: oSPC.getAggregation("appointments"),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointmentSelect: select a single appointment in month-based view", function (assert) {
		var oAppointment = new CalendarAppointment(),
			oSPC = new SinglePlanningCalendar({
				views: new SinglePlanningCalendarMonthView({
					key: "MonthView",
					title: "Month View"
				}),
				appointments: [
					oAppointment
				]
			}),
			oFakeEvent = {
				target: {
					classList: {
						contains: function() {
							return false;
						}
					}
				},
				srcControl: oAppointment
			},
			fnFireAppointmentSelectSpy = this.spy(oSPC, "fireAppointmentSelect");

		//act
		oSPC.getAggregation("_mvgrid").onmouseup(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
			appointment: oAppointment,
			appointments: [oAppointment],
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointmentSelect: deselect all appointments in month-based view", async function (assert) {
		var oSPC = new SinglePlanningCalendar({
				views: new SinglePlanningCalendarMonthView({
					key: "MonthView",
					title: "Month View"
				}),
				appointments: [
					new CalendarAppointment({
						startDate: UI5Date.getInstance(2018, 6, 8, 5),
						endDate: UI5Date.getInstance(2018, 6, 8, 6),
						selected: true
					}),
					new CalendarAppointment({
						startDate: UI5Date.getInstance(2018, 6, 9, 4),
						endDate: UI5Date.getInstance(2018, 6, 10, 4),
						selected: true
					})
				]
			}),
			oFakeEvent = {
				target: jQuery("<div></div>").attr({
					"class": "sapMSPCMonthDay",
					"sap-ui-date": "100000"
				}).get(0),
				srcControl: oSPC.getAggregation("_mvgrid")
			},
			fnFireAppointmentSelectSpy = this.spy(oSPC, "fireAppointmentSelect");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act
		oSPC.getAggregation("_mvgrid")._fireSelectionEvent(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
			appointment: undefined,
			appointments: oSPC.getAggregation("appointments"),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("headerDateSelect", function (assert) {
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2021, 1, 1)
			}).placeAt("qunit-fixture"),
			oSPCHeaders = oSPC.getAggregation("_grid")._getColumnHeaders(),
			oHeaderDateToSelect = UI5Date.getInstance(2021, 1, 4),
			fnFireHeaderDateSelect = this.spy(oSPC, "fireHeaderDateSelect");

		//act
		oSPCHeaders.setDate(oHeaderDateToSelect);
		oSPCHeaders.fireSelect();

		//assert
		assert.ok(fnFireHeaderDateSelect.calledOnce, "Event was fired");
		assert.ok(fnFireHeaderDateSelect.calledWithExactly({
			date: oHeaderDateToSelect,
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("viewChange", async function (assert) {
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2021, 1, 1),
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					}),
					new SinglePlanningCalendarDayView({
						key: "MonthView",
						title: "Month View"
					})
				]
			}),
			oMonthViewSegmentedButtonItem = oSPC._getHeader()._getOrCreateViewSwitch().getItems()[1],
			sMonthViewId = oSPC.getViews()[1].getId(),
			oDayViewSegmentedButtonItem = oSPC._getHeader()._getOrCreateViewSwitch().getItems()[0],
			sDayViewId = oSPC.getViews()[0].getId(),
			fnFireViewChange = this.spy(oSPC, "fireViewChange"),
			sOpenPickerButtonText = oSPC._getHeader()._oPickerBtn.getText();

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - simulate press on a Month View SegmentedButton
		oMonthViewSegmentedButtonItem.oButton.firePress();
		await nextUIUpdate();
		//assert - selected view must be Month View, and event must be called once
		assert.equal(oSPC.getSelectedView(), sMonthViewId, "The proper View Id is stored in selectedView association");
		assert.strictEqual(sOpenPickerButtonText, "February 1, 2021", "The text must be visible and with correct value February 1, 2021");
		assert.ok(fnFireViewChange.firstCall, "Event was fired");

		// Act - simulate press on a Day View SegmentedButton
		oDayViewSegmentedButtonItem.oButton.firePress();
		await nextUIUpdate();

		//assert - selected view must be Day View, and event must be called once
		assert.equal(oSPC.getSelectedView(), sDayViewId, "The proper View Id is stored in selectedView association");
		assert.ok(fnFireViewChange.secondCall, "Event was fired");

		//clean up
		oSPC.removeAllViews();
		oSPC.destroy();
		oSPC = null;
	});

	QUnit.test("startDateChange: on next button press", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			oSPCHeader = oSPC._getHeader(),
			iScrollDays = Element.getElementById(oSPC.getAssociation("selectedView")).getScrollEntityCount(),
			oInitialStartDate = oSPC.getStartDate(),
			fnFireStartDateChange = this.spy(oSPC, "fireStartDateChange");

		//act
		oSPCHeader.firePressNext();

		//assert
		assert.ok(fnFireStartDateChange.calledOnce, "Event was fired");
		assert.ok(fnFireStartDateChange.calledWithExactly({
			date: UI5Date.getInstance(oInitialStartDate.getFullYear(), oInitialStartDate.getMonth(), oInitialStartDate.getDate() + iScrollDays),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("startDateChange: on previous button press", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			oSPCHeader = oSPC._getHeader(),
			iScrollDays = Element.getElementById(oSPC.getAssociation("selectedView")).getScrollEntityCount(),
			oInitialStartDate = oSPC.getStartDate(),
			fnFireStartDateChange = this.spy(oSPC, "fireStartDateChange");

		//act
		oSPCHeader.firePressPrevious();

		//assert
		assert.ok(fnFireStartDateChange.calledOnce, "Event was fired");
		assert.ok(fnFireStartDateChange.calledWithExactly({
			date: UI5Date.getInstance(oInitialStartDate.getFullYear(), oInitialStartDate.getMonth(), oInitialStartDate.getDate() - iScrollDays),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("startDateChange: on today button press", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			oSPCHeader = oSPC._getHeader(),
			oInitialStartDate = oSPC.getStartDate(),
			fnFireStartDateChange = this.spy(oSPC, "fireStartDateChange");

		//act
		oSPCHeader.firePressToday();

		//assert
		assert.ok(fnFireStartDateChange.calledOnce, "Event was fired");
		assert.ok(fnFireStartDateChange.calledWithExactly({
			date: oSPC._getSelectedView().calculateStartDate(oInitialStartDate),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("startDateChange: on date select from picker", function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			oSPCHeader = oSPC._getHeader(),
			oInitialStartDate = oSPC.getStartDate(),
			fnFireStartDateChange = this.spy(oSPC, "fireStartDateChange");

		//act
		oSPCHeader.fireDateSelect();

		//assert
		assert.ok(fnFireStartDateChange.calledOnce, "Event was fired");
		assert.ok(fnFireStartDateChange.calledWithExactly({
			date: oSPC._getSelectedView().calculateStartDate(oInitialStartDate),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("appointmentDrop is fired when internal grid event appointmentDrop is fired", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGrid = oSPC.getAggregation("_grid"),
			oFireAppointmentDropSpy = this.spy(oSPC, "fireAppointmentDrop");

		// act
		oGrid.fireEvent("appointmentDrop", {});

		// assert
		assert.equal(oFireAppointmentDropSpy.callCount, 1, "fireAppointmentDrop of the SinglePlanningCalendar is called once");

		// cleanup
		oFireAppointmentDropSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("appointmentResize is fired when internal grid event appointmentResize is fired", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGrid = oSPC.getAggregation("_grid"),
			oFireAppointmentResizeSpy = this.spy(oSPC, "fireAppointmentResize");

		// act
		oGrid.fireEvent("appointmentResize", {});

		// assert
		assert.equal(oFireAppointmentResizeSpy.callCount, 1, "fireAppointmentResize of the SinglePlanningCalendar is called once");

		// cleanup
		oFireAppointmentResizeSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("appointmentCreate is fired when internal grid event appointmentCreate is fired", function (assert) {
		// arrange
		var oSPC = new SinglePlanningCalendar(),
			oGrid = oSPC.getAggregation("_grid"),
			oFireAppointmentCreateSpy = this.spy(oSPC, "fireAppointmentCreate");

		// act
		oGrid.fireEvent("appointmentCreate", {});

		// assert
		assert.equal(oFireAppointmentCreateSpy.callCount, 1, "fireAppointmentCreate of the SinglePlanningCalendar is called once");

		// cleanup
		oFireAppointmentCreateSpy.restore();
		oSPC.destroy();
	});

	QUnit.test("cellPress: in day-based view", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8)
			}),
			oFakeEvent = {
				target: jQuery("<div></div>").attr({
					"data-sap-start-date": "20180708-0300",
					"data-sap-end-date": "20180708-0400",
					"class": "sapMSinglePCRow"
				}).get(0),
				which: KeyCodes.ENTER,
				preventDefault: function() {}
			},
			fnFireGridCellFocusSpy = this.spy(oSPC, "fireEvent");

		// act
		oSPC.getAggregation("_grid")._fireSelectionEvent(oFakeEvent);

		// assert
		assert.ok(fnFireGridCellFocusSpy.withArgs("cellPress").calledOnce, "Event was fired");
		assert.ok(fnFireGridCellFocusSpy.calledWithExactly("cellPress", {
			startDate: UI5Date.getInstance(2018, 6 , 8, 3),
			endDate: UI5Date.getInstance(2018, 6, 8, 4),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("cellPress: in month-based view", async function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 7, 2),
				views: new SinglePlanningCalendarMonthView({
					key: "MonthView",
					title: "Month View"
				})
			}).placeAt("qunit-fixture"),
			oGrid = oSPC.getAggregation("_mvgrid"),
			oFakeEvent,
			fnFireGridCellFocusSpy = this.spy(oSPC, "fireEvent");
		await nextUIUpdate();

		oFakeEvent = { target: oGrid.$().find('.sapMSPCMonthDay')[3], srcControl: oGrid };

		// act
		oGrid._fireSelectionEvent(oFakeEvent);

		// assert
		assert.ok(fnFireGridCellFocusSpy.withArgs("cellPress").calledOnce, "Event was fired");
		assert.ok(fnFireGridCellFocusSpy.calledWithExactly("cellPress", {
			startDate: UI5Date.getInstance(2018, 7, 1),
			endDate: UI5Date.getInstance(2018, 7, 2),
			id: oSPC.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("borderReached: when focus is on appointment and we are navigating in backward direction on week view", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 8, 5),
				endDate: UI5Date.getInstance(2018, 6, 8, 6)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8),
				appointments: [oAppointment]
			}),
			oFakeEvent = {
				target: {
					id: oAppointment.getId(),
					classList: {
						contains: function() {
							return false;
						}
					},
					which: KeyCodes.ARROW_LEFT
				},
				preventDefault: function() {}
			},
			fnBorderReachedCallbackSpy = this.spy();

		oSPC.getAggregation("_grid").attachEvent("borderReached", fnBorderReachedCallbackSpy);

		// act
		oSPC.getAggregation("_grid").onsapleft(oFakeEvent);

		// assert
		assert.ok(fnBorderReachedCallbackSpy.calledOnce, "borderReached callback is called");
		assert.deepEqual(oSPC.getStartDate(), UI5Date.getInstance(2018, 6, 1), "Start date is changed correctly");
		assert.equal(
			oSPC._sGridCellFocusSelector,
			"[data-sap-start-date='20180707-0500'].sapMSinglePCRow",
			"Start date is changed correctly"
		);

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("borderReached: when focus is on appointment and we are navigating in forward direction on week view", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 14, 5),
				endDate: UI5Date.getInstance(2018, 6, 14, 6)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8),
				appointments: [oAppointment]
			}),
			oFakeEvent = {
				target: {
					id: oAppointment.getId(),
					classList: {
						contains: function() {
							return false;
						}
					},
					which: KeyCodes.ARROW_RIGHT
				},
				preventDefault: function() {}
			},
			fnBorderReachedCallbackSpy = this.spy();

		oSPC.getAggregation("_grid").attachEvent("borderReached", fnBorderReachedCallbackSpy);

		// act
		oSPC.getAggregation("_grid").onsapright(oFakeEvent);

		// assert
		assert.ok(fnBorderReachedCallbackSpy.calledOnce, "borderReached callback is called");
		assert.deepEqual(oSPC.getStartDate(), UI5Date.getInstance(2018, 6, 15), "Start date is changed correctly");
		assert.equal(
			oSPC._sGridCellFocusSelector,
			"[data-sap-start-date='20180715-0500'].sapMSinglePCRow",
			"Start date is changed correctly"
		);

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("borderReached: when focus is on a grid cell and we are navigating in backward direction on week view", function(assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8)
			}),
			oFakeEvent = {
				target: jQuery("<div></div>").attr({
					"data-sap-start-date": "20180708-0300",
					"data-sap-end-date": "20180708-0400",
					"class": "sapMSinglePCRow"
				}).get(0),
				which: KeyCodes.ARROW_LEFT,
				preventDefault: function() {}
			},
			fnBorderReachedCallbackSpy = this.spy();

		oSPC.getAggregation("_grid").attachEvent("borderReached", fnBorderReachedCallbackSpy);

		// act
		oSPC.getAggregation("_grid").onsapleft(oFakeEvent);

		// assert
		assert.ok(fnBorderReachedCallbackSpy.calledOnce, "borderReached callback is called");
		assert.deepEqual(oSPC.getStartDate(), UI5Date.getInstance(2018, 6, 1), "Start date is changed correctly");
		assert.equal(
			oSPC._sGridCellFocusSelector,
			"[data-sap-start-date='20180707-0300'].sapMSinglePCRow",
			"Start date is changed correctly"
		);

		// cleanup
		oSPC.destroy();
	});

	QUnit.test("borderReached: when focus is on grid cell and we are navigating in forward direction on week view", function(assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8)
			}),
			oFakeEvent = {
				target: jQuery("<div></div>").attr({
					"data-sap-start-date": "20180714-0300",
					"data-sap-end-date": "20180714-0400",
					"class": "sapMSinglePCRow"
				}).get(0),
				which: KeyCodes.ARROW_RIGHT,
				preventDefault: function() {}
			},
			fnBorderReachedCallbackSpy = this.spy();

		oSPC.getAggregation("_grid").attachEvent("borderReached", fnBorderReachedCallbackSpy);

		// act
		oSPC.getAggregation("_grid").onsapright(oFakeEvent);

		// assert
		assert.ok(fnBorderReachedCallbackSpy.calledOnce, "borderReached callback is called");
		assert.deepEqual(oSPC.getStartDate(), UI5Date.getInstance(2018, 6, 15), "Start date is changed correctly");
		assert.equal(
			oSPC._sGridCellFocusSelector,
			"[data-sap-start-date='20180715-0300'].sapMSinglePCRow",
			"Start date is changed correctly"
		);

		// cleanup
		oSPC.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("Class for hidden actionsToolbar", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		assert.ok($oSPCRef.hasClass("sapMSinglePCActionsHidden"), "Class for hidden actions is applied when they are empty");

		oSPC.destroy();
	});

	QUnit.test("Class for non-hidden actionsToolbar", async function (assert) {
		var oSPC = new SinglePlanningCalendar({ title: "Something" }),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		assert.notOk($oSPCRef.hasClass("sapMSinglePCActionsHidden"),
			"Class for hidden actions isn't applied when they aren't empty");

		oSPC.destroy();
	});

	QUnit.test("Initial classes for stickyMode: None (Default)", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class isn't applied");
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class isn't applied");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Initial classes for stickyMode: All", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar({ stickyMode: "All" }),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.ok($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class is applied");
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class isn't applied");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Initial classes for stickyMode: NavBarAndColHeaders", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar({ stickyMode: "NavBarAndColHeaders" }),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class isn't applied");
		assert.ok($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class is applied");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Classes application when stickyMode is changed runtime", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			$oSPCRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oSPC.setStickyMode("All");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.ok($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class is applied");
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class isn't applied");

		// Act
		oSPC.setStickyMode("NavBarAndColHeaders");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class isn't applied");
		assert.ok($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class is applied");

		// Act
		oSPC.setStickyMode("None");
		await nextUIUpdate();
		$oSPCRef = oSPC.$();

		// Assert
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyAll"), "sapMSinglePCStickyAll class isn't applied");
		assert.notOk($oSPCRef.hasClass("sapMSinglePCStickyNavBarAndColHeaders"), "sapMSinglePCStickyNavBarAndColHeaders class isn't applied");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Pointer events are disabled for the now marker", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			oNowMarker;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		oNowMarker = oSPC.getDomRef().querySelector(".sapMSinglePCNowMarker");

		// Act
		// Assert
		assert.strictEqual(getComputedStyle(oNowMarker).getPropertyValue("pointer-events"), "none" , "pointer-events: none propety is applied");

		// Clean up
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

	QUnit.test("addView using binding", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View"
		});
		oSPC.setModel(oModel);

		// act
		oSPC.addView(new SinglePlanningCalendarDayView({
			key: "DayKey",
			title: '{/DayTitle}'
		})).placeAt('qunit-fixture');

		//assert
		assert.strictEqual(oSPC.getViews()[0].getTitle(), oSPC._getHeader()._getOrCreateViewSwitch().getItems()[0].getText(), "The title set to the view is transferred to the text property of one of the items in the views switch.");

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

		//act
		oSPC.addView(oDayViewDuplicate);

		//assert
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

	QUnit.test("insertView using binding", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View"
		});
		oSPC.setModel(oModel);

		// act
		oSPC.insertView(new SinglePlanningCalendarDayView({
			key: "DayKey",
			title: '{/DayTitle}'
		})).placeAt('qunit-fixture');

		//assert
		assert.strictEqual(oSPC.getViews()[0].getTitle(), oSPC._getHeader()._getOrCreateViewSwitch().getItems()[0].getText(), "The title set to the view is transferred to the text property of one of the items in the views switch.");

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

	QUnit.test("removeView using binding from one currently existing", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oView = new SinglePlanningCalendarDayView({
				key: "DayKey",
				title: '{/DayTitle}'
			}),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View"
		});
		oSPC.setModel(oModel);

		oSPC.addView(oView).placeAt('qunit-fixture');

		// act
		oSPC.removeView(oView);

		//assert
		assert.notOk(oSPC._oViewsObserver, "The ManagedObjectObserver does not exist, because there are no views.");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("removeView using binding from two currently existing", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oDayView = new SinglePlanningCalendarDayView({
				key: "DayKey",
				title: '{/DayTitle}'
			}),
			oWeekView = new SinglePlanningCalendarWeekView({
				key: "WeekKey",
				title: '{/WeekTitle}'
			}),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View",
			WeekTitle: "Week View"
		});
		oSPC.setModel(oModel);

		oSPC.addView(oDayView);
		oSPC.addView(oWeekView).placeAt('qunit-fixture');

		// act
		oSPC.removeView(oDayView);

		//assert
		assert.ok(oSPC._oViewsObserver, "The ManagedObjectObserver exists, because there is still one view.");

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

	QUnit.test("removeAllViews using binding", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oDayView = new SinglePlanningCalendarDayView({
				key: "DayKey",
				title: '{/DayTitle}'
			}),
			oWeekView = new SinglePlanningCalendarWeekView({
				key: "WeekKey",
				title: '{/WeekTitle}'
			}),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View",
			WeekTitle: "Week View"
		});
		oSPC.setModel(oModel);

		oSPC.addView(oDayView);
		oSPC.addView(oWeekView).placeAt('qunit-fixture');

		// act
		oSPC.removeAllViews();

		//assert
		assert.notOk(oSPC._oViewsObserver, "The ManagedObjectObserver does not exist, because there are no views.");

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

	QUnit.test("destroyViews using binding", function (assert) {
		// prepare
		var oSPC = new SinglePlanningCalendar(),
			oDayView = new SinglePlanningCalendarDayView({
				key: "DayKey",
				title: '{/DayTitle}'
			}),
			oWeekView = new SinglePlanningCalendarWeekView({
				key: "WeekKey",
				title: '{/WeekTitle}'
			}),
			oModel = new JSONModel();

		oModel.setData({
			DayTitle: "Day View",
			WeekTitle: "Week View"
		});
		oSPC.setModel(oModel);

		oSPC.addView(oDayView);
		oSPC.addView(oWeekView).placeAt('qunit-fixture');

		// act
		oSPC.destroyViews();

		//assert
		assert.notOk(oSPC._oViewsObserver, "The ManagedObjectObserver does not exist, because there are no views.");

		//clean up
		oSPC.destroy();
	});

	QUnit.test("SegmentedButton becomes Select if there are more than 4 views and vice versa", function (assert) {
		var oDayView1 = new SinglePlanningCalendarDayView({
				key: "DayView1",
				title: "Day View 1"
			}),
			oDayView2 = new SinglePlanningCalendarDayView({
				key: "DayView2",
				title: "Day View 2"
			}),
			oDayView3 = new SinglePlanningCalendarDayView({
				key: "DayView3",
				title: "Day View 3"
			}),
			oDayView4 = new SinglePlanningCalendarDayView({
				key: "DayView4",
				title: "Day View 4"
			}),
			oDayView5 = new SinglePlanningCalendarDayView({
				key: "DayView5",
				title: "Day View 5"
			}),
			oSPC = new SinglePlanningCalendar({}),
			oToSelectModeSpy = this.spy(oSPC._getHeader()._getOrCreateViewSwitch(),  "_toSelectMode"),
			oToNormalModeSpy = this.spy(oSPC._getHeader()._getOrCreateViewSwitch(),  "_toNormalMode");

		// act
		oSPC.addView(oDayView1);
		oSPC.addView(oDayView2);
		oSPC.addView(oDayView3);
		oSPC.addView(oDayView4);
		oSPC.addView(oDayView5);

		//assert
		assert.strictEqual(oToSelectModeSpy.calledOnce, true, "_toSelectMode of the SegmentedButton called once");

		// act
		oSPC.removeView(oDayView1);
		assert.strictEqual(oToNormalModeSpy.calledOnce, true, "_toNormalMode of the SegmentedButton called once");

		//clean up
		oSPC.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("tabindex", async function (assert) {
		// Prepare
		var oCalendarStartDate = UI5Date.getInstance(2018, 11, 24),
			oAppointment = new CalendarAppointment({
				title: "Appointment",
				startDate: UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0)
			}),
			oBlocker = new CalendarAppointment({
				title: "Blocker",
				startDate: UI5Date.getInstance(2018, 11, 24, 0, 0, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 0, 0, 0)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oCalendarStartDate,
				appointments: [
					oBlocker,
					oAppointment
				]
			});

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAppointment.$().attr("tabindex"), "0", "Appointments are tabbable");
		assert.strictEqual(oBlocker.$().attr("tabindex"), "0", "Blockers are tabbable");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("start/end date + legend information", async function (assert) {
		// Prepare
		var oCalendarStartDate = UI5Date.getInstance(2018, 11, 24),
			oStartDate = UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
			oEndDate = UI5Date.getInstance(2018, 11, 24, 16, 30, 0),
			oAppointment = new CalendarAppointment("test-appointment", {
				title: "Appointment",
				startDate: oStartDate,
				endDate: oEndDate,
				type: "Type01"
			}),
			oAppointmentWithNoCorresspondingLegendItem = new CalendarAppointment("test-appointment2", {
				title: "Appointment",
				startDate: oStartDate,
				endDate: oEndDate,
				type: "Type02"
			}),
			oLegendItem = new CalendarLegendItem({
				type: "Type01",
				text: "Type Private Appointment"
			}),
			oLegend = new PlanningCalendarLegend({
				appointmentItems: [
					oLegendItem
				]
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oCalendarStartDate,
				appointments: [
					oAppointment,
					oAppointmentWithNoCorresspondingLegendItem
				],
				legend: oLegend
			}),
			oSPCGrid = oSPC.getAggregation("_grid"),
			sFormattedStartDay = oSPCGrid._oFormatStartEndInfoAria.format(oStartDate),
			sFormattedEndDay = oSPCGrid._oFormatStartEndInfoAria.format(oEndDate),
			// Expecting aria information to look like this: "From: *date here* To *date here*, TypeX"
			sAnnouncement = oSPCGrid._oUnifiedRB.getText("CALENDAR_APPOINTMENT_INFO", [
				sFormattedStartDay,
				sFormattedEndDay
			]),
			sAnnouncement2 = oSPCGrid._oUnifiedRB.getText("CALENDAR_APPOINTMENT_INFO", [
				sFormattedStartDay,
				sFormattedEndDay
			]);

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#test-appointment-1_0-Descr").html(), sAnnouncement + ", " + oLegendItem.getText(),
			"Information for appointment's start/end date + legend is present in the DOM");
		assert.strictEqual(jQuery("#test-appointment2-1_1-Descr").html(), sAnnouncement2 + ", " + oAppointmentWithNoCorresspondingLegendItem.getType(),
			"When the appointment has no corresponding legend item, its own type goes to the aria");
		assert.ok(oAppointment.$().attr("aria-labelledby") !== -1, "The appointment has reference to that information");

		// Act
		oLegend.destroy();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#test-appointment-1_0-Descr").html(), sAnnouncement + ", " + oAppointment.getType(),
			"when the legend is destroyed, the aria contains the correct info");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("All Day and Multi Day appointment information", async function (assert) {
		// Prepare
		var oCalendarStartDate = UI5Date.getInstance(2018, 11, 24),
			oStartDate = UI5Date.getInstance(2018, 11, 24),
			oEndDate = UI5Date.getInstance(2018, 11, 24),
			oEndDateMulti = UI5Date.getInstance(2018, 11, 26),
			oAllDayAppointment = new CalendarAppointment("test-appointment", {
				title: "Appointment",
				startDate: oStartDate,
				endDate: oEndDate,
				type: "Type01"
			}),
			oMultiDayAppointment = new CalendarAppointment("test-appointment2", {
				title: "Appointment",
				startDate: oStartDate,
				endDate: oEndDateMulti,
				type: "Type02"
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oCalendarStartDate,
				appointments: [
					oAllDayAppointment,
					oMultiDayAppointment
				]
			}),
			oSPCGrid = oSPC.getAggregation("_grid"),
			// Expecting information to look like this: "From *date here*, TypeX"
			sAnnouncementShort = oSPCGrid._oUnifiedRB.getText("CALENDAR_ALL_DAY_INFO", [
				oSPCGrid._oFormatAriaFullDayCell.format(oStartDate)
			]),
			// Expecting information to look like this: "From *date here*, To *date here*, TypeX"
			sAnnouncementLong = oSPCGrid._oUnifiedRB.getText("CALENDAR_APPOINTMENT_INFO", [
				oSPCGrid._oFormatAriaFullDayCell.format(oStartDate),
				oSPCGrid._oFormatAriaFullDayCell.format(oEndDateMulti)
			]),
			sAllDayAreaLabelId = InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_ALL_DAY_PREFIX");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#test-appointment-Descr").html(), sAnnouncementShort + ", " + oAllDayAppointment.getType(),
			"Information for all-day appointments is formatted correctly and present in the DOM");
		assert.ok(oAllDayAppointment.$().attr("aria-labelledby").indexOf(sAllDayAreaLabelId) > -1,
			"All-Day appointment has appropriate hidden label");

		assert.strictEqual(jQuery("#test-appointment2-Descr").html(), sAnnouncementLong + ", " + oMultiDayAppointment.getType(),
			"Information for all-day appointments spanning multiple days is formatted correctly and present in the DOM");
		assert.ok(oMultiDayAppointment.$().attr("aria-labelledby").indexOf(sAllDayAreaLabelId) > -1,
			"All-Day spanning multiple days appointment has appropriate hidden label");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Root element ARIA", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			sHeaderId = oSPC._getHeader()._getOrCreateTitleControl().getId(),
			sNowMarkerTextId = oSPC.getAggregation("_grid").getId() + "-nowMarkerText",
			$oSPCRef,
			aAriaLabelledBy;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oSPCRef = oSPC.$();
		aAriaLabelledBy = $oSPCRef.attr("aria-labelledby");

		// Assert
		assert.strictEqual($oSPCRef.attr("role"), "region", "Correct ARIA role applied");
		assert.strictEqual($oSPCRef.attr("aria-roledescription"), oSPC._oRB.getText("SPC_CONTROL_NAME"),
				"Custom control name applied");
		assert.ok(aAriaLabelledBy.indexOf(sHeaderId) > -1, "SPC is labelled by its title");
		assert.ok(aAriaLabelledBy.indexOf(sNowMarkerTextId) > -1, "SPC is labelled by the now marker's text");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Toolbars ARIA", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar({
				title: "A random title"		// Actions toolbar will be hidden without it
			}),
			oHeader = oSPC._getHeader(),
			oActionsToolbar = oHeader.getAggregation("_actionsToolbar"),
			sActionsToolbarLabelId = InvisibleText.getStaticId("sap.m", "SPC_ACTIONS_TOOLBAR"),
			oNavigationToolbar = oHeader.getAggregation("_navigationToolbar"),
			sNavigationToolbarLabelId = InvisibleText.getStaticId("sap.m", "SPC_NAVIGATION_TOOLBAR");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(oActionsToolbar.getAriaLabelledBy().indexOf(sActionsToolbarLabelId) > -1,
				"Actions toolbar has a hidden label");
		assert.ok(oNavigationToolbar.getAriaLabelledBy().indexOf(sNavigationToolbarLabelId) > -1,
				"Navigation toolbar has a hidden label");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Navigation buttons ARIA", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			oHeader = oSPC._getHeader(),
			sNavigationToolbarId = oHeader.getAggregation("_navigationToolbar").getId(),
			oPreviousButton = Element.getElementById(sNavigationToolbarId + "-PrevBtn"),
			oNextButton = Element.getElementById(sNavigationToolbarId + "-NextBtn"),
			sTodayButtonLabelId = InvisibleText.getStaticId("sap.m", "PCH_NAVIGATE_TO_TODAY"),
			sPickerButtonLabelId = InvisibleText.getStaticId("sap.m", "PCH_SELECT_RANGE");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oPreviousButton.getTooltip(), oSPC._oRB.getText("PCH_NAVIGATE_BACKWARDS"),
				"Icon-only button 'Previous' has appropriate tooltip");
		assert.strictEqual(oNextButton.getTooltip(), oSPC._oRB.getText("PCH_NAVIGATE_FORWARD"),
				"Icon-only button 'Next' has appropriate tooltip");

		assert.ok(oHeader._oTodayBtn.getAriaLabelledBy().indexOf(sTodayButtonLabelId) > -1,
				"Button 'Today' has appropriate hidden label");
		assert.ok(oHeader._oPickerBtn.getAriaLabelledBy().indexOf(sPickerButtonLabelId) > -1,
				"Picker button has appropriate hidden label");
		assert.strictEqual(oHeader._oPickerBtn.$().attr("aria-haspopup"), "dialog",
				"Picker button indicates that it will open a calendar");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Column headers area ARIA", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			sColumnHeadersAreaLabelId = InvisibleText.getStaticId("sap.m", "PLANNINGCALENDAR_DAYS"),
			$oColumnHeadersAreaRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oColumnHeadersAreaRef = oSPC.$().find(".sapMSinglePCColumnHeader");

		// Assert
		assert.strictEqual($oColumnHeadersAreaRef.attr("role"), "grid", "Column headers area has correct ARIA role");
		assert.ok($oColumnHeadersAreaRef.attr("aria-labelledby").indexOf(sColumnHeadersAreaLabelId) > -1,
				"Column headers area has appropriate hidden label");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Blockers area ARIA", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			sBlockersAreaLabelId = InvisibleText.getStaticId("sap.m", "SPC_BLOCKERS"),
			$oBlockersAreaRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oBlockersAreaRef = oSPC.$().find(".sapMSinglePCBlockers");

		// Assert
		assert.strictEqual($oBlockersAreaRef.attr("role"), "list", "Blockers area has correct ARIA role");
		assert.ok($oBlockersAreaRef.attr("aria-labelledby").indexOf(sBlockersAreaLabelId) > -1,
			"Blockers area has appropriate hidden label");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Blocker cells' wrapper ARIA", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			$oBlockersColumnsWrapper,
			$oBlockersColumnsWrapperParent;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oBlockersColumnsWrapper = oSPC.$().find(".sapMSinglePCBlockersColumns");
		$oBlockersColumnsWrapperParent = $oBlockersColumnsWrapper.parent();

		// Assert
		assert.strictEqual($oBlockersColumnsWrapper.attr("role"), "row", "The blocker cells are wrapped in an element with role=row");
		assert.strictEqual($oBlockersColumnsWrapperParent.attr("role"), "grid", "It's wrapper has role=grid");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Blocker cells ARIA", async function (assert) {
		// TODO: Add tests for the cell's content after ACC refactoring
		var oSPC = new SinglePlanningCalendar(),
			oBlockerCells;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		oBlockerCells = oSPC.$().find(".sapMSinglePCBlockersColumn");

		// Assert
		jQuery.each(oBlockerCells, function(iKey, oRef) {
			assert.strictEqual(jQuery(oRef).attr("role"), "gridcell", "Column " + iKey + " has role=gridcell.");
		});

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Appointments cells' wrapper ARIA", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			$oAppointmentsCellsWrapper;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oAppointmentsCellsWrapper = oSPC.$().find(".sapMSinglePCColumn");

		// Assert
		assert.strictEqual($oAppointmentsCellsWrapper.attr("role"), "row", "Appointments' cells are wrapped in an element with role=\"row\"");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Appointments cells ARIA", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			$oAppointmentsCells,
			$oAppointmentsCellsWrapper;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oAppointmentsCellsWrapper = oSPC.$().find(".sapMSinglePCColumn");
		$oAppointmentsCells = $oAppointmentsCellsWrapper.find(".sapMSinglePCRow");

		// Assert
		$oAppointmentsCells.each(function(iKey, oRef) {
			assert.strictEqual(jQuery(oRef).attr("role"), "gridcell", "Column " + iKey + " has role=gridcell.");
		});

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Appointments area ARIA", async function (assert) {
		var oSPC = new SinglePlanningCalendar(),
			sAppointmentsAreaLabelId = InvisibleText.getStaticId("sap.m", "SPC_APPOINTMENTS"),
			$oAppointmentsAreaRef;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oAppointmentsAreaRef = oSPC.$().find(".sapMSinglePCColumns");

		// Assert
		assert.strictEqual($oAppointmentsAreaRef.attr("role"), "grid", "Appointments area has correct ARIA role");
		assert.ok($oAppointmentsAreaRef.attr("aria-labelledby").indexOf(sAppointmentsAreaLabelId) > -1,
			"Appointments area has appropriate hidden label");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Appointment ARIA", async function (assert) {
		// Prepare
		var oCalendarStartDate = UI5Date.getInstance(2018, 11, 24),
			oAppointment = new CalendarAppointment({
				title: "Appointment",
				startDate: UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0),
				selected: false
			}),
			oBlocker = new CalendarAppointment({
				title: "Blocker",
				startDate: UI5Date.getInstance(2018, 11, 24, 0, 0, 0),
				endDate: UI5Date.getInstance(2018, 11, 25, 0, 0, 0),
				selected: true
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oCalendarStartDate,
				appointments: [oAppointment, oBlocker]
			}),
			sAppointmentLabelId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT"),
			$oAppointmentRef,
			$oAppointmentsWrapperRef,
			sHiddenSelectedTextId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oAppointmentRef = oAppointment.$();
		$oAppointmentsWrapperRef = oSPC.$().find(".sapMSinglePCAppointments");

		// Assert
		assert.strictEqual($oAppointmentsWrapperRef.attr("role"), "list", "Appointments wrapper has correct ARIA role list");
		assert.strictEqual($oAppointmentRef.attr("role"), "listitem", "Appointments have correct ARIA role");
		assert.ok($oAppointmentRef.attr("aria-labelledby").indexOf(sHiddenSelectedTextId) === -1, "Non-selected appointments don't have a hidden \"Selected\" text in aria-labelledby");
		assert.ok($oAppointmentRef.attr("aria-labelledby").indexOf(sAppointmentLabelId) > -1,
				"Appointments have an appropriate hidden label");

		// Act
		oSPC.getAggregation("_grid")._toggleAppointmentSelection(oAppointment, true);
		await nextUIUpdate();

		// Assert
		assert.ok($oAppointmentRef.attr("aria-labelledby").indexOf(sHiddenSelectedTextId) > -1, "Selected appointments have a hidden \"Selected\" text in aria-labelledby");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("Blocker ARIA", async function (assert) {
		// Prepare
		var oCalendarStartDate = UI5Date.getInstance(2018, 11, 24),
			oAppointment = new CalendarAppointment({
				title: "Appointment",
				startDate: UI5Date.getInstance(2018, 11, 24, 15, 30, 0),
				endDate: UI5Date.getInstance(2018, 11, 24, 16, 30, 0),
				selected: true
			}),
			oBlocker = new CalendarAppointment({
				title: "Blocker",
				startDate: UI5Date.getInstance(2018, 11, 24, 0, 0, 0),
				endDate: UI5Date.getInstance(2018, 11, 25, 0, 0, 0),
				selected: false
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: oCalendarStartDate,
				appointments: [oAppointment, oBlocker]
			}),
			sBlockerLabelId = InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_ALL_DAY_PREFIX"),
			$oBlockerRef,
			sHiddenSelectedTextId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		$oBlockerRef = oBlocker.$();

		// Assert
		assert.strictEqual($oBlockerRef.attr("role"), "listitem", "Blockers have correct ARIA role");
		assert.ok($oBlockerRef.attr("aria-labelledby").indexOf(sHiddenSelectedTextId) === -1, "Non-selected blocker don't have a hidden \"Selected\" text in aria-labelledby");
		assert.ok($oBlockerRef.attr("aria-labelledby").indexOf(sBlockerLabelId) > -1,
			"Blockers have an appropriate hidden label");

		// Act
		oSPC.getAggregation("_grid")._toggleAppointmentSelection(oBlocker, true);
		await nextUIUpdate();

		// Assert
		assert.ok($oBlockerRef.attr("aria-labelledby").indexOf(sHiddenSelectedTextId) > -1, "Selected blocker have a hidden \"Selected\" text in aria-labelledby");

		// Clean up
		oSPC.destroy();
	});

	QUnit.module("Misc");

	QUnit.test("isAllDayAppointment", function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			oGrid = oSPC.getAggregation("_grid"),
			aDates = [
				UI5Date.getInstance(2017, 1, 1, 0, 0, 0),
				UI5Date.getInstance(2017, 1, 1, 15, 0, 0),
				UI5Date.getInstance(2017, 1, 2, 0, 0, 0)
			];

		// Assert
		assert.ok(oGrid.isAllDayAppointment(aDates[0], aDates[2]), "The appointment is an all day event");
		assert.notOk(oGrid.isAllDayAppointment(aDates[0], aDates[1]), "The appointment isn't an all day event");
		assert.notOk(oGrid.isAllDayAppointment(aDates[1], aDates[0]), "The appointment isn't an all day event");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("isAllDayAppointment: daylight saving time is between start and end date of a full day appointment", function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			oGrid = oSPC.getAggregation("_grid"),
			startDate =  UI5Date.getInstance(2020, 9, 14),
			endDate = UI5Date.getInstance(2020, 9, 26);

		// Assert
		assert.equal(oGrid.isAllDayAppointment(startDate, endDate), true, "The appointment is full day");

		// Clean up
		oSPC.destroy();
	});

	QUnit.test("View Switch is dependent on the header", function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar(),
			oHeader = oSPC._getHeader(),
			oViewSwitch = oHeader._getOrCreateViewSwitch();

		// Assert
		assert.ok(oHeader.getAggregation("dependents").indexOf(oViewSwitch) !== -1, "The view switch is added as dependent");

		// Cleanup
		oSPC.destroy();
	});

	QUnit.test("Backward/Forward navigation in month view", async function (assert) {
		// Prepare
		var oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2023,11,31),
				views: [
					new SinglePlanningCalendarMonthView()
				]
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Act - simulate backward navigation
		oSPC._applyArrowsLogic(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSPC.getStartDate().toDateString(), UI5Date.getInstance(2023,10,30).toDateString(), "The calendar start date is correct after backward navigation");

		// Act - simulate again backward navigation
		oSPC._applyArrowsLogic(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSPC.getStartDate().toDateString(), UI5Date.getInstance(2023,9,30).toDateString(), "The calendar start date is correct after backward navigation");

		// Act - simulate forward navigation
		oSPC.setStartDate(UI5Date.getInstance(2023,11,31));
		oSPC._applyArrowsLogic();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSPC.getStartDate().toDateString(), UI5Date.getInstance(2024,0,31).toDateString(), "The calendar start date is correct after forward navigation");

		// Act - simulate again forward navigation
		oSPC._applyArrowsLogic();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSPC.getStartDate().toDateString(), UI5Date.getInstance(2024,1,29).toDateString(), "The calendar start date is correct after forward navigation");

		// Clean up
		oSPC.destroy();
	});

	QUnit.module("Visibility of actions toolbar", {
		beforeEach: async function () {
			this.oSPC = new SinglePlanningCalendar().placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oSPC.destroy();
		}
	});

	QUnit.test("The actions toolbar is not visible when there are no title, actions and views set", function (assert) {
		//assert
		assert.equal(this.oSPC._getHeader()._getActionsToolbar().getProperty("visible"), false, "the actions toolbar is not visible");
	});

	QUnit.test("The actions toolbar is visible when only title is set", async function (assert) {
		// Arrange
		this.oSPC.setTitle("SPC title");
		await nextUIUpdate();

		//assert
		assert.equal(this.oSPC._getHeader()._getActionsToolbar().getProperty("visible"), true, "the actions toolbar is visible");
	});

	QUnit.test("The actions toolbar is visible when actions are set", async function (assert) {
		// Arrange
		this.oSPC.addAction(new Button({
			text: "SPC button"
		}));
		await nextUIUpdate();

		//assert
		assert.equal(this.oSPC._getHeader()._getActionsToolbar().getProperty("visible"), true, "the actions toolbar is visible");
	});

	QUnit.test("The actions toolbar is not visible when only one view is set", async function (assert) {
		// Arrange
		this.oSPC.addView(new SinglePlanningCalendarDayView({
			key: "DayView",
			title: "Day View"
		}));
		await nextUIUpdate();

		//assert
		assert.equal(this.oSPC._getHeader()._getActionsToolbar().getProperty("visible"), false, "the actions toolbar is not visible");
	});

	QUnit.test("The actions toolbar is visible when more than one view is set", async function (assert) {
		// Arrange
		this.oSPC.addView(new SinglePlanningCalendarDayView({
			key: "DayView",
			title: "Day View"
		}));
		this.oSPC.addView(new SinglePlanningCalendarWeekView({
			key: "WeekView",
			title: "Week View"
		}));
		await nextUIUpdate();

		//assert
		assert.equal(this.oSPC._getHeader()._getActionsToolbar().getProperty("visible"), true, "the actions toolbar is visible");
	});

	QUnit.module("Resize Appointments", {
		beforeEach: async function() {
			this.oSPCGrid = new SinglePlanningCalendarGrid({
				startDate: UI5Date.getInstance(2017, 10, 13, 0, 0, 0)
			});
			this.oSPCGrid.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oSPCGrid.destroy();
			this.oSPCGrid = null;
		}
	});

	QUnit.test("_calcResizeNewHoursAppPos: Calculate new size of the appointment", function(assert) {
		// arrange
		var	oAppStartDate = UI5Date.getInstance(2017, 10, 13, 1, 0, 0),
			oAppEndDate = UI5Date.getInstance(2017, 10, 13, 2, 0, 0),
			newAppPos;

		// act - resize appointment's end to 5 o'clock (10 x 30 mins)
		newAppPos = this.oSPCGrid._calcResizeNewHoursAppPos(oAppStartDate, oAppEndDate, 9, true);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, UI5Date.getInstance(2017, 10, 13, 5, 0, 0), "End date hour is correct");

		// act - resize appointment's end to preceed the appointment's start
		newAppPos = this.oSPCGrid._calcResizeNewHoursAppPos(oAppStartDate, oAppEndDate, 0, true);

		// assert
		assert.deepEqual(newAppPos.startDate, UI5Date.getInstance(2017, 10, 13, 0, 0, 0), "Start date hout is correct");
		assert.deepEqual(newAppPos.endDate, oAppStartDate, "End date hour is correct");

		// act - resize appointment's start to 0:30
		newAppPos = this.oSPCGrid._calcResizeNewHoursAppPos(oAppStartDate, oAppEndDate, 1, false);

		// assert
		assert.deepEqual(newAppPos.startDate, UI5Date.getInstance(2017, 10, 13, 0, 30, 0), "Start date hour is correct");
		assert.deepEqual(newAppPos.endDate, oAppEndDate, "End date should not be changed");

		// act - resize appointment's start to go after the appointment's end
		newAppPos = this.oSPCGrid._calcResizeNewHoursAppPos(oAppStartDate, oAppEndDate, 4, false);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppEndDate, "Start date hout is correct");
		assert.deepEqual(newAppPos.endDate, UI5Date.getInstance(2017, 10, 13, 2, 30, 0), "End date hour is correct");
	});

	QUnit.test("_calcResizeNewHoursAppPos: Calculate new size of the appointment when 'startHour' and 'endHour' are set", async function(assert) {
		// prepare
		var	oAppStartDate = UI5Date.getInstance(2020, 4, 26, 8, 0, 0),
			oAppEndDate = UI5Date.getInstance(2020, 4, 26, 9, 0, 0),
			newAppPos;

		this.oSPCGrid.setFullDay(false);
		this.oSPCGrid.setStartHour(8);
		this.oSPCGrid.setEndHour(16);
		this.oSPCGrid.setStartDate(UI5Date.getInstance(2020, 4, 26, 0, 0, 0));
		await nextUIUpdate();

		// act - resize appointment's end to 10:00
		newAppPos = this.oSPCGrid._calcResizeNewHoursAppPos(oAppStartDate, oAppEndDate, 3, true);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, UI5Date.getInstance(2020, 4, 26, 10, 0, 0), "End date hour is correct");
	});

	QUnit.test("check appointment parts after appointment resize in more than 1 day", async function(assert) {
		// prepare
		var	sAppointmentId = "MyAppointment",
			oAppointment = new CalendarAppointment(sAppointmentId, { // appointment is placed in one day
				title: "Appointment",
				text: "new appointment",
				type: "Type01",
				startDate: UI5Date.getInstance(2018, 6, 9, 9, 0, 0),
				endDate: UI5Date.getInstance(2018, 6, 9, 10, 0, 0)
			}),
			oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2018, 6, 8),
				enableAppointmentsResize: true,
				appointments: [
					oAppointment
				]
			}),
			oSelector;

		oSPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		oSelector = document.querySelectorAll('div[id^="' + sAppointmentId + '-"]');
		assert.strictEqual(oSelector.length, 1, "There is only one appointment part displayed");
		assert.strictEqual(oSelector[0].querySelectorAll("span.sapMSinglePCAppResizeHandleTop").length, 1, "The appointment is resizable from the top");
		assert.strictEqual(oSelector[0].querySelectorAll("span.sapMSinglePCAppResizeHandleBottom").length, 1, "The appointment is resizable from the bottom");

		// act - resize appointment to continue in two days
		oAppointment.setEndDate(UI5Date.getInstance(2018, 6, 10, 10, 0, 0));
		await nextUIUpdate();

		// assert
		oSelector = document.querySelectorAll('div[id^="' + sAppointmentId + '-"]');
		assert.strictEqual(oSelector.length, 2, "There are two appointment parts displayed");
		assert.strictEqual(oSelector[0].querySelectorAll("span.sapMSinglePCAppResizeHandleTop").length, 1, "The appointment part 1 is resizable from the top");
		assert.strictEqual(oSelector[0].querySelectorAll("span.sapMSinglePCAppResizeHandleBottom").length, 0, "The appointment part 1 is not resizable from the bottom");
		assert.strictEqual(oSelector[1].querySelectorAll("span.sapMSinglePCAppResizeHandleTop").length, 0, "The appointment part 2 is not resizable from the top");
		assert.strictEqual(oSelector[1].querySelectorAll("span.sapMSinglePCAppResizeHandleBottom").length, 1, "The appointment part 2 is resizable from the bottom");

		oAppointment.destroy();
		oAppointment = null;
		oSPC.destroy();
		oSPC = null;

	});

	QUnit.module("Helper private methods", {
		beforeEach: function() {
			this.oSPC = new SinglePlanningCalendar({
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					}),
					new SinglePlanningCalendarDayView({
						key: "MonthView",
						title: "Month View"
					})
				]
			});
		},
		afterEach: function() {
			this.oSPC.removeAllViews();
			this.oSPC = null;
		}
	});

	QUnit.test("_getViewByID: Return the view with matching ID, or null if there is no match", function(assert) {

		var oView;

		// Act: try to find a view with "view0" id
		oView = this.oSPC._getViewById(this.oSPC.getViews()[0].getId());

		// assert
		assert.deepEqual(this.oSPC.getViews()[0], oView, "Returned View is correct");

		// Act: try to find a view with "view1" key
		oView = this.oSPC._getViewById(this.oSPC.getViews()[1].getId());

		// assert
		assert.deepEqual(this.oSPC.getViews()[1], oView, "Returned View is correct");

		// Act: try to find a view with "WeekView" key
		oView = this.oSPC._getViewById("myNonExistingId");

		// assert
		assert.equal(oView, null, "View with id 'myNonExistingId' is missing, null is returned");
	});

	QUnit.module("Behaviour in different timezone configurations", {
		beforeEach: async function () {
			var oAppointment = new CalendarAppointment({
				title: "Appointment",
				text: "new appointment",
				type: "Type01",
				icon: "../ui/unified/images/m_01.png",
				color: "#FF0000",
				startDate: UI5Date.getInstance(2022, 11, 24, 14, 30, 0),
				endDate: UI5Date.getInstance(2022, 11, 24, 15, 30, 0)
			});
			this.oSPC = new SinglePlanningCalendar( {
				views: [
					new SinglePlanningCalendarDayView({
						key: "DayView",
						title: "Day View"
					})
				],
				appointments : [
					oAppointment
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oSPC.destroy();
		}
	});

	QUnit.test("Check the view start hour", async function(assert) {
		assert.strictEqual(this.oSPC.getAggregation("_grid")._getVisibleStartHour(), 0, "The daily view has a consistent start hour");

		var sPrevTimezone = Localization.getTimezone();

		Localization.setTimezone("Asia/Tokyo");
		await nextUIUpdate();

		assert.strictEqual(this.oSPC.getAggregation("_grid")._getVisibleStartHour(), 0, "The daily view has a consistent start hour");

		Localization.setTimezone(sPrevTimezone);
	});

	QUnit.test("Check the appointments start and end dates", function(assert) {
		var oStartDate = UI5Date.getInstance(2022, 11, 24, 14, 30, 0);
		var oEndDate = UI5Date.getInstance(2022, 11, 24, 15, 30, 0);

		// TODO Timezone Configuration: Configuration#setTimezone currently does not change the
		//	timezone configuration. Therefore disabling the following code until #setTimezone functionality is restored.
		// var sPrevTimezone = oCore.getConfiguration().getTimezone();
		// var iTimezoneOffset = oStartDate.getTimezoneOffset();
		// var iTokyoOffsetMinutes = 9 * 60 + iTimezoneOffset;

		assert.strictEqual(this.oSPC.getAggregation("appointments")[0].getStartDate().toString(), oStartDate.toString(), "The appointment StartDate changes accordingly");
		assert.strictEqual(this.oSPC.getAggregation("appointments")[0].getEndDate().toString(), oEndDate.toString(), "The appointment EndDate changes accordingly");

		/*
			TODO Timezone Configuration: Configuration#setTimezone currently does not change the
			timezone configuration. Therefore disabling the following asserts until #setTimezone functionality is restored.

		oCore.getConfiguration().setTimezone("Asia/Tokyo");
		await nextUIUpdate();

		var oTokyoStartDate = UI5Date.getInstance(2022, 11, 24, 14, 30 + iTokyoOffsetMinutes, 0);
		var oTokyoEndDate = UI5Date.getInstance(2022, 11, 24, 15, 30 + iTokyoOffsetMinutes, 0);
		assert.strictEqual(this.oSPC.getAggregation("appointments")[0]._getStartDateWithTimezoneAdaptation().toString(), oTokyoStartDate.toString(), "The appointment StartDate changes accordingly");
		assert.strictEqual(this.oSPC.getAggregation("appointments")[0]._getEndDateWithTimezoneAdaptation().toString(), oTokyoEndDate.toString(), "The appointment EndDate changes accordingly");

		oCore.getConfiguration().setTimezone(sPrevTimezone);
		*/
	});

	QUnit.module("Appointments with custom content", {
		beforeEach: async function () {
			var oApp = new CalendarAppointment("AppCustCont", {
					startDate: UI5Date.getInstance(2015, 0, 2, 8, 0),
					endDate: UI5Date.getInstance(2015, 0, 2, 10, 0),
					icon: "sap-icon://add-product",
					title: "Appointment Default Title",
					text: "Appointment Default Text",
					customContent: [
						new Icon({
							src: "sap-icon://add-employee"
						})
					]
				});
			this.oSPC = new SinglePlanningCalendar({
				startDate: UI5Date.getInstance(2015, 0, 2, 8, 0),
				appointments: [oApp]
			}).placeAt("qunit-fixture");
		await nextUIUpdate();
		},
		afterEach: function () {
			this.oSPC.destroy();
		}
	});

	QUnit.test('Appointment with custom content has correct output in the DOM', function(assert) {
		var oApp = this.oSPC.getAppointments()[0],
			oAppDomRef = oApp.getDomRef(),
			oAppId = oAppDomRef.getAttribute("id");

		// Assert
		assert.ok(oAppDomRef.querySelector(".sapUiIcon"), "There is icon rendered in the appointment DOM");
		assert.strictEqual(oAppDomRef.querySelector(".sapUiIcon").getAttribute("aria-label"), "add-employee",
							"The icpn that is rendered is the same as one added to the customContent aggregation");
		assert.notOk(oAppDomRef.querySelector("#" + oAppId + "-Title"), "There is no title rendered in the appointment DOM");
		assert.notOk(oAppDomRef.querySelector("#" + oAppId + "-Text"), "There is no text rendered in the appointment DOM");
	});

	QUnit.test('Appointment with custom content has correct ACC output in the DOM', function(assert) {
		var oApp = this.oSPC.getAppointments()[0],
			oAppDomRef = oApp.getDomRef(),
			// With CLDR 42 (latest version) the regular space before AM/PM (Charcode 32) was replaced with the Charcode 8239
			sCLDRSpace = String.fromCharCode(8239);

		// Assert
		assert.strictEqual(oAppDomRef.querySelector("#" + oAppDomRef.getAttribute("id") + "-Descr").textContent,
							"From Friday, January 2, 2015 at 8:00:00" + sCLDRSpace +
							"AM To Friday, January 2, 2015 at 10:00:00" + sCLDRSpace + "AM, Type01",
							"Start and end date are included as description");
	});

});
