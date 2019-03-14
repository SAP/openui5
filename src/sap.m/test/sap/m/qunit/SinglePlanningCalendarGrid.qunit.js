/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.global",
	"sap/m/SinglePlanningCalendarGrid",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	jQuery,
	SinglePlanningCalendarGrid,
	CalendarAppointment,
	KeyCodes
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

	QUnit.module("Events");

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
			fnRemoveAppSelectionSpy = this.spy(oGrid, "_removeAppointmentSelection");

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

		assert.ok(fnRemoveAppSelectionSpy.calledOnce, "_removeAppointmentSelection is called once");
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
			fnRemoveAppSelectionSpy = this.spy(oGrid, "_removeAppointmentSelection");

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

		assert.ok(fnRemoveAppSelectionSpy.calledOnce, "_removeAppointmentSelection is called");
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
