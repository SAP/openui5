/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/f/PlanningCalendarInCardRow",
	"sap/f/PlanningCalendarInCard",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function(
	DateFormat,
	PlanningCalendarInCardRow,
	PlanningCalendarInCard,
	waitForThemeApplied
) {
	"use strict";

	QUnit.module("Initialization", {
		beforeEach: function () {
			this.oPC = new PlanningCalendarInCard("PC", {
				showWeekNumbers: true,
				builtInViews: ["One Month"],
				rows: [
					new PlanningCalendarInCardRow("Row", {})
				]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPC.destroy();
		}
	});

	QUnit.test("Legend", function(assert) {
		// Assert
		assert.ok(this.oPC._oInfoToolbar.getContent()[2].isA("sap.f.PlanningCalendarInCardLegend"), "Legend is initialized");
		assert.equal(this.oPC.getAggregation("table").getColumns().length, 3, "3 columns are initialized in the inner table");
	});

	QUnit.test("Start date", function(assert) {
		var oDate = new Date(2019, 8, 2);
		// Act
		this.oPC.setStartDate(oDate);
		// Assert
		assert.equal(this.oPC.getStartDate().getTime(), oDate.getTime(), "start date is set correctly");
	});

	QUnit.test("Table selection mode", function(assert) {
		// Assert
		assert.equal(this.oPC.getAggregation("table").getMode(), "None", "table selection mode is set correctly");
	});

	QUnit.module("Interaction", {
		beforeEach: function () {
			this.oPC = new PlanningCalendarInCard("PC", {
				startDate: new Date(2019, 11, 2),
				showWeekNumbers: true,
				builtInViews: ["One Month"],
				rows: [
					new PlanningCalendarInCardRow("Row", {})
				]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPC.destroy();
		}
	});

	QUnit.test("Initialization of pickers", function(assert) {
		var oEvent = {
				preventDefault:  function () {}
			},
			oYearFormat = DateFormat.getInstance({format: "y", calendarType: "Gregorian"}),
			iCurrentYear,
			iYearsShown,
			iStartYear,
			iEndYear;

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.ok(this.oPC._oMonthPicker.getVisible(), "MonthPicker is visible after triggering navigation");
		assert.equal(this.oPC._getHeader()._oPickerBtn.getText(), oYearFormat.format(this.oPC.getStartDate()), "picker text is correct");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after triggering navigation");
		assert.ok(this.oPC._oYearPicker.getVisible(), "YearPicker is visible after triggering navigation");
		iCurrentYear = this.oPC._oYearPicker.getYear();
		iYearsShown = this.oPC._oYearPicker.getYears();
		iStartYear = iCurrentYear - iYearsShown / 2;
		iEndYear = iCurrentYear + iYearsShown / 2 - 1;
		assert.equal(this.oPC._getHeader()._oPickerBtn.getText(), "2009 - 2028", "picker text is correct");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after triggering navigation");
		assert.notOk(this.oPC._oYearPicker.getVisible(), "YearPicker is not visible after triggering navigation");
		assert.ok(this.oPC._oYearRangePicker.getVisible(), "YearRangePicker is visible after triggering navigation");
		assert.notOk(this.oPC._getHeader()._oPickerBtn.getVisible(), "picker button is not visible");
	});

	QUnit.test("Selecting a date from the pickers", function(assert) {
		var oEvent = {
				preventDefault:  function () {}
			},
			oFakeNow = new Date(2020, 0, 1),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oYearFormat = DateFormat.getInstance({format: "y", calendarType: "Gregorian"}),
			iCurrentYear,
			iYearsShown,
			iStartYear,
			iEndYear;

		// Arrange
		// initialization of pickers
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handlePickerButtonPress(oEvent);

		// Act
		this.oPC._oYearRangePicker.setYear(1999);
		this.oPC._oYearRangePicker.fireSelect();
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after selecting year range");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after selecting year range");
		assert.ok(this.oPC._oYearPicker.getVisible(), "YearPicker is visible after selecting year range");
		assert.notOk(this.oPC._oYearRangePicker.getVisible(), "YearRangePicker is not visible after selecting year range");
		assert.equal(this.oPC.getStartDate().getFullYear(), 2009, "year set correct");
		iCurrentYear = this.oPC._oYearPicker.getYear();
		iYearsShown = this.oPC._oYearPicker.getYears();
		iStartYear = iCurrentYear - iYearsShown / 2;
		iEndYear = iCurrentYear + iYearsShown / 2 - 1;
		assert.ok(this.oPC._getHeader()._oPickerBtn.getVisible(), "picker button is visible");
		assert.equal(this.oPC._getHeader()._oPickerBtn.getText(), "1999 - 2018", "picker text is correct");

		// Act
		this.oPC._oYearPicker.setYear(2018);
		this.oPC._oYearPicker.fireSelect();
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after selecting year");
		assert.ok(this.oPC._oMonthPicker.getVisible(), "MonthPicker is visible after selecting year");
		assert.notOk(this.oPC._oYearPicker.getVisible(), "YearPicker is not visible after selecting year");
		assert.notOk(this.oPC._oYearRangePicker.getVisible(), "YearRangePicker is not visible after selecting year");
		assert.equal(this.oPC.getStartDate().getFullYear(), 2018, "year set correct");
		assert.equal(this.oPC._getHeader()._oPickerBtn.getText(), oYearFormat.format(this.oPC.getStartDate()), "picker text is correct");

		// Act
		this.oPC._oMonthPicker.setMonth(10);
		this.oPC._oMonthPicker.fireSelect();
		// Assert
		assert.ok(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is visible after selecting month");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after selecting month");
		assert.notOk(this.oPC._oYearPicker.getVisible(), "YearPicker is not visible after selecting month");
		assert.notOk(this.oPC._oYearRangePicker.getVisible(), "YearRangePicker is not visible after selecting month");
		assert.equal(this.oPC.getStartDate().getMonth(), 10, "month set correct");

		// Cleanup
		clock.restore();
	});

	QUnit.test("Second opening of the pickers", function(assert) {
		var oEvent = {
				preventDefault:  function () {}
			};

		// Arrange
		// initialization of pickers
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handlePickerButtonPress(oEvent);
		// selecting date from pickers
		this.oPC._oYearRangePicker.setYear(1999);
		this.oPC._oYearRangePicker.fireSelect();
		this.oPC._oYearPicker.setYear(2018);
		this.oPC._oYearPicker.fireSelect();
		this.oPC._oMonthPicker.setMonth(10);
		this.oPC._oMonthPicker.fireSelect();

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.ok(this.oPC._oMonthPicker.getVisible(), "MonthPicker is visible after triggering navigation");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after triggering navigation");
		assert.ok(this.oPC._oYearPicker.getVisible(), "YearPicker is visible after triggering navigation");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		// Assert
		assert.notOk(this.oPC._oInfoToolbar.getContent()[1].getVisible(), "OneMonthDatesRow is not visible after triggering navigation");
		assert.notOk(this.oPC._oMonthPicker.getVisible(), "MonthPicker is not visible after triggering navigation");
		assert.notOk(this.oPC._oYearPicker.getVisible(), "YearPicker is not visible after triggering navigation");
		assert.ok(this.oPC._oYearRangePicker.getVisible(), "YearRangePicker is visible after triggering navigation");
	});

	QUnit.test("Navigating in the pickers", function(assert) {
		var oEvent = {
			preventDefault:  function () {}
		};

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._applyArrowsLogic(true);
		// Assert
		assert.equal(this.oPC.getStartDate().getTime(), new Date(2018, 11, 2).getTime(), "startDate set correct");

		// Act
		this.oPC._applyArrowsLogic(false);
		// Assert
		assert.equal(this.oPC.getStartDate().getTime(), new Date(2019, 11, 2).getTime(), "startDate set correct");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._applyArrowsLogic(true);
		// Assert
		assert.equal(this.oPC._oYearPicker.getYear(), 1999, "year set correct");

		// Act
		this.oPC._applyArrowsLogic(false);
		// Assert
		assert.equal(this.oPC._oYearPicker.getYear(), 2019, "year set correct");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._applyArrowsLogic(true);
		// Assert
		assert.equal(this.oPC._oYearRangePicker.getYear(), 1839, "year range set correct");

		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._applyArrowsLogic(false);
		// Assert
		assert.equal(this.oPC._oYearRangePicker.getYear(), 2019, "year range set correct");
	});

	QUnit.test("Today button", function(assert) {
		var oFakeNow = new Date(2020, 0, 1),
			oOldDate = new Date(2019, 11, 1),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oEvent = {
				preventDefault:  function () {}
			};

		// Act
		this.oPC._handleTodayPress();
		// Assert
		assert.equal(this.oPC.getStartDate().getTime(), oFakeNow.getTime(), "startDate set correct");

		// Arrange
		this.oPC.setStartDate(oOldDate);
		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handleTodayPress();
		// Assert
		assert.equal(this.oPC._oMonthPicker.getMonth(), 0, "month set correct");

		// Arrange
		this.oPC.setStartDate(oOldDate);
		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handleTodayPress();
		// Assert
		assert.equal(this.oPC._oYearPicker.getYear(), 2020, "year set correct");

		// Arrange
		this.oPC.setStartDate(oOldDate);
		// Act
		this.oPC._handlePickerButtonPress(oEvent);
		this.oPC._handleTodayPress();
		// Assert
		assert.equal(this.oPC._oYearRangePicker.getYear(), 2010, "year range set correct");

		// Cleanup
		clock.restore();
	});

	QUnit.module("Islamic calendar", {
		beforeEach: function () {
			this.oPC = new PlanningCalendarInCard("PC", {
				startDate: new Date(2019, 11, 2),
				showWeekNumbers: true,
				builtInViews: ["One Month"],
				rows: [
					new PlanningCalendarInCardRow("Row", {})
				]
			});
			sap.ui.getCore().getConfiguration().setCalendarType("Islamic");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setCalendarType("Gregorian");
			this.oPC.destroy();
		}
	});

	QUnit.test("_calculateVisibleAppointments", function(assert) {
		var oResult = this.oPC.getRows()[0]._calculateVisibleAppointments([new sap.ui.unified.DateRange({
				startDate: new Date(2019, 11, 20)
			})], [{
			appointment: new sap.ui.unified.CalendarAppointment({
				startDate: new Date(2019, 11, 20, 9),
				endDate: new Date(2019, 11, 20, 10)
			})
			}]);

		assert.equal(oResult.iStart, 0, "start set correct");
		assert.equal(oResult.iEnd, 1, "end set correct");
	});

	QUnit.test("_calculateVisibleAppointments for today", function(assert) {
		var oFakeNow = new Date(2019, 11, 20),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oResult = this.oPC.getRows()[0]._calculateVisibleAppointments([new sap.ui.unified.DateRange({
					startDate: new Date(2019, 11, 20)
				})], [{
				appointment: new sap.ui.unified.CalendarAppointment({
					startDate: new Date(2019, 11, 20, 9),
					endDate: new Date(2019, 11, 20, 10)
				})
			}]);

		assert.equal(oResult.iStart, 0, "start set correct");
		assert.equal(oResult.iEnd, 1, "end set correct");

		// Cleanup
		clock.restore();
	});

	return waitForThemeApplied();
});