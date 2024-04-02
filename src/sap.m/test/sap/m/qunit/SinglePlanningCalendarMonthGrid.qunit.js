/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/m/SinglePlanningCalendarMonthGrid",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/CalendarAppointment",
	"sap/m/library",
	'sap/ui/unified/DateTypeRange',
	'sap/ui/unified/library',
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	qutils,
	SinglePlanningCalendar,
	SinglePlanningCalendarMonthView,
	SinglePlanningCalendarMonthGrid,
	nextUIUpdate,
	CalendarAppointment,
	mobileLibrary,
	DateTypeRange,
	unifiedLibrary,
	UI5Date,
	DateRange,
	CalendarDate,
	KeyCodes,
	createAndAppendDiv
) {
		"use strict";
		createAndAppendDiv("uiArea6");

		var CalendarDayType = unifiedLibrary.CalendarDayType;
		var SinglePlanningCalendarSelectionMode = mobileLibrary.SinglePlanningCalendarSelectionMode;
		var LinkAccessibleRole = mobileLibrary.LinkAccessibleRole;

		var o2Aug2018_00_00 = UI5Date.getInstance(2018, 7, 2);
		var o2Aug2018_18_00 = UI5Date.getInstance(2018, 7, 2, 18, 0, 0);
		var o3Aug2018_00_00 = UI5Date.getInstance(2018, 7, 3);
		var o3Aug2018_18_00 = UI5Date.getInstance(2018, 7, 3, 18, 0, 0);
		var o5Aug2018_00_00 = UI5Date.getInstance(2018, 7, 5);
		var i30Jul2018_00_00_UTC_Timestamp = 1532908800000;
		var i9Sep2018_00_00_UTC_Timestamp = 1536451200000;
		var i2Aug2018_00_00_UTC_Timestamp = 1533168000000;

		QUnit.module("More links", {
			beforeEach: async function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					firstDayOfWeek: 1,
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

				await nextUIUpdate(this.clock);
			},
			afterEach: async function () {
				this.oSPC.destroy();
				await nextUIUpdate(this.clock);
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
			var oLinkDay2 = this.oSPC._aLinks[3],
				oLinkDay3 = this.oSPC._aLinks[4],
				oLinkDay5 = this.oSPC._aLinks[6],
				oLinkDay6 = this.oSPC._aLinks[7];

			// assert
			assert.equal(oLinkDay2.getText().toLowerCase(), "3 more", "it's text is correct on the next day");
			assert.equal(oLinkDay3.getText().toLowerCase(), "2 more", "it's text is correct on the next day");
			assert.equal(oLinkDay5, undefined, "overflowing appointment renders on next day");
			assert.equal(oLinkDay6, undefined, "overflowing appointment renders on next day");
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
			beforeEach: async function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					firstDayOfWeek: 1
				}).placeAt("qunit-fixture");

				await nextUIUpdate(this.clock);
			},
			afterEach: async function() {
				this.oSPC.destroy();
				await nextUIUpdate(this.clock);
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

		QUnit.test("Special dates indicator", async function(assert) {
			// arrange, act
			this.oSPC.addSpecialDate(new DateTypeRange({
				type: CalendarDayType.Type05,
				startDate: UI5Date.getInstance(2018, 6, 30)
			}));
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(this.oSPC.$().find(".sapMSPCMonthDay")[0]
				.classList.contains("sapUiCalendarSpecialDayType05"), "the cell is special");
		});

		QUnit.test("_getFirstDayOfWeek output when firstDayOfWeek is set", async function(assert) {
			// prepare
			var oStartDate = UI5Date.getInstance(2023, 7, 1);
			this.oSPC.setStartDate(oStartDate);
			this.oSPC.setFirstDayOfWeek(1);
			await nextUIUpdate(this.clock);

			// act
			var aVisibleDays = this.oSPC._getVisibleDays(oStartDate).map((oDate) => oDate.toLocalJSDate());

			// assert
			assert.strictEqual(aVisibleDays[0].getDate(), 31, "The first visible day is 31st");
			assert.strictEqual(aVisibleDays[aVisibleDays.length - 1].getDate(), 10, "The last visible day is 10th");
		});

		QUnit.module("Appointments", {
			beforeEach: async function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					firstDayOfWeek: 1,
					appointments: [
						new CalendarAppointment({
							startDate: UI5Date.getInstance(i30Jul2018_00_00_UTC_Timestamp),
							endDate: o2Aug2018_00_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp),
							endDate: UI5Date.getInstance(i9Sep2018_00_00_UTC_Timestamp + 1000)
						})
					]
				}).placeAt("qunit-fixture");

				await nextUIUpdate(this.clock);
			},
			afterEach: async function() {
				this.oSPC.destroy();
				await nextUIUpdate(this.clock);
			}
		});

		QUnit.test("Appointment nodes properties", async function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));
			await nextUIUpdate(this.clock);
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
			this.oSPC.destroyAppointments();
			var aCalculatedAppointments,
				aSortedAppointments = [
					new CalendarAppointment("sorting-0", {
						startDate: UI5Date.getInstance(2018, 6, 30),
						endDate: UI5Date.getInstance(2018, 7, 1)
					}),
					new CalendarAppointment("sorting-1", {
						startDate: UI5Date.getInstance(2018, 7, 1, 10, 30),
						endDate: UI5Date.getInstance(2018, 7, 1, 14, 30)
					}),
					new CalendarAppointment("sorting-2", {
						startDate: UI5Date.getInstance(2018, 7, 1, 13, 45),
						endDate: UI5Date.getInstance(2018, 7, 1, 16)
					}),
					new CalendarAppointment("sorting-3", {
						startDate: UI5Date.getInstance(2018, 7, 1, 14),
						endDate: UI5Date.getInstance(2018, 7, 1, 15, 30)
					})
				];

			// add appointments out of order
			this.oSPC.addAppointment(aSortedAppointments[3]);
			this.oSPC.addAppointment(aSortedAppointments[1]);
			this.oSPC.addAppointment(aSortedAppointments[2]);
			this.oSPC.addAppointment(aSortedAppointments[0]);

			// act
			aCalculatedAppointments = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate()).map((node) => node.data);

			// assert
			assert.deepEqual(aCalculatedAppointments, aSortedAppointments, "appointments are correctly ordered by start date");
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
			assert.equal(aAppointmentNodes[1].level, 1, "same-day appointments have correct levels");
			assert.equal(aAppointmentNodes[2].level, 2, "same-day appointments have correct levels");
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

		QUnit.test("Large appointment representation in DOM with unique ID", async function(assert) {
			// arrange
			this.oSPC.destroyAppointments();
			var oAppointment = new CalendarAppointment("appointment_from_01_to_22",{
				startDate: UI5Date.getInstance(2018, 2, 1),
				endDate: UI5Date.getInstance(2018, 7, 22)
				});

			// act
			this.oSPC.addAppointment(oAppointment);
			await nextUIUpdate(this.clock);

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
			beforeEach: async function() {
				this.oSPCMG = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					firstDayOfWeek: 1
				}).placeAt("qunit-fixture");

				await nextUIUpdate(this.clock);
			},
			afterEach: async function() {
				this.oSPCMG.destroy();
				await nextUIUpdate(this.clock);
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

		QUnit.test("weekNumberPress event", function(assert) {
			// arrange
			const oWeekNumberPressSpy = this.spy(this.oSPCMG, "fireWeekNumberPress");
			const $oWeekRow = this.oSPCMG.$().find('.sapMSPCMonthWeek')[1].children;
			const oFakeEvent = {
					target: $oWeekRow[0],
					srcControl: this.oSPCMG,
					metaKey: false,
					originalEvent: {
							type: "click",
							target: {
									nextSibling: $oWeekRow[1]
								}
							}
						};

			//act
			this.oSPCMG.onmouseup(oFakeEvent);

			// assert
			assert.ok(oWeekNumberPressSpy.calledOnce, "one event is fired");
		});

		QUnit.test("selectedDatesChange event", function(assert) {
			// arrange
			const oSelectedDatesChange = this.spy(this.oSPCMG, "fireSelectedDatesChange");

			// act
			this.oSPCMG.onmouseup({ target: this.oSPCMG.$().find('.sapMSPCMonthDay')[14], srcControl: this.oSPCMG, metaKey: true, originalEvent: {type: "click"}});

			// assert
			assert.ok(oSelectedDatesChange.calledOnce, "one event is fired");
			assert.equal(this.oSPCMG.getSelectedDates().length, 1);
		});

		QUnit.test("selectedDates: select days", async function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
			});
			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "selectedDates is added");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "selectedDates is added");

			// act
			oGrid.setDateSelectionMode(SinglePlanningCalendarSelectionMode.SingleSelect);
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[3], srcControl: oGrid, metaKey: false, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "selectedDates is only one");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: deselect days", async function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect,
				selectedDates: [
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 13)})
				]
			});
			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "two days were initially added");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "one day is removed");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "selectedDates is empty");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: select days (click on cell header)", async function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
			});
			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDayNumber')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "selectedDates is added");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDayNumber')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is selected");
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "selectedDates is added");

			// act
			oGrid.setDateSelectionMode(SinglePlanningCalendarSelectionMode.SingleSelect);
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDay')[3], srcControl: oGrid, metaKey: false, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			assert.strictEqual(oGrid.getSelectedDates().length, 1, "selectedDates is only one");
			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: deselect days (click on cell header)", async function (assert){
			// arrange
			var oGrid = new SinglePlanningCalendarMonthGrid({
				startDate: UI5Date.getInstance(2022,0,1),
				firstDayOfWeek: 1,
				dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect,
				selectedDates: [
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 10)}),
					new DateRange({startDate: UI5Date.getInstance(2022, 0, 13)})
				]
			});
			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 2, "two days were initially added");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDayNumber')[14], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 1, "one day is removed");

			// act
			oGrid.onmouseup({ target: oGrid.$().find('.sapMSPCMonthDayNumber')[17], srcControl: oGrid, metaKey: true, originalEvent: {type: "click"}});
			await nextUIUpdate(this.clock);

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[14].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[17].classList.contains("sapMSPCMonthDaySelected"), "cell is deselected");
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "selectedDates is empty");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week selection via keyboard shortcut", async function (assert){
			// arrange
			var iCellIndexInMiddleInWeek = 3,
				iCellIndexEndWeek = 6,
				i,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					firstDayOfWeek: 1,
					dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
				});

			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

			// act
			oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].focus();
			qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE, true);
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 7, "seven days are correctly added");
			for (i = 0; i < iCellIndexEndWeek; i++) {
				assert.ok(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week deselection via keyboard shortcut", async function (assert){
			// arrange
			var iCellIndexStartWeek = 14,
				iCellIndexInMiddleInWeek = iCellIndexStartWeek + 3,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				i,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					firstDayOfWeek: 1,
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
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 9, "nine days were originally added");

			// act
			oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].focus();
			qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE, true);
			await nextUIUpdate(this.clock);

			// assert

			assert.strictEqual(oGrid.getSelectedDates().length, 2, "after deselecting the week, two days must remain");
			for (i = iCellIndexStartWeek; i < iCellIndexEndWeek; i++) {
				assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is not selected");
			}

			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: single select/deselect via keyboard (Space)", async function (assert){
			// arrange
			var iCellIndexInMiddleInWeek = 3,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					firstDayOfWeek: 1,
					dateSelectionMode: SinglePlanningCalendarSelectionMode.SingleSelect
				});

			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			// assert
			assert.strictEqual(oGrid.getSelectedDates().length, 0, "no days initially added");

			// act
			oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].focus();

			qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE, false);
			await nextUIUpdate(this.clock);

			// assert
			assert.ok(oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].classList.contains("sapMSPCMonthDaySelected"), iCellIndexInMiddleInWeek + " cell is selected");

			// act
			qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE, false);
			await nextUIUpdate(this.clock);

			// assert
			assert.notOk(oGrid.$().find('.sapMSPCMonthDay')[iCellIndexInMiddleInWeek].classList.contains("sapMSPCMonthDaySelected"), iCellIndexInMiddleInWeek + " cell is deselected");
			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week selection via week number click", async function (assert){
			// arrange
			var i,
				iCellIndexStartWeek = 7,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				$oWeekRow,
				oFakeEvent,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					firstDayOfWeek: 1,
					dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect
				});

			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
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
			oGrid.onmousedown(oFakeEvent);
			oGrid.onmouseup(oFakeEvent);
			await nextUIUpdate(this.clock);

			//assert
			assert.strictEqual(oGrid.getSelectedDates().length, 7, "seven days are correctly added");
			for (i = iCellIndexStartWeek; i < iCellIndexEndWeek; i++) {
				assert.ok(oGrid.$().find('.sapMSPCMonthDay')[i].classList.contains("sapMSPCMonthDaySelected"), i + " cell is selected");
			}
			assert.strictEqual(oGrid._oItemNavigation.getFocusedIndex(), iCellIndexStartWeek, "The first day of the selected week should receive focus");
			//clean up
			oGrid.destroy();
		});

		QUnit.test("selectedDates: week deselection via week number click", async function (assert){
				// arrange
				var i,
				iCellIndexStartWeek = 7,
				iCellIndexEndWeek = iCellIndexStartWeek + 7,
				$oWeekRow,
				oFakeEvent,
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,1),
					firstDayOfWeek: 1,
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
			await nextUIUpdate(this.clock);
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
			oGrid.onmouseup(oFakeEvent);
			await nextUIUpdate(this.clock);

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
					firstDayOfWeek: 1,
					dateSelectionMode: SinglePlanningCalendarSelectionMode.MultiSelect,
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
					firstDayOfWeek: 1,
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
					firstDayOfWeek: 1,
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

		QUnit.test("_findSrcControl", async function(assert) {
			// Prepare
			var oAppointment = new CalendarAppointment({
					startDate: UI5Date.getInstance(2022,0,20),
					endDate: UI5Date.getInstance(2022,11,31)
				}),
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: UI5Date.getInstance(2022,0,25),
					firstDayOfWeek: 1,
					appointments: [oAppointment]
				}),
				oFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			oGrid.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

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

		QUnit.test("Non working days helper method", function(assert) {
			// Prepare
			var oNonWorking = UI5Date.getInstance(2018, 6, 2),
				oWeekend = UI5Date.getInstance(2018, 6, 7),
				oWorkingWeekend = UI5Date.getInstance(2018, 6, 14),
				oGrid = new SinglePlanningCalendarMonthGrid({
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
				oGrid = new SinglePlanningCalendarMonthGrid({
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

		QUnit.module("DOM attributes", {
			beforeEach: async function() {
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

				await nextUIUpdate(this.clock);
			},
			afterEach: async function() {
				this.oSPC.destroy();
				await nextUIUpdate(this.clock);

			}
		});

		QUnit.test("Appointment on two rows", async function (assert){
			// arrange
			var oAppointmentHTMElement = this.oSPC.getAggregation("_mvgrid").$().find(".sapMSinglePCBlockers")[1].children[0];
			var oAppointment = this.oSPC.getAppointments()[0];
			//assert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("data-sap-ui-related"), oAppointment.getId(), "Appoinment have same data-sap-ui-related as the Control Id");
			assert.notEqual(oAppointmentHTMElement.getAttribute("id"), oAppointment.getId(), "DOM representation of the appointment should have a different id from the object Appointment");
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "The appointment must receive the correct 'draggable' attribute from the SPC settings");

			//act
			this.oSPC.setEnableAppointmentsDragAndDrop(true);
			await nextUIUpdate(this.clock);

			//asert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "The appointment must receive the correct 'draggable' attribute from the SPC settings");
		});
	});
