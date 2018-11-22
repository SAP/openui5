/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/Gregorian",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/Japanese",
	"sap/ui/core/CalendarType"
], function(UniversalDate, Gregorian, Islamic, Japanese, CalendarType) {
	"use strict";

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

	function prepare() {
		this.sandbox = sinon.sandbox.create();
		this.oStubCalendarType = this.sandbox.stub(sap.ui.getCore().getConfiguration(), "getCalendarType");
		this.oStubCalendarType.returns(CalendarType.Gregorian);
		this.dateSpy = this.sandbox.spy(window, 'Date');
	}
	function cleanup() {
		this.sandbox.restore();
	}
	QUnit.module("Constructor", {
		beforeEach: function () {
			prepare.call(this);
		},
		afterEach: function () {
			cleanup.call(this);
		}
	});

	QUnit.test("with no arguments", function (assert) {
		new UniversalDate();
		assert.ok(this.dateSpy.calledOnce, "InnerDate must be instantiated just ones");
		assert.equal(this.dateSpy.firstCall.args.length, 0, "InnerDate must be instantiated with no arguments");
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		new UniversalDate(1000);
		assert.ok(this.dateSpy.calledOnce, "InnerDate must be instantiated just ones");
		assert.equal(this.dateSpy.firstCall.args.length, 1, "Wrapped date must be instantiated with just one argument");
		assert.equal(this.dateSpy.firstCall.args[0], 1000, "Wrapped date must be instantiated with singe argument with particular value");
	});

	QUnit.test("with all 7 parameters", function (assert) {
		new UniversalDate(year, month, date, hours, minutes, seconds, milliseconds);
		check.call(this, assert, 7);
	});

	QUnit.test("with 6 parameters", function (assert) {
		new UniversalDate(year, month, date, hours, minutes, seconds);
		check.call(this, assert, 6);
	});

	QUnit.test("with 5 parameters", function (assert) {
		new UniversalDate(year, month, date, hours, minutes);
		check.call(this, assert, 5);
	});

	QUnit.test("with 4 parameters", function (assert) {
		new UniversalDate(year, month, date, hours);
		check.call(this, assert, 4);
	});

	QUnit.test("with 3 parameters", function (assert) {
		new UniversalDate(year, month, date);
		check.call(this, assert, 3);
	});

	QUnit.test("with 2 parameters", function (assert) {
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

	QUnit.test("getInstance", function(assert) {
		var oDate, oGregorian, oJSDate = new Date();

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
		var spy = this.sandbox.spy(sap.ui.core.date, 'Gregorian');
		var oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Gregorian must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Gregorian, "Date object must be instance of Gregorian");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Gregorian, "Universal date must report correct calendarType");
	});

	QUnit.test("determineType with Islamic calendar", function (assert) {
		this.oStubCalendarType.returns(CalendarType.Islamic);
		var spy = this.sandbox.spy(sap.ui.core.date, 'Islamic');
		var oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Islamic must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Islamic, "Date object must be instance of Islamic");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Islamic, "Universal date must report correct calendarType");
	});

	QUnit.test("determineType with Japanese calendar", function (assert) {
		this.oStubCalendarType.returns(CalendarType.Japanese);
		var spy = this.sandbox.spy(sap.ui.core.date, 'Japanese');
		var oUniversalDate = new UniversalDate();
		assert.ok(1, spy.callCount, "sap.ui.core.date.Japanese must be instantiated just ones");
		assert.ok(oUniversalDate instanceof Japanese, "Date object must be instance of Japanese");
		assert.equal(oUniversalDate.getCalendarType(), CalendarType.Japanese, "Universal date must report correct calendarType");
	});

	QUnit.test("Method calls are forwarded to the inner instance", function (assert) {
		this.dateSpy.restore();

		var returnValue = 111,
				sMethodName,
				oDateConstructorStub,
				oMethodStub,
				oUniversalDate,
				bMethodHasArgs,
				result,
				aMethodCallArg = [10, 11];

		var aMethods = [
		    {name: "getFullYear"}, {name: "getYear"}, {name: "getMonth"}, {name: "getDate"},
		    {name: "getDay"}, {name: "getHours"}, {name: "getMinutes"}, {name: "getSeconds"}, {name: "getMilliseconds"},
			{name: "getUTCFullYear"}, {name: "getUTCMonth"}, {name: "getUTCDate"}, {name: "getUTCDay"},
			{name: "getUTCHours"}, {name: "getUTCMinutes"}, {name: "getUTCSeconds"}, {name: "getUTCMilliseconds"},
			{name: "setFullYear", hasArgs: true}, {name: "setYear", hasArgs: true}, {name: "setDate", hasArgs: true},
			{name: "setMonth", hasArgs: true}, {name: "setHours", hasArgs: true}, {name: "setMinutes", hasArgs: true},
			{name: "setSeconds", hasArgs: true}, {name: "setMilliseconds", hasArgs: true}, {name: "setUTCFullYear", hasArgs: true},
			{name: "setUTCDate", hasArgs: true}, {name: "setUTCMonth", hasArgs: true}, {name: "setUTCHours", hasArgs: true},
			{name: "setUTCMinutes", hasArgs: true}, {name: "setUTCSeconds", hasArgs: true}, {name: "setUTCMilliseconds", hasArgs: true},
		    {name: "getTime"}, {name: "valueOf"}, {name: "getTimezoneOffset"}, {name: "toString"}
		];

		var oMockDate = null;
		for (var i = 0; i < aMethods.length; i++) {
			sMethodName = aMethods[i].name;
			bMethodHasArgs = aMethods[i].hasArgs;
			oMockDate = {};
			oMockDate.prototype = Date.prototype;
			oMockDate[sMethodName] = function () {};

			oDateConstructorStub = this.sandbox.stub(window, 'Date').returns(oMockDate);
			oMethodStub = this.sandbox.stub(oMockDate, sMethodName).returns(returnValue);
			Date.prototype[sMethodName] = oMockDate[sMethodName]; //eslint-disable-line no-extend-native

			oUniversalDate = new UniversalDate();
			if (bMethodHasArgs) {
				result = oUniversalDate[sMethodName](aMethodCallArg[0], aMethodCallArg[1]);
			} else {
				result = oUniversalDate[sMethodName]();
			}

			assert.equal(oMethodStub.callCount, 1, "Method [" + sMethodName + "] has to be called once");
			assert.equal(result, returnValue, "Method [" + sMethodName + "] call has to return a certain value");

			if (bMethodHasArgs) {
				assert.deepEqual(oMethodStub.firstCall.args, aMethodCallArg, "Method [" + sMethodName + "] call has to be called with certain arguments");
			}

			oMethodStub.restore();
			oDateConstructorStub.restore();
		}
	});

	QUnit.test("Static methods call is forwarded to inner instance", function (assert) {
		this.dateSpy.restore();
		var aStaticMethods = [
					{name: "UTC", hasArgs: true},
					{name: "now"}],
				returnValue = 111,
				sMethodName,
				oDateConstructorStub,
				oMethodStub,
				bMethodHasArgs,
				result,
				aMethodCallArg = [10, 11];

		for (var i = 0; i < aStaticMethods.length; i++) {
			sMethodName = aStaticMethods[i].name;
			bMethodHasArgs = aStaticMethods[i].hasArgs;
			var MockDateClass = function () {
			};
			MockDateClass.prototype = Date.prototype;
			MockDateClass.prototype[sMethodName] = function () {
			};
			MockDateClass[sMethodName] = function () {
			};

			var d = new MockDateClass();
			oDateConstructorStub = this.sandbox.stub(window, 'Date').returns(d);
			oMethodStub = this.sandbox.stub(d, sMethodName).returns(returnValue);
			Date[sMethodName] = d[sMethodName]; //eslint-disable-line no-extend-native

			if (bMethodHasArgs) {
				result = UniversalDate[sMethodName](aMethodCallArg[0], aMethodCallArg[1]);
			} else {
				result = UniversalDate[sMethodName]();
			}

			assert.equal(oMethodStub.callCount, 1, "Method [" + sMethodName + "] has to be called once");
			if (bMethodHasArgs) {
				assert.deepEqual(oMethodStub.firstCall.args, aMethodCallArg, "Method [" + sMethodName + "] call has to be called with certain arguments");
			}

			assert.equal(result, returnValue, "Method [" + sMethodName + "] call has to return a certain value");

			oMethodStub.restore();
			oDateConstructorStub.restore();
		}
	});

	QUnit.module("Other", {
		beforeEach: function () {
			prepare.call(this);
		},
		afterEach: function () {
			cleanup.call(this);
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

		var aExpected = [];
		for (var i = 0; i < 12; i++) {
			aExpected.push(0);
		}
		for (var i = 0; i < 12; i++) {
			aExpected.push(1);
		}

		var ud;
		for (var i = 0; i < 24; i++) {
			ud =  new UniversalDate(2017, 1, 1, i);
			assert.equal(ud.getDayPeriod(), aExpected[i], "The correct DayPeriod is returned");
		}

		// Wed, 01 Mar 2017 11:30:00 GMT
		// getUTCDayPeriod should return 0, getDayPeriod may return 1 depends on the running time zone
		var oDate = new UniversalDate(1488367800000);
		assert.equal(oDate.getUTCDayPeriod(), 0, "getUTCDayPeriod");
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
