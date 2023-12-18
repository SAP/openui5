/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/TimezoneUtils",
	"sap/base/util/deepClone",
	"sap/ui/core/date/UI5Date"
], function (Log, Localization, TimezoneUtils, deepClone, UI5Date) {
	/*global QUnit, sinon*/
	"use strict";
	const aAllParts = ["year", "month", "day", "hour", "minute", "second", "fractionalSecond"];

	//*********************************************************************************************
	QUnit.module("sap.ui.core.date.UI5Date", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("UI5Date.prototype: has all Date.prototype functions", function (assert) {
		var aDateFunctions = Object.getOwnPropertyNames(Date.prototype),
			aUI5DateFunctions = Object.getOwnPropertyNames(UI5Date.prototype),
			aMissingDateFunctions = aDateFunctions.filter(function (sMethod) {
				return !aUI5DateFunctions.includes(sMethod);
			});

		// code under test
		assert.deepEqual(aMissingDateFunctions, []);
	});

	//*********************************************************************************************
[ // UTC getter functions that delegate to the oDate property of the UI5Date instance
	"getTime", "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours", "getUTCMilliseconds",
	"getUTCMinutes", "getUTCMonth", "getUTCSeconds"
].forEach(function (sMethod) {
	QUnit.test(sMethod, function (assert) {
		var oDate = {},
			oUI5Date = {oDate: oDate};

		oDate[sMethod] = function () {};

		assert.ok(UI5Date.prototype[sMethod] !== Date.prototype[sMethod], sMethod);

		this.mock(oDate).expects(sMethod).withExactArgs().on(oDate).returns("~result");

		// code under test
		assert.strictEqual(UI5Date.prototype[sMethod].call(oUI5Date), "~result");
	});
});

	//*********************************************************************************************
[ // UTC setter functions that delegate to the oDate property of the UI5Date instance
	"setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
	"setUTCMonth", "setUTCSeconds"
].forEach(function (sMethod) {
	QUnit.test(sMethod, function (assert) {
		var oDate = {},
			oUI5Date = {oDate: oDate, oDateParts: "~cachedDateParts"};

		oDate[sMethod] = function () {};

		assert.ok(UI5Date.prototype[sMethod] !== Date.prototype[sMethod], sMethod);

		this.mock(oDate).expects(sMethod).withExactArgs("~foo", "~bar", "~baz")
			.on(oDate)
			.returns("~result");

		// code under test
		assert.strictEqual(UI5Date.prototype[sMethod].call(oUI5Date, "~foo", "~bar", "~baz"), "~result");

		assert.strictEqual(oUI5Date.oDateParts, undefined);
	});
});

	//*********************************************************************************************
[ // Other functions that delegate to the oDate property of the UI5Date instance
	"toGMTString", "toISOString", "toJSON", "toUTCString"
].forEach(function (sMethod) {
	QUnit.test(sMethod, function (assert) {
		var oDate = {},
			oUI5Date = {oDate: oDate};

		oDate[sMethod] = function () {};

		assert.ok(UI5Date.prototype[sMethod] !== Date.prototype[sMethod], sMethod);

		this.mock(oDate).expects(sMethod).withExactArgs().on(oDate).returns("~result");

		// code under test
		assert.strictEqual(UI5Date.prototype[sMethod].call(oUI5Date), "~result");
	});
});

	//*********************************************************************************************
	QUnit.test("toDateString: on invalid date", function (assert) {
		var sResult,
			oDate = new Date("invalid"), // no need to use UI5Date.getInstance
			oDateSpy = this.spy(oDate, "toDateString"),
			oUI5Date = {oDate: oDate};

		// code under test
		sResult = UI5Date.prototype.toDateString.call(oUI5Date);

		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, 0);
		assert.strictEqual(oDateSpy.firstCall.returnValue, sResult);
	});

	//*********************************************************************************************
[
	{input: "0002-01-05T03:06:09.005", output: "Sat Jan 05 0002"},
	{input: "-000002-02-05T03:06:09.005", output: "Thu Feb 05 -0002"},
	{input: "2023-03-15T00:00", output: "Wed Mar 15 2023"},
	{input: "2023-04-07T00:00", output: "Fri Apr 07 2023"},
	{input: "2023-05-08T00:00", output: "Mon May 08 2023"},
	{input: "2023-06-13T00:00", output: "Tue Jun 13 2023"},
	{input: "2023-07-23T00:00", output: "Sun Jul 23 2023"},
	{input: "2023-08-23T00:00", output: "Wed Aug 23 2023"},
	{input: "2023-09-23T00:00", output: "Sat Sep 23 2023"},
	{input: "2023-10-23T00:00", output: "Mon Oct 23 2023"},
	{input: "2023-11-23T00:00", output: "Thu Nov 23 2023"},
	{input: "2023-12-23T00:00", output: "Sat Dec 23 2023"},
	{input: "+102023-12-23T00:00", output: "Sat Dec 23 102023"},
	{input: "-102023-12-23T00:00", output: "Fri Dec 23 -102023"}
].forEach(function (oFixture) {
	QUnit.test("toDateString", function (assert) {
		var oUI5Date = new UI5Date([oFixture.input], "Pacific/Honolulu");

		// code under test
		assert.strictEqual(oUI5Date.toDateString(), oFixture.output);
	});
});

	//*********************************************************************************************
[{ // no locale / options case
	expectedOptions: {timeZone: "Pacific/Fiji"},
	locale: undefined,
	options: undefined,
	timezone: "Pacific/Fiji"
}, {
	expectedOptions: {day: "2-digit", timeZone: "Pacific/Fiji"},
	locale: "de-DE",
	options: {day: "2-digit"},
	timezone: "Pacific/Fiji"
}, {
	expectedOptions: {timeZone: "Pacific/Honolulu"},
	locale: "de-DE",
	options: {timeZone: "Pacific/Honolulu"},
	timezone: "Pacific/Fiji"
}, { // invalid date case
	constructorArguments: ["invalid"],
	expectedOptions: {timeZone: "Pacific/Honolulu"},
	locale: "de-DE",
	options: {timeZone: "Pacific/Honolulu"},
	timezone: "Pacific/Fiji"
}].forEach(function (oFixture, i) {
	["toLocaleDateString", "toLocaleString", "toLocaleTimeString"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": #" + i, function (assert) {
		var oDateSpy, sResult,
			oUI5Date = new UI5Date(oFixture.constructorArguments || [], oFixture.timezone);

		this.mock(Localization).expects("getLanguageTag")
			.withExactArgs()
			.exactly(oFixture.locale ? 0 : 1)
			.returns("en-US");
		oDateSpy = this.spy(oUI5Date.oDate, sMethod);

		// code under test
		sResult = oUI5Date[sMethod](oFixture.locale, oFixture.options);

		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, 2);
		assert.strictEqual(oDateSpy.firstCall.args[0], oFixture.locale ? oFixture.locale : "en-US");
		assert.notStrictEqual(oDateSpy.firstCall.args[1], oFixture.options, "options are cloned");
		assert.deepEqual(oDateSpy.firstCall.args[1], oFixture.expectedOptions, "time zone added");
		assert.strictEqual(oDateSpy.firstCall.returnValue, sResult);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("toString: on invalid date", function (assert) {
		var sResult,
			oDate = new Date("invalid"), // no need to use UI5Date.getInstance
			oDateSpy = this.spy(oDate, "toString"),
			oUI5Date = {oDate: oDate};

		// code under test
		sResult = UI5Date.prototype.toString.call(oUI5Date);

		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, 0);
		assert.strictEqual(oDateSpy.firstCall.returnValue, sResult);
	});

	//*********************************************************************************************
	QUnit.test("toString: on valid date", function (assert) {
		var oUI5Date = new UI5Date(["2023-01-23T00:00:00.000"], "America/New_York");

		this.mock(oUI5Date).expects("toDateString").withExactArgs().returns("~DateString");
		this.mock(oUI5Date).expects("toTimeString").withExactArgs().returns("~TimeString");

		// code under test
		assert.strictEqual(oUI5Date.toString(), "~DateString ~TimeString");
	});

	//*********************************************************************************************
	QUnit.test("toTimeString: on invalid date", function (assert) {
		var sResult,
			oDate = new Date("invalid"), // no need to use UI5Date.getInstance
			oDateSpy = this.spy(oDate, "toTimeString"),
			oUI5Date = {oDate: oDate};

		// code under test
		sResult = UI5Date.prototype.toTimeString.call(oUI5Date);

		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, 0);
		assert.strictEqual(oDateSpy.firstCall.returnValue, sResult);
	});

	//*********************************************************************************************
[
	{input: "2023-10-23T00:00:00.000", timezone: "Pacific/Honolulu", output: "00:00:00 GMT-1000"},
	{input: "2023-01-23T03:05:08.000", timezone: "America/New_York", output: "03:05:08 GMT-0500"},
	{input: "2023-10-23T11:22:33.000", timezone: "UTC", output: "11:22:33 GMT+0000"},
	{input: "2023-01-23T09:08:07.000", timezone: "Europe/Berlin", output: "09:08:07 GMT+0100"},
	{input: "2023-10-23T11:22:33.000", timezone: "Asia/Calcutta", output: "11:22:33 GMT+0530"},
	{input: "2023-10-23T11:22:33.000", timezone: "Asia/Kathmandu", output: "11:22:33 GMT+0545"},
	{input: "2023-10-23T00:00:00.000", timezone: "Pacific/Fiji", output: "00:00:00 GMT+1200"}
].forEach(function (oFixture) {
	QUnit.test("toTimeString", function (assert) {
		var oUI5Date = new UI5Date([oFixture.input], oFixture.timezone);

		// code under test
		assert.strictEqual(oUI5Date.toTimeString(), oFixture.output);
	});
});

	//*********************************************************************************************
	QUnit.test("valueOf: (cannot be mocked)", function (assert) {
		var oUI5Date = {oDate: new Date()}; // no need to use UI5Date.getInstance

		// code under test
		assert.strictEqual(UI5Date.prototype.valueOf.call(oUI5Date), oUI5Date.oDate.valueOf());

		oUI5Date.oDate.setFullYear("foo"); // -> invalid date

		// code under test
		assert.ok(isNaN(UI5Date.prototype.valueOf.call(oUI5Date)));

	});

	//*********************************************************************************************
	QUnit.test("_getPart: return NaN for invalid dates", function (assert) {
		var oUI5Date = {oDate: new Date("invalid")}; // no need to use UI5Date.getInstance

		this.mock(TimezoneUtils).expects("_getParts").never();

		// code under test
		assert.ok(isNaN(UI5Date.prototype._getPart.call(oUI5Date, "year")));
	});

	//*********************************************************************************************
	QUnit.test("_getPart", function (assert) {
		var oDate = new Date(), // no need to use UI5Date.getInstance
			oDateParts = {
				day: "19",
				era: "A",
				fractionalSecond: "059",
				hour: "13",
				minute: "42",
				month: "03",
				second: "12",
				weekday: "Sun",
				year: "2023"
			},
			oUI5Date = {oDate: oDate, sTimezoneID: "~timezone"};

		assert.strictEqual(oUI5Date.oDateParts, undefined, "no date parts after creation");

		this.mock(TimezoneUtils).expects("_getParts")
			.withExactArgs(sinon.match.same(oDate), "~timezone")
			.returns(oDateParts);

		// code under test
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "day"), 19);

		assert.strictEqual(oUI5Date.oDateParts, oDateParts, "date parts are cached");

		// code under test
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "fractionalSecond"), 59);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "hour"), 13);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "minute"), 42);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "month"), 2);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "second"), 12);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "weekday"), 0);
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "year"), 2023);

		oUI5Date.oDateParts.year = "100";
		oUI5Date.oDateParts.era = "B";

		// code under test
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "year"), -99);
	});

	//*********************************************************************************************
[
	{weekday: "Sun", iValue: 0},
	{weekday: "Mon", iValue: 1},
	{weekday: "Tue", iValue: 2},
	{weekday: "Wed", iValue: 3},
	{weekday: "Thu", iValue: 4},
	{weekday: "Fri", iValue: 5},
	{weekday: "Sat", iValue: 6}
].forEach(function (oFixture) {
	QUnit.test("_getPart: weekday: " + oFixture.weekday, function (assert) {
		var oDateParts = { // other parts are not relevant
				weekday: oFixture.weekday
			},
			// no need to use UI5Date.getInstance
			oUI5Date = {oDate: new Date(), oDateParts: oDateParts};

		// code under test
		assert.strictEqual(UI5Date.prototype._getPart.call(oUI5Date, "weekday"), oFixture.iValue);
	});
});

	//*********************************************************************************************
	QUnit.test("_setParts: invalid values", function (assert) {
		var oUI5Date = {
				setTime: function () {}
			};

		this.mock(oUI5Date).expects("setTime").withExactArgs(NaN).returns(NaN);

		// code under test
		assert.ok(isNaN(UI5Date.prototype._setParts.call(oUI5Date, ["year"], [])));
	});

	//*********************************************************************************************
[
	"year", "month", "day", "hour", "second", "minute", "second", "fractionalSecond"
].forEach(function (sPart) {
	QUnit.test("_setParts: invalid part value: " + sPart, function (assert) {
		var oUI5Date = {
				setTime: function () {}
			};

		this.mock(oUI5Date).expects("setTime").withExactArgs(NaN).returns("~NaN");

		// code under test
		assert.strictEqual(
			UI5Date.prototype._setParts.call(oUI5Date, [sPart], [undefined]),
			"~NaN");
	});
});

	//*********************************************************************************************
[
	"month", "day", "hour", "second", "minute", "second", "fractionalSecond"
].forEach(function (sPart) {
	QUnit.test("_setParts: invalid date needs year to set parts: " + sPart, function (assert) {
		var oUI5Date = {
				oDate: new Date("invalid"), // no need to use UI5Date.getInstance
				setTime: function () {}
			};

		this.mock(oUI5Date).expects("setTime").withExactArgs(NaN).returns("~NaN");

		// code under test
		assert.strictEqual(
			UI5Date.prototype._setParts.call(oUI5Date, [sPart], [2]),
			"~NaN");
	});
});

	//*********************************************************************************************
[
	{
		aParts: ["year"],
		aValues: [2022],
		oExpectedParts: {day: "1", era: "A", fractionalSecond: "0", hour: "0", minute: "0",
			month: "1", second: "0", year: "2022"}
	}, {
		aParts: ["year"],
		aValues: [-1],
		oExpectedParts: {day: "1", era: "B", fractionalSecond: "0", hour: "0", minute: "0",
		month: "1", second: "0", year: "2"}
	}, {
		aParts: ["year", "month", "day"],
		// ignore 5 as it is not relevant oDate.setFullYear(2023, 0, 17, 5) ignores 5, too
		aValues: [2023, 0, 17, 5],
		oExpectedParts: {day: "17", era: "A", fractionalSecond: "0", hour: "0", minute: "0",
			month: "1", second: "0", year: "2023"}
	}, {
		aParts: ["year", "month", "day"],
		aValues: ["2023", "0", "17"],
		oExpectedParts: {day: "17", era: "A", fractionalSecond: "0", hour: "0", minute: "0",
			month: "1", second: "0", year: "2023"}
	}
].forEach(function (oFixture, i) {
	QUnit.test("_setParts: starting with invalid date, #" + i, function (assert) {
		var oUI5Date = {
				oDate: new Date("invalid"), // no need to use UI5Date.getInstance
				sTimezoneID: "~timezoneID",
				setTime: function () {}
			},
			oNewDate = new Date(42); // no need to use UI5Date.getInstance

		this.mock(TimezoneUtils).expects("_getDateFromParts")
			.withExactArgs(oFixture.oExpectedParts)
			.returns(oNewDate);
		this.mock(oNewDate).expects("getTime").withExactArgs().returns(42);
		this.mock(TimezoneUtils).expects("calculateOffset")
			.withExactArgs(sinon.match.same(oNewDate),"~timezoneID")
			.returns(3600);
		this.mock(oUI5Date).expects("setTime").withExactArgs(3600042).returns("~timeInMs");

		// code under test
		assert.strictEqual(
			UI5Date.prototype._setParts.call(oUI5Date, oFixture.aParts, oFixture.aValues),
			"~timeInMs");
	});
});

	//*********************************************************************************************
	QUnit.test("_setParts: invalid date parts passed to _getDateFromParts", function (assert) {
		var oUI5Date = {
				setTime: function () {}
			};

		this.mock(TimezoneUtils).expects("_getDateFromParts").never();

		// code under test
		assert.ok(isNaN(UI5Date.prototype._setParts.call(oUI5Date, ["year", "month"], ["2023", "foo"])));
	});

	//*********************************************************************************************
[
	{
		aParts: ["year"],
		aValues: [2022],
		oExpectedParts: {day: "25", era: "A", fractionalSecond: "345", hour: "21", minute: "59",
			month: "11", second: "47", year: "2022"}
	}, {
		aParts: ["year"],
		aValues: [-1],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "345", hour: "21", minute: "59",
			month: "11", second: "47", year: "2"}
	}, {
		aParts: ["month"],
		aValues: [5],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "345", hour: "21", minute: "59",
			month: "6", second: "47", year: "25"}
	}, {
		aParts: ["day"],
		aValues: [13],
		oExpectedParts: {day: "13", era: "B", fractionalSecond: "345", hour: "21", minute: "59",
			month: "11", second: "47", year: "25"}
	},{
		aParts: ["hour"],
		aValues: [5],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "345", hour: "5", minute: "59",
			month: "11", second: "47", year: "25"}
	}, {
		aParts: ["minute"],
		aValues: [53],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "345", hour: "21", minute: "53",
			month: "11", second: "47", year: "25"}
	}, {
		aParts: ["second"],
		aValues: [0],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "345", hour: "21", minute: "59",
			month: "11", second: "0", year: "25"}
	}, {
		aParts: ["fractionalSecond"],
		aValues: [123],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "123", hour: "21", minute: "59",
			month: "11", second: "47", year: "25"}
	}, {
		aParts: ["year", "month", "day"],
		aValues: [2023, 0, 17],
		oExpectedParts: {day: "17", era: "A", fractionalSecond: "345", hour: "21", minute: "59",
			month: "1", second: "47", year: "2023"}
	}, {
		aParts: ["hour", "minute", "second", "fractionalSecond"],
		aValues: [13, 45, 12, 899],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "899", hour: "13", minute: "45",
			month: "11", second: "12", year: "25"}
	}, {
		aParts: ["year", "month", "day"],
		aValues: ["2023", "0", "17"],
		oExpectedParts: {day: "17", era: "A", fractionalSecond: "345", hour: "21", minute: "59",
			month: "1", second: "47", year: "2023"}
	}, {
		aParts: ["hour", "minute", "second", "fractionalSecond"],
		aValues: ["13", "45", "12", "899"],
		oExpectedParts: {day: "25", era: "B", fractionalSecond: "899", hour: "13", minute: "45",
			month: "11", second: "12", year: "25"}
	}
].forEach(function (oFixture, i) {
	QUnit.test("_setParts: merging existing date parts, #" + i, function (assert) {
		var oUI5Date = {
				oDate: new Date(123), // no need to use UI5Date.getInstance
				oDateParts: {day: "25", era: "B", fractionalSecond: "345", hour: "21",
					minute: "59", month: "11", second: "47", year: "25"},
				sTimezoneID: "~timezoneID",
				setTime: function () {}
			},
			oNewDate = new Date(42); // no need to use UI5Date.getInstance

		this.mock(TimezoneUtils).expects("_getDateFromParts")
			.withExactArgs(oFixture.oExpectedParts)
			.returns(oNewDate);
		this.mock(oNewDate).expects("getTime").withExactArgs().returns(42);
		this.mock(TimezoneUtils).expects("calculateOffset")
			.withExactArgs(sinon.match.same(oNewDate),"~timezoneID")
			.returns(3600);
		this.mock(oUI5Date).expects("setTime").withExactArgs(3600042).returns("~timeInMs");

		// code under test
		assert.strictEqual(
			UI5Date.prototype._setParts.call(oUI5Date, oFixture.aParts, oFixture.aValues),
			"~timeInMs");
	});

	//*********************************************************************************************
	QUnit.test("_setParts: get date parts for valid date, #" + i, function (assert) {
		var oDateParts = {day: "25", era: "B", fractionalSecond: "345", hour: "21",
				minute: "59", month: "11", second: "47", year: "25"},
			oUI5Date = {
				oDate: new Date(123), // no need to use UI5Date.getInstance
				sTimezoneID: "~timezoneID",
				setTime: function () {}
			},
			oNewDate = new Date(42); // no need to use UI5Date.getInstance

		this.mock(TimezoneUtils).expects("_getParts")
			.withExactArgs(sinon.match.same(oUI5Date.oDate), "~timezoneID")
			.returns(oDateParts);
		this.mock(TimezoneUtils).expects("_getDateFromParts")
			.withExactArgs(oFixture.oExpectedParts)
			.returns(oNewDate);
		this.mock(oNewDate).expects("getTime").withExactArgs().returns(42);
		this.mock(TimezoneUtils).expects("calculateOffset")
			.withExactArgs(sinon.match.same(oNewDate),"~timezoneID")
			.returns(3600);
		this.mock(oUI5Date).expects("setTime").withExactArgs(3600042).returns("~timeInMs");

		// code under test
		assert.strictEqual(
			UI5Date.prototype._setParts.call(oUI5Date, oFixture.aParts, oFixture.aValues),
			"~timeInMs");
	});
});

	//*********************************************************************************************
[
	{method: "getDate", partName: "day"},
	{method: "getDay", partName: "weekday"},
	{method: "getFullYear", partName: "year"},
	{method: "getHours", partName: "hour"},
	{method: "getMilliseconds", partName: "fractionalSecond"},
	{method: "getMinutes", partName: "minute"},
	{method: "getMonth", partName: "month"},
	{method: "getSeconds", partName: "second"}
].forEach(function (oFixture) {
	QUnit.test(oFixture.method, function (assert) {
		var oUI5Date = {_getPart: function () {}};

		this.mock(oUI5Date).expects("_getPart").withExactArgs(oFixture.partName).returns("~value");

		// code under test
		assert.strictEqual(UI5Date.prototype[oFixture.method].call(oUI5Date), "~value");
	});
});

	//*********************************************************************************************
	QUnit.test("getTimezoneOffset()", function (assert) {
		var oUI5Date = {oDate: "~oDate", sTimezoneID: "~timezoneID"};

		this.mock(TimezoneUtils).expects("calculateOffset")
			.withExactArgs("~oDate", "~timezoneID")
			.returns(12345 * 60);

		// code under test
		assert.strictEqual(UI5Date.prototype.getTimezoneOffset.call(oUI5Date), 12345);
	});

	//*********************************************************************************************
	QUnit.test("getYear()", function (assert) {
		var oUI5Date = {_getPart: function () {}};

		this.mock(oUI5Date).expects("_getPart").withExactArgs("year").returns(2000);

		// code under test
		assert.strictEqual(UI5Date.prototype.getYear.call(oUI5Date), 100);
	});

	//*********************************************************************************************
	QUnit.test("setDate()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["day"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [21]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setDate.call(oUI5Date, 21), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setFullYear()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["year", "month", "day"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [2023, 2, 21]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setFullYear.call(oUI5Date, 2023, 2, 21), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setHours()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["hour", "minute", "second", "fractionalSecond"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [21, 30, 21, 420]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setHours.call(oUI5Date, 21, 30, 21, 420), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setMilliseconds()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["fractionalSecond"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [420]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setMilliseconds.call(oUI5Date, 420), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setMinutes()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["minute", "second", "fractionalSecond"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [10, 20, 420]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setMinutes.call(oUI5Date, 10, 20, 420), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setMonth()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["month", "day"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [4, 2]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setMonth.call(oUI5Date, 4, 2), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setSeconds()", function (assert) {
		var oUI5Date = {_setParts: function () {}};

		this.mock(oUI5Date).expects("_setParts").withExactArgs(["second", "fractionalSecond"],
			sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), [4, 2]);
				return true;
			}))
			.returns("~newTimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setSeconds.call(oUI5Date, 4, 2), "~newTimeStamp");
	});

	//*********************************************************************************************
	QUnit.test("setTime()", function (assert) {
		var oUI5Date = {oDate: new Date(), oDateParts: "~dateParts"}; // no need to use UI5Date.getInstance

		this.mock(oUI5Date.oDate).expects("setTime").withExactArgs("~newValue").returns("~timestamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setTime.call(oUI5Date, "~newValue"), "~timestamp");

		assert.ok(oUI5Date.oDateParts === undefined);
	});

	//*********************************************************************************************
[
	{iYear : 0, iResultingYear : 1900},
	{iYear : -1, iResultingYear : -1},
	{iYear : 9.9, iResultingYear : 1909},
	{iYear : 99, iResultingYear : 1999},
	{iYear : 100, iResultingYear : 100}
].forEach(function (oFixture) {
	QUnit.test("setYear(" + oFixture.iYear + ")", function (assert) {
		var oUI5Date = {
				_setParts : function () {
			}},
			oUI5DateMock = this.mock(oUI5Date);

		oUI5DateMock.expects("_setParts").withExactArgs(["year"], [oFixture.iResultingYear])
			.returns("~TimeStamp");

		// code under test
		assert.strictEqual(UI5Date.prototype.setYear.call(oUI5Date, oFixture.iYear), "~TimeStamp");
	});
});

	//*********************************************************************************************
[
	[],
	[0],
	[2010, 10],
	[2011, 9, 6],
	[2011, 9, 6, 14],
	[2011, 9, 6, 16, 15],
	[2011, 9, 6, 17, 23, 45],
	[2011, 9, 6, 18, 45, 57, 931],
	[2011, 9, 6, 18, 45, 57, 931, 1], // JavaScript Date supports only 7 arguments, anyhow pass all
	["2011", "9", "6", "18", "45", "57", "931"]
].forEach(function (aArguments) {
	QUnit.test("_createDateInstance: " + aArguments.length + " argument(s)", function (assert) {
		var oUI5Date,
			oDateSpy = this.spy(window, "Date");

		// code under test - no arguments
		oUI5Date = UI5Date._createDateInstance(aArguments);

		assert.ok(oUI5Date instanceof Date);
		assert.notOk(oUI5Date instanceof UI5Date);
		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, aArguments.length);
		if (aArguments.length > 0) {
			assert.deepEqual(oDateSpy.firstCall.args, aArguments);
		}
		assert.strictEqual(oUI5Date, oDateSpy.firstCall.returnValue);
	});
});

	//*********************************************************************************************
	QUnit.test("_createDateInstance: first argument is a Date instance", function (assert) {
		var oUI5Date, oValueOfSpy,
			oDate = new Date(), // no need to use UI5Date.getInstance
			iValueOf = oDate.valueOf(),
			oDateSpy = this.spy(window, "Date");

		oValueOfSpy = this.spy(oDate, "valueOf");

		// code under test - first argument is a Date
		oUI5Date = UI5Date._createDateInstance([oDate]);

		assert.ok(oValueOfSpy.calledOnce, "Date.valueOf() called");
		assert.strictEqual(oValueOfSpy.firstCall.args.length, 0);
		assert.ok(oDateSpy.calledOnce);
		assert.strictEqual(oDateSpy.firstCall.args.length, 1);
		assert.strictEqual(oDateSpy.firstCall.args[0], iValueOf);
		assert.strictEqual(oUI5Date, oDateSpy.firstCall.returnValue);
	});

	//*********************************************************************************************
[
	[],
	[0],
	[2010, 10],
	[2011, 9, 6],
	[2011, 9, 6, 14],
	[2011, 9, 6, 16, 15],
	[2011, 9, 6, 17, 23, 45],
	[2011, 9, 6, 18, 45, 57, 931],
	[2011, 9, 6, 18, 45, 57, 931, 1],
	["2011", "9", "6", "18", "45", "57", "931"],
	[new Date()] // no need to use UI5Date.getInstance
].forEach(function (aArguments) {
	var sTitle = "getInstance: same time zone, " + aArguments.length + " argument(s)";
	QUnit.test(sTitle, function (assert) {
		this.mock(Localization).expects("getTimezone")
			.withExactArgs()
			.returns("~Timezone");
		this.mock(TimezoneUtils).expects("getLocalTimezone")
			.withExactArgs()
			.returns("~Timezone");

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), aArguments);
				return true;
			}))
			.returns("~Date");

		// code under test
		assert.strictEqual(UI5Date.getInstance.apply(null, aArguments), "~Date");
	});
});

	//*********************************************************************************************
	QUnit.test("getInstance: different configured and local time zone", function (assert) {
		var oUI5Date,
			oMockedDate = {};

		this.mock(Localization).expects("getTimezone").withExactArgs().returns("~configuredTimezone");
		this.mock(TimezoneUtils).expects("getLocalTimezone").withExactArgs().returns("~localTimezone");
		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match(function (oArguments) {
				assert.deepEqual(Array.from(oArguments), []);
				return true;
			}))
			.returns(oMockedDate);

		// code under test - no arguments
		oUI5Date = UI5Date.getInstance();

		assert.ok(oUI5Date instanceof UI5Date);
		assert.ok(oUI5Date instanceof Date, "is also instance of Date");
		// module:sap/base/util/deepEqual checks constructor before checking instance of date
		// ensure that constructors are the same
		// no need to use UI5Date.getInstance as UI5Date has to have the same constructor as Date
		assert.ok(oUI5Date.constructor === new Date().constructor, "same constructor");
		assert.ok(UI5Date.prototype !== Date.prototype);
		// required for example in qunit to identify dates
		assert.strictEqual(Object.prototype.toString.call(oUI5Date), "[object Date]");
		assert.strictEqual(oUI5Date.sTimezoneID, "~configuredTimezone");
		assert.strictEqual(oUI5Date.oDate, oMockedDate);
		assert.strictEqual(oUI5Date.oDateParts, undefined);
		// hide properties as Date also does not have properties and module:sap/base/util/deepEqual
		// compares the number of keys; Date and UI5Date with the same ms have to be equal
		assert.deepEqual(Object.keys(oUI5Date), []);
		assert.throws(function () { // time zone ID is read only
			oUI5Date.sTimezoneID = "foo";
		}, TypeError);
		oUI5Date.oDate = "~newDate";
		assert.strictEqual(oUI5Date.oDate, "~newDate", "oDate is writable");
		oUI5Date.oDateParts = "~newDateParts";
		assert.strictEqual(oUI5Date.oDateParts, "~newDateParts", "oDateParts is writable");
	});

	//*********************************************************************************************
[
	[2023, 0],
	[2023, 0, 1],
	[2023, 0, 1, 2],
	[2023, 0, 1, 3, 4],
	[2023, 0, 1, 3, 4, 5],
	[2023, 0, 1, 3, 4, 5, 6]
].forEach(function (aTimestampParts, i) {
	QUnit.test("UI5Date: timestamp parts are in local time zone, #" + i, function (assert) {
		var oExpectation, oUI5Date,
			oJSDate = new Date(), // no need to use UI5Date.getInstance
			oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match.same(aTimestampParts))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().returns("~fullYear");
		oJSDateMock.expects("getMonth").withExactArgs().returns("~month");
		oJSDateMock.expects("getDate").withExactArgs().returns("~date");
		oJSDateMock.expects("getHours").withExactArgs().returns("~hours");
		oJSDateMock.expects("getMinutes").withExactArgs().returns("~minutes");
		oJSDateMock.expects("getSeconds").withExactArgs().returns("~seconds");
		oJSDateMock.expects("getMilliseconds").withExactArgs().returns("~milliseconds");
		oJSDateMock.expects("getTimezoneOffset").withExactArgs()
			// simulate no daylight saving time shift
			.returns(new Date(oJSDate - /*2 hours = max time shift*/7200000).getTimezoneOffset());
		oJSDateMock.expects("getTime").withExactArgs().returns(oJSDate.valueOf());
		oExpectation = this.mock(UI5Date.prototype).expects("_setParts")
			.withExactArgs(aAllParts,
				["~fullYear", "~month", "~date", "~hours", "~minutes", "~seconds", "~milliseconds"])
			.returns("~notRelevant");

		// code under test
		oUI5Date = new UI5Date(aTimestampParts, "Pacific/Honolulu");

		assert.strictEqual(oExpectation.thisValues[0], oUI5Date);
	});
});

	//*********************************************************************************************
[{
	aDateParts: [2023, 0],
	aPartsToSet:["~fullYear", 0, 1, 0, 0, "~seconds", "~milliseconds"]
}, {
	aDateParts: [2023, "0", 1, "2", 3, "4", 5],
	aPartsToSet:["~fullYear", "0", 1, "2", 3, "~seconds", "~milliseconds"]
}, {
	aDateParts: ["2023-02-03T04:05:06.789"],
	aPartsToSet:["~fullYear", 1, "03", "04", "05", "~seconds", "~milliseconds"]
}, {
	aDateParts: ["2023-2-3 4:5:6.789"],
	aPartsToSet:["~fullYear", 1, "3", "4", "5", "~seconds", "~milliseconds"]
}, {
	aDateParts: ["2023-02-03T04:05"],
	aPartsToSet:["~fullYear", 1, "03", "04", "05", "~seconds", "~milliseconds"]
}, {
	aDateParts: ["2023-2-3 4:5"],
	aPartsToSet:["~fullYear", 1, "3", "4", "5", "~seconds", "~milliseconds"]
}, {
	aDateParts: ["2023-2-3"],
	aPartsToSet:["~fullYear", 1, "3", 0, 0, "~seconds", "~milliseconds"]
}].forEach((oFixture, i) => {
	const sTitle = "UI5Date: timestamp parts in local time zone; DST switch in local time zone to DST time -> fix it, #"
		+ i;
	QUnit.test(sTitle, function (assert) {
		const oJSDate = new Date(); // no need to use UI5Date.getInstance
		const oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance").withExactArgs(sinon.match.same(oFixture.aDateParts))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().returns("~fullYear");
		oJSDateMock.expects("getMonth").withExactArgs().returns("~month");
		oJSDateMock.expects("getDate").withExactArgs().returns("~date");
		oJSDateMock.expects("getHours").withExactArgs().returns("~hours");
		oJSDateMock.expects("getMinutes").withExactArgs().returns("~minutes");
		oJSDateMock.expects("getSeconds").withExactArgs().returns("~seconds");
		oJSDateMock.expects("getMilliseconds").withExactArgs().returns("~milliseconds");
		oJSDateMock.expects("getTimezoneOffset").withExactArgs()
			// simulate daylight saving time shift to daylight saving time -> time shift has to be fixed
			.returns(new Date(oJSDate - /*2 hours = max time shift*/7200000).getTimezoneOffset() - 1);
		oJSDateMock.expects("getTime").withExactArgs().returns(oJSDate.valueOf());
		const oExpectation = this.mock(UI5Date.prototype).expects("_setParts")
			.withExactArgs(aAllParts, oFixture.aPartsToSet)
			.returns("~notRelevant");

		// code under test
		const oUI5Date = new UI5Date(oFixture.aDateParts, "Pacific/Honolulu");

		assert.strictEqual(oExpectation.thisValues[0], oUI5Date);
	});
});

	//*********************************************************************************************
["Sun Mar 31 2024 03:00", "Sun Mar 31 2024 02:00", "2024/03/31 03:00", "2024/03/31 02:00"].forEach((sTimestamp) => {
	const sTitle = "UI5Date: local time stamp as non-ISO string near switch to DST time may be wrong; " + sTimestamp;
	QUnit.test(sTitle, function (assert) {
		const aDateParts = [sTimestamp];
		const oJSDate = new Date(); // no need to use UI5Date.getInstance
		const oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance").withExactArgs(sinon.match.same(aDateParts)).returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().returns("~fullYear");
		oJSDateMock.expects("getMonth").withExactArgs().returns("~month");
		oJSDateMock.expects("getDate").withExactArgs().returns("~date");
		oJSDateMock.expects("getHours").withExactArgs().returns("~hours");
		oJSDateMock.expects("getMinutes").withExactArgs().returns("~minutes");
		oJSDateMock.expects("getSeconds").withExactArgs().returns("~seconds");
		oJSDateMock.expects("getMilliseconds").withExactArgs().returns("~milliseconds");
		oJSDateMock.expects("getTimezoneOffset").withExactArgs()
			// simulate daylight saving time shift to daylight saving time -> time shift has to be fixed
			.returns(new Date(oJSDate - /*2 hours = max time shift*/7200000).getTimezoneOffset() - 1);
		oJSDateMock.expects("getTime").withExactArgs().returns(oJSDate.valueOf());
		this.oLogMock.expects("warning")
			.withExactArgs("UI5Date for '" + sTimestamp + "' cannot be ensured to be correct as it is near"
				+ " the change from standard time to daylight saving time in the current browser locale;"
				+ " use the constructor with more than 1 arguments or use the ISO format instead",
				sinon.match.same(oJSDate), "sap.ui.core.date.UI5Date");
		const oExpectation = this.mock(UI5Date.prototype).expects("_setParts")
			.withExactArgs(aAllParts,
				// parts cannot be updated; don't know how to parse the local date string
				["~fullYear", "~month", "~date", "~hours", "~minutes", "~seconds", "~milliseconds"])
			.returns("~notRelevant");

		// code under test - other string based local input which cannot be parsed
		const oUI5Date = new UI5Date(aDateParts, "Pacific/Honolulu");

		assert.strictEqual(oExpectation.thisValues[0], oUI5Date);
	});
});

	//*********************************************************************************************
[
	[2023, 0],
	[2023, "0", 1, "2", 3, "4", 5]
].forEach((aDateParts, i) => {
	const sTitle = "UI5Date: timestamp parts in local time zone; DST switch in local time zone to Standard Time"
		+ " -> no fix needed, #" + i;
	QUnit.test(sTitle, function (assert) {
		const oJSDate = new Date(); // no need to use UI5Date.getInstance
		const oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance").withExactArgs(sinon.match.same(aDateParts))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().returns("~fullYear");
		oJSDateMock.expects("getMonth").withExactArgs().returns("~month");
		oJSDateMock.expects("getDate").withExactArgs().returns("~date");
		oJSDateMock.expects("getHours").withExactArgs().returns("~hours");
		oJSDateMock.expects("getMinutes").withExactArgs().returns("~minutes");
		oJSDateMock.expects("getSeconds").withExactArgs().returns("~seconds");
		oJSDateMock.expects("getMilliseconds").withExactArgs().returns("~milliseconds");
		oJSDateMock.expects("getTimezoneOffset").withExactArgs()
			// simulate daylight saving time shift to daylight saving time -> time shift has to be fixed
			.returns(new Date(oJSDate - /*2 hours = max time shift*/7200000).getTimezoneOffset() + 1);
		oJSDateMock.expects("getTime").withExactArgs().returns(oJSDate.valueOf());
		const oExpectation = this.mock(UI5Date.prototype).expects("_setParts")
			.withExactArgs(aAllParts,
				["~fullYear", "~month", "~date", "~hours", "~minutes", "~seconds", "~milliseconds"])
			.returns("~notRelevant");

		// code under test
		const oUI5Date = new UI5Date(aDateParts, "Pacific/Honolulu");

		assert.strictEqual(oExpectation.thisValues[0], oUI5Date);
	});
});

	//*********************************************************************************************
[
	"-122023T11:23", "+002023T11:23", "2023T11:23", "2023-07T11:23", "2023-07-03T11:23",
	"2023-07-03T11:23:13", "2023-07-03T11:23:13.7", "Thu Jan 19 2023"
].forEach(function (sLocalTimestamp) {
	QUnit.test("UI5Date: timestamp string is interpreted as a local timestamp", function (assert) {
		var oExpectation, oUI5Date,
			aArguments = [sLocalTimestamp],
			oJSDate = new Date(), // no need to use UI5Date.getInstance
			oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match.same(aArguments))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().returns("~fullYear");
		oJSDateMock.expects("getMonth").withExactArgs().returns("~month");
		oJSDateMock.expects("getDate").withExactArgs().returns("~date");
		oJSDateMock.expects("getHours").withExactArgs().returns("~hours");
		oJSDateMock.expects("getMinutes").withExactArgs().returns("~minutes");
		oJSDateMock.expects("getSeconds").withExactArgs().returns("~seconds");
		oJSDateMock.expects("getMilliseconds").withExactArgs().returns("~milliseconds");
		oExpectation = this.mock(UI5Date.prototype).expects("_setParts")
			.withExactArgs(aAllParts,
				["~fullYear", "~month", "~date", "~hours", "~minutes", "~seconds", "~milliseconds"])
			.returns("~notRelevant");

		// code under test
		oUI5Date = new UI5Date(aArguments, "Pacific/Honolulu");

		assert.strictEqual(oExpectation.thisValues[0], oUI5Date);
	});
});

	//*********************************************************************************************
[
	"2023", "2023-03", "2023-03-05", "2023-03-05T13:48Z", "2023-03-05T13:48+0100",
	"2023-03-05T13:48:08Z", "2023-03-05T13:48:08+0100", "2023-03-05T13:48:08.123Z",
	"2023-03-05T13:48:08.123+0100", "2023-03-05T13:48:08.123-02:00",
	"-002023", "-002023-03", "-002023-03-05", "-002023-03-05T13:48Z", "-002023-03-05T13:48+0100",
	"-002023-03-05T13:48:08Z", "-002023-03-05T13:48:08+0100", "-002023-03-05T13:48:08.123Z",
	"-002023-03-05T13:48:08.123+0100", "-002023-03-05T13:48:08.123-02:00",
	"+002023", "+002023-03", "+002023-03-05", "+002023-03-05T13:48Z", "+002023-03-05T13:48+0100",
	"+002023-03-05T13:48:08Z", "+002023-03-05T13:48:08+0100", "+002023-03-05T13:48:08.123Z",
	"+002023-03-05T13:48:08.123+0100", "+002023-03-05T13:48:08.123-02:00",
	"Fri, 20 Jan 2023 09:44:22 GMT", "Fri, 20 Jan 2023 09:44:22 GMT+01:00"
].forEach(function (sLocalTimestamp) {
	QUnit.test("UI5Date: timestamp string is interpreted as a UTC timestamp", function (assert) {
		var aArguments = [sLocalTimestamp],
			oJSDate = new Date(), // no need to use UI5Date.getInstance
			oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match.same(aArguments))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").never();
		oJSDateMock.expects("getMonth").never();
		oJSDateMock.expects("getDate").never();
		oJSDateMock.expects("getHours").never();
		oJSDateMock.expects("getMinutes").never();
		oJSDateMock.expects("getSeconds").never();
		oJSDateMock.expects("getMilliseconds").never();
		this.mock(UI5Date.prototype).expects("_setParts").never();

		// code under test
		// eslint-disable-next-line no-new
		new UI5Date(aArguments, "Pacific/Honolulu");
	});
});

	//*********************************************************************************************
	QUnit.test("UI5Date: 1 numeric argument", function (assert) {
		var aArguments = [2023], // interpreted as timestamp
			oJSDate = new Date(), // no need to use UI5Date.getInstance
			oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match.same(aArguments))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").never();
		oJSDateMock.expects("getMonth").never();
		oJSDateMock.expects("getDate").never();
		oJSDateMock.expects("getHours").never();
		oJSDateMock.expects("getMinutes").never();
		oJSDateMock.expects("getSeconds").never();
		oJSDateMock.expects("getMilliseconds").never();
		this.mock(UI5Date.prototype).expects("_setParts").never();

		// code under test
		// eslint-disable-next-line no-new
		new UI5Date(aArguments, "Pacific/Honolulu");
	});

	//*********************************************************************************************
[	// test following fixtures with Europe/Berlin time zone
	// to DST switch in Europe/Berlin 31.03.2024 02:00 GMT+1 -> 31.03.2024 03:00 GMT+2
	{aDate: [2024, 2, 31, 1, 59], expectedDate: 31, expectedHours: 1, expectedMinutes: 59},
	{aDate: [2024, 2, 31, 2], expectedDate: 31, expectedHours: 2, expectedMinutes: 0},
	{aDate: [2024, 2, 31, 2, false], expectedDate: 31, expectedHours: 2, expectedMinutes: 0},
	// 0 as date leads to the last day of the month before
	{aDate: [2024, 3, 0, 2], expectedDate: 31, expectedHours: 2, expectedMinutes: 0},
	{aDate: [2024, 2, 31, 2, 59], expectedDate: 31, expectedHours: 2, expectedMinutes: 59},
	{aDate: [2024, 2, 31, 3], expectedDate: 31, expectedHours: 3, expectedMinutes: 0},
	{aDate: ["2024", "2", "31", "2", "59"], expectedDate: 31, expectedHours: 2, expectedMinutes: 59},
	{aDate: ["2024-03-31 01:59"], expectedDate: 31, expectedHours: 1, expectedMinutes: 59},
	{aDate: ["2024-03-31T02:00"], expectedDate: 31, expectedHours: 2, expectedMinutes: 0},
	{aDate: ["2024-03-31 02:59"], expectedDate: 31, expectedHours: 2, expectedMinutes: 59},
	{aDate: ["2024-03-31T03:00"], expectedDate: 31, expectedHours: 3, expectedMinutes: 0},
	// to Standard time switch in Europe/Berlin 29.10.2023 03:00 GMT+2 -> 29.10.2023 02:00 GMT+1
	{aDate: [2023, 9, 29, 2], expectedDate: 29, expectedHours: 2, expectedMinutes: 0},
	{aDate: [2023, 9, 29, 3], expectedDate: 29, expectedHours: 3, expectedMinutes: 0},
	// test following fixtures with America/Santiago time zone
	// to DST switch in America/Santiago 03.09.2023 00:00 GMT-4 -> 03.09.2023 01:00 GMT-3
	{aDate: [2023, 8, 3], expectedDate: 3, expectedHours: 0, expectedMinutes: 0},
	// to Standard time switch in America/Santiago 07.04.2024 00:00 GMT-3 -> 06.04.2024 23:00 GMT-2
	{aDate: [2024, 3, 7], expectedDate: 7, expectedHours: 0, expectedMinutes: 0}
].forEach((oFixture, i) => {
	QUnit.test("UI5Date: no timeshift if timestamp doesn't exist in local time zone (DST), # " + i, function (assert) {
		// code under test
		const oResult = new UI5Date(oFixture.aDate, "Pacific/Kiritimati");

		assert.strictEqual(oResult.getDate(), oFixture.expectedDate, "Date");
		assert.strictEqual(oResult.getHours(), oFixture.expectedHours, "Hours");
		assert.strictEqual(oResult.getMinutes(), oFixture.expectedMinutes, "Minutes");
	});
});

	//*********************************************************************************************
	QUnit.test("UI5Date: timestamp parts contain invalid values", function (assert) {
		var oUI5Date,
			aArguments = [2023, "foo"],
			oJSDate = new Date("invalid"), // no need to use UI5Date.getInstance
			oJSDateMock = this.mock(oJSDate);

		this.mock(UI5Date).expects("_createDateInstance")
			.withExactArgs(sinon.match.same(aArguments))
			.returns(oJSDate);
		oJSDateMock.expects("getFullYear").withExactArgs().never();
		oJSDateMock.expects("getMonth").withExactArgs().never();
		oJSDateMock.expects("getDate").withExactArgs().never();
		oJSDateMock.expects("getHours").withExactArgs().never();
		oJSDateMock.expects("getMinutes").withExactArgs().never();
		oJSDateMock.expects("getSeconds").withExactArgs().never();
		oJSDateMock.expects("getMilliseconds").withExactArgs().never();
		this.mock(UI5Date.prototype).expects("_setParts").never();

		// code under test
		oUI5Date = new UI5Date(aArguments, "Pacific/Honolulu");

		assert.ok(isNaN(oUI5Date));
	});

	//*********************************************************************************************
	QUnit.test("Integrative Tests", function (assert) {
		var oDate,
			i = 0;

		function checkUTC(oUI5Date, iYear, iMonth, iDate, iHours, iMinutes, iSeconds, iMilliseconds,
				bSkipIfNaN) {
			i += 1;
			if (bSkipIfNaN && isNaN(oUI5Date)) {
				// some browsers cannot parse the date string, ignore the check
				assert.ok(true, "Check #" + i + ": Skipped as not parsable");
				return;
			}

			assert.strictEqual(oUI5Date.getUTCFullYear(), iYear, "Check #" + i + ", FullYear");
			assert.strictEqual(oUI5Date.getUTCMonth(), iMonth, "Month");
			assert.strictEqual(oUI5Date.getUTCDate(), iDate, "Date");
			assert.strictEqual(oUI5Date.getUTCHours(), iHours, "Hours");
			assert.strictEqual(oUI5Date.getUTCMinutes(), iMinutes, "Minutes");
			assert.strictEqual(oUI5Date.getUTCSeconds(), iSeconds, "Seconds");
			assert.strictEqual(oUI5Date.getUTCMilliseconds(), iMilliseconds, "Milliseconds");
		}
		function checkLocal(oUI5Date, iYear, iMonth, iDate, iHours, iMinutes, iSeconds,
				iMilliseconds, iDay, bSkipIfNaN) {
			i += 1;
			if (bSkipIfNaN && isNaN(oUI5Date)) {
				// some browsers cannot parse the date string, ignore the check
				assert.ok(true, "Check #" + i + ": Skipped as not parsable");
				return;
			}

			assert.strictEqual(oUI5Date.getFullYear(), iYear, "Check #" + i + ", FullYear");
			assert.strictEqual(oUI5Date.getMonth(), iMonth, "Month");
			assert.strictEqual(oUI5Date.getDate(), iDate, "Date");
			assert.strictEqual(oUI5Date.getHours(), iHours, "Hours");
			assert.strictEqual(oUI5Date.getMinutes(), iMinutes, "Minutes");
			assert.strictEqual(oUI5Date.getSeconds(), iSeconds, "Seconds");
			assert.strictEqual(oUI5Date.getMilliseconds(), iMilliseconds, "Milliseconds");
			assert.strictEqual(oUI5Date.getDay(), iDay, "Weekday");
		}

		this.mock(Localization).expects("getTimezone")
			.withExactArgs()
			.atLeast(1)
			.returns("Pacific/Fiji");
		this.mock(TimezoneUtils).expects("getLocalTimezone")
			.withExactArgs()
			.atLeast(1)
			.returns("Europe/Berlin");

		// code under test
		oDate = UI5Date.getInstance(0);

		assert.ok(oDate instanceof UI5Date, "1.1.1970 00:00:00:000 UTC");
		// UTC function
		checkUTC(oDate, 1970, 0, 1, 0, 0, 0, 0);
		assert.strictEqual(oDate.getTime(), 0);
		assert.strictEqual(oDate.toGMTString(), "Thu, 01 Jan 1970 00:00:00 GMT");
		assert.strictEqual(oDate.toISOString(), "1970-01-01T00:00:00.000Z");
		assert.strictEqual(oDate.toJSON(), "1970-01-01T00:00:00.000Z");
		assert.strictEqual(oDate.toUTCString(), "Thu, 01 Jan 1970 00:00:00 GMT");
		assert.strictEqual(oDate.valueOf(), 0);

		// local getters
		checkLocal(oDate, 1970, 0, 1, 12, 0, 0, 0, 4);
		assert.strictEqual(oDate.getTimezoneOffset(), -12 * 60);

		// code under test
		oDate.setTime(1674054083990);

		checkUTC(oDate, 2023, 0, 18, 15, 1, 23, 990);
		assert.strictEqual(oDate.getTime(), 1674054083990, "Specific Timestamp");
		assert.strictEqual(oDate.toGMTString(), "Wed, 18 Jan 2023 15:01:23 GMT");
		assert.strictEqual(oDate.toISOString(), "2023-01-18T15:01:23.990Z");
		assert.strictEqual(oDate.toJSON(), "2023-01-18T15:01:23.990Z");
		assert.strictEqual(oDate.toUTCString(), "Wed, 18 Jan 2023 15:01:23 GMT");
		assert.strictEqual(oDate.valueOf(), 1674054083990);
		checkLocal(oDate, 2023, 0, 19, 3, 1, 23, 990, 4);

		// code under test
		checkLocal(UI5Date.getInstance(2023, 4, 19, 14, 23, 58, 876), 2023, 4, 19, 14, 23, 58, 876, 5);
		// code under test
		checkLocal(UI5Date.getInstance(-15, 10), -15, 10, 1, 0, 0, 0, 0, 5);
		// code under test
		checkLocal(UI5Date.getInstance(2023, null), 2023, 0, 1, 0, 0, 0, 0, 0); // 1st Jan 2023

		oDate = UI5Date.getInstance();

		// code under test
		assert.ok(isNaN(oDate.setFullYear(1999, undefined)));

		// code under test
		oDate.setFullYear(1999, null);

		checkLocal(oDate, 1999, 0, 1, 0, 0, 0, 0, 5);

		// code under test
		oDate.setFullYear(1999, 1, "");

		checkLocal(oDate, 1999, 0, 31, 0, 0, 0, 0, 0);

		// code under test - JavaScript Date uses parseInt to convert decimals
		oDate.setFullYear(1733, 5.8);

		checkLocal(oDate, 1733, 6, 1, 0, 0, 0, 0, 3); //Jun 31th -> Jul 1st

		// code under test
		checkUTC(UI5Date.getInstance(null), 1970, 0, 1, 0, 0, 0, 0, true);

		// string interpreted as UTC timestamp ****************************************************
		checkUTC(UI5Date.getInstance("2023"), 2023, 0, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("2023-03"), 2023, 2, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("2023-03-05"), 2023, 2, 5, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48Z"), 2023, 2, 5, 13, 48, 0, 0);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48+0100"), 2023, 2, 5, 12, 48, 0, 0);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48:08Z"), 2023, 2, 5, 13, 48, 8, 0);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48:08+0100"), 2023, 2, 5, 12, 48, 8, 0);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48:08.123Z"), 2023, 2, 5, 13, 48, 8, 123);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48:08.123+0100"), 2023, 2, 5, 12, 48, 8, 123);
		checkUTC(UI5Date.getInstance("2023-03-05T13:48:08.123-02:00"), 2023, 2, 5, 15, 48, 8, 123);
		checkUTC(UI5Date.getInstance("+122023"), 122023, 0, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("+002023-03"), 2023, 2, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05"), 2023, 2, 5, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48Z"), 2023, 2, 5, 13, 48, 0, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48+0100"), 2023, 2, 5, 12, 48, 0, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48:08Z"), 2023, 2, 5, 13, 48, 8, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48:08+0100"), 2023, 2, 5, 12, 48, 8, 0);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48:08.123Z"), 2023, 2, 5, 13, 48, 8, 123);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48:08.123+0100"), 2023, 2, 5, 12, 48, 8, 123);
		checkUTC(UI5Date.getInstance("+002023-03-05T13:48:08.123-02:00"), 2023, 2, 5, 15, 48, 8, 123);
		checkUTC(UI5Date.getInstance("-000001"), -1, 0, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("-002023-03"), -2023, 2, 1, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05"), -2023, 2, 5, 0, 0, 0, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48Z"), -2023, 2, 5, 13, 48, 0, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48+0100"), -2023, 2, 5, 12, 48, 0, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48:08Z"), -2023, 2, 5, 13, 48, 8, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48:08+0100"), -2023, 2, 5, 12, 48, 8, 0);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48:08.123Z"), -2023, 2, 5, 13, 48, 8, 123);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48:08.123+0100"), -2023, 2, 5, 12, 48, 8, 123);
		checkUTC(UI5Date.getInstance("-002023-03-05T13:48:08.123-02:00"), -2023, 2, 5, 15, 48, 8, 123);
		checkUTC(UI5Date.getInstance("Fri, 20 Jan 2023 09:44:22 GMT"), 2023, 0, 20, 9, 44, 22, 0);
		// if the timestamp can be parsed (e.g. by Chrome) it is parsed as a UTC timestamp
		checkUTC(UI5Date.getInstance("Fri, 20 Jan 2023 09:44:22+01:00"), 2023, 0, 20, 8, 44, 22, 0, true);
		checkUTC(UI5Date.getInstance("Fri, 20 Jan 2023 09:44:22-02:00"), 2023, 0, 20, 11, 44, 22, 0, true);
		checkUTC(UI5Date.getInstance("2023-07-03 GMT"), 2023, 6, 3, 0, 0, 0, 0, true);


		// string interpreted as local timestamp **************************************************
		// if the timestamp can be parsed (e.g. by Chrome) it is parsed as a local timestamp
		checkLocal(UI5Date.getInstance("2023-"), 2023, 0, 1, 0, 0, 0, 0, 0, true);
		checkLocal(UI5Date.getInstance("2023-09-"), 2023, 8, 1, 0, 0, 0, 0, 5, true);
		checkLocal(UI5Date.getInstance("2023-07-03 "), 2023, 6, 3, 0, 0, 0, 0, 1, true);
		// next 3 timestamps are interpreted differently on different browsers either as local or as
		// UTC timestamp; ignore them as they would lead to different results even without UI5Date
		// checkLocal(UI5Date.getInstance("123"), 123, 0, 1, 0, 0, 0, 0, 5, true);
		// checkLocal(UI5Date.getInstance("2023-9"), 2023, 8, 1, 0, 0, 0, 0, 5, true);
		// checkLocal(UI5Date.getInstance("2023-07-3"), 2023, 6, 3, 0, 0, 0, 0, 1, true);
		checkLocal(UI5Date.getInstance("2023-07-03T11:23"), 2023, 6, 3, 11, 23, 0, 0, 1);
		checkLocal(UI5Date.getInstance("2023-07-03T11:23:13"), 2023, 6, 3, 11, 23, 13, 0, 1);
		checkLocal(UI5Date.getInstance("2023-07-03T11:23:13.7"), 2023, 6, 3, 11, 23, 13, 700, 1);
		checkLocal(UI5Date.getInstance("+012023-07-03T11:23"), 12023, 6, 3, 11, 23, 0, 0, 1);
		checkLocal(UI5Date.getInstance("+022023-07-03T11:23:13"), 22023, 6, 3, 11, 23, 13, 0, 1);
		checkLocal(UI5Date.getInstance("+032023-07-03T11:23:13.7"), 32023, 6, 3, 11, 23, 13, 700, 1);
		checkLocal(UI5Date.getInstance("-012023-07-03T11:23"), -12023, 6, 3, 11, 23, 0, 0, 0);
		checkLocal(UI5Date.getInstance("-022023-07-03T11:23:13"), -22023, 6, 3, 11, 23, 13, 0, 0);
		checkLocal(UI5Date.getInstance("-032023-07-03T11:23:13.7"), -32023, 6, 3, 11, 23, 13, 700, 0);
		checkLocal(UI5Date.getInstance("Thu Jan 19 2023"), 2023, 0, 19, 0, 0, 0, 0, 4);

		// toLocaleDateString
		oDate = new UI5Date(["not valid"], "Pacific/Fiji");

		assert.strictEqual(oDate.toLocaleDateString("de-DE"), "Invalid Date", "toLocaleDateString");

		oDate = new UI5Date([2023, 0, 5, 1, 0], "Pacific/Fiji");

		assert.strictEqual(oDate.toLocaleDateString("de-DE"), "5.1.2023");
		assert.strictEqual(oDate.toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit"}),
			"05.01.");

		checkLocal(deepClone(UI5Date.getInstance("2023-07-03T11:23")), 2023, 6, 3, 11, 23, 0, 0, 1);
	});

	//*********************************************************************************************
	QUnit.test("checkDate", function (assert) {
		var oDate = new Date(), // no need to use UI5Date.getInstance
			oLocalizationMock = this.mock(Localization),
			oTimezoneUtilsMock = this.mock(TimezoneUtils);

		// code under test
		UI5Date.checkDate(new UI5Date([], "Europe/Berlin"));

		oLocalizationMock.expects("getTimezone").withExactArgs().returns("~configuredTimezone");
		oTimezoneUtilsMock.expects("getLocalTimezone").withExactArgs().returns("~localTimezone");

		// code under test
		assert.throws(function () {
			UI5Date.checkDate(oDate);
		}, new Error("Configured time zone requires the parameter 'oDate' to be an instance of "
			+ "sap.ui.core.date.UI5Date"));

		oLocalizationMock.expects("getTimezone").withExactArgs().returns("~localTimezone");
		oTimezoneUtilsMock.expects("getLocalTimezone").withExactArgs().returns("~localTimezone");

		// code under test
		UI5Date.checkDate(oDate);

		// code under test
		assert.throws(function () {
			UI5Date.checkDate(new Date("invalid")); // no need to use UI5Date.getInstance
		}, new Error("The given Date is not valid"));
	});

	//*********************************************************************************************
	QUnit.test("clone", function (assert) {
		var oUI5Date = new UI5Date([], "Europe/Berlin");

		this.mock(UI5Date).expects("getInstance").withExactArgs(oUI5Date).returns("~clone");

		// code under test
		assert.strictEqual(oUI5Date.clone(), "~clone");
	});

	//*********************************************************************************************
	function toLocalDateString(oDate) {
		return oDate.getFullYear()
			+ "-" + (oDate.getMonth() + 1).toString().padStart(2, "0")
			+ "-" + oDate.getDate().toString().padStart(2, "0")
			+ "T" + oDate.getHours().toString().padStart(2, "0")
			+ ":" + oDate.getMinutes().toString().padStart(2, "0");
	}

[{ // America/Adak: UTC-10 (Standard), UTC-9 (DST); 02:00 am to 03:00 am resp. 02:00 am to 01:00 am
	sTimezone: "America/Adak",
	toDST: {aDate: [2024, 2, 10, 2], sResult: "2024-03-10T03:00"},
	toStandard: {aDate: [2023, 10, 5, 2], sResult: "2023-11-05T02:00", sAandBTime: "2023-11-05T01:00"}
}, { // America/Havana: UTC-5 (Standard), UTC-4 (DST); 12:00 am to 01:00 am resp. 01:00 am to 12:00 am
	sTimezone: "America/Havana",
	toDST: {aDate: [2024, 2, 10, 0], sResult: "2024-03-10T01:00"},
	toStandard: {aDate: [2023, 10, 5, 1], sResult: "2023-11-05T01:00", sAandBTime: "2023-11-05T00:00"}
}, { // BCP: 2370140369
	// America/Santiago: UTC-4 (Standard), UTC-3 (DST); 12:00 am to 01:00 am resp. 12:00 am to 11:00 pm
	sTimezone: "America/Santiago",
	toDST: {aDate: [2023, 8, 3, 0], sResult: "2023-09-03T01:00"},
	toStandard: {aDate: [2024, 3, 7], sResult: "2024-04-07T00:00", sAandBTime: "2024-04-06T23:00"}
}, { // America/St_Johns: UTC-3:30 (Standard), UTC-2:30 (DST); 02:00 am to 03:00 am resp. 02:00 am to 01:00 am
	sTimezone: "America/St_Johns",
	toDST: {aDate: [2024, 2, 10, 2], sResult: "2024-03-10T03:00"},
	toStandard: {aDate: [2023, 10, 5, 2], sResult: "2023-11-05T02:00", sAandBTime: "2023-11-05T01:00"}
}, { // Pacific/Easter: UTC-6 (Standard), UTC-5 (DST); 10:00 pm to 11:00 pm resp. 10:00 pm to 09:00 pm
	sTimezone: "Pacific/Easter",
	toDST: {aDate: [2023, 8, 2, 22], sResult: "2023-09-02T23:00"},
	toStandard: {aDate: [2024, 3, 6, 22], sResult: "2024-04-06T22:00", sAandBTime: "2024-04-06T21:00"}
}, { // Atlantic/Azores: UTC-1 (Standard), UTC+0 (DST); 00:00 am to 01:00 am resp. 01:00 am to 12:00 am
	sTimezone: "Atlantic/Azores",
	toDST: {aDate: [2024, 2, 31, 0], sResult: "2024-03-31T01:00"},
	toStandard: {aDate: [2023, 9, 29, 1], sResult: "2023-10-29T01:00", sAandBTime: "2023-10-29T00:00"}
}, { // Antarctica/Troll: UTC+0 (Standard), UTC+2 (DST); 01:00 am to 03:00 am resp. 03:00 am to 01:00 am
	sTimezone: "Antarctica/Troll",
	toDST: {aDate: [2024, 2, 31, 1], sResult: "2024-03-31T03:00"},
	toStandard: {
		aDate: [2023, 9, 29, 3],
		sResult: "2023-10-29T03:00",
		sAandBTime: "2023-10-29T01:00",
		iTimeshift: 7200000 // 2 hours timeshift!
	}
}, { // Africa/Casablanca: UTC+0 (Standard), UTC+1 (DST); 02:00 am to 03:00 am resp. 03:00 am to 02:00 am
	sTimezone: "Africa/Casablanca",
	toDST: {aDate: [2023, 3, 23, 2], sResult: "2023-04-23T03:00"},
	toStandard: {aDate: [2024, 2, 10, 3], sResult: "2024-03-10T03:00", sAandBTime: "2024-03-10T02:00"}
}, { // Europe/Dublin: UTC+0 (Standard), UTC+1 (DST); 01:00 am to 02:00 am resp. 02:00 am to 01:00 am
	sTimezone: "Europe/Dublin",
	toDST: {aDate: [2024, 2, 31, 1], sResult: "2024-03-31T02:00"},
	toStandard: {aDate: [2023, 9, 29, 2], sResult: "2023-10-29T02:00", sAandBTime: "2023-10-29T01:00"}
}, { // Africa/Cairo: UTC+2 (Standard), UTC+3 (DST); 12:00 am to 01:00 am resp. 12:00 am to 11:00 pm
	sTimezone: "Africa/Cairo",
	toDST: {aDate: [2024, 3, 26, 0], sResult: "2024-04-26T01:00"},
	toStandard: {aDate: [2023, 9, 27, 0], sResult: "2023-10-27T00:00", sAandBTime: "2023-10-26T23:00"}
}, { // Europe/Helsinki: UTC+2 (Standard), UTC+3 (DST); 03:00 am to 04:00 am resp. 04:00 am to 03:00 am
	sTimezone: "Europe/Helsinki",
	toDST: {aDate: [2024, 2, 31, 3], sResult: "2024-03-31T04:00"},
	toStandard: {aDate: [2023, 9, 29, 4], sResult: "2023-10-29T04:00", sAandBTime: "2023-10-29T03:00"}
}, { // Australia/Lord_Howe: UTC+10:30 (Standard), UTC+11 (DST); 02:00 am to 02:30 am resp. 02:00 am to 01:30 am
	sTimezone: "Australia/Lord_Howe",
	toDST: {aDate: [2023, 9, 1, 2], sResult: "2023-10-01T02:30"},
	toStandard: {
		aDate: [2024, 3, 7, 2],
		sResult: "2024-04-07T02:00",
		sAandBTime: "2024-04-07T01:30",
		iTimeshift: 1800000 // 0.5 hours timeshift!
	}
}, { // Australia/Adelaide: UTC+9:30 (Standard), UTC+10:30 (DST); 02:00 am to 03:00 am resp. 03:00 am to 02:00 am
	sTimezone: "Australia/Adelaide",
	toDST: {aDate: [2023, 9, 1, 2], sResult: "2023-10-01T03:00"},
	toStandard: {aDate: [2024, 3, 7, 3], sResult: "2024-04-07T03:00", sAandBTime: "2024-04-07T02:00"}
}, { // Pacific/Auckland: UTC+12:00 (Standard), UTC+13:00 (DST); 02:00 am to 03:00 am resp. 03:00 am to 02:00 am
	sTimezone: "Pacific/Auckland",
	toDST: {aDate: [2023, 8, 24, 2], sResult: "2023-09-24T03:00"},
	toStandard: {aDate: [2024, 3, 7, 3], sResult: "2024-04-07T03:00", sAandBTime: "2024-04-07T02:00"}
}, { // Pacific/Chatham: UTC+12:45 (Standard), UTC+13:45 (DST); 02:45 am to 03:45 am resp. 03:45 am to 02:45 am
	sTimezone: "Pacific/Chatham",
	toDST: {aDate: [2023, 8, 24, 2, 45], sResult: "2023-09-24T03:45"},
	toStandard: {aDate: [2024, 3, 7, 3, 45], sResult: "2024-04-07T03:45", sAandBTime: "2024-04-07T02:45"}
}].forEach((oFixture) => {
	const sTimezone = oFixture.sTimezone;
	QUnit.test("Daylight saving time checks: " + sTimezone, function (assert) {
		let oDate = new UI5Date(oFixture.toDST.aDate, sTimezone);
		assert.strictEqual(toLocalDateString(oDate), oFixture.toDST.sResult, "to daylight saving time");

		oDate = new UI5Date(oFixture.toStandard.aDate, sTimezone);
		assert.strictEqual(toLocalDateString(oDate), oFixture.toStandard.sResult, "to standard time");

		const sAandBTime = oFixture.toStandard.sAandBTime;
		const iTimeshift = oFixture.toStandard.iTimeshift || 3600000;
		const iBTimestamp = oDate.getTime() - iTimeshift;
		// b-time in standard time zone
		assert.strictEqual(toLocalDateString(new UI5Date([iBTimestamp], sTimezone)), sAandBTime, "b-time");
		const iATimestamp = oDate.getTime() - (2 * iTimeshift);
		// a-time in Daylight Saving time zone
		assert.strictEqual(toLocalDateString(new UI5Date([iATimestamp], sTimezone)), sAandBTime, "a-time");
	});
});

	//*********************************************************************************************
	QUnit.test("Daylight saving time checks: special case for 'Pacific/Apia'", function (assert) {
		// Independent State of Samoa changed time at the end of December 29, 2011
		// It changed from UTC-11 (UTC-10 DST) to UTC+13 (UTC+14 DST until 2021 - currently always UTC+13)
		assert.strictEqual(toLocalDateString(new UI5Date([2011, 11, 30, 0], "Pacific/Apia")), "2011-12-31T00:00");
	});
});
