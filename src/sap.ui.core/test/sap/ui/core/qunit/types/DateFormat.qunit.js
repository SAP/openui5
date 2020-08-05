/*global QUnit, sinon */
sap.ui.define(["sap/ui/core/format/DateFormat", "sap/ui/core/Locale", "sap/ui/core/LocaleData", "sap/ui/core/date/UniversalDate", "sap/ui/core/library"],
	function (DateFormat, Locale, LocaleData, UniversalDate, library) {
		"use strict";

		// shortcut for sap.ui.core.CalendarType
		var CalendarType = library.CalendarType;

		var oDateTime = new Date("Tue Sep 11 08:46:13 2001"),
			oTZDateTime = new Date("Tue Sep 11 03:46:13 2001 GMT+0530"),
			oDefaultDate = DateFormat.getInstance(),
			oDefaultDateTime = DateFormat.getDateTimeInstance(),
			oDefaultTime = DateFormat.getTimeInstance();

		QUnit.test("format invalid date", function (assert) {
			var oDate = new Date("");
			assert.ok(isNaN(oDate.getTime()), "This is an invalid date");
			assert.strictEqual(oDefaultDate.format(oDate), "", "Formatting an invalid date should return ''");
		});


		QUnit.test("format undefined date", function (assert) {
			var oDate;
			assert.strictEqual(oDefaultDate.format(oDate), "", "Formatting an undefined date should return ''");
		});

		QUnit.test("format default date", function (assert) {
			assert.equal(oDefaultDate.format(oDateTime), "Sep 11, 2001", "default date");
			assert.equal(oDefaultDateTime.format(oDateTime), "Sep 11, 2001, 8:46:13 AM", "default datetime");
			assert.equal(oDefaultTime.format(oDateTime), "8:46:13 AM", "default time");
		});

		QUnit.test("format default date UTC", function (assert) {
			assert.equal(oDefaultDate.format(oTZDateTime, true), "Sep 10, 2001", "default date UTC");
			assert.equal(oDefaultDateTime.format(oTZDateTime, true), "Sep 10, 2001, 10:16:13 PM", "default datetime UTC");
			assert.equal(oDefaultTime.format(oTZDateTime, true), "10:16:13 PM", "default time UTC");
		});

		QUnit.test("format date with given style", function (assert) {
			var oDateTime = new Date("Tue Sep 11 08:46:13 2001");
			// Overwrite getTimezoneOffset to get reproducible results independent of the
			// timezone where the test is run in
			oDateTime.getTimezoneOffset = function () { return -120; };
			assert.equal(DateFormat.getDateInstance({ style: "short" }).format(oDateTime), "9/11/01", "short date");
			assert.equal(DateFormat.getDateInstance({ style: "medium" }).format(oDateTime), "Sep 11, 2001", "medium date");
			assert.equal(DateFormat.getDateInstance({ style: "long" }).format(oDateTime), "September 11, 2001", "long date");
			assert.equal(DateFormat.getDateInstance({ style: "full" }).format(oDateTime), "Tuesday, September 11, 2001", "full date");
			assert.equal(DateFormat.getDateTimeInstance({ style: "short" }).format(oDateTime), "9/11/01, 8:46 AM", "short datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "medium" }).format(oDateTime), "Sep 11, 2001, 8:46:13 AM", "medium datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "long" }).format(oDateTime), "September 11, 2001 at 8:46:13 AM GMT+02:00", "long datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "full" }).format(oDateTime), "Tuesday, September 11, 2001 at 8:46:13 AM GMT+02:00", "full datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "medium/short" }).format(oDateTime), "Sep 11, 2001, 8:46 AM", "medium/short datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "long/medium" }).format(oDateTime), "September 11, 2001 at 8:46:13 AM", "long/medium datetime");
			assert.equal(DateFormat.getTimeInstance({ style: "short" }).format(oDateTime), "8:46 AM", "short time");
			assert.equal(DateFormat.getTimeInstance({ style: "medium" }).format(oDateTime), "8:46:13 AM", "medium time");
			assert.equal(DateFormat.getTimeInstance({ style: "long" }).format(oDateTime), "8:46:13 AM GMT+02:00", "long time");
			assert.equal(DateFormat.getTimeInstance({ style: "full" }).format(oDateTime), "8:46:13 AM GMT+02:00", "full time");
		});

		QUnit.test("format date for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.equal(DateFormat.getDateInstance(oLocale).format(oDateTime), "11.09.2001", "date with defaults for given locale");
			assert.equal(DateFormat.getDateTimeInstance(oLocale).format(oDateTime), "11.09.2001, 08:46:13", "datetime with defaults for given locale");
			assert.equal(DateFormat.getTimeInstance(oLocale).format(oDateTime), "08:46:13", "time with defaults for given locale");
		});

		QUnit.test("format date with custom pattern for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.equal(DateFormat.getDateInstance({ pattern: "dd MMM yyyy" }, oLocale).format(oDateTime), "11 Sept. 2001", "date with custom pattern for given locale");
			assert.equal(DateFormat.getDateTimeInstance({ pattern: "dd MMM yyyy hh:mm:ss a" }, oLocale).format(oDateTime), "11 Sept. 2001 08:46:13 AM", "datetime with custom pattern for given locale");
			assert.equal(DateFormat.getTimeInstance({ pattern: "hh:mm:ss a" }, oLocale).format(oDateTime), "08:46:13 AM", "datetime with custom pattern for given locale");
		});

		QUnit.test("format custom date", function (assert) {
			var oDate = new Date("Wed Jul 4 12:08:56 2001"),
				sCustomPattern,
				oCustomDate,
				oCustomDatePatterns = {
					"yyyy.MM.dd G 'at' HH:mm:ss z": "2001.07.04 AD at 12:08:56 PDT",
					"EEE, MMM d, ''yy": "Wed, Jul 4, '01",
					"EEEE, MMM d, ''yy": "Wednesday, Jul 4, '01",
					"EEEEE, MMM d, ''yy": "W, Jul 4, '01",
					"EEEEEE, MMM d, ''yy": "We, Jul 4, '01",
					"h:mm a": "12:08 PM",
					"hh 'o''clock' a, zzzz": "12 o'clock PM, Pacific Daylight Time",
					"K:mm a, z": "0:08 PM, PDT",
					"yyyyy.MMMM.dd GGG hh:mm aaa": "02001.July.04 AD 12:08 PM",
					"yyyy.MMMM.dd GGGG hh:mm aaa": "2001.July.04 Anno Domini 12:08 PM",
					"yyyy.MMMM.dd GGGGG hh:mm:ss aaa": "2001.July.04 A 12:08:56 PM",
					"yyyy.MMMMM.dd GGGGG hh:mm:ss aaa": "2001.J.04 A 12:08:56 PM",
					"EEE, d MMM yyyy HH:mm:ss Z": "Wed, 4 Jul 2001 12:08:56 +0700",
					"yyMMddHHmmssZ": "010704120856+0700",
					"yyyy-MM-dd'T'HH:mm:ss.SSSZ": "2001-07-04T12:08:56.235+0700",
					"yyyy-MM-dd'T'HH:mm:ss.SSSXXX": "2001-07-04T12:08:56.235+07:00",
					"YYYY-'W'ww-u": "2001-W27-4",
					"'datetime'''yyyy-MM-dd'T'HH:mm:ss''": "datetime'2001-07-04T12:08:56'"
				};

			// Overwrite getTimezoneOffset to get reproducible results independent of the
			// timezone where the test is run in, add additional information which
			// is not provided by the standard JS Date object
			oDate.getTimezoneOffset = function () { return -420; };
			oDate.getTimezoneShort = function () { return "PDT"; };
			oDate.getTimezoneLong = function () { return "Pacific Daylight Time"; };
			oDate.setMilliseconds(235);

			for (sCustomPattern in oCustomDatePatterns) {
				oCustomDate = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
				assert.equal(oCustomDate.format(oDate), oCustomDatePatterns[sCustomPattern], sCustomPattern);
			}
		});

		QUnit.test("format custom date UTC", function (assert) {
			var oDate = new Date("Wed Jul 4 12:08:56 2001 UTC"),
				oCustomDate;

			// Overwrite getTimezoneOffset to get reproducible results independent of the
			// timezone where the test is run in, add additional information which
			// is not provided by the standard JS Date object
			oDate.getTimezoneOffset = function () { return 0; };
			oDate.getTimezoneShort = function () { return "UTC"; };
			oDate.getTimezoneLong = function () { return "Coordinated Universal Time"; };
			oDate.setMilliseconds(235);

			oCustomDate = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX" });
			assert.equal(oCustomDate.format(oDate, true), "2001-07-04T12:08:56.235Z", "yyyy-MM-dd'T'HH:mm:ss.SSSX");
		});


		function getExpectedRelativeDate(iDiff, iTarget, oFormatOptions, sLocale) {
			oFormatOptions = jQuery.extend({}, oFormatOptions);
			oFormatOptions.relative = false;

			var oFormat = DateFormat.getDateInstance(oFormatOptions, new Locale(sLocale)),
				sTargetDate = oFormat.format(new Date(iTarget)) + "",
				iDays = Math.abs(iDiff),
				aRange = oFormatOptions.relativeRange || [-6, 6],
				oLocaleData = LocaleData.getInstance(new Locale(sLocale));

			if (iDiff < aRange[0] || iDiff > aRange[1]) {
				return [sTargetDate, sTargetDate];
			}

			return [oLocaleData.getRelativeDay(iDiff, oFormatOptions.relativeStyle).replace("{0}", iDays), sTargetDate];
		}

		function doTestRelative(assert, bFormat, oFormatOptions, sLocale, sTestInfo) {
			[undefined, 'wide', 'short', 'narrow'].forEach(function (sStyle) {
				oFormatOptions.relativeStyle = sStyle;
				var oFormat1 = DateFormat.getDateInstance(jQuery.extend({ relative: bFormat }, oFormatOptions), new Locale(sLocale)),
					oFormat2 = DateFormat.getDateInstance(oFormatOptions, new Locale(sLocale)),
					oToday = new Date(),
					iToday = oToday.getTime(),
					iTarget, aExpected;

				for (var i = -10; i <= 10; i++) {
					iTarget = iToday + i * (24 * 60 * 60 * 1000);
					aExpected = getExpectedRelativeDate(i, iTarget, oFormatOptions, sLocale);
					if (bFormat) {
						assert.equal(oFormat1.format(new Date(iTarget)), aExpected[0], sTestInfo + " ----------- Today" + (i >= 0 ? " + " : " ") + i + " -> " + aExpected[0] + " " + (aExpected[0] == aExpected[1] ? "" : "(" + aExpected[1] + ")"));
					} else {
						assert.equal(oFormat2.format(oFormat1.parse(aExpected[0])) + "", aExpected[1], sTestInfo + " ----------- " + aExpected[0] + " -> Today" + (i >= 0 ? " + " : " ") + i + " -> " + aExpected[1]);
					}
				}
			});
		}

		QUnit.test("format date relative", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd" }, "en", "yyyy-MM-dd, default range, en");
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd" }, "de", "yyyy-MM-dd, default range, de");
			doTestRelative(assert, true, { relativeRange: [-9, 0] }, "en", "default style, range [-9, 0], en");
			doTestRelative(assert, true, { relativeRange: [-9, 0] }, "de", "default style, range [-9, 0], de");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5] }, "en", "style long, range [1, 5], en");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5] }, "de", "style long, range [1, 5], de");
		});

		QUnit.test("format date with year before 100", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			}),
				oDate = new Date(),
				sResult;

			oDate.setFullYear(oDate.getFullYear() - 2000);
			sResult = oDateFormat.format(oDate);

			assert.equal(sResult, "2000 years ago", "The date should be formatted correctly");
		});

		QUnit.module("DateFormat#parse (anno 1978)", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(270909420000); // Wed Aug 02 1978 13:37:00 GMT+0100
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("parse date two digit year", function (assert) {
			var oFormat = DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});

			// current year is 1978
			var twoDigitMinus70 = "08"; // 1978 - 70
			var twoDigitMinus71 = "07"; // 1978 - 71
			assert.equal(oFormat.parse(twoDigitMinus70 + "-01-01").getFullYear(), 1908, "Year 1908");
			assert.equal(oFormat.parse(twoDigitMinus71 + "-01-01").getFullYear(), 2007, "Year 2007");
		});


		QUnit.module("DateFormat#parse (anno 2018)", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(1533209820000); // Thu Aug 02 2018 13:37:00 GMT+0200
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("parse date relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd" }, "en", "yyyy-MM-dd, default range, en");
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd" }, "de", "yyyy-MM-dd, default range, de");
			doTestRelative(assert, false, { relativeRange: [-9, 0] }, "en", "default style, range [-9, 0], en");
			doTestRelative(assert, false, { relativeRange: [-9, 0] }, "de", "default style, range [-9, 0], de");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5] }, "en", "style long, range [1, 5], en");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5] }, "de", "style long, range [1, 5], de");
		});

		QUnit.test("parse default date", function (assert) {
			var oDate = oDefaultDate.parse("May 23, 2008");
			assert.equal(oDate.getFullYear(), 2008, "Year 2008");
			assert.equal(oDate.getMonth(), 4, "Month May");
			assert.equal(oDate.getDate(), 23, "Day 23rd");

			oDate = oDefaultDateTime.parse("May 23, 2008, 5:23:00 PM");
			assert.equal(oDate.getFullYear(), 2008, "Year 2008");
			assert.equal(oDate.getMonth(), 4, "Month May");
			assert.equal(oDate.getDate(), 23, "Day 23rd");
			assert.equal(oDate.getHours(), 17, "Hours 17");
			assert.equal(oDate.getMinutes(), 23, "Minutes 23");
		});

		QUnit.test("parse empty string", function (assert) {
			var oDate = oDefaultDate.parse("");
			assert.equal(oDate, null, "parsing empty string returns null");
		});

		QUnit.test("parse date two digit year", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }),
				oDate;

			// current year is 2018
			var twoDigitPlus30 = "48"; // 2018 + 30
			var twoDigitPlus29 = "47"; // 2018 + 29
			assert.equal(oFormat.parse(twoDigitPlus30 + "-01-01").getFullYear(), 1948, "Year 1948");
			assert.equal(oFormat.parse(twoDigitPlus29 + "-01-01").getFullYear(), 2047, "Year 2047");

			oDate = oFormat.parse("2014-03-12");
			assert.equal(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("0014-03-12");
			assert.equal(oDate.getFullYear(), 14, "Year 14");
			oDate = oFormat.parse("04-03-12");
			assert.equal(oDate.getFullYear(), 2004, "Year 2004");
			oDate = oFormat.parse("14-03-12");
			assert.equal(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("34-03-12");
			assert.equal(oDate.getFullYear(), 2034, "Year 2034");
			oDate = oFormat.parse("54-03-12");
			assert.equal(oDate.getFullYear(), 1954, "Year 1954");
			oDate = oFormat.parse("74-03-12");
			assert.equal(oDate.getFullYear(), 1974, "Year 1974");
			oDate = oFormat.parse("94-03-12");
			assert.equal(oDate.getFullYear(), 1994, "Year 1994");
		});

		QUnit.test("parse date two digit year UTC", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd", UTC: true }),
				oDate;
			oDate = oFormat.parse("2014-03-12");
			assert.equal(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("0014-03-12");
			assert.equal(oDate.getFullYear(), 14, "Year 14");
			oDate = oFormat.parse("04-03-12");
			assert.equal(oDate.getFullYear(), 2004, "Year 2004");
			oDate = oFormat.parse("14-03-12");
			assert.equal(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("34-03-12");
			assert.equal(oDate.getFullYear(), 2034, "Year 2034");
			oDate = oFormat.parse("54-03-12");
			assert.equal(oDate.getFullYear(), 1954, "Year 1954");
			oDate = oFormat.parse("74-03-12");
			assert.equal(oDate.getFullYear(), 1974, "Year 1974");
			oDate = oFormat.parse("94-03-12");
			assert.equal(oDate.getFullYear(), 1994, "Year 1994");
		});

		QUnit.test("parse default date UTC", function (assert) {
			var oDate = oDefaultDate.parse("May 23, 2008", true);
			assert.equal(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.equal(oDate.getUTCMonth(), 4, "Month May");
			assert.equal(oDate.getUTCDate(), 23, "Day 23rd");

			oDate = oDefaultDateTime.parse("May 23, 2008, 5:23:00 PM", true);
			assert.equal(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.equal(oDate.getUTCMonth(), 4, "Month May");
			assert.equal(oDate.getUTCDate(), 23, "Day 23rd");
			assert.equal(oDate.getUTCHours(), 17, "Hours 17");
			assert.equal(oDate.getUTCMinutes(), 23, "Minutes 23");
		});

		QUnit.test("parse custom date", function (assert) {

			function inclTimezoneOffset(iTimestamp) {
				return iTimestamp + (new Date(iTimestamp)).getTimezoneOffset() * 60 * 1000;
			}

			var oCustomDatePatterns = {
				"yyyy.MM.dd 'at' HH:mm:ss z": ["2001.07.04 at 12:08:56 GMT+02:00", 994241336000],
				"yyyy.MM.dd GGGG 'at' HH:mm:ss z": ["2001.07.04 Anno Domini at 12:08:56 GMT+02:00", 994241336000],
				"EEE, MMM d, ''yy Z": ["Wed, Jul 4, '01 +0200", 994197600000],
				"h:mm a z": ["12:08 PM Z", 43680000],
				"hh 'o''clock' a, X": ["12 o'clock PM, +07:00", 18000000],
				"K:mm a, z": ["0:08 PM, UTC+01:00", 40080000],

				"yyyyy.MMMMM.dd hh:mm aaa": ["02001.July.04 12:08 PM", inclTimezoneOffset(994248480000)],
				"EEE, d MMM yyyy HH:mm:ss": ["Wed, 4 Jul 2001 12:08:56", inclTimezoneOffset(994248536000)],
				"yyMMddHHmms": ["010704120856", inclTimezoneOffset(994248536000)],
				"yyyy-MM-dd'T'HH:mm:ss.SSS": ["2001-07-04T12:08:56.235", inclTimezoneOffset(994248536235)],
				//"yyyy-MM-dd'T'HH:mm:ss.SSSX": ["2001-07-04T12:08:56.235Z", 994248536235],
				"yyyy-MM-dd GGG 'T'HH:mm:ss.SSSX": ["2001-07-04 AD T12:08:56.235Z", 994248536235],
				"yyyy-MM-dd'T'HH:mm:ss.SSSX": ["2000-01-01T16:00:00.000-09:00", 946774800000]
			};

			for (var sCustomPattern in oCustomDatePatterns) {
				var oCustomDate = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
				assert.equal(oCustomDate.parse(oCustomDatePatterns[sCustomPattern][0]).getTime(), oCustomDatePatterns[sCustomPattern][1], sCustomPattern);

			}
		});

		QUnit.test("parse custom format", function (assert) {

			var oCustomDateFormats = {
				"y": ["2001", 978307200000],
				"yM": ["3/2001", 983404800000],
				"yq": ["Q1 2001", 978307200000],
				"yqq": ["2nd quarter 2001", 986083200000],
				"yqqq": ["Q3 2001", 993945600000],
				"yqqqq": ["4th quarter 2001", 1001894400000],
				"Q": ["4", 23587200000],
				"Md": ["3/7", 5616000000]
			};

			for (var sCustomFormat in oCustomDateFormats) {
				var oCustomDate = DateFormat.getDateTimeInstance({ format: sCustomFormat, UTC: true });
				assert.equal(oCustomDate.parse(oCustomDateFormats[sCustomFormat][0]).getTime(), oCustomDateFormats[sCustomFormat][1], sCustomFormat);

			}
		});

		QUnit.test("parse with strict check", function (assert) {

			var oFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd", strictParsing: true }),
				oDate;

			oDate = oFormat.parse("2014-02-28");
			assert.ok((oDate.getFullYear() == 2014 && oDate.getMonth() == 1 && oDate.getDate() == 28), "2014-02-28 parsed fine");

			oDate = oFormat.parse("2014-02-29");
			assert.ok(!oDate, "2014-02-29 no date returned");

			oDate = oFormat.parse("2014-01-33");
			assert.ok(!oDate, "2014-01-33 no date returned");

			oDate = oFormat.parse("2014-13-10");
			assert.ok(!oDate, "2014-13-10 no date returned");

			oFormat = DateFormat.getTimeInstance({ pattern: "hh-mm-ss", strictParsing: true });
			oDate = oFormat.parse("10-11-12");
			assert.ok((oDate.getHours() == 10 && oDate.getMinutes() == 11 && oDate.getSeconds() == 12), "10-11-12 parsed fine");

			oDate = oFormat.parse("25-11-12");
			assert.ok(!oDate, "25-11-12 no date returned");

			oDate = oFormat.parse("10-61-12");
			assert.ok(!oDate, "10-61-12 no date returned");

			oDate = oFormat.parse("10-11-62");
			assert.ok(!oDate, "10-11-62 no date returned");


		});

		QUnit.test("parse short format without delimiter", function (assert) {
			var oDate = new Date("Mon Apr 7 00:00:00 2014"),
				oFormat = DateFormat.getDateInstance(),
				sDateIn = "040714", oDateOut = oFormat.parse(sDateIn);
			assert.ok((oDateOut.toString() === oDate.toString()), "6 digit fallback: " + sDateIn + " to " + oDateOut);

			oDateOut = oFormat.parse("000100");
			assert.strictEqual(oDateOut, null, "000100 shouldn't be parsed as a valid date");

			oDateOut = oFormat.parse("010000");
			assert.strictEqual(oDateOut, null, "010000 shouldn't be parsed as a valid date");

			sDateIn = "04072014";
			oDateOut = oFormat.parse(sDateIn);
			assert.ok((oDateOut.toString() === oDate.toString()), "8 digit fallback: " + sDateIn + " to " + oDateOut);
			sDateIn = "20140407";
			oDateOut = oFormat.parse(sDateIn);
			assert.ok((oDateOut.toString() === oDate.toString()), "ISO fallback: " + sDateIn + " to " + oDateOut);
		});

		QUnit.test("parse and format two digit years", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "M/d/y" }),
				sDate, oDate;
			oDate = oFormat.parse("1/1/1");
			assert.equal(oDate.getFullYear(), 2001, "Parsed as 2001");
			sDate = oFormat.format(oDate);
			assert.equal(sDate, "1/1/2001", "Formatted as 2001");
			oDate = new Date();
			oDate.setFullYear(1);
			oDate.setMonth(0);
			oDate.setDate(1);
			assert.equal(oDate.getFullYear(), 1, "Fullyear is 1");
			sDate = oFormat.format(oDate);
			assert.equal(sDate, "1/1/0001", "Formatted as 0001");
			oDate = oFormat.parse(sDate);
			assert.equal(oDate.getFullYear(), 1, "Fullyear is still 1");
		});

		QUnit.test("parse and format quarters", function (assert) {
			var oDate = new Date("Wed Jul 4 2001"),
				oQuarter1 = DateFormat.getDateInstance({ pattern: "qq" }),
				oQuarter2 = DateFormat.getDateInstance({ pattern: "qqq" }),
				oQuarter3 = DateFormat.getDateInstance({ pattern: "qqqq" }),
				oQuarter4 = DateFormat.getDateInstance({ pattern: "qqqqq" }),
				oQuarter5 = DateFormat.getDateInstance({ pattern: "QQQQQ" }),
				oQuarterCombined = DateFormat.getDateInstance({ pattern: "EEE, MMM d yyyy, QQQ" });

			assert.equal(oQuarter1.format(oDate), "03", "03");
			assert.equal(oQuarter2.format(oDate), "Q3", "Q3");
			assert.equal(oQuarter3.format(oDate), "3rd quarter", "3rd quarter");
			assert.equal(oQuarter4.format(oDate), "3", "3");
			assert.equal(oQuarter5.format(oDate), "3", "3");
			assert.equal(oQuarterCombined.format(oDate), "Wed, Jul 4 2001, Q3", "Wed, Jul 4 2001, Q3");
			assert.equal(oQuarterCombined.parse("Wed, Jul 4 2001, Q3").valueOf(), oDate.valueOf(), "Wed, Jul 4 2001, Q3");
		});

		QUnit.test("parse with fallback patterns", function (assert) {
			var oLocaleEN = new Locale("en_US"),
				oLocaleDE = new Locale("de_DE"),
				oFormat,
				iCompare = new Date(1975, 3, 16).getTime(),
				iFallbackOptionsLength = DateFormat.oDateInfo.aFallbackFormatOptions.length;

			oFormat = DateFormat.getDateInstance({ style: "long" }, oLocaleEN);
			assert.equal(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.equal(oFormat.parse("April 16, 1975").getTime(), iCompare, "Parse long style");
			assert.equal(oFormat.parse("Apr 16, 1975").getTime(), iCompare, "Parse fallback medium style");
			assert.equal(oFormat.parse("4/16/75").getTime(), iCompare, "Parse fallback short style");
			assert.equal(oFormat.parse("04161975").getTime(), iCompare, "Parse fallback without separators");
			assert.equal(oFormat.parse("041675").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.equal(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.equal(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }, oLocaleEN);
			assert.equal(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.equal(oFormat.parse("16041975").getTime(), iCompare, "Parse fallback from removing delimiters from given pattern");
			assert.equal(oFormat.parse("Apr 16, 1975").getTime(), iCompare, "Parse fallback medium style");
			assert.equal(oFormat.parse("4/16/75").getTime(), iCompare, "Parse fallback short style");
			assert.equal(oFormat.parse("04161975").getTime(), iCompare, "Parse fallback without separators");
			assert.equal(oFormat.parse("041675").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.equal(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.equal(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ style: "long", calendarType: CalendarType.Islamic }, oLocaleEN);
			assert.equal(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.equal(oFormat.parse("Rabiʻ II 4, 1395 AH").getTime(), iCompare, "Parse long style");
			assert.equal(oFormat.parse("Rab. II 4, 1395 AH").getTime(), iCompare, "Parse fallback medium style");
			assert.equal(oFormat.parse("4/4/1395 AH").getTime(), iCompare, "Parse fallback short style");
			assert.equal(oFormat.parse("04041395").getTime(), iCompare, "Parse fallback without separators");
			assert.equal(oFormat.parse("040495").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.equal(oFormat.parse("1395-04-04").getTime(), iCompare, "Parse fallback ISO");
			assert.equal(oFormat.parse("13950404").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ style: "long" }, oLocaleDE);
			assert.equal(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.equal(oFormat.parse("16. April 1975").getTime(), iCompare, "Parse long style");
			assert.equal(oFormat.parse("16.4.1975").getTime(), iCompare, "Parse fallback medium style");
			assert.equal(oFormat.parse("16.4.75").getTime(), iCompare, "Parse fallback short style");
			assert.equal(oFormat.parse("16041975").getTime(), iCompare, "Parse fallback without separators");
			assert.equal(oFormat.parse("160475").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.equal(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.equal(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

		});

		QUnit.test("parse and format fractional seconds", function (assert) {
			var oDate1 = new Date(1234),
				oDate2 = new Date(14),
				oMS1 = DateFormat.getDateInstance({ pattern: "s.S" }),
				oMS2 = DateFormat.getDateInstance({ pattern: "s.SSS" }),
				oMS3 = DateFormat.getDateInstance({ pattern: "s.SSSSSS" });

			assert.equal(oMS1.format(oDate1, true), "1.2", "1.2");
			assert.equal(oMS2.format(oDate1, true), "1.234", "1.234");
			assert.equal(oMS3.format(oDate1, true), "1.234000", "1.234000");
			assert.equal(oMS1.format(oDate2, true), "0.0", "0.0");
			assert.equal(oMS2.format(oDate2, true), "0.014", "0.014");
			assert.equal(oMS3.format(oDate2, true), "0.014000", "0.014000");
			assert.equal(oMS1.parse("0.1", true).valueOf(), 100, "0.1");
			assert.equal(oMS1.parse("0.003", true), null, "0.003");
			assert.equal(oMS1.parse("0.123", true), null, "0.123");
			assert.equal(oMS1.parse("0.123456", true), null, "0.123456");
			assert.equal(oMS2.parse("0.1", true).valueOf(), 100, "0.1");
			assert.equal(oMS2.parse("0.003", true).valueOf(), 3, "0.003");
			assert.equal(oMS2.parse("0.123", true).valueOf(), 123, "0.123");
			assert.equal(oMS2.parse("0.123456", true), null, "0.123456");
			assert.equal(oMS3.parse("0.1", true).valueOf(), 100, "0.1");
			assert.equal(oMS3.parse("0.003", true).valueOf(), 3, "0.003");
			assert.equal(oMS3.parse("0.123", true).valueOf(), 123, "0.123");
			assert.equal(oMS3.parse("0.123456", true).valueOf(), 123, "0.123456");
		});

		QUnit.test("parse time format with am/pm appearing at the beginning", function (assert) {
			var oTimeStart = DateFormat.getTimeInstance({ pattern: "ah:mm:ss" });
			assert.notEqual(oTimeStart.parse("PM12:22:52").getTime(), oTimeStart.parse("AM12:22:52").getTime(), "PM/AM info should be correctly considered");
		});

		QUnit.test("parse time format with variants of am/pm", function (assert) {
			var aVariants = ["am", "pm", "AM", "PM", "a.m.", "am.", "p.m.", "pm.", "A.M.", "AM.", "P.M.", "PM."];
			var oFormat = DateFormat.getTimeInstance({
				pattern: "a"
			});

			aVariants.forEach(function (sDate) {
				var oDate = oFormat.parse(sDate);
				assert.ok(oDate instanceof Date, sDate + " correctly parsed");
			});

			assert.equal(oFormat.parse("a..m"), null, "Invalid variant can't be parsed");

			oFormat = DateFormat.getTimeInstance({
				pattern: "a"
			}, new Locale("vi"));

			assert.equal(oFormat.parse("a.m."), null, "the variant can only be parsed in locale where it's supported");
		});

		QUnit.test("format and parse time with am/pm in locale pt_PT", function(assert) {
			// the dayPeriod pattern is defined as the following in pt_PT
			// ["a.m.", "p.m."]
			// The "." in the pattern also needs to be removed before it's compared with the unified variant
			var oFormat = DateFormat.getTimeInstance({
					pattern: "hh:mm a"
				}, new Locale("pt_PT")),
				oDate = new Date(),
				sFormattedTime = oFormat.format(oDate),
				oParsedDate = oFormat.parse(sFormattedTime);

			assert.ok(oParsedDate, "The formatted date string can be parsed");
			assert.equal(oParsedDate.getHours(), oDate.getHours(), "The hours can be correctly parsed");
			assert.equal(oParsedDate.getMinutes(), oDate.getMinutes(), "The minutes can be correctly parsed");
		});

		QUnit.test("parse with tolerance for the number of spaces", function (assert) {
			var oFormat = DateFormat.getDateInstance({
				pattern: "dd MMMM, yyyy"
			});

			var iDate = new Date(2017, 3, 17).getTime();

			assert.equal(oFormat.parse("17April,2017").getTime(), iDate, "string without any space can also be parsed");
			assert.equal(oFormat.parse(" 17   April,   2017   ").getTime(), iDate, "string with redundant space can also be parsed");
			assert.equal(oFormat.parse(" 17April,   2017").getTime(), iDate, "string with arbitrary space can also be parsed");
			assert.equal(oFormat.parse("17 April , 2017"), null, "string with non-defined space can't be parsed");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			});

			var aCompare = [new Date(2017, 3, 11), new Date(2017, 3, 17)];

			// the correct pattern is MMM d – d, y
			assert.deepEqual(oIntervalFormat.parse("Apr 11–17, 2017"), aCompare, "string with missing spaces can also be parsed");
			assert.deepEqual(oIntervalFormat.parse("Apr11–17,  2017"), aCompare, "string with missing spaces and redundant spaces can also be parsed");
		});

		/** TODO: Move to sap.ui.core.date.Gregorian
		QUnit.test("DateFormat.calculateWeekNumber", function(assert) {
			var DateFormat = DateFormat;

			var oDate = new Date(Date.UTC(2015, 5, 8));
			assert.equal(DateFormat.calculateWeekNumber(oDate, {UTC: true}), 24, "week number with UTC Date");

			oDate = new Date(Date.UTC(2000, 0, 1));
			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 1, "01.01.2000 baseYear 2000 is in week 1");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 1999
			}), 53, "01.01.2000 baseYear 1999 is in week 53");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de",
				baseYear: 1999
			}), 52, "01.01.2000 in 'de' locale is in week 52");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de",
				baseYear: 2000
			}), 52, "baseYear doesn't have effect when locale isn't en-US");

			oDate = new Date(Date.UTC(2001, 0, 1));

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2001
			}), 1, "01.01.2001 baseYear 2001 is in week 1");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 54, "01.01.2001 baseYear 2000 is in week 54");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de"
			}), 1, "01.01.2001 in 'de' locale is in week 1");

			oDate - new Date(Date.UTC(2000, 11, 31));
			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2001
			}), 1, "31.12.2000 baseYear 2001 is in week 1");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 54, "31.12.2000 baseYear 2000 is in week 54");

			assert.equal(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de"
			}), 1, "31.12.2000 in 'de' locale is in week 1");
		});
		**/

		QUnit.test("format and parse weekInYear pattern", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "'W'w"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "W1", "week format with pattern 'w'");
			assert.ok(oDateFormat.parse("W1") instanceof Date, "Date can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "'W'ww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "W01", "week format with pattern 'ww'");
			assert.ok(oDateFormat.parse("W01") instanceof Date, "Date can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "www"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "CW 01", "week format with pattern 'www'");
			assert.ok(oDateFormat.parse("CW 01") instanceof Date, "Date can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 01", "week format with pattern 'wwww'");
			assert.ok(oDateFormat.parse("Calendar Week 01") instanceof Date, "Date can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Islamic
			});
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 11", "week number in Islamic calendar");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Japanese
			});
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 01", "week number in Japanese calendar");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern", function (assert) {
			sap.ui.getCore().getConfiguration().setLanguage("en_US");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w"
			});
			assert.equal(oDateFormat.format(new Date(2014, 0, 1)), "2014-1", "For en-US 1st of January is always week 1");
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For en-US 1st of January is always week 1");
			assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2016-1", "For en-US 1st of January is always week 1");
			assert.equal(oDateFormat.format(new Date(2014, 11, 31)), "2014-53", "For en-US 31st of December is always week 53");
			assert.equal(oDateFormat.format(new Date(2015, 11, 31)), "2015-53", "For en-US 31st of December is always week 53");
			assert.equal(oDateFormat.format(new Date(2016, 11, 31)), "2016-53", "For en-US 31st of December is always week 53");
			assert.equal(oDateFormat.parse("2015-1").valueOf(), new Date(2015, 0, 1).valueOf(), "Date can be correctly parsed to 1st of January 2015");

			sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w"
			});
			assert.equal(oDateFormat.format(new Date(2014, 0, 1)), "2014-1", "For de-DE 1st of January 2014 is week 1/2014");
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For de-DE 1st of January 2015 is week 1/2015");
			assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2015-53", "For de-DE 1st of January 2016 is week 53/2015");
			assert.equal(oDateFormat.format(new Date(2014, 11, 31)), "2015-1", "For de-DE 31st of December 2014 is week 1/2015");
			assert.equal(oDateFormat.format(new Date(2015, 11, 31)), "2015-53", "For de-DE 31st of December 2015 is week 53/2015");
			assert.equal(oDateFormat.format(new Date(2016, 11, 31)), "2016-52", "For de-DE 31st of December 2016 is week 52/2016");
			assert.equal(oDateFormat.parse("2015-1").valueOf(), new Date(2014, 11, 29).valueOf(), "Date can be correctly parsed to 29th of December 2014");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("format and parse weekInYear and dayNumberOfWeek", function (assert) {
			var oDate = new Date(2016, 10, 13); // 13th, November, 2016, Sunday
			var sPattern = "Y/ww/u";

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			var sFormatted = "2016/47/1";

			assert.equal(oDateFormat.format(oDate), sFormatted, "13th, November 2016 Sunday is the first day of week 46 in en-US");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			sFormatted = "2016/45/7";

			assert.equal(oDateFormat.format(oDate), sFormatted, "13th, November 2016 Sunday is the 7th day of week 45 in de-DE");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("format and parse dayName", function (assert) {
			var oDate = new Date(2018, 2, 23); // 23th, March, 2018, Friday
			var sPattern = "yyyy-MM-dd EEEE";

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			var sFormatted = "2018-03-23 Friday";

			assert.equal(oDateFormat.format(oDate), sFormatted, "23th, March, 2018, Friday in en-US");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			sFormatted = "2018-03-23 Freitag";

			assert.equal(oDateFormat.format(oDate), sFormatted, "2018-03-23 Freitag in de-DE");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("Parse precedence: day (d) over dayName (E)", function (assert) {
			var oDate = new Date(1985, 9, 9); // 9th, October, 1985, Wednesday
			var sPattern = "yyyy-MM-dd EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormattedWrongDayName = "1985-10-09 Friday"; // use Friday instead 1985-10-09 Wednesday
			assert.equal(oDateFormat.format(oDate).toString(), "1985-10-09 Wednesday", "9th, October, 1985, Wednesday");
			assert.equal(oDateFormat.parse(sFormattedWrongDayName).getTime(), oDate.getTime(), "DayName should be ignored and the date should be the input date");
		});

		QUnit.test("Parse precedence: year/month/day (yMd) over week (w)", function (assert) {
			var oDate = new Date(1985, 9, 9); // 9th, October, 1985, Wednesday
			var sPattern = "YYYY-MM-dd '(CW 'ww')'";
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormattedWrongWeek = "1985-10-09 (CW 42)"; // use CW 42 instead 1985-10-09 (CW 41)

			assert.equal(oDateFormat.format(oDate).toString(), "1985-10-09 (CW 41)", "2018-03-23 Freitag in de-DE");
			assert.equal(oDateFormat.parse(sFormattedWrongWeek).getTime(), oDate.getTime(), "Week should be ignored and the date should be the input date");
		});

		QUnit.test("Parse and format different formats", function (assert) {
			var oDate = new Date(1985, 9, 9), oDateFormat, sFormattedDate, oParsedDate; // 9th, October, 1985, Wednesday

			["YYYY'-W'ww'-'u'", "YYYY'-W'ww', 'E", "YYYY'-W'ww'-'u', 'E"].forEach(function (sPattern) {

				["en_US", "de_DE"].forEach(function (sLanguage) {
					oDateFormat = DateFormat.getDateInstance({
						pattern: sPattern
					}, new Locale(sLanguage));

					sFormattedDate = oDateFormat.format(oDate).toString();
					assert.ok(sFormattedDate, "Formatted: " + sFormattedDate + " using pattern " + sPattern);
					oParsedDate = oDateFormat.parse(sFormattedDate);
					assert.equal(oParsedDate.getTime(), oDate.getTime(), "Pattern " + sPattern + " Formatting and parsing of date in " + sLanguage + " differs: " + oParsedDate + " vs. " + oDate);

				});
			});
		});


		QUnit.test("format and parse week and dayName", function (assert) {
			var oDate = new Date(2018, 2, 23); // 23th, March, 2018, Friday
			var sPattern = "yyyy 'Week' ww EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormatted = "2018 Week 12 Friday";

			assert.equal(oDateFormat.format(oDate), sFormatted, "2018-12 Friday, Friday in en-US");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));
			sFormatted = "2018 Week 12 Freitag";

			assert.equal(oDateFormat.format(oDate), sFormatted, "2018-12 Freitag in de-DE");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});


		QUnit.test("format and parse week and dayName first week of year", function (assert) {
			var oDate = new Date(2017, 0, 1); // 1st Jan 2017
			var sPattern = "yyyy 'Week' ww EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormatted = "2017 Week 01 Sunday";

			assert.equal(oDateFormat.format(oDate).toString(), sFormatted, "2018-12 Friday, Friday in en-US");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));
			sFormatted = "2017 Week 01 Sonntag";

			assert.equal(oDateFormat.format(oDate).toString(), sFormatted, "2018-12 Freitag in de-DE");
			assert.equal(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("origin info", function (assert) {
			var oOriginDate = DateFormat.getInstance(), sValue = oOriginDate.format(oDateTime), oInfo = sValue.originInfo;
			assert.equal(oInfo.source, "Common Locale Data Repository", "Origin Info: source");
			assert.equal(oInfo.locale, "en-US", "Origin Info: locale");
			assert.equal(oInfo.style, "medium", "Origin Info: style");
			assert.equal(oInfo.pattern, "MMM d, y", "Origin Info: pattern");
		});

		QUnit.module("Scaling: Relative Time Formater", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(1444724476000); // Tue Oct 13 2015 10:21:16 GMT+0200 (CEST)
				var oDate = new Date();
				var oJan = new Date(oDate.getFullYear(), 0, 1);
				var oJul = new Date(oDate.getFullYear(), 6, 1);
				// check whether the Daylight Saving Time is used in the current timezone
				this.dst = oJan.getTimezoneOffset() !== oJul.getTimezoneOffset();
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		function date(scale, diff) {
			var oNow = new Date(),
				oResult = new Date(Date.UTC(oNow.getFullYear(), oNow.getMonth(), oNow.getDate(), oNow.getHours(), oNow.getMinutes(), oNow.getSeconds(), oNow.getMilliseconds()));
			switch (scale) {
				case "second": oResult.setUTCSeconds(oResult.getUTCSeconds() + diff); break;
				case "minute": oResult.setUTCMinutes(oResult.getUTCMinutes() + diff); break;
				case "hour": oResult.setUTCHours(oResult.getUTCHours() + diff); break;
				case "day": oResult.setUTCDate(oResult.getUTCDate() + diff); break;
				case "month": oResult.setUTCMonth(oResult.getUTCMonth() + diff); break;
				case "year": oResult.setUTCFullYear(oResult.getUTCFullYear() + diff); break;
				default: throw new TypeError("unexpected scale " + scale);
			}
			return new Date(oResult.getUTCFullYear(), oResult.getUTCMonth(), oResult.getUTCDate(), oResult.getUTCHours(), oResult.getUTCMinutes(), oResult.getUTCSeconds(), oResult.getUTCMilliseconds());
		}

		QUnit.test("Time relative: format and parse", function (assert) {
			var aStyles = [undefined, 'wide', 'short', 'narrow'],
				aTestData = [{
					scale: "auto",
					data: [
						{ unit: "second", diff: 0, results: ["now", "now", "now", "now"], description: "now" },
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1 sec."], description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1 sec. ago"], description: "Now - 1 Second --> 1 second ago" },
						{ unit: "second", diff: 2, results: ["in 2 seconds", "in 2 seconds", "in 2 sec.", "in 2 sec."], description: "Now + 2 Seconds --> in 2 seconds" },
						{ unit: "second", diff: -7, results: ["7 seconds ago", "7 seconds ago", "7 sec. ago", "7 sec. ago"], description: "Now + 2 Seconds --> in 2 seconds" },
						{ unit: "second", diff: 61, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1 min."], description: "Now + 61 Seconds --> in 1 minute", parseDiff: 1000 },
						{ unit: "second", diff: 3601, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 3601 Seconds --> in 1 hour", parseDiff: 1000 },
						{ unit: "minute", diff: 1, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1 min."], description: "Now + 1 Minute --> in 1 minute" },
						{ unit: "minute", diff: -1, results: ["1 minute ago", "1 minute ago", "1 min. ago", "1 min. ago"], description: "Now - 1 Minute --> 1 minute ago" },
						{ unit: "minute", diff: 13, results: ["in 13 minutes", "in 13 minutes", "in 13 min.", "in 13 min."], description: "Now + 13 Minutes --> in 13 minutes" },
						{ unit: "minute", diff: -54, results: ["54 minutes ago", "54 minutes ago", "54 min. ago", "54 min. ago"], description: "Now - 54 Minutes --> 54 minutes ago" },
						{ unit: "minute", diff: 95, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 95 Minutes --> in 1 hour", parseDiff: 35 * 60 * 1000 },
						{ unit: "hour", diff: 1, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 1 Hour --> in 1 hour" },
						{ unit: "day", diff: -5, results: ["120 hours ago", "120 hours ago", "120 hr. ago", "120 hr. ago"], description: "Now - 5 Days --> 120 hours ago" }
					]
				}, {
					scale: "hour",
					data: [
						{ unit: "second", diff: 0, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now --> 0 hours ago" },
						{ unit: "second", diff: 1, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now + 1 Second --> this hour", parseDiff: 1000 },
						{ unit: "second", diff: -1, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now - 1 Second --> this hour", parseDiff: -1000 },
						{ unit: "minute", diff: 30, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now + 30 Minutes --> this hour", parseDiff: 30 * 60 * 1000 },
						{ unit: "minute", diff: -30, results: ["1 hour ago", "1 hour ago", "1 hr. ago", "1 hr. ago"], description: "Now - 30 Minutes --> 1 hour ago", parseDiff: 30 * 60 * 1000 },
						{ unit: "hour", diff: 4, results: ["in 4 hours", "in 4 hours", "in 4 hr.", "in 4 hr."], description: "Now + 4 Hours --> in 4 hours" },
						{ unit: "hour", diff: -10, results: ["10 hours ago", "10 hours ago", "10 hr. ago", "10 hr. ago"], description: "Now - 10 Hours --> 10 hours ago" }
					]
				}, {
					scale: "minute",
					data: [
						{ unit: "second", diff: 0, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now --> 0 minutes ago" },
						{ unit: "second", diff: 1, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now + 1 Second --> in 0 minutes", parseDiff: 1000 },
						{ unit: "second", diff: -1, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now - 1 Second --> 0 minutes ago", parseDiff: -1000 },
						{ unit: "minute", diff: 30, results: ["in 30 minutes", "in 30 minutes", "in 30 min.", "in 30 min."], description: "Now + 30 Minutes --> in 30 minutes" },
						{ unit: "minute", diff: -30, results: ["30 minutes ago", "30 minutes ago", "30 min. ago", "30 min. ago"], description: "Now - 30 Minutes --> 30 minutes ago" },
						{ unit: "hour", diff: 1, results: ["in 60 minutes", "in 60 minutes", "in 60 min.", "in 60 min."], description: "Now + 4 Hours --> in 60 minutes" }
					]
				}, {
					scale: "second",
					data: [
						{ unit: "second", diff: 0, results: ["now", "now", "now", "now"], description: "Now --> now" },
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1 sec."], description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1 sec. ago"], description: "Now - 1 Second --> 1 second ago" },
						{ unit: "minute", diff: 1, results: ["in 60 seconds", "in 60 seconds", "in 60 sec.", "in 60 sec."], description: "Now + 1 Minute --> in 60 seconds" },
						{ unit: "minute", diff: -1, results: ["60 seconds ago", "60 seconds ago", "60 sec. ago", "60 sec. ago"], description: "Now - 1 Minute --> 60 seconds ago" }
					]
				}];

			aStyles.forEach(function (sStyle, index) {
				aTestData.forEach(function (oTestData) {
					var oTime = DateFormat.getTimeInstance({
						relative: true,
						relativeScale: oTestData.scale,
						relativeStyle: sStyle
					});

					oTestData.data.forEach(function (data) {
						if (!data.parseOnly) {
							assert.equal(oTime.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.equal(oTime.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
					});
				});
			});
		});

		QUnit.test("Date relative: format and parse", function (assert) {
			var that = this,
				aStyles = [undefined, 'wide', 'short', 'narrow'],
				aTestData = [{
					scale: "auto",
					data: [
						{ unit: "second", diff: 0, results: ["today", "today", "today", "today"], description: "today" },
						{ unit: "second", diff: 1, results: ["today", "today", "today", "today"], description: "Today + 1 Second --> today", parseDiff: 1000 },
						{ unit: "second", diff: -86400, results: ["1 day ago", "1 day ago", "1 day ago", "1 day ago"], description: "Today - 86400 Seconds --> 1 day ago" },
						{ unit: "minute", diff: 1440, results: ["in 1 day", "in 1 day", "in 1 day", "in 1 day"], description: "Today + 1440 Minutes --> in 1 day" },
						{ unit: "hour", diff: 24, results: ["in 1 day", "in 1 day", "in 1 day", "in 1 day"], description: "Today + 24 Hours --> tomorrow" },
						{ unit: "day", diff: 5, results: ["in 5 days", "in 5 days", "in 5 days", "in 5 days"], description: "Today + 5 Days --> in 5 days" },
						{ unit: "day", diff: -5, results: ["5 days ago", "5 days ago", "5 days ago", "5 days ago"], description: "Today - 5 Days --> 5 days ago" },
						{ unit: "day", diff: 8, results: ["in 1 week", "in 1 week", "in 1 wk.", "in 1 wk."], description: "Today + 8 Days --> in 1 week", parseDiff: 24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -8, results: ["1 week ago", "1 week ago", "1 wk. ago", "1 wk. ago"], description: "Today - 8 Days --> 1 week ago", parseDiff: -24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -32, results: ["1 month ago", "1 month ago", "1 mo. ago", "1 mo. ago"], description: "Today - 32 Days --> 1 month ago", parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "month", diff: 1, results: ["in 1 month", "in 1 month", "in 1 mo.", "in 1 mo."], description: "Today + 1 Month --> in 1 month" },
						{ unit: "month", diff: -1, results: ["1 month ago", "1 month ago", "1 mo. ago", "1 mo. ago"], description: "Today - 1 Month --> 1 month ago" },
						{ unit: "month", diff: 13, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1 yr."], description: "Today + 13 Months --> in 1 year", parseDiff: (31 * 24 + (that.dst ? 1/* summer->winter switch */ : 0)) * 60 * 60 * 1000 },
						{ unit: "month", diff: 26, results: ["in 2 years", "in 2 years", "in 2 yr.", "in 2 yr."], description: "Today + 26 Months --> in 2 years", parseDiff: (61 * 24 + (that.dst ? 1/* summer->winter switch */ : 0)) * 60 * 60 * 1000 },
						{ unit: "day", diff: 90, results: ["in 1 quarter", "in 1 quarter", "in 1 qtr.", "in 1 qtr."], description: "Today + 90 Days", parseOnly: true, parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "hour", diff: 24, results: ["in 24 hours", "in 24 hours", "in 24 hr.", "in 24 hr."], description: "Today + 1 Days", parseOnly: true },
						{ unit: "hour", diff: 72, results: ["in 72 hours", "in 72 hours", "in 72 hr.", "in 72 hr."], description: "Today + 3 Days", parseOnly: true },
						{ unit: "minute", diff: -4320, results: ["4320 minutes ago", "4320 minutes ago", "4320 min. ago", "4320 min. ago"], description: "Today - 3 Days", parseOnly: true }
					]
				}, {
					scale: "week",
					data: [
						{ unit: "day", diff: 13, results: ["in 2 weeks", "in 2 weeks", "in 2 wk.", "in 2 wk."], description: "Today + 13 Days --> in 2 weeks", parseDiff: (-1 * 24 * 60 * 60 * 1000) }
					]
				}
				];

			aStyles.forEach(function (sStyle, index) {
				aTestData.forEach(function (oTestData) {
					var oDate = DateFormat.getDateInstance({
						relative: true,
						relativeScale: "auto",
						relativeStyle: sStyle
					});

					oTestData.data.forEach(function (data) {
						if (!data.parseOnly) {
							assert.equal(oDate.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.equal(oDate.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
					});
				});
			});
		});

		QUnit.test("DateTime relative: format and parse", function (assert) {
			var aStyles = [undefined, 'wide', 'short', 'narrow'],
				that = this,
				aTestData = [{
					scale: "auto",
					data: [
						{ unit: "second", diff: 0, results: ["now", "now", "now", "now"], description: "now" },
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1 sec."], description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1 sec. ago"], description: "Now - 1 Second --> 1 second ago" },
						{ unit: "second", diff: 2, results: ["in 2 seconds", "in 2 seconds", "in 2 sec.", "in 2 sec."], description: "Now + 2 Second --> in 2 seconds" },
						{ unit: "second", diff: -7, results: ["7 seconds ago", "7 seconds ago", "7 sec. ago", "7 sec. ago"], description: "Now - 7 Second --> 7 seconds ago" },
						{ unit: "second", diff: 61, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1 min."], description: "Now + 61 Seconds --> in 1 minute", parseDiff: 1000 },
						{ unit: "second", diff: 3601, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 3601 Seconds --> in 1 hour", parseDiff: 1000 },
						{ unit: "second", diff: -86401, results: ["1 day ago", "1 day ago", "1 day ago", "1 day ago"], description: "Today - 86401 Seconds --> 1 day ago", parseDiff: -1000 },
						{ unit: "minute", diff: 1, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1 min."], description: "Now + 1 Minute --> in 1 minute" },
						{ unit: "minute", diff: -1, results: ["1 minute ago", "1 minute ago", "1 min. ago", "1 min. ago"], description: "Now - 1 Minute --> 1 minute ago" },
						{ unit: "minute", diff: 13, results: ["in 13 minutes", "in 13 minutes", "in 13 min.", "in 13 min."], description: "Now + 13 Mintues --> in 13 minutes" },
						{ unit: "minute", diff: -54, results: ["54 minutes ago", "54 minutes ago", "54 min. ago", "54 min. ago"], description: "Now - 54 Minutes --> 54 minutes ago" },
						{ unit: "minute", diff: 95, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 95 Minutes --> in 1 hour", parseDiff: 35 * 60 * 1000 },
						{ unit: "minute", diff: 1440, results: ["in 1 day", "in 1 day", "in 1 day", "in 1 day"], description: "Today + 1440 Minutes --> in 1 day" },
						{ unit: "hour", diff: 1, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1 hr."], description: "Now + 1 Hour --> in 1 hour" },
						{ unit: "day", diff: 5, results: ["in 5 days", "in 5 days", "in 5 days", "in 5 days"], description: "Today + 5 Days --> in 5 days" },
						{ unit: "day", diff: -5, results: ["5 days ago", "5 days ago", "5 days ago", "5 days ago"], description: "Today - 5 Days --> 5 days ago" },
						{ unit: "day", diff: 8, results: ["in 1 week", "in 1 week", "in 1 wk.", "in 1 wk."], description: "Today + 8 Days --> in 1 week", parseDiff: 24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -8, results: ["1 week ago", "1 week ago", "1 wk. ago", "1 wk. ago"], description: "Today - 8 Days --> 1 week ago", parseDiff: -24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -32, results: ["1 month ago", "1 month ago", "1 mo. ago", "1 mo. ago"], description: "Today - 32 Days --> 1 month ago", parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "month", diff: 1, results: ["in 1 month", "in 1 month", "in 1 mo.", "in 1 mo."], description: "Today + 1 Month --> in 1 month" },
						{ unit: "month", diff: -1, results: ["1 month ago", "1 month ago", "1 mo. ago", "1 mo. ago"], description: "Today - 1 Month --> 1 month" },
						{ unit: "month", diff: 13, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1 yr."], description: "Today + 13 Months --> in 1 year", parseDiff: (31 * 24 + (that.dst ? 1/* summer->winter switch */ : 0)) * 60 * 60 * 1000 },
						{ unit: "month", diff: 26, results: ["in 2 years", "in 2 years", "in 2 yr.", "in 2 yr."], description: "Today + 26 Months --> in 2 years", parseDiff: (61 * 24 + (that.dst ? 1/* summer->winter switch */ : 0)) * 60 * 60 * 1000 },
						{ unit: "year", diff: 1, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1 yr."], description: "Today + 1 year --> in 1 year" }
					]
				}];

			aStyles.forEach(function (sStyle, index) {
				aTestData.forEach(function (oTestData) {
					var oDateTime = DateFormat.getDateTimeInstance({
						relative: true,
						relativeScale: "auto",
						relativeStyle: sStyle
					});

					oTestData.data.forEach(function (data) {
						if (!data.parseOnly) {
							assert.equal(oDateTime.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.equal(oDateTime.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
					});
				});
			});
		});

		QUnit.module("Islamic Date in locale en");

		var oDate = new Date("Wed Jul 4 2001");

		QUnit.test("format date to Islamic type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Islamic
			});

			assert.equal(oDateFormat.format(oDate), "Rab. II 12, 1422 AH", "Date is formatted in Islamic calendar");
		});

		QUnit.test("format date to Islamic type with relative and locale en", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Islamic }, "en", "yyyy-MM-dd, default range, en with calendar type Islamic");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Islamic }, "en", "default style, range [-9, 0], en with calendar type Islamic");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Islamic }, "en", "style long, range [1, 5], en with calendar type Islamic");
		});

		QUnit.test("parse date to Islamic type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Islamic
			});

			var oDate = oDateFormat.parse("Rab. II 12, 1422 AH");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2011");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Islamic type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Islamic }, "en", "yyyy-MM-dd, default range, en with calendar type Islamic");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Islamic }, "en", "default style, range [-9, 0], en with calendar type Islamic");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Islamic }, "en", "style long, range [1, 5], en with calendar type Islamic");
		});

		var aResultLocal = [
			"12 ربيع الآخر 1422 هـ",
			"12 ربيع الآخر 1422 هـ",
			"12 ربيع الآخر 1422 هـ",
			"12 ברביע ב׳ 1422 שנת היג׳רה"
		];

		QUnit.module("Islamic Date in other locales", {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setCalendarType(CalendarType.Islamic);
			},
			afterEach: function () {
				sap.ui.getCore().getConfiguration().setCalendarType(null);
			}
		});

		["ar", "ar_EG", "ar_SA", "he"].forEach(function (sLocale, index) {
			QUnit.test("format Islamic date " + sLocale, function (assert) {
				var oDateFormat = DateFormat.getDateInstance(new Locale(sLocale));
				assert.equal(oDateFormat.format(oDate), aResultLocal[index], "Date is formatted to Islamic Date in " + sLocale + " locale");
			});

			QUnit.test("format Islamic date relative " + sLocale, function (assert) {
				doTestRelative(assert, true, { pattern: "yyyy-MM-dd" }, sLocale, "yyyy-MM-dd, default range, " + sLocale);
				doTestRelative(assert, true, { relativeRange: [-9, 0] }, sLocale, "default style, range [-9, 0], " + sLocale);
				doTestRelative(assert, true, { style: "long", relativeRange: [1, 5] }, sLocale, "style long, range [1, 5], " + sLocale);
			});

			QUnit.test("parse Islamic date " + sLocale, function (assert) {
				var oDateFormat = DateFormat.getDateInstance(new Locale(sLocale));

				var oDate = oDateFormat.parse(aResultLocal[index]);
				assert.ok(oDate instanceof Date, "Date is parsed always as instance of Javascript Date");
				assert.equal(oDate.getFullYear(), 2001, "Year 2001");
				assert.equal(oDate.getMonth(), 6, "Month July");
				assert.equal(oDate.getDate(), 4, "Day 4th");
			});

			// QUnit.test("parse Islamic date relative " + sLocale, function(assert) {
			// 	doTestRelative(assert, false, {pattern: "yyyy-MM-dd"}, sLocale, "yyyy-MM-dd, default range, " + sLocale);
			// 	doTestRelative(assert, false, {relativeRange: [-9, 0]}, sLocale, "default style, range [-9, 0], " + sLocale);
			// 	doTestRelative(assert, false, {style: "long", relativeRange: [1, 5]}, sLocale, "style long, range [1, 5], " + sLocale);
			// });
		});

		QUnit.module("Japanese Date", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Japanese type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese
			}, new Locale("ja_JP"));

			assert.equal(oDateFormat.format(this.oDate), "平成13年7月4日", "Date is formatted in Japanese calendar");
		});

		QUnit.test("format/parse date with Gannen instead of Ichinen", function (assert) {
			var oDate = new Date("May 1 2019"),
				sDate = "令和元年5月1日",
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese
				}, new Locale("ja_JP")),
				sFormatted = oDateFormat.format(oDate),
				oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date with Gannen year is parsed correclty");

			oDate = new Date("Apr 1 2019");
			sDate = "平成31年4月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Year ending with 1 is formatted as a number");
			assert.deepEqual(oParsed, oDate, "Date with numberic year is parsed correclty");

			oDate = new Date("May 1 2019");
			sDate = "R1/5/1";
			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				style: "short"
			}, new Locale("ja_JP"));
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date is formatted correctly with numeric year");
			assert.deepEqual(oParsed, oDate, "Date with numeric year is parsed correclty");

			oDate = [new Date("May 1 2019"), new Date("May 10 2019")];
			sDate = "令和元年5月1日～10日";
			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				interval: true,
				format: "yMMMd"
			}, new Locale("ja_JP"));
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date interval is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date interval with Gannen year is parsed correclty");

			oDate = [new Date("Apr 1 2019"), new Date("May 1 2019")];
			sDate = "平成31年4月1日～令和元年5月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date interval is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date interval with Gannen year is parsed correclty");

		});

		QUnit.test("format date to Japanese type with relative", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "ja_JP", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "ja_JP", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "ja_JP", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.test("parse date to Japanese type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese
			}, new Locale("ja_JP"));

			var oDate = oDateFormat.parse("平成13年7月4日");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2011");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Japanese type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "ja_JP", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "ja_JP", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "ja_JP", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.module("Japanese Date in locale en", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Japanese type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese
			});

			assert.equal(oDateFormat.format(this.oDate), "Jul 4, 13 Heisei", "Date is formatted in Japanese calendar");
		});

		QUnit.test("format date to Japanese type with relative and locale en", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "en", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "en", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "en", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.test("parse date to Japanese type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese
			});

			var oDate = oDateFormat.parse("Jul 4, 13 Heisei");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2011");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Japanese type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "en", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "en", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "en", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.module("Persian Date", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Persian type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Persian
			}, new Locale("fa_IR"));

			assert.equal(oDateFormat.format(this.oDate).toString(), "13 تیر 1380", "Date is formatted in Persian calendar");
		});

		QUnit.test("format date to Persian type with relative", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "fa_IR", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "fa_IR", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "fa_IR", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.test("parse date to Persian type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Persian
			}, new Locale("fa_IR"));

			var oDate = oDateFormat.parse("13 تیر 1380");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2011");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Persian type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "fa_IR", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "fa_IR", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "fa_IR", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.module("Persian Date in locale en", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Persian type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Persian
			});

			assert.equal(oDateFormat.format(oDate), "Tir 13, 1380 AP", "Date is formatted in Persian calendar");
		});

		QUnit.test("format date to Persian type with relative and locale en", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "en", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "en", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "en", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.test("parse date to Persian type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Persian
			});

			var oDate = oDateFormat.parse("Tir 13, 1380 AP");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2001");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Persian type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "en", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "en", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "en", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.module("Buddhist Date", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Buddhist type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			}, new Locale("th_TH"));

			assert.equal(oDateFormat.format(this.oDate), "4 ก.ค. 2544", "Date is formatted in Buddhist calendar");
		});

		QUnit.test("format date to Buddhist type with relative", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "th_TH", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "th_TH", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "th_TH", "style long, range [1, 5], en with calendar type Buddhist");
		});

		QUnit.test("parse date to Buddhist type", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			}, new Locale("th_TH"));

			var oDate = oDateFormat.parse("4 ก.ค. 2544");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2001");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Buddhist type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "th_TH", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "th_TH", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "th_TH", "style long, range [1, 5], en with calendar type Buddhist");
		});

		QUnit.module("Buddhist Date in locale en", {
			oDate: new Date("Wed Jul 4 2001")
		});

		QUnit.test("format date to Buddhist type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			});

			assert.equal(oDateFormat.format(this.oDate), "Jul 4, 2544 BE", "Date is formatted in Buddhist calendar");
		});

		QUnit.test("format date to Buddhist type with relative and locale en", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "en", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "en", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "en", "style long, range [1, 5], en with calendar type Buddhist");
		});

		QUnit.test("parse date to Buddhist type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			});

			var oDate = oDateFormat.parse("Jul 4, 2544");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.equal(oDate.getFullYear(), 2001, "Year 2011");
			assert.equal(oDate.getMonth(), 6, "Month July");
			assert.equal(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Buddhist type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "en", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "en", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "en", "style long, range [1, 5], en with calendar type Buddhist");
		});


		QUnit.module("interval options validation", {
			beforeEach: function (assert) {
				this.oIntervalFormat = DateFormat.getDateInstance({
					interval: true
				});

				this.oFormat = DateFormat.getDateInstance();
				var Log = sap.ui.require("sap/base/Log");
				assert.ok(Log, "Log module should be available");
				this.oErrorSpy = sinon.spy(Log, "error");
			},
			afterEach: function () {
				this.oErrorSpy.restore();
			}
		});

		QUnit.test("Interval format with no array", function (assert) {
			this.oIntervalFormat.format(new Date());
			assert.equal(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.equal(this.oErrorSpy.getCall(0).args[0], "Interval DateFormat expects an array with two dates for the first argument but only one date is given.", "Correct log message");
		});

		QUnit.test("Interval format with array but length != 2", function (assert) {
			this.oIntervalFormat.format([new Date()]);
			assert.equal(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.equal(this.oErrorSpy.getCall(0).args[0], "Interval DateFormat can only format with 2 date instances but 1 is given.");
		});

		QUnit.test("Interval format with invalid date", function (assert) {
			this.oIntervalFormat.format([new Date(), new Date("abc")]);
			assert.equal(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.equal(this.oErrorSpy.getCall(0).args[0], "At least one date instance which is passed to the interval DateFormat isn't valid.");
		});

		QUnit.test("DateFormat with array", function (assert) {
			this.oFormat.format([]);
			assert.equal(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.equal(this.oErrorSpy.getCall(0).args[0], "Non-interval DateFormat can't format more than one date instance.");
		});

		QUnit.test("Check if end date is before start date", function (assert) {
			var aParsedInterval,
			 oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				strictParsing: true
			});

			var endDate = new Date(2018,1,1);
			var startDate = new Date(2019,1,15);

			// no strictParsing
			aParsedInterval = this.oIntervalFormat.parse("Feb 15, 2019 – Feb 1, 2018");
			assert.deepEqual(aParsedInterval, [startDate, endDate], "Parsed array is returned.");

			// strictParsing
			aParsedInterval = oIntervalFormat.parse("Feb 1, 2019 – Feb 15, 2018");
			assert.deepEqual(aParsedInterval, [null, null], "[null, null] returned.");
		});

		QUnit.test("DateFormat with different delimiters", function (assert) {

			var oIntervalFormat = DateFormat.getDateInstance({ interval: true, format: "yMMMd"});
			var aParsedInterval = oIntervalFormat.parse("Jan 13 - 24, 2019");

			assert.ok(Array.isArray(aParsedInterval), "Array is returned");
			assert.ok(aParsedInterval[0] instanceof Date, "First date is parsed correctly.");
			assert.ok(aParsedInterval[1] instanceof Date, "Second date is parsed correctly.");

			aParsedInterval = oIntervalFormat.parse("Jan 13 -- 24, 2019");
			assert.deepEqual(aParsedInterval, [null, null], "Unknown delimiter - [null, null] returned.");

			// Locale ja_JA
			oIntervalFormat = DateFormat.getDateInstance({ interval: true }, new Locale("ja_JA"));
			aParsedInterval = oIntervalFormat.parse("2019/01/13～2019/01/24");

			assert.ok(aParsedInterval[0] instanceof Date, "First date is parsed correctly.");
			assert.ok(aParsedInterval[1] instanceof Date, "Second date is parsed correctly.");

			// Locale ca
			oIntervalFormat = DateFormat.getDateInstance({ interval: true }, new Locale("ca"));
			aParsedInterval = oIntervalFormat.parse("13 de gen. 2019 - 24 de gen. 2019");

			assert.ok(aParsedInterval[0] instanceof Date, "First date is parsed correctly.");
			assert.ok(aParsedInterval[1] instanceof Date, "Second date is parsed correctly.");

			// Locale fa_IR
			oIntervalFormat = DateFormat.getDateInstance({ interval: true }, new Locale("fa_IR"));
			aParsedInterval = oIntervalFormat.parse("19 فوریهٔ 2019 تا 21 فوریهٔ 2019");

			assert.ok(aParsedInterval[0] instanceof Date, "First date is parsed correctly.");
			assert.ok(aParsedInterval[1] instanceof Date, "Second date is parsed correctly.");


		});

		QUnit.test("DateFormat with invalid date", function (assert) {
			this.oFormat.format();
			assert.equal(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.equal(this.oErrorSpy.getCall(0).args[0], "The given date instance isn't valid.");
		});

		QUnit.module("interval behavior - greatest Diff");

		QUnit.test("Greatest Diff Group: Date instance", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMd"
			});

			var oDate = UniversalDate.getInstance(new Date(2017, 3, 11), CalendarType.Gregorian);
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 2 * 24 * 3600 * 1000), CalendarType.Gregorian);

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Day": true }, "correct diff returned");

			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 12 * 3600 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "if two dates are identical on the fields which we compare, 'null' will be returned");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "Md"
			});

			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(2018, 4, 11));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Year": true, "Month": true, "Week": true }, "correct diff returned");

			oDate = UniversalDate.getInstance(new Date(2017, 3, 11), CalendarType.Gregorian);
			oDate1 = UniversalDate.getInstance(new Date(2017, 6, 11), CalendarType.Gregorian);
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Quarter": true, "Month": true, "Week": true }, "correct diff returned");
		});

		QUnit.test("Greatest Diff Group: Time instance", function (assert) {
			var oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Hour": true, "Minute": true }, "correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(2017, 4, 11));
			assert.equal(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 1800 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Minute": true }, "the correct diff returned.");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			});

			oDate = UniversalDate.getInstance(new Date(2017, 3, 11, 11));
			oDate1 = UniversalDate.getInstance(new Date(2017, 4, 11, 12));

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "DayPeriod": true, "Hour": true }, "correct diff returned");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "K"
			});

			oDate = UniversalDate.getInstance(new Date(2017, 3, 11, 11));
			oDate1 = UniversalDate.getInstance(new Date(2017, 4, 11, 12));

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "DayPeriod": true, "Hour": true }, "correct diff returned");
		});

		QUnit.test("Greatest Diff Group: DateTime instance", function (assert) {
			var oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Hour": true, "Minute": true }, "correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 999));
			assert.equal(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(new Date(2017, 3, 11));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 1800 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Minute": true }, "correct diff returned.");
		});

		QUnit.module("format & parse interval");

		QUnit.test("Interval format with Date instance under locale DE", function (assert) {
			var oLocale = new Locale("de-DE");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			}, oLocale);

			var oDate = new Date(2017, 3, 11);
			var oDate1 = new Date(oDate.getTime() + 2 * 24 * 3600 * 1000);
			var sResult = oIntervalFormat.format([oDate, oDate1]);

			assert.equal(sResult, "11.–13. Apr. 2017");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);
		});

		QUnit.test("Interval format with Date instance, Japanese calendar, different eras, en-US", function (assert) {
			var oLocale = new Locale("en-US");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd",
				calendarType: "Japanese"
			}, oLocale);

			var oDate1, oDate2, sResult;

			// Same era
			oDate1 = new Date(2019, 2, 1);
			oDate2 = new Date(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "Mar 1 – Apr 1, 31 Heisei");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Same era, different year
			oDate1 = new Date(2018, 3, 1);
			oDate2 = new Date(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "Apr 1, 30 – Apr 1, 31 Heisei");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era
			oDate1 = new Date(2019, 3, 1);
			oDate2 = new Date(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "Apr 1, 31 Heisei – May 1, 1 Reiwa");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era, same year
			oDate1 = new Date(1989, 4, 1);
			oDate2 = new Date(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "May 1, 1 Heisei – May 1, 1 Reiwa");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

		});

		QUnit.test("Interval format with Date instance, Japanese calendar, different eras, ja-JA", function (assert) {
			var oLocale = new Locale("ja-JA");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd",
				calendarType: "Japanese"
			}, oLocale);

			var oDate1, oDate2, sResult;

			// Same era
			oDate1 = new Date(2019, 2, 1);
			oDate2 = new Date(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "平成31年3月1日～4月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Same era, different year
			oDate1 = new Date(2018, 3, 1);
			oDate2 = new Date(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "平成30年4月1日～31年4月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era
			oDate1 = new Date(2019, 3, 1);
			oDate2 = new Date(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "平成31年4月1日～令和元年5月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era, same year
			oDate1 = new Date(1989, 4, 1);
			oDate2 = new Date(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult, "平成元年5月1日～令和元年5月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

		});

		QUnit.test("Interval format with Date instance regarding calendar week and quarter", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yw"
			});

			var oDate = UniversalDate.getInstance(new Date(2017, 2, 31));
			var oDate1 = UniversalDate.getInstance(new Date(2017, 3, 1));
			var sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "week 13 of 2017", "Two dates correctly formatted");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMw"
			});
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "Mar 2017 (week: 13) – Apr 2017 (week: 13)", "Two dates correctly formatted");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yQ"
			});
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "Q1 2017 – Q2 2017", "Two dates correctly formatted");

			oDate = UniversalDate.getInstance(new Date(2017, 3, 1));
			oDate1 = UniversalDate.getInstance(new Date(2017, 3, 13));
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "Q2 2017", "Two dates correctly formatted");
		});

		QUnit.test("Interval format without 'format' option - fallback interval pattern is used", function (assert) {
			var oLocale = new Locale("de-DE");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				style: "short"
			}, oLocale);
			var oDate = new Date(2017, 3, 11);
			var oDate1 = new Date(oDate.getTime() + 2 * 24 * 3600 * 1000);

			var sResult = oIntervalFormat.format([oDate, oDate1]);

			assert.equal(sResult, "11.04.17 – 13.04.17");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oLocale = new Locale("de-DE");
			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				pattern: "G y MM d"
			}, oLocale);

			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "n. Chr. 2017 04 11 – n. Chr. 2017 04 13");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);
		});

		QUnit.test("Allow single date", function(assert) {
			var oDate1 = new Date(2019, 0, 24),
				oDate2 = new Date(2019, 0, 31);

			// default interval formatting
			var oIntervalFormat = DateFormat.getDateInstance({ interval: true	});
			assert.equal(oIntervalFormat.format([oDate1, oDate2]), "Jan 24, 2019 – Jan 31, 2019", "Date interval returned");
			assert.equal(oIntervalFormat.format([oDate1, null]), "", "Empty String returned");
			assert.equal(oIntervalFormat.format([oDate1, oDate1]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019"), [oDate1, oDate1], "Array with two dates returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 - Jan 31, 2019"), [oDate1, oDate2], "Array with two dates returned.");

			// allow single date option set
			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				singleIntervalValue: true
			});

			assert.equal(oIntervalFormat.format([oDate1, null]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.equal(oIntervalFormat.format([oDate1, oDate2]), "Jan 24, 2019 – Jan 31, 2019", "Date interval returned");
			assert.equal(oIntervalFormat.format([oDate1, null]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.equal(oIntervalFormat.format([null, oDate1]), "", "Empty String returned.");
			assert.equal(oIntervalFormat.format([null, null]), "", "Empty String returned.");
			assert.equal(oIntervalFormat.format([oDate1, oDate1]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");

			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019"), [oDate1, null], "Array with single Date and null returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 – Jan 24, 2019"), [oDate1, null], "Array with two date objects is returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 – Jan 31, 2019"), [oDate1, oDate2], "Array with two date objects is returned.");
		});

		QUnit.test("am/pm", function (assert) {
			var oLocale = new Locale("en");

			var oDate = new Date(1970, 0, 1, 9, 0, 0);
			var oDate1 = new Date(1970, 0, 1, 13, 0, 0);

			var oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			}, oLocale);

			var sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "9 AM – 1 PM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oDate = new Date(1970, 0, 1, 11, 0, 0);
			oDate1 = new Date(1970, 0, 1, 12, 0, 0);

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "K"
			}, oLocale);

			// optimised interval pattern only uses 'h'. 'K' is automatically converted
			// to 'h'.
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(sResult, "11 AM – 12 PM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oDate = new Date(1970, 0, 1, 10, 0, 0);
			oDate1 = new Date(1970, 0, 1, 11, 0, 0);

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			}, oLocale);

			// optimised interval pattern only uses 'h'. 'K' is automatically converted
			// to 'h'.
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.equal(oIntervalFormat.format([oDate, oDate1]), "10 – 11 AM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);
		});

		QUnit.test("Interval with two identical dates", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMd"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = new Date(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.equal(sResult.toString(), oIntervalFormat._format(oDate).toString(), "if two dates are identical on the fields which we compare, a single date will be formatted.");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate]);
		});

		QUnit.test("Interval with two identical dates after formatting different dates", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = new Date(2017, 3, 11);
			var oDate2 = new Date(2017, 3, 12);
			var sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.equal(sResult.toString(), "Apr 11 – 12, 2017", "Different dates are formatted correctly");

			var sResult = oIntervalFormat.format([oDate1, oDate1]);
			assert.equal(sResult.toString(), "Apr 11, 2017", "Single Date if formatted correctly afterwards");
		});

		QUnit.test("Interval with two identical dates without format property", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = new Date(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.equal(sResult.toString(), oIntervalFormat._format(oDate).toString(), "if two dates are identical on the fields which we compare, a single date will be formatted.");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate]);
		});

		QUnit.test("Interval with year and quarter in skeleton", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yQQQ"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = new Date(2017, 2, 11);
			var oDate2 = new Date(2017, 5, 11);
			var oDate3 = new Date(2017, 1, 11);

			var sResult1 = oIntervalFormat.format([oDate1, oDate2]);
			var sResult2 = oIntervalFormat.format([oDate1, oDate3]);

			assert.equal(sResult1, "Q1 2017 – Q2 2017");
			assert.equal(sResult2, "Q1 2017");
		});

		QUnit.test("Interval with year and weekNumber in skeleton", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yw"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = new Date(2017, 2, 11);
			var oDate2 = new Date(2017, 2, 21);
			var oDate3 = new Date(2017, 2, 22);

			var sResult1 = oIntervalFormat.format([oDate1, oDate2]);
			var sResult2 = oIntervalFormat.format([oDate2, oDate3]);

			assert.equal(sResult1, "week 10 of 2017 – week 12 of 2017");
			assert.equal(sResult2, "week 12 of 2017");
		});

		QUnit.module("Interval parse in addition");

		QUnit.test("Interval parse with invalid format string", function (assert) {
			var oIntervalFormat1 = DateFormat.getDateInstance({
				format: "yMMM",
				interval: true
			});

			var oIntervalFormat2 = DateFormat.getDateInstance({
				format: "yMMMd",
				interval: true
			});

			var oDate = new Date(2017, 3, 11);
			var oDate1 = new Date(oDate.getTime() + 2 * 24 * 3600 * 1000);

			var sResult = oIntervalFormat1.format([oDate, oDate1]);
			assert.deepEqual(oIntervalFormat2.parse(sResult), [null, null]);
		});

		QUnit.test("Interval parse with fallback pattern", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				format: "yMMMd",
				interval: true
			});

			var oDate = new Date(2017, 3, 11);
			var oDate1 = new Date(2017, 3, 13);
			var aCompare = [oDate, oDate1];

			assert.deepEqual(oIntervalFormat.parse("4/11/17 – 4/13/17"), aCompare, "Parse fallback short style");
			assert.deepEqual(oIntervalFormat.parse("4/11/17 - 4/13/17"), aCompare, "Parse fallback short style with common connector");
			assert.deepEqual(oIntervalFormat.parse("Apr 11, 2017 – Apr 13, 2017"), aCompare, "Parse fallback medium style");
			assert.deepEqual(oIntervalFormat.parse("Apr 11, 2017 - Apr 13, 2017"), aCompare, "Parse fallback medium style with common connector");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 – 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd'");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 - 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("20170411 – 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd'");
			assert.deepEqual(oIntervalFormat.parse("20170411 - 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("041117 – 041317"), aCompare, "Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("041117 - 041317"), aCompare, "Parse fallback with no delimiter and common connector");
			assert.deepEqual(oIntervalFormat.parse("04112017 – 04132017"), aCompare, "Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("04112017 - 04132017"), aCompare, "Parse fallback with no delimiter and common connector");
		});

		QUnit.test("Interval parse with fallback locale de-DE", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				pattern: "'abc' dd.MM" // a non match pattern to test the fallbacks
			}, new Locale("de_DE"));

			var oDate = new Date(2017, 3, 11);
			var oDate1 = new Date(2017, 3, 13);
			var aCompare = [oDate, oDate1];

			assert.deepEqual(oIntervalFormat.parse("11.04.17 – 13.04.17"), aCompare, "Parse fallback short style");
			assert.deepEqual(oIntervalFormat.parse("11.04.17 - 13.04.17"), aCompare, "Parse fallback short style with common connector");
			assert.deepEqual(oIntervalFormat.parse("11.04.2017 – 13.04.2017"), aCompare, "Parse fallback medium style");
			assert.deepEqual(oIntervalFormat.parse("11.04.2017 - 13.04.2017"), aCompare, "Parse fallback medium style with common connector");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 – 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd'");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 - 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("20170411 – 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd'");
			assert.deepEqual(oIntervalFormat.parse("20170411 - 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("110417 – 130417"), aCompare, "Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("110417 - 130417"), aCompare, "Parse fallback with no delimiter and common connector");
			assert.deepEqual(oIntervalFormat.parse("11042017 – 13042017"), aCompare, "Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("11042017 - 13042017"), aCompare, "Parse fallback with no delimiter and common connector");
		});

		QUnit.module("FallbackFormatOptions");

		QUnit.test("Immutability of multiple DateFormat instances", function (assert) {
			var oDate = new Date(2017, 3, 11);
			var oDateFormat1 = DateFormat.getDateInstance({
				style: "short",
				interval: true
			}),
			oDateFormat2 = DateFormat.getDateInstance({
				style: "long"
			}),
			oDateFormat3 = DateFormat.getDateInstance({
				pattern: "M/d/yy"
			});

			var sString1 = oDateFormat1.format([oDate, oDate]);
			var oDateParsed1 = oDateFormat1.parse(sString1);
			assert.ok(Array.isArray(oDateParsed1), "Parsed result should be an array.");

			var sString2 = oDateFormat2.format(oDate);
			var oDateParsed2 = oDateFormat2.parse(sString2);
			assert.notOk(Array.isArray(oDateParsed2), "Parsed result shouldn't be an array.");

			var oDateParsed3 = oDateFormat3.parse("August 29, 2018");
			assert.notOk(Array.isArray(oDateParsed3), "Parsed result shouldn't be an array.");
		});
	});
