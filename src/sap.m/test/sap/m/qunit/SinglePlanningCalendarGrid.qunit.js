/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/Formatting",
	"sap/ui/thirdparty/jquery",
	"sap/m/ResponsivePopover",
	"sap/m/SinglePlanningCalendarGrid",
	"sap/m/SinglePlanningCalendarGridRenderer",
	"sap/m/library",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/events/KeyCodes",
	'sap/ui/unified/calendar/CalendarDate',
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	qutils,
	Formatting,
	jQuery,
	ResponsivePopover,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarGridRenderer,
	mobileLibrary,
	CalendarAppointment,
	KeyCodes,
	CalendarDate,
	UI5Date,
	DateTypeRange,
	nextUIUpdate
) {
	"use strict";

	var PlacementType = mobileLibrary.PlacementType;
	var SinglePlanningCalendarSelectionMode = mobileLibrary.SinglePlanningCalendarSelectionMode;

	QUnit.module("Other");

	QUnit.test("updateNowMarkerPosition and text is called on after rendering", function (assert) {
		// Arrange
		var oSPCGrid = new SinglePlanningCalendarGrid(),
			oUpdateRowHeaderAndNowMarkerSpy = this.spy(oSPCGrid, "_updateRowHeaderAndNowMarker");

		// Act
		oSPCGrid.onAfterRendering();

		// Assert
		assert.equal(oUpdateRowHeaderAndNowMarkerSpy.callCount, 1, "_updateRowHeaderAndNowMarker is called once onAfterRendering");

		// Cleanup
		oUpdateRowHeaderAndNowMarkerSpy.restore();
		oSPCGrid.destroy();
	});

	QUnit.test("_calculateVisibleBlockers", function(assert) {
		// prepare
		var aFullDayApps = [
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 7),
					endDate: UI5Date.getInstance(2018, 6, 8)
				}),
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 8),
					endDate: UI5Date.getInstance(2018, 6, 9)
				}),
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 6),
					endDate: UI5Date.getInstance(2018, 6, 9)
				}),
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 7),
					endDate: UI5Date.getInstance(2018, 6, 7)
				}),
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 8),
					endDate: UI5Date.getInstance(2018, 6, 8)
				}),
				new CalendarAppointment({
					startDate: UI5Date.getInstance(2018, 6, 9),
					endDate: UI5Date.getInstance(2018, 6, 9)
				})
			],
			oStartDate = UI5Date.getInstance(2018, 6, 8),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: oStartDate,
				appointments: aFullDayApps
			}),
			oAppointmentsMap = oGrid._createAppointmentsMap(oGrid.getAppointments()),
			aVisibleBlockers;

		// act
		oGrid._setColumns(1);
		aVisibleBlockers = oGrid._calculateVisibleBlockers(oAppointmentsMap.blockers, CalendarDate.fromLocalJSDate(oStartDate), oGrid._getColumns());

		// assert
		assert.equal(aVisibleBlockers.length, 4, "Visible full day appointments are correct count");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("_getLineClamp", function (assert) {
		// Arrange
		var SPCRenderer = SinglePlanningCalendarGridRenderer,
			oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0"),
			oAppEndDate = UI5Date.getInstance("2018", "6", "9", "9", "20"),
			sLineClamp;

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "1", "One line of appointment text will be shown");

		//Arrange
		// Set appointment duration to 1 hour
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "10", "0");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "2", "Two lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 1 hour and 20 minutes
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "10", "20");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "3", "Three lines of appointment text will be shown");


		//Arrange
		// Set appointment duration to 1 hour 40 minutes
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "10", "40");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "4", "Four lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2 hours
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "11", "00");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "5", "Five lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2.15 hours
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "11", "15");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "6", "Six lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2.30 hours
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "11", "30");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "7", "Seven lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 3 hours
		oAppStartDate = UI5Date.getInstance("2018", "6", "9", "9", "0");
		oAppEndDate = UI5Date.getInstance("2018", "6", "9", "12", "00");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "8", "Eight lines of appointment text will be shown");
	});

	QUnit.test("_getCellStartEndInfo start/end format for 12-hour clocks", async function (assert) {
		// Prepare
		Formatting.setLanguageTag("en-US");

		var oGrid = new SinglePlanningCalendarGrid(),
			oMockStardDate = UI5Date.getInstance(2019, 7, 5, 10),
			oMockEndDate = UI5Date.getInstance(2019, 7, 5, 15),
			// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
			sExpectedInfo = oGrid._oUnifiedRB.getText("CALENDAR_START_TIME") + ": Monday, August 5, 2019 at 10:00:00\u202fAM, " +
				oGrid._oUnifiedRB.getText("CALENDAR_END_TIME") + ": Monday, August 5, 2019 at 3:00:00\u202fPM";

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oGrid._getCellStartEndInfo(oMockStardDate, oMockEndDate), sExpectedInfo, "Cell's start/end info is properly formatted");

		// Destroy
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_getCellStartEndInfo start/end format for 24-hour clocks", async function (assert) {
		// Prepare
		Formatting.setLanguageTag("en-GB");

		var oGrid = new SinglePlanningCalendarGrid(),
			oMockStardDate = UI5Date.getInstance(2019, 7, 5, 10),
			oMockEndDate = UI5Date.getInstance(2019, 7, 5, 15),
			sExpectedInfo = oGrid._oUnifiedRB.getText("CALENDAR_START_TIME") + ": Monday, August 5, 2019 at 10:00:00, " +
				oGrid._oUnifiedRB.getText("CALENDAR_END_TIME") + ": Monday, August 5, 2019 at 15:00:00";

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oGrid._getCellStartEndInfo(oMockStardDate, oMockEndDate), sExpectedInfo, "Cell's start/end info is properly formatted");

		// Destroy
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("applyFocusInfo", async function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 14, 5),
				endDate: UI5Date.getInstance(2018, 6, 14, 6),
				selected: false
			}),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: UI5Date.getInstance(2018, 6, 8),
				appointments: [oAppointment]
			}),
			oPopover = new ResponsivePopover({
				placement: PlacementType.Auto
			}),
			fnApplyFocusInfoSpy = this.spy(oGrid, "applyFocusInfo");

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// act
		oAppointment.getDomRef().focus();
		oGrid._toggleAppointmentSelection(oAppointment, true);
		oPopover.openBy(oAppointment);
		this.clock.tick(500);

		// assert
		assert.ok(oPopover.isOpen(), "The popover is opened");
		assert.strictEqual(oPopover.getDomRef().id, document.activeElement.id, "The popover is the active DOM element");

		// act
		oPopover.close();
		this.clock.tick(500);

		// assert
		assert.ok(fnApplyFocusInfoSpy.calledOnce, "applyFocusInfo was called");
		assert.strictEqual(oAppointment.getDomRef().id, document.activeElement.id, "Focus is back on the appointment");

		// cleanup
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_getVisibleStartHour returns the proper start hour", function (assert) {
		// Prepare
		var oGrid = new SinglePlanningCalendarGrid();

		// Assert
		assert.strictEqual(oGrid._getVisibleStartHour(), 0, "Correct when there is no value set to the startHour property and fullDay is set to true");

		// Act
		oGrid.setFullDay(false);

		// Assert
		assert.strictEqual(oGrid._getVisibleStartHour(), 0, "Correct when there is no value set to the startHour property and fullDay is set to false");

		// Act
		oGrid.setStartHour(8);

		// Assert
		assert.strictEqual(oGrid._getVisibleStartHour(), 8, "Correct when there is a value set to the startHour property and fullDay is set to false");

		// Act
		oGrid.setFullDay(true);

		// Assert
		assert.strictEqual(oGrid._getVisibleStartHour(), 0, "Correct when there is a value set to the startHour property and fullDay is set to true");

		// Destroy
		oGrid.destroy();
	});

	QUnit.test("_getVisibleEndHour returns the proper end hour", function (assert) {
		// Prepare
		var oGrid = new SinglePlanningCalendarGrid();

		// Assert
		assert.strictEqual(oGrid._getVisibleEndHour(), 23, "Correct when there is no value set to the endHour property and fullDay is set to true");

		// Act
		oGrid.setFullDay(false);

		// Assert
		assert.strictEqual(oGrid._getVisibleEndHour(), 23, "Correct when there is no value set to the endHour property and fullDay is set to false");

		// Act
		oGrid.setEndHour(20);

		// Assert
		assert.strictEqual(oGrid._getVisibleEndHour(), 19, "Correct when there is a value set to the endHour property and fullDay is set to false");

		// Act
		oGrid.setFullDay(true);

		// Assert
		assert.strictEqual(oGrid._getVisibleEndHour(), 23, "Correct when there is a value set to the endHour property and fullDay is set to true");

		// Destroy
		oGrid.destroy();
	});

	QUnit.test("_isVisibleHour works correctly", function (assert) {
		// Prepare
		var oGrid = new SinglePlanningCalendarGrid();

		// Assert
		assert.strictEqual(oGrid._isVisibleHour(5), true, "valid hour and neither start nor end hour set");
		assert.strictEqual(oGrid._isVisibleHour(25), false, "invalid hour passed");

		// Prepare
		oGrid.setStartHour(8);

		// Assert
		assert.strictEqual(oGrid._isVisibleHour(5), false, "start hour set, the passed value is outside visible range");
		assert.strictEqual(oGrid._isVisibleHour(8), true, "start hour set, the passed value is the same as the start hour");
		assert.strictEqual(oGrid._isVisibleHour(20), true, "start hour set, the passed value is inside visible range");

		// Prepare
		oGrid.setEndHour(20);

		// Assert
		assert.strictEqual(oGrid._isVisibleHour(5), false, "start and end hour set, the passed value is outside visible range");
		assert.strictEqual(oGrid._isVisibleHour(8), true, "start and end hour set, the passed value is the same as the start hour");
		assert.strictEqual(oGrid._isVisibleHour(12), true, "start and end hour set, the passed value is inside visible range");
		assert.strictEqual(oGrid._isVisibleHour(20), false, "start and end hour set, the passed value is the same as the end hour");
		assert.strictEqual(oGrid._isVisibleHour(21), false, "start and end hour set, the passed value is outside visible range");

		// Prepare
		oGrid.setStartHour(21);
		oGrid.setEndHour(11);

		// Assert
		assert.strictEqual(oGrid._isVisibleHour(0), true, "start hours and end hour in next day set, the passed value is inside visible range");
		assert.strictEqual(oGrid._isVisibleHour(21), true, "start hours and end hour in next day set, the passed value is the same as the start hour");
		assert.strictEqual(oGrid._isVisibleHour(11), false, "start hours and end hour in next day set, the passed value is the same as the end hour");
		assert.strictEqual(oGrid._isVisibleHour(16), false, "start hours and end hour in next day set, the passed value is outside visible range");

		// Destroy
		oGrid.destroy();
	});

	QUnit.test("_findSrcControl", async function(assert) {
		// Prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2022,0,20),
				endDate: UI5Date.getInstance(2022,11,31)
			}),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: UI5Date.getInstance(2022,0,25),
				appointments: [oAppointment]
			}),
			oFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		oGrid.onmouseup({
			target: {
				parentElement: oAppointment.getDomRef(),
				classList: {
					contains: function() {
						return false;
					}
				}
			}
		});

		// Assert
		assert.ok(oFireAppointmentSelectSpy.calledOnce, "AppointmentSelect event is fired");

		// Destroy
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Formatters pattern is correct", function (assert) {
		// Prepare
		var oGrid = new SinglePlanningCalendarGrid();

		assert.strictEqual(oGrid._oFormatStartEndInfoAria.oFormatOptions.pattern.indexOf("EEEE, MMMM d, yyyy"), 0, "Start End Aria info pattern is correct (contains 'yyyy' instead of 'YYYY'");
		assert.strictEqual(oGrid._oFormatAriaFullDayCell.oFormatOptions.pattern.indexOf("EEEE, MMMM d, yyyy"), 0, "Full day cell Aria info pattern is correct (contains 'yyyy' instead of 'YYYY'");
		assert.strictEqual(oGrid._getDateFormatter().oFormatOptions.pattern, "yyyyMMdd-HHmm", "Grid cell pattern is correct (contains 'yyyy' instead of 'YYYY'");

	});

	QUnit.test("Non working days helper method", function(assert) {
		// Prepare
		var oNonWorking = UI5Date.getInstance(2018, 6, 2),
			oWeekend = UI5Date.getInstance(2018, 6, 7),
			oWorkingWeekend = UI5Date.getInstance(2018, 6, 14),
			oGrid = new SinglePlanningCalendarGrid({
			specialDates: [
				new DateTypeRange({ type: "NonWorking", startDate: oNonWorking }),
				new DateTypeRange({ type: "Working", startDate: oWorkingWeekend })
			]
		});

		// assert
		assert.ok(oGrid._isNonWorkingDay(CalendarDate.fromLocalJSDate(oNonWorking)), "02.06.2018 is a non working day");
		assert.ok(oGrid._isNonWorkingDay(CalendarDate.fromLocalJSDate(oWeekend)), "07.06.2018 is a non working weekend day");
		assert.notOk(oGrid._isNonWorkingDay(CalendarDate.fromLocalJSDate(oWorkingWeekend)), "14.06.2018 is a non working weekend day");
	});

	QUnit.test("Non working days helper method - get first special date", function(assert) {
		// Prepare
		var oNonWorking = UI5Date.getInstance(2018, 6, 2),
			oWorkingWeekend = UI5Date.getInstance(2018, 6, 1),
			oGrid = new SinglePlanningCalendarGrid({
			specialDates: [
				new DateTypeRange({ type: "NonWorking", startDate: oNonWorking }),
				new DateTypeRange({ type: "Working", startDate: oNonWorking }),
				new DateTypeRange({ type: "Working", startDate: oWorkingWeekend }),
				new DateTypeRange({ type: "NonWorking", startDate: oWorkingWeekend })
			]
		});

		// assert
		assert.ok(oGrid._isNonWorkingDay(CalendarDate.fromLocalJSDate(oNonWorking)), "02.06.2018 is a non working day");
		assert.notOk(oGrid._isNonWorkingDay(CalendarDate.fromLocalJSDate(oWorkingWeekend)), "01.06.2018 is working day");
	});

	QUnit.test("CalendarAppointment's getDomRef() returns proper DOM element", async function(assert) {
		// Prepare
		var aAppointments = [
				new CalendarAppointment("SPC-app-111", {
					startDate: UI5Date.getInstance(2023, 9, 16, 9, 0),
					endDate: UI5Date.getInstance(2023, 9, 16, 9, 30)
				}),
				new CalendarAppointment("SPC-app-11", {
					startDate: UI5Date.getInstance(2023, 9, 16, 9, 0),
					endDate: UI5Date.getInstance(2023, 9, 16, 9, 30)
				}),
				new CalendarAppointment("SPC-app-10", {
					startDate: UI5Date.getInstance(2023, 9, 16, 9, 0),
					endDate: UI5Date.getInstance(2023, 9, 16, 9, 30)
				}),
				new CalendarAppointment("SPC-app-1", {
					startDate: UI5Date.getInstance(2023, 9, 16, 9, 0),
					endDate: UI5Date.getInstance(2023, 9, 16, 9, 30)
				}),
				new CalendarAppointment("SPC-app-13", {
					startDate: UI5Date.getInstance(2023, 9, 16, 9, 0),
					endDate: UI5Date.getInstance(2023, 9, 16, 9, 30)
				})
			],
			oStartDate = UI5Date.getInstance(2023, 9, 16),
			oSPCGrid = new SinglePlanningCalendarGrid({
				startDate: oStartDate,
				appointments: aAppointments
			});

		// arrange
		oSPCGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(aAppointments[1].getDomRef().getAttribute("id"), "SPC-app-11-0_1", "The returned DOM reference of the appointment with index 1 is correct.");
		assert.strictEqual(aAppointments[3].getDomRef().getAttribute("id"), "SPC-app-1-0_3", "The returned DOM reference of the appointment with index 3 is correct.");

		// cleanup
		oSPCGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("selectedDates: single select via keyboard (Space)", async function (assert){
		// arrange
		var iCellIndexInMiddleInWeek = 3,
			oGrid = new SinglePlanningCalendarGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.SingleSelect
			});

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

		// act
		oGrid.$().find('.sapUiCalItem')[iCellIndexInMiddleInWeek].focus();

		qutils.triggerKeyup(document.activeElement, KeyCodes.SPACE, false);
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oGrid.$().find('.sapUiCalItem')[iCellIndexInMiddleInWeek].classList.contains("sapUiCalItemSel"), iCellIndexInMiddleInWeek + " cell is selected");

		//clean up
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("selectedDates: single select via keyboard (Enter)", async function (assert){
		// arrange
		var iCellIndexInMiddleInWeek = 3,
			oGrid = new SinglePlanningCalendarGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.SingleSelect
			});

		oGrid.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

		// act
		oGrid.$().find('.sapUiCalItem')[iCellIndexInMiddleInWeek].focus();

		qutils.triggerKeyup(document.activeElement, KeyCodes.ENTER, false);
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oGrid.$().find('.sapUiCalItem')[iCellIndexInMiddleInWeek].classList.contains("sapUiCalItemSel"), iCellIndexInMiddleInWeek + " cell is selected");

		//clean up
		oGrid.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("Events");

	QUnit.test("appointmentSelect: select a single appointment", function (assert) {
		var oAppointment = new CalendarAppointment(),
			oGrid = new SinglePlanningCalendarGrid({
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
			fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		//act
		oGrid.onmouseup(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
			appointment: oAppointment,
			appointments: [oAppointment],
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oGrid.destroy();
	});

	QUnit.test("appointmentSelect: deselect all appointments", function (assert) {
		var oGrid = new SinglePlanningCalendarGrid({
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
			fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		//act
		oGrid.onmouseup(oFakeEvent);

		//assert
		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
		assert.ok(fnFireAppointmentSelectSpy.calledWith({
			appointment: undefined,
			appointments: oGrid.getAggregation("appointments"),
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		//clean up
		oGrid.destroy();
	});

	QUnit.test("cellPress", function(assert) {
		// prepare
		var oGrid = new SinglePlanningCalendarGrid({
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
			fnFireGridCellFocusSpy = this.spy(oGrid, "fireEvent");

		// act
		oGrid._fireSelectionEvent(oFakeEvent);

		// assert
		assert.ok(fnFireGridCellFocusSpy.withArgs("cellPress").calledOnce, "Event was fired");
		assert.ok(fnFireGridCellFocusSpy.calledWithExactly("cellPress", {
			startDate: UI5Date.getInstance(2018, 6 , 8, 3),
			endDate: UI5Date.getInstance(2018, 6, 8, 4),
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("borderReached: when focus is on appointment and we are navigating in backward direction on week view", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 8, 5),
				endDate: UI5Date.getInstance(2018, 6, 8, 6),
				selected: true
			}),
			oGrid = new SinglePlanningCalendarGrid({
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
			fnFireBorderReachedSpy = this.spy(oGrid, "fireEvent"),
			fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		// act
		oGrid.onsapleft(oFakeEvent);

		// assert
		assert.ok(fnFireBorderReachedSpy.withArgs("borderReached").calledOnce, "Event was fired");
		assert.ok(fnFireBorderReachedSpy.calledWithExactly("borderReached", {
			startDate: UI5Date.getInstance(2018, 6, 8, 5),
			next: false,
			fullDay: false,
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "FireAppointmentSelect is called once");
		assert.notOk(oAppointment.getSelected(), "Appointment is deselected");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("borderReached: when focus is on appointment and we are navigating in forward direction on week view", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 14, 5),
				endDate: UI5Date.getInstance(2018, 6, 14, 6),
				selected: true
			}),
			oGrid = new SinglePlanningCalendarGrid({
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
			fnFireBorderReachedSpy = this.spy(oGrid, "fireEvent"),
			fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		// act
		oGrid.onsapright(oFakeEvent);

		// assert
		assert.ok(fnFireBorderReachedSpy.withArgs("borderReached").calledOnce, "Event was fired");
		assert.ok(fnFireBorderReachedSpy.calledWithExactly("borderReached", {
			startDate: UI5Date.getInstance(2018, 6, 14, 5),
			next: true,
			fullDay: false,
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		assert.ok(fnFireAppointmentSelectSpy.calledOnce, "fireAppointmentSelect is called");
		assert.notOk(oAppointment.getSelected(), "Appointment is deselected");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("borderReached: when focus is on grid cell and we are navigation in backward direction on week view", function(assert) {
		// prepare
		var oGrid = new SinglePlanningCalendarGrid({
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
			fnFireBorderReachedSpy = this.spy(oGrid, "fireEvent");

		// act
		oGrid.onsapleft(oFakeEvent);

		// assert
		assert.ok(fnFireBorderReachedSpy.withArgs("borderReached").calledOnce, "Event was fired");
		assert.ok(fnFireBorderReachedSpy.calledWithExactly("borderReached", {
			startDate: UI5Date.getInstance(2018, 6, 8, 3),
			next: false,
			fullDay: false,
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("borderReached: when focus is on grid cell and we are navigation in forward direction on week view", function(assert) {
		// prepare
		var oGrid = new SinglePlanningCalendarGrid({
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
			fnFireBorderReachedSpy = this.spy(oGrid, "fireEvent");

		// act
		oGrid.onsapright(oFakeEvent);

		// assert
		assert.ok(fnFireBorderReachedSpy.withArgs("borderReached").calledOnce, "Event was fired");
		assert.ok(fnFireBorderReachedSpy.calledWithExactly("borderReached", {
			startDate: UI5Date.getInstance(2018, 6, 14, 3),
			next: true,
			fullDay: false,
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oGrid.destroy();
	});
});
