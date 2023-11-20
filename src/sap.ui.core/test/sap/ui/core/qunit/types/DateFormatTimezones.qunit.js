/*global QUnit*/
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/TimezoneUtil"
], function (Localization, Locale, LocaleData, UI5Date, DateFormat, TimezoneUtil) {
	"use strict";

	var sDefaultTimezone = Localization.getTimezone();

	QUnit.module("DateTime format", {
		beforeEach: function () {
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale
			Localization.setLanguage(this.sLanguage);
		}
	});

	QUnit.test("show timezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
		var oDateFormat;
		var oDate = UI5Date.getInstance("2021-10-13T13:22:33Z");

		oDateFormat = DateFormat.getDateTimeInstance({});
		assert.strictEqual(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33\u202FPM",
			"showTimezone parameter is ignored and bUTC parameter is truthy.");

		oDateFormat = DateFormat.getDateTimeInstance({showTimezone: false});
		assert.strictEqual(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33\u202FPM",
			"showTimezone parameter is ignored and bUTC parameter is truthy..");

		oDateFormat = DateFormat.getDateTimeInstance({
			showDate: false,
			showTime: false
		});
		assert.strictEqual(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33\u202FPM",
			"showTimezone parameter is ignored and bUTC parameter is truthy.");

		oDateFormat = DateFormat.getDateTimeInstance({
			showDate: false
		});
		assert.strictEqual(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33\u202FPM",
			"showTimezone parameter is ignored and bUTC parameter is truthy.");
	});

	QUnit.module("DateTimeWithTimezone instance");

	QUnit.test("invalid configuration", function (assert) {
		assert.throws(function() {
			DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false,
				showTimezone: false
			});
		}, new TypeError("Invalid Configuration. One of the following format options must be "
			+ "true: showDate, showTime or showTimezone."), "invalid configuration");
	});

	QUnit.module("DateTimeWithTimezone format en-US", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("show timezone", function (assert) {
		var oDateFormat;

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu
		var oDateEDT = UI5Date.getInstance("2021-10-13T13:22:33Z");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Oct 13, 2021, 9:22:33\u202FAM Americas, New York", "date was converted and timezone name was added.");

		// style medium/short
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({style: "medium/short"});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Oct 13, 2021, 9:22\u202FAM Americas, New York",
			"date medium and time short were converted and timezone name was added.");

		// style short/medium
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({style: "short/medium"});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"10/13/21, 9:22:33\u202FAM Americas, New York",
			"date short and time medium were converted and timezone name was added.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Oct 13, 2021, 9:22:33\u202FAM", "date was converted and timezone name isn't shown.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			showDate: false,
			showTime: false
		});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Americas, New York", "Show only timezone");
	});

	QUnit.test("format with show all", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Oct 12, 2021, 10:22:33\u202FPM Americas, New York", "date was converted and timezone name was added.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEST, "America/New_York"),
			"Nov 13, 2021, 8:22:33\u202FAM Americas, New York", "date was converted and timezone name was added.");
	});

	QUnit.test("Custom format 'yMMMhVV'", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({format: "yMMMhVV"});

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEST, "America/New_York"),
			"Nov 2021, 8\u202FAM Americas, New York", "New timezone should be be applied.");
	});

	QUnit.test("Timezone parameter is empty string, null or undefined", function (assert) {
		var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
		var oDateEDT = UI5Date.getInstance("2021-10-13T13:22:33Z");

		assert.strictEqual(oDateTimeWithTimezoneFormat.format(oDateEDT, ""),
			"Oct 13, 2021, 3:22:33\u202FPM Europe, Berlin", "default to Europe, Berlin");
		assert.strictEqual(oDateTimeWithTimezoneFormat.format(oDateEDT, null),
			"Oct 13, 2021, 3:22:33\u202FPM Europe, Berlin", "default to Europe, Berlin");
		assert.strictEqual(oDateTimeWithTimezoneFormat.format(oDateEDT, undefined),
			"Oct 13, 2021, 3:22:33\u202FPM Europe, Berlin", "default to Europe, Berlin");
	});

	QUnit.module("DateTimeWithTimezone format de-DE", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("de_DE");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("show timezone", function (assert) {
		var oDateFormat;

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu
		var oDateEDT = UI5Date.getInstance("2021-10-13T13:22:33Z");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"13.10.2021, 09:22:33 Amerika, New York", "date was converted and timezone name was added.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"13.10.2021, 09:22:33", "date was converted and timezone name isn't shown.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			showDate: false,
			showTime: false
		});
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"Amerika, New York", "Show only timezone");
	});

	QUnit.test("format with show all", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"12.10.2021, 22:22:33 Amerika, New York", "date was converted and timezone name was added.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEST, "America/New_York"),
			"13.11.2021, 08:22:33 Amerika, New York", "date was converted and timezone name was added.");
	});

	QUnit.test("Custom format 'yMMMhVV'", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({format: "yMMMhVV"});

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEST, "America/New_York"),
			"Nov. 2021, 8 Uhr AM Amerika, New York", "New timezone should be be applied.");
	});

	QUnit.module("DateTimeWithTimezone format", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setTimezone(sDefaultTimezone);
			Localization.setLanguage(this.sLanguage);
		}
	});

	QUnit.test("custom pattern - no date given", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss"
		});
		assert.strictEqual(oDateFormat.format(null, "America/New_York"), "",
			"timezone not present in pattern");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "'foo'"
		});
		assert.strictEqual(oDateFormat.format(null, "America/New_York"), "",
			"timezone not present in pattern");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "'foo 'VV"
		});
		assert.strictEqual(oDateFormat.format(null, "America/New_York"), "Americas, New York",
			"timezone present in pattern");

		assert.strictEqual(oDateFormat.format(null, "Australia/Queensland"), "Australia/Queensland",
			"timezone present in pattern (no translation available, but valid timezone)");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss' 'VV"
		});
		assert.strictEqual(oDateFormat.format(null, "America/New_York"), "Americas, New York",
			"timezone present in pattern");
		/** @deprecated As of version 1.101.0 */
		(function () {
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: "Only"});
			assert.strictEqual(oDateFormat.format(null, "America/New_York"), "Americas, New York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: "Hide"});
			assert.strictEqual(oDateFormat.format(null, "America/New_York"), "",
				"timezone not present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: "Show"});
			assert.strictEqual(oDateFormat.format(null, "America/New_York"), "Americas, New York",
				"timezone present in pattern");
		}());
	});

[
	{},
	{showDate: false, showTime: false},
	{showTimezone: false},
	{pattern: "'foo'"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("format invalid time zone, #" + i, function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

		assert.strictEqual(oDateFormat.format(UI5Date.getInstance(), "NotValid"), "",
			"invalid timezone specified");
	});
});

	QUnit.test("Timezone parameter of improper value", function (assert) {
		var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
		var oDateEDT = UI5Date.getInstance("2021-10-13T13:22:33Z");

		[true, false, 0, 1, {}].forEach(function(sTimezone) {
			assert.throws(function() {
				oDateTimeWithTimezoneFormat.format(oDateEDT, sTimezone);
			}, new TypeError("The given timezone must be a string."), "timezone not valid for '" + sTimezone + "'");
		});
	});

	QUnit.test("only show timezone - null values", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false
			});

		[null, "", undefined, UI5Date.getInstance("invalid")].forEach(function(oDate) {
			assert.strictEqual(oDateFormat.format(oDate, "America/New_York"), "Americas, New York",
				"Timezone is displayed");
		});
	});

	QUnit.test("Custom pattern with milliseconds (SSS)", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS VV"
			});
		var oDateEDT = UI5Date.getInstance("2021-10-13T13:22:33.456Z");
		assert.strictEqual(oDateFormat.format(oDateEDT, "America/New_York"),
			"2021-10-13T09:22:33.456 Americas, New York", "milliseconds are shown");
	});

	QUnit.test("Custom pattern with timezone (z)", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z"});

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		assert.strictEqual(oDateFormat.format(oDateEST, "America/New_York"), "2021-11-13T08:22:33 GMT-05:00",
			"date was converted and new timezone should be be applied.");
		// UTC flag
		assert.deepEqual(oDateFormat.format(oDateEST, "America/New_York"), oDateFormat.format(oDateEST,
			"America/New_York", true), "UTC flag (true) is ignored and set to false.");
	});

	QUnit.test("Custom pattern with timezones (z, Z, x and VV)", function (assert) {
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");

		var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		assert.strictEqual(oDateFormat1.format(oDateEDT, "America/New_York"),
			"2021-10-12T22:22:33 GMT-04:00 Americas, New York",
			"timezone should be applied and all strings were added.");

		var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z Z VV"});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		assert.strictEqual(oDateFormat2.format(oDateEDT, "America/New_York"),
			"2021-10-12T22:22:33 GMT-04:00 -0400 Americas, New York",
			"timezone should be applied and all strings were added.");

		var oDateFormat3 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss XX VV"});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		assert.strictEqual(oDateFormat3.format(oDateEDT, "America/New_York"),
			"2021-10-12T22:22:33 -0400 Americas, New York",
			"timezone should be applied and all strings were added.");
	});

	QUnit.test("Custom pattern with timezones (z and XX but without VV pattern)", function (assert) {
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");

		var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z XX"});
		assert.strictEqual(oDateFormat1.format(oDateEDT, "America/New_York"),
			"2021-10-12T22:22:33 GMT-04:00 -0400", "Format for pattern z and XX should be added.");

		var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss XX z"});
		assert.strictEqual(oDateFormat2.format(oDateEDT, "America/New_York"),
			"2021-10-12T22:22:33 -0400 GMT-04:00", "Format for pattern XX and z should be added.");
	});

	QUnit.module("DateTime parse", {
		beforeEach: function () {
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale
			Localization.setLanguage(this.sLanguage);
		}
	});

	QUnit.test("show timezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
		var oDateFormat;
		var sDateEDT = "Oct 13, 2021, 9:22:33 AM";
		var iDateExpectedEDT = Date.UTC(2021, 9, 13, 9, 22, 33);

		oDateFormat = DateFormat.getDateTimeInstance({});
		assert.strictEqual(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT,
			"Timezone and showTimezone parameters are ignored.");

		oDateFormat = DateFormat.getDateTimeInstance();
		assert.strictEqual(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT,
			"Timezone and showTimezone parameters are ignored.");

		oDateFormat = DateFormat.getDateTimeInstance({showTimezone: false});
		assert.strictEqual(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT,
			"Timezone and showTimezone parameters are ignored.");

		oDateFormat = DateFormat.getDateTimeInstance({
			showDate: false,
			showTime: false
		});
		assert.strictEqual(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT,
			"Timezone and showTimezone parameters are ignored.");

		oDateFormat = DateFormat.getDateTimeInstance({showDate: false});
		assert.strictEqual(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT,
			"Timezone and showTimezone parameters are ignored.");
	});

	QUnit.module("DateTimeWithTimezone parse en-US", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("show all", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDateEDT = "Oct 13, 2021, 9:22:33 AM Americas, New York";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date.");

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
		var sDateEDT2 = "Oct 13, 2021, 10:22:33 PM Americas, New York";
		var iTimestampExpectedEDT2 = UI5Date.getInstance(Date.UTC(2021, 9, 14, 2, 22, 33));
		var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
		assert.strictEqual(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date and the day "
				+ "changes to yesterday.");
		assert.strictEqual(oParseResultEDT2[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date and the day "
			+ "changes to yesterday.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST)
		var sDateEST = "Nov 13, 2021, 8:22:33 AM Americas, New York";
		var iTimestampExpectedEST = UI5Date.getInstance(Date.UTC(2021, 10, 13, 13, 22, 33));
		var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
		assert.strictEqual(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date.");
		assert.strictEqual(oParseResultEST[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
		var sDateEST2 = "Nov 13, 2021, 11:22:33 PM Americas, New York";
		var iTimestampExpectedEST2 = UI5Date.getInstance(Date.UTC(2021, 10, 14, 4, 22, 33));
		var oParseResultEST2 = oDateFormat.parse(sDateEST2, "America/New_York", false, true);
		assert.strictEqual(oParseResultEST2[0].getTime(), iTimestampExpectedEST2.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date "
			+ "(UTC option is set to false).");
		assert.strictEqual(oParseResultEST2[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date "
			+ "(UTC option is set to false).");
	});

	QUnit.test("hide timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDateEDT = "Oct 13, 2021, 9:22:33 AM";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.test("only show timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false
			});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDate1 = "America/New_York";
		var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], "America/New_York",
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.test("show all, invalid timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// invalid timezone cannot be parsed
		var sDateEDT1 = "Oct 13, 2021, 9:22:33 AM foo";
		var oParseResultEDT1 = oDateFormat.parse(sDateEDT1, "foo");
		assert.strictEqual(oParseResultEDT1, null, "timezone not valid");

		var sDateEDT = "Oct 13, 2021, 9:22:33 AM NotValid";
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT, null, "timezone not valid");
	});

	QUnit.test("show all, changed timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		// Change to Europe, Berlin (Central European Summer Time)
		// Steps:
		// * To Americas, New York 9:22 + 4h diff = 13:22
		// * From Americas, New York => Europe, Berlin 13:22 - 6h diff = 7:22
		var sDateCEST = "Oct 13, 2021, 9:22:33 AM Europe, Berlin";
		var iTimestampExpectedCEST = UI5Date.getInstance(Date.UTC(2021, 9, 13, 7, 22, 33));
		var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
		assert.strictEqual(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultCEST[1], "Europe/Berlin",
			"The timezone is provided in date string, it is used to calculate the date.");

		// Change to Americas, New York (Eastern Daylight Time)
		// Steps:
		// * To Europe, Berlin 9:22 - 2h diff = 7:22
		// * From Europe, Berlin => Americas, New York 7:22 + 6h diff = 13:22
		var sDateEDT = "Oct 13, 2021, 9:22:33 AM Americas, New York";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "Europe/Berlin");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], "America/New_York",
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.test("show all, timezone cannot be determined", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VVa"});

		// timezone string is parsed first and has no fixed values therefore it cannot be differentiated
		var sDateEDT2 = "Americas, New YorkAM";
		var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
		assert.ok(oParseResultEDT2, "timezone namecan be retrieved");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "aVV"});

		// AM/PM string has values ["AM", "PM"] and is parsed first so timezone can be differentiated
		var sDateEDT3 = "AMAmericas, New York";
		var oParseResultEDT3 = oDateFormat.parse(sDateEDT3, "America/New_York");
		assert.ok(oParseResultEDT3, "timezone name can be retrieved");
	});

	QUnit.test("no timezone in user input", function (assert) {
		var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false
			});

		var oParseResult1 = oDateFormatWithPattern.parse("", "America/New_York");
		assert.strictEqual(oParseResult1, null, "cannot be parsed.");

		oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});

		oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM", "America/New_York");
		assert.strictEqual(oParseResult1[0].getTime(), Date.UTC(2021, 9, 13, 13, 22, 33),
			"The timezone is provided as parameter, it is used to convert the date.");
		assert.strictEqual(oParseResult1[1], undefined, "The timezone is not provided in input string");

		oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({});

		oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM", "America/New_York");
		assert.strictEqual(oParseResult1[0].getTime(), Date.UTC(2021, 9, 13, 13, 22, 33),
			"The timezone is provided as parameter, it is used to convert the date.");
		assert.strictEqual(oParseResult1[1], undefined, "The timezone is not provided in input string");

		oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM meh", "America/New_York");
		assert.strictEqual(oParseResult1, null, "cannot be parsed.");
	});

	QUnit.test("Timezone parameter is empty string, null or undefined", function (assert) {
		var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
		var sDate = "Oct 13, 2021, 9:22:33 AM Americas, New York";
		var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 13, 22, 33, 0);

		assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, ""),
			[UI5Date.getInstance(iTimestampExpectedEDT), "America/New_York"],
			"use the timezone from the parsed string");
		assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, null),
			[UI5Date.getInstance(iTimestampExpectedEDT), "America/New_York"],
			"use the timezone from the parsed string");
		assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, undefined),
			[UI5Date.getInstance(iTimestampExpectedEDT), "America/New_York"],
			"use the timezone from the parsed string");
	});

	QUnit.module("DateTimeWithTimezone parse de-DE", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("de_DE");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("show all", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDateEDT = "13.10.2021, 09:22:33 Amerika, New York";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date.");

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
		var sDateEDT2 = "13.10.2021, 22:22:33 Amerika, New York";
		var iTimestampExpectedEDT2 = UI5Date.getInstance(Date.UTC(2021, 9, 14, 2, 22, 33));
		var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
		assert.strictEqual(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date and the day "
			+ "changes to yesterday.");
		assert.strictEqual(oParseResultEDT2[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date and the day "
			+ "changes to yesterday.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST)
		var sDateEST = "13.11.2021, 08:22:33 Amerika, New York";
		var iTimestampExpectedEST = UI5Date.getInstance(Date.UTC(2021, 10, 13, 13, 22, 33));
		var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
		assert.strictEqual(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date.");
		assert.strictEqual(oParseResultEST[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date.");

		// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
		var sDateEST2 = "13.11.2021, 23:22:33 Amerika, New York";
		var iTimestampExpectedEST2 = UI5Date.getInstance(Date.UTC(2021, 10, 14, 4, 22, 33));
		var oParseResultEST2 = oDateFormat.parse(sDateEST2, "America/New_York", false, true);
		assert.strictEqual(oParseResultEST2[0].getTime(), iTimestampExpectedEST2.getTime(),
			"The timezone is provided in date string and parameter, it is used to calculate the date "
			+ "(UTC option is set to false).");
		assert.strictEqual(oParseResultEST2[1], "America/New_York",
			"The timezone is provided in date string and parameter, it is used to calculate the date "
			+ "(UTC option is set to false).");
	});

	QUnit.test("hide timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDateEDT = "13.10.2021, 09:22:33";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.test("only show timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showDate: false,
				showTime: false
			});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDate1 = "America/New_York";
		var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], "America/New_York",
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.test("show all, invalid timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});

		// invalid timezone is interpreted as UTC and is not converted
		var sDateEDT1 = "13.10.2021, 09:22:33 foo";
		var oParseResultEDT1 = oDateFormat.parse(sDateEDT1, "foo");
		assert.strictEqual(oParseResultEDT1, null, "timezone name cannot be retrieved");

		var sDateEDT = "13.10.2021, 09:22:33 NotValid";
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT, null, "timezone name cannot be retrieved");
	});

	QUnit.test("show all, changed timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		// Change to Europe, Berlin (Central European Summer Time)
		// Steps:
		// * To Americas, New York 9:22 + 4h diff = 13:22
		// * From Americas, New York => Europe, Berlin 13:22 - 6h diff = 7:22
		var sDateCEST = "13.10.2021, 09:22:33 Europa, Berlin";
		var iTimestampExpectedCEST = UI5Date.getInstance(Date.UTC(2021, 9, 13, 7, 22, 33));
		var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
		assert.strictEqual(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultCEST[1], "Europe/Berlin",
			"The timezone is provided in date string, it is used to calculate the date.");

		// Change to Americas, New York (Eastern Daylight Time)
		// Steps:
		// * To Europe, Berlin 9:22 - 2h diff = 7:22
		// * From Europe, Berlin => Americas, New York 7:22 + 6h diff = 13:22
		var sDateEDT = "13.10.2021, 09:22:33 Amerika, New York";
		var iTimestampExpectedEDT = UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33));
		var oParseResultEDT = oDateFormat.parse(sDateEDT, "Europe/Berlin");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(),
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResultEDT[1], "America/New_York",
			"The timezone is provided in date string, it is used to calculate the date.");
	});

	QUnit.module("DateTimeWithTimezone parse", {
		beforeEach: function () {
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore locale
			Localization.setLanguage(this.sLanguage);
		}
	});

	QUnit.test("custom pattern", function (assert) {
		var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "yyyy-MM-dd'T'HH:mm:ss"
		});

		var sDate1 = "2021-10-13T13:22:33";
		var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
		var oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], undefined);


		oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
		});

		sDate1 = "2021-10-13T13:22:33 Americas, New York";
		iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
		oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], "America/New_York");

		oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
			pattern: "VV"
		});

		sDate1 = "America/New_York";
		iTimestampExpectedEDT = Date.UTC(1970, 0, 1, 5);
		oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], "America/New_York");
	});

[
	{},
	{showDate: false, showTime: false},
	{showTimezone: false},
	{pattern: "'foo'"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("Formatted input string is null, #" + i, function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

		// code under test
		assert.strictEqual(oDateFormat.parse(null, "America/New_York"), null, "cannot be parsed");
	});

	QUnit.test("Invalid time zone parameter, #" + i, function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

		// code under test
		assert.strictEqual(oDateFormat.parse("2021-10-13T13:22:33 Americas, New York", "NotValid"), null,
			"invalid timezone parameter supplied");
	});
});

	QUnit.test("only show timezone", function (assert) {
		var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss",
				showDate: false,
				showTime: false
			});

		var sDate1 = "2021-10-13T13:22:33";
		var oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.notOk(oParseResult1[1], "timezone not part of the pattern");
	});

	QUnit.test("show all, strict", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss VV"});

		// 61  seconds
		var sDateEDT = "2021-10-13T13:22:61 Americas, New York";

		assert.ok(oDateFormat.parse(sDateEDT, "America/New_York", false),
			"strict with 61  seconds will result in null");
		assert.ok(oDateFormat.parse(sDateEDT, "America/New_York"),
			"strict with 61  seconds will result in null");
		assert.notOk(oDateFormat.parse(sDateEDT, "America/New_York", true),
			"strict with 61  seconds will result in null");
	});

	QUnit.test("Timezone parameter of improper value", function (assert) {
		var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
		var sDate = "Oct 13, 2021, 9:22:33 AM Americas, New York";

		[true, false, 0, 1, {}].forEach(function(sTimezone) {
			assert.throws(function() {
				oDateTimeWithTimezoneFormat.parse(sDate, sTimezone);
			}, new TypeError("The given timezone must be a string."), "timezone not valid");
		});
	});

	QUnit.test("Combination with pattern: z and VV, last pattern is used", function (assert) {
		var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"});
		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sDateEDT = "2021-10-13T13:22:33 GMT+02:00 Americas, New York";
		var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
		var oParseResultEDT = oDateFormat1.parse(sDateEDT, "America/New_York");
		assert.strictEqual(oParseResultEDT[0].getTime(), iTimestampExpectedEDT,
			"Offset of the last pattern (VV) is applied.");
		assert.strictEqual(oParseResultEDT[1], "America/New_York",
			"Offset of the last pattern symbol (VV) is applied.");

		var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss VV z"});
		var sDateEDT2 = "2021-10-13T13:22:33 Americas, New York GMT+02:00";
		var iTimestampExpectedEDT2 = Date.UTC(2021, 9, 13, 11, 22, 33, 0);
		var oParseResultEDT2 = oDateFormat2.parse(sDateEDT2, "America/New_York");
		assert.strictEqual(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2,
			"Offset of the last pattern (z) is applied.");
		assert.strictEqual(oParseResultEDT2[1], "America/New_York",
			"Offset of the last pattern symbol (z) is applied.");

		var oDateFormat3 = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z"});
		var sDateEDT3 = "2021-10-13T13:22:33 GMT+02:00";
		var iTimestampExpectedEDT3 = Date.UTC(2021, 9, 13, 11, 22, 33, 0);
		var oParseResultEDT3 = oDateFormat3.parse(sDateEDT3, "America/New_York");
		assert.strictEqual(oParseResultEDT3[0].getTime(), iTimestampExpectedEDT3,
			"Offset of the last pattern (z) is applied.");
		assert.notOk(oParseResultEDT3[1], "timezone not part of the pattern");
	});

	QUnit.module("DateTimeWithTimezone integration - format and parse de-DE", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("de_DE");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("Timezone parameter is null", function (assert) {
		var oDate = UI5Date.getInstance("2021-10-13T02:22:33Z");
		var oLocale = new Locale("de");

		// Default
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oLocale);

		var sFormatted = oDateFormat.format(oDate, null);
		assert.strictEqual(sFormatted, "13.10.2021, 04:22:33 Europa, Berlin",
			"Fallback timezone should be be applied.");

		var oParsedDate = oDateFormat.parse(sFormatted, null);
		assert.deepEqual(oParsedDate[0], oDate, "dates match");
		assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

		// Show
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({}, oLocale);

		sFormatted = oDateFormat.format(oDate, null);
		assert.strictEqual(sFormatted, "13.10.2021, 04:22:33 Europa, Berlin",
			"Fallback timezone should be be applied.");

		oParsedDate = oDateFormat.parse(sFormatted, null);
		assert.deepEqual(oParsedDate[0], oDate, "dates match");
		assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

		// Only
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			showDate: false,
			showTime: false
		}, oLocale);

		sFormatted = oDateFormat.format(oDate, null);
		assert.strictEqual(sFormatted, "Europa, Berlin", "Fallback timezone should be be applied.");

		oParsedDate = oDateFormat.parse(sFormatted, null);
		assert.deepEqual(oParsedDate[0], undefined, "dates match");
		assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

		// Hide
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false}, oLocale);

		sFormatted = oDateFormat.format(oDate, null);
		assert.strictEqual(sFormatted, "13.10.2021, 04:22:33", "Fallback timezone should be be applied.");

		oParsedDate = oDateFormat.parse(sFormatted, null);
		assert.deepEqual(oParsedDate[0], oDate, "dates match");
		assert.deepEqual(oParsedDate[1], undefined, "timezone match");
	});

	QUnit.module("DateTimeWithTimezone integration - format and parse", {
		beforeEach: function () {
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore locale
			Localization.setLanguage(this.sLanguage);
		}
	});

["ar", "he", "tr", "de", "en", "uk", "th", "zh_TW", "zh_CN"].forEach(function(sLocale) {
	var oDate = UI5Date.getInstance("2021-10-13T02:22:33Z");
	QUnit.test("Timezone integration all timezones for " + sLocale, function (assert) {
		var oLocale = new Locale(sLocale);
		var oLocaleData = LocaleData.getInstance(oLocale);
		var mTimezoneTranslations = oLocaleData.getTimezoneTranslations();

		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oLocale);
		Object.keys(mTimezoneTranslations).forEach(function(sTimezone) {
			var sFormatted = oDateFormat.format(oDate, sTimezone);
			var oParsed = oDateFormat.parse(sFormatted, sTimezone);

			assert.deepEqual(oParsed, [oDate, sTimezone], "parsed date and timezone match for " + sTimezone);

			// check also parse with different timezone parameter
			oParsed = oDateFormat.parse(sFormatted, "Europe/Amsterdam");
			assert.deepEqual(oParsed, [oDate, sTimezone], "parsed date and different timezone match for " + sTimezone);
		});
	});
});

	QUnit.test("Timezone translation special cases", function (assert) {
		var oDate = UI5Date.getInstance("2021-10-04T02:22:33Z");

		// Etc/GMT offset timezones
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({style: "long"}, new Locale("de"));

		var sFormatted = oDateFormat.format(oDate, "Etc/GMT+3");
		// offset is negative (GMT-03:00) while IANA timezone ID is positive (Etc/GMT+3)
		assert.strictEqual(sFormatted, "3. Oktober 2021, 23:22:33 GMT-03:00 Etc/GMT+3");
		var oParsed = oDateFormat.parse(sFormatted, "Etc/GMT+3");
		assert.deepEqual(oParsed, [oDate, "Etc/GMT+3"], "parsed date and timezone match for IANA timezone ID 'Etc/GMT+3'");

		// dayName and timezone translation partial overlap
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VV E HH:mm:ss d MMM y"}, new Locale("tr"));
		// (E) Paz
		// (VV) Amerika, La Paz
		sFormatted = oDateFormat.format(oDate, "America/La_Paz");
		assert.strictEqual(sFormatted, "Amerika, La Paz Paz 22:22:33 3 Eki 2021");
		oParsed = oDateFormat.parse(sFormatted, "America/La_Paz");
		assert.deepEqual(oParsed, [oDate, "America/La_Paz"], "parsed date and timezone match for IANA timezone ID 'America/La_Paz'");

		// hour and timezone translation partial overlap
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VV H:mm:ss d MMM y"}, new Locale("de"));
		// (H) 1
		// (VV) Etc/GMT+1
		sFormatted = oDateFormat.format(oDate, "Etc/GMT+1");
		assert.strictEqual(sFormatted, "Etc/GMT+1 1:22:33 4 Okt. 2021");
		oParsed = oDateFormat.parse(sFormatted, "Etc/GMT+1");
		assert.deepEqual(oParsed, [oDate, "Etc/GMT+1"], "parsed date and timezone match for IANA timezone ID 'Etc/GMT+1' and hour 1");

		// timezone substring contained in ID and translation
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("en"));
		[
			{
				timezone: "Etc/GMT+12",
				timezoneSameStart: "Etc/GMT+1"
			},
			{
				timezone: "America/Bahia_Banderas",
				timezoneSameStart: "America/Bahia"
			},
			{
				timezone: "America/Dawson_Creek",
				timezoneSameStart: "America/Dawson"
			}
		].forEach(function(oTimezonePair) {
			sFormatted = oDateFormat.format(oDate, oTimezonePair.timezone);
			oParsed = oDateFormat.parse(sFormatted, oTimezonePair.timezone);
			assert.deepEqual(oParsed, [oDate, oTimezonePair.timezone], "parsed date and timezone match for " + oTimezonePair.timezone);

			// cross over
			oParsed = oDateFormat.parse(sFormatted, oTimezonePair.timezoneSameStart);
			assert.deepEqual(oParsed, [oDate, oTimezonePair.timezone], "cross over parsed date and timezone match for " + oTimezonePair.timezone);

			sFormatted = oDateFormat.format(oDate, oTimezonePair.timezoneSameStart);
			oParsed = oDateFormat.parse(sFormatted, oTimezonePair.timezoneSameStart);
			assert.deepEqual(oParsed, [oDate, oTimezonePair.timezoneSameStart], "parsed date and timezoneSameStart match for " + oTimezonePair.timezoneSameStart);

			// cross over
			oParsed = oDateFormat.parse(sFormatted, oTimezonePair.timezone);
			assert.deepEqual(oParsed, [oDate, oTimezonePair.timezoneSameStart], "cross over parsed date and timezoneSameStart match for " + oTimezonePair.timezoneSameStart);
		});

		// check upper/lower case
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("tr"));
		sFormatted = oDateFormat.format(oDate, "Europe/Istanbul");
		assert.strictEqual(sFormatted, "4 Eki 2021 05:22:33 Avrupa, İstanbul", "correctly formatted");
		assert.deepEqual(oDateFormat.parse(sFormatted, "Europe/Istanbul"), [oDate, "Europe/Istanbul"], "'4 Eki 2021 05:22:33 Avrupa, İstanbul' can be parsed to 'Europe/Istanbul'");
		assert.deepEqual(oDateFormat.parse("4 Eki 2021 05:22:33 AVRUPA, İSTANBUL", "Europe/Istanbul"), [oDate, "Europe/Istanbul"], "'4 Eki 2021 05:22:33 avrupa, İstanbul' can be parsed to 'Europe/Istanbul'");
		assert.deepEqual(oDateFormat.parse("4 Eki 2021 05:22:33 avrupa, istanbul", "Europe/Istanbul"), [oDate, "Europe/Istanbul"], "'4 Eki 2021 05:22:33 Avrupa, istanbul' can be parsed to 'Europe/Istanbul'");
		assert.notOk(oDateFormat.parse("4 Eki 2021 05:22:33 Avrupa, Istanbul", "Europe/Istanbul"), "'4 Eki 2021 05:22:33 Avrupa, Istanbul' cannot be parsed to 'Europe/Istanbul', 'I' is a different character than 'İ'");
	});

	QUnit.test("parse with IANA timezone ID in input", function (assert) {
		// Check all IANA timezone IDs from translations using parse with pattern "VV H VV"
		// use timezone at the start and at the end
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VV H VV"}, new Locale("de"));
		var oLocale = new Locale("de");
		var oLocaleData = LocaleData.getInstance(oLocale);
		var mTimezoneTranslations = oLocaleData.getTimezoneTranslations();
		Object.keys(mTimezoneTranslations).forEach(function(sTimezone) {
			var oParsed = oDateFormat.parse(sTimezone + " 7 " + sTimezone, sTimezone);
			assert.ok(Array.isArray(oParsed), sTimezone + " can be correctly parsed");
			assert.strictEqual(oParsed[1], sTimezone, "Timezone match");
		});
	});

	//*********************************************************************************************
	QUnit.test("parse, find the longest match for symbol 'V'", function (assert) {
		const oFormat = {
				oLocaleData : {getTimezoneTranslations() {}}
			};
		const oTimezoneUtilMock = this.mock(TimezoneUtil);

		this.mock(oFormat.oLocaleData).expects("getTimezoneTranslations").withExactArgs().returns({});

		oTimezoneUtilMock.expects("isValidTimezone").withExactArgs("~Timezone7").returns(false);
		oTimezoneUtilMock.expects("isValidTimezone").withExactArgs("~Timezone").returns(true);

		// code under test
		const oTimezoneParsed = DateFormat.prototype.oSymbols.V.parse("~Timezone7", {digits : 2}, oFormat);

		assert.strictEqual(oTimezoneParsed.timezone, "~Timezone");
		assert.strictEqual(oTimezoneParsed.length, 9);
	});

	//*********************************************************************************************
	QUnit.test("format and parse with show timezone and show time is set to false", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTime: false}),
			sFormatted;

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");
		sFormatted = oDateFormat.format(oDateEDT, "America/New_York");
		assert.strictEqual(sFormatted,
			"Oct 12, 2021 Americas, New York", "date was converted and timezone name was added.");
		assert.throws(function () {
			oDateFormat.parse(sFormatted, "America/New_York");
		}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		sFormatted = oDateFormat.format(oDateEST, "America/New_York");
		assert.strictEqual(sFormatted,
			"Nov 13, 2021 Americas, New York", "date was converted and timezone name was added.");
		assert.throws(function () {
			oDateFormat.parse(sFormatted, "America/New_York");
		}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));
	});

	QUnit.test("format and parse with show timezone and show date is set to false", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showDate: false}),
			sFormatted;

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");
		sFormatted = oDateFormat.format(oDateEDT, "America/New_York");
		assert.strictEqual(sFormatted,
			"10:22:33\u202FPM Americas, New York", "date was converted and timezone name was added.");
		assert.throws(function () {
			oDateFormat.parse(sFormatted, "America/New_York");
		}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));

		// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
		var oDateEST = UI5Date.getInstance("2021-11-13T13:22:33Z");
		sFormatted = oDateFormat.format(oDateEST, "America/New_York");
		assert.strictEqual(sFormatted,
			"8:22:33\u202FAM Americas, New York", "date was converted and timezone name was added.");
		assert.throws(function () {
			oDateFormat.parse(sFormatted, "America/New_York");
		}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));
	});

	QUnit.test("timezone handling timezone position in pattern (fa and zh_CN)", function (assert) {
		var oDate = UI5Date.getInstance("2021-10-13T02:22:33Z");

		// fa.json, timezone append pattern: "{0} ({1})"
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("fa"));

		var sFormattedFA = oDateFormat.format(oDate, "America/New_York");
		assert.strictEqual(sFormattedFA, "12 اکتبر 2021،\u200f 22:22:33 (امریکا, نیویورک)",
			"New timezone should be be applied.");

		var oParsedDateFA = oDateFormat.parse(sFormattedFA, "America/New_York");
		assert.deepEqual(oDate, oParsedDateFA[0], "dates match");
		assert.strictEqual(oDate.getTime(), oParsedDateFA[0].getTime(), "timestamp matches");
		assert.strictEqual(oParsedDateFA[1], "America/New_York");
		assert.deepEqual(oDateFormat.format(oParsedDateFA[0], oParsedDateFA[1]), sFormattedFA, "parsed results are passed to format");

		// zh_CN.json, timezone append pattern: "{1}{0}"
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("zh_CN"));

		var sFormattedZH = oDateFormat.format(oDate, "America/New_York");
		assert.strictEqual(sFormattedZH, "美洲, 纽约 2021年10月12日 22:22:33", "New timezone should be be applied.");

		var oParsedDateZH = oDateFormat.parse(sFormattedZH, "America/New_York");
		assert.deepEqual(oDate, oParsedDateZH[0], "dates match");
		assert.strictEqual(oDate.getTime(), oParsedDateZH[0].getTime(), "timestamp matches");
		assert.strictEqual(oParsedDateZH[1], "America/New_York");
		assert.deepEqual(oDateFormat.format(oParsedDateZH[0], oParsedDateZH[1]), sFormattedZH, "parsed results are passed to format");
	});

	QUnit.test("timezone handling with z and VV pattern, last pattern is used", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"});

		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sFormattedEDT = oDateFormat.format(oDateEDT, "America/New_York");
		assert.strictEqual(sFormattedEDT, "2021-10-12T22:22:33 GMT-04:00 Americas, New York",
			"New timezone should be be applied.");

		var oParsedDateEDT = oDateFormat.parse(sFormattedEDT, "America/New_York");
		assert.deepEqual(oDateEDT, oParsedDateEDT[0], "dates match");
		assert.strictEqual(oDateEDT.getTime(), oParsedDateEDT[0].getTime(), "timestamp matches");
		assert.strictEqual(oParsedDateEDT[1], "America/New_York");

		assert.deepEqual(oDateFormat.format(oParsedDateEDT[0], oParsedDateEDT[1]), sFormattedEDT,
			"parsed results are passed to format");

		var oDateEST = UI5Date.getInstance("2021-11-13T02:22:33Z");

		// Timezone difference UTC-5 (Eastern Standard Time - EST)
		var sFormattedEST = oDateFormat.format(oDateEST, "America/New_York");
		assert.strictEqual(sFormattedEST, "2021-11-12T21:22:33 GMT-05:00 Americas, New York",
			"New timezone should be be applied.");

		var oParsedDateEST = oDateFormat.parse(sFormattedEST, "America/New_York");
		assert.deepEqual(oDateEST, oParsedDateEST[0], "dates match");
		assert.strictEqual(oDateEST.getTime(), oParsedDateEST[0].getTime(), "timestamp matches");
		assert.strictEqual(oParsedDateEST[1], "America/New_York");

		assert.deepEqual(oDateFormat.format(oParsedDateEST[0], oParsedDateEST[1]), sFormattedEST,
			"parsed results are passed to format");
	});

	QUnit.test("timezone handling without timezone in pattern", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss"});

		var oDateEDT = UI5Date.getInstance("2021-10-13T02:22:33Z");

		// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
		var sFormattedEDT = oDateFormat.format(oDateEDT, "America/New_York");
		assert.strictEqual(sFormattedEDT, "2021-10-12T22:22:33", "New timezone does not get applied.");

		var oParsedDateEDT = oDateFormat.parse(sFormattedEDT, "America/New_York");
		assert.deepEqual(oDateEDT, oParsedDateEDT[0], "dates match");
		assert.strictEqual(oDateEDT.getTime(), oParsedDateEDT[0].getTime(), "timestamp matches");
		assert.notOk(oParsedDateEDT[1], "timezone not part of the pattern");

		var oDateEST = UI5Date.getInstance("2021-11-13T02:22:33Z");

		// Timezone difference UTC-5 (Eastern Standard Time - EST)
		var sFormattedEST = oDateFormat.format(oDateEST, "America/New_York");
		assert.strictEqual(sFormattedEST, "2021-11-12T21:22:33", "New timezone should be be applied.");

		var oParsedDateEST = oDateFormat.parse(sFormattedEST, "America/New_York");
		assert.deepEqual(oDateEST, oParsedDateEST[0], "dates match");
		assert.strictEqual(oDateEST.getTime(), oParsedDateEST[0].getTime(), "timestamp matches");
		assert.notOk(oParsedDateEST[1], "timezone not part of the pattern");
	});

	QUnit.module("DateTimeWithTimezone getDateTimeWithTimezoneInstance en-US", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
			this.sLanguage = Localization.getLanguage();
			Localization.setLanguage("en_US");
		},
		afterEach: function () {
			// Restore default locale and timezone
			Localization.setLanguage(this.sLanguage);
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	QUnit.test("Fallback instances patterns (backward compatible case)", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		assert.strictEqual(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
		assert.strictEqual(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "M/d/yy, h:mm\u202Fa VV",
			"Short pattern should contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "MMM d, y, h:mm:ss\u202Fa VV",
			"Medium pattern should contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss VV",
			"Default pattern should contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "yyyyMMdd HHmmss VV",
			"Default pattern without delimiter should contain timezone symbol.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			showDate: false,
			showTime: false
		});
		assert.strictEqual(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
		assert.strictEqual(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "VV",
			"Short pattern should only contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "VV",
			"Medium pattern should only contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "VV",
			"Default pattern should only contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "VV",
			"Default pattern without delimiter should only contain timezone symbol.");

		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		assert.strictEqual(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
		assert.strictEqual(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "M/d/yy, h:mm\u202Fa",
			"Short pattern should not contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "MMM d, y, h:mm:ss\u202Fa",
			"Medium pattern should not contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss",
			"Default pattern should not contain timezone symbol.");
		assert.strictEqual(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "yyyyMMdd HHmmss",
			"Default pattern without delimiter should not contain timezone symbol.");
	});

	QUnit.test("Fallback instances patterns", function (assert) {
		var extractPatterns = function(aFallbackFormats) {
			return aFallbackFormats.map(function(oFallbackFormat) {
				return oFallbackFormat.oFormatOptions.pattern;
			});
		};

		// Date, time and timezone (default)
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"M/d/yy, h:mm\u202Fa VV",
			"MMM d, y, h:mm:ss\u202Fa VV",
			"yyyy-MM-dd'T'HH:mm:ss VV",
			"yyyyMMdd HHmmss VV"
		], "Date, time and timezone fallback patterns should match");

		// Timezone only
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
			showDate: false,
			showTime: false
		});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"VV",
			"VV",
			"VV",
			"VV"
		], "Timezone only fallback patterns should match");

		// Date and time only
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"M/d/yy, h:mm\u202Fa",
			"MMM d, y, h:mm:ss\u202Fa",
			"yyyy-MM-dd'T'HH:mm:ss",
			"yyyyMMdd HHmmss"
		], "Date and time only fallback patterns should match");

		// Date only
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false, showTime: false});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"MMddyyyy",
			"MMddyy",
			"M/d/yy",
			"MMM d, y",
			"yyyy-MM-dd",
			"yyyyMMdd"
		], "Date only fallback patterns should match");

		// Date with timezone
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTime: false});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"MMddyyyy VV",
			"MMddyy VV",
			"M/d/yy VV",
			"MMM d, y VV",
			"yyyy-MM-dd VV",
			"yyyyMMdd VV"
		], "Date with timezone fallback patterns should match");

		// Time only
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showDate: false, showTimezone: false});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"h:mm\u202Fa",
			"h:mm:ss\u202Fa",
			"HH:mm:ss",
			"HHmmss"
		], "Time only fallback patterns should match");

		// Time with timezone
		oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showDate: false});
		assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
			"h:mm\u202Fa VV",
			"h:mm:ss\u202Fa VV",
			"HH:mm:ss VV",
			"HHmmss VV"
		], "Time with timezone fallback patterns should match");
	});

	QUnit.test("Fallback parse with show all", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({});
		// input and expectation for different fallback patterns
		[
			{
				input: "10/13/21, 9:22 AM Americas, New York", // M/d/yy, h:mm a VV
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 0))
			},
			{
				input: "Oct 13, 21, 9:22:33 AM Americas, New York", // MMM d, y, h:mm:ss a VV
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			},
			{
				input: "2021-10-13T09:22:33 Americas, New York", // yyyy-MM-dd'T'HH:mm:ss VV
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			},
			{
				input: "20211013 092233 Americas, New York", // yyyyMMdd HHmmss VV
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			}
		].forEach(function(oFixture) {
			var oParseResultEDT = oDateFormat.parse(oFixture.input, "America/New_York");
			assert.strictEqual(oParseResultEDT[0].getTime(), oFixture.expectedDate.getTime(),
				"The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.strictEqual(oParseResultEDT[1], "America/New_York",
				"The timezone is provided in date string and parameter, it is used to calculate the date.");
		});
	});

	QUnit.test("Fallback parse with hide timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false});
		// input and expectation for different fallback patterns
		[
			{
				input: "10/13/21, 9:22 AM", // M/d/yy, h:mm a
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 0))
			},
			{
				input: "Oct 13, 21, 9:22:33 AM", // MMM d, y, h:mm:ss a
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			},
			{
				input: "2021-10-13T09:22:33", // yyyy-MM-dd'T'HH:mm:ss
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			},
			{
				input: "20211013 092233", // yyyyMMdd HHmmss
				expectedDate: UI5Date.getInstance(Date.UTC(2021, 9, 13, 13, 22, 33))
			}
		].forEach(function(oFixture) {
			var oParseResultEDT = oDateFormat.parse(oFixture.input, "America/New_York");
			assert.strictEqual(oParseResultEDT[0].getTime(), oFixture.expectedDate.getTime(),
				"The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.strictEqual(oParseResultEDT[1], undefined,
				"The timezone is provided in date string and parameter, it is used to calculate the date.");
		});
	});

	QUnit.test("Fallback parse with only show timezone", function (assert) {
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "a VV", // custom pattern because the default is the same as the fallback patterns
				showDate: false,
				showTime: false
			});

		// all fallback instances have pattern "VV" therefore testing one is good enough
		var sDate1 = "America/New_York";
		var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
		assert.strictEqual(oParseResult1[0], undefined,
			"The timezone is provided in date string, it is used to calculate the date.");
		assert.strictEqual(oParseResult1[1], "America/New_York",
			"The timezone is provided in date string, it is used to calculate the date.");
	});
/** @deprecated As of version 1.101.0 */
sap.ui.require([
	"sap/ui/core/format/DateFormatTimezoneDisplay"
], function (DateFormatTimezoneDisplay) {
[{
	formatOptions: {showTimezone: DateFormatTimezoneDisplay.Hide},
	expected: {showDate: undefined, showTime: undefined, showTimezone: false}
}, {
	formatOptions: {showTimezone: DateFormatTimezoneDisplay.Only},
	expected: {showDate: false, showTime: false, showTimezone: true}
}, {
	formatOptions: {showTimezone: DateFormatTimezoneDisplay.Show},
	expected: {showDate: undefined, showTime: undefined, showTimezone: true}
}].forEach(function (oFixture, i) {
	QUnit.test("Mapping of deprecated format options, #" + i, function (assert) {
		// code under test
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFixture.formatOptions);

		assert.strictEqual(oDateFormat.oFormatOptions.showDate, oFixture.expected.showDate);
		assert.strictEqual(oDateFormat.oFormatOptions.showTime, oFixture.expected.showTime);
		assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, oFixture.expected.showTimezone);
	});
});

[
	{showDate: false, showTimezone: DateFormatTimezoneDisplay.Show},
	{showDate: true, showTimezone: DateFormatTimezoneDisplay.Show},
	{showTime: false, showTimezone: DateFormatTimezoneDisplay.Show},
	{showTime: true, showTimezone: DateFormatTimezoneDisplay.Show},
	{showDate: false, showTimezone: DateFormatTimezoneDisplay.Only},
	{showDate: true, showTimezone: DateFormatTimezoneDisplay.Only},
	{showTime: false, showTimezone: DateFormatTimezoneDisplay.Only},
	{showTime: true, showTimezone: DateFormatTimezoneDisplay.Only}
].forEach(function (oFormatOptions, i) {
	QUnit.test("Mapping of 'Show'/'Only' if showDate or showTime are set, #" + i, function (assert) {
		// code under test
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

		assert.strictEqual(oDateFormat.oFormatOptions.showDate, oFormatOptions.showDate);
		assert.strictEqual(oDateFormat.oFormatOptions.showTime, oFormatOptions.showTime);
		assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);
	});
});

[
	{showDate: false, showTimezone: DateFormatTimezoneDisplay.Hide},
	{showDate: true, showTimezone: DateFormatTimezoneDisplay.Hide},
	{showTime: false, showTimezone: DateFormatTimezoneDisplay.Hide},
	{showTime: true, showTimezone: DateFormatTimezoneDisplay.Hide}
].forEach(function (oFormatOptions, i) {
	QUnit.test("Mapping of 'Hide' if showDate or showTime are set, #" + i, function (assert) {
		// code under test
		var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

		assert.strictEqual(oDateFormat.oFormatOptions.showDate, oFormatOptions.showDate);
		assert.strictEqual(oDateFormat.oFormatOptions.showTime, oFormatOptions.showTime);
		assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, false);
	});
});
});
});
