/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/CalendarType",
	"sap/ui/core/date/Japanese",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/date/UniversalDate"
], function(Log, Localization, CalendarType, Japanese, UI5Date, UniversalDate) {
	"use strict";

	// Test data
	var aTestData = [
		{Gregorian: {year: 1970, month: 0, day: 1}, Japanese: {era: 234, year: 45, month: 0, day: 1}},
		{Gregorian: {year: 2011, month: 0, day: 1}, Japanese: {era: 235, year: 23, month: 0, day: 1}},
		{Gregorian: {year: 1989, month: 0, day: 8}, Japanese: {era: 235, year: 1, month:0, day: 8}},
		{Gregorian: {year: 1989, month: 0, day: 7}, Japanese: {era: 234, year: 64, month:0, day: 7}},
		{Gregorian: {year: 1902, month: 7, day: 13}, Japanese: {era: 232, year: 35, month:7, day: 13}},
		{Gregorian: {year: 1921, month: 3, day: 30}, Japanese: {era: 233, year: 10, month:3, day: 30}},
		{Gregorian: {year: 1945, month: 2, day: 9}, Japanese: {era: 234, year: 20, month:2, day: 9}},
		{Gregorian: {year: 1964, month: 11, day: 3}, Japanese: {era: 234, year: 39, month:11, day: 3}},
		{Gregorian: {year: 1979, month: 0, day: 24}, Japanese: {era: 234, year: 54, month:0, day: 24}},
		{Gregorian: {year: 1997, month: 8, day: 15}, Japanese: {era: 235, year: 9, month:8, day: 15}},
		{Gregorian: {year: 2009, month: 6, day: 11}, Japanese: {era: 235, year: 21, month:6, day: 11}},
		{Gregorian: {year: 2018, month: 9, day: 19}, Japanese: {era: 235, year: 30, month:9, day: 19}},
		{Gregorian: {year: 2019, month: 4, day: 1}, Japanese: {era: 236, year: 1, month:4, day: 1}},
		{Gregorian: {year: 2032, month: 9, day: 1}, Japanese: {era: 236, year: 14, month:9, day: 1}}
	];
	var sDefaultLanguage = Localization.getLanguage();

	//1. Instance related
	QUnit.module("sap.ui.core.date.Japanese", {
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
		var clock = sinon.useFakeTimers(); // 1, January 1970 = 1, January 45 Showa
		var oJapaneseDate = new Japanese(); //1, January 45 Showa
		var now = UI5Date.getInstance();// 1, January 1970
		verifyDate(assert, "Constructor with no parameters must always return the Japanese date corresponding to the current " +
		"Gregorian one.", oJapaneseDate, 234, 45, 0, 1, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
		clock.restore();
	});

	QUnit.test("with value parameter (timestamp)", function (assert) {
		var oJapaneseDate;

		oJapaneseDate = new Japanese("invalid Japanese date timestamp");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as timestamp must return an invalid date");

		oJapaneseDate = new Japanese({});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as parameter must return an invalid date");

		oJapaneseDate = new Japanese(0); //1, January 1970 = 1, January 45 Showa
		var now = UI5Date.getInstance(0);

		verifyDate(assert, "Constructor with value(timestamp)=0 must represents JapaneseDate corresponding to the date of 1st January 1970 Gregorian/(1389/10/22 Japanese)",
				oJapaneseDate, 234, 45, 0, 1, now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

		var iOneDay = 24 * 60 * 60 * 1000;
		oJapaneseDate = new Japanese(iOneDay); //2, January 1970 = 1, January 45 Showa
		var oGregorianDate = UI5Date.getInstance(iOneDay);
		verifyDate(assert, "Constructor with value(timestamp)= 'one day after 01.01.1970' must represents JapaneseDate corresponding to the date of 2nd January 1970 Gregorian/(1389/10/23 Japanese)",
				oJapaneseDate, 234, 45, 0, 2, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());

		oGregorianDate = UI5Date.getInstance(-iOneDay);
		oJapaneseDate = new Japanese(-iOneDay); //31, December 1969 = 1, January 45 Showa
		verifyDate(assert, "Constructor with value(timestamp)= 'one day before 01.01.1970' must represents JapaneseDate corresponding to the date of 31st December 1970 Gregorian/(1389/10/21 Japanese)",
				oJapaneseDate, 234, 44, 11, 31, oGregorianDate.getDay(), oGregorianDate.getHours(), oGregorianDate.getMinutes(), oGregorianDate.getSeconds(), oGregorianDate.getMilliseconds());
	});

	QUnit.test("with year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: invalid parameter type )", function (assert) {
		// ------------- object -----------------------------
		var oJapaneseDate = null;

		oJapaneseDate = new Japanese("blabla", 0, 23);
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as year must return invalid date");

		oJapaneseDate = new Japanese(null, 0, 23);
		assert.ok(isInvalid(oJapaneseDate), "Constructor with null as year must return invalid date");

		oJapaneseDate = new Japanese([235, 23], 0, "alabala");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as day must return invalid date");

		oJapaneseDate = new Japanese([235, {}], 0);
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as year must return invalid date");

		oJapaneseDate = new Japanese([235, 23], {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as month must return invalid date");

		oJapaneseDate = new Japanese([235, 23], 0, {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as day must return invalid date");

		oJapaneseDate = new Japanese([235, 23], 0, 1, {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as hours must return invalid date");

		oJapaneseDate = new Japanese([235, 23], 0, 1, 0, {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as minutes must return invalid date");

		oJapaneseDate = new Japanese([235, 23], 0, 1, 0, 0, {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as seconds must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, 1, 0, 0, 0, {});
		assert.ok(isInvalid(oJapaneseDate), "Constructor with object as milliseconds must return invalid date");

		// ------------- string -----------------------------
		oJapaneseDate = oJapaneseDate = new Japanese([235, "a"], 0);
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as year must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, "1430"], "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as month must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as month must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, 1, "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as hours must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, 1, 0, "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as minutes must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, 1, 0, 0, "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as seconds must return invalid date");

		oJapaneseDate = oJapaneseDate = new Japanese([235, 23], 0, 1, 0, 0, 0, "a");
		assert.ok(isInvalid(oJapaneseDate), "Constructor with invalid string as milliseconds must return invalid date");
	});

	QUnit.test("with era, year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: valid values)", function (assert) {
		var oJapaneseDate = null;
		aTestData.forEach(function(oTestDate) {
			oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
			verifyDateWithTestDate(assert, "Constructor with valid values", oJapaneseDate, oTestDate.Japanese);
		});
	});

	QUnit.test("with gregorian year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]] parameters: valid values)", function (assert) {
		var oJapaneseDate = null;
		aTestData.forEach(function(oTestDate) {
			oJapaneseDate = createJapaneseDateFromGregorianTestEntry(oTestDate);
			verifyDateWithTestDate(assert, "Constructor with valid values", oJapaneseDate, oTestDate.Japanese);
		});
	});

	QUnit.test("with year without era, when year is in current era and less than 100", function (assert) {
		var oJapaneseDate = null,
			iCurrentEra = UniversalDate.getCurrentEra(CalendarType.Japanese),
			oJapanese;
		aTestData.forEach(function(oTestDate) {
			if (oTestDate.Japanese.era == iCurrentEra) {
				oJapanese = oTestDate.Japanese;
				oTestDate = {
					Gregorian: oJapanese,
					Japanese: oJapanese
				};
				oJapaneseDate = createJapaneseDateFromGregorianTestEntry(oTestDate);
				verifyDateWithTestDate(assert, "Constructor with valid values", oJapaneseDate, oTestDate.Japanese);
			}
		});
	});

	QUnit.test("with optional parameters", function (assert) {
		var oJapaneseDate = new Japanese([235, 23], 10);
		verifyDate(assert, "new Japanese([235, 23], 10) must be equal to 01.11.23H", oJapaneseDate, 235, 23, 10, 1);

		oJapaneseDate = new Japanese([235, 23], 10, 2);
		verifyDate(assert, "new Japanese([235, 23], 10, 2) msut be equal to 02.11.23H", oJapaneseDate, 235, 23, 10, 2);
	});

	QUnit.test("Overflow/underflow of date values", function (assert) {
		var oTestDate = aTestData[1],
			oJapaneseDate;

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setMonth(12); //11 is max allowed value
		verifyDate(assert, "setMonth(12) must overflow to next year", oJapaneseDate, 235, 24, 0, 1);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], 12, oTestDate.Japanese.day);
		verifyDate(assert, "month 12 in the constructor must overflow to next year", oJapaneseDate, 235, 24, 0, 1);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setDate(32);
		verifyDate(assert, "setDate(32) must overflow to next month", oJapaneseDate, 235, 23, 1, 1);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], oTestDate.Japanese.month, 32);
		verifyDate(assert, "date 32 in the constructor must overflow to next month", oJapaneseDate, 235, 23, 1, 1);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setMonth(-1);
		verifyDate(assert, "setMonth(-1) must underflow to previous year", oJapaneseDate, 235, 22, 11, 1);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate, true);
		oJapaneseDate.setUTCMonth(-1);
		verifyDate(assert, "setUTCMonth(-1) must underflow to previous year", oJapaneseDate, 235, 22, 11, 1, true);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], -1, oTestDate.Japanese.day);
		verifyDate(assert, "month -1 in the constructor must underflow to previous year", oJapaneseDate, 235, 22, 11, 1);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setDate(0);
		verifyDate(assert, "setDate(0) must underflow to previous month", oJapaneseDate, 235, 22, 11, 31);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate, true);
		oJapaneseDate.setUTCDate(0);
		verifyDate(assert, "setUTCDate(0) must underflow to previous month", oJapaneseDate, 235, 22, 11, 31, true);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], oTestDate.Japanese.month, 0);
		verifyDate(assert, "day 0 in the constructor must underflow to previous month", oJapaneseDate, 235, 22, 11, 31);
	});

	QUnit.test("Overflow/underflow of date values close to era borders", function (assert) {
		var oTestDate, oJapaneseDate;

		oTestDate = aTestData[3]; // end of Showa

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setMonth(1); //11 is max allowed value
		verifyDate(assert, "setMonth(1) must overflow to next era", oJapaneseDate, 235, 1, 1, 7);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], 1, oTestDate.Japanese.day);
		verifyDate(assert, "month 1 in the constructor must overflow to next era", oJapaneseDate, 235, 1, 1, 7);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setDate(8);
		verifyDate(assert, "setDate(8) must overflow to next era", oJapaneseDate, 235, 1, 0, 8);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], oTestDate.Japanese.month, 8);
		verifyDate(assert, "date 8 in the constructor must overflow to next era", oJapaneseDate, 235, 1, 0, 8);

		oTestDate = aTestData[2]; // start of Heisei

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setMonth(-1);
		verifyDate(assert, "setMonth(-1) must underflow to previous era", oJapaneseDate, 234, 63, 11, 8);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], -1, oTestDate.Japanese.day);
		verifyDate(assert, "month -1 in the constructor must underflow to previous era", oJapaneseDate, 234, 63, 11, 8);

		oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);
		oJapaneseDate.setDate(7);
		verifyDate(assert, "setDate(7) must underflow to previous era", oJapaneseDate, 234, 64, 0, 7);

		oJapaneseDate = new Japanese([oTestDate.Japanese.era, oTestDate.Japanese.year], oTestDate.Japanese.month, 7);
		verifyDate(assert, "day 7 in the constructor must underflow to previous era", oJapaneseDate, 234, 64, 0, 7);
	});

	QUnit.test("Set/Get Era", function (assert) {
		var oTestDate = aTestData[0],
			oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);

		oJapaneseDate.setEra(235);
		verifyDate(assert, "setEra sets to first day of era", oJapaneseDate, 235, 1, 0, 8);

		oJapaneseDate.setEra(235, 5);
		verifyDate(assert, "setEra with optional year", oJapaneseDate, 235, 5, 0, 8);

		oJapaneseDate.setEra(235, 5, 5);
		verifyDate(assert, "setEra with optional year, month", oJapaneseDate, 235, 5, 5, 8);

		oJapaneseDate.setEra(235, 5, 5, 23);
		verifyDate(assert, "setEra with optional year, month, day", oJapaneseDate, 235, 5, 5, 23);
	});

	QUnit.test("Set/Get Full Year", function (assert) {
		var oTestDate = aTestData[0],
			oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);

		oJapaneseDate.setFullYear(5);
		verifyDate(assert, "setFullYear", oJapaneseDate, 234, 5, 0, 1);

		oJapaneseDate.setFullYear(5, 5);
		verifyDate(assert, "setFullYear with optional month", oJapaneseDate, 234, 5, 5, 1);

		oJapaneseDate.setFullYear(5, 5, 23);
		verifyDate(assert, "setFullYear with optional month", oJapaneseDate, 234, 5, 5, 23);
	});

	QUnit.test("Set/Get Year", function (assert) {
		var oTestDate = aTestData[0],
			oJapaneseDate = createJapaneseDateFromTestEntry(oTestDate);

		oJapaneseDate.setYear(5);
		verifyDate(assert, "setYear", oJapaneseDate, 234, 5, 0, 1);
	});

	QUnit.test("Setters have to return the time since 1.1.1970", function (assert) {
		var oDate = new Japanese([235, 23], 0, 1, 8, 10, 15, 119);

		function check(iTimestamp, sSetter) {
			assert.equal(typeof iTimestamp, "number", sSetter + " did return a numeric value");
			assert.equal(iTimestamp, oDate.getTime(), sSetter + " return value matches date timestamp");
		}

		check(oDate.setEra(235), "setFullYear");
		check(oDate.setFullYear(23), "setFullYear");
		check(oDate.setYear(23), "setYear");
		check(oDate.setMonth(5), "setMonth");
		check(oDate.setDate(11), "setDate");
		check(oDate.setHours(23), "setHours");
		check(oDate.setMinutes(16), "setMinutes");
		check(oDate.setSeconds(10), "setSeconds");
		check(oDate.setMilliseconds(118), "setMilliseconds");

		check(oDate.setUTCEra(235), "setUTCFullYear");
		check(oDate.setUTCFullYear(23), "setUTCFullYear");
		check(oDate.setUTCMonth(5), "setUTCMonth");
		check(oDate.setUTCDate(11), "setUTCDate");
		check(oDate.setUTCHours(23), "setUTCHours");
		check(oDate.setUTCMinutes(16), "setUTCMinutes");
		check(oDate.setUTCSeconds(10), "setUTCSeconds");
		check(oDate.setUTCMilliseconds(118), "setUTCMilliseconds");
	});


	QUnit.test(".Now()", function (assert) {
		var clock = sinon.useFakeTimers(0); // 1, January 1970 = 22 Shawwal 1389(22.10.1389)
		assert.equal(Japanese.now(), 0, "Japanese.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");

		clock.restore();
		clock = sinon.useFakeTimers(7000); // 7 seconds later

		assert.equal(Japanese.now(), 7000, "Japanese.now() must equal to the timestamp since 1 January 1970, 00:00:00 000");
		clock.restore();
	});

	QUnit.test("Convert Gregorian to Japanese dates", function (assert) {
		var oGregorianDate, oExpectedJapaneseDate, oCalculatedJapaneseDate;
		for (var i = 0; i < aTestData.length; i++) {
			oGregorianDate = createGregorianDateFromTestEntry(aTestData[i], true);
			oExpectedJapaneseDate = createJapaneseDateFromTestEntry(aTestData[i], true);
			oCalculatedJapaneseDate = new Japanese(oGregorianDate.getTime());
			compareTwoDates(assert, "Gregorian2Japanese " + i, oCalculatedJapaneseDate, oExpectedJapaneseDate);
		}
	});

	QUnit.test("Convert Japanese to Gregorian dates", function (assert) {
		var oJapaneseDate, oExpectedGregorianDate, oCalculatedGregorianDate;
		for (var i = 0; i < aTestData.length; i++) {
			oJapaneseDate = createJapaneseDateFromTestEntry(aTestData[i], true);
			oExpectedGregorianDate = createGregorianDateFromTestEntry(aTestData[i], true);
			oCalculatedGregorianDate = oJapaneseDate.getJSDate();
			compareTwoJSDates(assert, "Japanese2Gregorian " + i, oCalculatedGregorianDate, oExpectedGregorianDate);
		}
	});

[false, true].forEach(function (bUTC) {
	var sMethodeName = bUTC ? "getUTCWeek" : "getWeek";

	QUnit.test(sMethodeName + " (de)", function (assert) {
		function createDate(aYear, iMonth, iOneDay) {
			return bUTC
				// eslint-disable-next-line new-cap
				? new Japanese(Japanese.UTC(aYear, iMonth, iOneDay))
				: new Japanese(aYear, iMonth, iOneDay);
		}
		Localization.setLanguage("de");
		/*
		 *    Januar 2022 (236, 4)
		 * Week Mo Tu We Th Fr Sa Su
		 *  52                  1  2
		 *   1   3  4  5  6  7  8  9
		 */
		assert.deepEqual(createDate([236, 4], 0, 1)[sMethodeName](), {
			"week": 51,
			"year": 2021
		}, "Jan 1st 2022 is CW 52");
		assert.deepEqual(createDate([236, 4], 0, 3)[sMethodeName](), {
			"week": 0,
			"year": 2022
		}, "Jan 3rd 2022 is CW 1");
		/*
		 *    Januar 2016 (235, 28)
		 * Week Mo Tu We Th Fr Sa Su
		 *  53               1  2  3
		 *   1   4  5  6  7  8  9 10
		 */
		assert.deepEqual(createDate([235, 28], 0, 1)[sMethodeName](), {
			"week": 52,
			"year": 2015
		}, "Jan 1st 2016 is CW 53");
		assert.deepEqual(createDate([235, 28], 0, 3)[sMethodeName](), {
			"week": 52,
			"year": 2015
		}, "Jan 3rd 2016 is CW 53");
		assert.deepEqual(createDate([235, 28], 0, 4)[sMethodeName](), {
			"week": 0,
			"year": 2016
		}, "Jan 4th 2016 is CW 1");
	});
});

	// --------------------------- HELPERS -------------------------------------------------------------------------
	function verifyDateWithTestDate(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.era, oExpectedTestDate.year, oExpectedTestDate.month, oExpectedTestDate.day, bUTC);
	}

	function compareTwoDates(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyDate(assert, sMessage, oDate, oExpectedTestDate.getEra(), oExpectedTestDate.getFullYear(), oExpectedTestDate.getMonth(), oExpectedTestDate.getDate(), bUTC);
	}

	function verifyDate(assert, sMessage, oDate, era, year, month, day, bUTC) {
		var sExpected = formatDate(era, year, month + 1, day);
		var sReal = formatDate(String(bUTC ? oDate.getUTCEra() : oDate.getEra()),
				String(bUTC ? oDate.getUTCFullYear() : oDate.getFullYear()),
				String(bUTC ? (oDate.getUTCMonth() + 1) : (oDate.getMonth() + 1)),
				String(bUTC ? oDate.getUTCDate() : oDate.getDate()));

		assert.equal(sReal, sExpected, sMessage);
	}

	function formatDate(era, year, month, day) {
		return String(era).padStart(3, "0") + "/" +
				String(year).padStart(2, "0") + "/" +
				String(month).padStart(2, "0") + "/" +
				String(day).padStart(2, "0");
	}

	function compareTwoJSDates(assert, sMessage, oDate, oExpectedTestDate, bUTC) {
		return verifyJSDate(assert, sMessage, oDate, oExpectedTestDate.getFullYear(), oExpectedTestDate.getMonth(), oExpectedTestDate.getDate(), bUTC);
	}

	function verifyJSDate(assert, sMessage, oDate, year, month, day, bUTC) {
		var sExpected = formatJSDate(year, month + 1, day);
		var sReal = formatJSDate(String(bUTC ? oDate.getUTCFullYear() : oDate.getFullYear()),
				String(bUTC ? (oDate.getUTCMonth() + 1) : (oDate.getMonth() + 1)),
				String(bUTC ? oDate.getUTCDate() : oDate.getDate()));

		assert.equal(sReal, sExpected, sMessage);
	}

	function formatJSDate(year, month, day) {
		return String(year).padStart(4, "0") + "/" +
				String(month).padStart(2, "0") + "/" +
				String(day).padStart(2, "0");
	}

	function createJapaneseDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.Japanese;
		if (bUTC) {
			// eslint-disable-next-line new-cap
			return new Japanese(Japanese.UTC([oDateEntry.era, oDateEntry.year], oDateEntry.month, oDateEntry.day));
		} else {
			return new Japanese([oDateEntry.era, oDateEntry.year], oDateEntry.month, oDateEntry.day);
		}
	}

	function createGregorianDateFromTestEntry(oEntry, bUTC) {
		var oDateEntry = oEntry.Gregorian;
		if (bUTC) {
			return UI5Date.getInstance(Date.UTC(oDateEntry.year, oDateEntry.month, oDateEntry.day));
		} else {
			return UI5Date.getInstance(oDateEntry.year, oDateEntry.month, oDateEntry.day);
		}
	}

	function createJapaneseDateFromGregorianTestEntry(oEntry) {
		var oDateEntry = oEntry.Gregorian;
		return new Japanese(oDateEntry.year, oDateEntry.month, oDateEntry.day);
	}

	function isInvalid(oDate) {
		return isNaN(oDate.getTime());
	}

});
