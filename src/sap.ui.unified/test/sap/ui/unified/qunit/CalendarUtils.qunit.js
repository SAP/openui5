/*global QUnit, sinon, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/calendar/CalendarUtils",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/Persian",
	"sap/ui/core/date/Japanese",
	"sap/ui/core/date/Buddhist",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/core/Locale",
	"sap/ui/core/CalendarType"
], function(qutils, CalendarUtils, UniversalDate, Islamic, Persian, Japanese, Buddhist, CalendarDate, Locale, CalendarType) {
	"use strict";

	QUnit.module("getFirstDateOfWeek/Month for week Sunday-Saturday (en_US locale)", {
		beforeEach: function () {
			this.oStub1 = sinon.stub(sap.ui.getCore().getConfiguration().getFormatSettings(), "getFormatLocale", function () {
				return new Locale("en_US");//first date of week is Sunday (JS Date.getDay() = 0)
			});
			this.oStub2 = sinon.stub(sap.ui.getCore().getConfiguration(), "getFormatLocale", function () {
				return new Locale("en_US");//first date of week is Sunday (JS Date.getDay() = 0)
			});
		},
		afterEach: function () {
			this.oStub1.restore();
			this.oStub2.restore();
		}
	});

	QUnit.test("getFirstDateOfWeek() for US border case where the first date of the first week is in the previous year", function(assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 0, 1, 0))).toString(), new Date(Date.UTC(2015, 11, 27, 0)).toString(),
			"1 Jan 2016->27 Dec 2015");
	});

	QUnit.test("getFirstDateOfWeek() for US border case where the first date of the first week matches the CLDR's firstDayOfWeek(i.e. Sunday, Monday)", function(assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2017, 0, 1, 0))).toString(), new Date(Date.UTC(2017, 0, 1, 0)).toString(),
			"1 Jan 2017->1 Jan 2017");
	});

	QUnit.test("getFirstDateOfWeek() for date at the middle of the month", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 4, 18, 0))).toString(), new Date(Date.UTC(2016, 4, 15, 0)).toString(),
			"18 May 2016->15 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the beginning of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 4, 1, 0))).toString(), new Date(Date.UTC(2016, 4, 1, 0)).toString(),
			"1 May 2016->1 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the end of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 9, 1, 0))).toString(), new Date(Date.UTC(2016, 8, 25, 0)).toString(),
			"1 Oct 2016->25 Sep 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the middle of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 5, 1, 0))).toString(), new Date(Date.UTC(2016, 4, 29, 0)).toString(),
			"1 Jun 2016->29 May 2016");
	});

	QUnit.test("getFirstDateOfMonth() returns the first date of the month for a given date", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfMonth(new Date(Date.UTC(2016, 5, 12, 0))).toString(), new Date(Date.UTC(2016, 5, 1, 0)).toString(),
			"12 Jun 2016 -> 1 Jun 2016");
	});

	QUnit.test("getFirstDateOfWeek() with different calendar types", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Islamic(Islamic.UTC(1438, 2, 1, 0))).toString(), new Islamic(Islamic.UTC(1438, 1, 26, 0)).toString(),
			"1 Rab. I 1438->26 Saf. 1438");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Persian(Persian.UTC(1395, 8, 11, 0))).toString(), new Persian(Persian.UTC(1395, 8, 7, 0)).toString(),
			"11 Azar 1395->7 Azar 1395");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Japanese(Japanese.UTC([235, 28], 11, 1, 0))).toString(), new Japanese(Japanese.UTC([235, 28], 10, 27, 0)).toString(),
			"1 Dec 28 H->24 Nov 28 H");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Buddhist(Buddhist.UTC(2559, 11, 1, 0))).toString(), new Buddhist(Buddhist.UTC(2559, 10, 27, 0)).toString(),
			"1 Dec 2559->24 Nov 2559");
	});

	QUnit.module("getFirstDateOfWeek for week Monday-Sunday (en_GB locale)", {
		beforeEach: function () {
			this.oStub1 = sinon.stub(sap.ui.getCore().getConfiguration().getFormatSettings(), "getFormatLocale", function () {
				return new Locale("en_GB");//first date of week is Monday (JS Date.getDay() = 1)
			});
			this.oStub2 = sinon.stub(sap.ui.getCore().getConfiguration(), "getFormatLocale", function () {
				return new Locale("en_GB");//first date of week is Monday (JS Date.getDay() = 1)
			});
		},
		afterEach: function () {
			this.oStub1.restore();
			this.oStub2.restore();
		}
	});

	QUnit.test("getFirstDateOfWeek() for non US border case where the first date of the first week is in the previous year", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 0, 1, 0))).toString(), new Date(Date.UTC(2015, 11, 28, 0)).toString(),
			"1 Jan 2016->28 Dec 2015");
	});

	QUnit.test("getFirstDateOfWeek() for date at the middle of the month", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 4, 18, 0))).toString(), new Date(Date.UTC(2016, 4, 16, 0)).toString(),
			"18 May 2016->16 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the beginning of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 1, 1, 0))).toString(), new Date(Date.UTC(2016, 1, 1, 0)).toString(),
			"1 Feb 2016->1 Feb 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the end of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 4, 1, 0))).toString(), new Date(Date.UTC(2016, 3, 25, 0)).toString(),
			"1 May 2016->25 Apr 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the middle of the week", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Date(Date.UTC(2016, 11, 1, 0))).toString(), new Date(Date.UTC(2016, 10, 28, 0)).toString(),
			"1 Dec 2016->25 Nov 2016");
	});

	QUnit.test("getFirstDateOfWeek() with different calendar types", function (assert) {
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Islamic(Islamic.UTC(1438, 2, 1, 0))).toString(), new Islamic(Islamic.UTC(1438, 1, 27, 0)).toString(),
			"1 Rab. I 1438->27 Saf. 1438");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Persian(Persian.UTC(1395, 8, 11, 0))).toString(), new Persian(Persian.UTC(1395, 8, 8, 0)).toString(),
			"11 Azar 1395->8 Azar 1395");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Japanese(Japanese.UTC([235, 28], 11, 1, 0))).toString(), new Japanese(Japanese.UTC([235, 28], 10, 28, 0)).toString(),
			"1 Dec 28 H->25 Nov 28 H");
		assert.equal(CalendarUtils.getFirstDateOfWeek(new Buddhist(Buddhist.UTC(2559, 11, 1, 0))).toString(), new Buddhist(Buddhist.UTC(2559, 10, 28, 0)).toString(),
			"1 Dec 2559->25 Nov 2559");
	});

	QUnit.module("getNumberOfWeeksForAYear()", {
		beforeEach: function () {
			this._oUI5Core = sap.ui.getCore();
			this._oBigYears = {"en-US": [1972, 1977, 1983, 1988, 1994, 2000, 2005, 2011, 2016], "en-GB": [1970, 1976, 1981, 1987, 1992, 1998, 2004, 2009, 2015]};
			this._oRegularYears = {"en-US": [1970, 1975, 1980, 1985, 1992, 1998, 2003, 2008, 2013], "en-GB": [1972, 1977, 1983, 1988, 1994, 2000, 2005, 2011, 2016]};
		},
		afterEach: function () {},
		_fnBigYearTest: function (iYear, assert) {
			var iNumberOfWeeksForYear = CalendarUtils._getNumberOfWeeksForYear(iYear);
			//assert
			assert.strictEqual(iNumberOfWeeksForYear, 53, "Correct number of weeks (" + iNumberOfWeeksForYear + ") for year " + iYear);
		},
		_fnRegularYearTest: function (iYear, assert) {
			var iNumberOfWeeksForYear = CalendarUtils._getNumberOfWeeksForYear(iYear);
			//assert
			assert.strictEqual(iNumberOfWeeksForYear, 52, "Correct number of weeks (" + iNumberOfWeeksForYear + ") for year " + iYear);
		}
	});

	QUnit.test("en-US locale", function (assert) {
		//prepare
		this._oUI5Core.getConfiguration().setFormatLocale('en-US');
		this._oUI5Core.applyChanges();
		//act
		this._oBigYears["en-US"].forEach(function (iYear) {
			this._fnBigYearTest(iYear, assert);
		}, this);
		this._oRegularYears["en-US"].forEach(function (iYear) {
			this._fnRegularYearTest(iYear, assert);
		}, this);
	});

	QUnit.test("en-GB locale", function (assert) {
		//prepare
		this._oUI5Core.getConfiguration().setFormatLocale('en-GB');
		this._oUI5Core.applyChanges();
		//act
		this._oBigYears["en-GB"].forEach(function (iYear) {
			this._fnBigYearTest(iYear, assert);
		}, this);
		this._oRegularYears["en-GB"].forEach(function (iYear) {
			this._fnRegularYearTest(iYear, assert);
		}, this);
	});

	QUnit.module("Calculate week number");

	QUnit.test("Week number when locale is valid en-US", function(assert) {
		// prepare
		var iWeekNumber_enUS,
			iWeekNumber_enUS_custom,
			oDate,
			oLocale,
			oLocaleData;

		oDate = new Date(Date.UTC(2016, 10, 17, 0)); // 17.11.2016
		oLocale = new Locale('en-US');
		oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);

		// act
		iWeekNumber_enUS = CalendarUtils.calculateWeekNumber(oDate, 2016, 'en-US-x-sapufmt', oLocaleData);
		iWeekNumber_enUS_custom = CalendarUtils.calculateWeekNumber(oDate, 2016, 'en-US', oLocaleData);

		// assert
		assert.strictEqual(iWeekNumber_enUS, 47, "The week is 47 for 17.11.2016 when locale is en-US-x-sapufmt");
		assert.strictEqual(iWeekNumber_enUS_custom, 47, "The week is 47 for 17.11.2016 when locale is en-US");
	});

	QUnit.test("Week number when locale is en-GB", function(assert) {
		// prepare
		var iWeekNumber,
			oDate,
			oLocale,
			oLocaleData;

		oDate = new Date(Date.UTC(2016, 10, 17, 0)); // 17.11.2016
		oLocale = new Locale('en-GB');
		oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);

		// act
		iWeekNumber = CalendarUtils.calculateWeekNumber(oDate, 2016, 'en-GB', oLocaleData);

		// assert
		assert.strictEqual(iWeekNumber, 46, "The week is 46 for 17.11.2016 when locale is en-GB");
	});

	QUnit.test("'isDateLastInMonth' checks if the corresponding date is last in a month depending on its parameter", function(assert) {
		//prepare
		var oSut = CalendarUtils,
			oLastDateInTheMonth = new UniversalDate(Date.UTC(2015, 0, 31)),
			oNotLastDateInTheMonth = new UniversalDate(Date.UTC(2015, 0, 15));

		//assert
		assert.ok(oSut.isDateLastInMonth(oLastDateInTheMonth), "Jan 31st is the last date of the month");
		assert.ok(!oSut.isDateLastInMonth(oNotLastDateInTheMonth), "Jan 15th is not the last date of the month");
	});

	QUnit.test('_isNextMonth', function(assert) {
		var oDate = new Date(2011, 10, 11);
		assert.ok(CalendarUtils._isNextMonth(new Date(2012, 10, 11), oDate), 'month from the next year is some next month date');
		assert.ok(CalendarUtils._isNextMonth(new Date(2012, 9, 11), oDate), 'previous month from the next year is some next month date');
		assert.ok(!CalendarUtils._isNextMonth(new Date(2011, 10, 30), oDate), 'date from the same month is not a next month date');
		assert.ok(!CalendarUtils._isNextMonth(new Date(2011, 9, 30), oDate), 'date from the prev month is not a next month date');
	});

	QUnit.module("_DATE_getFirstDateOfWeek for week Sunday-Saturday (en_US locale)", {
		beforeEach: function () {
			this.oStub = sinon.stub(sap.ui.getCore().getConfiguration().getFormatSettings(), "getFormatLocale", function () {
				return new Locale("en_US");//first date of week is Sunday (JS Date.getDay() = 0)
			});
		},
		afterEach: function () {
			this.oStub.restore();
		}
	});

	QUnit.test("getFirstDateOfWeek() throws with invalid parameters", function(assert) {

		assert.throws(function() {
			CalendarUtils._getFirstDateOfWeek();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._getFirstDateOfWeek(null);
		}, "with null as a parameter");

	});

	QUnit.test("getFirstDateOfWeek() for US border case where the first date of the first week is in the previous year", function(assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 0, 1)).toString(), CalendarUtils._getFirstDateOfWeek(new CalendarDate(2015, 11, 27)).toString(),
			"1 Jan 2016->27 Dec 2015");
	});

	QUnit.test("getFirstDateOfWeek() for date at the middle of the month", function(assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 18)).toString(), CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 15)).toString(),
			"18 May 2016->15 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the beginning of the week", function(assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 1)).toString(), CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 1)).toString(),
			"1 May 2016->1 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the end of the week", function(assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 9, 1)).toString(), CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 8, 25)).toString(),
			"1 Oct 2016->25 Sep 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the middle of the week", function(assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 5, 1)).toString(), CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 29)).toString(),
			"1 Jun 2016->29 May 2016");
	});

	QUnit.module("_getFirstDateOfWeek(CalendarDate) for week Monday-Sunday (en_GB locale)", {
		beforeEach: function () {
			this.oStub = sinon.stub(sap.ui.getCore().getConfiguration().getFormatSettings(), "getFormatLocale", function () {
				return new Locale("en_GB");//first date of week is Monday (JS Date.getDay() = 1)
			});
		},
		afterEach: function () {
			this.oStub.restore();
		}
	});

	QUnit.test("getFirstDateOfWeek() for non US border case where the first date of week is in the previous year", function (assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 0, 1)).toString(), new CalendarDate(2015, 11, 28).toString(),
			"1 Jan 2016->28 Dec 2015");
	});

	QUnit.test("getFirstDateOfWeek() for date at the middle of the month", function (assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 18)).toString(), new CalendarDate(2016, 4, 16).toString(),
			"18 May 2016->16 May 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the beginning of the week", function (assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 1, 1)).toString(), new CalendarDate(2016, 1, 1).toString(),
			"1 Feb 2016->1 Feb 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the end of the week", function (assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 4, 1)).toString(), new CalendarDate(2016, 3, 25).toString(),
			"1 May 2016->25 Apr 2016");
	});

	QUnit.test("getFirstDateOfWeek() when 1st date of the month is at the middle of the week", function (assert) {
		assert.equal(CalendarUtils._getFirstDateOfWeek(new CalendarDate(2016, 11, 1)).toString(), new CalendarDate(2016, 10, 28).toString(),
			"1 Dec 2016->25 Nov 2016");
	});

	QUnit.module("Utilities with CalendarDate");

	QUnit.test("_daysInMonth", function(assert) {

		assert.throws(function() {
			CalendarUtils._daysInMonth();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._daysInMonth(null);
		}, "with null as a parameter");

		assert.equal(CalendarUtils._daysInMonth(new CalendarDate(2017, 0, 5)), 31, "in 31-day month");
		assert.equal(CalendarUtils._daysInMonth(new CalendarDate(2017, 1, 5)), 28, "in 28-day month");
		assert.equal(CalendarUtils._daysInMonth(new CalendarDate(2016, 1, 5)), 29, "in 29-day month");
		assert.equal(CalendarUtils._daysInMonth(new CalendarDate(2017, 3, 5)), 30, "in 30-day month");

	});

	QUnit.test("_isLastDateInMonth", function(assert) {

		assert.throws(function() {
			CalendarUtils._isLastDateInMonth();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._isLastDateInMonth(null);
		}, "with null as a parameter");

		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2017, 0, 31)), true, "last day in 31-day month");
		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2017, 2, 31)), true, "last day in 31-day month");
		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2017, 1, 28)), true, "last day in 28-day month");
		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2016, 1, 29)), true, "last day in 29-day month");
		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2017, 3, 30)), true, "last day in 30-day month");
		assert.equal(CalendarUtils._isLastDateInMonth(new CalendarDate(2017, 3, 1)), false, "first day");

	});

	QUnit.test("_getFirstDateOfMonth", function(assert) {

		assert.throws(function() {
			CalendarUtils._getFirstDateOfMonth();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._getFirstDateOfMonth(null);
		}, "With null as a parameter");

		CalendarUtils._getFirstDateOfMonth(new CalendarDate(2017, 1, 29));
		assert.ok(true, "getFirstDateOfMonth with invalid date as a parameter does not throw an error");

		CalendarUtils._getFirstDateOfMonth(new CalendarDate(2017, 3, 31));
		assert.ok(true, "getFirstDateOfMonth with invalid date as a parameter does not throw an error");

		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2017, 2, 28)).getYear(), 2017, "the year is the same");
		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2017, 2, 28)).getMonth(), 2, "the month is the same");
		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2017, 2, 28)).getDate(), 1, "the date is the same");
		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2016, 2, 29)).getYear(), 2016, "the year is the same in a leap year");
		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2016, 2, 29)).getMonth(), 2, "the month is the same in a leap year");
		assert.equal(CalendarUtils._getFirstDateOfMonth(new CalendarDate(2016, 2, 29)).getDate(), 1, "the date is the same in a leap year");


	});

	QUnit.test("_minDate", function(assert) {

		CalendarUtils._minDate();
		assert.ok(true, "minDate without parameters does not throw an error");

		CalendarUtils._minDate(null);
		assert.ok(true, "minDate with null as a parameter does not throw an error");

		assert.equal(CalendarUtils._minDate("Gregorian").getYear(), 1, "the year is the same");
		assert.equal(CalendarUtils._minDate("Gregorian").getMonth(), 0, "the month is the same");
		assert.equal(CalendarUtils._minDate("Gregorian").getDate(), 1, "the date is the same");

		assert.equal(CalendarUtils._minDate("Islamic").getYear(), 1, "the date is the same");
		assert.equal(CalendarUtils._minDate("Islamic").getMonth(), 0, "the date is the same");
		assert.equal(CalendarUtils._minDate("Islamic").getDate(), 1, "the date is the same");

		assert.equal(CalendarUtils._minDate("Persian").getYear(), 1, "the date is the same");
		assert.equal(CalendarUtils._minDate("Persian").getMonth(), 0, "the date is the same");
		assert.equal(CalendarUtils._minDate("Persian").getDate(), 1, "the date is the same");

		assert.equal(CalendarUtils._minDate("Japanese").getYear(), 1, "the date is the same");
		assert.equal(CalendarUtils._minDate("Japanese").getMonth(), 0, "the date is the same");
		assert.equal(CalendarUtils._minDate("Japanese").getDate(), 1, "the date is the same");
		assert.equal(CalendarUtils._minDate("Japanese").getEra(), 0, "the date is the same");

	});

	QUnit.test("_maxDate", function(assert) {

		CalendarUtils._maxDate();
		assert.ok(true, "maxDate without parameters does not throw an error");

		CalendarUtils._maxDate(null);
		assert.ok(true, "maxDate with null as a parameter does not throw an error");

		assert.equal(CalendarUtils._maxDate("Gregorian").getYear(), 9999, "the year is the same");
		assert.equal(CalendarUtils._maxDate("Gregorian").getMonth(), 11, "the month is the same");
		assert.equal(CalendarUtils._maxDate("Gregorian").getDate(), 31, "the date is the same");

		assert.equal(CalendarUtils._maxDate("Islamic").getYear(), 9999, "the year is the same");
		assert.equal(CalendarUtils._maxDate("Islamic").getMonth(), 11, "the month is the same");
		assert.equal(CalendarUtils._maxDate("Islamic").getDate(), 29, "the date is the same");

		assert.equal(CalendarUtils._maxDate("Persian").getYear(), 9999, "the year is the same");
		assert.equal(CalendarUtils._maxDate("Persian").getMonth(), 11, "the month is the same");
		assert.equal(CalendarUtils._maxDate("Persian").getDate(), 29, "the date is the same");

		assert.equal(CalendarUtils._maxDate("Japanese").getYear(), 9999, "the year is the same");
		assert.equal(CalendarUtils._maxDate("Japanese").getMonth(), 11, "the month is the same");
		assert.equal(CalendarUtils._maxDate("Japanese").getDate(), 31, "the date is the same");
		assert.equal(CalendarUtils._maxDate("Japanese").getEra(), 236, "the date is the same");

	});

	QUnit.test('_isBetween', function(assert) {
		assert.throws(function() {
			CalendarUtils._isBetween();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._isBetween(null, new CalendarDate());
		}, "Without first parameter");

		assert.throws(function() {
			CalendarUtils._isBetween(new CalendarDate());
		}, "Without second parameter");

		assert.throws(function() {
			CalendarUtils._isBetween(new CalendarDate(), new CalendarDate());
		}, "Without third parameter");

		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 7), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), true, "the date is in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 3), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 13), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 10), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 10), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10), false), false, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10), false), false, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 10), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10), true), true, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10), true), true, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), false, "the date is in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), false, "the date is in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2017, 1, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), false, "the date is not in the range");
		assert.equal(CalendarUtils._isBetween(new CalendarDate(2016, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), false, "the date is not in the range");
	});

	QUnit.test("_hoursBetween", function(assert) {

		assert.throws(function() {
			CalendarUtils._hoursBetween();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._hoursBetween(null, new Date());
		}, "Without first parameter");

		assert.throws(function() {
			CalendarUtils._hoursBetween(new Date());
		}, "Without second parameter");

		assert.equal(CalendarUtils._hoursBetween(new Date(2017, 0, 1, 8, 0, 0), new Date(2017, 0, 1, 9, 0, 0)), 1, "1 hour in the same day");
		assert.equal(CalendarUtils._hoursBetween(new Date(2017, 0, 1, 23, 0, 0), new Date(2017, 0, 2, 0, 0, 0)), 1, "1 hour in different days");
		assert.equal(CalendarUtils._hoursBetween(new Date(2017, 0, 31, 23, 0, 0), new Date(2017, 1, 1, 0, 0, 0)), 1, "1 hour in different months");
		assert.equal(CalendarUtils._hoursBetween(new Date(2016, 11, 31, 23, 0, 0), new Date(2017, 0, 1, 0, 0, 0)), 1, "1 hour in different years");
		assert.equal(CalendarUtils._hoursBetween(new Date(2017, 0, 1, 9, 0, 0), new Date(2017, 0, 1, 8, 0, 0)), 1, "1 hour negative");
		assert.equal(CalendarUtils._hoursBetween(new Date(2017, 0, 1, 8, 0, 0), new Date(2017, 0, 1, 8, 0, 0)), 0, "no delta");

	});

	QUnit.test("_daysBetween", function(assert) {

		assert.throws(function() {
			CalendarUtils._daysBetween();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._daysBetween(null, new CalendarDate());
		}, "Without first parameter");

		assert.throws(function() {
			CalendarUtils._daysBetween(new CalendarDate());
		}, "Without second parameter");

		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 0, 2), new CalendarDate(2017, 0, 1)), 1, "1 day in the same month");
		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 1, 1), new CalendarDate(2017, 0, 31)), 1, "1 day in different months");
		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 0, 1), new CalendarDate(2016, 11, 31)), 1, "1 day in different years");
		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 0, 1), new CalendarDate(2017, 0, 2)), -1, "1 day negative");

		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 0, 1), new CalendarDate(2017, 0, 1)), 0, "no delta");
		assert.equal(CalendarUtils._daysBetween(new CalendarDate(2017, 0, 1, sap.ui.core.CalendarType.Islamic),
			new CalendarDate(2017, 0, 2, sap.ui.core.CalendarType.Islamic)), -1, "1 day negative");

	});

	QUnit.test("_monthsBetween", function(assert) {

		assert.throws(function() {
			CalendarUtils._monthsBetween();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._monthsBetween(null, new Date());
		}, "Without first parameter");

		assert.throws(function() {
			CalendarUtils._monthsBetween(new Date());
		}, "Without second parameter");

		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2017, 1, 1)), 1, "with abs(): 1 month in the same year");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2016, 11, 1)), 1, "with abs(): 1 month in different years");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 1, 1), new Date(2017, 0, 1)), 1, "with abs(): 1 month negative");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2017, 0, 1)), 0, "with abs(): no delta");

		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2017, 1, 1), true), 1, "without abs(): 1 month in the same year");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2016, 11, 1), true), -1, "without abs(): 1 month in different years");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 1, 1), new Date(2017, 0, 1), true), -1, "without abs(): 1 month negative");
		assert.equal(CalendarUtils._monthsBetween(new Date(2017, 0, 1), new Date(2017, 0, 1), true), 0, "without abs(): no delta");

	});

	QUnit.test('_isOutside', function(assert) {
		assert.throws(function() {
			CalendarUtils._isOutside();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._isOutside(null, new CalendarDate());
		}, "Without first parameter");

		assert.throws(function() {
			CalendarUtils._isOutside(new CalendarDate());
		}, "Without second parameter");

		assert.throws(function() {
			CalendarUtils._isOutside(new CalendarDate(), new CalendarDate());
		}, "Without third parameter");

		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 7), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 3), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), true, "the date is not in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 13), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), true, "the date is not in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 10), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 10)), false, "the date is in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), false, "the date is in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2017, 1, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), true, "the date is not in the range");
		assert.equal(CalendarUtils._isOutside(new CalendarDate(2016, 0, 5), new CalendarDate(2017, 0, 5), new CalendarDate(2017, 0, 5)), true, "the date is not in the range");
	});

	QUnit.test("_isSameMonthAndYear", function(assert) {

		assert.throws(function() {
			CalendarUtils._isSameMonthAndYear();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._isSameMonthAndYear(null, new CalendarDate(2017, 2, 2));
		}, "without first parameter");

		assert.throws(function() {
			CalendarUtils._isSameMonthAndYear(new CalendarDate(2017, 2, 2));
		}, "without second parameter");

		assert.equal(CalendarUtils._isSameMonthAndYear(new CalendarDate(2017, 1, 5), new CalendarDate(2017, 1, 5)), true, "the date is in the same month and year");
		assert.equal(CalendarUtils._isSameMonthAndYear(new CalendarDate(2017, 0, 5), new CalendarDate(2017, 1, 5)), false, "the date is not in the same month and year");
		assert.equal(CalendarUtils._isSameMonthAndYear(new CalendarDate(2016, 1, 5), new CalendarDate(2017, 1, 5)), false, "the date is not in the same month and year");

	});

	// BCP: 1970123874
	QUnit.test("_isSameMonthAndYear Japanese", function(assert) {
		var o11_Feb_31_Showa = CalendarDate.fromLocalJSDate(new Date(-438307200000), CalendarType.Japanese);
		var o11_Feb_31_Heisei = CalendarDate.fromLocalJSDate(new Date(1549843200000), CalendarType.Japanese);

		assert.equal(
			CalendarUtils._isSameMonthAndYear(o11_Feb_31_Showa, o11_Feb_31_Heisei),
			false,
			"not the same month and year"
		);
	});

	QUnit.test("_checkCalendarDate", function(assert) {

		assert.throws(function() {
			CalendarUtils._checkCalendarDate();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._checkCalendarDate(null);
		}, "null passed");

		assert.throws(function() {
			CalendarUtils._checkCalendarDate(new CalendarDate(2017, 2));
		}, "Indalid date");

		CalendarUtils._checkCalendarDate(new CalendarDate(2017, 0, 2));
		assert.ok(true, "when valid date, there is no exeption thrown");

	});

	QUnit.test("_getWeek", function(assert) {

		assert.throws(function() {
			CalendarUtils._getWeek();
		}, "Without parameters");

		assert.throws(function() {
			CalendarUtils._getWeek(null);
		}, "With null as a parameter");

		assert.deepEqual(CalendarUtils._getWeek(new CalendarDate(2017, 0, 1)), {year: 2016, week: 51}, "returns last week of 2016 when first date of 2017 is passed");
		assert.deepEqual(CalendarUtils._getWeek(new CalendarDate(2016, 11, 31)), {year: 2016, week: 51}, "returns last week of 2016 when last date of 2016 is passed");
		assert.deepEqual(CalendarUtils._getWeek(new CalendarDate(2017, 0, 8)), {year: 2017, week: 0}, "returns first week of 2017 when 8 date of 2017 is passed");
		assert.deepEqual(CalendarUtils._getWeek(new CalendarDate(2017, 0, 9)), {year: 2017, week: 1}, "returns second week of 2017 when 9 date of 2017 is passed");

	});

	// BCP: 1880065660
	QUnit.test("_checkJSDateObject with iframe's JS date object should work properly", function (assert) {
		// arrange
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		var oWindow = iframe.contentWindow;
		oWindow.dateObj = new oWindow.Date(2017, 11, 12);

		// act
		CalendarUtils._checkJSDateObject(oWindow.dateObj);

		// assert
		assert.ok(true, "_checkJSDateObject did not throw an expection with date object from an iframe");

		// cleanup
		document.body.removeChild(iframe);
		iframe = null;
	});




	QUnit.module("Handling year and date check");

	QUnit.test("Check if Year is in the valid range", function (assert) {

		CalendarUtils._checkYearInValidRange(2017);
		assert.ok(true, "year 2017 is in the correct range 1 - 9999");

		assert.throws(function () {
			CalendarUtils._checkYearInValidRange(-1);
		}, "Year is less than 1");

		assert.throws(function () {
			CalendarUtils._checkYearInValidRange(100000);
		}, "Year is more than 9999");

		assert.throws(function () {
			CalendarUtils._checkYearInValidRange();
		}, "Year is undefined");

		assert.throws(function () {
			CalendarUtils._checkYearInValidRange(null);
		}, "Year is null");

		assert.throws(function () {
			CalendarUtils._checkYearInValidRange("test");
		}, "Year is not a number");
	});

	QUnit.test("Check if the given date is valid JavaScript date object", function (assert) {

		CalendarUtils._checkJSDateObject(new Date());
		assert.ok(true, "given date is JavaScript date object");

		assert.throws(function () {
			CalendarUtils._checkJSDateObject("test some invalid date");
		}, "Date is not valid JS date Object");

		assert.throws(function () {
			CalendarUtils._checkJSDateObject();
		}, "Date is undefined");

		assert.throws(function () {
			CalendarUtils._checkJSDateObject(null);
		}, "Date is null");
	});


	QUnit.module("Misc");

	QUnit.test("_minutesBetween", function (assert) {
		// Arrange
		var iMinutes,
			oAppStartDate,
			oAppEndDate;

		oAppStartDate = new Date("2018", "6", "9", "9", "0");
		oAppEndDate = new Date("2018", "6", "9", "11", "00");

		iMinutes = CalendarUtils._minutesBetween(oAppStartDate, oAppEndDate);
		assert.equal(iMinutes, 120, "minutes between given dates should be 120");

		oAppStartDate = new Date("2018", "6", "9", "9", "0", "10");
		oAppEndDate = new Date("2018", "6", "9", "11", "00", "23");

		iMinutes = CalendarUtils._minutesBetween(oAppStartDate, oAppEndDate);
		assert.equal(iMinutes, 120, "minutes between given dates should be 120, the seconds will be rounded");

	});

});