/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Locale",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/Gregorian",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/Japanese",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Configuration",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(Locale, UniversalDate, Gregorian, Islamic, Japanese, UI5Date, CalendarType,
		Configuration, CalendarWeekNumbering) {
	"use strict";

	const sLanguage = Configuration.getLanguage();
	//next values must not overlap each other!
	var year = 1400,
		month = 3,
		date = 10,
		hours = 13,
		minutes = 10,
		seconds = 1,
		milliseconds = 110;
	var testParameter1 = [year, month, date, hours, minutes, seconds, milliseconds], testParameter2 = {};
	testParameter2[year] = "year";
	testParameter2[month] = "month";
	testParameter2[date] = "date";
	testParameter2[hours] = "hours";
	testParameter2[minutes] = "minutes";
	testParameter2[seconds] = "seconds";
	testParameter2[milliseconds] = "milliseconds";

	QUnit.module("sap.ui.core.date.UniversalDate", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			Configuration.setLanguage("en-US");
			this.oStubCalendarType = this.stub(Configuration, "getCalendarType");
			this.oStubCalendarType.returns(CalendarType.Gregorian);
			this.dateSpy = this.spy(window, 'Date');
		},
		afterEach: function () {
			this.dateSpy.restore();
			Configuration.setLanguage(sLanguage);
		}
	});

	QUnit.test("with no arguments", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate();
		assert.ok(this.dateSpy.calledOnce, "InnerDate must be instantiated just ones");
		assert.equal(this.dateSpy.firstCall.args.length, 0, "InnerDate must be instantiated with no arguments");
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(1000);
		assert.ok(this.dateSpy.calledOnce, "InnerDate must be instantiated just ones");
		assert.equal(this.dateSpy.firstCall.args.length, 1, "Wrapped date must be instantiated with just one argument");
		assert.equal(this.dateSpy.firstCall.args[0], 1000, "Wrapped date must be instantiated with singe argument with particular value");
	});

	QUnit.test("with all 7 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month, date, hours, minutes, seconds, milliseconds);
		check.call(this, assert, 7);
	});

	QUnit.test("with 6 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month, date, hours, minutes, seconds);
		check.call(this, assert, 6);
	});

	QUnit.test("with 5 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month, date, hours, minutes);
		check.call(this, assert, 5);
	});

	QUnit.test("with 4 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month, date, hours);
		check.call(this, assert, 4);
	});

	QUnit.test("with 3 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month, date);
		check.call(this, assert, 3);
	});

	QUnit.test("with 2 parameters", function (assert) {
		// eslint-disable-next-line no-new
		new UniversalDate(year, month);
		check.call(this, assert, 2);
	});

	QUnit.test("getClass", function(assert) {
		var oClass;

		oClass = UniversalDate.getClass(CalendarType.Gregorian);
		assert.equal(oClass, Gregorian, "getClass returns correct class object");

		oClass = UniversalDate.getClass(CalendarType.Islamic);
		assert.equal(oClass, Islamic, "getClass returns correct class object");

		oClass = UniversalDate.getClass(CalendarType.Japanese);
		assert.equal(oClass, Japanese, "getClass returns correct class object");
	});

	QUnit.test("getInstance creates UI5Date", function(assert) {
		var oInnerDate = UI5Date.getInstance(),
			// no need to use UI5Date.getInstance as native Date is tested
			oNativeDate = new Date(),
			oUI5DateMock = this.mock(UI5Date),
			oUniversalDate = UniversalDate.getInstance();

		oUI5DateMock.expects("getInstance").withExactArgs().returns("~ui5Date");

		// code under test: w/o oDate
		assert.strictEqual(UniversalDate.getInstance().oDate, "~ui5Date");

		oUI5DateMock.expects("getInstance").withExactArgs(sinon.match.same(oNativeDate)).returns("~ui5Date");

		// code under test: with JS Date
		assert.strictEqual(UniversalDate.getInstance(oNativeDate).oDate, "~ui5Date");

		this.mock(oUniversalDate).expects("getJSDate").withExactArgs().returns(oInnerDate);
		oUI5DateMock.expects("getInstance").withExactArgs(sinon.match.same(oInnerDate)).returns("~ui5Date");

		// code under test: with UniversalDate
		assert.strictEqual(UniversalDate.getInstance(oUniversalDate).oDate, "~ui5Date");
	});

	QUnit.test("getInstance", function(assert) {
		var oDate, oGregorian, oJSDate = UI5Date.getInstance();

		// Explicit calendar type
		oDate = UniversalDate.getInstance(oJSDate, CalendarType.Gregorian);
		assert.ok(oDate instanceof Gregorian, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Gregorian", "Calendar type is set correctly");

		oDate = UniversalDate.getInstance(oJSDate, CalendarType.Islamic);
		assert.ok(oDate instanceof Islamic, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Islamic", "Calendar type is set correctly");

		oDate = UniversalDate.getInstance(oJSDate, CalendarType.Japanese);
		assert.ok(oDate instanceof Japanese, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Japanese", "Calendar type is set correctly");

		// Default calendar type
		oDate = UniversalDate.getInstance(oJSDate);
		assert.ok(oDate instanceof Gregorian, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Gregorian", "Calendar type is set correctly");

		// Default date
		oDate = UniversalDate.getInstance();
		assert.ok(oDate.oDate instanceof Date, "oDate field is set");

		// getInstance with other UniversalDate
		oGregorian = new Gregorian();
		oDate = UniversalDate.getInstance(oGregorian, CalendarType.Islamic);
		assert.ok(oDate instanceof Islamic, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Islamic", "Calendar type is set correctly");

		oDate = UniversalDate.getInstance(oGregorian, CalendarType.Japanese);
		assert.ok(oDate instanceof Japanese, "getInstance returns expected object");
		assert.equal(oDate.getCalendarType(), "Japanese", "Calendar type is set correctly");

	});

	QUnit.test("determineType with Gregorian calendar", function (assert) {
		this.oStubCalendarType.returns(CalendarType.Gregorian);
		const spy = this.spy(sap.ui.core.date, 'Gregorian');
		const oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Gregorian must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Gregorian, "Date object must be instance of Gregorian");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Gregorian, "Universal date must report correct calendarType");
	});

	QUnit.test("determineType with Islamic calendar", function (assert) {
		this.oStubCalendarType.returns(CalendarType.Islamic);
		const spy = this.spy(sap.ui.core.date, 'Islamic');
		const oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Islamic must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Islamic, "Date object must be instance of Islamic");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Islamic, "Universal date must report correct calendarType");
	});

	QUnit.test("determineType with Japanese calendar", function (assert) {
		this.oStubCalendarType.returns(CalendarType.Japanese);
		const spy = this.spy(sap.ui.core.date, 'Japanese');
		const oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Japanese must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Japanese, "Date object must be instance of Japanese");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Japanese, "Universal date must report correct calendarType");
	});

	//*********************************************************************************************
[
	"getFullYear", "getYear", "getMonth", "getDate", "getDay", "getHours", "getMinutes",
	"getSeconds", "getMilliseconds", "getUTCFullYear", "getUTCMonth", "getUTCDate", "getUTCDay",
	"getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds", "setFullYear",
	"setYear", "setDate", "setMonth", "setHours", "setMinutes", "setSeconds", "setMilliseconds",
	"setUTCFullYear", "setUTCDate", "setUTCMonth", "setUTCHours", "setUTCMinutes", "setUTCSeconds",
	"setUTCMilliseconds", "getTime", "getTimezoneOffset", "valueOf", "toString", "toDateString"
].forEach(function (sMethodName) {
	QUnit.test("Method calls are forwarded to inner instance: " + sMethodName, function (assert) {
		const oUniversalDate = UniversalDate.getInstance();
		const oStub = this.stub(oUniversalDate.oDate, sMethodName);

		oStub.withArgs("~foo", "~bar").returns("~result");

		// code under test
		assert.strictEqual(oUniversalDate[sMethodName]("~foo", "~bar"), "~result");
	});
});

	QUnit.test("Static methods call is forwarded to inner instance", function (assert) {
		this.dateSpy.restore();
		const aStaticMethods = [
			{name: "UTC", hasArgs: true},
			{name: "now"}
		];
		const aMethodCallArg = [10, 11];

		for (let i = 0; i < aStaticMethods.length; i += 1) {
			const sMethodName = aStaticMethods[i].name;
			const bMethodHasArgs = aStaticMethods[i].hasArgs;
			const MockDateClass = function () {};
			MockDateClass.prototype = Date.prototype;
			MockDateClass.prototype[sMethodName] = () => {};
			MockDateClass[sMethodName] = () => {};

			const d = new MockDateClass();
			const oDateConstructorStub = this.stub(window, 'Date').returns(d);
			const oMethodStub = this.stub(d, sMethodName).returns(111);
			Date[sMethodName] = d[sMethodName]; //eslint-disable-line no-extend-native

			let result;
			if (bMethodHasArgs) {
				result = UniversalDate[sMethodName](aMethodCallArg[0], aMethodCallArg[1]);
			} else {
				result = UniversalDate[sMethodName]();
			}

			assert.equal(oMethodStub.callCount, 1, "Method [" + sMethodName + "] has to be called once");
			if (bMethodHasArgs) {
				assert.deepEqual(oMethodStub.firstCall.args, aMethodCallArg, "Method [" + sMethodName + "] call has to be called with certain arguments");
			}

			assert.strictEqual(result, 111, "Method [" + sMethodName + "] call has to return a certain value");

			oMethodStub.restore();
			oDateConstructorStub.restore();
		}
	});

	QUnit.test("Universal objects do not interfere", function (assert) {
		this.dateSpy.restore();
		var ud1 = new UniversalDate(2015, 0);
		var ud2 = new UniversalDate();
		ud2.setFullYear(2016);
		assert.equal(ud1.getFullYear(), 2015, "Verify year");
		assert.equal(ud2.getFullYear(), 2016, "Verify year");
	});

	QUnit.test("getQuarter", function (assert) {
		this.dateSpy.restore();
		var aExpected = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];

		var ud;
		for (var i = 0; i < 12; i++) {
			ud =  new UniversalDate(2017, i);
			assert.equal(ud.getQuarter(), aExpected[i], "The correct quarter is returned");
		}

		// Tue, 28 Feb 2017 23:00:00 GMT
		// getUTCQuarter should return 0, getQuarter may return 1 depends on the running time zone
		var oDate = new UniversalDate(1488322800000);
		assert.equal(oDate.getUTCQuarter(), 0, "getUTCQuarter");
	});

	QUnit.test("getDayPeriod", function (assert) {
		this.dateSpy.restore();

		const aExpected = [];
		for (let i = 0; i < 12; i += 1) {
			aExpected.push(0);
		}
		for (let i = 0; i < 12; i += 1) {
			aExpected.push(1);
		}

		for (let i = 0; i < 24; i += 1) {
			const ud =  new UniversalDate(2017, 1, 1, i);
			assert.equal(ud.getDayPeriod(), aExpected[i], "The correct DayPeriod is returned");
		}

		// Wed, 01 Mar 2017 11:30:00 GMT
		// getUTCDayPeriod should return 0, getDayPeriod may return 1 depends on the running time zone
		const oDate = new UniversalDate(1488367800000);
		assert.equal(oDate.getUTCDayPeriod(), 0, "getUTCDayPeriod");
	});

	QUnit.test("setWeek/setUTCWeek", function (assert) {
		this.dateSpy.restore();

		Configuration.setLanguage("de-DE");
		var oWeekObject = new UniversalDate(2023,0,1);
		// ISO 8601 (de)
		oWeekObject.setWeek({week: 0, year: 2021});
		assert.strictEqual(oWeekObject.toString(), new UniversalDate(2021, 0, 4).toString());
		// Western Traditional (en)
		oWeekObject.setWeek({week: 0, year: 2021}, new Locale("en"));
		assert.strictEqual(oWeekObject.toString(), new UniversalDate(2020, 11, 27).toString());
		// Western Traditional (no locale)
		oWeekObject.setWeek({week: 0, year: 2021}, undefined, CalendarWeekNumbering.WesternTraditional);
		assert.strictEqual(oWeekObject.toString(), new UniversalDate(2020, 11, 27).toString());
		// Western Traditional > locale de
		oWeekObject.setWeek({week: 0, year: 2021}, new Locale("de"), CalendarWeekNumbering.WesternTraditional);
		assert.strictEqual(oWeekObject.toString(), new UniversalDate(2020, 11, 27).toString());

		oWeekObject = new UniversalDate(Date.UTC(2023,0,1));
		// ISO 8601 (de)
		oWeekObject.setUTCWeek({week: 0, year: 2021});
		assert.strictEqual(oWeekObject.getJSDate().toUTCString(),
			new UniversalDate(Date.UTC(2021, 0, 4)).getJSDate().toUTCString());
		// Western Traditional (en)
		oWeekObject.setUTCWeek({week: 0, year: 2021}, new Locale("en"));
		assert.strictEqual(oWeekObject.getJSDate().toUTCString(),
			new UniversalDate(Date.UTC(2020, 11, 27)).getJSDate().toUTCString());
		// Western Traditional (no locale)
		oWeekObject.setUTCWeek({week: 0, year: 2021}, undefined, CalendarWeekNumbering.WesternTraditional);
		assert.strictEqual(oWeekObject.getJSDate().toUTCString(),
			new UniversalDate(Date.UTC(2020, 11, 27)).getJSDate().toUTCString());
		// Western Traditional > locale de
		oWeekObject.setUTCWeek({week: 0, year: 2021}, new Locale("de"), CalendarWeekNumbering.WesternTraditional);
		assert.strictEqual(oWeekObject.getJSDate().toUTCString(),
			new UniversalDate(Date.UTC(2020, 11, 27)).getJSDate().toUTCString());
	});

	QUnit.test("getWeek/getUTCWeek with locale en_US (split week)", function (assert) {
		this.dateSpy.restore();

		const aFixtures = [
			{
				oInputDate: new UniversalDate(2020, 11, 20),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 20)),
				iExpectedYear: 2020,
				iExpectedWeek: 51
			},
			{
				oInputDate: new UniversalDate(2020, 11, 26),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 26)),
				iExpectedYear: 2020,
				iExpectedWeek: 51
			},
			{
				oInputDate: new UniversalDate(2020, 11, 27),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 27)),
				iExpectedYear: 2020,
				iExpectedWeek: 52
			},
			{
				oInputDate: new UniversalDate(2020, 11, 31),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 31)),
				iExpectedYear: 2020,
				iExpectedWeek: 52
			},
			{
				oInputDate: new UniversalDate(2021, 0, 1),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 1)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			},
			{
				oInputDate: new UniversalDate(2021, 0, 2),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 2)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			},
			{
				oInputDate: new UniversalDate(2021, 0, 3),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 3)),
				iExpectedYear: 2021,
				iExpectedWeek: 1
			}
		];

		// The US has a split week, which means that January 1st is always calendar week 1
		// and the last week of the year always ends with December 31st.
		// CW52: 2020-12-20 - 2020-12-26 ({year:2020, week:51})
		// CW53: 2020-12-27 - 2020-12-31 ({year:2020, week:52})
		// CW01: 2021-01-01 - 2021-01-02 ({year:2021, week: 0})
		// Note: function getWeek returns the calendar week index which starts at 0
		aFixtures.forEach(function(oFixture) {
			let oWeekObject = oFixture.oInputDateUTC.getUTCWeek();
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			const oLocale = new Locale("en-US");
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(oLocale, CalendarWeekNumbering.Default);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(oLocale, CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek();
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(oLocale, CalendarWeekNumbering.Default);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(oLocale, CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});
	});

	QUnit.test("getWeek/getUTCWeek with locale en (Western Traditional)", function (assert) {
		this.dateSpy.restore();

		let oWeekObject;
		const oFormatSettings = Configuration.getFormatSettings();
		const aFixtures = [
			{
				oInputDate: new UniversalDate(2020, 11, 21),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 21)),
				iExpectedYear: 2020,
				iExpectedWeek: 51
			},
			{
				oInputDate: new UniversalDate(2020, 11, 27),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 27)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			},
			{
				oInputDate: new UniversalDate(2020, 11, 28),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 28)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			},
			{
				oInputDate: new UniversalDate(2021, 0, 3),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 3)),
				iExpectedYear: 2021,
				iExpectedWeek: 1
			},
			{
				oInputDate: new UniversalDate(2021, 0, 4),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 4)),
				iExpectedYear: 2021,
				iExpectedWeek: 1
			},
			{
				oInputDate: new UniversalDate(2021, 0, 10),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 10)),
				iExpectedYear: 2021,
				iExpectedWeek: 2
			}
		];

		// en
		// Language "en" has the rule that "the first Saturday in the year" is in the first week
		// and the week starts with Sunday
		// CW52 2020-12-20 - 2020-12-26 ({year:2020, week:51})
		// CW01 2020-12-27 - 2021-01-02 ({year:2021, week: 0})
		// CW02 2021-01-03 - 2021-01-09 ({year:2021, week: 1})
		// Note: function getWeek returns the calendar week index which starts at 0
		const oGetFormatLocaleStub = this.stub(oFormatSettings, "getFormatLocale").returns(new Locale("en"));
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek();
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek();
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});

		oGetFormatLocaleStub.restore();

		// Locale "en"
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(new Locale("en"));
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(new Locale("en"));
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});

		// CalendarWeekNumbering.WesternTraditional
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(new Locale("en"), CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(new Locale("en"), CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});

		// CalendarWeekNumbering.WesternTraditional > Locale
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(new Locale("de"), CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(new Locale("de"), CalendarWeekNumbering.WesternTraditional);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});
	});

	QUnit.test("getWeek/getUTCWeek with locale de and en_GB (ISO 8601)", function (assert) {
		this.dateSpy.restore();

		let oWeekObject;
		const oFormatSettings = Configuration.getFormatSettings();
		const aLocales = [
			{ language: "de", region: null },
			{ language: "en", region: "GB" }
		];
		const aFixtures = [
			{
				oInputDate: new UniversalDate(2020, 11, 21),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 21)),
				iExpectedYear: 2020,
				iExpectedWeek: 51
			},
			{
				oInputDate: new UniversalDate(2020, 11, 27),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 27)),
				iExpectedYear: 2020,
				iExpectedWeek: 51
			},
			{
				oInputDate: new UniversalDate(2020, 11, 28),
				oInputDateUTC: new UniversalDate(Date.UTC(2020, 11, 28)),
				iExpectedYear: 2020,
				iExpectedWeek: 52
			},
			{
				oInputDate: new UniversalDate(2021, 0, 3),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 3)),
				iExpectedYear: 2020,
				iExpectedWeek: 52
			},
			{
				oInputDate: new UniversalDate(2021, 0, 4),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 4)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			},
			{
				oInputDate: new UniversalDate(2021, 0, 10),
				oInputDateUTC: new UniversalDate(Date.UTC(2021, 0, 10)),
				iExpectedYear: 2021,
				iExpectedWeek: 0
			}
		];

		// de / en_GB
		// Other languages than en_US has the rule of "the first Thursday in the year",
		// The first Thursday in the year is part of calendar week 1 and every calendar week is 7 days long.
		// CW52 2020-12-21 - 2020-12-27 ({year:2020, week:51})
		// CW53 2020-12-28 - 2021-01-03 ({year:2020, week:52})
		// CW01 2021-01-04 - 2021-01-10 ({year:2020, week: 0})
		// Note: function getWeek returns the calendar week index which starts at 0
		aLocales.forEach(function(oLocale) {
			const sLocaleId = oLocale.region ? oLocale.language + "-" + oLocale.region : oLocale.language;
			const oGetFormatLocaleStub = this.stub(oFormatSettings, "getFormatLocale").returns(new Locale(sLocaleId));


			aFixtures.forEach(function(oFixture) {
				oWeekObject = oFixture.oInputDateUTC.getUTCWeek();
				assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
				assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

				oWeekObject = oFixture.oInputDate.getWeek();
				assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
				assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
			});

			oGetFormatLocaleStub.restore();
		}.bind(this));

		// Locale "en"
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(new Locale("en-GB"));
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(new Locale("en-GB"));
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});

		// CalendarWeekNumbering.WesternTraditional
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(undefined, CalendarWeekNumbering.ISO_8601);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(undefined, CalendarWeekNumbering.ISO_8601);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});

		// CalendarWeekNumbering.WesternTraditional > Locale
		aFixtures.forEach(function(oFixture) {
			oWeekObject = oFixture.oInputDateUTC.getUTCWeek(new Locale("en"), CalendarWeekNumbering.ISO_8601);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");

			oWeekObject = oFixture.oInputDate.getWeek(new Locale("en"), CalendarWeekNumbering.ISO_8601);
			assert.equal(oWeekObject.year, oFixture.iExpectedYear, "Calendar 'week year' should be " + oFixture.iExpectedYear + ".");
			assert.equal(oWeekObject.week, oFixture.iExpectedWeek, "Calendar 'week' index should be " + oFixture.iExpectedWeek + ".");
		});
	});

[{
	vCalendarWeekNumbering: "invalidEnumValue",
	sExpectedError: "Illegal format option calendarWeekNumbering: 'invalidEnumValue'"
}, {
	vCalendarWeekNumbering: {},
	sExpectedError: "Week config requires firstDayOfWeek and minimalDaysInFirstWeek to be set"
}, {
	vCalendarWeekNumbering: {firstDayOfWeek: 0},
	sExpectedError: "Week config requires firstDayOfWeek and minimalDaysInFirstWeek to be set"
}, {
	vCalendarWeekNumbering: {minimalDaysInFirstWeek: 1},
	sExpectedError: "Week config requires firstDayOfWeek and minimalDaysInFirstWeek to be set"
}].forEach(function (oFixture, i) {
	QUnit.test("invalid calendar week numbering #" + i, function (assert) {
		this.dateSpy.restore();
		var oUniversalDateInstance = new UniversalDate();

		assert.throws(function() {
			oUniversalDateInstance.getWeek(undefined, oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
		assert.throws(function() {
			oUniversalDateInstance.getUTCWeek(undefined, oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
		assert.throws(function() {
			oUniversalDateInstance.setWeek({}, undefined, oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
		assert.throws(function() {
			oUniversalDateInstance.setUTCWeek({}, undefined, oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
		assert.throws(function() {
			UniversalDate.getFirstDateOfWeek(undefined, undefined, undefined, undefined,
				oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
		assert.throws(function() {
			UniversalDate.getWeekByDate(undefined, undefined, undefined, undefined, undefined,
				oFixture.vCalendarWeekNumbering);
		}, new TypeError(oFixture.sExpectedError));
	});
});

	QUnit.test("getWeekByDate/getFirstDateOfWeek", function (assert) {
		var oConfigurationMock = this.mock(Configuration);

		this.dateSpy.restore();

		// de (ISO 8601 from Configuration)
		oConfigurationMock.expects("getCalendarWeekNumbering").withExactArgs().returns(CalendarWeekNumbering.ISO_8601);
		assert.deepEqual(UniversalDate.getWeekByDate("Gregorian", 2021, 11, 27, new Locale("de")), {
			"week": 51,
			"year": 2021
		});
		oConfigurationMock.expects("getCalendarWeekNumbering").withExactArgs().returns(CalendarWeekNumbering.ISO_8601);
		assert.deepEqual(UniversalDate.getFirstDateOfWeek("Gregorian", 2021, 51, new Locale("de")), {
			"day": 27,
			"month": 11,
			"year": 2021
		});

		// ISO 8601 > en
		assert.deepEqual(UniversalDate.getWeekByDate("Gregorian", 2021, 11, 27, new Locale("en"), CalendarWeekNumbering.ISO_8601), {
			"week": 51,
			"year": 2021
		});
		assert.deepEqual(UniversalDate.getFirstDateOfWeek("Gregorian", 2021, 51, new Locale("en"), CalendarWeekNumbering.ISO_8601), {
			"day": 27,
			"month": 11,
			"year": 2021
		});

		// Western Traditional
		assert.deepEqual(UniversalDate.getWeekByDate("Gregorian", 2021, 11, 26, new Locale("de"), CalendarWeekNumbering.WesternTraditional), {
			"week": 0,
			"year": 2022
		});
		assert.deepEqual(UniversalDate.getFirstDateOfWeek("Gregorian", 2022, 0, new Locale("de"), CalendarWeekNumbering.WesternTraditional), {
			"day": 26,
			"month": 11,
			"year": 2021
		});
	});

	QUnit.test("invalid date object", function (assert) {
		this.dateSpy.restore();

		var oInvalidDate = UI5Date.getInstance("");

		// call #getUTCWeek
		var oUniversalDateInstance = new UniversalDate(oInvalidDate);
		assert.throws(function() {
			oUniversalDateInstance.getUTCWeek();
		}, new Error("Could not determine the first day of the week, because the date " +
			"object is invalid"));

		// getInstance call
		assert.throws(function() {
			UniversalDate.getInstance(oInvalidDate);
		}, new Error("The given date object is invalid"));
	});

	//*********************************************************************************************
	QUnit.test("createDate: Date class", function (assert) {
		this.mock(UI5Date).expects("getInstance").withExactArgs("~param0", "~param1").returns("~ui5Date");

		// code under test
		assert.strictEqual(UniversalDate.prototype.createDate(Date, ["~param0", "~param1"]), "~ui5Date");
	});

	//*********************************************************************************************
	QUnit.test("getCurrentEra", function (assert) {
		var oDate = {
				getDate: function () {},
				getFullYear: function () {},
				getMonth: function () {}
			};

		this.mock(UI5Date).expects("getInstance").withExactArgs().returns(oDate);
		this.mock(oDate).expects("getFullYear").withExactArgs().returns("~year");
		this.mock(oDate).expects("getMonth").withExactArgs().returns("~month");
		this.mock(oDate).expects("getDate").withExactArgs().returns("~date");
		this.mock(UniversalDate).expects("getEraByDate")
			.withExactArgs("~sCalendarType", "~year", "~month", "~date")
			.returns("~era");

		// code under test
		assert.strictEqual(UniversalDate.getCurrentEra("~sCalendarType"), "~era");
	});

	//--- helpers ----------------------------------------------------------------------------------------------
	function check(assert, iArgsCount) {
		assert.ok(this.dateSpy.callCount, 1, "InnerDate must be instantiated just ones");
		assert.equal(this.dateSpy.firstCall.args.length, iArgsCount, "Wrapped date must be instantiated with certain amount of arguments");
		for (var i = 0; i < iArgsCount; i++) {
			assert.equal(this.dateSpy.firstCall.args[i], testParameter1[i], "Wrapped date arguments:" + testParameter2[testParameter1[i]]);
		}
	}

});
