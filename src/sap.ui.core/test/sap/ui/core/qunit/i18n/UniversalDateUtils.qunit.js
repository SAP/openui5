/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/CalendarType"
], function(UniversalDateUtils, UniversalDate, CalendarType) {
	"use strict";

	// Add asserts for comparison of numeric values
	QUnit.assert.greaterOrEqual = function greaterOrEqual(actual, expected, message) {
		this.pushResult({
			result: actual >= expected,
			actual: actual,
			expected: expected,
			message: message
		});
	};

	QUnit.assert.lessOrEqual = function greaterOrEqual(actual, expected, message) {
		this.pushResult({
			result: actual <= expected,
			actual: actual,
			expected: expected,
			message: message
		});
	};

	var testDate = function(assert, oDate, iDuration, sUnit, iFullYear, iMonth, iDate, iHours, iMinutes, iSecond, iMilliseconds) {
		assert.strictEqual(oDate.getFullYear(), iFullYear, "getRange " + iDuration +  " " + sUnit + ": year set correctly");
		assert.strictEqual(oDate.getMonth(), iMonth, "getRange " + iDuration +  " " + sUnit + ": month set correctly");
		assert.strictEqual(oDate.getDate(), iDate, "getRange " + iDuration +  " " + sUnit + ": date set correctly");
		assert.strictEqual(oDate.getHours(), iHours, "getRange " + iDuration +  " " + sUnit + ": hours set correctly");
		assert.strictEqual(oDate.getMinutes(), iMinutes, "getRange " + iDuration +  " " + sUnit + ": minutes set correctly");
		assert.strictEqual(oDate.getSeconds(), iSecond, "getRange " + iDuration +  " " + sUnit + ": seconds set correctly");
		assert.strictEqual(oDate.getMilliseconds(), iMilliseconds, "getRange " + iDuration +  " " + sUnit + ": milliseconds set correctly");
	};

	QUnit.test("Static Methods Test", function (assert) {
		var oUDate = UniversalDateUtils.resetStartTime(new UniversalDate());
		assert.strictEqual(oUDate.oDate.getHours(), 0, "resetStartTime: Start hours set correctly");
		assert.strictEqual(oUDate.oDate.getMinutes(), 0, "resetStartTime: Start minutes set correctly");
		assert.strictEqual(oUDate.oDate.getSeconds(), 0, "resetStartTime: Start seconds set correctly");
		assert.strictEqual(oUDate.oDate.getMilliseconds(), 0, "resetStartTime: Start milliseconds set correctly");

		oUDate = UniversalDateUtils.resetStartTime();
		assert.strictEqual(oUDate.oDate.getHours(), 0, "resetStartTime: Start hours set correctly");
		assert.strictEqual(oUDate.oDate.getMinutes(), 0, "resetStartTime: Start minutes set correctly");
		assert.strictEqual(oUDate.oDate.getSeconds(), 0, "resetStartTime: Start seconds set correctly");
		assert.strictEqual(oUDate.oDate.getMilliseconds(), 0, "resetStartTime: Start milliseconds set correctly");

		oUDate = UniversalDateUtils.resetEndTime();
		assert.strictEqual(oUDate.oDate.getHours(), 23, "resetEndTime: End hours set correctly");
		assert.strictEqual(oUDate.oDate.getMinutes(), 59, "resetEndTime: End minutes set correctly");
		assert.strictEqual(oUDate.oDate.getSeconds(), 59, "resetEndTime: End seconds set correctly");
		assert.strictEqual(oUDate.oDate.getMilliseconds(), 999, "resetEndTime: End milliseconds set correctly");

		oUDate = UniversalDateUtils.resetEndTime(new UniversalDate());
		assert.strictEqual(oUDate.oDate.getHours(), 23, "resetEndTime: End hours set correctly");
		assert.strictEqual(oUDate.oDate.getMinutes(), 59, "resetEndTime: End minutes set correctly");
		assert.strictEqual(oUDate.oDate.getSeconds(), 59, "resetEndTime: End seconds set correctly");
		assert.strictEqual(oUDate.oDate.getMilliseconds(), 999, "resetEndTime: End milliseconds set correctly");
	});

	QUnit.test("Static Methods Test getRange", function (assert) {

		var oDate = new UniversalDate();
		oDate.setDate(1);
		oDate.setMonth(0);
		oDate.setFullYear(2000);

		var oUniversalDateUtilsStub = sinon.stub(UniversalDateUtils, "createNewUniversalDate").returns( oDate);

		//DateRange DAY
		var aRange = UniversalDateUtils.getRange(1, "DAY");
		testDate(assert, aRange[0].oDate, 1, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "DAY", 2000, 0, 2, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(2, "DAY");
		testDate(assert, aRange[0].oDate, 2, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "DAY", 2000, 0, 3, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(32, "DAY");
		testDate(assert, aRange[0].oDate, 32, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 32, "DAY", 2000, 1, 2, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(367, "DAY");
		testDate(assert, aRange[0].oDate, 367, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 367, "DAY", 2001, 0, 2, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(-1, "DAY"); // previous day
		testDate(assert, aRange[0].oDate, -1, "DAY", 1999, 11, 31, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "DAY", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(-2, "DAY");
		testDate(assert, aRange[0].oDate, -2, "DAY", 1999, 11, 30, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -2, "DAY", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(0, "DAY");
		testDate(assert, aRange[0].oDate, 0, "DAY", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "DAY", 2000, 0, 1, 23,59,59,999);

		//DateRange WEEK
		aRange = UniversalDateUtils.getRange(1, "WEEK");
		testDate(assert, aRange[0].oDate, 1, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "WEEK", 2000, 0, 8, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(2, "WEEK");
		testDate(assert, aRange[0].oDate, 2, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "WEEK", 2000, 0, 15, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(5, "WEEK");
		testDate(assert, aRange[0].oDate, 5, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 5, "WEEK", 2000, 1, 5, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(53, "WEEK");
		testDate(assert, aRange[0].oDate, 53, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 53, "WEEK", 2001, 0, 6, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(-1, "WEEK"); // previous week
		testDate(assert, aRange[0].oDate, -1, "WEEK", 1999, 11, 19, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "WEEK", 1999, 11, 25, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(0, "WEEK"); // current week
		testDate(assert, aRange[0].oDate, 0, "WEEK", 1999, 11, 26, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "WEEK", 2000, 0, 1, 23,59,59,999);


		//DateRange MONTH
		aRange = UniversalDateUtils.getRange(1, "MONTH");
		testDate(assert, aRange[0].oDate, 1, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "MONTH", 2000, 1, 29, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(2, "MONTH");
		testDate(assert, aRange[0].oDate, 2, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "MONTH", 2000, 2, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(13, "MONTH");
		testDate(assert, aRange[0].oDate, 13, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 13, "MONTH", 2001, 1, 28, 23,59,59,999);

		oUniversalDateUtilsStub.restore();

		oDate = new UniversalDate(); // to test determination of interval start
		oDate.setDate(10);
		oDate.setMonth(0);
		oDate.setFullYear(2000);

		oUniversalDateUtilsStub = sinon.stub(UniversalDateUtils, "createNewUniversalDate").returns( oDate);

		aRange = UniversalDateUtils.getRange(-1, "MONTH"); // previous month
		testDate(assert, aRange[0].oDate, -1, "MONTH", 1999, 11, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "MONTH", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(0, "MONTH"); // current month
		testDate(assert, aRange[0].oDate, 0, "MONTH", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "MONTH", 2000, 0, 31, 23,59,59,999);


		//DateRange QUARTER
		aRange = UniversalDateUtils.getRange(1, "QUARTER");
		testDate(assert, aRange[0].oDate, 1, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "QUARTER", 2000, 5, 30, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(2, "QUARTER");
		testDate(assert, aRange[0].oDate, 2, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "QUARTER", 2000, 8, 30, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(4, "QUARTER");
		testDate(assert, aRange[0].oDate, 4, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 4, "QUARTER", 2001, 2, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(-1, "QUARTER"); // previous quarter
		testDate(assert, aRange[0].oDate, -1, "QUARTER", 1999, 9, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "QUARTER", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(0, "QUARTER"); // current quarter
		testDate(assert, aRange[0].oDate, 0, "QUARTER", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "QUARTER", 2000, 2, 31, 23,59,59,999);


		//DateRange YEAR
		aRange = UniversalDateUtils.getRange(1, "YEAR");
		testDate(assert, aRange[0].oDate, 1, "YEAR", 2001, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "YEAR", 2001, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(-1, "YEAR"); // previous year
		testDate(assert, aRange[0].oDate, -1, "YEAR", 1999, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "YEAR", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.getRange(0, "YEAR"); // current year
		testDate(assert, aRange[0].oDate, 0, "YEAR", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "YEAR", 2000, 11, 31, 23,59,59,999);

		oUniversalDateUtilsStub.restore();


		//week start date with locale
		oDate = UniversalDateUtils.getWeekStartDate(new UniversalDate(), "en-US");
		assert.strictEqual(oDate.getDay(), 0, "en-US first day of week is Sunday (0)");

		oDate = UniversalDateUtils.getWeekStartDate(new UniversalDate(), "de");
		assert.strictEqual(oDate.getDay(), 1, "en-US first day of week is Monday (1)");

	});

	QUnit.test("Checking ranges", function (assert) {
		var oDate1 = UniversalDateUtils.getWeekStartDate(new UniversalDate());
		var oDate2 = UniversalDateUtils.getWeekStartDate();
		assert.greaterOrEqual(oDate2.getTime() - oDate1.getTime(), 0, "UniversalDateUtils.getWeekStartDate without date");

		oDate1 = UniversalDateUtils.getMonthStartDate(new UniversalDate());
		oDate2 = UniversalDateUtils.getMonthStartDate();
		assert.greaterOrEqual(oDate2.getTime() - oDate1.getTime(), 0, "UniversalDateUtils.getMonthStartDate without date");

		oDate1 = UniversalDateUtils.getQuarterStartDate(new UniversalDate(2000, 8, 12));
		assert.strictEqual(oDate1.getMonth(), 6, "UniversalDateUtils.getQuarterStartDate returns Month 6");

		oDate1 = UniversalDateUtils.getQuarterStartDate(new UniversalDate());
		oDate2 = UniversalDateUtils.getQuarterStartDate();
		var iDiff = oDate2.getTime() - oDate1.getTime();
		assert.strictEqual(iDiff >= 0 && iDiff <= 10, true, "UniversalDateUtils.getQuarterStartDate without date");


		var oDate = new UniversalDate(); // to test determination of interval start
		oDate.setDate(1);
		oDate.setMonth(0);
		oDate.setFullYear(2000);

		var oUniversalDateUtilsStub = sinon.stub(UniversalDateUtils, "createNewUniversalDate").returns( oDate);

		//lastDays
		var aRange = UniversalDateUtils.ranges.lastDays(3);
		testDate(assert, aRange[0].oDate, -3, "DAY", 1999, 11, 29, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -3, "DAY", 1999, 11, 31, 23,59,59,999);

		//yesterday
		aRange = UniversalDateUtils.ranges.yesterday();
		testDate(assert, aRange[0].oDate, -1, "DAY", 1999, 11, 31, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "DAY", 1999, 11, 31, 23,59,59,999);

		//today
		aRange = UniversalDateUtils.ranges.today();
		testDate(assert, aRange[0].oDate, 0, "DAY", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "DAY", 2000, 0, 1, 23,59,59,999);

		//tomorrow
		aRange = UniversalDateUtils.ranges.tomorrow();
		testDate(assert, aRange[0].oDate, 1, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "DAY", 2000, 0, 2, 23,59,59,999);

		//nextDays
		aRange = UniversalDateUtils.ranges.nextDays(3);
		testDate(assert, aRange[0].oDate, -3, "DAY", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -3, "DAY", 2000, 0, 4, 23,59,59,999);


		//lastWeeks
		aRange = UniversalDateUtils.ranges.lastWeeks(5);
		testDate(assert, aRange[0].oDate, -5, "WEEK", 1999, 10, 21, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -5, "WEEK", 1999, 11, 25, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.lastWeeks(2);
		testDate(assert, aRange[0].oDate, -2, "WEEK", 1999, 11, 12, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -2, "WEEK", 1999, 11, 25, 23,59,59,999);

		//lastWeek
		aRange = UniversalDateUtils.ranges.lastWeek();
		testDate(assert, aRange[0].oDate, -1, "WEEK", 1999, 11, 19, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "WEEK", 1999, 11, 25, 23,59,59,999);

		//currentWeek
		aRange = UniversalDateUtils.ranges.currentWeek();
		testDate(assert, aRange[0].oDate, 0, "WEEK", 1999, 11, 26, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "WEEK", 2000, 0, 1, 23,59,59,999);

		//nextWeek
		aRange = UniversalDateUtils.ranges.nextWeek();
		testDate(assert, aRange[0].oDate, 1, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "WEEK", 2000, 0, 8, 23,59,59,999);

		//nextWeeks
		aRange = UniversalDateUtils.ranges.nextWeeks(2);
		testDate(assert, aRange[0].oDate, 2, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "WEEK", 2000, 0, 15, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.nextWeeks(5);
		testDate(assert, aRange[0].oDate, 5, "WEEK", 2000, 0, 2, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 5, "WEEK", 2000, 1, 5, 23,59,59,999);


		//lastMonths
		aRange = UniversalDateUtils.ranges.lastMonths(13);
		testDate(assert, aRange[0].oDate, -13, "MONTH", 1998, 11, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -13, "MONTH", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.lastMonths(2);
		testDate(assert, aRange[0].oDate, -2, "MONTH", 1999, 10, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -2, "MONTH", 1999, 11, 31, 23,59,59,999);

		//lastMonth
		aRange = UniversalDateUtils.ranges.lastMonth();
		testDate(assert, aRange[0].oDate, -1, "MONTH", 1999, 11, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "MONTH", 1999, 11, 31, 23,59,59,999);

		//currentMonth
		aRange = UniversalDateUtils.ranges.currentMonth();
		testDate(assert, aRange[0].oDate, 0, "MONTH", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "MONTH", 2000, 0, 31, 23,59,59,999);

		//nextMonth
		aRange = UniversalDateUtils.ranges.nextMonth();
		testDate(assert, aRange[0].oDate, 1, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "MONTH", 2000, 1, 29, 23,59,59,999);

		//nextMonths
		aRange = UniversalDateUtils.ranges.nextMonths(2);
		testDate(assert, aRange[0].oDate, 2, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "MONTH", 2000, 2, 31, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.nextMonths(13);
		testDate(assert, aRange[0].oDate, 13, "MONTH", 2000, 1, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 13, "MONTH", 2001, 1, 28, 23,59,59,999);


		//lastQuarters
		aRange = UniversalDateUtils.ranges.lastQuarters(5);
		testDate(assert, aRange[0].oDate, -5, "QUARTER", 1998, 9, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -5, "QUARTER", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.lastQuarters(2);
		testDate(assert, aRange[0].oDate, -2, "QUARTER", 1999, 6, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -2, "QUARTER", 1999, 11, 31, 23,59,59,999);

		//lastQuarter
		aRange = UniversalDateUtils.ranges.lastQuarter();
		testDate(assert, aRange[0].oDate, -1, "QUARTER", 1999, 9, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "QUARTER", 1999, 11, 31, 23,59,59,999);

		//currentQuarter
		aRange = UniversalDateUtils.ranges.currentQuarter();
		testDate(assert, aRange[0].oDate, 0, "QUARTER", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "QUARTER", 2000, 2, 31, 23,59,59,999);

		//nextQuarter
		aRange = UniversalDateUtils.ranges.nextQuarter();
		testDate(assert, aRange[0].oDate, 1, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "QUARTER", 2000, 5, 30, 23,59,59,999);

		//nextQuarters
		aRange = UniversalDateUtils.ranges.nextQuarters(2);
		testDate(assert, aRange[0].oDate, 2, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "QUARTER", 2000, 8, 30, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.nextQuarters(5);
		testDate(assert, aRange[0].oDate, 5, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 5, "QUARTER", 2001, 5, 30, 23,59,59,999);



		//1 Quarter
		aRange = UniversalDateUtils.ranges.quarter(1);
		testDate(assert, aRange[0].oDate, 1, "QUARTER", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "QUARTER", 2000, 2, 31, 23,59,59,999);

		//2 Quarter
		aRange = UniversalDateUtils.ranges.quarter(2);
		testDate(assert, aRange[0].oDate, 2, "QUARTER", 2000, 3, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "QUARTER", 2000, 5, 30, 23,59,59,999);

		//3 Quarter
		aRange = UniversalDateUtils.ranges.quarter(3);
		testDate(assert, aRange[0].oDate, 3, "QUARTER", 2000, 6, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 3, "QUARTER", 2000, 8, 30, 23,59,59,999);

		//4 Quarter
		aRange = UniversalDateUtils.ranges.quarter(4);
		testDate(assert, aRange[0].oDate, 4, "QUARTER", 2000, 9, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 4, "QUARTER", 2000, 11, 31, 23,59,59,999);


		//lastYears
		aRange = UniversalDateUtils.ranges.lastYears(5);
		testDate(assert, aRange[0].oDate, -5, "YEAR", 1995, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -5, "YEAR", 1999, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.lastYears(2);
		testDate(assert, aRange[0].oDate, -2, "YEAR", 1998, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -2, "YEAR", 1999, 11, 31, 23,59,59,999);

		//lastYear
		aRange = UniversalDateUtils.ranges.lastYear();
		testDate(assert, aRange[0].oDate, -1, "YEAR", 1999, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, -1, "YEAR", 1999, 11, 31, 23,59,59,999);

		//currentYear
		aRange = UniversalDateUtils.ranges.currentYear();
		testDate(assert, aRange[0].oDate, 0, "YEAR", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "YEAR", 2000, 11, 31, 23,59,59,999);

		//nextYear
		aRange = UniversalDateUtils.ranges.nextYear();
		testDate(assert, aRange[0].oDate, 1, "YEAR", 2001, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 1, "YEAR", 2001, 11, 31, 23,59,59,999);

		//nextYears
		aRange = UniversalDateUtils.ranges.nextYears(2);
		testDate(assert, aRange[0].oDate, 2, "YEAR", 2001, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 2, "YEAR", 2002, 11, 31, 23,59,59,999);

		aRange = UniversalDateUtils.ranges.nextYears(5);
		testDate(assert, aRange[0].oDate, 5, "YEAR", 2001, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 5, "YEAR", 2005, 11, 31, 23,59,59,999);

		oUniversalDateUtilsStub.restore();

		oDate = new UniversalDate(); // to test determination of interval start
		oDate.setDate(25);
		oDate.setMonth(4);
		oDate.setFullYear(2000);

		oUniversalDateUtilsStub = sinon.stub(UniversalDateUtils, "createNewUniversalDate").returns( oDate);


		//yearToDate
		aRange = UniversalDateUtils.ranges.yearToDate();
		testDate(assert, aRange[0].oDate, 0, "YEAR", 2000, 0, 1, 0,0,0,0);
		testDate(assert, aRange[1].oDate, 0, "YEAR", 2000, 4, 25, 23,59,59,999);

		oUniversalDateUtilsStub.restore();
	});

	/**
	 * Tested invariant:
	 * Helper methods must not modify the input dates and the output date(s)
	 * must be of the same calendar type as a given input date.
	 */
	QUnit.test("Input and CalendarType Stability", function(assert) {
		var fFixedDateTime = Date.now();

		Object.keys(CalendarType).forEach(function(sCalendarType) {
			var oDate = new Date(fFixedDateTime),
				oInput = UniversalDate.getInstance(oDate, sCalendarType),
				oOutput;

			// preconditions
			assert.equal(oInput.getTime(), fFixedDateTime, "[precondition] copy of input date is identical");
			assert.equal(oInput.getCalendarType(), sCalendarType, "[precondition] input date has expected calendar type");

			// getWeekStartDate
			oOutput = UniversalDateUtils.getWeekStartDate(oInput);
			assert.equal(oInput.getTime(), fFixedDateTime, "getWeekStartDate: input date has not been modified");
			assert.ok(oOutput !== oInput,
				"getWeekStartDate: returned date must not be the same as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"getWeekStartDate: returned calendar type must be the same as the input calendar type");

			// getMonthStartDate
			oOutput = UniversalDateUtils.getMonthStartDate(oInput);
			assert.equal(oInput.getTime(), fFixedDateTime, "getMonthStartDate: input date has not been modified");
			assert.ok(oOutput !== oInput,
				"getMonthStartDate: returned date must not be the same as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"getMonthStartDate: returned calendar type must be the same as the input calendar type");

			// getYearStartDate
			oOutput = UniversalDateUtils.getYearStartDate(oInput);
			assert.equal(oInput.getTime(), fFixedDateTime, "getYearStartDate: input date has not been modified");
			assert.ok(oOutput !== oInput,
				"getYearStartDate: returned date must not be the same object as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"getYearStartDate: returned calendar type must be the same as the input calendar type");

			// resetStartTime
			oOutput = UniversalDateUtils.resetStartTime(oInput);
			assert.equal(oInput.getTime(), fFixedDateTime, "resetStartTime: input date has not been modified");
			assert.ok(oOutput !== oInput,
				"resetStartTime: returned date must not be the same object as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"resetStartTime: returned calendar type must be the same as the input calendar type");

			// resetEndTime
			oOutput = UniversalDateUtils.resetEndTime(oInput);
			assert.equal(oInput.getTime(), fFixedDateTime, "resetEndTime: input date has not been modified");
			assert.ok(oOutput !== oInput,
				"resetEndTime: returned date must not be the same object as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"resetEndTime: returned calendar type must be the same as the input calendar type");

			// resetEndTime(,true)
			oOutput = UniversalDateUtils.resetEndTime(oInput, true);
			assert.equal(oInput.getTime(), fFixedDateTime, "resetEndTime(,true): input date has not been modified");
			assert.ok(oOutput !== oInput,
				"resetEndTime(,true): returned date must not be the same object as the input date");
			assert.equal(oOutput.getCalendarType(), sCalendarType,
				"resetEndTime(,true): returned calendar type must be the same as the input calendar type");

			["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"].forEach(function(sUnit) {
				var sPrefix;

				oOutput = UniversalDateUtils.getRange(-2, sUnit, oInput);
				sPrefix = "getRange(-2," + sUnit + ",): ";
				assert.equal(oInput.getTime(), fFixedDateTime, sPrefix + "input date has not been modified");
				assert.ok(oOutput[0] !== oInput,
					sPrefix + "returned start date must not be the same as the input date");
				assert.equal(oOutput[0].getCalendarType(), sCalendarType,
					sPrefix + "returned start calendar type must be the same as the input calendar type");
				assert.ok(oOutput[1] !== oInput,
					sPrefix + "returned start date must not be the same as the input date");
				assert.equal(oOutput[1].getCalendarType(), sCalendarType,
					sPrefix + "returned end calendar type must be the same as the input calendar type");
				oOutput = UniversalDateUtils.getRange(-2, sUnit, oInput);

				oOutput = UniversalDateUtils.getRange(2, sUnit, oInput);
				sPrefix = "getRange(2," + sUnit + ",): ";
				assert.equal(oInput.getTime(), fFixedDateTime, sPrefix + "input date has not been modified");
				assert.ok(oOutput[0] !== oInput,
					sPrefix + "returned start date must not be the same as the input date");
				assert.equal(oOutput[0].getCalendarType(), sCalendarType,
					sPrefix + "returned start calendar type must be the same as the input calendar type");
				assert.ok(oOutput[1] !== oInput,
					sPrefix + "returned start date must not be the same as the input date");
				assert.equal(oOutput[1].getCalendarType(), sCalendarType,
					sPrefix + "returned end calendar type must be the same as the input calendar type");

				oOutput = UniversalDateUtils.getRange(0, sUnit, oInput);
				sPrefix = "getRange(0," + sUnit + ",): ";
				assert.equal(oInput.getTime(), fFixedDateTime, sPrefix + "input date has not been modified");
			});
		});
	});

});