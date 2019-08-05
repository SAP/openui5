/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.global",
	"sap/m/SinglePlanningCalendarGrid",
	"sap/m/SinglePlanningCalendarGridRenderer",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/events/KeyCodes",
	'sap/ui/unified/calendar/CalendarDate'
], function(
	qutils,
	jQuery,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarGridRenderer,
	CalendarAppointment,
	KeyCodes,
	CalendarDate
) {
	"use strict";

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
					startDate: new Date(2018, 6, 7),
					endDate: new Date(2018, 6, 8)
				}),
				new CalendarAppointment({
					startDate: new Date(2018, 6, 8),
					endDate: new Date(2018, 6, 9)
				}),
				new CalendarAppointment({
					startDate: new Date(2018, 6, 6),
					endDate: new Date(2018, 6, 9)
				}),
				new CalendarAppointment({
					startDate: new Date(2018, 6, 7),
					endDate: new Date(2018, 6, 7)
				}),
				new CalendarAppointment({
					startDate: new Date(2018, 6, 8),
					endDate: new Date(2018, 6, 8)
				}),
				new CalendarAppointment({
					startDate: new Date(2018, 6, 9),
					endDate: new Date(2018, 6, 9)
				})
			],
			oStartDate = new Date(2018, 6, 8),
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
			oAppStartDate = new Date("2018", "6", "9", "9", "0"),
			oAppEndDate = new Date("2018", "6", "9", "9", "20"),
			sLineClamp;

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "1", "One line of appointment text will be shown");

		//Arrange
		// Set appointment duration to 1 hour
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "10", "0");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "2", "Two lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 1 hour and 20 minutes
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "10", "20");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "3", "Three lines of appointment text will be shown");


		//Arrange
		// Set appointment duration to 1 hour 40 minutes
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "10", "40");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "4", "Four lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2 hours
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "11", "00");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "5", "Five lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2.15 hours
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "11", "15");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "6", "Six lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 2.30 hours
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "11", "30");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "7", "Seven lines of appointment text will be shown");

		//Arrange
		// Set appointment duration to 3 hours
		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "12", "00");

		// Act
		sLineClamp = SPCRenderer._getLineClamp(oAppStartDate, oAppEndDate);

		// Assert
		assert.equal(sLineClamp, "8", "Eight lines of appointment text will be shown");
	});

	QUnit.test("_getCellStartEndInfo formats start/end info correctly", function (assert) {
		// Prepare
		var oGrid = new SinglePlanningCalendarGrid(),
			oMockStardDate = new Date(2019, 7, 5, 10),
			oMockEndDate = new Date(2019, 7, 5, 11),
			// Should be something like "Start Time: day-name DD/MM/YYYY at HH AM/PM; End Time: day-name DD/MM/YYYY at HH AM/PM"
			sExpectedInfo = oGrid._oUnifiedRB.getText("CALENDAR_START_TIME") + ": Monday 05/08/2019 at 10 AM; " +
				oGrid._oUnifiedRB.getText("CALENDAR_END_TIME") + ": Monday 05/08/2019 at 11 AM";

		oGrid.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oGrid._getCellStartEndInfo(oMockStardDate, oMockEndDate), sExpectedInfo, "Cell's start/end info is properly formatted");

		// Destroy
		oGrid.destroy();
	});

	QUnit.test("applyFocusInfo", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: new Date(2018, 6, 14, 5),
				endDate: new Date(2018, 6, 14, 6),
				selected: false
			}),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: new Date(2018, 6, 8),
				appointments: [oAppointment]
			}),
			oPopover = new sap.m.ResponsivePopover({
				placement: sap.m.PlacementType.Auto
			}),
			fnApplyFocusInfoSpy = this.spy(oGrid, "applyFocusInfo");

		oGrid.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oAppointment.getDomRef().focus();
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
		assert.ok(fnApplyFocusInfoSpy.calledWithExactly({
			preventScroll: true,
			id: oAppointment.getId()
		}), "applyFocusInfo was called with the correct parameters");
		assert.strictEqual(oAppointment.getDomRef().id, document.activeElement.id, "Focus is back on the appointment");

		// cleanup
		oGrid.destroy();
	});

	QUnit.module("Events");

	QUnit.test("appointmentSelect: select single appointment", function (assert) {
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
		oGrid.ontap(oFakeEvent);

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
						startDate: new Date(2018, 6, 8, 5),
						endDate: new Date(2018, 6, 8, 6),
						selected: true
					}),
					new CalendarAppointment({
						startDate: new Date(2018, 6, 9, 4),
						endDate: new Date(2018, 6, 10, 4),
						selected: true
					})
				]
			}),
			oFakeEvent = {
				target: {
					classList: {
						contains: function() {
							return true;
						}
					}
				}
			},
			fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

		//act
		oGrid.ontap(oFakeEvent);

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
				startDate: new Date(2018, 6, 8)
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
		oGrid.onkeydown(oFakeEvent);

		// assert
		assert.ok(fnFireGridCellFocusSpy.withArgs("cellPress").calledOnce, "Event was fired");
		assert.ok(fnFireGridCellFocusSpy.calledWithExactly("cellPress", {
			startDate: new Date(2018, 6 , 8, 3),
			endDate: new Date(2018, 6, 8, 4),
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oGrid.destroy();
	});

	QUnit.test("borderReached: when focus is on appointment and we are navigating in backward direction on week view", function(assert) {
		// prepare
		var oAppointment = new CalendarAppointment({
				startDate: new Date(2018, 6, 8, 5),
				endDate: new Date(2018, 6, 8, 6),
				selected: true
			}),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: new Date(2018, 6, 8),
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
			startDate: new Date(2018, 6, 8, 5),
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
				startDate: new Date(2018, 6, 14, 5),
				endDate: new Date(2018, 6, 14, 6),
				selected: true
			}),
			oGrid = new SinglePlanningCalendarGrid({
				startDate: new Date(2018, 6, 8),
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
			startDate: new Date(2018, 6, 14, 5),
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
				startDate: new Date(2018, 6, 8)
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
			startDate: new Date(2018, 6, 8, 3),
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
				startDate: new Date(2018, 6, 8)
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
			startDate: new Date(2018, 6, 14, 3),
			next: true,
			fullDay: false,
			id: oGrid.getId()
		}), "Event was fired with the correct parameters");

		// cleanup
		oGrid.destroy();
	});
});
