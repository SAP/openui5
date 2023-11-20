/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/date/Persian",
	"sap/ui/core/date/UI5Date"
], function(Log, Persian, UI5Date) {
	"use strict";

	// Test data
	var aTestData = [
		{Gregorian: {year: 1970, month: 0, day: 1}, Persian: {year: 1348, month: 9, day: 11}},
		{Gregorian: {year: 2016, month: 2, day: 20}, Persian: {year: 1395, month: 0, day: 1}},
		{Gregorian: {year: 1989, month: 0, day: 8}, Persian: {year: 1367, month: 9, day: 18}},
		{Gregorian: {year: 1989, month: 0, day: 7}, Persian: {year: 1367, month: 9, day: 17}},
		{Gregorian: {year: 1902, month: 7, day: 13}, Persian: {year: 1281, month: 4, day: 21}},
		{Gregorian: {year: 1921, month: 3, day: 30}, Persian: {year: 1300, month: 1, day: 10}},
		{Gregorian: {year: 1945, month: 2, day: 9}, Persian: {year: 1323, month: 11, day: 18}},
		{Gregorian: {year: 1964, month: 11, day: 3}, Persian: {year: 1343, month: 8, day: 12}},
		{Gregorian: {year: 1979, month: 0, day: 24}, Persian: {year: 1357, month: 10, day: 4}},
		{Gregorian: {year: 1997, month: 8, day: 15}, Persian: {year: 1376, month: 5, day: 24}},
		{Gregorian: {year: 2009, month: 6, day: 11}, Persian: {year: 1388, month: 3, day: 20}},
		{Gregorian: {year: 2018, month: 9, day: 19}, Persian: {year: 1397, month: 6, day: 27}}
	];

	//1. Instance related
	QUnit.module("sap.ui.core.date.Persian", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	QUnit.test("with no arguments", function (assert) {
		var clock = sinon.useFakeTimers(); // 1, January 1970 = 11 Dey 1348 (11.10.1348)
		var oPersianDate = new Persian(); //11 Dey 1348 (11.10.1348)
		var now = UI5Date.getInstance();// 1, January 1970
		verifyDate(assert, "Constructor with no parameters must always return the Persian date corresponding to the current " +
		"Gregorian one.", oPersianDate, 1348, 9, 11, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
		clock.restore();
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		var oPersianDate;

		oPersianDate = new Persian("invalid Persian date timestamp");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as timestamp must return an invalid date");

		oPersianDate = new Persian({});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as parameter must return an invalid date");

		oPersianDate = new Persian(0); //1, January 1970 = 11 Dey 1348 (11.10.1348)
		var now = UI5Date.getInstance(0);

		verifyDate(assert, "Constructor with value(timestamp)=0 must represents PersianDate corresponding to the date of 1st January 1970 Gregorian/(11.10.1348 Persian)",
				oPersianDate, 1348, 9, 11, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

		var iOneDay = 24 * 60 * 60 * 1000;
		oPersianDate = new Persian(iOneDay); //2, January 1970 = 12 Dey 1348 (11.10.1348)
		var oGregorianDate = UI5Date.getInstance(iOneDay);
		verifyDate(assert, "Constructor with value(timestamp)= 'one day after 01.01.1970' must represents PersianDate corresponding to the date of 2nd January 1970 Gregorian/(10.10.1348 Persian)",
				oPersianDate, 1348, 9, 12, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());

		oGregorianDate = UI5Date.getInstance(-iOneDay);
		oPersianDate = new Persian(-iOneDay); //31, December 1969 = 10 Dey 1348 (11.10.1348)
		verifyDate(assert, "Constructor with value(timestamp)= 'one day before 01.01.1970' must represents PersianDate corresponding to the date of 31st December 1969 Gregorian/(12.10.1348 Persian)",
				oPersianDate, 1348, 9, 10, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: invalid parameter type )", function (assert) {
		// ------------- object -----------------------------
		var oPersianDate = null;

		oPersianDate = new Persian(1430, 0, "alabala");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as day must return invalid date");

		oPersianDate = new Persian({}, 0);
		assert.ok(isInvalid(oPersianDate), "Constructor with object as year must return invalid date");

		oPersianDate = new Persian(1430, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as month must return invalid date");

		oPersianDate = new Persian(1430, 0, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as day must return invalid date");

		oPersianDate = new Persian(1430, 0, 1, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as hours must return invalid date");

		oPersianDate = new Persian(1430, 0, 1, 0, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as minutes must return invalid date");

		oPersianDate = new Persian(1430, 0, 1, 0, 0, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as seconds must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, 1, 0, 0, 0, {});
		assert.ok(isInvalid(oPersianDate), "Constructor with object as milliseconds must return invalid date");

		// ------------- string -----------------------------
		oPersianDate = oPersianDate = new Persian("a", 0);
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as year must return invalid date");

		oPersianDate = oPersianDate = new Persian("1430", "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as month must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as month must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, 1, "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as hours must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, 1, 0, "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as minutes must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, 1, 0, 0, "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as seconds must return invalid date");

		oPersianDate = oPersianDate = new Persian(1430, 0, 1, 0, 0, 0, "a");
		assert.ok(isInvalid(oPersianDate), "Constructor with invalid string as milliseconds must return invalid date");
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: valid values)", function (assert) {
		var oPersianDate = null;
		aTestData.forEach(function(oTestDate) {
			oPersianDate = createPersianDateFromTestEntry(oTestDate);
			verifyDateWithTestDate(assert, "Constructor with valid values", oPersianDate, oTestDate.Persian);
		});
	});

	QUnit.test("with optional parameters", function (assert) {
		var oPersianDate = new Persian(1430, 10);
		verifyDate(assert, "new Persian(1430, 10) must be equal to 01.11.1430 (tuesday) 00:00:00.00 AM", oPersianDate, 1430, 10, 1);

		oPersianDate = new Persian(1430, 10, 2);
		verifyDate(assert, "new Persian(1430, 10, 2) msut be equal to 02.11.1430 (wednesday) 00:00:00.00 AM", oPersianDate, 1430, 10, 2);
	});

	QUnit.test("Overflow/underflow of month", function (assert) {
		var oTestDate = aTestData[1],
			oPersianDate;

		oPersianDate = createPersianDateFromTestEntry(oTestDate);
		oPersianDate.setMonth(12); //11 is max allowed value
		verifyDate(assert, "setMonth(12) must overflow to next year", oPersianDate, 1396, 0, 1);

		oPersianDate = new Persian(oTestDate.Persian.year, 12, oTestDate.Persian.day);
		verifyDate(assert, "month 12 in the constructor must overflow to next year", oPersianDate, 1396, 0, 1);

		oPersianDate = createPersianDateFromTestEntry(oTestDate);
		oPersianDate.setMonth(-1);
		verifyDate(assert, "setMonth(-1) must underflow to previous year", oPersianDate, 1394, 11, 1);

		oPersianDate = createPersianDateFromTestEntry(oTestDate, true);
		oPersianDate.setUTCMonth(-1);
		verifyDate(assert, "setUTCMonth(-1) must underflow to previous year", oPersianDate, 1394, 11, 1, true);

		oPersianDate = new Persian(oTestDate.Persian.year, -1, oTestDate.Persian.day);
		verifyDate(assert, "month -1 in the constructor must underflow to previous year", oPersianDate, 1394, 11, 1);
	});

	QUnit.test("Overflow/underflow of day", function (assert) {
		var oTestDate = aTestData[1],
			oPersianDate;

		oPersianDate = createPersianDateFromTestEntry(oTestDate);
		oPersianDate.setDate(32);
		verifyDate(assert, "setDate(32) must overflow to next month", oPersianDate, 1395, 1, 1);

		oPersianDate = new Persian(oTestDate.Persian.year, oTestDate.Persian.month, 32);
		verifyDate(assert, "date 32 in the constructor must overflow to next month", oPersianDate, 1395, 1, 1);

		oPersianDate = createPersianDateFromTestEntry(oTestDate);
		oPersianDate.setDate(0);
		verifyDate(assert, "setDate(0) must underflow to previous month", oPersianDate, 1394, 11, 29);

		oPersianDate = createPersianDateFromTestEntry(oTestDate, true);
		oPersianDate.setUTCDate(0);
		verifyDate(assert, "setUTCDate(0) must underflow to previous month", oPersianDate, 1394, 11, 29, true);

		oPersianDate = new Persian(oTestDate.Persian.year, oTestDate.Persian.month, 0);
		verifyDate(assert, "day 0 in the constructor must underflow to previous month", oPersianDate, 1394, 11, 29);
	});

	QUnit.test("Set/Get Full Year", function (assert) {
		var oTestDate = aTestData[1],
			oPersianDate = createPersianDateFromTestEntry(oTestDate);

		oPersianDate.setFullYear(1394);
		verifyDate(assert, "setFullYear", oPersianDate, 1394, 0, 1);

		oPersianDate.setFullYear(1394, 5);
		verifyDate(assert, "setFullYear with optional month", oPersianDate, 1394, 5, 1);

		oPersianDate.setFullYear(1394, 5, 23);
		verifyDate(assert, "setFullYear with optional month", oPersianDate, 1394, 5, 23);
	});

	QUnit.test("Set/Get Year", function (assert) {
		var oTestDate = aTestData[1],
			oPersianDate = createPersianDateFromTestEntry(oTestDate);

		oPersianDate.setYear(94);
		verifyDate(assert, "setYear", oPersianDate, 1394, 0, 1);
	});

	QUnit.test("Setters have to return the time since 1.1.1970", function (assert) {
		var oDate = new Persian(1395, 0, 1, 8, 10, 15, 119);

		function check(iTimestamp, sSetter) {
			assert.equal(typeof iTimestamp, "number", sSetter + " did return a numeric value");
			assert.equal(iTimestamp, oDate.getTime(), sSetter + " return value matches date timestamp");
		}

		check(oDate.setFullYear(1395), "setFullYear");
		check(oDate.setYear(95), "setYear");
		check(oDate.setMonth(5), "setMonth");
		check(oDate.setDate(11), "setDate");
		check(oDate.setHours(23), "setHours");
		check(oDate.setMinutes(16), "setMinutes");
		check(oDate.setSeconds(10), "setSeconds");
		check(oDate.setMilliseconds(118), "setMilliseconds");

		check(oDate.setUTCFullYear(1395), "setUTCFullYear");
		check(oDate.setUTCMonth(5), "setUTCMonth");
		check(oDate.setUTCDate(11), "setUTCDate");
		check(oDate.setUTCHours(23), "setUTCHours");
		check(oDate.setUTCMinutes(16), "setUTCMinutes");
		check(oDate.setUTCSeconds(10), "setUTCSeconds");
		check(oDate.setUTCMilliseconds(118), "setUTCMilliseconds");
	});


	QUnit.test(".Now()", function (assert) {
		var clock = sinon.useFakeTimers(0); // 1, January 1970 = 22 Shawwal 1389(22.10.1389)
		assert.equal(Persian.now(), 0, "Persian.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");

		clock.restore();
		clock = sinon.useFakeTimers(7000); // 7 seconds later

		assert.equal(Persian.now(), 7000, "Persian.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");
		clock.restore();
	});

	QUnit.test("Convert Gregorian to Persian dates", function (assert) {
		var oGregorianDate, oExpectedPersianDate, oCalculatedPersianDate;
		for (var i = 0; i < aTestData.length; i++) {
			oGregorianDate = createGregorianDateFromTestEntry(aTestData[i]);
			oExpectedPersianDate = createPersianDateFromTestEntry(aTestData[i], true);
			oCalculatedPersianDate = new Persian(oGregorianDate.getTime());
			compareTwoDates(assert, "Gregorian2Persian " + i, oCalculatedPersianDate, oExpectedPersianDate);
		}
	});

	QUnit.test("Convert Persian to Gregorian dates", function (assert) {
		var oPersianDate, oExpectedGregorianDate, oCalculatedGregorianDate;
		for (var i = 0; i < aTestData.length; i++) {
			oPersianDate = createPersianDateFromTestEntry(aTestData[i], true);
			oExpectedGregorianDate = createGregorianDateFromTestEntry(aTestData[i]);
			oCalculatedGregorianDate = oPersianDate.getJSDate();
			compareTwoDates(assert, "Persian2Gregorian " + i, oCalculatedGregorianDate, oExpectedGregorianDate);
		}
	});

	// --------------------------- HELPERS -------------------------------------------------------------------------
	function verifyDateWithTestDate(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.year, oExpectedTestDate.month, oExpectedTestDate.day, bUTC);
	}

	function compareTwoDates(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.getFullYear(), oExpectedTestDate.getMonth(), oExpectedTestDate.getDate(), bUTC);
	}

	function verifyDate(assert, sMessage, oDate, year, month, day, bUTC) {
		var sExpected = formatDateTime(year, month + 1, day);
		var sReal = formatDateTime(String(bUTC ? oDate.getUTCFullYear() : oDate.getFullYear()),
				String(bUTC ? (oDate.getUTCMonth() + 1) : (oDate.getMonth() + 1)),
				String(bUTC ? oDate.getUTCDate() : oDate.getDate()));

		assert.equal(sReal, sExpected, sMessage);
	}

	function formatDateTime(year, month, day) {
		return String(year).padStart(4, "0") + "/" +
				String(month).padStart(2, "0") + "/" +
				String(day).padStart(2, "0");
	}

	function createPersianDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.Persian;
		if (bUTC) {
			// eslint-disable-next-line new-cap
			return new Persian(Persian.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.day));
		} else {
			return new Persian(oDateEntry.year, oDateEntry.month, oDateEntry.day);
		}
	}

	function createGregorianDateFromTestEntry(oEntry) {
		var oDateEntry = oEntry.Gregorian;
		return UI5Date.getInstance(Date.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.day));
	}

	function isInvalid(oDate) {
		return isNaN(oDate.getTime());
	}
});
