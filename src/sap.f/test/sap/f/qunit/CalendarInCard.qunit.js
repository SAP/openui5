/*global QUnit, sinon */

sap.ui.define([
	"sap/f/CalendarInCard",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(CalendarInCard, CalendarDate, DateTypeRange, UI5Date, nextUIUpdate) {
	"use strict";

	QUnit.module("Interaction", {
		beforeEach: async function () {
			this.oCal = new CalendarInCard("PC", {
				selectedDates: [ new DateTypeRange({
					startDate: UI5Date.getInstance(2019, 8, 2)
				})]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCal.destroy();
		}
	});

	QUnit.test("Initialization of pickers", async function(assert) {
		var oCalendar = this.oCal,
			oMonthPicker = oCalendar._getMonthPicker(),
			oYearPicker = oCalendar._getYearPicker(),
			oYearRangePicker = oCalendar._getYearRangePicker(),
			oPickerBtn = oCalendar._oPickerBtn;

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();

		// Assert
		assert.ok(oMonthPicker.getDomRef(), "MonthPicker is visible after triggering navigation");
		assert.equal(oPickerBtn.getText(), "2019", "picker text is correct");

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		// Assert
		assert.notOk(oMonthPicker.getDomRef(), "MonthPicker is not visible after triggering navigation");
		assert.ok(oYearPicker.getDomRef(), "YearPicker is visible after triggering navigation");
		assert.equal(oPickerBtn.getText(), "2009 - 2028", "picker text is correct");

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		// Assert
		assert.notOk(oMonthPicker.getDomRef(), "MonthPicker is not visible after triggering navigation");
		assert.notOk(oYearPicker.getDomRef(), "YearPicker is not visible after triggering navigation");
		assert.ok(oYearRangePicker.getDomRef(), "YearRangePicker is visible after triggering navigation");
		assert.notOk(oPickerBtn.getVisible(), "picker button is not visible");
	});

	QUnit.test("Selecting a date from the pickers", async function(assert) {
		var oCalendar = this.oCal,
			oMonth = oCalendar.getAggregation("month")[0],
			oMonthPicker = oCalendar._getMonthPicker(),
			oYearPicker = oCalendar._getYearPicker(),
			oYearRangePicker = oCalendar._getYearRangePicker(),
			oPickerBtn = oCalendar._oPickerBtn;

		// Arrange
		// initialization of pickers
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();

		// Act
		oYearRangePicker.getDate().setFullYear(1999);
		await nextUIUpdate();
		oYearRangePicker.fireSelect();
		await nextUIUpdate();

		// Assert
		assert.notOk(oMonthPicker.getDomRef(), "MonthPicker is not visible after selecting year range");
		assert.ok(oYearPicker.getDomRef(), "YearPicker is visible after selecting year range");
		assert.notOk(oYearRangePicker.getDomRef(), "YearRangePicker is not visible after selecting year range");
		assert.ok(oPickerBtn.getVisible(), "picker button is visible");
		assert.strictEqual(oPickerBtn.getText(), "1999 - 2018", "picker text is correct");

		// Act
		oYearPicker.getDate().setFullYear(2018);
		await nextUIUpdate();
		oYearPicker.fireSelect();
		await nextUIUpdate();

		// Assert
		assert.ok(oMonthPicker.getDomRef(),"MonthPicker is visible after selecting year");
		assert.notOk(oYearPicker.getDomRef(), "YearPicker is not visible after selecting year");
		assert.notOk(oYearRangePicker.getDomRef(), "YearRangePicker is not visible after selecting year");
		assert.strictEqual(oPickerBtn.getText(), "2018", "picker text is correct");

		// Act
		oMonthPicker.setMonth(10);
		await nextUIUpdate();
		oMonthPicker.fireSelect();
		await nextUIUpdate();

		// Assert
		assert.notOk(oMonthPicker.getDomRef(), "MonthPicker is not visible after selecting month");
		assert.notOk(oYearPicker.getDomRef(), "YearPicker is not visible after selecting month");
		assert.notOk(oYearRangePicker.getDomRef(), "none", "YearRangePicker is not visible after selecting month");

		// Act
		oMonth._selectDay(new CalendarDate(2018, 10, 12));
		await nextUIUpdate();
		oMonthPicker.fireSelect();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oCalendar.getSelectedDates()[0].getStartDate().getFullYear(), 2018, "the year is correctly set");
		assert.strictEqual(oCalendar.getSelectedDates()[0].getStartDate().getMonth(), 10, "the month is correctly set");
		assert.strictEqual(oCalendar.getSelectedDates()[0].getStartDate().getDate(), 12, "the date is correctly set");
	});

	QUnit.test("Navigating in the pickers", async function(assert) {
		var oCalendar = this.oCal,
			oPickerBtn = oCalendar._oPickerBtn,
			oYearPicker = oCalendar._getYearPicker(),
			oYearRangePicker = oCalendar._getYearRangePicker();

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handleNext();
		await nextUIUpdate();
		// Assert
		assert.equal(oCalendar.getStartDate().getTime(), UI5Date.getInstance(2020, 8, 1).getTime(), "startDate is correct");
		assert.equal(oPickerBtn.getText(), "2020", "picker text is correct");

		// Act
		oCalendar._handlePrevious();
		await nextUIUpdate();
		// Assert
		assert.equal(oCalendar.getStartDate().getTime(), UI5Date.getInstance(2019, 8, 1).getTime(), "startDate is correct");
		assert.equal(oPickerBtn.getText(), "2019", "picker text is correct");

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handleNext();
		await nextUIUpdate();
		// Assert
		assert.equal(oYearPicker.getFirstRenderedDate().getFullYear(), 2029, "year is correct");
		assert.equal(oPickerBtn.getText(), "2029 - 2048", "picker text is correct");

		// Act
		oCalendar._handlePrevious();
		await nextUIUpdate();
		// Assert
		assert.equal(oYearPicker.getFirstRenderedDate().getFullYear(), 2009, "year is correct");
		assert.equal(oPickerBtn.getText(), "2009 - 2028", "picker text is correct");

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handleNext();
		await nextUIUpdate();
		// Assert
		assert.equal(oYearRangePicker.getFirstRenderedDate().getFullYear(), 2109, "year range is correct");

		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate();
		oCalendar._handlePrevious();
		await nextUIUpdate();
		// Assert
		assert.equal(oYearRangePicker.getFirstRenderedDate().getFullYear(), 1929, "year range is correct");
	});

	QUnit.test("Today button", async function(assert) {
		var oFakeNow = UI5Date.getInstance(2020, 0, 1),
			oOldDate = UI5Date.getInstance(2019, 11, 1),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oCalendar = this.oCal,
			oPickerBtn = oCalendar._oPickerBtn,
			oMonthPicker = oCalendar._getMonthPicker(),
			oYearPicker = oCalendar._getYearPicker(),
			oYearRangePicker = oCalendar._getYearRangePicker(),
			oAddMonthDelegateSpy = this.spy(oCalendar, "_addMonthFocusDelegate");

		// Act
		oCalendar._handleTodayPress();
		await nextUIUpdate(clock);
		// Assert
		assert.equal(oCalendar.getSelectedDates()[0].getStartDate().getTime(), oFakeNow.getTime(), "startDate is correct");
		assert.equal(oPickerBtn.getText(), "January 2020", "picker text is correct");

		// Arrange
		oCalendar.getSelectedDates()[0].setStartDate(oOldDate);
		await nextUIUpdate(clock);
		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate(clock);
		oCalendar._handleTodayPress();
		await nextUIUpdate(clock);
		// Assert
		assert.equal(oMonthPicker.getMonth(), 0, "month is correct");
		assert.equal(oPickerBtn.getText(), "2020", "picker text is correct");

		// Arrange
		oCalendar.getSelectedDates()[0].setStartDate(oOldDate);
		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate(clock);
		oCalendar._handleTodayPress();
		await nextUIUpdate(clock);
		// Assert
		/**
		 * @deprecated As of version 1.34
		 */
		assert.equal(oYearPicker.getYear(), 2020, "year is correct");
		assert.equal(oYearPicker.getDate().getFullYear(), 2020, "year is correct");
		assert.equal(oPickerBtn.getText(), "2010 - 2029", "picker text is correct");

		// Arrange
		oCalendar.getSelectedDates()[0].setStartDate(oOldDate);
		// Act
		oCalendar._handlePickerButtonPress();
		await nextUIUpdate(clock);
		oCalendar._handleTodayPress();
		await nextUIUpdate(clock);
		// Assert
		/**
		 * @deprecated As of version 1.34
		 */
		assert.equal(oYearRangePicker.getYear(), 2010, "year range is correct");
		assert.equal(oYearRangePicker.getDate().getFullYear(), 2010, "year range is correct");
		assert.notOk(oPickerBtn.getVisible(), "picker button is not visible");
		assert.strictEqual(oAddMonthDelegateSpy.callCount, 4, "Month focus delegate is added");

		// Cleanup
		clock.restore();
	});

});