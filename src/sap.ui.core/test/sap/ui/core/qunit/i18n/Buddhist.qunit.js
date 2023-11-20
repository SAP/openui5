/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/date/Buddhist",
	"sap/ui/core/date/UI5Date"
], function(Log, Localization, Buddhist, UI5Date) {
	"use strict";

	// Test data
	var aTestData = [
		{Gregorian: {year: 1970, month: 0, day: 1}, Buddhist: {year: 2513, month: 0, day: 1}},
		{Gregorian: {year: 2011, month: 5, day: 1}, Buddhist: {year: 2554, month: 5, day: 1}},
		{Gregorian: {year: 1939, month: 2, day: 8}, Buddhist: {year: 2481, month: 2, day: 8}},
		{Gregorian: {year: 1939, month: 7, day: 8}, Buddhist: {year: 2482, month: 7, day: 8}},
		{Gregorian: {year: 1902, month: 1, day: 13}, Buddhist: {year: 2444, month: 1, day: 13}},
		{Gregorian: {year: 1902, month: 3, day: 13}, Buddhist: {year: 2445, month: 3, day: 13}}
	];
	var sDefaultLanguage = Localization.getLanguage();

	//1. Instance related
	QUnit.module("sap.ui.core.date.Buddhist", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("with no arguments", function (assert) {
		var clock = sinon.useFakeTimers(); // 1, January 1970 = 1, January 2513
		var oBuddhistDate = new Buddhist(); //1, January 2513
		var now = UI5Date.getInstance();// 1, January 1970
		verifyDate(assert, "Constructor with no parameters must always return the Buddhist date corresponding to the current " +
		"Gregorian one.", oBuddhistDate, 2513, 0, 1, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
		clock.restore();
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		var oBuddhistDate;

		oBuddhistDate = new Buddhist("invalid Buddhist date timestamp");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as timestamp must return an invalid date");

		oBuddhistDate = new Buddhist({});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as parameter must return an invalid date");

		oBuddhistDate = new Buddhist(0); //1, January 1970 = 1, January 2513
		var now = UI5Date.getInstance(0);

		verifyDate(assert, "Constructor with value(timestamp)=0 must represents BuddhistDate corresponding to the date of 1st January 1970 Gregorian/(1389/10/22 Buddhist)",
				oBuddhistDate, 2513, 0, 1, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

		var iOneDay = 24 * 60 * 60 * 1000;
		oBuddhistDate = new Buddhist(iOneDay); //2, January 1970 = 1, January 2513
		var oGregorianDate = UI5Date.getInstance(iOneDay);
		verifyDate(assert, "Constructor with value(timestamp)= 'one day after 01.01.1970' must represents BuddhistDate corresponding to the date of 2nd January 1970 Gregorian/(1389/10/23 Buddhist)",
				oBuddhistDate, 2513, 0, 2, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());

		oGregorianDate = UI5Date.getInstance(-iOneDay);
		oBuddhistDate = new Buddhist(-iOneDay); //31, December 1969 = 1, January 2513
		verifyDate(assert, "Constructor with value(timestamp)= 'one day before 01.01.1970' must represents BuddhistDate corresponding to the date of 31st December 1970 Gregorian/(1389/10/21 Buddhist)",
				oBuddhistDate, 2512, 11, 31, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: invalid parameter type )", function (assert) {
		// ------------- object -----------------------------
		var oBuddhistDate = null;

		oBuddhistDate = new Buddhist("blabla", 0, 23);
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as year must return invalid date");

		oBuddhistDate = new Buddhist(null, 0, 23);
		assert.ok(isInvalid(oBuddhistDate), "Constructor with null as year must return invalid date");

		oBuddhistDate = new Buddhist(2513, 0, "alabala");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as day must return invalid date");

		oBuddhistDate = new Buddhist({}, 0);
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as year must return invalid date");

		oBuddhistDate = new Buddhist(2513, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as month must return invalid date");

		oBuddhistDate = new Buddhist(2513, 0, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as day must return invalid date");

		oBuddhistDate = new Buddhist(2513, 0, 1, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as hours must return invalid date");

		oBuddhistDate = new Buddhist(2513, 0, 1, 0, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as minutes must return invalid date");

		oBuddhistDate = new Buddhist(2513, 0, 1, 0, 0, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as seconds must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, 1, 0, 0, 0, {});
		assert.ok(isInvalid(oBuddhistDate), "Constructor with object as milliseconds must return invalid date");

		// ------------- string -----------------------------
		oBuddhistDate = oBuddhistDate = new Buddhist([235, "a"], 0);
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as year must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist([235, "1430"], "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as month must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as month must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, 1, "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as hours must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, 1, 0, "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as minutes must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, 1, 0, 0, "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as seconds must return invalid date");

		oBuddhistDate = oBuddhistDate = new Buddhist(2513, 0, 1, 0, 0, 0, "a");
		assert.ok(isInvalid(oBuddhistDate), "Constructor with invalid string as milliseconds must return invalid date");
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: valid values)", function (assert) {
		var oBuddhistDate = null;
		aTestData.forEach(function(oTestDate) {
			oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);
			verifyDateWithTestDate(assert, "Constructor with valid values", oBuddhistDate, oTestDate.Buddhist);
		});
	});

	QUnit.test("with optional parameters", function (assert) {
		var oBuddhistDate = new Buddhist(2513, 10);
		verifyDate(assert, "new Buddhist(2513, 10) must be equal to 01.11.2513", oBuddhistDate, 2513, 10, 1);

		oBuddhistDate = new Buddhist(2513, 10, 2);
		verifyDate(assert, "new Buddhist(2513, 10, 2) msut be equal to 02.11.2513", oBuddhistDate, 2513, 10, 2);
	});

	QUnit.test("Overflow/underflow of date values", function (assert) {
		var oTestDate = aTestData[0],
			oBuddhistDate;

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);
		oBuddhistDate.setMonth(12); //11 is max allowed value
		verifyDate(assert, "setMonth(12) must overflow to next year", oBuddhistDate, 2514, 0, 1);

		oBuddhistDate = new Buddhist(oTestDate.Buddhist.year, 12, oTestDate.Buddhist.day);
		verifyDate(assert, "month 12 in the constructor must overflow to next year", oBuddhistDate, 2514, 0, 1);

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);
		oBuddhistDate.setDate(32);
		verifyDate(assert, "setDate(32) must overflow to next month", oBuddhistDate, 2513, 1, 1);

		oBuddhistDate = new Buddhist(oTestDate.Buddhist.year, oTestDate.Buddhist.month, 32);
		verifyDate(assert, "date 32 in the constructor must overflow to next month", oBuddhistDate, 2513, 1, 1);

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);
		oBuddhistDate.setMonth(-1);
		verifyDate(assert, "setMonth(-1) must underflow to previous year", oBuddhistDate, 2512, 11, 1);

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate, true);
		oBuddhistDate.setUTCMonth(-1);
		verifyDate(assert, "setUTCMonth(-1) must underflow to previous year", oBuddhistDate, 2512, 11, 1, true);

		oBuddhistDate = new Buddhist(oTestDate.Buddhist.year, -1, oTestDate.Buddhist.day);
		verifyDate(assert, "month -1 in the constructor must underflow to previous year", oBuddhistDate, 2512, 11, 1);

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);
		oBuddhistDate.setDate(0);
		verifyDate(assert, "setDate(0) must underflow to previous month", oBuddhistDate, 2512, 11, 31);

		oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate, true);
		oBuddhistDate.setUTCDate(0);
		verifyDate(assert, "setUTCDate(0) must underflow to previous month", oBuddhistDate, 2512, 11, 31, true);

		oBuddhistDate = new Buddhist(oTestDate.Buddhist.year, oTestDate.Buddhist.month, 0);
		verifyDate(assert, "day 0 in the constructor must underflow to previous month", oBuddhistDate, 2512, 11, 31);
	});

	QUnit.test("Set/Get Full Year", function (assert) {
		var oTestDate = aTestData[0],
			oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);

		oBuddhistDate.setFullYear(2500);
		verifyDate(assert, "setFullYear", oBuddhistDate, 2500, 0, 1);

		oBuddhistDate.setFullYear(2500, 5);
		verifyDate(assert, "setFullYear with optional month", oBuddhistDate, 2500, 5, 1);

		oBuddhistDate.setFullYear(2500, 5, 23);
		verifyDate(assert, "setFullYear with optional month", oBuddhistDate, 2500, 5, 23);
	});

	QUnit.test("Set/Get Year", function (assert) {
		var oTestDate = aTestData[0],
			oBuddhistDate = createBuddhistDateFromTestEntry(oTestDate);

		oBuddhistDate.setYear(2500);
		verifyDate(assert, "setYear", oBuddhistDate, 2500, 0, 1);
	});

	QUnit.test("Setters have to return the time since 1.1.1970", function (assert) {
		var oDate = new Buddhist(2513, 0, 1, 8, 10, 15, 119);

		function check(iTimestamp, sSetter) {
			assert.equal(typeof iTimestamp, "number", sSetter + " did return a numeric value");
			assert.equal(iTimestamp, oDate.getTime(), sSetter + " return value matches date timestamp");
		}

		check(oDate.setFullYear(2513), "setFullYear");
		check(oDate.setYear(23), "setYear");
		check(oDate.setMonth(5), "setMonth");
		check(oDate.setDate(11), "setDate");
		check(oDate.setHours(23), "setHours");
		check(oDate.setMinutes(16), "setMinutes");
		check(oDate.setSeconds(10), "setSeconds");
		check(oDate.setMilliseconds(118), "setMilliseconds");

		check(oDate.setUTCFullYear(2513), "setUTCFullYear");
		check(oDate.setUTCMonth(5), "setUTCMonth");
		check(oDate.setUTCDate(11), "setUTCDate");
		check(oDate.setUTCHours(23), "setUTCHours");
		check(oDate.setUTCMinutes(16), "setUTCMinutes");
		check(oDate.setUTCSeconds(10), "setUTCSeconds");
		check(oDate.setUTCMilliseconds(118), "setUTCMilliseconds");
	});


	QUnit.test(".Now()", function (assert) {
		var clock = sinon.useFakeTimers(0); // 1, January 1970 = 1, January 2513
		assert.equal(Buddhist.now(), 0, "Buddhist.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");

		clock.restore();
		clock = sinon.useFakeTimers(7000); // 7 seconds later

		assert.equal(Buddhist.now(), 7000, "Buddhist.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");
		clock.restore();
	});

	QUnit.test("Convert Gregorian to Buddhist dates", function (assert) {
		var oGregorianDate, oExpectedBuddhistDate, oCalculatedBuddhistDate;
		for (var i = 0; i < aTestData.length; i++) {
			oGregorianDate = createGregorianDateFromTestEntry(aTestData[i]);
			oExpectedBuddhistDate = createBuddhistDateFromTestEntry(aTestData[i], true);
			oCalculatedBuddhistDate = new Buddhist(oGregorianDate.getTime());
			compareTwoDates(assert, "Gregorian2Buddhist " + i, oCalculatedBuddhistDate, oExpectedBuddhistDate);
		}
	});

	QUnit.test("Convert Buddhist to Gregorian dates", function (assert) {
		var oBuddhistDate, oExpectedGregorianDate, oCalculatedGregorianDate;
		for (var i = 0; i < aTestData.length; i++) {
			oBuddhistDate = createBuddhistDateFromTestEntry(aTestData[i], true);
			oExpectedGregorianDate = createGregorianDateFromTestEntry(aTestData[i]);
			oCalculatedGregorianDate = oBuddhistDate.getJSDate();
			compareTwoDates(assert, "Buddhist2Gregorian " + i, oCalculatedGregorianDate, oExpectedGregorianDate);
		}
	});

	QUnit.test("getWeek (de)", function (assert) {
		Localization.setLanguage("de");
		assert.deepEqual(new Buddhist(2565,0,1).getWeek(), {
			"week": 51,
			"year": 2564
		}, "Jan 1st 2022 is CW 51");
		assert.deepEqual(new Buddhist(2565,0,3).getWeek(), {
			"week": 0,
			"year": 2565
		}, "Jan 3rd 2022 is CW 1");
	});


	// --------------------------- HELPERS -------------------------------------------------------------------------
	function verifyDateWithTestDate(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.year, oExpectedTestDate.month, oExpectedTestDate.day, bUTC);
	}

	function compareTwoDates(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.getFullYear(), oExpectedTestDate.getMonth(), oExpectedTestDate.getDate(), bUTC);
	}

	function verifyDate(assert, sMessage, oDate, year, month, day, bUTC) {
		var sExpected = formatDate(year, month + 1, day);
		var sReal = formatDate(String(bUTC ? oDate.getUTCFullYear() : oDate.getFullYear()),
				String(bUTC ? (oDate.getUTCMonth() + 1) : (oDate.getMonth() + 1)),
				String(bUTC ? oDate.getUTCDate() : oDate.getDate()));

		assert.equal(sReal, sExpected, sMessage);
	}

	function formatDate(year, month, day) {
		return String(year).padStart(2, "0") + "/" +
				String(month).padStart(2, "0") + "/" +
				String(day).padStart(2, "0");
	}

	function createBuddhistDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.Buddhist;
		if (bUTC) {
			// eslint-disable-next-line new-cap
			return new Buddhist(Buddhist.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.day));
		} else {
			return new Buddhist(oDateEntry.year, oDateEntry.month, oDateEntry.day);
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
