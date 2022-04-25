/*global QUnit */
sap.ui.define([
		"sap/ui/core/format/DateFormat",
		'sap/ui/core/format/DateFormatTimezoneDisplay',
		"sap/ui/core/LocaleData",
		"sap/ui/core/Locale"
	],
	function (DateFormat, DateFormatTimezoneDisplay, LocaleData, Locale) {
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

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy (backward compatibility)", function (assert) {
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

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
			var oDateFormat;
			var oDate = new Date("2021-10-13T13:22:33Z");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showDate: true,
				showTime: true
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: false,
				showDate: true,
				showTime: true
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy..");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showDate: false,
				showTime: false
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
				"showTimezone parameter is ignored and bUTC parameter is truthy.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showDate: false,
				showTime: true
			});
			assert.equal(oDateFormat.format(oDate, "America/New_York"), "Oct 13, 2021, 1:22:33 PM",
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

		QUnit.test("mixed configuration showDate, showTime and showTimezone (string/boolean)", function (assert) {
			var oDateFormat;

			// showTimezone (string), showDate and showTime unset
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, false);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, false);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, false);

			// showTimezone "Show", showDate and showTime set (boolean)

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showTime: false
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, false);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showDate: true
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, true);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			// showTimezone "Only", showDate and showTime set (boolean)

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only,
				showTime: false
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, false);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only,
				showDate: true
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, true);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, true);

			// showTimezone "Hide", showDate and showTime set (boolean)

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide,
				showTime: false
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, false);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, false);

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide,
				showDate: true
			});

			assert.strictEqual(oDateFormat.oFormatOptions.showTime, undefined);
			assert.strictEqual(oDateFormat.oFormatOptions.showDate, true);
			assert.strictEqual(oDateFormat.oFormatOptions.showTimezone, false);
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
				"Oct 13, 2021, 9:22:33 AM Americas, New York", "date was converted and timezone name was added.");

			// style medium/short
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				style: "medium/short",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 13, 2021, 9:22 AM Americas, New York", "date medium and time short were converted and timezone name was added.");

			// style short/medium
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				style: "short/medium",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"10/13/21, 9:22:33 AM Americas, New York", "date short and time medium were converted and timezone name was added.");


			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 13, 2021, 9:22:33 AM", "date was converted and timezone name isn't shown.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Americas, New York", "Show only timezone");
		});

		QUnit.test("format with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 12, 2021, 10:22:33 PM Americas, New York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"Nov 13, 2021, 8:22:33 AM Americas, New York", "date was converted and timezone name was added.");
		});

		QUnit.test("format with showTimezone 'Show' and showTime: false", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showTime: false
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Oct 12, 2021 Americas, New York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"Nov 13, 2021 Americas, New York", "date was converted and timezone name was added.");
		});

		QUnit.test("format with showTimezone 'Show' and showDate: false", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showDate: false
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"10:22:33 PM Americas, New York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"8:22:33 AM Americas, New York", "date was converted and timezone name was added.");
		});

		QUnit.test("Custom format 'yMMMhVV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				format: "yMMMhVV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"Nov 2021, 8 AM Americas, New York", "New timezone should be be applied.");
		});

		QUnit.test("Timezone parameter is empty string, null or undefined", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var oDateEDT = new Date("2021-10-13T13:22:33Z");

			assert.equal(oDateTimeWithTimezoneFormat.format(oDateEDT, ""), "Oct 13, 2021, 3:22:33 PM Europe, Berlin", "default to Europe, Berlin");
			assert.equal(oDateTimeWithTimezoneFormat.format(oDateEDT, null), "Oct 13, 2021, 3:22:33 PM Europe, Berlin", "default to Europe, Berlin");
			assert.equal(oDateTimeWithTimezoneFormat.format(oDateEDT, undefined), "Oct 13, 2021, 3:22:33 PM Europe, Berlin", "default to Europe, Berlin");
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
				"13.10.2021, 09:22:33 Amerika, New York", "date was converted and timezone name was added.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Hide
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"13.10.2021, 09:22:33", "date was converted and timezone name isn't shown.");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"Amerika, New York", "Show only timezone");
		});

		QUnit.test("format with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"12.10.2021, 22:22:33 Amerika, New York", "date was converted and timezone name was added.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York"),
				"13.11.2021, 08:22:33 Amerika, New York", "date was converted and timezone name was added.");
		});

		QUnit.test("Custom format 'yMMMhVV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				format: "yMMMhVV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			assert.equal(oDateFormat.format(oDateEST, "America/New_York").toString(),
				"Nov. 2021, 8 Uhr AM Amerika, New York", "New timezone should be be applied.");
		});

		QUnit.module("DateTimeWithTimezone format", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setTimezone("Europe/Berlin");
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore default locale and timezone
				sap.ui.getCore().getConfiguration().setTimezone();
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
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
			assert.equal(oDateFormat.format(null, "America/New_York"), "Americas, New York",
				"timezone present in pattern");

			assert.equal(oDateFormat.format(null, "Australia/Queensland"), "Australia/Queensland",
				"timezone present in pattern (no translation available, but valid timezone)");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss' 'VV"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "Americas, New York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Only"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "Americas, New York",
				"timezone present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Hide"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "",
				"timezone not present in pattern");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: "Show"
			});
			assert.equal(oDateFormat.format(null, "America/New_York"), "Americas, New York",
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

			[true, false, 0, 1, {}].forEach(function(sTimezone) {
				assert.throws(function() {
					oDateTimeWithTimezoneFormat.format(oDateEDT, sTimezone);
				}, new TypeError("The given timezone must be a string."), "timezone not valid for '" + sTimezone + "'");
			});
		});

		QUnit.test("showTimezone 'Only' - null values", function (assert) {
			var oDateTimeWithTimezoneFormatOnly = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Only
			});

			[null, "", undefined, new Date("invalid")].forEach(function(oDate) {
				assert.equal(oDateTimeWithTimezoneFormatOnly.format(oDate, "America/New_York"), "Americas, New York",
					"Timezone is displayed");
			});
		});

		QUnit.test("Custom pattern with milliseconds (SSS)", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS VV"
			});
			var oDateEDT = new Date("2021-10-13T13:22:33.456Z");
			assert.equal(oDateFormat.format(oDateEDT, "America/New_York"),
				"2021-10-13T09:22:33.456 Americas, New York", "milliseconds are shown");
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
				"2021-10-12T22:22:33 GMT-04:00 Americas, New York", "timezone should be applied and all strings were added.");

			var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z Z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			assert.equal(oDateFormat2.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 GMT-04:00 -0400 Americas, New York", "timezone should be applied and all strings were added.");

			var oDateFormat3 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss XX VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			assert.equal(oDateFormat3.format(oDateEDT, "America/New_York"), "2021-10-12T22:22:33 -0400 Americas, New York", "timezone should be applied and all strings were added.");
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

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy (backward compatibility)", function (assert) {
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

		QUnit.test("showTimezone format option parameter is ignored and bUTC parameter is truthy", function (assert) {
			var oDateFormat;
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM";
			var iDateExpectedEDT = Date.UTC(2021, 9, 13, 9, 22, 33);

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showTime: true,
				showDate: true
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance();
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: false,
				showTime: true,
				showDate: true
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showTime: false,
				showDate: false
			});
			assert.equal(oDateFormat.parse(sDateEDT, "America/New_York").getTime(), iDateExpectedEDT, "Timezone and showTimezone parameters are ignored.");

			oDateFormat = DateFormat.getDateTimeInstance({
				showTimezone: true,
				showTime: true,
				showDate: false
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
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM Americas, New York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
			var sDateEDT2 = "Oct 13, 2021, 10:22:33 PM Americas, New York";
			var iTimestampExpectedEDT2 = new Date(Date.UTC(2021, 9, 14, 2, 22, 33));
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");
			assert.equal(oParseResultEDT2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sDateEST = "Nov 13, 2021, 8:22:33 AM Americas, New York";
			var iTimestampExpectedEST = new Date(Date.UTC(2021, 10, 13, 13, 22, 33));
			var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
			assert.equal(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEST[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
			var sDateEST2 = "Nov 13, 2021, 11:22:33 PM Americas, New York";
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
			// Change to Europe, Berlin (Central European Summer Time)
			// Steps:
			// * To Americas, New York 9:22 + 4h diff = 13:22
			// * From Americas, New York => Europe, Berlin 13:22 - 6h diff = 7:22
			var sDateCEST = "Oct 13, 2021, 9:22:33 AM Europe, Berlin";
			var iTimestampExpectedCEST = new Date(Date.UTC(2021, 9, 13, 7, 22, 33));
			var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
			assert.equal(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultCEST[1], "Europe/Berlin", "The timezone is provided in date string, it is used to calculate the date.");

			// Change to Americas, New York (Eastern Daylight Time)
			// Steps:
			// * To Europe, Berlin 9:22 - 2h diff = 7:22
			// * From Europe, Berlin => Americas, New York 7:22 + 6h diff = 13:22
			var sDateEDT = "Oct 13, 2021, 9:22:33 AM Americas, New York";
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
			var sDateEDT2 = "Americas, New YorkAM";
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.ok(oParseResultEDT2, "timezone namecan be retrieved");

			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				pattern: "aVV"
			});

			// AM/PM string has values ["AM", "PM"] and is parsed first so timezone can be differentiated
			var sDateEDT3 = "AMAmericas, New York";
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

		QUnit.test("Timezone parameter is empty string, null or undefined", function (assert) {
			var oDateTimeWithTimezoneFormat = DateFormat.getDateTimeWithTimezoneInstance();
			var sDate = "Oct 13, 2021, 9:22:33 AM Americas, New York";
			var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 13, 22, 33, 0);

			assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, ""), [new Date(iTimestampExpectedEDT), "America/New_York"], "use the timezone from the parsed string");
			assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, null), [new Date(iTimestampExpectedEDT), "America/New_York"], "use the timezone from the parsed string");
			assert.deepEqual(oDateTimeWithTimezoneFormat.parse(sDate, undefined), [new Date(iTimestampExpectedEDT), "America/New_York"], "use the timezone from the parsed string");
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
			var sDateEDT = "13.10.2021, 09:22:33 Amerika, New York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT) (change to next day)
			var sDateEDT2 = "13.10.2021, 22:22:33 Amerika, New York";
			var iTimestampExpectedEDT2 = new Date(Date.UTC(2021, 9, 14, 2, 22, 33));
			var oParseResultEDT2 = oDateFormat.parse(sDateEDT2, "America/New_York");
			assert.equal(oParseResultEDT2[0].getTime(), iTimestampExpectedEDT2.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");
			assert.equal(oParseResultEDT2[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date and the day changes to yesterday.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sDateEST = "13.11.2021, 08:22:33 Amerika, New York";
			var iTimestampExpectedEST = new Date(Date.UTC(2021, 10, 13, 13, 22, 33));
			var oParseResultEST = oDateFormat.parse(sDateEST, "America/New_York");
			assert.equal(oParseResultEST[0].getTime(), iTimestampExpectedEST.getTime(), "The timezone is provided in date string and parameter, it is used to calculate the date.");
			assert.equal(oParseResultEST[1], "America/New_York", "The timezone is provided in date string and parameter, it is used to calculate the date.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST) (change to next day)
			var sDateEST2 = "13.11.2021, 23:22:33 Amerika, New York";
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
			// Change to Europe, Berlin (Central European Summer Time)
			// Steps:
			// * To Americas, New York 9:22 + 4h diff = 13:22
			// * From Americas, New York => Europe, Berlin 13:22 - 6h diff = 7:22
			var sDateCEST = "13.10.2021, 09:22:33 Europa, Berlin";
			var iTimestampExpectedCEST = new Date(Date.UTC(2021, 9, 13, 7, 22, 33));
			var oParseResultCEST = oDateFormat.parse(sDateCEST, "America/New_York");
			assert.equal(oParseResultCEST[0].getTime(), iTimestampExpectedCEST.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultCEST[1], "Europe/Berlin", "The timezone is provided in date string, it is used to calculate the date.");

			// Change to Americas, New York (Eastern Daylight Time)
			// Steps:
			// * To Europe, Berlin 9:22 - 2h diff = 7:22
			// * From Europe, Berlin => Americas, New York 7:22 + 6h diff = 13:22
			var sDateEDT = "13.10.2021, 09:22:33 Amerika, New York";
			var iTimestampExpectedEDT = new Date(Date.UTC(2021, 9, 13, 13, 22, 33));
			var oParseResultEDT = oDateFormat.parse(sDateEDT, "Europe/Berlin");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT.getTime(), "The timezone is provided in date string, it is used to calculate the date.");
			assert.equal(oParseResultEDT[1], "America/New_York", "The timezone is provided in date string, it is used to calculate the date.");
		});

		QUnit.module("DateTimeWithTimezone parse", {
			beforeEach: function () {
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore locale
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
			}
		});

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

			sDate1 = "2021-10-13T13:22:33 Americas, New York";
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
				assert.strictEqual(oDateTimeWithTimezoneFormatOnly.parse("2021-10-13T13:22:33 Americas, New York", "NotValid"), null,
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
			var sDateEDT = "2021-10-13T13:22:61 Americas, New York";

			assert.ok(oDateFormat.parse(sDateEDT, "America/New_York", false), "strict with 61  seconds will result in null");
			assert.ok(oDateFormat.parse(sDateEDT, "America/New_York"), "strict with 61  seconds will result in null");
			assert.notOk(oDateFormat.parse(sDateEDT, "America/New_York", true), "strict with 61  seconds will result in null");
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
			var oDateFormat1 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss z VV",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var sDateEDT = "2021-10-13T13:22:33 GMT+02:00 Americas, New York";
			var iTimestampExpectedEDT = Date.UTC(2021, 9, 13, 17, 22, 33, 0);
			var oParseResultEDT = oDateFormat1.parse(sDateEDT, "America/New_York");
			assert.equal(oParseResultEDT[0].getTime(), iTimestampExpectedEDT, "Offset of the last pattern (VV) is applied.");
			assert.equal(oParseResultEDT[1], "America/New_York", "Offset of the last pattern symbol (VV) is applied.");

			var oDateFormat2 = DateFormat.getDateTimeWithTimezoneInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss VV z",
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			var sDateEDT2 = "2021-10-13T13:22:33 Americas, New York GMT+02:00";
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
			assert.equal(sFormatted, "13.10.2021, 04:22:33 Europa, Berlin", "Fallback timezone should be be applied.");

			var oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], oDate, "dates match");
			assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

			// Show
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: DateFormatTimezoneDisplay.Show}, oLocale);

			sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "13.10.2021, 04:22:33 Europa, Berlin", "Fallback timezone should be be applied.");

			oParsedDate = oDateFormat.parse(sFormatted, null);
			assert.deepEqual(oParsedDate[0], oDate, "dates match");
			assert.deepEqual(oParsedDate[1], "Europe/Berlin", "timezone match");

			// Only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({showTimezone: DateFormatTimezoneDisplay.Only}, oLocale);

			sFormatted = oDateFormat.format(oDate, null);
			assert.equal(sFormatted, "Europa, Berlin", "Fallback timezone should be be applied.");

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

		QUnit.module("DateTimeWithTimezone integration - format and parse", {
			beforeEach: function () {
				this.sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en_US");
			},
			afterEach: function () {
				// Restore locale
				sap.ui.getCore().getConfiguration().setLanguage(this.sLanguage);
			}
		});

		["ar", "he", "tr", "de", "en", "uk", "th", "zh_TW", "zh_CN"].forEach(function(sLocale) {
			var oDate = new Date("2021-10-13T02:22:33Z");
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
			var oDate = new Date("2021-10-04T02:22:33Z");
			var oLocale = new Locale("tr");

			// dayName and timezone translation partial overlap
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VV E HH:mm:ss d MMM y"}, oLocale);
			// (E) Paz
			// (VV) Amerika, La Paz
			var sFormatted = oDateFormat.format(oDate, "America/La_Paz");
			assert.equal(sFormatted, "Amerika, La Paz Paz 22:22:33 3 Eki 2021");
			var oParsed = oDateFormat.parse(sFormatted, "America/La_Paz");
			assert.ok(oParsed, "can be parsed");
			assert.deepEqual(oParsed[0], oDate, "parsed date matches");
			assert.equal(oParsed[1], "America/La_Paz", "parsed timezone matches");

			// hour and timezone translation partial overlap
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({pattern: "VV H:mm:ss d MMM y"}, new Locale("de"));
			// (H) 1
			// (VV) GMT+1
			sFormatted = oDateFormat.format(oDate, "Etc/GMT+1");
			assert.equal(sFormatted, "GMT+1 1:22:33 4 Okt. 2021");
			oParsed = oDateFormat.parse(sFormatted, "Etc/GMT+1");
			assert.deepEqual(oParsed, [oDate, "Etc/GMT+1"], "parsed date and timezone match for GMT+1 and Hour 1");

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
			assert.equal(sFormatted, "4 Eki 2021 05:22:33 Avrupa, İstanbul", "correctly formatted");
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
				assert.equal(oParsed[1], sTimezone, "Timezone match");
			});
		});

		QUnit.test("format and parse with showTimezone 'Show' and showTime: false", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showTime: false
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			var sFormatted = oDateFormat.format(oDateEDT, "America/New_York");
			assert.equal(sFormatted,
				"Oct 12, 2021 Americas, New York", "date was converted and timezone name was added.");
			assert.throws(function () {
				oDateFormat.parse(sFormatted, "America/New_York");
			}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));


			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			var sFormatted = oDateFormat.format(oDateEST, "America/New_York");
			assert.equal(sFormatted,
				"Nov 13, 2021 Americas, New York", "date was converted and timezone name was added.");
			assert.throws(function () {
				oDateFormat.parse(sFormatted, "America/New_York");
			}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));
		});

		QUnit.test("format and parse with showTimezone 'Show' and showDate: false", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show,
				showDate: false
			});

			// Timezone difference UTC-4 (Eastern Daylight Time - EDT), UTC Zulu, EDT Eastern Daylight Time
			var oDateEDT = new Date("2021-10-13T02:22:33Z");
			var sFormatted = oDateFormat.format(oDateEDT, "America/New_York");
			assert.equal(sFormatted,
				"10:22:33 PM Americas, New York", "date was converted and timezone name was added.");
			assert.throws(function () {
				oDateFormat.parse(sFormatted, "America/New_York");
			}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));

			// Timezone difference UTC-5 (Eastern Standard Time - EST), UTC Zulu, EST Eastern Standard Time
			var oDateEST = new Date("2021-11-13T13:22:33Z");
			var sFormatted = oDateFormat.format(oDateEST, "America/New_York");
			assert.equal(sFormatted,
				"8:22:33 AM Americas, New York", "date was converted and timezone name was added.");
			assert.throws(function () {
				oDateFormat.parse(sFormatted, "America/New_York");
			}, new TypeError("The input can only be parsed back to date if both date and time are supplied."));
		});

		QUnit.test("timezone handling timezone position in pattern (fa and zh_CN)", function (assert) {
			var oDate = new Date("2021-10-13T02:22:33Z");

			// fa.json, timezone append pattern: "{0} ({1})"
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("fa"));

			var sFormattedFA = oDateFormat.format(oDate, "America/New_York");
			assert.equal(sFormattedFA, "12 اکتبر 2021،‏ 22:22:33 (امریکا, نیویورک)", "New timezone should be be applied.");

			var oParsedDateFA = oDateFormat.parse(sFormattedFA, "America/New_York");
			assert.deepEqual(oDate, oParsedDateFA[0], "dates match");
			assert.equal(oDate.getTime(), oParsedDateFA[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateFA[1], "America/New_York");
			assert.deepEqual(oDateFormat.format(oParsedDateFA[0], oParsedDateFA[1]), sFormattedFA, "parsed results are passed to format");

			// zh_CN.json, timezone append pattern: "{1}{0}"
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance(new Locale("zh_CN"));

			var sFormattedZH = oDateFormat.format(oDate, "America/New_York");
			assert.equal(sFormattedZH, "美洲, 纽约 2021年10月12日 下午10:22:33", "New timezone should be be applied.");

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
			assert.equal(sFormattedEDT, "2021-10-12T22:22:33 GMT-04:00 Americas, New York", "New timezone should be be applied.");

			var oParsedDateEDT = oDateFormat.parse(sFormattedEDT, "America/New_York");
			assert.deepEqual(oDateEDT, oParsedDateEDT[0], "dates match");
			assert.equal(oDateEDT.getTime(), oParsedDateEDT[0].getTime(), "timestamp matches");
			assert.equal(oParsedDateEDT[1], "America/New_York");

			assert.deepEqual(oDateFormat.format(oParsedDateEDT[0], oParsedDateEDT[1]), sFormattedEDT, "parsed results are passed to format");


			var oDateEST = new Date("2021-11-13T02:22:33Z");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var sFormattedEST = oDateFormat.format(oDateEST, "America/New_York");
			assert.equal(sFormattedEST, "2021-11-12T21:22:33 GMT-05:00 Americas, New York", "New timezone should be be applied.");

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

		QUnit.test("Fallback instances patterns (backward compatible case)", function (assert) {
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

		QUnit.test("Fallback instances patterns", function (assert) {
			var extractPatterns = function(aFallbackFormats) {
				return aFallbackFormats.map(function(oFallbackFormat) {
					return oFallbackFormat.oFormatOptions.pattern;
				});
			};

			// Date, time and timezone (default)
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: true,
				showTime: true,
				showDate: true
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"M/d/yy, h:mm a VV",
				"MMM d, y, h:mm:ss a VV",
				"yyyy-MM-dd'T'HH:mm:ss VV",
				"yyyyMMdd HHmmss VV"
			], "Date, time and timezone fallback patterns should match");

			// Timezone only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: true,
				showTime: false,
				showDate: false
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"VV",
				"VV",
				"VV",
				"VV"
			], "Timezone only fallback patterns should match");

			// Date and time only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: false,
				showTime: true,
				showDate: true
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"M/d/yy, h:mm a",
				"MMM d, y, h:mm:ss a",
				"yyyy-MM-dd'T'HH:mm:ss",
				"yyyyMMdd HHmmss"
			], "Date and time only fallback patterns should match");

			// Date only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: false,
				showTime: false,
				showDate: true
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"MMddyyyy",
				"MMddyy",
				"M/d/yy",
				"MMM d, y",
				"yyyy-MM-dd",
				"yyyyMMdd",
				"MMddyyyy",
				"MMddyy"
			], "Date only fallback patterns should match");

			// Date with timezone
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: true,
				showTime: false,
				showDate: true
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"MMddyyyy VV",
				"MMddyy VV",
				"M/d/yy VV",
				"MMM d, y VV",
				"yyyy-MM-dd VV",
				"yyyyMMdd VV",
				"MMddyyyy VV",
				"MMddyy VV"
			], "Date with timezone fallback patterns should match");

			// Time only
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: false,
				showTime: true,
				showDate: false
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"h:mm a",
				"h:mm:ss a",
				"HH:mm:ss",
				"HHmmss"
			], "Time only fallback patterns should match");

			// Time with timezone
			oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: true,
				showTime: true,
				showDate: false
			});
			assert.deepEqual(extractPatterns(oDateFormat.aFallbackFormats), [
				"h:mm a VV",
				"h:mm:ss a VV",
				"HH:mm:ss VV",
				"HHmmss VV"
			], "Time with timezone fallback patterns should match");
		});

		QUnit.test("Fallback parse with showTimezone 'Show'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeWithTimezoneInstance({
				showTimezone: DateFormatTimezoneDisplay.Show
			});
			// input and expectation for different fallback patterns
			[
				{
					input: "10/13/21, 9:22 AM Americas, New York", // M/d/yy, h:mm a VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 0))
				},
				{
					input: "Oct 13, 21, 9:22:33 AM Americas, New York", // MMM d, y, h:mm:ss a VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "2021-10-13T09:22:33 Americas, New York", // yyyy-MM-dd'T'HH:mm:ss VV
					expectedDate: new Date(Date.UTC(2021, 9, 13, 13, 22, 33))
				},
				{
					input: "20211013 092233 Americas, New York", // yyyyMMdd HHmmss VV
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
