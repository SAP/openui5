/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/UI5Date"
], function(Log, Formatting, Islamic, UI5Date) {
	"use strict";
	/* eslint-disable camelcase */

	//@formatter:off
	//Next customization MUST NOT overlap the test data defined for civil calendar (see oCivilTestData variable).
	//If new customization entries are added they must obey the same rule, otherwise an unexpected conversion result
	// may appear
	var customizingInfo = [{
		"dateFormat": "A",
		"islamicMonthStart": "14360701",
		"gregDate": "20150419"
	},
	{
		"dateFormat": "A",
		"islamicMonthStart": "14300301",
		"gregDate": "20090227"
	},
	{
		"dateFormat": "A",
		"islamicMonthStart": "14360101",
		"gregDate": "20141024"
	}];

	// All test data must be related to the months referred in at the top of the page (see variable customizingInfo).
	// Otherwise, the IslamicDate will fall-back to the default (civil) calendar calculation
	var oTestDates4Customization = {
		t2015_04_18__12_34_56_0: {
			"gregorian": {"year": 2015, "month": 3,"date": 18,  "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1436, "month": 5, "date": 28, "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2015_04_19__12_34_56_0: {
			"gregorian": {"year": 2015, "month": 3,"date": 19,  "day": 0, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1436, "month": 6, "date": 1, "day": 0, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2015_04_20__12_34_56_0: {
			"gregorian": {"year": 2015, "month": 3,"date": 20,  "day": 1, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1436, "month": 6, "date": 2, "day": 1, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2009_02_26__12_34_56_0: {
			"gregorian": {"year": 2009, "month": 1,"date": 26, "day": 4, "hours": 12, "minutes": 34, "seconds": 56,	"milliseconds": 0},
			"islamic": {"year": 1430, "month": 1, "date": 30, "day": 4, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2009_02_27__12_34_56_0: {
			"gregorian": {"year": 2009, "month": 1, "date": 27, "day": 5, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1430, "month": 2, "date": 1, "day": 5, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2009_02_28__12_34_56_0: {
			"gregorian": {"year": 2009, "month": 1, "date": 28, "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1430, "month": 2, "date": 2, "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2014_10_23__12_34_56_0: {
			"gregorian": {"year": 2014, "month": 9, "date": 23, "day": 4, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1435, "month": 11, "date": 28, "day": 4, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2014_10_24__12_34_56_0: {
			"gregorian": {"year": 2014, "month": 9, "date": 24, "day": 5, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1436, "month": 0, "date": 1, "day": 5, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		},
		t2014_10_25__12_34_56_0: {
			"gregorian": {"year": 2014, "month": 9, "date": 25, "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0},
			"islamic": {"year": 1436, "month": 0, "date": 2, "day": 6, "hours": 12, "minutes": 34, "seconds": 56, "milliseconds": 0}
		}
	};
	//formatter:on

	//The next text dates refers to dates that ARE NOT in conjunction to the moon observation
	// records (customizationInfo data above). If new test entries are added they must obey the same rule,
	// otherwise an unexpected conversion result may appear
	var oCivilTestData = {};

	/* Border cases - the fisrt day of Islamic Calendar*/
	oCivilTestData["0001/01/1"] = JSON.parse('{' +
	'"timestamp" : -42521597999000,' +
	'"islamic":  {"year":1,"month":0, "date":1, "day": 5, "hours":0, "minutes":0, "seconds":1, "milliseconds":0},' +
	'"gregorian":{"year":622,"month":6, "date":19, "day" : 5, "hours":0, "minutes":0, "seconds":1, "milliseconds":0}}');

	/* Border cases - one day before Islamic Calendar Start*/
   oCivilTestData["0000/12/29"] = JSON.parse('{' +
	'"timestamp" : -42524179199000,' +
	'"islamic":  {"year":0,"month":11, "date":29, "day": 4, "hours":0, "minutes":0, "seconds":1, "milliseconds":0},' +
	'"gregorian":{"year":622,"month":6, "date":18, "day" : 4, "hours":0, "minutes":0, "seconds":1, "milliseconds":0}}');

  /* Border cases - more than year before Islamic Calendar Start*/
	oCivilTestData["-0001/11/20"] = JSON.parse('{' +
	'"islamic":  {"year":-1,"month":10, "date":20, "day": 2, "hours":0, "minutes":0, "seconds":1, "milliseconds":0},' +
	'"gregorian":{"year":621,"month":5, "date":19, "day" : 2, "hours":0, "minutes":0, "seconds":1, "milliseconds":0}}');

	 oCivilTestData["-0012/06/29"] = JSON.parse('{' +
	'"islamic":  {"year":-12,"month":5, "date":29, "day": 5, "hours":0, "minutes":0, "seconds":1, "milliseconds":0},' +
	'"gregorian":{"year":610,"month":5, "date":1, "day": 5, "hours":0, "minutes":0, "seconds":1, "milliseconds":0}}');

	oCivilTestData.t1430_01_03__00_00_00_000 = JSON.parse('{' +
	'"timestamp" : 1230760800000,' +
	'"islamic":  {"year":1430,"month":0, "date":3, "day":3, "hours":0, "minutes":0, "seconds":0, "milliseconds":0},' +
	'"gregorian":{"year":2008,"month":11, "date":31, "day":3, "hours":0, "minutes":0, "seconds":0, "milliseconds":0}}');

	oCivilTestData.t1430_02_03__00_00_00_000 = JSON.parse('{' +
	'"timestamp" : 1233273600000,' +
	'"islamic":  {"year":1430,"month":1, "date":3, "day":5, "hours":0, "minutes":0, "seconds":0, "milliseconds":0},' +
	'"gregorian":{"year":2009,"month":0, "date":30, "day":5, "hours":0, "minutes":0, "seconds":0, "milliseconds":0}}');

	oCivilTestData.t1430_02_01__00_00_00_000 = JSON.parse('{' +
	'"timestamp" : 1233100800000,' +
	'"islamic":  {"year":1430,"month":1, "date":1, "day":3, "hours":0, "minutes":0, "seconds":0, "milliseconds":0},' +
	'"gregorian":{"year":2009,"month":0, "date":28, "day":3, "hours":0, "minutes":0, "seconds":0, "milliseconds":0}}');


	oCivilTestData.t1435_06_11__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1397344570118,' +
	'"islamic":  {"year":1435,"month":5, "date":11, "day":6, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2014,"month":3, "date":12, "day":6, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1435_06_12__00_00_10_118 = JSON.parse('{' +
	'"timestamp" : 1397347210118,' +
	'"islamic":  {"year":1435,"month":5, "date":12, "day":0, "hours":0, "minutes":0, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2014,"month":3, "date":13, "day":0, "hours":0, "minutes":0, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1435_06_12__00_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1397348170118,' +
	'"islamic":  {"year":1435,"month":5, "date":12, "day":0, "hours":0, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2014,"month":3, "date":13, "day":0, "hours":0, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1435_12_1__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1411773370118,' +
	'"islamic":  {"year":1435,"month":11, "date":1, "day": 5, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2014,"month":8, "date":26, "day" : 5, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1436_06_10__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1427843770118,' +
	'"islamic":  {"year":1436,"month":5, "date":10, "day":2, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":2, "date":31, "day":2, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1436_11_01__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1439766970118,' +
	'"islamic":  {"year":1436,"month":10, "date":1, "day": 0, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":7, "date":16, "day" : 0, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1436_11_29__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1442186170118,' +
	'"islamic":  {"year":1436,"month":10, "date":29, "day": 0, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":8, "date":13, "day" : 0, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1436_11_30__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1442272570118,' +
	'"islamic":  {"year":1436,"month":10, "date":30, "day": 1, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":8, "date":14, "day" : 1, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1436_12_1__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1442358970118,' +
	'"islamic":  {"year":1436,"month":11, "date":1, "day": 2, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":8, "date":15, "day" : 2, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	oCivilTestData.t1437_01_01__23_16_10_118 = JSON.parse('{' +
	'"timestamp" : 1444950970118,' +
	'"islamic":  {"year":1437,"month":0, "date":1, "day": 4, "hours":23, "minutes":16, "seconds":10, "milliseconds":118},' +
	'"gregorian":{"year":2015,"month":9, "date":15, "day" : 4, "hours":23, "minutes":16, "seconds":10, "milliseconds":118}}');

	//1. Instance related
	QUnit.module("sap.ui.core.date.Islamic", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			// set to "1" and it will fall-back to "A"
			this.stub(Formatting, "getABAPDateFormat").returns("1");
			this.stub(Formatting, "getCustomIslamicCalendarData")
				.returns(customizingInfo);
		}
	});

	QUnit.test("with no arguments", function (assert) {
		var clock = sinon.useFakeTimers(); // 1, January 1970 (UTC) = 22 Shawwal 1389(22.10.1389)
		var oIslamicDate = new Islamic(); //22 Shawwal 1389(22.10.1389)
		var now = UI5Date.getInstance();// 1, January 1970
		verifyDate(assert, "Constructor with no parameters must always return the Islamic date"
				+ " corresponding to the current Gregorian one.",
			 oIslamicDate, 1389, 9, 22, now.getUTCDay(), now.getUTCHours(), now.getUTCMinutes(),
			 now.getUTCSeconds(), now.getUTCMilliseconds(), true);
		clock.restore();
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		var oIslamicDate;

		oIslamicDate = new Islamic("invalid islamic date timestamp");
		assert.ok(isInvalid(oIslamicDate),
			"Constructor with invalid string as timestamp must return an invalid date");

		oIslamicDate = new Islamic({});
		assert.ok(isInvalid(oIslamicDate),
			"Constructor with object as parameter must return an invalid date");

		oIslamicDate = new Islamic(0); //1, January 1970 (UTC) = 22 Shawwal 1389(22.10.1389)
		var now = UI5Date.getInstance(0);

		verifyDate(assert, "Constructor with value(timestamp)=0 must represents IslamicDate"
				+ " corresponding to the date of 1st January 1970 Gregorian/(1389/10/22 Islamic)",
			oIslamicDate, 1389, 9, 22, now.getUTCDay(), now.getUTCHours(), now.getUTCMinutes(),
			now.getUTCSeconds(), now.getUTCMilliseconds(), true);

		var iOneDay = 24 * 60 * 60 * 1000;
		oIslamicDate = new Islamic(iOneDay); //2, January 1970 (UTC) = 23 Shawwal 1389(23.10.1389)
		var oGregorianDate = UI5Date.getInstance(iOneDay);
		verifyDate(assert, "Constructor with value(timestamp)= 'one day after 01.01.1970' must"
				+ " represents IslamicDate corresponding to the date of 2nd January 1970 Gregorian"
				+ "/(1389/10/23 Islamic)",
			oIslamicDate, 1389, 9, 23, oGregorianDate.getUTCDay(), oGregorianDate.getUTCHours(),
			oGregorianDate.getUTCMinutes(), oGregorianDate.getUTCSeconds(),
			oGregorianDate.getUTCMilliseconds(), true);

		oGregorianDate = UI5Date.getInstance(-iOneDay);
		oIslamicDate = new Islamic(-iOneDay); //31, December 1969 (UTC) = 21 Shawwal 1389(21.10.1389)
		verifyDate(assert, "Constructor with value(timestamp)= 'one day before 01.01.1970' must"
				+ " represents IslamicDate corresponding to the date of 31st December 1970"
				+ " Gregorian/(1389/10/21 Islamic)",
			oIslamicDate, 1389, 9, 21, oGregorianDate.getUTCDay(), oGregorianDate.getUTCHours(),
			oGregorianDate.getUTCMinutes(), oGregorianDate.getUTCSeconds(),
			oGregorianDate.getUTCMilliseconds(), true);
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: invalid parameter type )", function (assert) {
		// ------------- object -----------------------------
		var oIslamicDate = null;

		oIslamicDate = new Islamic(1430, 0, "alabala");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as day must return invalid date");

		oIslamicDate = new Islamic({}, 0);
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as year must return invalid date");

		oIslamicDate = new Islamic(1430, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as month must return invalid date");

		oIslamicDate = new Islamic(1430, 0, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as day must return invalid date");

		oIslamicDate = new Islamic(1430, 0, 1, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as hours must return invalid date");

		oIslamicDate = new Islamic(1430, 0, 1, 0, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as minutes must return invalid date");

		oIslamicDate = new Islamic(1430, 0, 1, 0, 0, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as seconds must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, 1, 0, 0, 0, {});
		assert.ok(isInvalid(oIslamicDate), "Constructor with object as milliseconds must return invalid date");

		// ------------- string -----------------------------
		oIslamicDate = oIslamicDate = new Islamic("a", 0);
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as year must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic("1430", "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as month must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as month must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, 1, "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as hours must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, 1, 0, "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as minutes must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, 1, 0, 0, "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as seconds must return invalid date");

		oIslamicDate = oIslamicDate = new Islamic(1430, 0, 1, 0, 0, 0, "a");
		assert.ok(isInvalid(oIslamicDate), "Constructor with invalid string as milliseconds must return invalid date");
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: valid values)", function (assert) {
		var oIslamicDate = null;
		var oTestDate = oCivilTestData.t1436_06_10__23_16_10_118;
		oIslamicDate = createIslamicDateFromTestEntry(oTestDate);
		verifyDateWithTestDate(assert, "Constructor with valid values", oIslamicDate, oTestDate.islamic);
	});

	QUnit.test("with optional parameters", function (assert) {
		var oIslamicDate = new Islamic(1430, 10);
		verifyDate(assert, "new Islamic(1430, 10) must be equal to 01.11.1430 (tuesday) 00:00:00.00 AM", oIslamicDate, 1430, 10, 1, 2, 0, 0, 0, 0);

		oIslamicDate = new Islamic(1430, 10, 2);
		verifyDate(assert, "new Islamic(1430, 10, 2) msut be equal to 02.11.1430 (wednesday) 00:00:00.00 AM", oIslamicDate, 1430, 10, 2, 3, 0, 0, 0, 0);

		oIslamicDate = new Islamic(1430, 10, 2, 1);
		verifyDate(assert, "new Islamic(1430, 10, 2, 1) must be equal to 02.11.1430 (wednesday), 01:00:00.00 AM", oIslamicDate, 1430, 10, 2, 3, 1, 0, 0, 0);

		oIslamicDate = new Islamic(1430, 10, 2, 1, 22);
		verifyDate(assert, "new Islamic(1430, 10, 2, 1, 22) must be equal to 02.11.1430 (wednesday), 01:22:00.00 AM", oIslamicDate, 1430, 10, 2, 3, 1, 22, 0, 0);

		oIslamicDate = new Islamic(1430, 10, 2, 1, 22, 30);
		verifyDate(assert, "new Islamic(1430, 10, 2, 1, 22, 30) must be equal to 02.11.1430 (wednesday), 01:00:00.00 AM", oIslamicDate, 1430, 10, 2, 3, 1, 22, 30, 0);
	});

	// Islamic Parameter values outside allowed ranges adjust the adjacent value as well
	QUnit.test("month given as setter is outside the range(0-11)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		var oOneMonthLater = oCivilTestData.t1437_01_01__23_16_10_118.islamic;
		oIslamicDate.setMonth(12); //11 is max allowed value
		verifyDateWithTestDate(assert, "1436_12_1__23_16_10_118;setMonth(12) -> 1437_01_01__23_16_10_118", oIslamicDate, oOneMonthLater);
	});

	QUnit.test("month given in constructor is outside the range(0-11)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, 12, date.islamic.date, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, date.islamic.milliseconds);
		var oOneMonthLater = oCivilTestData.t1437_01_01__23_16_10_118.islamic;
		verifyDateWithTestDate(assert, "new Islamic(1436, *12*, 1, 23, 16, 10, 19) -> 1437_01_01__23_16_10_118", oIslamicDate, oOneMonthLater);
	});

	QUnit.test("date given as setter is outside the range(1-30)", function (assert) {
		var date = oCivilTestData.t1436_11_30__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setDate(31);
		verifyDateWithTestDate(assert, "t1436_11_30__23_16_10_118; setDate(31)->t1436_12_1__23_16_10_118", oIslamicDate, oCivilTestData.t1436_12_1__23_16_10_118.islamic);
	});

	QUnit.test("date given in constructor is outside the range(1-30)", function (assert) {
		var date = oCivilTestData.t1436_11_30__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, 31, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, date.islamic.milliseconds);
		verifyDateWithTestDate(assert, "new Islamic(1436, 10, *31*, 23, 16, 10, 118) -> t1436_12_1__23_16_10_118", oIslamicDate, oCivilTestData.t1436_12_1__23_16_10_118.islamic);
	});

	QUnit.test("hours given as setter is outside the range(0-23)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setHours(24);
		verifyDateWithTestDate(assert, "t1435_06_11__23_16_10_118; setHours(24)->t1435_06_12__00_16_10_118", oIslamicDate, oCivilTestData.t1435_06_12__00_16_10_118.islamic);
	});

	QUnit.test("hours given in constructor is outside the range(0-23)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, 24, date.islamic.minutes, date.islamic.seconds, date.islamic.milliseconds);
		verifyDateWithTestDate(assert, "new Islamic(1435, 5, 11, *24*, 16, 10, 118) - > t1435_06_12__00_16_10_118", oIslamicDate, oCivilTestData.t1435_06_12__00_16_10_118.islamic);
	});

	QUnit.test("minutes given as setter is outside the range(0-59)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setMinutes(60);
		verifyDateWithTestDate(assert, "t1435_06_11__23_16_10_118; setMinutes(60)->t1435_06_12__00_00_10_118", oIslamicDate, oCivilTestData.t1435_06_12__00_00_10_118.islamic);
	});

	QUnit.test("minutes given in constructor is outside the range(0-59)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, 60, date.islamic.seconds, date.islamic.milliseconds);
		verifyDateWithTestDate(assert, "new Islamic(1435, 5, 11, 23, *60*, 10, 118) - > t1435_06_12__00_16_10_118", oIslamicDate, oCivilTestData.t1435_06_12__00_00_10_118.islamic);
	});

	QUnit.test("seconds given as setter is outside the range(0-59)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oExpectedId = date.islamic;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setSeconds(60);
		verifyDate(assert, "t1435_06_11__23_16_10_118; setSeconds(60) - >  t1435_06_11__23_17_00_118",
				oIslamicDate, oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, 17, 0, oExpectedId.milliseconds);
	});

	QUnit.test("seconds given in constructor outside the range(0-59)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oExpectedId = date.islamic;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, date.islamic.minutes, 60, date.islamic.milliseconds);
		verifyDate(assert, "new Islamic(1435, 5, 11, 23, 16, *60*, 118) - > t1435_06_11__23_17_00_118 ", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, 17, 0, oExpectedId.milliseconds);
	});

	QUnit.test("milliseconds given as setter is outside the range(0-999)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oExpectedId = date.islamic;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setMilliseconds(1000);
		verifyDate(assert, "t1435_06_11__23_16_10_118; setMilliseconds(1000) -> 1435_06_11__23_16_11_0000", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, oExpectedId.minutes, 11, 0);
	});

	QUnit.test("milliseconds given in constructor is outside the range(0-999)", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oExpectedId = date.islamic;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, 1000);
		verifyDate(assert, "new Islamic(1435,5,11,23,16,10,*1000*) -> 1435_06_11__23_16_11_0000", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, oExpectedId.minutes, 11, 0);
	});

	QUnit.test("setMonth(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setMonth(-1);
		verifyDateWithTestDate(assert, "1436_12_1__23_16_10_118 setMonth(-1) -> 1435_12_1__23_16_10_118(last month in the previous year)", oIslamicDate, oCivilTestData.t1435_12_1__23_16_10_118.islamic);
	});

	QUnit.test("setUTCMonth(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date, true);
		oIslamicDate.setUTCMonth(-1);
		verifyDateWithTestDate(assert, "1436_12_1__23_16_10_118 setUTCMonth(-1) -> 1435_12_1__23_16_10_118(last month in the previous year)", oIslamicDate, oCivilTestData.t1435_12_1__23_16_10_118.islamic, true);
	});

	QUnit.test("-1 as month in the constructor", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, -1, date.islamic.date, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, date.islamic.milliseconds);
		verifyDateWithTestDate(assert, "new Islamic(1436,11,*-1*,23,16,10,118) -> 1435_12_1__23_16_10_118(last month in the previous year)", oIslamicDate, oCivilTestData.t1435_12_1__23_16_10_118.islamic);
	});

	QUnit.test("setDate(0)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		oIslamicDate.setDate(0);
		verifyDateWithTestDate(assert, "t1436_12_1__23_16_10_118 setDate(0) - > t1436_11_30__23_16_10_118", oIslamicDate, oCivilTestData.t1436_11_30__23_16_10_118.islamic);
	});

	QUnit.test("setUTCDate(0)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date, true);
		oIslamicDate.setUTCDate(0);
		verifyDateWithTestDate(assert, "t1436_12_1__23_16_10_118 setUTCDate(0) - > t1436_11_30__23_16_10_118", oIslamicDate, oCivilTestData.t1436_11_30__23_16_10_118.islamic, true);
	});

	QUnit.test("0 as date in the constructor", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, 0, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, date.islamic.milliseconds);
		verifyDateWithTestDate(assert, "new Islamic(1436,12,*0*,23,16,10,118) - > t1436_11_30__23_16_10_118", oIslamicDate, oCivilTestData.t1436_11_30__23_16_10_118.islamic);
	});


	QUnit.test("setMinutes(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		var oExpectedId = date.islamic;
		oIslamicDate.setMinutes(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setMinutes(-1) - > t1436_12_1__22_59_00_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours - 1, 59, oExpectedId.seconds, oExpectedId.milliseconds);
	});

	QUnit.test("setUTCMinutes(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date, true);
		var oExpectedId = date.islamic;
		oIslamicDate.setUTCMinutes(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setUTCMinutes(-1) - > t1436_12_1__22_59_00_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours - 1, 59, oExpectedId.seconds, oExpectedId.milliseconds, true);
	});

	QUnit.test("-1 as minutes in the constructor", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, -1, date.islamic.seconds, date.islamic.milliseconds);
		var oExpectedId = date.islamic;
		verifyDate(assert, "new Islamic(1436, 11, 1, 23, *-1*, 10, 118) - > t1436_12_1__22_59_00_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours - 1, 59, oExpectedId.seconds, oExpectedId.milliseconds);
	});

	QUnit.test("setSeconds(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		var oExpectedId = date.islamic;
		oIslamicDate.setSeconds(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setSeconds(-1) - > t1436_12_1__23_15_59_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, 15, 59, oExpectedId.milliseconds);
	});

	QUnit.test("setUTCSeconds(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date, true);
		var oExpectedId = date.islamic;
		oIslamicDate.setUTCSeconds(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setUTCSeconds(-1) - > t1436_12_1__23_15_59_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, 15, 59, oExpectedId.milliseconds, true);
	});

	QUnit.test("-1 as seconds in the constructor", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, date.islamic.minutes, -1, date.islamic.milliseconds);
		var oExpectedId = date.islamic;
		verifyDate(assert, "new Islamic(1436, 12, 1, 23, 16, *-1*, 118)- > t1436_12_1__23_15_59_118", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, 15, 59, oExpectedId.milliseconds);
	});

	QUnit.test("setMilliseconds(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		var oExpectedId = date.islamic;
		oIslamicDate.setMilliseconds(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setMilliseconds(-1) - > t1436_12_1__23_16_09_999", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, oExpectedId.minutes, 9, 999);
	});

	QUnit.test("setUTCMilliseconds(-1)", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date, true);
		var oExpectedId = date.islamic;
		oIslamicDate.setUTCMilliseconds(-1);
		verifyDate(assert, "t1436_12_1__23_16_10_118 setUTCMilliseconds(-1) - > t1436_12_1__23_16_09_999", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, oExpectedId.minutes, 9, 999, true);
	});

	QUnit.test("-1 as milliseconds in the constructor", function (assert) {
		var date = oCivilTestData.t1436_12_1__23_16_10_118;
		var oIslamicDate = new Islamic(date.islamic.year, date.islamic.month, date.islamic.date, date.islamic.hours, date.islamic.minutes, date.islamic.seconds, -1);
		var oExpectedId = date.islamic;
		verifyDate(assert, "new Islamic(1436, 12, 1, 23, 16, 10, *-1*)- > t1436_12_1__23_16_09_999", oIslamicDate,
				oExpectedId.year, oExpectedId.month, oExpectedId.date, oExpectedId.day, oExpectedId.hours, oExpectedId.minutes, 9, 999);
	});


	QUnit.test("Set/Get Full Year", function (assert) {
		var iYear = 1435;
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		oIslamicDate.setFullYear(iYear);
		verifyDate(assert, "Setting/getting islamic year", oIslamicDate, iYear, 5, 11, 6, 23, 16, 10, 118);
	});

	QUnit.test("setFullYear with optional parameters", function (assert) {
		verifyYear2Date(assert, false, 1433, 2, 5);
	});

	QUnit.test("setUTCFullYear with optional parameters", function (assert) {
		verifyYear2Date(assert, true, 1433, 2, 5);
	});

	QUnit.test("setUTCFullYear with optional parameters close to the border values", function (assert) {
		verifyYear2Date(assert, true, 1436, 7, 1, 1436, 6, 30);
	});

	QUnit.test("Set/Get Year", function (assert) {
		var iYear = 35;
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		oIslamicDate.setYear(iYear);
		verifyDate(assert, "Setting/getting islamic year", oIslamicDate, 1435, 5, 11, 6, 23, 16, 10, 118);
		assert.equal(oIslamicDate.getYear(), 35, "GetYear should return the 2 digit year offset since 1400");
	});
	QUnit.test("Set/Get Month", function (assert) {
		var iMonth = 5;
		var oIslamicDate = new Islamic(1400, 4, 11, 23, 16, 10, 118);
		oIslamicDate.setMonth(iMonth);
		verifyDate(assert, "Setting an islamic date with given month must return the same month", oIslamicDate, 1400, iMonth, 11, 0, 23, 16, 10, 118);
	});

	QUnit.test("setMonth with optional parameters", function (assert) {
		verifyMonth2Date(assert, false, 2, 5);
	});

	QUnit.test("setUTCMonth with optional parameters", function (assert) {
		verifyMonth2Date(assert, true, 2, 5);
	});

	QUnit.test("setUTCMonth with optional parameters close to te border values", function (assert) {
		verifyMonth2Date(assert, true, 7, 1, 6, 30);
	});

	QUnit.test("Set/Get Date", function (assert) {
		var iDate = 22;
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		var iOrigHours = oIslamicDate.getHours();
		oIslamicDate.setDate(iDate);
		verifyDate(assert, "Setting an islamic date with given month must return the same date", oIslamicDate, 1436, 5, iDate, 0, 23, 16, 10, 118);
		assert.equal(oIslamicDate.getHours(), iOrigHours, "Setting an islamic date with given date must not change hours");
	});

	QUnit.test("Get Day", function (assert) {
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		assert.equal(oIslamicDate.getDay(), 3, "Islamic Date 1436/06/11 is the 3th day of week (index 3, starting from 0 Sunday)");//
	});

	QUnit.test("Set/Get Hours", function (assert) {
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		var iHours = 14;
		oIslamicDate.setHours(iHours);
		verifyDate(assert, "Setting an islamic date with given hours must return the same hours", oIslamicDate, 1436, 5, 11, 3, iHours, 16, 10, 118);
	});

	QUnit.test("setHours with optional parameters", function (assert) {
		verifyHours2Milliseconds(assert, false, 5, 22, 17, 11);
	});

	QUnit.test("setUTCHours with optional parameters", function (assert) {
		verifyHours2Milliseconds(assert, true, 5, 22, 17, 11);
	});

	QUnit.test("Set/Get Minutes", function (assert) {
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		var iMinutes = 14;
		oIslamicDate.setMinutes(iMinutes);
		verifyDate(assert, "Setting an islamic date with given minutes must return the same minutes", oIslamicDate, 1436, 5, 11, 3, 23, iMinutes, 10, 118);
	});

	QUnit.test("setMinutes with optional parameters", function (assert) {
		verifyMinutes2Milliseconds(assert, false, 22, 17, 11);
	});

	QUnit.test("setUTCMinutes with optional parameters", function (assert) {
		verifyMinutes2Milliseconds(assert, true, 22, 17, 11);
	});

	QUnit.test("Set/Get Seconds", function (assert) {
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		var iSeconds = 44;
		oIslamicDate.setSeconds(iSeconds);
		verifyDate(assert, "Setting an islamic date with given seconds must return the same seconds", oIslamicDate, 1436, 5, 11, 3, 23, 16, iSeconds, 118);
	});

	QUnit.test("setSeconds with optional parameters", function (assert) {
		verifySeconds2Milliseconds(assert, false, 17, 11);
	});

	QUnit.test("setUTCSeconds with optional parameters", function (assert) {
		verifySeconds2Milliseconds(assert, true, 17, 11);
	});

	QUnit.test("Set/Get Milliseconds", function (assert) {
		var oIslamicDate = new Islamic(1436, 5, 11, 23, 16, 10, 118);
		var iMilliseconds = 44;
		oIslamicDate.setMilliseconds(iMilliseconds);
		verifyDate(assert, "Setting an islamic date with given seconds must return the same seconds", oIslamicDate, 1436, 5, 11, 3, 23, 16, 10, iMilliseconds);
	});

	QUnit.test("Get time", function (assert) {
		var date = oCivilTestData.t1435_06_11__23_16_10_118;
		var oIslamicDate = createIslamicDateFromTestEntry(date);
		var iTimezoneOffset = getTimezoneOffset(oIslamicDate);
		assert.equal(oIslamicDate.getTime(), date.timestamp - iTimezoneOffset, "Get time should return the UTC offset from 1.1.1970 UTC");
	});

	QUnit.test("Setters have to return the time since 1.1.1970", function (assert) {
		var oDate = new Islamic(1354, 0, 1, 8, 10, 15, 119);

		function check(iTimestamp, sSetter) {
			assert.equal(typeof iTimestamp, "number", sSetter + " did return a numeric value");
			assert.equal(iTimestamp, oDate.getTime(), sSetter + " return value matches date timestamp");
		}

		check(oDate.setFullYear(1435), "setFullYear");
		check(oDate.setYear(35), "setYear");
		check(oDate.setMonth(5), "setMonth");
		check(oDate.setDate(11), "setDate");
		check(oDate.setHours(23), "setHours");
		check(oDate.setMinutes(16), "setMinutes");
		check(oDate.setSeconds(10), "setSeconds");
		check(oDate.setMilliseconds(118), "setMilliseconds");

		check(oDate.setUTCFullYear(35), "setUTCFullYear");
		check(oDate.setUTCMonth(5), "setUTCMonth");
		check(oDate.setUTCDate(11), "setUTCDate");
		check(oDate.setUTCHours(23), "setUTCHours");
		check(oDate.setUTCMinutes(16), "setUTCMinutes");
		check(oDate.setUTCSeconds(10), "setUTCSeconds");
		check(oDate.setUTCMilliseconds(118), "setUTCMilliseconds");
	});

	QUnit.test(".Now()", function (assert) {
		var clock = sinon.useFakeTimers(0); // 1, January 1970 = 22 Shawwal 1389(22.10.1389)
		assert.equal(Islamic.now(), 0, "Islamic.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");

		clock.restore();
		clock = sinon.useFakeTimers(7000); // 7 seconds later

		assert.equal(Islamic.now(), 7000, "Islamic.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");
		clock.restore();
	});

	QUnit.test("Convert Gregorian to Islamic dates", function (assert) {
		testGregorian2IslamicWithTestDataSet(assert, oCivilTestData);
	});

	QUnit.test("Convert Islamic to Gregorian dates", function (assert) {
		testIslamic2GregorianWithTestDataSet(assert, oCivilTestData);
	});


	QUnit.test("Convert Gregorian to Islamic dates and vise-versa with customData", function (assert) {
		testGregorian2IslamicWithTestDataSet(assert, oTestDates4Customization);
		testIslamic2GregorianWithTestDataSet(assert, oTestDates4Customization);
	});

	// --------------------------- HELPERS -------------------------------------------------------------------------

	function verifyYear2Date(assert, bUTC, iYear, iMonth, iDate, iYearToStartFrom,
		iMonthToStartFrom, iDateStartFrom) {
			var oIslamicDate = null,
				iOrigHours;

			if (bUTC) {
				oIslamicDate = new Islamic(Islamic.now());
				if (arguments.length >= 6) {
					oIslamicDate.setUTCFullYear(iYearToStartFrom);
				}
				if (arguments.length >= 7) {
					oIslamicDate.setUTCMonth(iMonthToStartFrom);
				}
				if (arguments.length >= 8) {
					oIslamicDate.setUTCDate(iDateStartFrom);
				}
				iOrigHours = oIslamicDate.getUTCHours();
				assert.ok(oIslamicDate.setUTCFullYear(iYear, iMonth, iDate),
					"setUTCFullYear must return value");
			} else {
				oIslamicDate = new Islamic();
				if (arguments.length >= 6) {
					oIslamicDate.setFullYear(iYearToStartFrom);
				}
				if (arguments.length >= 7) {
					oIslamicDate.setMonth(iMonthToStartFrom);
				}
				if (arguments.length >= 8) {
					oIslamicDate.setDate(iDateStartFrom);
				}
				iOrigHours = oIslamicDate.getHours();
				assert.ok(oIslamicDate.setFullYear(iYear, iMonth, iDate),
					"setFullYear must return value");
			}

			assert.equal(bUTC ? oIslamicDate.getUTCFullYear() : oIslamicDate.getFullYear(), iYear,
				": year");
			assert.equal(bUTC ? oIslamicDate.getUTCMonth() : oIslamicDate.getMonth(), iMonth,
				": month");
			assert.equal(bUTC ? oIslamicDate.getUTCDate() : oIslamicDate.getDate(), iDate,
				": date");
			assert.equal(bUTC ? oIslamicDate.getUTCHours() : oIslamicDate.getHours(), iOrigHours,
				": hours must not be changed");
		}

	function verifyMonth2Date (assert, bUTC, iMonth, iDate, iMonthToStartFrom, iDateStartFrom) {
		var oIslamicDate = null,
			iOrigHours;

		if (bUTC) {
			oIslamicDate = new Islamic(Islamic.now());
			if (arguments.length >= 5) {
				oIslamicDate.setUTCMonth(iMonthToStartFrom);
			}
			if (arguments.length >= 6) {
				oIslamicDate.setUTCDate(iDateStartFrom);
			}
			iOrigHours = oIslamicDate.getUTCHours();
			assert.ok(oIslamicDate.setUTCMonth(iMonth, iDate), "setUTCMonth must return value");
		} else {
			oIslamicDate = new Islamic();
			if (arguments.length >= 5) {
				oIslamicDate.setMonth(iMonthToStartFrom);
			}
			if (arguments.length >= 6) {
				oIslamicDate.setDate(iDateStartFrom);
			}
			iOrigHours = oIslamicDate.getHours();
			assert.ok(oIslamicDate.setMonth(iMonth, iDate), "setUTCMonth must return value");
		}

		assert.equal(bUTC ? oIslamicDate.getUTCMonth() : oIslamicDate.getMonth(), iMonth,
			": month");
		assert.equal(bUTC ? oIslamicDate.getUTCDate() : oIslamicDate.getDate(), iDate,
			": date");
		assert.equal(bUTC ? oIslamicDate.getUTCHours() : oIslamicDate.getHours(), iOrigHours,
			": hours must not be changed");
	}

	function verifyHours2Milliseconds (assert, bUTC, iHours, iMinutes, iSeconds, iMilliseconds) {
		var oIslamicDate = null;

		if (bUTC) {
			oIslamicDate = new Islamic(Islamic.now());
			assert.ok(oIslamicDate.setUTCHours(iHours, iMinutes, iSeconds, iMilliseconds),
				"setUTCHours must return value");
		} else {
			oIslamicDate = new Islamic();
			assert.ok(oIslamicDate.setHours(iHours, iMinutes, iSeconds, iMilliseconds),
				"setUTCHours must return value");
		}

		assert.equal(bUTC ? oIslamicDate.getUTCHours() : oIslamicDate.getHours(), iHours,
			": hours");
		assert.equal(bUTC ? oIslamicDate.getUTCMinutes() : oIslamicDate.getMinutes(), iMinutes,
			": minutes");
		assert.equal(bUTC ? oIslamicDate.getUTCSeconds() : oIslamicDate.getSeconds(), iSeconds,
			": seconds");
		assert.equal(bUTC ? oIslamicDate.getUTCMilliseconds() : oIslamicDate.getMilliseconds(),
			iMilliseconds, ": milliseconds");
	}

	function verifyMinutes2Milliseconds (assert, bUTC, iMinutes, iSeconds, iMilliseconds) {
		var oIslamicDate = null;

		if (bUTC) {
			oIslamicDate = new Islamic(Islamic.now());
			assert.ok(oIslamicDate.setUTCMinutes(iMinutes, iSeconds, iMilliseconds),
				"setUTCMinutes must return value");
		} else {
			oIslamicDate = new Islamic();
			assert.ok(oIslamicDate.setMinutes(iMinutes, iSeconds, iMilliseconds),
				"setMinutes must return value");
		}

		assert.equal(bUTC ? oIslamicDate.getUTCMinutes() : oIslamicDate.getMinutes(), iMinutes,
			": minutes");
		assert.equal(bUTC ? oIslamicDate.getUTCSeconds() : oIslamicDate.getSeconds(), iSeconds,
			": seconds");
		assert.equal(bUTC ? oIslamicDate.getUTCMilliseconds() : oIslamicDate.getMilliseconds(),
			iMilliseconds, ": milliseconds");
	}

	function verifySeconds2Milliseconds (assert, bUTC, iSeconds, iMilliseconds) {
		var oIslamicDate = null;

		if (bUTC) {
			oIslamicDate = new Islamic(Islamic.now());
			assert.ok(oIslamicDate.setUTCSeconds(iSeconds, iMilliseconds),
				"setUTCSeconds must return value");
		} else {
			oIslamicDate = new Islamic();
			assert.ok(oIslamicDate.setSeconds(iSeconds, iMilliseconds),
				"setSeconds must return value");
		}

		assert.equal(bUTC ? oIslamicDate.getUTCSeconds() : oIslamicDate.getSeconds(), iSeconds,
			": seconds");
		assert.equal(bUTC ? oIslamicDate.getUTCMilliseconds() : oIslamicDate.getMilliseconds(),
			iMilliseconds, ": milliseconds");
	}

	function testIslamic2GregorianWithTestDataSet(assert, testDataset) {
		var sTestDate = null;
		for (sTestDate in testDataset) {
			var oLocalIslamicDate = createIslamicDateFromTestEntry(testDataset[sTestDate], true);
			var oExpectedLocalGregorianDate = createGregorianDateFromTestEntry(testDataset[sTestDate], true);
			var oRealLocalGregorianDate = UI5Date.getInstance(oLocalIslamicDate.getTime());
			compareTwoDates(assert, "Islamic2Gregorian " + sTestDate, oRealLocalGregorianDate, oExpectedLocalGregorianDate);
		}
	}

	function testGregorian2IslamicWithTestDataSet(assert, testDataset) {
		var sTestDate = null;
		for (sTestDate in testDataset) {
			var oGregorianDate = createGregorianDateFromTestEntry(testDataset[sTestDate]);
			var oRealIslamicDate = new Islamic(oGregorianDate.getTime());
			verifyDateWithTestDate(assert, "Gregorian2Islamic: " + sTestDate, oRealIslamicDate, testDataset[sTestDate].islamic);
		}
	}

	function verifyDateWithTestDate(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.year, oExpectedTestDate.month, oExpectedTestDate.date, oExpectedTestDate.day, oExpectedTestDate.hours, oExpectedTestDate.minutes, oExpectedTestDate.seconds, oExpectedTestDate.milliseconds, bUTC);
	}

	function compareTwoDates(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.getFullYear(), oExpectedTestDate.getMonth(), oExpectedTestDate.getDate(), oExpectedTestDate.getDay(),
				oExpectedTestDate.getHours(), oExpectedTestDate.getMinutes(), oExpectedTestDate.getSeconds(), oExpectedTestDate.getMilliseconds(), bUTC);
	}

	function verifyDate(assert, sMessage, oDate, year, month, date, day, hours, minutes, seconds, milliseconds, bUTC) {
		var sExpected = formatDateTime(year, month, date, day, hours, minutes, seconds, milliseconds);
		var sReal = formatDateTime(
				String(bUTC ? oDate.getUTCFullYear() : oDate.getFullYear()),
				String(bUTC ? oDate.getUTCMonth() : oDate.getMonth()),
				String(bUTC ? oDate.getUTCDate() : oDate.getDate()),
				String(bUTC ? oDate.getUTCDay() : oDate.getDay()),
				String(bUTC ? oDate.getUTCHours() : oDate.getHours()),
				String(bUTC ? oDate.getUTCMinutes() : oDate.getMinutes()),
				String(bUTC ? oDate.getUTCSeconds() : oDate.getSeconds()),
				String(bUTC ? oDate.getUTCMilliseconds() : oDate.getMilliseconds()));

		assert.equal(sReal, sExpected, sMessage);
	}

	function formatDateTime(year, month, date, day, hours, minutes, seconds, milliseconds) {
		return String(year).padStart(4, "0") + "/" +
				String(month).padStart(2, "0") + "/" +
				String(date).padStart(2, "0") + "(" + day + ") " +
				String(hours).padStart(2, "0") + ":" +
				String(minutes).padStart(2, "0") + ":" +
				String(seconds).padStart(2, "0") + "." +
				String(milliseconds).padStart(4, "0");
	}

	function createIslamicDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.islamic;
		if (bUTC) {
			// eslint-disable-next-line new-cap
			return new Islamic(Islamic.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.date,
				oDateEntry.hours, oDateEntry.minutes, oDateEntry.seconds, oDateEntry.milliseconds));
		} else {
			return new Islamic(oDateEntry.year, oDateEntry.month, oDateEntry.date,
				oDateEntry.hours, oDateEntry.minutes, oDateEntry.seconds, oDateEntry.milliseconds);
		}
	}

	function createGregorianDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.gregorian;
		if (bUTC) {
			return UI5Date.getInstance(Date.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.date,
				oDateEntry.hours, oDateEntry.minutes, oDateEntry.seconds, oDateEntry.milliseconds));
		} else {
			return UI5Date.getInstance(oDateEntry.year, oDateEntry.month, oDateEntry.date,
				oDateEntry.hours, oDateEntry.minutes, oDateEntry.seconds, oDateEntry.milliseconds);
		}
	}

	function getTimezoneOffset(oDate) {
		return -1 * oDate.getTimezoneOffset() * 60 * 1000;
	}

	function isInvalid(oDate) {
		return isNaN(oDate.getTime());
	}


});
