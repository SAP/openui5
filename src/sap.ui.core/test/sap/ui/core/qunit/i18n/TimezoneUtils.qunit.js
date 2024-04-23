/*global QUnit, sinon */
sap.ui.define([
	"../i18n/helper/_timezones",
	"sap/base/Log",
	"sap/base/i18n/date/TimezoneUtils",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/UI5Date"
], function (timezones, Log, TimezoneUtils, Locale, LocaleData, UI5Date) {
		"use strict";

		/**
		 * keys from en.json
		 * @type {string[]}
		 */
		var aTimezoneIDs = Object.keys(LocaleData.getInstance(new Locale("en")).getTimezoneTranslations());

		QUnit.module("sap/base/i18n/date/TimezoneUtils", {
			beforeEach : function () {
				this.oLogMock = this.mock(Log);
				this.oLogMock.expects("error").never();
				this.oLogMock.expects("warning").never();
			}
		});

		QUnit.test("valid timezones (UI5 json data)", function (assert) {
			aTimezoneIDs.forEach(function (sTimezone) {
				if (!timezones.aUnsupportedBrowserTimezoneIDs.includes(sTimezone)) {
					assert.ok(TimezoneUtils.isValidTimezone(sTimezone), sTimezone
						+ " should be a valid timezone (UI5 json data).");
				}
			});
		});

		QUnit.test("valid timezones (CLDR)", function (assert) {
			timezones.aCLDRTimezoneIDs.forEach(function (sTimezone) {
				if (!timezones.aUnsupportedBrowserTimezoneIDs.includes(sTimezone)) {
					assert.ok(TimezoneUtils.isValidTimezone(sTimezone), sTimezone
						+ " should be a valid timezone (CLDR).");
				}
			});
		});

		QUnit.test("valid timezones (ABAP)", function (assert) {
			timezones.aABAPTimezoneIDs.forEach(function (sTimezone) {
				if (!timezones.aUnsupportedBrowserTimezoneIDs.includes(sTimezone)) {
					assert.ok(TimezoneUtils.isValidTimezone(sTimezone), sTimezone
						+ " should be a valid timezone (ABAP).");
				}
			});
		});

		QUnit.test("valid timezones (tz)", function (assert) {
			timezones.aTzTimezoneIDs.forEach(function (sTimezone) {
				if (!timezones.aUnsupportedBrowserTimezoneIDs.includes(sTimezone)) {
					assert.ok(TimezoneUtils.isValidTimezone(sTimezone), sTimezone
						+ " should be a valid timezone (tz).");
				}
			});
		});

		QUnit.test("invalid timezones", function (assert) {
			assert.notOk(TimezoneUtils.isValidTimezone(""), "Empty string should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone(123), "A number should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone(undefined), "undefined should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone(null), "null should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone("SAP/Walldorf"), "SAP/Walldorf should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone("Asia/Hanoi"), "Asia/Hanoi should not be a valid timezone.");
			assert.notOk(TimezoneUtils.isValidTimezone(UI5Date.getInstance()),
				"A date should not be a valid timezone.");
		});

		QUnit.test("Calculate offset Europe/Berlin", function (assert) {
			var oDate = UI5Date.getInstance("2021-10-13T13:22:33Z");
			assert.strictEqual(TimezoneUtils.calculateOffset(oDate, "Europe/Berlin"), -2 * 3600,
				"Timezone difference of -2 hours should match.");
		});

		QUnit.test("Calculate offset America/New_York", function (assert) {
			var oDate = UI5Date.getInstance("2021-10-13T15:22:33Z");
			assert.strictEqual(TimezoneUtils.calculateOffset(oDate, "America/New_York"), 4 * 3600,
				"Timezone difference of 4 hours should match.");
		});

		QUnit.test("Historical timezones", function (assert) {
			[
				// 1730 (UTC+0:53:28)
				{
					inputDate: UI5Date.getInstance("1730-01-01T00:00:00Z"),
					diff: -3208
				},
				{
					inputDate: UI5Date.getInstance("1893-01-01T00:00:00Z"),
					diff: -3208
				},
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate: UI5Date.getInstance("1893-04-01T01:00:00Z"),
					diff: -3600
				},
				// 1941	(UTC+2)
				{
					inputDate: UI5Date.getInstance("1941-01-01T00:00:00Z"),
					diff: -2 * 3600
				},
				{
					inputDate: UI5Date.getInstance("1941-06-01T00:00:00Z"),
					diff: -2 * 3600
				},
				// 1945 Thu, 24 May, 02:00	CEST → CEMT	(UTC+3)
				{
					inputDate: UI5Date.getInstance("1945-05-24T03:00:00Z"),
					diff: -3 * 3600
				},
				// 1946 Sun, 14 Apr, 02:00	CET → CEST hour (UTC+2)
				{
					inputDate: UI5Date.getInstance("1946-04-14T03:00:00Z"),
					diff: -2 * 3600
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtils.calculateOffset(oFixture.inputDate, "Europe/Berlin"), oFixture.diff,
					"Input Date '" + oFixture.inputDate + "' should have diff " + oFixture.diff);
			});
		});

		QUnit.test("Calculate offset Summer/Winter Time", function (assert) {
			[
				// Sydney
				// 2018	Sun, 1 Apr, 03:00	AEDT → AEST  -1 hour
				// from UTC+11h to UTC+10
				{
					targetDate: Date.UTC(2018, 3, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 2, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 3, 1, 4),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 5, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				// 2018 Sun, 7 Oct, 02:00	AEST → AEDT	+1 hour (DST start)	UTC+11h
				{
					targetDate: Date.UTC(2018, 9, 7),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 2),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 2, 30),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 3),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 3, 30),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 4),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 8),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				// Adak
				// 2018	Sun, 11 Mar, 02:00	HST → HDT	+1 hour (DST start)	UTC-9h
				// from UTC-10h to UTC-9
				{
					targetDate: Date.UTC(2018, 2, 10, 22),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 4),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 16),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},

				// 218	Sun, 4 Nov, 02:00	HDT → HST	-1 hour (DST end)	UTC-10h
				// from UTC-9 to UTC-10
				{
					targetDate: Date.UTC(2018, 11, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 10, 4, 5),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 10, 4, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				{
					targetDate: Date.UTC(2018, 9, 4),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				// Kiritimati
				// UTC+14
				{
					targetDate: Date.UTC(2018, 9, 9),
					targetTimezone: "Pacific/Kiritimati",
					timezoneDiff: -14
				},
				{
					targetDate: Date.UTC(2018, 9, 9, 20),
					targetTimezone: "Pacific/Kiritimati",
					timezoneDiff: -14
				},
				// London
				// 2018	Sun, 25 Mar, 01:00	GMT → BST	+1 hour (DST start)	UTC+1h
				{
					targetDate: Date.UTC(2018, 2, 24),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 0, 30),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 1),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 26),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				// Sun, 28 Oct, 02:00	BST → GMT	-1 hour (DST end)	UTC
				{
					targetDate: Date.UTC(2018, 9, 29),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 0, 59),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 25),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				// Berlin
				// 2018	Sun, 25 Mar, 02:00	CET → CEST	+1 hour (DST start)	UTC+2h

				{
					targetDate: Date.UTC(2018, 2, 25, 3),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 2),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 1),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 2, 25),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				// 2018 Sun, 28 Oct, 03:00	CEST → CET	-1 hour (DST end)	UTC+1h
				{
					targetDate: Date.UTC(2018, 9, 28, 4),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 3),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 2),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1, 59),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 9, 28),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				// Independent State of Samoa changed time at the end of December 29, 2011
				// It changed from UTC-11 (UTC-10 DST) to UTC+13 (UTC+14 DST until 2021 - currently always UTC+13)
				{
					targetDate: Date.UTC(2011, 11, 29, 23),
					targetTimezone: "Pacific/Apia",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2011, 11, 30, 0),
					targetTimezone: "Pacific/Apia",
					// even if time zone offset is +14:00, timezoneDiff has to be 10 otherwise we get a wrong date
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2011, 11, 31, 0),
					targetTimezone: "Pacific/Apia",
					timezoneDiff: -14
				}
			].forEach(function (oFixture) {
				assert.strictEqual(
					TimezoneUtils.calculateOffset(UI5Date.getInstance(oFixture.targetDate), oFixture.targetTimezone),
					oFixture.timezoneDiff * 3600,
					"Timezone difference of " + oFixture.timezoneDiff + " hours in " + oFixture.targetTimezone
						+ " for input date " + UI5Date.getInstance(oFixture.targetDate) + ".");
			});
		});

		QUnit.test("try to convert to invalid time", function (assert) {
			// 2018 Sun, 7 Oct, 02:00	AEST → AEDT	+1 hour (DST start)	UTC+11h
			var oDate = Date.UTC(2018, 9, 7, 2, 30);
			// Sun Oct 07 2018 15:30:00 GMT+0200
			var iExpectedEDT = Date.UTC(2018, 9, 7, 13, 30);
			assert.strictEqual(TimezoneUtils.convertToTimezone(UI5Date.getInstance(oDate), "Australia/Sydney")
				.getTime(), iExpectedEDT, "Date should be converted.");

			var oDate1 = Date.UTC(2018, 9, 6, 16, 30);
			var iExpectedEDT1 = Date.UTC(2018, 9, 7, 3, 30);
			assert.strictEqual(TimezoneUtils.convertToTimezone(UI5Date.getInstance(oDate1), "Australia/Sydney")
				.getTime(), iExpectedEDT1, "Date should be converted.");


			var oDate2 = Date.UTC(2018, 9, 6, 15, 30);
			var iExpectedEDT2 = Date.UTC(2018, 9, 7, 1, 30);
			assert.strictEqual(TimezoneUtils.convertToTimezone(UI5Date.getInstance(oDate2), "Australia/Sydney")
				.getTime(), iExpectedEDT2, "Date should be converted.");

			var oDate3 = Date.UTC(2018, 9, 6, 14, 30);
			var iExpectedEDT3 = Date.UTC(2018, 9, 7, 0, 30);
			assert.strictEqual(TimezoneUtils.convertToTimezone(UI5Date.getInstance(oDate3), "Australia/Sydney")
				.getTime(), iExpectedEDT3, "Date should be converted.");
		});

		QUnit.test("convert to America/New_York", function (assert) {
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var oDateEDT = UI5Date.getInstance("2021-10-13T15:22:33Z");
			var iExpectedEDT = Date.UTC(2021, 9, 13, 11, 22, 33);
			assert.strictEqual(TimezoneUtils.convertToTimezone(oDateEDT, "America/New_York").getTime(), iExpectedEDT,
				"Date should be converted.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var oDateEST = UI5Date.getInstance("2021-11-13T15:22:33Z");
			var iExpectedEST = Date.UTC(2021, 10, 13, 10, 22, 33);
			assert.strictEqual(TimezoneUtils.convertToTimezone(oDateEST, "America/New_York").getTime(), iExpectedEST,
				"Date should be converted.");
		});

		QUnit.test("convert to Europe/Berlin", function (assert) {
			// Timezone difference UTC+2 (Central European Summer Time)
			var oDateSummer = UI5Date.getInstance("2021-10-13T15:22:33Z");
			var iExpectedSummer = Date.UTC(2021, 9, 13, 17, 22, 33);
			assert.strictEqual(TimezoneUtils.convertToTimezone(oDateSummer, "Europe/Berlin").getTime(), iExpectedSummer,
				"Date should be converted.");

			// Timezone difference UTC+1 (Central European Standard Time)
			var oDateStandard = UI5Date.getInstance("2021-11-13T15:22:33Z");
			var iExpectedStandard = Date.UTC(2021, 10, 13, 16, 22, 33);
			assert.strictEqual(TimezoneUtils.convertToTimezone(oDateStandard, "Europe/Berlin").getTime(),
				iExpectedStandard, "Date should be converted.");
		});

		QUnit.test("Historical timezones", function (assert) {
			[
				// 1730 (UTC+0:53:28)
				{
					inputDate: UI5Date.getInstance("1730-01-01T00:00:00Z"),
					outputDate: UI5Date.getInstance("1730-01-01T00:53:28Z")
				},
				{
					inputDate: UI5Date.getInstance("1893-01-01T00:00:00Z"),
					outputDate: UI5Date.getInstance("1893-01-01T00:53:28Z")
				},
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate: UI5Date.getInstance("1893-04-01T00:00:00Z"),
					outputDate: UI5Date.getInstance("1893-04-01T01:00:00Z")
				},
				// 1941	(UTC+2)
				{
					inputDate: UI5Date.getInstance("1941-01-01T00:00:00Z"),
					outputDate: UI5Date.getInstance("1941-01-01T02:00:00Z")
				},
				{
					inputDate: UI5Date.getInstance("1941-06-01T00:00:00Z"),
					outputDate: UI5Date.getInstance("1941-06-01T02:00:00Z")
				},
				// 1945 Thu, 24 May, 02:00	CEST → CEMT	(UTC+3)
				{
					inputDate: UI5Date.getInstance("1945-05-24T02:00:00Z"),
					outputDate: UI5Date.getInstance("1945-05-24T05:00:00Z")
				},
				// 1946 Sun, 14 Apr, 02:00	CET → CEST hour (UTC+2)
				{
					inputDate: UI5Date.getInstance("1946-05-24T02:00:00Z"),
					outputDate: UI5Date.getInstance("1946-05-24T04:00:00Z")
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtils.convertToTimezone(oFixture.inputDate, "Europe/Berlin"),
					oFixture.outputDate, "Input Date '" + oFixture.inputDate + "' should be converted.");
			});
		});

		QUnit.test("Before year 0", function (assert) {
			[
				{
					// year 1
					createInputDate: function() {
						return UI5Date.getInstance("0001-01-01T00:00:00Z");
					},
					createOutputDate: function() {
						return UI5Date.getInstance("0001-01-01T00:53:28Z");
					}
				},
				{
					// year 0
					createInputDate: function() {
						return UI5Date.getInstance("0000-01-01T00:00:00Z");
					},
					createOutputDate: function() {
						var oDate = UI5Date.getInstance("0000-01-01T00:53:28Z");
						return oDate;
					}
				},
				{
					// year -1
					createInputDate: function() {
						var oDate = UI5Date.getInstance("0000-01-01T00:00:00Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = UI5Date.getInstance("0000-01-01T00:53:28Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					}
				},
				{
					// year -1 in May
					createInputDate: function() {
						var oDate = UI5Date.getInstance("0000-05-03T12:00:00Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = UI5Date.getInstance("0000-05-03T12:53:28Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					}
				},
				{
					// year -1000
					createInputDate: function() {
						var oDate = UI5Date.getInstance("0000-01-01T00:00:00Z");
						oDate.setUTCFullYear(-1000);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = UI5Date.getInstance("0000-01-01T00:53:28Z");
						oDate.setUTCFullYear(-1000);
						return oDate;
					}
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtils.convertToTimezone(oFixture.createInputDate(), "Europe/Berlin"),
					oFixture.createOutputDate(), "Input Date '" + oFixture.createInputDate()
						+ "' should be converted.");
			});
		});

		QUnit.test("local timezone", function (assert) {
			var sLocalTimezone = TimezoneUtils.getLocalTimezone();
			assert.ok(sLocalTimezone, "local timezone can be retrieved");
			assert.ok(timezones.aTzTimezoneIDs.includes(sLocalTimezone) || aTimezoneIDs.includes(sLocalTimezone),
				"Local timezone should be in list: " + sLocalTimezone);
		});

		QUnit.test("convert CLDR to ABAP", function (assert) {
			const oDateTimeFormatMock = this.mock(Intl.DateTimeFormat.prototype);

			for (const [sCLDR_ID, sABAP_ID] of Object.entries(TimezoneUtils.mCLDR2ABAPTimezones)) {
				TimezoneUtils._clearLocalTimezoneCache();
				oDateTimeFormatMock.expects("resolvedOptions").returns({timeZone: sCLDR_ID});

				// code under test
				assert.strictEqual(TimezoneUtils.getLocalTimezone(), sABAP_ID, sCLDR_ID + " -> " + sABAP_ID);
			}
		});

		QUnit.test("only retrieve timezone if cache is empty (string)", function (assert) {
			TimezoneUtils._clearLocalTimezoneCache();
			// the browser's Intl.DateTimeFormat implementation may return undefined in case of OS default timezone
			this.mock(Intl.DateTimeFormat.prototype).expects("resolvedOptions").returns({timeZone: undefined});

			// code under test
			assert.strictEqual(TimezoneUtils.getLocalTimezone(), undefined);
			assert.strictEqual(TimezoneUtils.getLocalTimezone(), undefined,
				"second call uses cache, does not call Intl.DateTimeFormat API again");
		});

		QUnit.test("convert from UTC to UTC, with fixed date end of January", function (assert) {
			this.clock = sinon.useFakeTimers(UI5Date.getInstance("2022-01-31T15:22:33Z").getTime());
			// The date creation from fields provided by the Intl.DateTimeFormat API must be in the
			// correct order and use the UNIX epoch start date (new Date(0)).
			// Otherwise if created from a new Date() with date January 31st when calling
			// setUTCMonth, it would automatically shift to the next month, because February does
			// not have the 31 days.
			var oDate = UI5Date.getInstance("2021-11-13T15:22:33Z");
			assert.deepEqual(TimezoneUtils.convertToTimezone(oDate, "UTC"), oDate, "Date should be converted.");

			this.clock.restore();
		});

		QUnit.test("convertToTimezone + calculateOffset + isValidTimezone", function (assert) {
			var oDate = UI5Date.getInstance(Date.UTC(2018, 9, 7, 2, 30));
			aTimezoneIDs.forEach(function (sTimezone) {

				assert.ok(TimezoneUtils.isValidTimezone(sTimezone), "timezone is valid: " + sTimezone);

				// forth
				var oConvertedDate = TimezoneUtils.convertToTimezone(oDate, sTimezone);

				// back
				var iOffsetSeconds = TimezoneUtils.calculateOffset(oConvertedDate, sTimezone);
				oConvertedDate.setUTCSeconds(iOffsetSeconds);

				// check
				assert.deepEqual(oConvertedDate, oDate, "timezone conversion forth and back: " + sTimezone);
			});
		});

		//*********************************************************************************************
		QUnit.test("_getParts: integrative test", function (assert) {
			var oParts;

			// code under test
			oParts = TimezoneUtils._getParts(UI5Date.getInstance(0), "Europe/Berlin");

			assert.deepEqual(oParts, {
					day: "01",
					era: "A",
					fractionalSecond: "000",
					hour: "01",
					minute: "00",
					month: "01",
					second: "00",
					timeZoneName: "GMT+1",
					weekday: "Thu",
					year: "1970"
				});
		});

	//*********************************************************************************************
[
	{oDate: new Date(Date.UTC(2023, 8, 30, 15)), iExpectedOffset: -10},
	{oDate: new Date(Date.UTC(2023, 9, 1, 3)), iExpectedOffset: -11},
	{oDate: new Date(Date.UTC(2023, 9, 1, 2)), iExpectedOffset: -10},
	{oDate: new Date(Date.UTC(2023, 8, 30, 16)), iExpectedOffset: -10},
	{oDate: new Date(Date.UTC(2024, 3, 6, 15)), iExpectedOffset: -11},
	{oDate: new Date(Date.UTC(2024, 3, 7, 14)), iExpectedOffset: -10},
	{oDate: new Date(Date.UTC(2024, 3, 6, 17)), iExpectedOffset: -11}
].forEach((oFixture, i) => {
	QUnit.test("calculateOffset: Australia/Hobart, #" + i, function (assert) {
		assert.strictEqual(TimezoneUtils.calculateOffset(oFixture.oDate, "Australia/Hobart"),
			oFixture.iExpectedOffset * 3600);
	});
});

	//*********************************************************************************************
[
	{oDate: new Date(Date.UTC(2023, 8, 2, 21)), iExpectedOffset: 6},
	{oDate: new Date(Date.UTC(2023, 8, 2, 22)), iExpectedOffset: 6},
	{oDate: new Date(Date.UTC(2023, 8, 2, 23)), iExpectedOffset: 5},
	{oDate: new Date(Date.UTC(2023, 8, 3, 10)), iExpectedOffset: 5},
	{oDate: new Date(Date.UTC(2024, 3, 6, 21)), iExpectedOffset: 5},
	{oDate: new Date(Date.UTC(2024, 3, 7, 2)), iExpectedOffset: 6},
	{oDate: new Date(Date.UTC(2024, 3, 8, 10)), iExpectedOffset: 6}
].forEach((oFixture, i) => {
	QUnit.test("calculateOffset: Pacific/Easter, #" + i, function (assert) {
		assert.strictEqual(TimezoneUtils.calculateOffset(oFixture.oDate, "Pacific/Easter"),
			oFixture.iExpectedOffset * 3600);
	});
});

	//*********************************************************************************************
	QUnit.test("calculateOffset: Daylight Saving Time (DST) switch far away", function (assert) {
		const oDate = {getTime() {}};
		const oDateInTimezone = {getTime() {}};
		const sTimezone = "~sTimezone";
		const oTimezoneUtilsMock = this.mock(TimezoneUtils);
		this.mock(oDate).expects("getTime").returns(42000);
		this.mock(oDateInTimezone).expects("getTime").returns(13000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(sinon.match.same(oDate), sTimezone)
			.returns(oDateInTimezone);
		// -> iInitialOffset = 42000 - 13000 = 29000
		const oFirstGuessInTimezone = {getTime() {}};
		this.mock(oFirstGuessInTimezone).expects("getTime").returns(42000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(new Date(/*42000 + 29000*/71000), sTimezone)
			.returns(oFirstGuessInTimezone);
		// -> iSecondOffset = 71000 - 42000 = 29000

		// code under test - both time zone offsets are equal
		assert.strictEqual(TimezoneUtils.calculateOffset(oDate, sTimezone), 29);
	});

	//*********************************************************************************************
	QUnit.test("calculateOffset: DST switch, second guess matches", function (assert) {
		const oDate = {getTime() {}};
		const oDateInTimezone = {getTime() {}};
		const sTimezone = "~sTimezone";
		const oTimezoneUtilsMock = this.mock(TimezoneUtils);
		this.mock(oDate).expects("getTime").returns(42000);
		this.mock(oDateInTimezone).expects("getTime").returns(13000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(sinon.match.same(oDate), sTimezone)
			.returns(oDateInTimezone);
		// -> iInitialOffset = 42000 - 13000 = 29000
		const oFirstGuessInTimezone = {getTime() {}};
		this.mock(oFirstGuessInTimezone).expects("getTime").returns(38000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(new Date(/*42000 + 29000*/71000), sTimezone)
			.returns(oFirstGuessInTimezone);
		// -> iSecondOffset = 71000 - 38000 = 33000
		const oSecondGuessInTimezone = {getTime() {}};
		this.mock(oSecondGuessInTimezone).expects("getTime").returns(42000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(new Date(/*42000 + 33000*/75000), sTimezone)
			.returns(oSecondGuessInTimezone);

		// code under test - both time zone offsets are equal
		assert.strictEqual(TimezoneUtils.calculateOffset(oDate, sTimezone), 33);
	});

	//*********************************************************************************************
[true, false].forEach((bUseFirstOffset) => {
	const sTitle = "calculateOffset: DST switch, second guess doesn't match, use "
		+ (bUseFirstOffset ? "first" : "second") + " offset";
	QUnit.test(sTitle, function (assert) {
		const oDate = {getTime() {}};
		const oDateInTimezone = {getTime() {}};
		const sTimezone = "~sTimezone";
		const oTimezoneUtilsMock = this.mock(TimezoneUtils);
		this.mock(oDate).expects("getTime").returns(42000);
		this.mock(oDateInTimezone).expects("getTime").returns(13000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(sinon.match.same(oDate), sTimezone)
			.returns(oDateInTimezone);
		// -> iInitialOffset = 42000 - 13000 = 29000
		const oFirstGuessInTimezone = {getTime() {}};
		this.mock(oFirstGuessInTimezone).expects("getTime").returns(38000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(new Date(/*42000 + 29000*/71000), sTimezone)
			.returns(oFirstGuessInTimezone);
		// -> iSecondOffset = 71000 - 38000 = 33000
		const oSecondGuessInTimezone = {getTime() {}};
		this.mock(oSecondGuessInTimezone).expects("getTime").returns(bUseFirstOffset ? 34000 : 44000);
		oTimezoneUtilsMock.expects("convertToTimezone").withExactArgs(new Date(/*42000 + 33000*/75000), sTimezone)
			.returns(oSecondGuessInTimezone);

		// code under test - both time zone offsets are equal
		assert.strictEqual(TimezoneUtils.calculateOffset(oDate, sTimezone), bUseFirstOffset ? 29 : 33);
	});
});
});
