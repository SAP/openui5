/*global QUnit */
sap.ui.define([
		"sap/ui/core/format/DateFormat",
		'sap/ui/core/format/DateFormatTimezoneDisplay',
		"sap/ui/core/Locale"
	],
	function (DateFormat, DateFormatTimezoneDisplay, Locale) {
		"use strict";

		QUnit.module("DateTime format", {
			beforeEach: function () {
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
			}
		});

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
			var oDateFormat;
			var oDate = new Date("2021-10-13T13:22:33Z");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy..");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy.");
		});

		QUnit.module("DateTimeWithTimezone format en-US", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("showTimezone", function (assert) {
			var oDateFormat;

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu
			var oDateEDT = new Date("2021-10-13T13:22:33Z");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 13, 2021, 9:22:33 AM America/New_York", "date was converted and timezone name was added.");

			// style medium/short
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				style: "medium/short",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 13, 2021, 9:22 AM America/New_York", "date medium and time short were converted and timezone name was added.");

			// style short/medium
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				style: "short/medium",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"10/13/21, 9:22:33 AM America/New_York", "date short and time medium were converted and timezone name was added.");


			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 13, 2021, 9:22:33 AM", "date was converted and timezone name isn't shown.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"America/New_York", "Show only timezone");
		});

		QUnit.test("format with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 12, 2021, 10:22:33 PM America/New_York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"Nov 13, 2021, 8:22:33 AM America/New_York", "date was converted and timezone name was added.");
		});

		QUnit.test("Custom format 'yMMMhVV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				format: "yMMMhVV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"Nov 2021, 8 AM America/New_York", "New timezone should be be applied.");
		});

		QUnit.test("Timezone parameter is null or undefined", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var oDateEDT = new Date("2021-10-13T13:22:33Z");

			[null, undefined].forEach(function(sTimezone) {
				assert.equal(oDateTimeWithTimezoneFormat.format(oDateEDT, sTimezone), "Oct 13, 2021, 3:22:33 PM Europe/Berlin", "default to Europe/Berlin");
			});
		});

		QUnit.module("DateTimeWithTimezone format de-DE", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("showTimezone", function (assert) {
			var oDateFormat;

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu
			var oDateEDT = new Date("2021-10-13T13:22:33Z");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"13.10.2021, 09:22:33 America/New_York", "date was converted and timezone name was added.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"13.10.2021, 09:22:33", "date was converted and timezone name isn't shown.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"America/New_York", "Show only timezone");
		});

		QUnit.test("format with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"12.10.2021, 22:22:33 America/New_York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"13.11.2021, 08:22:33 America/New_York", "date was converted and timezone name was added.");
		});

		QUnit.test("Custom format 'yMMMhVV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				format: "yMMMhVV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York").toString(),
				"Nov. 2021, 8 Uhr AM America/New_York", "New timezone should be be applied.");
		});

		QUnit.module("DateTimeWithTimezone format", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("custom pattern - no date given", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "",
				"timezone not present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "'foo'"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "",
				"timezone not present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "'foo 'VV"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "America/New_York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss' 'VV"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "America/New_York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Only"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "America/New_York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Hide"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "",
				"timezone not present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Show"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "America/New_York",
				"timezone present in pattern");
		});

		QUnit.test("invalid timezone parameter", function (assert) {
			[
				{
					showTimezone: DateFormatTimezoneDisplay.Only
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Hide
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Show
				},
				{
					pattern: "'foo'"
				}
			].forEach(function (oFormatOptions) {
				var oDateTimeWithTimezoneFormatOnly = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);
				assert.strictEqual(oDateTimeWithTimezoneFormatOnly.format(new Date(), "NotValid"), "",
					"invalid timezone parameter supplied");
			});
		});

		QUnit.test("format with showTimezone 'Show' invalid timezone", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			var oDateEDT = new Date("2021-10-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "foo"), "",
				"invalid timezone specified");
		});

		QUnit.test("Timezone parameter of improper value", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var oDateEDT = new Date("2021-10-13T13:22:33Z");

			[false, true, {}, 0].forEach(function(sTimezone) {
				assert.equal(oDateTimeWithTimezoneFormat.format(oDateEDT, sTimezone), "", "timezone not valid");
			});
		});

		QUnit.test("showTimezone 'Only' - null values", function (assert) {
			var oDateTimeWithTimezoneFormatOnly = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});

			[null, "", undefined, new Date("invalid")].forEach(function(oDate) {
				assert.equal(oDateTimeWithTimezoneFormatOnly.format(oDate, "America/New_York"), "America/New_York",
					"Timezone is displayed");
			});
		});

		QUnit.test("Custom pattern with milliseconds (SSS)", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS VV"
			});
			var oDateEDT = new Date("2021-10-13T13:22:33.456Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"2021-10-13T09:22:33.456 America/New_York", "milliseconds are shown");
		});

		QUnit.test("Custom pattern with timezone (z)", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"), "2021-11-13T08:22:33 GMT-05:00", "date was converted and new timezone should be be applied.");
			// UTC flag
			assert.deepEqual(oDateFormat.format(oDateEST, "America/New_York"), oDateFormat.format(oDateEST, "America/New_York", true), "UTC flag (true) is ignored and set to false.");
		});


		QUnit.test("Custom pattern with timezones (z, Z, x and VV)", function (assert) {
			var oDateEDT = new Date("2021-10-13T02:22:33Z");

			var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			assert.equal(oDateFormat1.format(oDateEDT, "America/New_York"),
				"2021-10-12T22:22:33 GMT-04:00 America/New_York", "timezone should be applied and all strings were added.");

			var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z Z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			assert.equal(oDateFormat2.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 GMT-04:00 -0400 America/New_York", "timezone should be applied and all strings were added.");

			var oDateFormat3 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss XX VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			assert.equal(oDateFormat3.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 -0400 America/New_York", "timezone should be applied and all strings were added.");
		});

		QUnit.test("Custom pattern with timezones (z and XX but without VV pattern)", function (assert) {
			var oDateEDT = new Date("2021-10-13T02:22:33Z");

			var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z XX",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat1.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 GMT-04:00 -0400", "Format for pattern z and XX should be added.");

			var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss XX z",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat2.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 -0400 GMT-04:00", "Format for pattern XX and z should be added.");
		});

		QUnit.module("DateTime parse", {
			beforeEach: function () {
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
			}
		});

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
			var oDateFormat;
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM";
			var iDateExpectedEDT = Date.UTC(2021, 9, 13, 9, 22, 33);

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");
		});

		QUnit.module("DateTimeWithTimezone parse en-US", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM America/New_York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
			var sDateEDT2 = "Oct 13, 2021, 10:22:33 PM America/New_York";
			var iTimestampExpectedEDT2 = new Date(Date.UTC(2021, 9, 14, 2, 22, 33));
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");
			assert.equal(oParseResultEDT2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sDateEST = "Nov 13, 2021, 8:22:33 AM America/New_York";
			var iTimestampExpectedEST = new Date(Date.UTC(2021, 10, 13, 13, 22, 33));
			var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
			assert.equal(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEST[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
			var sDateEST2 = "Nov 13, 2021, 11:22:33 PM America/New_York";
			var iTimestampExpectedEST2 = new Date(Date.UTC(2021, 10, 14, 4, 22, 33));
			var oParseResultEST2 = oDateFormat.parse(sDateEST2, "America/New_York", false, true);
			assert.equal(oParseResultEST2[0].getTime(), iTimestampExpectedEST2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date (UTC option is set to false).");
			assert.equal(oParseResultEST2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date (UTC option is set to false).");
		});

		QUnit.test("showTimezone 'Hide'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], undefined, "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.test("showTimezone 'Only'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDate1 = "America/New_York";
			var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0], undefined, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.test("showTimezone 'Show' invalid timezone", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// invalid timezone cannot be parsed
			var sDateEDT1 = "Oct 13, 2021, 9:22:33 AM foo";
			var oParseResultEDT1 = oDateFormat.parse(sDateEDT1, "foo");
			assert.equal(oParseResultEDT1, null, "timezone not valid");

			var sDateEDT = "Oct 13, 2021, 9:22:33 AM NotValid";
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT, null, "timezone not valid");
		});



		QUnit.test("showTimezone 'Show' changed timezone", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Change to Europe/Berlin (Central European Summer Time)
			// Steps:
			// * To America/New_York 9:22 + 4h diff = 13:22
			// * From America/New_York => Europe/Berlin 13:22 - 6h diff = 7:22
			var sDateCEST = "Oct 13, 2021, 9:22:33 AM Europe/Berlin";
			var iTimestampExpectedCEST = new Date(Date.UTC(2021, 9, 13, 7, 22, 33));
			var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
			assert.equal(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultCEST[1], "Europe/Berlin", "The timezone is provided in date string, it is used to calculate the date.");

			// Change to America/New_York (Eastern Daylight Time)
			// Steps:
			// * To Europe/Berlin 9:22 - 2h diff = 7:22
			// * From Europe/Berlin => America/New_York 7:22 + 6h diff = 13:22
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM America/New_York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "Europe/Berlin");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.test("showTimezone 'Show' timezone cannot be determined", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				pattern: "VVa"
			});

			// timezone string is parsed first and has no fixed values therefore it cannot be differentiated
			var sDateEDT2 = "America/New_YorkAM";
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2, null, "timezone name cannot be retrieved");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				pattern: "aVV"
			});

			// AM/PM string has values ["AM", "PM"] and is parsed first so timezone can be differentiated
			var sDateEDT3 = "AMAmerica/New_York";
			var oParseResultEDT3 = oDateFormat.parse(sDateEDT3, "America/New_York");
			assert.ok(oParseResultEDT3, "timezone name can be retrieved");
		});

		QUnit.test("no timezone in user input", function (assert) {
			var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});

			var oParseResult1 = oDateFormatWithPattern.parse("", "America/New_York");
			assert.equal(oParseResult1, null, "cannot be parsed.");

			oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});

			oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM", "America/New_York");
			assert.equal(oParseResult1[0].getTime(), Date.UTC(2021, 9, 13, 13, 22, 33), "The timezone is provided as parameter, it is used to convert the date.");
			assert.equal(oParseResult1[1], undefined, "The timezone is not provided in input string");

			oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM", "America/New_York");
			assert.equal(oParseResult1[0].getTime(), Date.UTC(2021, 9, 13, 13, 22, 33), "The timezone is provided as parameter, it is used to convert the date.");
			assert.equal(oParseResult1[1], undefined, "The timezone is not provided in input string");

			oParseResult1 = oDateFormatWithPattern.parse("Oct 13, 2021, 9:22:33 AM meh", "America/New_York");
			assert.equal(oParseResult1, null, "cannot be parsed.");
		});

		QUnit.test("Timezone parameter is null or undefined", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var sDate = "Oct 13, 2021, 9:22:33 AM America/New_York";
			var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 13, 22, 33, 0);

			[null, undefined].forEach(function(sTimezone) {
				assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, sTimezone), [new Date(iTimestampExpectedEDT), "America/New_York"], "use the timezone from the parsed string");
			});
		});

		QUnit.module("DateTimeWithTimezone parse de-DE", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "13.10.2021, 09:22:33 America/New_York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
			var sDateEDT2 = "13.10.2021, 22:22:33 America/New_York";
			var iTimestampExpectedEDT2 = new Date(Date.UTC(2021, 9, 14, 2, 22, 33));
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");
			assert.equal(oParseResultEDT2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sDateEST = "13.11.2021, 08:22:33 America/New_York";
			var iTimestampExpectedEST = new Date(Date.UTC(2021, 10, 13, 13, 22, 33));
			var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
			assert.equal(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEST[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
			var sDateEST2 = "13.11.2021, 23:22:33 America/New_York";
			var iTimestampExpectedEST2 = new Date(Date.UTC(2021, 10, 14, 4, 22, 33));
			var oParseResultEST2 = oDateFormat.parse(sDateEST2, "America/New_York", false, true);
			assert.equal(oParseResultEST2[0].getTime(), iTimestampExpectedEST2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date (UTC option is set to false).");
			assert.equal(oParseResultEST2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date (UTC option is set to false).");
		});

		QUnit.test("showTimezone 'Hide'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "13.10.2021, 09:22:33";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], undefined, "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.test("showTimezone 'Only'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDate1 = "America/New_York";
			var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0], undefined, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.test("showTimezone 'Show' invalid timezone", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// invalid timezone is interpreted as UTC and is not converted
			var sDateEDT1 = "13.10.2021, 09:22:33 foo";
			var oParseResultEDT1 = oDateFormat.parse(sDateEDT1, "foo");
			assert.equal(oParseResultEDT1, null, "timezone name cannot be retrieved");

			var sDateEDT = "13.10.2021, 09:22:33 NotValid";
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT, null, "timezone name cannot be retrieved");
		});



		QUnit.test("showTimezone 'Show' changed timezone", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Change to Europe/Berlin (Central European Summer Time)
			// Steps:
			// * To America/New_York 9:22 + 4h diff = 13:22
			// * From America/New_York => Europe/Berlin 13:22 - 6h diff = 7:22
			var sDateCEST = "13.10.2021, 09:22:33 Europe/Berlin";
			var iTimestampExpectedCEST = new Date(Date.UTC(2021, 9, 13, 7, 22, 33));
			var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
			assert.equal(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultCEST[1], "Europe/Berlin", "The timezone is provided in date string, it is used to calculate the date.");

			// Change to America/New_York (Eastern Daylight Time)
			// Steps:
			// * To Europe/Berlin 9:22 - 2h diff = 7:22
			// * From Europe/Berlin => America/New_York 7:22 + 6h diff = 13:22
			var sDateEDT = "13.10.2021, 09:22:33 America/New_York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "Europe/Berlin");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.module("DateTimeWithTimezone parse");

		QUnit.test("custom pattern", function (assert) {
			var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss"
			});

			var sDate1 = "2021-10-13T13:22:33";
			var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
			var oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], undefined);


			oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
			});

			sDate1 = "2021-10-13T13:22:33 America/New_York";
			iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
			oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], "America/New_York");

			oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "VV"
			});

			sDate1 = "America/New_York";
			iTimestampExpectedEDT = Date.UTC(1970, 0, 1, 5);
			oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0].getTime(), iTimestampExpectedEDT, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], "America/New_York");
		});

		QUnit.test("formatted input string is null", function (assert) {
			[
				{
					showTimezone: DateFormatTimezoneDisplay.Only
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Hide
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Show
				},
				{
					pattern: "'foo'"
				}
			].forEach(function (oFormatOptions) {
				var oDateTimeWithTimezoneFormatOnly = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);

				assert.strictEqual(oDateTimeWithTimezoneFormatOnly.parse(null, "America/New_York"), null,
					"cannot be parsed");
			});
		});

		QUnit.test("invalid timezone parameter", function (assert) {
			[
				{
					showTimezone: DateFormatTimezoneDisplay.Only
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Hide
				},
				{
					showTimezone: DateFormatTimezoneDisplay.Show
				},
				{
					pattern: "'foo'"
				}
			].forEach(function (oFormatOptions) {
				var oDateTimeWithTimezoneFormatOnly = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);
				assert.strictEqual(oDateTimeWithTimezoneFormatOnly.parse("2021-10-13T13:22:33 America/New_York", "NotValid"), null,
					"invalid timezone parameter supplied");
			});
		});

		QUnit.test("showTimezone 'Only'", function (assert) {
			var oDateFormatWithPattern = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only,
				pattern: "yyyy-MM-dd'T'HH:mm:ss"
			});

			var sDate1 = "2021-10-13T13:22:33";
			var oParseResult1 = oDateFormatWithPattern.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0], undefined, "The timezone is provided in date string, it is used to calculate the date.");
			assert.notOk(oParseResult1[1], "timezone not part of the pattern");
		});

		QUnit.test("showTimezone 'Show' strict", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
			});

			// 61  seconds
			var sDateEDT = "2021-10-13T13:22:61 America/New_York";

			assert.ok(oDateFormat.parse(sDateEDT, "America/New_York", false), "strict with 61  seconds will result in null");
			assert.ok(oDateFormat.parse(sDateEDT, "America/New_York"), "strict with 61  seconds will result in null");
			assert.notOk(oDateFormat.parse(sDateEDT, "America/New_York", true), "strict with 61  seconds will result in null");
		});

		QUnit.test("Timezone parameter of improper value", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var sDate = "Oct 13, 2021, 9:22:33 AM America/New_York";

			[false, true, {}, 0].forEach(function(sTimezone) {
				assert.equal(oDateTimeWithTimezoneFormat.parse(sDate, sTimezone), null, "timezone not valid");
			});
		});

		QUnit.test("Combination with pattern: z and VV, last pattern is used", function (assert) {
			var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "2021-10-13T13:22:33 GMT+02:00 America/New_York";
			var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
			var oParseResultEDT = oDateFormat1.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT, "Offset of the last pattern (VV) is applied.");
			assert.equal(oParseResultEDT[1], "America/New_York", "Offset of the last pattern symbol (VV) is applied.");

			var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss VV z",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			var sDateEDT2 = "2021-10-13T13:22:33 America/New_York GMT+02:00";
			var iTimestampExpectedEDT2 = Date.UTC(2021, 9, 13, 11, 22, 33, 0);
			var oParseResultEDT2 = oDateFormat2.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2, "Offset of the last pattern (z) is applied.");
			assert.equal(oParseResultEDT2[1], "America/New_York", "Offset of the last pattern symbol (z) is applied.");

			var oDateFormat3 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			var sDateEDT3 = "2021-10-13T13:22:33 GMT+02:00";
			var iTimestampExpectedEDT3 = Date.UTC(2021, 9, 13, 11, 22, 33, 0);
			var oParseResultEDT3 = oDateFormat3.parse(sDateEDT3, "America/New_York");
			assert.equal(oParseResultEDT3[0].getTime(), iTimestampExpectedEDT3, "Offset of the last pattern (z) is applied.");
			assert.notOk(oParseResultEDT3[1], "timezone not part of the pattern");
		});


		QUnit.module("DateTimeWithTimezone integration - format and parse de-DE", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("Timezone parameter is null", function (assert) {
			var oDate = new Date("2021-10-13T02:22:33Z");
			var oLocale = new Locale("de");

			// Default
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(oLocale);

			var sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "13.10.2021, 04:22:33 Europe/Berlin", "Fallback timezone should be be applied.");

			var oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], oDate, "dates match");
			assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

			// Show
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: DateFormatTimezoneDisplay.Show}, oLocale);

			sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "13.10.2021, 04:22:33 Europe/Berlin", "Fallback timezone should be be applied.");

			oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], oDate, "dates match");
			assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

			// Only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: DateFormatTimezoneDisplay.Only}, oLocale);

			sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "Europe/Berlin", "Fallback timezone should be be applied.");

			oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], undefined, "dates match");
			assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

			// Hide
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: DateFormatTimezoneDisplay.Hide}, oLocale);

			sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "13.10.2021, 04:22:33", "Fallback timezone should be be applied.");

			oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], oDate, "dates match");
			assert.deepEqual(oParsedDate[1], undefined, "timezone match");
		});

		QUnit.module("DateTimeWithTimezone integration - format and parse");

		QUnit.test("timezone handling timezone position in pattern (fa and zh_CN)", function (assert) {
			var oDate = new Date("2021-10-13T02:22:33Z");

			// fa.json, timezone append pattern: "{0} ({1})"
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("fa"));

			var sFormattedFA = oDateFormat.format(oDate, "America/New_York");
			assert.equal(sFormattedFA, "12 اکتبر 2021،‏ 22:22:33 (America/New_York)", "New timezone should be be applied.");

			var oParsedDateFA = oDateFormat.parse(sFormattedFA, "America/New_York");
			assert.deepEqual(oDate, oParsedDateFA[0], "dates match");
			assert.equal(oDate.getTime(), oParsedDateFA[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateFA[1], "America/New_York");
			assert.deepEqual(oDateFormat.format(oParsedDateFA[0], oParsedDateFA[1]), sFormattedFA, "parsed results are passed to format");

			// zh_CN.json, timezone append pattern: "{1}{0}"
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("zh_CN"));

			var sFormattedZH = oDateFormat.format(oDate, "America/New_York");
			assert.equal(sFormattedZH, "America/New_York2021年10月12日 下午10:22:33", "New timezone should be be applied.");

			var oParsedDateZH = oDateFormat.parse(sFormattedZH, "America/New_York");
			assert.deepEqual(oDate, oParsedDateZH[0], "dates match");
			assert.equal(oDate.getTime(), oParsedDateZH[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateZH[1], "America/New_York");
			assert.deepEqual(oDateFormat.format(oParsedDateZH[0], oParsedDateZH[1]), sFormattedZH, "parsed results are passed to format");
		});

		QUnit.test("timezone handling with z and VV pattern, last pattern is used", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			var oDateEDT = new Date("2021-10-13T02:22:33Z");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sFormattedEDT = oDateFormat.format(oDateEDT, "America/New_York");
			assert.equal(sFormattedEDT, "2021-10-12T22:22:33 GMT-04:00 America/New_York", "New timezone should be be applied.");

			var oParsedDateEDT = oDateFormat.parse(sFormattedEDT, "America/New_York");
			assert.deepEqual(oDateEDT, oParsedDateEDT[0], "dates match");
			assert.equal(oDateEDT.getTime(), oParsedDateEDT[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateEDT[1], "America/New_York");

			assert.deepEqual(oDateFormat.format(oParsedDateEDT[0], oParsedDateEDT[1]), sFormattedEDT, "parsed results are passed to format");


			var oDateEST = new Date("2021-11-13T02:22:33Z");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sFormattedEST = oDateFormat.format(oDateEST, "America/New_York");
			assert.equal(sFormattedEST, "2021-11-12T21:22:33 GMT-05:00 America/New_York", "New timezone should be be applied.");

			var oParsedDateEST = oDateFormat.parse(sFormattedEST, "America/New_York");
			assert.deepEqual(oDateEST, oParsedDateEST[0], "dates match");
			assert.equal(oDateEST.getTime(), oParsedDateEST[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateEST[1], "America/New_York");

			assert.deepEqual(oDateFormat.format(oParsedDateEST[0], oParsedDateEST[1]), sFormattedEST, "parsed results are passed to format");

		});

		QUnit.test("timezone handling without timezone in pattern", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			var oDateEDT = new Date("2021-10-13T02:22:33Z");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sFormattedEDT = oDateFormat.format(oDateEDT, "America/New_York");
			assert.equal(sFormattedEDT, "2021-10-12T22:22:33", "New timezone does not get applied.");

			var oParsedDateEDT = oDateFormat.parse(sFormattedEDT, "America/New_York");
			assert.deepEqual(oDateEDT, oParsedDateEDT[0], "dates match");
			assert.equal(oDateEDT.getTime(), oParsedDateEDT[0].getTime(), "timestamp matches");
			assert.notOk(oParsedDateEDT[1], "timezone not part of the pattern");


			var oDateEST = new Date("2021-11-13T02:22:33Z");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sFormattedEST = oDateFormat.format(oDateEST, "America/New_York");
			assert.equal(sFormattedEST, "2021-11-12T21:22:33", "New timezone should be be applied.");

			var oParsedDateEST = oDateFormat.parse(sFormattedEST, "America/New_York");
			assert.deepEqual(oDateEST, oParsedDateEST[0], "dates match");
			assert.equal(oDateEST.getTime(), oParsedDateEST[0].getTime(), "timestamp matches");
			assert.notOk(oParsedDateEST[1], "timezone not part of the pattern");
		});


		QUnit.module("DateTimeWithTimezone getDateTimeWithTimezoneInstance en-US", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
				sap.ui.getCore().getConfiguration().setTimezone();
			}
		});

		QUnit.test("Fallback instances patterns", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
			assert.equal(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "M/d/yy, h:mm a VV", "Short pattern should contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "MMM d, y, h:mm:ss a VV", "Medium pattern should contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss VV", "Default pattern should contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "yyyyMMdd HHmmss VV", "Default pattern without delimiter should contain timezone symbol.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
			assert.equal(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "VV", "Short pattern should only contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "VV", "Medium pattern should only contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "VV", "Default pattern should only contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "VV", "Default pattern without delimiter should only contain timezone symbol.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.aFallbackFormats.length, 4, "Should contain 4 instances.");
			assert.equal(oDateFormat.aFallbackFormats[0].oFormatOptions.pattern, "M/d/yy, h:mm a", "Short pattern should not contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[1].oFormatOptions.pattern, "MMM d, y, h:mm:ss a", "Medium pattern should not contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[2].oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss", "Default pattern should not contain timezone symbol.");
			assert.equal(oDateFormat.aFallbackFormats[3].oFormatOptions.pattern, "yyyyMMdd HHmmss", "Default pattern without delimiter should not contain timezone symbol.");
		});

		QUnit.test("Fallback parse with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// input and expectation for different fallback patterns
			[
				{
					input: "10/13/21, 9:22 AM America/New_York", // M/d/yy, h:mm a VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 0))
				},
				{
					input: "Oct 13, 21, 9:22:33 AM America/New_York", // MMM d, y, h:mm:ss a VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "2021-10-13T09:22:33 America/New_York", // yyyy-MM-dd'T'HH:mm:ss VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "20211013 092233 America/New_York", // yyyyMMdd HHmmss VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				}
			].forEach(function(oFixture) {
				var oParseResultEDT = oDateFormat.parse(oFixture.input, "America/New_York");
				assert.equal(oParseResultEDT[0].getTime(), oFixture.expectedDate.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
				assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");
			});
		});

		QUnit.test("Fallback parse with showTimezone 'Hide'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			// input and expectation for different fallback patterns
			[
				{
					input: "10/13/21, 9:22 AM", // M/d/yy, h:mm a
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 0))
				},
				{
					input: "Oct 13, 21, 9:22:33 AM", // MMM d, y, h:mm:ss a
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "2021-10-13T09:22:33", // yyyy-MM-dd'T'HH:mm:ss
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "20211013 092233", // yyyyMMdd HHmmss
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				}
			].forEach(function(oFixture) {
				var oParseResultEDT = oDateFormat.parse(oFixture.input, "America/New_York");
				assert.equal(oParseResultEDT[0].getTime(), oFixture.expectedDate.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
				assert.equal(oParseResultEDT[1], undefined, "The timezone is provided in date string and parameter, it is used to calculate the date.");
			});
		});

		QUnit.test("Fallback parse with showTimezone 'Only'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only,
				pattern: "a VV" // custom pattern because the default is the same as the fallback patterns
			});

			// all fallback instances have pattern "VV" therefore testing one is good enough

			var sDate1 = "America/New_York";
			var oParseResult1 = oDateFormat.parse(sDate1, "America/New_York");
			assert.equal(oParseResult1[0], undefined, "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResult1[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});
	}
);
