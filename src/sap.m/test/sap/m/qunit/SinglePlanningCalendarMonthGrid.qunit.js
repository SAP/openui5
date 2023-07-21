/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/m/SinglePlanningCalendarMonthGrid",
	"sap/ui/unified/CalendarAppointment",
	"sap/m/library",
	'sap/ui/unified/DateTypeRange',
	'sap/ui/unified/library',
	"sap/ui/core/Core",
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/events/KeyCodes",
	"sap/m/LinkAccessibleRole"
], function(
	qutils,
	SinglePlanningCalendar,
	SinglePlanningCalendarMonthView,
	SinglePlanningCalendarMonthGrid,
	CalendarAppointment,
	mobileLibrary,
	DateTypeRange,
	unifiedLibrary,
	oCore,
	UI5Date,
	DateRange,
	CalendarDate,
	KeyCodes,
	LinkAccessibleRole
) {
		"use strict";

		var CalendarDayType = unifiedLibrary.CalendarDayType;
		var SinglePlanningCalendarSelectionMode = mobileLibrary.SinglePlanningCalendarSelectionMode;

		var o2Aug2018_00_00 = UI5Date.getInstance(2018, 7, 2);
		var o2Aug2018_18_00 = UI5Date.getInstance(2018, 7, 2, 18, 0, 0);
		var o3Aug2018_00_00 = UI5Date.getInstance(2018, 7, 3);
		var o3Aug2018_18_00 = UI5Date.getInstance(2018, 7, 3, 18, 0, 0);
		var o5Aug2018_00_00 = UI5Date.getInstance(2018, 7, 5);
		var i30Jul2018_00_00_UTC_Timestamp = 1532908800000;
		var i9Sep2018_00_00_UTC_Timestamp = 1536451200000;
		var i2Aug2018_00_00_UTC_Timestamp = 1533168000000;

		QUnit.module("More links", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					appointments: [
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({ // Long appointment in overflow
							startDate: o2Aug2018_00_00,
							endDate: o5Aug2018_00_00
						}),
						new CalendarAppointment({
							startDate: o3Aug2018_00_00,
							endDate: o3Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o3Aug2018_00_00,
							endDate: o3Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o3Aug2018_00_00,
							endDate: o3Aug2018_18_00
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function () {
				this.oSPC.destroy();
			}
		});

		QUnit.test("more link creation", function(assert) {
			var oLink = this.oSPC._aLinks[3];

			// assert
			assert.ok(oLink, "there is something");
			assert.ok(oLink.isA("sap.m.Link"), "it's a link");
			assert.equal(oLink.getText().toLowerCase(), "3 more", "it's text is correct");
		});

		QUnit.test("more link shows correct value for multi-day appointments", function(assert) {
			var oLinkDay3 = this.oSPC._aLinks[4],
				oLinkDay5 = this.oSPC._aLinks[6];

			// assert
			assert.equal(oLinkDay3.getText().toLowerCase(), "2 more", "it's text is correct on the next day");
			assert.equal(oLinkDay5.getText().toLowerCase(), "1 more", "it's text is correct on the last day");

		});

		QUnit.test("more link custom data", function(assert) {
			var oLink = this.oSPC._aLinks[3];

			// assert
			assert.equal(oLink.getCustomData().length, 1, "it has some data attached");
			assert.equal(oLink.getCustomData()[0].getKey(), "date", "the data's key is correct");
			assert.equal(oLink.getCustomData()[0].getValue(), i2Aug2018_00_00_UTC_Timestamp, "the data's value is correct");
		});

		QUnit.test("moreLinkPress", function(assert) {
			var oMorePressSpy = this.spy(this.oSPC, "fireEvent"),
				oLink = this.oSPC._aLinks[3];

			// act
			oLink.firePress();

			// assert
			assert.strictEqual(oLink.getAccessibleRole(), LinkAccessibleRole.Button, "The link has proper accessible role");
			assert.ok(oMorePressSpy.calledOnce, "an event is fired");
			assert.ok(oMorePressSpy.calledWithMatch("moreLinkPress", { date: o2Aug2018_00_00 }), "its the right event + parameters");
		});

		QUnit.module("Grid days", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Days count", function(assert) {
			var aDays = this.oSPC._getVisibleDays(this.oSPC.getStartDate());

			// assert
			assert.equal(aDays.length, 42, "_getVisibleDays returns the correct number of days");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay").length, 42, "the grid has the right amount of cells");
		});

		QUnit.test("Correct dates", function(assert) {
			var aDays = this.oSPC._getVisibleDays(this.oSPC.getStartDate());

			// assert
			assert.equal(aDays[0].valueOf(), i30Jul2018_00_00_UTC_Timestamp, "the first day is correct");
			assert.equal(aDays[41].valueOf(), i9Sep2018_00_00_UTC_Timestamp, "the last day is correct");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay")[0].getAttribute("sap-ui-date"), i30Jul2018_00_00_UTC_Timestamp.toString(), "the first date is correct");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay")[41].getAttribute("sap-ui-date"), i9Sep2018_00_00_UTC_Timestamp.toString(), "the last date is correct");
		});

		QUnit.test("Special dates indicator", function(assert) {
			// arrange, act
			this.oSPC.addSpecialDate(new DateTypeRange({
				type: CalendarDayType.Type05,
				startDate: UI5Date.getInstance(2018, 6, 30)
			}));
			oCore.applyChanges();

			// assert
			assert.ok(this.oSPC.$().find(".sapMSPCMonthDay")[0]
				.classList.contains("sapUiCalendarSpecialDayType05"), "the cell is special");
		});

		QUnit.module("Appointments", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					appointments: [
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: UI5Date.getInstance(i30Jul2018_00_00_UTC_Timestamp),
							endDate: o2Aug2018_00_00
						}),
						new CalendarAppointment({
							startDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp),
							endDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp + 1000)
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Appointment nodes properties", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 4, "appointments are the right number");
			assert.ok(aAppointmentNodes[0].start, "appointments have start");
			assert.ok(aAppointmentNodes[0].end, "appointments have end");
			assert.ok(aAppointmentNodes[0].data, "appointments have data");
			assert.ok(aAppointmentNodes[0].width, "appointments have width");
			assert.ok(!isNaN(aAppointmentNodes[0].len), "appointments have len");
			assert.ok(!isNaN(aAppointmentNodes[0].level), "appointments have level");
		});

		QUnit.test("Appointment sorting", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp),
				endDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.ok(aAppointmentNodes[0].start.valueOf() <= aAppointmentNodes[1].start.valueOf(), "appointments are sorted");
			assert.ok(aAppointmentNodes[1].start.valueOf() <= aAppointmentNodes[2].start.valueOf(), "appointments are sorted");
			assert.ok(aAppointmentNodes[2].start.valueOf() <= aAppointmentNodes[3].start.valueOf(), "appointments are sorted");
		});

		QUnit.test("Appointment levels", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp),
				endDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.ok(aAppointmentNodes[1].level, 0, "same-day appointments have correct levels");
			assert.ok(aAppointmentNodes[2].level, 1, "same-day appointments have correct levels");
		});

		QUnit.test("Invalid appointments", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.destroyAppointments();
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 8, 10),
				endDate: UI5Date.getInstance(2018, 8, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 6, 28),
				endDate: UI5Date.getInstance(2018, 6, 29)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				endDate: o2Aug2018_00_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 0, "invalid appointments do not play");
		});

		QUnit.test("Appointments exceeding view port", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.destroyAppointments();
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 2, 10),
				endDate: UI5Date.getInstance(2018, 7, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 7, 10),
				endDate: UI5Date.getInstance(2018, 10, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: UI5Date.getInstance(2018, 2, 10),
				endDate: UI5Date.getInstance(2018, 10, 11)
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 3, "exceeding view port appointments are rendered");
		});

		QUnit.test("Large appointment representation in DOM with unique ID", function(assert) {
			// arrange
			this.oSPC.destroyAppointments();
			var oAppointment = new CalendarAppointment("appointment_from_01_to_22",{
				startDate: UI5Date.getInstance(2018, 2, 1),
				endDate: UI5Date.getInstance(2018, 7, 22)
				});

			// act
			this.oSPC.addAppointment(oAppointment);
			oCore.applyChanges();

			var oFakeEvent = {
				target: {
					parentElement: document.getElementById("appointment_from_01_to_22-0_0"),
					classList: {
						contains: function() {
							return false;
						}
					}
				}
			};
			this.oSPC._fireSelectionEvent(oFakeEvent);

			// assert
			assert.ok(oAppointment.getDomRef(), "appointment shuld have DOM representation");
			assert.equal(oAppointment, this.oSPC._findSrcControl(oFakeEvent), "the srcControl found must be the same as oAppointment");
			assert.ok(oAppointment._sAppointmentPartSuffix, "after calling the _findSrcControl method, the appointment must have a suffix");
		});

		QUnit.module("Other", {
			beforeEach: function() {
				this.oSPCMG = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPCMG.destroy();
			}
		});

		QUnit.test("Vertical labels", function(assert) {
			// act
			var sLabels = this.oSPCMG._getVerticalLabels();

			// assert
			assert.equal(sLabels.length, 6, "there are 6 labels");
			assert.equal(sLabels[0], "31", "first label is ok");
			assert.equal(sLabels[5], "36", "last label is ok");
		});

		QUnit.test("cellPress", function(assert) {
			// arrange
			var oCellPressSpy = this.spy(this.oSPCMG, "fireEvent");

			// act
			this.oSPCMG._fireSelectionEvent({ target: this.oSPCMG.$().find('.sapMSPCMonthDay')[3], srcControl: this.oSPCMG});

			// assert
			assert.ok(oCellPressSpy.callCount, 2, "two events are fired");
			assert.ok(oCellPressSpy.calledWithMatch("appointmentSelect", { appointment: undefined, appointments: [] }), "appointmentSelect is fired + parameters");
			assert.ok(oCellPressSpy.calledWithMatch("cellPress", { startDate: o2Aug2018_00_00, endDate: o3Aug2018_00_00 }), "cellPress is fired + parameters");
		});


		QUnit.test("selectedDates: select days", function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				enableMultiDaySelection: true
			});
			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			oGrid.ontap({ target: oGrid.$().find('.sapMSPCMonthDay')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "selectedDates is added");

			// act
			oGrid.ontap({ target: oGrid.$().find('.sapMSPCMonthDay')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "selectedDates is added");

			// act
			oGrid.setDateSelectionMode(SinglePlanningCalendarSelectionMode.SingleSelection);
			oGrid.ontap({ target: oGrid.$().find('.sapMSPCMonthDay')[3], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			sap.ui.getCore().applyChanges();

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: deselect days", function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				enableMultiDaySelection: true,
				selectedDates: [
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 13)})
				]
			});
			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "two days were initially added");

			// act
			oGrid.ontap({ target: oGrid.$().find('.sapMSPCMonthDay')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			sap.ui.getCore().applyChanges();

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "one day is removed");

			// act
			oGrid.ontap({ target: oGrid.$().find('.sapMSPCMonthDay')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			sap.ui.getCore().applyChanges();

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "selectedDates is empty");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week selection via keyboard shortcut", function (assert){
			// arrange
			var iCellIndexInMiddleInWeek = 3,
				iCellIndexEndWeek = 6,
				i,
				oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				enableMultiDaySelection: true,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
			});

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

			// act
			oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].focus();
			qutils.triggerKeyboardEvent(document.activeElement, KeyCodes.SPACE, true);
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 7, "seven days are correctly added");
			for (i = 0; i < iCellIndexEndWeek; i++) {
				assert.ok(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week deselection via keyboard shortcut", function (assert){
			// arrange
			var iCellIndexStartWeek = 14,
				iCellIndexInMiddleInWeek = iCellIndexStartWeek + 3,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				i,
				oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				enableMultiDaySelection: true,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect,
				selectedDates: [
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 9)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 11)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 12)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 13)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 14)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 15)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 16)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 17)})
				]
			});

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 9, "nine days were originally added");

			// act
			oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].focus();
			qutils.triggerKeyboardEvent(document.activeElement, KeyCodes.SPACE, true);
			sap.ui.getCore().applyChanges();

			// assert

			assert.strictEqual(oGrid.getSelectedDates().length, 2, "after deselecting the week, two days must remain");
			for (i = iCellIndexStartWeek; i < iCellIndexEndWeek; i++) {
				assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is not selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week selection via week number click", function (assert){
			// arrange
			var i,
				iCellIndexStartWeek = 7,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				$oWeekRow,
				oFakeEvent,
				oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				enableMultiDaySelection: true,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
			});

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			$oWeekRow = oGrid.$().find('.sapMSPCMonthWeek')[1].children;
			oFakeEvent = {
				target: $oWeekRow[0],
				srcControl: oGrid,
				metaKey: false,
				originalEvent: {
					type: "click",
					target: {
						nextSibling: $oWeekRow[1]
					}
				}
			};

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

			//act
			oGrid.ontap(oFakeEvent);
			sap.ui.getCore().applyChanges();

			//assert
			assert.strictEqual(oGrid.getSelectedDates().length, 7, "seven days are correctly added");
			for (i = iCellIndexStartWeek; i < iCellIndexEndWeek; i++) {
				assert.ok(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week deselection via week number click", function (assert){
				// arrange
				var i,
				iCellIndexStartWeek = 7,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				$oWeekRow,
				oFakeEvent,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					enableMultiDaySelection: true,
					dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect,
					selectedDates: [
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 2)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 3)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 4)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 5)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 6)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 7)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 8)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 9)}),
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)})
					]
				});

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			$oWeekRow = oGrid.$().find('.sapMSPCMonthWeek')[1].children;
			oFakeEvent = {
				target: $oWeekRow[0],
				srcControl: oGrid,
				metaKey: false,
				originalEvent: {
					type: "click",
					target: {
						nextSibling: $oWeekRow[1]
					}
				}
			};

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 9, "nine days were originally added");

			//act
			oGrid.ontap(oFakeEvent);
			sap.ui.getCore().applyChanges();

			//assert
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "after deselecting the week, two days must remain");
			for (i = iCellIndexStartWeek; i < iCellIndexEndWeek; i++) {
				assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("hasSelected", function (assert) {
			// arrange
			var oTestSelectedDate = new CalendarDate(2022, 0, 10),
				oTestNotSelectdDate = new CalendarDate(2022, 0, 11),
				oGrid = new SinglePlanningCalendarMonthGrid({
					enableMultiDaySelection: true,
					selectedDates: [
						new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)})
					]
				});

			// assert
			assert.ok(oGrid._checkDateSelected(oTestSelectedDate), "this date is selected");
			assert.notOk(oGrid._checkDateSelected(oTestNotSelectdDate ), "this date is not selected");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("appointmentSelect: select a single appointment", function (assert) {
			var oAppointment = new CalendarAppointment(),
				oGrid = new SinglePlanningCalendarMonthGrid({
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
			oGrid._fireSelectionEvent(oFakeEvent);

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
			var oGrid = new SinglePlanningCalendarMonthGrid({
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
					target: document.createElement("div"),
					srcControl: oGrid
				},
				fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			oFakeEvent.target.className = "sapMSPCMonthDay";

			//act
			oGrid._fireSelectionEvent(oFakeEvent);

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

		QUnit.test("_findSrcControl", function(assert) {
			// Prepare
			var oAppointment = new CalendarAppointment({
					startDate: UI5Date.getInstance(2022,0,20),
					endDate: UI5Date.getInstance(2022,11,31)
				}),
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,25),
					appointments: [oAppointment]
				}),
				oFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// Act
			oGrid.onkeydown({
				target: oAppointment.getDomRef(),
				which: 13,
				preventDefault: function() {}
			});

			// Assert
			assert.ok(oFireAppointmentSelectSpy.calledOnce, "AppointmentSelect event is fired");

			// Destroy
			oGrid.destroy();
		});

		QUnit.module("DOM attributes", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendar({
					startDate: UI5Date.getInstance(2020,11,1),
					enableAppointmentsDragAndDrop: false,
					views: new SinglePlanningCalendarMonthView({
						key: "Month",
						title: "Month"
					}),
					appointments:[
						new CalendarAppointment({
							title: "appointment for 2 rows",
							startDate: UI5Date.getInstance(2020,11,10),
							endDate: UI5Date.getInstance(2020,11,14)
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Appointment on two rows", function (assert){
			// arrange
			var oAppointmentHTMElement = this.oSPC.getAggregation("_mvgrid").$().find(".sapMSinglePCBlockers")[1].children[0];
			var oAppointment = this.oSPC.getAppointments()[0];
			//assert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("data-sap-ui-related"), oAppointment.getId(), "Appoinment have same data-sap-ui-related as the Control Id");
			assert.notEqual(oAppointmentHTMElement.getAttribute("id"), oAppointment.getId(), "DOM representation of the appointment should have a different id from the object Appointment");
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "Тhe appointment must receive the correct 'draggable' attribute from the SPC settings");

			//act
			this.oSPC.setEnableAppointmentsDragAndDrop(true);
			oCore.applyChanges();

			//asert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "Тhe appointment must receive the correct 'draggable' attribute from the SPC settings");
		});
	});
