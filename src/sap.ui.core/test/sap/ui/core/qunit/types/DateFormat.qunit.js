sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/util/extend",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/FormatUtils",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/Buddhist",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/library",
	"sap/ui/core/Supportability",
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/test/TestUtils",
	// load all required calendars in advance
	"sap/ui/core/date/Gregorian",
	"sap/ui/core/date/Islamic",
	"sap/ui/core/date/Japanese",
	"sap/ui/core/date/Persian"
], function(Log, Formatting, Localization, extend, DateFormat, FormatUtils, Locale, LocaleData, Buddhist, UniversalDate,
		UI5Date, library, Supportability, CalendarWeekNumbering, TestUtils) {
	"use strict";
	/* eslint-disable max-nested-callbacks */
	/*global QUnit, sinon */

	// shortcut for sap.ui.core.CalendarType
	const CalendarType = library.CalendarType;
	const oDateTime = UI5Date.getInstance("2000-09-23T06:46:13Z");
	const oTZDateTime = UI5Date.getInstance("2000-09-23T03:46:13+05:30");
	const oDefaultDate = DateFormat.getInstance();
	const oDefaultDateTime = DateFormat.getDateTimeInstance();
	const oDefaultTime = DateFormat.getTimeInstance();
	const sDefaultTimezone = Localization.getTimezone();
	const sDefaultLanguage = Localization.getLanguage();

	//*********************************************************************************************
	QUnit.module("DateFormat instantiation and parseCldrDatePattern");

	//*********************************************************************************************
	QUnit.test("instance fields day periods", function (assert) {
		var oDateFormatInstance = DateFormat.getInstance(new Locale("ko"));

		assert.deepEqual(oDateFormatInstance.aDayPeriodsAbbrev, ["AM", "PM"]);
		assert.deepEqual(oDateFormatInstance.aDayPeriodsNarrow, ["AM", "PM"]);
		assert.deepEqual(oDateFormatInstance.aDayPeriodsWide, ["오전", "오후"]);
	});

	QUnit.test("instance fields flexible day periods", function (assert) {
		var oDateFormatInstance = DateFormat.getInstance(new Locale("de"));

		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsAbbrev, {
			"midnight" : "Mitternacht",
			"morning1" : "morgens",
			"morning2" : "vorm.",
			"afternoon1" : "mittags",
			"afternoon2" : "nachm.",
			"evening1" : "abends",
			"night1" : "nachts"
		});
		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsNarrow, {
			"midnight" : "Mitternacht",
			"morning1" : "morgens",
			"morning2" : "vorm.",
			"afternoon1" : "mittags",
			"afternoon2" : "nachm.",
			"evening1" : "abends",
			"night1" : "nachts"
		});
		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsWide, {
			"midnight" : "Mitternacht",
			"morning1" : "morgens",
			"morning2" : "vormittags",
			"afternoon1" : "mittags",
			"afternoon2" : "nachmittags",
			"evening1" : "abends",
			"night1" : "nachts"
		});
	});

	QUnit.test("instance fields flexible day periods stand-alone", function (assert) {
		var oDateFormatInstance = DateFormat.getInstance(new Locale("de"));

		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsAbbrevSt, {
			"midnight" : "Mitternacht",
			"morning1" : "Morgen",
			"morning2" : "Vorm.",
			"afternoon1" : "Mittag",
			"afternoon2" : "Nachm.",
			"evening1" : "Abend",
			"night1" : "Nacht"
		});
		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsNarrowSt, {
			"midnight" : "Mitternacht",
			"morning1" : "Morgen",
			"morning2" : "Vorm.",
			"afternoon1" : "Mittag",
			"afternoon2" : "Nachm.",
			"evening1" : "Abend",
			"night1" : "Nacht"
		});
		assert.deepEqual(oDateFormatInstance.oFlexibleDayPeriodsWideSt, {
			"midnight" : "Mitternacht",
			"morning1" : "Morgen",
			"morning2" : "Vormittag",
			"afternoon1" : "Mittag",
			"afternoon2" : "Nachmittag",
			"evening1" : "Abend",
			"night1" : "Nacht"
		});
	});

	//*********************************************************************************************
	QUnit.test("pattern 'aaaa'", function (assert) {
		assert.deepEqual(DateFormat.getInstance().parseCldrDatePattern("aaaa"),
			[{digits : 4, symbol : "a", type : "amPmMarker"}]);
	});

	//*********************************************************************************************
	QUnit.test("Creation of fallback formatter", function (assert) {
		var oFormat,
			oFormatMock = this.mock(DateFormat),
			oFormatOptions = {pattern: "~foo"},
			oBaseFallbackFormatOptions = {
				calendarType: "Gregorian",
				showDate: undefined,
				showTime: undefined,
				showTimezone: undefined
			},
			oLocale = new Locale("en");


		// prevents creation of additional fallback patterns
		oFormatMock.expects("_createFallbackOptionsWithoutDelimiter").exactly(2).returns([]);
		// creation of oFormat instance
		oFormatMock.expects("createInstance")
			.withExactArgs(sinon.match.same(oFormatOptions), sinon.match.same(oLocale),
				sinon.match.same(DateFormat.oDateInfo))
			.callThrough();
		// creation of fallback formatter, see DateFormat.oDateInfo.aFallbackFormatOptions
		[
			{style: "short"}, {style: "medium"}, {pattern: "yyyy-MM-dd"}, {pattern: "yyyyMMdd", strictParsing: true}
		].forEach(function (oOptions) {
			Object.assign(oOptions, oBaseFallbackFormatOptions);
			oFormatMock.expects("createInstance")
				.withExactArgs(oOptions, sinon.match.same(oLocale), sinon.match.same(DateFormat.oDateInfo), true)
				.callThrough();
		});

		// code under test
		oFormat = DateFormat.getInstance(oFormatOptions, oLocale);

		assert.strictEqual(oFormat.oFormatOptions.pattern, "~foo");
		assert.strictEqual(oFormat.aFallbackFormats.length, 4);
		assert.strictEqual(oFormat.aFallbackFormats[0].oFormatOptions.pattern, "M/d/yy");
		assert.strictEqual(oFormat.aFallbackFormats[1].oFormatOptions.pattern, "MMM d, y");
		assert.strictEqual(oFormat.aFallbackFormats[2].oFormatOptions.pattern, "yyyy-MM-dd");
		assert.strictEqual(oFormat.aFallbackFormats[3].oFormatOptions.pattern, "yyyyMMdd");
	});

	//*********************************************************************************************
	QUnit.test("Prevent duplicate fallback formats", function (assert) {
		var oFormat,
			oFormatOptions = {},
			oLocale = new Locale("en");

		this.mock(DateFormat).expects("_createFallbackFormat")
			.withExactArgs([
					{pattern: "MMddyyyy", strictParsing: true},
					{pattern: "MMddyy", strictParsing: true},
					{style: "short"},
					{style: "medium"},
					{pattern: "yyyy-MM-dd"},
					{pattern: "yyyyMMdd", strictParsing: true}
				], "Gregorian", sinon.match.same(oLocale), sinon.match.same(DateFormat.oDateInfo),
				/*oFormatOptions: copied+enhanced*/sinon.match.object)
			.callThrough();

		// code under test
		oFormat = DateFormat.getInstance(oFormatOptions, oLocale);

		assert.deepEqual(oFormat.aFallbackFormats.length, 6);
	});

	//*********************************************************************************************
	QUnit.test("Prevent duplicate interval patterns", function (assert) {
		var oFormat,
			oInfo = {oDefaultFormatOptions: {}, aFallbackFormatOptions: []},
			oFormatOptions = {format: "yMd", interval: true, intervalDelimiter: "..."},
			oLocale = new Locale("en");

		// code under test
		oFormat = DateFormat.createInstance(oFormatOptions, oLocale, oInfo);

		assert.deepEqual(oFormat.intervalPatterns, [
			"M/d/y'...'M/d/y",
			"M/d/y\u2009\u2013\u2009M/d/y",
			"M/d/y",
			"M/d/y - M/d/y"
		]);
	});

		QUnit.module("DateFormat format", {
			beforeEach: function (assert) {
				Localization.setTimezone("Europe/Berlin");
				var Log = sap.ui.require("sap/base/Log");
				assert.ok(Log, "Log module should be available");
				this.oErrorSpy = sinon.spy(Log, "error");
			},
			afterEach: function () {
				this.oErrorSpy.restore();
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format invalid date", function (assert) {
			var that = this;
			var iInitialCount = 0;
			assert.strictEqual(this.oErrorSpy.callCount, 0, "No error is logged yet");
			[{}, {getTime: function() {}}, UI5Date.getInstance("")].forEach(function (oInvalidDate) {
				assert.strictEqual(oDefaultDate.format(oInvalidDate), "", "Formatting an invalid date should return ''");
				iInitialCount++;
				assert.strictEqual(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
				assert.strictEqual(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "The given date instance isn't valid.", "Correct log message");
			});

			// interval with only one value
			assert.strictEqual(DateFormat.getInstance({
				interval: true
			}).format([UI5Date.getInstance("")]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.strictEqual(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.strictEqual(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "Interval DateFormat can only format with 2 date instances but 1 is given.", "Correct log message");

			// singleIntervalValue, with first date being null
			assert.deepEqual(DateFormat.getInstance({
				interval: true,
				singleIntervalValue: true
			}).format([null, null]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.strictEqual(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.strictEqual(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "First date instance which is passed to the interval DateFormat shouldn't be null.", "Correct log message");

			// interval with 2 invalid values
			assert.strictEqual(DateFormat.getInstance({
				interval: true
			}).format([UI5Date.getInstance(""), null]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.strictEqual(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.strictEqual(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "At least one date instance which is passed to the interval DateFormat isn't valid.", "Correct log message");
		});

		QUnit.test("format undefined date", function (assert) {
			var oDate;
			assert.strictEqual(oDefaultDate.format(oDate), "", "Formatting an undefined date should return ''");
		});

		QUnit.test("format default date", function (assert) {
			assert.strictEqual(oDefaultDate.format(oDateTime), "Sep 23, 2000", "default date");
			assert.strictEqual(oDefaultDateTime.format(oDateTime), "Sep 23, 2000, 8:46:13\u202fAM", "default datetime");
			assert.strictEqual(oDefaultTime.format(oDateTime), "8:46:13\u202fAM", "default time");
		});

		QUnit.test("format default date UTC", function (assert) {
			assert.strictEqual(oDefaultDate.format(oTZDateTime, true), "Sep 22, 2000", "default date UTC");
			assert.strictEqual(oDefaultDateTime.format(oTZDateTime, true), "Sep 22, 2000, 10:16:13\u202fPM",
				"default datetime UTC");
			assert.strictEqual(oDefaultTime.format(oTZDateTime, true), "10:16:13\u202fPM", "default time UTC");
		});

		QUnit.test("format date with given style", function (assert) {
			assert.strictEqual(DateFormat.getDateInstance({ style: "short" }).format(oDateTime),
				"9/23/00", "short date");
			assert.strictEqual(DateFormat.getDateInstance({ style: "medium" }).format(oDateTime),
				"Sep 23, 2000", "medium date");
			assert.strictEqual(DateFormat.getDateInstance({ style: "long" }).format(oDateTime),
				"September 23, 2000", "long date");
			assert.strictEqual(DateFormat.getDateInstance({ style: "full" }).format(oDateTime),
				"Saturday, September 23, 2000", "full date");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "short" }).format(oDateTime),
				"9/23/00, 8:46\u202fAM", "short datetime");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "medium" }).format(oDateTime),
				"Sep 23, 2000, 8:46:13\u202fAM", "medium datetime");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "long" }).format(oDateTime),
				"September 23, 2000, 8:46:13\u202fAM GMT+02:00", "long datetime");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "full" }).format(oDateTime),
				"Saturday, September 23, 2000, 8:46:13\u202fAM GMT+02:00", "full datetime");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "medium/short" }).format(oDateTime),
				"Sep 23, 2000, 8:46\u202fAM", "medium/short datetime");
			assert.strictEqual(DateFormat.getDateTimeInstance({ style: "long/medium" }).format(oDateTime),
				"September 23, 2000, 8:46:13\u202fAM", "long/medium datetime");
			assert.strictEqual(DateFormat.getTimeInstance({ style: "short" }).format(oDateTime),
				"8:46\u202fAM", "short time");
			assert.strictEqual(DateFormat.getTimeInstance({ style: "medium" }).format(oDateTime),
				"8:46:13\u202fAM", "medium time");
			assert.strictEqual(DateFormat.getTimeInstance({ style: "long" }).format(oDateTime),
				"8:46:13\u202fAM GMT+02:00", "long time");
			assert.strictEqual(DateFormat.getTimeInstance({ style: "full" }).format(oDateTime),
				"8:46:13\u202fAM GMT+02:00", "full time");
		});

		QUnit.test("format date for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.strictEqual(DateFormat.getDateInstance(oLocale).format(oDateTime), "23.09.2000", "date with defaults for given locale");
			assert.strictEqual(DateFormat.getDateTimeInstance(oLocale).format(oDateTime), "23.09.2000, 08:46:13", "datetime with defaults for given locale");
			assert.strictEqual(DateFormat.getTimeInstance(oLocale).format(oDateTime), "08:46:13", "time with defaults for given locale");
		});

		QUnit.test("format date with custom pattern for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.strictEqual(DateFormat.getDateInstance({ pattern: "dd MMM yyyy" }, oLocale).format(oDateTime), "23 Sept. 2000", "date with custom pattern for given locale");
			assert.strictEqual(DateFormat.getDateTimeInstance({ pattern: "dd MMM yyyy hh:mm:ss a" }, oLocale).format(oDateTime), "23 Sept. 2000 08:46:13 AM", "datetime with custom pattern for given locale");
			assert.strictEqual(DateFormat.getTimeInstance({ pattern: "hh:mm:ss a" }, oLocale).format(oDateTime), "08:46:13 AM", "datetime with custom pattern for given locale");
		});

		QUnit.test("Parse out-of-normal-range seconds value to minutes and seconds", function (assert) {
			var sPattern = "mm:ss";
			var sSourcePattern = "ssss";

			var oParseDateFormat = DateFormat.getDateTimeInstance({ pattern: sSourcePattern });
			var sDateString = "1199"; // 1199 seconds equal 19 minutes and 59 seconds

			var oParsed = oParseDateFormat.parse(sDateString);
			assert.ok(oParsed instanceof Date, "should be a date");
			assert.strictEqual(oParsed.getTime(), -2401000, // 31 Dec 1969 23:19:59 _UTC_
				"should parse to correct date");

			var oDateFormat = DateFormat.getDateTimeInstance({ pattern: sPattern });
			var sResult = oDateFormat.format(oParsed);
			assert.strictEqual(sResult, "19:59", "Should return correct value");
		});

		QUnit.module("format relative with timezone America/Los_Angeles", {
			beforeEach: function () {
				Localization.setTimezone("America/Los_Angeles");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format custom date (UTC-7)", function (assert) {
			var oDate = UI5Date.getInstance(Date.UTC(2001, 6, 4, 19, 8, 56)), // Jul 4 12:08:56 2001 (Los Angeles UTC-7)
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
					"EEE, d MMM yyyy HH:mm:ss Z": "Wed, 4 Jul 2001 12:08:56 -0700",
					"yyMMddHHmmssZ": "010704120856-0700",
					"yyyy-MM-dd'T'HH:mm:ss.SSSZ": "2001-07-04T12:08:56.235-0700",
					"yyyy-MM-dd'T'HH:mm:ss.SSSXXX": "2001-07-04T12:08:56.235-07:00",
					"YYYY-'W'ww-u": "2001-W27-4",
					"'datetime'''yyyy-MM-dd'T'HH:mm:ss''": "datetime'2001-07-04T12:08:56'"
				};

			// Simulate a time offset of -7h (America/Los_Angeles)
			var oTimeZoneOffsetStub = this.stub(Date.prototype, "getTimezoneOffset").returns(7 * 60);
			// eslint-disable-next-line no-extend-native
			Date.prototype.getTimezoneShort = function() {};
			var oGetTimezoneShortStub = this.stub(Date.prototype, "getTimezoneShort").returns("PDT");
			// eslint-disable-next-line no-extend-native
			Date.prototype.getTimezoneLong = function() {};
			var oGetTimezoneLongStub = this.stub(Date.prototype, "getTimezoneLong").returns("Pacific Daylight Time");
			oDate.setMilliseconds(235);

			for (sCustomPattern in oCustomDatePatterns) {
				oCustomDate = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
				assert.strictEqual(oCustomDate.format(oDate), oCustomDatePatterns[sCustomPattern], "pattern:" + sCustomPattern + ", date: " + oDate);
			}

			delete Date.prototype.getTimezoneShort;
			delete Date.prototype.getTimezoneLong;
			oTimeZoneOffsetStub.restore();
			oGetTimezoneShortStub.restore();
			oGetTimezoneLongStub.restore();
		});

		QUnit.module("parse using pattern in UTC", {
			beforeEach: function () {
				Localization.setTimezone("Etc/UTC");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("parse using pattern 'SSSSSS' (6 millisecond digits)", function (assert) {
			var sCustomPattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX";
			var oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
			var sDateString = "2020-12-14T15:29:04.303118Z";
			var oParsed = oCustomDateFormat.parse(sDateString);
			assert.ok(oParsed instanceof Date, "should be a date");
			assert.strictEqual(oParsed.getTime(), 1607959744303, "should match the first 3 millisecond digits of this date");
		});

		QUnit.test("parse using pattern 'SSS' (3 millisecond digits) but input has 6 millisecond digits", function (assert) {
			var sCustomPattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX";
			var oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
			var sDateString = "2020-12-14T15:29:04.303118Z";
			var oParsed = oCustomDateFormat.parse(sDateString);
			assert.ok(!oParsed, "result is not a date");
		});


		QUnit.test("Parse with case insensitivity", function (assert) {
			[
				// invalid locale, fallback to "en"
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "MarchSunday-12-2017-00",
					otherCases: [
						"MARCHSunday-12-2017-00",
						"MARCHSUNDAy-12-2017-00"
					],
					locale: "invalid"
				},
				// locale, no -> nb, special character "ø"
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "marssøndag-12-2017-00",
					otherCases: [
						"MARSSØNDAG-12-2017-00"
					],
					locale: "no"
				},
				// locale, zh-Hant -> zh_TW, only one case
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "3月星期日-12-2017-00",
					locale: "zh-Hant"
				},
				// locale, zh-Hans -> zh_CN, only one case
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "三月星期日-12-2017-00",
					locale: "zh-Hans"
				},
				// locale, sh -> sr-Latn
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "martnedelja-12-2017-00",
					otherCases: [
						"MARTNEDELJA-12-2017-00"
					],
					locale: "sh"
				},
				// German locale, special character "ä"
				{
					date: Date.UTC(2017, 2, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "MärzSonntag-12-2017-00",
					otherCases: [
						"märzSonntag-12-2017-00",
						"MÄRZSonntag-12-2017-00"
					],
					locale: "de-DE"
				},
				// French locale, special character "é"
				{
					date: Date.UTC(2017, 1, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "févrierdimanche-12-2017-00",
					otherCases: [
						"févrierdimanche-12-2017-00",
						"FÉVRIERDIMANCHE-12-2017-00"
					],
					locale: "fr-FR"
				},
				// Serbian locale, special character "љ"
				{
					date: Date.UTC(2017, 11, 4),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "децембарпонедељак-04-2017-00",
					otherCases: [
						"ДЕЦЕМБАРПОНЕДЕЉАК-04-2017-00"
					],
					locale: "sr"
				},
				// Turkish locale, characters i and I are not the same letter
				// I -> toLocaleLowerCase("tr") -> ı
				// İ -> toLocaleLowerCase("tr") -> i
				{
					date: Date.UTC(2017, 7, 15),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "AğustosSalı-15-2017-00",
					otherCases: [
						"AĞUSTOSSALI-15-2017-00",
						"ağustossalı-15-2017-00"
					],
					notMatching: [
						"AğustosSali-15-2017-00" // has an "i" instead of "ı"
					],
					locale: "tr-TR"
				},
				// Turkish locale, longest match ("Cumartesi" starts with "Cuma")
				// Friday - Cuma
				// Saturday - Cumartesi
				{
					date: Date.UTC(2017, 7, 19),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "AğustosCumartesi-19-2017-00",
					otherCases: [
						"AĞUSTOSCUMARTESİ-19-2017-00"
					],
					notMatching: [
						"AĞUSTOSCUMARTESI-19-2017-00" // has an "I" instead of "İ"
					],
					locale: "tr-TR"
				},
				// Lithuanian locale, characters I can have in lowercase length 2
				// i\u0307 -> toLocaleUpperCase("lt") -> I
				{
					date: Date.UTC(2017, 9, 12),
					pattern: "QQQ'-'QQQQ'-'dd'-'MMMM'-'yyyy'-'HH",
					exactCase: "IV k.-IV ketvirtis-12-spalio-2017-00",
					otherCases: [
						"iv k.-iv ketvirtis-12-spalio-2017-00"
					],
					// length changes during case conversion
					notMatching: [
						"i\u0307V k.-IV ketvirtis-12-spalio-2017-00",
						"i\u0307V k.-i\u0307V ketvirtis-12-spalio-2017-00",
						"IV k.-i\u0307V ketvirtis-12-spalio-2017-00"
					],
					locale: "lt-LT"
				},
				// Greek locale, characters ς and σ are upper-cased to Σ
				// σ -> toLocaleUpperCase("el") -> Σ
				// ς -> toLocaleUpperCase("el") -> Σ (at the end of the word)

				// note about browser differences:
				// Chrome/Edge/Safari:
				//      "έ".toLocaleUpperCase("el") // Ε (charCode: 917)
				//      "ί".toLocaleUpperCase("el") // Ι (charCode: 921)
				// Firefox:
				//      "έ".toLocaleUpperCase("el") // Έ (charCode: 904)
				//      "ί".toLocaleUpperCase("el") // Ί (charCode: 906)

				// Month (M) - Σεπτεμβρίου ("Σ" at the beginning of the word)
				{
					date: Date.UTC(2017, 8, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "ΣεπτεμβρίουΤρίτη-12-2017-00",
					otherCases: [
						"σεπτεμβρίουτρίτη-12-2017-00",
						"ΣΕΠΤΕΜΒΡίΟΥΤΡίΤΗ-12-2017-00"
					],
					locale: "el"
				},

				// Stand-Alone Month (L) - Σεπτέμβριος ("ς" at the end of the word)
				{
					date: Date.UTC(2017, 8, 12),
					pattern: "LLLLEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "ΣεπτέμβριοςΤρίτη-12-2017-00",
					otherCases: [
						"ΣεπτέμβριοΣΤρίτη-12-2017-00",
						"ΣΕΠΤέΜΒΡΙΟΣΤΡίΤΗ-12-2017-00"
					],
					locale: "el"
				},
				// Japanese locale, only one case
				{
					date: Date.UTC(2017, 8, 12),
					pattern: "MMMMEEEE'-'dd'-'yyyy'-'HH",
					exactCase: "9月火曜日-12-2017-00",
					locale: "ja-JP"
				}
			].forEach(function(oFixture) {
				var oFormat = DateFormat.getDateTimeInstance({
					pattern: oFixture.pattern
				}, new Locale(oFixture.locale));

				var oDate = UI5Date.getInstance(oFixture.date);
				var sResult = oFormat.format(oDate);

				assert.strictEqual(sResult, oFixture.exactCase, "format matches exact case '" + oFixture.exactCase + "'");
				assert.deepEqual(oFormat.parse(sResult), oDate, "parse formatted string back to '" + oDate + "'");
				if (Array.isArray(oFixture.otherCases)) {
					oFixture.otherCases.forEach(function(sOtherCase) {
						assert.deepEqual(oFormat.parse(sOtherCase), oDate, "parse case: '" + sOtherCase + "'");
					});
				}
				if (Array.isArray(oFixture.notMatching)) {
					oFixture.notMatching.forEach(function(sNotMatching) {
						assert.deepEqual(oFormat.parse(sNotMatching), null, "cannot parse '" + sNotMatching + "'");
					});
				}
			});
		});

		QUnit.module("format Asia/Tokyo", {
			beforeEach: function () {
				Localization.setTimezone("Asia/Tokyo");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("timezone pattern", function (assert) {
			var oDate = UI5Date.getInstance("2001-07-04T12:08:56.235Z");

			var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX" });
			assert.strictEqual(oDateFormat.format(oDate, true), "2001-07-04T12:08:56.235Z", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSX with utc");
			assert.strictEqual(oDateFormat.format(oDate), "2001-07-04T21:08:56.235+09", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSX");

			oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSz" });
			assert.strictEqual(oDateFormat.format(oDate, true), "2001-07-04T12:08:56.235GMTZ", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSz with utc");
			assert.strictEqual(oDateFormat.format(oDate), "2001-07-04T21:08:56.235GMT+09:00", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSz");
		});

		QUnit.module("format with timezone Etc/UTC", {
			beforeEach: function () {
				Localization.setTimezone("Etc/UTC");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format custom date timezone UTC+0 (GMT)", function (assert) {
			var oDate = UI5Date.getInstance(Date.UTC(2018, 9, 9, 13, 37, 56, 235)), // Tue Oct 9 13:37:56 2018 (Etc/UTC)
				oCustomDateFormat, sFormatted;

			// Simulate a time offset of 0h (Etc/UTC)
			var oTimeZoneOffsetStub = this.stub(Date.prototype, "getTimezoneOffset").returns(0);
			oDate.setMilliseconds(235);

			[{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZ",
				expected:"2018-10-09T13:37:56.235+0000"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
				expected:"2018-10-09T13:37:56.235+0000"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZZ",
				expected:"2018-10-09T13:37:56.235+0000"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSX",
				expected:"2018-10-09T13:37:56.235Z"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXX",
				expected:"2018-10-09T13:37:56.235Z"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
				expected:"2018-10-09T13:37:56.235Z"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXX",
				expected:"2018-10-09T13:37:56.235Z"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX",
				expected:"2018-10-09T13:37:56.235Z"
			}].forEach(function (oTestData) {
				oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: oTestData.pattern });
				sFormatted = oCustomDateFormat.format(oDate, false);
				assert.strictEqual(sFormatted, oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(sFormatted, false, true) instanceof Date, "is a Date");
			});
			oTimeZoneOffsetStub.restore();
		});

		QUnit.module("format with timezone Europe/Berlin", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format custom date timezone UTC+2 (EET)", function (assert) {
			var oDate = UI5Date.getInstance("2018-10-09T11:37:56Z"),
				oCustomDateFormat, sFormatted;
			oDate.setMilliseconds(235);

			[{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZ",
				expected:"2018-10-09T13:37:56.235+0200"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
				expected:"2018-10-09T13:37:56.235+0200"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZZ",
				expected:"2018-10-09T13:37:56.235+0200"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSX",
				expected:"2018-10-09T13:37:56.235+02"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXX",
				expected:"2018-10-09T13:37:56.235+0200"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
				expected:"2018-10-09T13:37:56.235+02:00"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXX",
				expected:"2018-10-09T13:37:56.235+0200"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX",
				expected:"2018-10-09T13:37:56.235+02:00"
			}].forEach(function (oTestData) {
				oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: oTestData.pattern });
				sFormatted = oCustomDateFormat.format(oDate, false);
				assert.strictEqual(sFormatted, oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(sFormatted, false, true) instanceof Date, "is a Date");
			});
		});

		QUnit.module("format with timezone Asia/Calcutta", {
			beforeEach: function () {
				Localization.setTimezone("Asia/Calcutta");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format custom date timezone UTC+5:30 (IST)", function (assert) {
			var oDate = UI5Date.getInstance(Date.UTC(2018, 9, 9, 8, 7, 56, 235)), //UTC+5.5
				oCustomDateFormat, sFormatted;

			// Simulate a time offset of 5.5h (Asia/Calcutta)
			var oTimeZoneOffsetStub = this.stub(Date.prototype, "getTimezoneOffset").returns(-5.5 * 60);

			[{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZ",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSZZZ",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSX",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXX",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
				expected:"2018-10-09T13:37:56.235+05:30"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXX",
				expected:"2018-10-09T13:37:56.235+0530"
			},
			{
				pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX",
				expected:"2018-10-09T13:37:56.235+05:30"
			}].forEach(function (oTestData) {
				oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: oTestData.pattern });
				sFormatted = oCustomDateFormat.format(oDate, false);
				assert.strictEqual(sFormatted, oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(sFormatted, false, true) instanceof Date, "is a Date");
			});
			oTimeZoneOffsetStub.restore();
		});

		QUnit.module("format relative");


		function getExpectedRelativeDate(iDiff, iTarget, oFormatOptions, sLocale) {
			oFormatOptions = extend({}, oFormatOptions);
			oFormatOptions.relative = false;

			var oFormat = DateFormat.getDateInstance(oFormatOptions, new Locale(sLocale)),
				sTargetDate = oFormat.format(UI5Date.getInstance(iTarget)) + "",
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
				var oFormat1 = DateFormat.getDateInstance(extend({ relative: true }, oFormatOptions), new Locale(sLocale)),
					oFormat2 = DateFormat.getDateInstance(oFormatOptions, new Locale(sLocale)),
					oToday = UI5Date.getInstance(),
					iToday = oToday.getTime(),
					iTarget, aExpected;

				for (var i = -10; i <= 10; i++) {
					// use Date Object for getting Dates in the past and in the future, to avoid summer/standard timezone change conflicts
					iTarget = UI5Date.getInstance(iToday).setDate(oToday.getDate() + i);
					aExpected = getExpectedRelativeDate(i, iTarget, oFormatOptions, sLocale);
					if (bFormat) {
						assert.strictEqual(oFormat1.format(UI5Date.getInstance(iTarget)), aExpected[0], sTestInfo + " ----------- Today" + (i >= 0 ? " + " : " ") + i + " -> " + aExpected[0] + " " + (aExpected[0] == aExpected[1] ? "" : "(" + aExpected[1] + ")"));
					} else {
						assert.strictEqual(oFormat2.format(oFormat1.parse(aExpected[0])) + "", aExpected[1], sTestInfo + " ----------- " + aExpected[0] + " -> Today" + (i >= 0 ? " + " : " ") + i + " -> " + aExpected[1]);
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
				oDate = UI5Date.getInstance(),
				sResult;

			oDate.setFullYear(oDate.getFullYear() - 2000);
			sResult = oDateFormat.format(oDate);

			assert.strictEqual(sResult, "2000 years ago", "The date should be formatted correctly");
		});

		QUnit.test("format relative date without modifying the input date object", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true
			});
			var oDate = UI5Date.getInstance("2020-08-17T21:59:00Z");
			var beforeMs = oDate.getTime();

			oDateFormat.format(oDate);

			assert.strictEqual(beforeMs, oDate.getTime(), "date instance should not be modified, after DateFormat#format call");
		});

		QUnit.module("DateFormat relative date (1st jan 2021)", {
			beforeEach: function () {
				// Fri Jan 01 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-01-01T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative to Jan 1st", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});

			[{
				inputDate: "2021-01-29T09:59:00", // jan 29th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-01-30T09:59:00", // jan 30th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-01-31T09:59:00", // jan 31th
				outputRelative: "this month"
			}, {
				inputDate: "2021-02-01T09:59:00", // feb 1st
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

	//*********************************************************************************************
	QUnit.module("relative to", {
		beforeEach: function () {
			Localization.setTimezone("Europe/Berlin");
		},
		afterEach: function () {
			this.clock.restore();
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	//*********************************************************************************************
	QUnit.test("'2021-03-22T23:30:00Z' in Europe/Berlin; format and parse with UTC set/not set", function (assert) {
		var oDate0 = UI5Date.getInstance(Date.UTC(2021, 2, 21, 3, 33)), // 21.03.2021, 04:33 Europe/Berlin
			oDate1 = UI5Date.getInstance(Date.UTC(2021, 2, 21, 23, 33)), // 22.03.2021, 00:33 Europe/Berlin
			oDateFormat = DateFormat.getDateInstance({relative: true}, new Locale("de"));

		// set now to 23.03.2021, 0:30 (GMT+1, Europe/Berlin)
		this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-03-22T23:30:00Z").getTime());

		// bUTC === true
		assert.strictEqual(oDateFormat.format(oDate0, true), "vorgestern");
		assert.strictEqual(oDateFormat.format(oDate1, true), "vorgestern");

		assert.deepEqual(oDateFormat.parse("vorgestern", true), UI5Date.getInstance(Date.UTC(2021, 2, 21, 0, 30)));

		// bUTC not set
		assert.strictEqual(oDateFormat.format(oDate0), "vorgestern");
		assert.strictEqual(oDateFormat.format(oDate1), "vor 1 Tag");

		assert.deepEqual(oDateFormat.parse("vorgestern"), UI5Date.getInstance(Date.UTC(2021, 2, 20, 23, 30)));
		assert.deepEqual(oDateFormat.parse("vor 1 Tag"), UI5Date.getInstance(Date.UTC(2021, 2, 21, 23, 30)));
	});

	//*********************************************************************************************
	QUnit.test("'2021-03-22T03:30:00Z' in Europe/Berlin; format and parse with UTC set/not set", function (assert) {
		var oDate0 = UI5Date.getInstance(Date.UTC(2021, 2, 21, 3, 33)), // 21.03.2021, 04:33 Europe/Berlin
			oDate1 = UI5Date.getInstance(Date.UTC(2021, 2, 21, 23, 33)), // 22.03.2021, 00:33 Europe/Berlin
			oDateFormat = DateFormat.getDateInstance({relative: true}, new Locale("de"));

		// set now to 22.03.2021, 4:30 (GMT+1, Europe/Berlin)
		this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-03-22T03:30:00Z").getTime());

		// bUTC === true
		assert.strictEqual(oDateFormat.format(oDate0, true), "vor 1 Tag");
		assert.strictEqual(oDateFormat.format(oDate1, true), "vor 1 Tag");

		assert.deepEqual(oDateFormat.parse("vor 1 Tag", true), UI5Date.getInstance(Date.UTC(2021, 2, 21, 4, 30)));

		// bUTC not set
		assert.strictEqual(oDateFormat.format(oDate0), "vor 1 Tag");
		assert.strictEqual(oDateFormat.format(oDate1), "heute");

		assert.deepEqual(oDateFormat.parse("vor 1 Tag"), UI5Date.getInstance(Date.UTC(2021, 2, 21, 3, 30)));
		assert.deepEqual(oDateFormat.parse("heute"), UI5Date.getInstance(Date.UTC(2021, 2, 22, 3, 30)));
	});

	//*********************************************************************************************
	QUnit.module("'now' for different time zones", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers(UI5Date.getInstance("2022-12-15T09:45:00Z").getTime());
		},
		afterEach: function () {
			this.clock.restore();
			Localization.setTimezone(sDefaultTimezone);
		}
	});

	//*********************************************************************************************
	[{
		timezone: "Pacific/Niue", // -11:00
		utcDate: UI5Date.getInstance("2022-12-14T22:45:00Z")
	}, {
		timezone: "Pacific/Honolulu", // -10:00
		utcDate: UI5Date.getInstance("2022-12-14T23:45:00Z")
	}, {
		timezone: "America/New_York", // -05:00
		utcDate: UI5Date.getInstance("2022-12-15T04:45:00Z")
	}, {
		timezone: "UTC", // +00:00
		utcDate: UI5Date.getInstance("2022-12-15T09:45:00Z")
	}, {
		timezone: "Europe/Berlin", // +01:00
		utcDate: UI5Date.getInstance("2022-12-15T10:45:00Z")
	}, {
		timezone: "Asia/Kathmandu", // +05:45
		utcDate: UI5Date.getInstance("2022-12-15T15:30:00Z")
	}, {
		timezone: "Pacific/Auckland", // +13:00
		utcDate: UI5Date.getInstance("2022-12-15T22:45:00Z")
	}].forEach(function (oFixture) {
		QUnit.test("'now' relative to '2022-12-15T09:45:00Z' in " + oFixture.timezone, function (assert) {
			var oDate,
				// DateFormat instances format "now" as "today"
				oRelativeDateFormat = DateFormat.getDateInstance({relative: true}, new Locale("en")),
				// DateTimeFormat instances format "now" as "now"
				oRelativeDateTimeFormat = DateFormat.getDateTimeInstance({relative: true}, new Locale("en"));

			Localization.setTimezone(oFixture.timezone);

			// code under test
			oDate = oRelativeDateFormat.parse("now");
			assert.strictEqual(oDate.valueOf(), UI5Date.getInstance(Date.UTC(2022, 11, 15, 9, 45)).valueOf());

			// code under test
			assert.strictEqual(oRelativeDateFormat.format(oDate), "today");

			// code under test
			oDate = oRelativeDateTimeFormat.parse("now");
			assert.strictEqual(oDate.valueOf(), UI5Date.getInstance(Date.UTC(2022, 11, 15, 9, 45)).valueOf());

			// code under test
			assert.strictEqual(oRelativeDateTimeFormat.format(oDate), "now");

			// bUTC === true
			// code under test
			oDate = oRelativeDateFormat.parse("now", true);
			assert.strictEqual(oDate.valueOf(), oFixture.utcDate.valueOf());

			// code under test
			assert.strictEqual(oRelativeDateFormat.format(oDate, true), "today");

			// code under test
			oDate = oRelativeDateTimeFormat.parse("now", true);
			assert.strictEqual(oDate.valueOf(), oFixture.utcDate.valueOf());

			// code under test
			assert.strictEqual(oRelativeDateTimeFormat.format(oDate, true), "now");
		});
	});

		QUnit.module("German summer time 28.03.2021 (2h->3h) (offset: +2 -> +1)", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-03-27T23:30:00Z").getTime());
				// 28.03 - 0:30 (GMT+1)
			},
			afterEach: function () {
				this.clock.restore();
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format date relative to summer time +23 h same day", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = UI5Date.getInstance(Date.UTC(2021,2,28,21,33));
			// 28.03 - 0:30 (GMT+1)
			// -
			// 28.03 - 23:33 (GMT+2)
			// => heute
			var sRelative = oDateFormat.format(oDate);

			assert.strictEqual(sRelative, "heute");
		});

		QUnit.module("German winter time 31.10.2021 (3h->2h) (offset: +1 -> +2)", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-10-30T22:30:00Z").getTime());
				// 31.10 - 0:30 (GMT+2)
			},
			afterEach: function () {
				this.clock.restore();
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format date relative to winter time +23 h same day", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = UI5Date.getInstance(Date.UTC(2021,9,31,22,59));
			// 31.10 - 23:30 (GMT+1)

			// today 0:30 - 23:30 => heute
			var sRelative = oDateFormat.format(oDate);

			assert.strictEqual(sRelative, "heute");
		});

		QUnit.module("DateFormat relative date (jan 14th 2021)", {
			beforeEach: function () {
				// Thu Jan 14 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-01-14T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative date to jan 14th", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});


			[{
				inputDate: "2021-01-20T09:59:00", // jan 14th - jan 20th
				outputRelative: "in 6 days"
			}, {
				inputDate: "2021-01-21T09:59:00", // jan 14th - jan 21th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-22T09:59:00", // jan 14th - jan 22th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-23T09:59:00", // jan 14th - jan 23th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-24T09:59:00", // jan 14th - jan 24th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-25T09:59:00", // jan 14th - jan 25th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-26T09:59:00", // jan 14th - jan 26th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-27T09:59:00", // jan 14th - jan 27th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-28T09:59:00", // jan 14th - jan 28th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-29T09:59:00", // jan 14th - jan 29th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-30T09:59:00", // jan 14th - jan 30th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-31T09:59:00", // jan 14th - jan 31th
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-02-01T09:59:00", // jan 14th - feb 1st
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-02-12T09:59:00", // jan 14th - feb 12th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-02-13T09:59:00", // jan 14th - feb 13th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-02-14T09:59:00", // jan 14th - feb 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-02-15T09:59:00", // jan 14th - feb 15th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (feb 1st 2021)", {
			beforeEach: function () {
				// Mon Feb 01 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-02-01T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative date to feb 1st", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});

			[{
				inputDate: "2021-02-28T09:59:00", // feb 1st - feb 28th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-03-01T09:59:00", // feb 1st - mar 1st
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-02T09:59:00", // feb 1st - mar 2nd
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-03T09:59:00", // feb 1st - mar 3rd
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-04T09:59:00", // feb 1st - mar 4th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-05T09:59:00", // feb 1st - mar 5th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-06T09:59:00", // feb 1st - mar 6th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (feb 14th 2021)", {
			beforeEach: function () {
				// Sun Feb 14 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-02-14T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative date to feb 14th", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});

			[{
				inputDate: "2021-01-13T09:59:00", // feb 14th - jan 13th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-01-14T09:59:00", // feb 14th - jan 14th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-01-15T09:59:00", // feb 14th - jan 15th
				outputRelative: "5 weeks ago"
			}, {
				inputDate: "2021-01-16T09:59:00", // feb 14th - jan 16th
				outputRelative: "5 weeks ago"
			}, {
				inputDate: "2021-01-17T09:59:00", // feb 14th - jan 17th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-01-18T09:59:00", // feb 14th - jan 18th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-01-19T09:59:00", // feb 14th - jan 19th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-28T09:59:00", // feb 14th - feb 28th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-03-01T09:59:00", // feb 14th - mar 1st
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-03-13T09:59:00", // feb 14th - mar 13th
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-03-14T09:59:00", // feb 14th - mar 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-15T09:59:00", // feb 14th - mar 15th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-16T09:59:00", // feb 14th - mar 16th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-17T09:59:00", // feb 14th - mar 17th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-18T09:59:00", // feb 14th - mar 18th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-19T09:59:00", // feb 14th - mar 19th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (mar 1st 2021)", {
			beforeEach: function () {
				// Mon Mar 01 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-03-01T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative date to mar 1st", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});

			[{
				inputDate: "2021-01-28T09:59:00", // mar 1st - jan 28th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-29T09:59:00", // mar 1st - jan 29th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-30T09:59:00", // mar 1st - jan 30th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-31T09:59:00", // mar 1st - jan 31st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-02-01T09:59:00", // mar 1st - feb 1st
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-13T09:59:00", // mar 1st - feb 13th
				outputRelative: "3 weeks ago"
			}, {
				inputDate: "2021-02-14T09:59:00", // mar 1st - feb 14th
				outputRelative: "2 weeks ago"
			}, {
				inputDate: "2021-02-15T09:59:00", // mar 1st - feb 15th
				outputRelative: "2 weeks ago"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual( oDateFormat.format(oDate), oFixture.outputRelative, "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (mar 14th 2021)", {
			beforeEach: function () {
				// Sun Mar 14 2021 09:59:00 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-03-14T09:59:00").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("format relative date to mar 14th", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});

			[{
				inputDate: "2021-01-01T09:59:00", // mar 14th - jan 1st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-12T09:59:00", // mar 14th - jan 12th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-13T09:59:00", // mar 14th - jan 13th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-14T09:59:00", // mar 14th - jan 14th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-31T09:59:00", // mar 14th - jan 31st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-02-01T09:59:00", // mar 14th - feb 1st
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-08T09:59:00", // mar 14th - feb 8th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-09T09:59:00", // mar 14th - feb 9th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-10T09:59:00", // mar 14th - feb 10th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-11T09:59:00", // mar 14th - feb 11th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-12T09:59:00", // mar 14th - feb 12th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-13T09:59:00", // mar 14th - feb 13th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-14T09:59:00", // mar 14th - feb 14th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-15T09:59:00", // mar 14th - feb 15th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-16T09:59:00", // mar 14th - feb 16th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-17T09:59:00", // mar 14th - feb 17th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-18T09:59:00", // mar 14th - feb 18th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-04-13T09:59:00", // mar 14th - apr 13th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-04-14T09:59:00", // mar 14th - apr 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-15T09:59:00", // mar 14th - apr 15th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-16T09:59:00", // mar 14th - apr 16th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-30T09:59:00", // mar 14th - apr 30th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-05-01T09:59:00", // mar 14th - may 1st
				outputRelative: "in 2 months"
			}].forEach(function (oFixture) {
				var oDate = UI5Date.getInstance(oFixture.inputDate);
				assert.strictEqual(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat#parse custom patterns with timezone", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(Date.UTC(2018, 7, 2, 11, 37));
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				this.clock.restore();
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("parse custom date", function (assert) {

			var oCustomDatePatterns = {
				"yyyy.MM.dd 'at' HH:mm:ss z": ["2001.07.04 at 12:08:56 GMT+02:00", Date.UTC(2001, 6, 4, 10, 8, 56)],
				"yyyy.MM.dd GGGG 'at' HH:mm:ss z": ["2001.07.04 Anno Domini at 12:08:56 GMT+02:00", Date.UTC(2001, 6, 4, 10, 8, 56)],
				"EEE, MMM d, ''yy Z": ["Wed, Jul 4, '01 +0200", Date.UTC(2001, 6, 3, 22)],
				"h:mm a z": ["12:08 PM GMT+01:00", Date.UTC(1970, 0, 1, 11, 8)],
				"hh 'o''clock' a, X": ["12 o'clock PM, +01", Date.UTC(1970, 0, 1, 11)],
				"hh 'o''clock' a, XX": ["12 o'clock PM, +0100", Date.UTC(1970, 0, 1, 11)],
				"hh 'o''clock' a, XXX": ["12 o'clock PM, +01:00", Date.UTC(1970, 0, 1, 11)],
				"K:mm a, z": ["0:08 PM, UTC+01:00", Date.UTC(1970, 0, 1, 11, 8)],

				"yyyyy.MMMMM.dd hh:mm aaa": ["02001.July.04 12:08 PM", Date.UTC(2001, 6, 4, 10, 8)],
				"EEE, d MMM yyyy HH:mm:ss": ["Wed, 4 Jul 2001 12:08:56", Date.UTC(2001, 6, 4, 10, 8, 56)],
				"yyMMddHHmms": ["010704120856", Date.UTC(2001, 6, 4, 10, 8, 56)],
				"yyyy-MM-dd'T'HH:mm:ss.SSS": ["2001-07-04T12:08:56.235", Date.UTC(2001, 6, 4, 10, 8, 56, 235)],
				"yyyy-MM-dd GGG 'T'HH:mm:ss.SSSX": ["2001-07-04 AD T12:08:56.235+02", Date.UTC(2001, 6, 4, 10, 8, 56, 235)],
				"yyyy-MM-dd'T'HH:mm:ss.SSSX": ["2000-01-01T16:00:00.000+01", Date.UTC(2000, 0, 1, 15)],
				"yyyy-MM-dd'T'HH:mm:ss.SSSXX": ["2000-01-01T16:00:00.000+0100", Date.UTC(2000, 0, 1, 15)],
				"yyyy-MM-dd'T'HH:mm:ss.SSSXXX": ["2000-01-01T16:00:00.000+01:00", Date.UTC(2000, 0, 1, 15)]
			};

			for (var sCustomPattern in oCustomDatePatterns) {
				var oCustomDate = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
				assert.strictEqual(oCustomDate.parse(oCustomDatePatterns[sCustomPattern][0]).getTime(), oCustomDatePatterns[sCustomPattern][1], "Pattern: " + sCustomPattern);

			}
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
			assert.strictEqual(oFormat.parse(twoDigitMinus70 + "-01-01").getFullYear(), 1908, "Year 1908");
			assert.strictEqual(oFormat.parse(twoDigitMinus71 + "-01-01").getFullYear(), 2007, "Year 2007");
		});

		QUnit.module("DateFormat#parse (anno 2018)", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(Date.UTC(2018, 7, 2, 11, 37));
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
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

		QUnit.test("parse default date UTC", function (assert) {
			var oDate = oDefaultDate.parse("May 23, 2008", true);
			assert.strictEqual(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getUTCMonth(), 4, "Month May");
			assert.strictEqual(oDate.getUTCDate(), 23, "Day 23rd");

			oDate = oDefaultDateTime.parse("May 23, 2008, 5:23:00 PM", true);
			assert.strictEqual(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getUTCMonth(), 4, "Month May");
			assert.strictEqual(oDate.getUTCDate(), 23, "Day 23rd");
			assert.strictEqual(oDate.getUTCHours(), 17, "Hours 17");
			assert.strictEqual(oDate.getUTCMinutes(), 23, "Minutes 23");
		});

		QUnit.test("parse default date", function (assert) {
			var oDate = oDefaultDate.parse("May 23, 2008");
			assert.strictEqual(oDate.getFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getMonth(), 4, "Month May");
			assert.strictEqual(oDate.getDate(), 23, "Day 23rd");

			oDate = oDefaultDateTime.parse("May 23, 2008, 5:23:00 PM");
			assert.strictEqual(oDate.getFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getMonth(), 4, "Month May");
			assert.strictEqual(oDate.getDate(), 23, "Day 23rd");
			assert.strictEqual(oDate.getHours(), 17, "Hours 17");
			assert.strictEqual(oDate.getMinutes(), 23, "Minutes 23");
		});

		QUnit.test("parse empty string", function (assert) {
			var oDate = oDefaultDate.parse("");
			assert.strictEqual(oDate, null, "parsing empty string returns null");
		});

		QUnit.test("parse date two digit year", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }),
				oDate;

			// current year is 2018
			var twoDigitPlus30 = "48"; // 2018 + 30
			var twoDigitPlus29 = "47"; // 2018 + 29
			assert.strictEqual(oFormat.parse(twoDigitPlus30 + "-01-01").getFullYear(), 1948, "Year 1948");
			assert.strictEqual(oFormat.parse(twoDigitPlus29 + "-01-01").getFullYear(), 2047, "Year 2047");

			oDate = oFormat.parse("2014-03-12");
			assert.strictEqual(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("0014-03-12");
			assert.strictEqual(oDate.getFullYear(), 14, "Year 14");
			oDate = oFormat.parse("04-03-12");
			assert.strictEqual(oDate.getFullYear(), 2004, "Year 2004");
			oDate = oFormat.parse("14-03-12");
			assert.strictEqual(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("34-03-12");
			assert.strictEqual(oDate.getFullYear(), 2034, "Year 2034");
			oDate = oFormat.parse("54-03-12");
			assert.strictEqual(oDate.getFullYear(), 1954, "Year 1954");
			oDate = oFormat.parse("74-03-12");
			assert.strictEqual(oDate.getFullYear(), 1974, "Year 1974");
			oDate = oFormat.parse("94-03-12");
			assert.strictEqual(oDate.getFullYear(), 1994, "Year 1994");
		});

		QUnit.test("parse date two digit year UTC", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd", UTC: true }),
				oDate;
			oDate = oFormat.parse("2014-03-12");
			assert.strictEqual(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("0014-03-12");
			assert.strictEqual(oDate.getFullYear(), 14, "Year 14");
			oDate = oFormat.parse("04-03-12");
			assert.strictEqual(oDate.getFullYear(), 2004, "Year 2004");
			oDate = oFormat.parse("14-03-12");
			assert.strictEqual(oDate.getFullYear(), 2014, "Year 2014");
			oDate = oFormat.parse("34-03-12");
			assert.strictEqual(oDate.getFullYear(), 2034, "Year 2034");
			oDate = oFormat.parse("54-03-12");
			assert.strictEqual(oDate.getFullYear(), 1954, "Year 1954");
			oDate = oFormat.parse("74-03-12");
			assert.strictEqual(oDate.getFullYear(), 1974, "Year 1974");
			oDate = oFormat.parse("94-03-12");
			assert.strictEqual(oDate.getFullYear(), 1994, "Year 1994");
		});

		QUnit.test("parse default date UTC", function (assert) {
			var oDate = oDefaultDate.parse("May 23, 2008", true);
			assert.strictEqual(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getUTCMonth(), 4, "Month May");
			assert.strictEqual(oDate.getUTCDate(), 23, "Day 23rd");

			oDate = oDefaultDateTime.parse("May 23, 2008, 5:23:00 PM", true);
			assert.strictEqual(oDate.getUTCFullYear(), 2008, "Year 2008");
			assert.strictEqual(oDate.getUTCMonth(), 4, "Month May");
			assert.strictEqual(oDate.getUTCDate(), 23, "Day 23rd");
			assert.strictEqual(oDate.getUTCHours(), 17, "Hours 17");
			assert.strictEqual(oDate.getUTCMinutes(), 23, "Minutes 23");
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
				assert.strictEqual(oCustomDate.parse(oCustomDateFormats[sCustomFormat][0]).getTime(), oCustomDateFormats[sCustomFormat][1], sCustomFormat);

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
			var oDate = UI5Date.getInstance("2014-04-07T00:00:00"),
				oFormat = DateFormat.getDateInstance(),
				sDateIn = "040714", oDateOut = oFormat.parse(sDateIn);

			assert.strictEqual(oDateOut.toString(), oDate.toString(), "6 digit fallback: " + sDateIn + " to " + oDateOut);

			oDateOut = oFormat.parse("000100");
			assert.strictEqual(oDateOut, null, "000100 shouldn't be parsed as a valid date");

			oDateOut = oFormat.parse("010000");
			assert.strictEqual(oDateOut, null, "010000 shouldn't be parsed as a valid date");

			sDateIn = "04072014";
			oDateOut = oFormat.parse(sDateIn);
			assert.strictEqual(oDateOut.toString(), oDate.toString(), "8 digit fallback: " + sDateIn + " to " + oDateOut);
			sDateIn = "20140407";
			oDateOut = oFormat.parse(sDateIn);
			assert.strictEqual(oDateOut.toString(), oDate.toString(), "ISO fallback: " + sDateIn + " to " + oDateOut);
		});

		QUnit.test("parse and format two digit years", function (assert) {
			var oFormat = DateFormat.getDateInstance({ pattern: "M/d/y" }),
				sDate, oDate;
			oDate = oFormat.parse("1/1/1");
			assert.strictEqual(oDate.getFullYear(), 2001, "Parsed as 2001");
			sDate = oFormat.format(oDate);
			assert.strictEqual(sDate, "1/1/2001", "Formatted as 2001");

			// 1/1/1001
			oDate = UI5Date.getInstance(0);
			oDate.setFullYear(1001, 0, 1);
			assert.strictEqual(oDate.getFullYear(), 1001, "Fullyear is 1001");
			assert.strictEqual(oDate.getMonth(), 0, "Month is 0");
			sDate = oFormat.format(oDate);
			assert.strictEqual(sDate, "1/1/1001", "Formatted as 1001");
			oDate = oFormat.parse(sDate);
			assert.strictEqual(oDate.getFullYear(), 1001, "Fullyear is still 1001");

			// 1/1/0002
			oDate = UI5Date.getInstance(0);
			oDate.setFullYear(2, 0, 1);
			assert.strictEqual(oDate.getFullYear(), 2, "Fullyear is 2");
			assert.strictEqual(oDate.getMonth(), 0, "Month is 0");
			sDate = oFormat.format(oDate);
			assert.strictEqual(sDate, "1/1/0002", "Formatted as 0002");
			oDate = oFormat.parse(sDate);
			assert.strictEqual(oDate.getFullYear(), 2, "Fullyear is still 2");

			// 1/1/0001
			oDate = UI5Date.getInstance(0);
			oDate.setFullYear(1, 0, 1);
			assert.strictEqual(oDate.getFullYear(), 1, "Fullyear is 1");
			assert.strictEqual(oDate.getMonth(), 0, "Month is 0");
			sDate = oFormat.format(oDate);
			assert.strictEqual(sDate, "1/1/0001", "Formatted as 0001");
			oDate = oFormat.parse(sDate);
			assert.strictEqual(oDate.getFullYear(), 1, "Fullyear is still 1");
		});

		QUnit.test("parse and format quarters", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oQuarter1 = DateFormat.getDateInstance({ pattern: "qq" }),
				oQuarter2 = DateFormat.getDateInstance({ pattern: "qqq" }),
				oQuarter3 = DateFormat.getDateInstance({ pattern: "qqqq" }),
				oQuarter4 = DateFormat.getDateInstance({ pattern: "qqqqq" }),
				oQuarter5 = DateFormat.getDateInstance({ pattern: "QQQQQ" }),
				oQuarterCombined = DateFormat.getDateInstance({ pattern: "EEE, MMM d yyyy, QQQ" });

			assert.strictEqual(oQuarter1.format(oDate), "03", "03");
			assert.strictEqual(oQuarter2.format(oDate), "Q3", "Q3");
			assert.strictEqual(oQuarter3.format(oDate), "3rd quarter", "3rd quarter");
			assert.strictEqual(oQuarter4.format(oDate), "3", "3");
			assert.strictEqual(oQuarter5.format(oDate), "3", "3");
			assert.strictEqual(oQuarterCombined.format(oDate), "Wed, Jul 4 2001, Q3", "Wed, Jul 4 2001, Q3");
			assert.strictEqual(oQuarterCombined.parse("Wed, Jul 4 2001, Q3").valueOf(), oDate.valueOf(), "Wed, Jul 4 2001, Q3");
		});

		QUnit.test("parse with fallback patterns", function (assert) {
			var oLocaleEN = new Locale("en_US"),
				oLocaleDE = new Locale("de_DE"),
				oFormat,
				iCompare = UI5Date.getInstance(1975, 3, 16).getTime(),
				iFallbackOptionsLength = DateFormat.oDateInfo.aFallbackFormatOptions.length;

			oFormat = DateFormat.getDateInstance({ style: "long" }, oLocaleEN);
			assert.strictEqual(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.strictEqual(oFormat.parse("April 16, 1975").getTime(), iCompare, "Parse long style");
			assert.strictEqual(oFormat.parse("Apr 16, 1975").getTime(), iCompare, "Parse fallback medium style");
			assert.strictEqual(oFormat.parse("4/16/75").getTime(), iCompare, "Parse fallback short style");
			assert.strictEqual(oFormat.parse("04161975").getTime(), iCompare, "Parse fallback without separators");
			assert.strictEqual(oFormat.parse("041675").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.strictEqual(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.strictEqual(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }, oLocaleEN);
			assert.strictEqual(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.strictEqual(oFormat.parse("16041975").getTime(), iCompare, "Parse fallback from removing delimiters from given pattern");
			assert.strictEqual(oFormat.parse("Apr 16, 1975").getTime(), iCompare, "Parse fallback medium style");
			assert.strictEqual(oFormat.parse("4/16/75").getTime(), iCompare, "Parse fallback short style");
			assert.strictEqual(oFormat.parse("04161975").getTime(), iCompare, "Parse fallback without separators");
			assert.strictEqual(oFormat.parse("041675").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.strictEqual(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.strictEqual(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ style: "long", calendarType: CalendarType.Islamic }, oLocaleEN);
			assert.strictEqual(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.strictEqual(oFormat.parse("Rabiʻ II 4, 1395 AH").getTime(), iCompare, "Parse long style");
			assert.strictEqual(oFormat.parse("Rab. II 4, 1395 AH").getTime(), iCompare, "Parse fallback medium style");
			assert.strictEqual(oFormat.parse("4/4/1395 AH").getTime(), iCompare, "Parse fallback short style");
			assert.strictEqual(oFormat.parse("04041395").getTime(), iCompare, "Parse fallback without separators");
			assert.strictEqual(oFormat.parse("040495").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.strictEqual(oFormat.parse("1395-04-04").getTime(), iCompare, "Parse fallback ISO");
			assert.strictEqual(oFormat.parse("13950404").getTime(), iCompare, "Parse fallback ABAP");

			oFormat = DateFormat.getDateInstance({ style: "long" }, oLocaleDE);
			assert.strictEqual(DateFormat.oDateInfo.aFallbackFormatOptions.length, iFallbackOptionsLength, "original fallback options shouldn't be changed");
			assert.strictEqual(oFormat.parse("16. April 1975").getTime(), iCompare, "Parse long style");
			assert.strictEqual(oFormat.parse("16.4.1975").getTime(), iCompare, "Parse fallback medium style");
			assert.strictEqual(oFormat.parse("16.4.75").getTime(), iCompare, "Parse fallback short style");
			assert.strictEqual(oFormat.parse("16041975").getTime(), iCompare, "Parse fallback without separators");
			assert.strictEqual(oFormat.parse("160475").getTime(), iCompare, "Parse fallback without separators, short year");
			assert.strictEqual(oFormat.parse("1975-04-16").getTime(), iCompare, "Parse fallback ISO");
			assert.strictEqual(oFormat.parse("19750416").getTime(), iCompare, "Parse fallback ABAP");

		});

		QUnit.test("parse and format fractional seconds", function (assert) {
			var oDate1 = UI5Date.getInstance(1234),
				oDate2 = UI5Date.getInstance(14),
				oMS1 = DateFormat.getDateInstance({ pattern: "s.S" }),
				oMS2 = DateFormat.getDateInstance({ pattern: "s.SSS" }),
				oMS3 = DateFormat.getDateInstance({ pattern: "s.SSSSSS" });

			assert.strictEqual(oMS1.format(oDate1, true), "1.2", "1.2");
			assert.strictEqual(oMS2.format(oDate1, true), "1.234", "1.234");
			assert.strictEqual(oMS3.format(oDate1, true), "1.234000", "1.234000");
			assert.strictEqual(oMS1.format(oDate2, true), "0.0", "0.0");
			assert.strictEqual(oMS2.format(oDate2, true), "0.014", "0.014");
			assert.strictEqual(oMS3.format(oDate2, true), "0.014000", "0.014000");
			assert.strictEqual(oMS1.parse("0.1", true).valueOf(), 100, "0.1");
			assert.strictEqual(oMS1.parse("0.003", true), null, "0.003");
			assert.strictEqual(oMS1.parse("0.123", true), null, "0.123");
			assert.strictEqual(oMS1.parse("0.123456", true), null, "0.123456");
			assert.strictEqual(oMS2.parse("0.1", true).valueOf(), 100, "0.1");
			assert.strictEqual(oMS2.parse("0.003", true).valueOf(), 3, "0.003");
			assert.strictEqual(oMS2.parse("0.123", true).valueOf(), 123, "0.123");
			assert.strictEqual(oMS2.parse("0.123456", true), null, "0.123456");
			assert.strictEqual(oMS3.parse("0.1", true).valueOf(), 100, "0.1");
			assert.strictEqual(oMS3.parse("0.003", true).valueOf(), 3, "0.003");
			assert.strictEqual(oMS3.parse("0.123", true).valueOf(), 123, "0.123");
			assert.strictEqual(oMS3.parse("0.123456", true).valueOf(), 123, "0.123456");
		});

		QUnit.test("parse time format with am/pm appearing at the beginning", function (assert) {
			var oTimeStart = DateFormat.getTimeInstance({ pattern: "ah:mm:ss" });
			assert.notEqual(oTimeStart.parse("PM12:22:52").getTime(), oTimeStart.parse("AM12:22:52").getTime(), "PM/AM info should be correctly considered");
		});

		QUnit.test("parse time format with variants of am/pm", function (assert) {
			var aVariants = [
				"am", "pm",
				"AM", "PM",
				"a.m.", "p.m.",
				"am.", "pm.",
				"A.M.", "P.M.",
				"AM.", "PM.",
				"a. m.", "p. m.", // with SPACE (\x20)
				"a." + "\xA0" + "m.", "p." + "\xA0" + "m." // with NO-BREAK SPACE (\xa0)
			];
			var oFormat = DateFormat.getTimeInstance({
				pattern: "a"
			});

			aVariants.forEach(function (sDate) {
				var oDate = oFormat.parse(sDate);
				assert.ok(oDate instanceof Date, sDate + " correctly parsed");
			});

			assert.strictEqual(oFormat.parse("a..m"), null, "Invalid variant can't be parsed");

			oFormat = DateFormat.getTimeInstance({
				pattern: "a"
			}, new Locale("vi"));

			assert.strictEqual(oFormat.parse("a.m."), null, "the variant can only be parsed in locale where it's supported");
		});

		QUnit.test("parse time format with variants of am/pm with year after pattern", function (assert) {
			var aVariants = [
				"am", "pm",
				"AM", "PM",
				"a.m.", "p.m.",
				"am.", "pm.",
				"A.M.", "P.M.",
				"AM.", "PM.",
				"a. m.", "p. m.", // With default space
				"a." + "\xA0" + "m.", "p." + "\xA0" + "m." // with non-breaking space (nbsp)
			];
			var oFormat = DateFormat.getTimeInstance({
				pattern: "ay"
			});
			aVariants.forEach(function (sVariant) {
				var oDate = oFormat.parse(sVariant + "2018");
				assert.ok(oDate instanceof Date, sVariant + " correctly parsed");
			});
		});

	//*********************************************************************************************
	QUnit.test("parse with invalid am/pm", function (assert) {
		var oFormat = DateFormat.getTimeInstance({pattern : "hh:mm a"}, new Locale("pt_PT"));

		assert.strictEqual(oFormat.parse("11:14 invalid"), null,
			"The formatted date string cannot be parsed");
		assert.strictEqual(oFormat.parse("11:14 a"), null,
			"The formatted date string cannot be parsed");
	});

		QUnit.test("format and parse time with am/pm in locale pt_PT", function(assert) {
			// the dayPeriod pattern is defined as the following in pt_PT
			// ["a.m.", "p.m."]
			// The "." in the pattern also needs to be removed before it's compared with the unified variant
			var oFormat = DateFormat.getTimeInstance({
					pattern: "hh:mm a"
				}, new Locale("pt_PT")),
				oDate = UI5Date.getInstance(),
				sFormattedTime = oFormat.format(oDate),
				oParsedDate = oFormat.parse(sFormattedTime);

			assert.ok(oParsedDate, "The formatted date string can be parsed");
			assert.strictEqual(oParsedDate.getHours(), oDate.getHours(), "The hours can be correctly parsed");
			assert.strictEqual(oParsedDate.getMinutes(), oDate.getMinutes(), "The minutes can be correctly parsed");
		});

	//*********************************************************************************************
[
	{pattern : "hh:mm a", formatted : "01:37 PM"},
	{pattern : "hh:mm aa", formatted : "01:37 PM"},
	{pattern : "hh:mm aaa", formatted : "01:37 PM"},
	{pattern : "hh:mm aaaa", formatted : "01:37 오후"},
	{pattern : "hh:mm aaaaa", formatted : "01:37 PM"}
].forEach(function (oFixture, i) {
	QUnit.test("format/parse time with day period, abbreviated pattern differs #" + i,
			function (assert) {
		var oDate = UI5Date.getInstance(Date.UTC(2018, 7, 2, 11, 37)),
			// in ko: pattern wide (aaaa) is different from the other patterns
			oFormat = DateFormat.getTimeInstance({pattern : oFixture.pattern}, new Locale("ko")),
			sFormattedTime = oFormat.format(oDate),
			oParsedDate = oFormat.parse(sFormattedTime);

		assert.strictEqual(sFormattedTime, oFixture.formatted,
			"The formatted date string is correct for pattern '" + oFixture.pattern + "'");
		assert.ok(oParsedDate instanceof Date,
			"The formatted date string '" + sFormattedTime + "' can be parsed");
		assert.strictEqual(oParsedDate.getHours(), oDate.getHours(), "The hours can be correctly parsed");
		assert.strictEqual(oParsedDate.getMinutes(), oDate.getMinutes(),
			"The minutes can be correctly parsed");
	});
});

	//*********************************************************************************************
[
	{pattern : "hh:mm a", formatted : "07:37 priešpiet"},
	{pattern : "hh:mm aa", formatted : "07:37 priešpiet"},
	{pattern : "hh:mm aaa", formatted : "07:37 priešpiet"},
	{pattern : "hh:mm aaaa", formatted : "07:37 priešpiet"},
	{pattern : "hh:mm aaaaa", formatted : "07:37 pr.\u202fp."}
].forEach(function (oFixture, i) {
	QUnit.test("format/parse time with day period, narrow pattern differs #" + i,
			function (assert) {
		var oDate = UI5Date.getInstance(Date.UTC(2022, 7, 15, 5, 37)),
			// in lt: pattern narrow (aaaaa) is different from the other patterns
			oFormat = DateFormat.getTimeInstance({pattern : oFixture.pattern}, new Locale("lt")),
			sFormattedTime = oFormat.format(oDate),
			oParsedDate = oFormat.parse(sFormattedTime);

		assert.strictEqual(sFormattedTime, oFixture.formatted,
			"the formatted date string is correct for pattern '" + oFixture.pattern + "'");
		assert.ok(oParsedDate instanceof Date,
			"The formatted date string '" + sFormattedTime + "' can be parsed");
		assert.strictEqual(oParsedDate.getHours(), oDate.getHours(), "The hours can be correctly parsed");
		assert.strictEqual(oParsedDate.getMinutes(), oDate.getMinutes(),
			"The minutes can be correctly parsed");
	});
});

		QUnit.test("parse with tolerance for the number of spaces", function (assert) {
			var oFormat = DateFormat.getDateInstance({
				pattern: "dd MMMM, yyyy"
			});

			var iDate = UI5Date.getInstance(2017, 3, 17).getTime();

			assert.strictEqual(oFormat.parse("17April,2017").getTime(), iDate, "string without any space can also be parsed");
			assert.strictEqual(oFormat.parse(" 17   April,   2017   ").getTime(), iDate, "string with redundant space can also be parsed");
			assert.strictEqual(oFormat.parse(" 17April,   2017").getTime(), iDate, "string with arbitrary space can also be parsed");
			assert.strictEqual(oFormat.parse("17 April , 2017"), null, "string with non-defined space can't be parsed");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			});

			var aCompare = [UI5Date.getInstance(2017, 3, 11), UI5Date.getInstance(2017, 3, 17)];

			// the correct pattern is MMM d\u2009\u2013\u2009d, y
			assert.deepEqual(oIntervalFormat.parse("Apr 11\u201317, 2017"), aCompare,
				"string with missing spaces can also be parsed");
			assert.deepEqual(oIntervalFormat.parse("Apr11\u201317,  2017"), aCompare,
				"string with missing spaces and redundant spaces can also be parsed");
		});

		/** TODO: Move to sap.ui.core.date.Gregorian
		QUnit.test("DateFormat.calculateWeekNumber", function(assert) {
			var DateFormat = DateFormat;

			var oDate = new Date(Date.UTC(2015, 5, 8));
			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {UTC: true}), 24, "week number with UTC Date");

			oDate = new Date(Date.UTC(2000, 0, 1));
			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 1, "01.01.2000 baseYear 2000 is in week 1");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 1999
			}), 53, "01.01.2000 baseYear 1999 is in week 53");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de",
				baseYear: 1999
			}), 52, "01.01.2000 in 'de' locale is in week 52");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de",
				baseYear: 2000
			}), 52, "baseYear doesn't have effect when locale isn't en-US");

			oDate = new Date(Date.UTC(2001, 0, 1));

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2001
			}), 1, "01.01.2001 baseYear 2001 is in week 1");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 54, "01.01.2001 baseYear 2000 is in week 54");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de"
			}), 1, "01.01.2001 in 'de' locale is in week 1");

			oDate - new Date(Date.UTC(2000, 11, 31));
			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2001
			}), 1, "31.12.2000 baseYear 2001 is in week 1");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				baseYear: 2000
			}), 54, "31.12.2000 baseYear 2000 is in week 54");

			assert.strictEqual(DateFormat.calculateWeekNumber(oDate, {
				UTC: true,
				locale: "de"
			}), 1, "31.12.2000 in 'de' locale is in week 1");
		});
		**/

		QUnit.test("format and parse weekInYear pattern", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "'W'w"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "W1", "week format with pattern 'w'");
			assert.ok(oDateFormat.parse("W1") instanceof Date, "Date can be correctly parsed");
			assert.notOk(isNaN(oDateFormat.parse("W1").getTime()), "Date is valid and can be correctly parsed 'W1'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "'W'ww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "W01", "week format with pattern 'ww'");
			assert.ok(oDateFormat.parse("W01") instanceof Date, "Date can be correctly parsed 'W01'");
			assert.notOk(isNaN(oDateFormat.parse("W01").getTime()), "Date is valid and can be correctly parsed 'W01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "www"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "CW 01", "week format with pattern 'www'");
			assert.ok(oDateFormat.parse("CW 01") instanceof Date, "Date can be correctly parsed 'CW 01'");
			assert.notOk(isNaN(oDateFormat.parse("CW 01").getTime()), "Date is valid and can be correctly parsed 'CW 01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "Calendar Week 01", "week format with pattern 'wwww'");
			assert.ok(oDateFormat.parse("Calendar Week 01") instanceof Date, "Date can be correctly parsed 'Calendar Week 01'");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 01").getTime()), "Date is valid and can be correctly parsed 'Calendar Week 01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Islamic
			});
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "Calendar Week 11", "week number in Islamic calendar");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 11").getTime()), "Date can be correctly parsed in Islamic calendar 'Calendar Week 11'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Japanese
			});
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "Calendar Week 01", "week number in Japanese calendar");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 01").getTime()), "Date can be correctly parsed in Japanese calendar 'Calendar Week 01'");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern with 2 digits", function (assert) {
			Localization.setLanguage("de_DE");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "YY'-'ww"
			});
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 11, 22)), "14-52", "Date can be correctly formatted to '14-52'");
			assert.strictEqual(oDateFormat.parse("14-52").valueOf(), UI5Date.getInstance(2014, 11, 22).valueOf(), "'14-52' can be correctly parsed");

			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 11, 29)), "15-01", "Date can be correctly formatted to '15-01'");
			assert.strictEqual(oDateFormat.parse("15-01").valueOf(), UI5Date.getInstance(2014, 11, 29).valueOf(), "'15-01' can be correctly parsed");

			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 5)), "15-02", "Date can be correctly formatted to '15-02'");
			assert.strictEqual(oDateFormat.parse("15-02").valueOf(), UI5Date.getInstance(2015, 0, 5).valueOf(), "'15-02' can be correctly parsed");

			Localization.setLanguage("en_US");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern with language en-AU", function (assert) {
			Localization.setLanguage("en_AU");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "YYYY'-'ww'-'EE"
			});

			// first day of the week is Monday
			var oSundayDate = UI5Date.getInstance(2022, 1, 13);
			var oMondayDate = UI5Date.getInstance(2022, 1, 14);

			assert.strictEqual(oDateFormat.format(oSundayDate), "2022-07-Sun", "Date can be correctly formatted to '2022-07-Sun'");
			assert.deepEqual(oDateFormat.parse("2022-07-Sun"), oSundayDate, "'2022-07-Sun' can be correctly parsed");

			assert.strictEqual(oDateFormat.format(oMondayDate), "2022-08-Mon", "Date can be correctly formatted to '2022-08-Mon'");
			assert.deepEqual(oDateFormat.parse("2022-08-Mon"), oMondayDate, "'2022-08-Mon' can be correctly parsed");

			Localization.setLanguage("en_US");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern", function (assert) {
			var oDateFormat;
			var aLocales;

			// Split Week
			// "en_US" has a split week, which means that January 1st is always calendar week 1
			// and the last week of the year always ends with December 31st.
			aLocales = ["en_US"];
			aLocales.forEach(function(sLocale) {
				Localization.setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2014-1"), UI5Date.getInstance(2014, 0, 1), "Date can be correctly parsed to 1st of January 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2015, 0, 1), "Date can be correctly parsed to 1st of January 2015");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 0, 1)), "2016-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2016-1"), UI5Date.getInstance(2016, 0, 1), "Date can be correctly parsed to 1st of January 2016");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 11, 31)), "2014-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2014-53"), UI5Date.getInstance(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 11, 31)), "2015-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2015-53"), UI5Date.getInstance(2015, 11, 27), "Date can be correctly parsed to 27th of December 2015");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 11, 31)), "2016-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2016-53"), UI5Date.getInstance(2016, 11, 25), "Date can be correctly parsed to 25th of December 2016");
			});

			// Western Traditional
			// en uses the Western Traditional calendar week calculation which means the week starts with sunday
			// and the first Saturday of a year is in calendar week 1 (minDays=1)
			aLocales = ["en"];
			aLocales.forEach(function(sLocale) {
				Localization.setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January 2014 is week 1/2014");
				assert.deepEqual(oDateFormat.parse("2014-1"), UI5Date.getInstance(2013, 11, 29), "Date can be correctly parsed to 29th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 0, 1)), "2016-1", "For " + sLocale + " 1st of January 2016 is week 1/2016");
				assert.deepEqual(oDateFormat.parse("2016-1"), UI5Date.getInstance(2015, 11, 27), "Date can be correctly parsed to 27th of December 2015");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 11, 31)), "2015-1", "For " + sLocale + " 31st of December 2014 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 11, 31)), "2016-1", "For " + sLocale + " 31st of December 2015 is week 1/2016");
				assert.deepEqual(oDateFormat.parse("2015-53"), UI5Date.getInstance(2015, 11, 27), "Date can be correctly parsed to 27th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 11, 31)), "2016-53", "For " + sLocale + " 31st of December 2016 is week 53/2016");
				assert.deepEqual(oDateFormat.parse("2016-53"), UI5Date.getInstance(2016, 11, 25), "Date can be correctly parsed to 25th of December 2016");
			});

			// ISO 8601
			// de and en_GB have the rule of "the first thursday in the year",
			// the first thursday in the year is part of calendar week 1 and every calendar week is 7 days long.
			// The week starts with Monday
			aLocales = ["de_DE", "en_GB"];
			aLocales.forEach(function(sLocale) {
				Localization.setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January 2014 is week 1/2014");
				assert.deepEqual(oDateFormat.parse("2014-1"), UI5Date.getInstance(2013, 11, 30), "Date can be correctly parsed to 1st of January 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2014, 11, 29), "Date can be correctly parsed to 1st of January 2015");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 0, 1)), "2015-53", "For " + sLocale + " 1st of January 2016 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2016-1"), UI5Date.getInstance(2016, 0, 4), "Date can be correctly parsed to 1st of January 2016");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2014, 11, 31)), "2015-1", "For " + sLocale + " 31st of December 2014 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2014, 11, 29), "Date can be correctly parsed to 29th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 11, 31)), "2015-53", "For " + sLocale + " 31st of December 2015 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2015-53"), UI5Date.getInstance(2015, 11, 28), "Date can be correctly parsed to 29th of December 2014");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 11, 31)), "2016-52", "For " + sLocale + " 31st of December 2016 is week 52/2016");
				assert.deepEqual(oDateFormat.parse("2016-52"), UI5Date.getInstance(2016, 11, 26), "Date can be correctly parsed to 29th of December 2016");
			});

			Localization.setLanguage("en_US");
		});

		QUnit.test("format and parse weekYear/weekInYear with configuration (ISO8601)", function (assert) {
			[
				// use formatOptions parameter
				DateFormat.getDateInstance({
					pattern: "Y-w",
					firstDayOfWeek: 1,
					minimalDaysInFirstWeek: 4
				}),
				// use formatOptions parameter and locale, formatOptions take precedence
				DateFormat.getDateInstance({
					pattern: "Y-w",
					firstDayOfWeek: 1,
					minimalDaysInFirstWeek: 4
				}, new Locale("en-US")),
				// use locale
				DateFormat.getDateInstance({
					pattern: "Y-w"
				}, new Locale("de-DE"))
			].forEach(function(oDateFormat) {
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2015, 0, 1)), "2015-1", "For 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), UI5Date.getInstance(2014, 11, 29), "Date can be correctly parsed to 1st of January 2015");
				assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2016, 0, 1)), "2015-53", "For 1st of January 2016 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2016-1"), UI5Date.getInstance(2016, 0, 4), "Date can be correctly parsed to 1st of January 2016");
			});

			// use formatOptions parameter and locale, formatOptions take precedence
			// with zero value
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 0
			}, new Locale("en-US"));

			// no en_US split week since both paramaters are specified
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2022, 0, 1)), "2022-1", "For 1st of January 2022 is week 1/2022");
			assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2021, 11, 31)), "2022-1", "For 1st of January 2022 is week 1/2022");

			Localization.setLanguage("en_US");
		});

		QUnit.test("format and parse weekInYear and dayNumberOfWeek", function (assert) {
			var oDate = UI5Date.getInstance(2016, 10, 13); // 13th, November, 2016, Sunday
			var sPattern = "Y/ww/u";

			Localization.setLanguage("en_US");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			var sFormatted = "2016/47/1";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "13th, November 2016 Sunday is the first day of week 46 in en-US");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed to the same date");

			Localization.setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			sFormatted = "2016/45/7";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "13th, November 2016 Sunday is the 7th day of week 45 in de-DE");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed to the same date");

			Localization.setLanguage("en_US");
		});

		QUnit.test("format and parse dayName", function (assert) {
			var oDate = UI5Date.getInstance(2018, 2, 23); // 23th, March, 2018, Friday
			var sPattern = "yyyy-MM-dd EEEE";

			Localization.setLanguage("en_US");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			var sFormatted = "2018-03-23 Friday";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "23th, March, 2018, Friday in en-US");
			assert.strictEqual(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			Localization.setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			sFormatted = "2018-03-23 Freitag";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "2018-03-23 Freitag in de-DE");
			assert.strictEqual(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed to the same date");

			Localization.setLanguage("en_US");
		});

		QUnit.test("Parse precedence: day (d) over dayName (E)", function (assert) {
			var oDate = UI5Date.getInstance(1985, 9, 9); // 9th, October, 1985, Wednesday
			var sPattern = "yyyy-MM-dd EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormattedWrongDayName = "1985-10-09 Friday"; // use Friday instead 1985-10-09 Wednesday
			assert.strictEqual(oDateFormat.format(oDate), "1985-10-09 Wednesday", "9th, October, 1985, Wednesday");
			assert.strictEqual(oDateFormat.parse(sFormattedWrongDayName).getTime(), oDate.getTime(), "DayName should be ignored and the date should be the input date");
		});

		QUnit.test("Parse precedence: year/month/day (yMd) over week (w)", function (assert) {
			var oDate = UI5Date.getInstance(1985, 9, 9); // 9th, October, 1985, Wednesday
			var sPattern = "YYYY-MM-dd '(CW 'ww')'";
			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormattedWrongWeek = "1985-10-09 (CW 42)"; // use CW 42 instead 1985-10-09 (CW 41)

			assert.strictEqual(oDateFormat.format(oDate), "1985-10-09 (CW 41)", "2018-03-23 Freitag in de-DE");
			assert.strictEqual(oDateFormat.parse(sFormattedWrongWeek).getTime(), oDate.getTime(), "Week should be ignored and the date should be the input date");
		});

		QUnit.test("Parse and format different formats", function (assert) {
			var oDate = UI5Date.getInstance(1985, 9, 9), oDateFormat, sFormattedDate, oParsedDate; // 9th, October, 1985, Wednesday

			["YYYY'-W'ww'-'u'", "YYYY'-W'ww', 'E", "YYYY'-W'ww'-'u', 'E"].forEach(function (sPattern) {

				["en_US", "de_DE"].forEach(function (sLanguage) {
					oDateFormat = DateFormat.getDateInstance({
						pattern: sPattern
					}, new Locale(sLanguage));

					sFormattedDate = oDateFormat.format(oDate);
					assert.ok(sFormattedDate, "Format (" + sLanguage + "): " + sFormattedDate + " using pattern " + sPattern);
					oParsedDate = oDateFormat.parse(sFormattedDate);
					assert.deepEqual(oParsedDate, oDate, "Parse (" + sLanguage + "): " + sPattern);

				});
			});
		});


		QUnit.test("format and parse week and dayName", function (assert) {
			var oDate = UI5Date.getInstance(2018, 2, 23); // 23th, March, 2018, Friday
			var sPattern = "yyyy 'Week' ww EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormatted = "2018 Week 12 Friday";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "2018-12 Friday, Friday in en-US");
			assert.strictEqual(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));
			sFormatted = "2018 Week 12 Freitag";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "2018-12 Freitag in de-DE");
			assert.strictEqual(oDateFormat.parse(sFormatted).getTime(), oDate.getTime(), "The formatted string can be correctly parsed");

			Localization.setLanguage("en_US");
		});


		QUnit.test("format and parse week and dayName Jan 1st, 2017", function (assert) {
			var oDate = UI5Date.getInstance(2017, 0, 1);
			var sPattern = "YYYY 'Week' ww EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormatted = "2017 Week 01 Sunday";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "2017 Week 01 Sunday in en-US");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));
			sFormatted = "2016 Week 52 Sonntag";

			assert.strictEqual(oDateFormat.format(oDate), sFormatted, "2016 Week 52 Sonntag in de-DE");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed");

			Localization.setLanguage("en_US");
		});

	//*********************************************************************************************
[
	{pattern : "yyyy-MM-dd B hh:mm", sFormatted : "2017-01-01 nachm. 02:00"},
	{pattern : "yyyy-MM-dd BB hh:mm", sFormatted : "2017-01-01 nachm. 02:00"},
	{pattern : "yyyy-MM-dd BBB hh:mm", sFormatted : "2017-01-01 nachm. 02:00"},
	{pattern : "yyyy-MM-dd BBBB hh:mm", sFormatted : "2017-01-01 nachmittags 02:00"},
	{pattern : "yyyy-MM-dd BBBBB hh:mm", sFormatted : "2017-01-01 nachm. 02:00"},
	{pattern : "yyyy-MM-dd BBBBB HH:mm", sFormatted : "2017-01-01 nachm. 14:00"},
	{pattern : "yyyy-MM-dd B k:mm", sFormatted : "2017-01-01 nachm. 14:00"},
	{pattern : "yyyy-MM-dd BB K:mm", sFormatted : "2017-01-01 nachm. 2:00"},
	{pattern : "yyyy-MM-dd B", sFormatted : "2017-01-01 Nachm."},
	{pattern : "yyyy-MM-dd B 'heute'", sFormatted : "2017-01-01 Nachm. heute"},
	{pattern : "yyyy-MM-dd BB", sFormatted : "2017-01-01 Nachm."},
	{pattern : "yyyy-MM-dd BBB", sFormatted : "2017-01-01 Nachm."},
	{pattern : "yyyy-MM-dd BBBB", sFormatted : "2017-01-01 Nachmittag"},
	{pattern : "yyyy-MM-dd BBBBB", sFormatted : "2017-01-01 Nachm."}
].forEach(function (oFixture, i) {
	var sTitle = "format flexible day period with variable number of 'B' for regular and"
			+ " stand-alone case: " + i;

	QUnit.test(sTitle, function (assert) {
		var oDateFormat = DateFormat.getDateInstance({pattern : oFixture.pattern},
				new Locale("de_DE"));

		assert.strictEqual(oDateFormat.format(UI5Date.getInstance(2017, 0, 1, 14, 0)),
			oFixture.sFormatted, "Formatted: " + oFixture.sFormatted);
	});
});

	//*********************************************************************************************
[
	{aDateParts : [2017, 0, 1, 0, 0], sFormatted : "2017-01-01 Mitternacht 12:00"},
	{aDateParts : [2017, 0, 1, 0, 1], sFormatted : "2017-01-01 nachts 12:01"},
	{aDateParts : [2017, 0, 1, 5, 0], sFormatted : "2017-01-01 morgens 05:00"},
	{aDateParts : [2017, 0, 1, 10, 0], sFormatted : "2017-01-01 vorm. 10:00"},
	{aDateParts : [2017, 0, 1, 12, 0], sFormatted : "2017-01-01 mittags 12:00"},
	{aDateParts : [2017, 0, 1, 13, 0], sFormatted : "2017-01-01 nachm. 01:00"},
	{aDateParts : [2017, 0, 1, 18, 0], sFormatted : "2017-01-01 abends 06:00"},
	{aDateParts : [2017, 0, 1, 23, 59], sFormatted : "2017-01-01 abends 11:59"}
].forEach(function (oFixture, i) {
	QUnit.test("format and parse flexible day period 'B' de_DE: " + i, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.aDateParts),
			oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd B hh:mm"
			}, new Locale("de_DE"));

		assert.strictEqual(oDateFormat.format(oDate), oFixture.sFormatted,
			"Formatted: " + oFixture.sFormatted);
		assert.deepEqual(oDateFormat.parse(oFixture.sFormatted), oDate,
			"The formatted string can be correctly parsed");
	});
});

	//*********************************************************************************************
["yyyy-MM-dd B hh", "yyyy-MM-dd B hh:mm"].forEach(function (sPattern, i) {
	QUnit.test("parse flexible day periods 'B' de_DE without minutes: " + i, function (assert) {
		var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));

		assert.deepEqual(oDateFormat.parse("2017-01-01 nachm. 1"), UI5Date.getInstance(2017, 0, 1, 13, 0),
			"The formatted string can be correctly parsed");
	});
});

	//*********************************************************************************************
[
	{aDateParts : [2017, 0, 5, 4, 39], sFormatted : "2017-01-01 abends 99:99"},
	{aDateParts : [2017, 0, 2, 3, 1], sFormatted : "2017-01-01 nachts 26:61"},
	{aDateParts : [2017, 0, 2, 5, 0], sFormatted : "2017-01-01 nachm. 29:00"}
].forEach(function (oFixture, i) {
	QUnit.test("parse flexible day period 'B' de_DE for numbers > 24: " + i, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.aDateParts),
			oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd B h:mm"
			}, new Locale("de_DE"));

		assert.deepEqual(oDateFormat.parse(oFixture.sFormatted), oDate,
			"The formatted string can be correctly parsed");
	});
});

	//*********************************************************************************************
[
	{aDateParts : [2017, 0, 1, 0, 0], sFormatted : "2017-01-01 Mitternacht"},
	{aDateParts : [2017, 0, 1, 0, 1], sFormatted : "2017-01-01 Nacht"},
	{aDateParts : [2017, 0, 1, 5, 0], sFormatted : "2017-01-01 Morgen"},
	{aDateParts : [2017, 0, 1, 10, 0], sFormatted : "2017-01-01 Vorm."},
	{aDateParts : [2017, 0, 1, 12, 0], sFormatted : "2017-01-01 Mittag"},
	{aDateParts : [2017, 0, 1, 13, 0], sFormatted : "2017-01-01 Nachm."},
	{aDateParts : [2017, 0, 1, 18, 0], sFormatted : "2017-01-01 Abend"},
	{aDateParts : [2017, 0, 1, 23, 59], sFormatted : "2017-01-01 Abend"}
].forEach(function (oFixture, i) {
	QUnit.test("format flexible day period stand-alone 'B' de_DE: " + i, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.aDateParts),
			oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd B"
			}, new Locale("de_DE"));

		assert.strictEqual(oDateFormat.format(oDate), oFixture.sFormatted,
			"Formatted: " + oFixture.sFormatted);
	});
});

	//*********************************************************************************************
[
	{sFormatted : "2017-01-01 Mitternacht"},
	{sFormatted : "2017-01-01 Nacht"},
	{sFormatted : "2017-01-01 Morgen"},
	{sFormatted : "2017-01-01 Vorm."},
	{sFormatted : "2017-01-01 Mittag"},
	{sFormatted : "2017-01-01 Nachm."},
	{sFormatted : "2017-01-01 Abend"},
	{sFormatted : "2017-01-01 Abend 19:00"}
].forEach(function (oFixture, i) {
	QUnit.test("parse flexible day period stand-alone 'B' de_DE, string: " + i, function (assert) {
		var oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd B"
			}, new Locale("de_DE"));

		// Due to the return of {valid: false} from "B".parse(), #fnCreateDate() returns null.
		assert.deepEqual(oDateFormat.parse(oFixture.sFormatted), null,
			"stand-alone case cannot be parsed, without hour");
	});
});

	//*********************************************************************************************
[
	{aDateParts : [2017, 0, 1, 24, 0], sFormatted : "2017-01-02 půlnoc 12:00"},
	{aDateParts : [2017, 0, 1, 0, 0], sFormatted : "2017-01-01 půlnoc 12:00"},
	{aDateParts : [2017, 0, 1, 0, 1], sFormatted : "2017-01-01 v noci 12:01"},
	{aDateParts : [2017, 0, 1, 23, 59], sFormatted : "2017-01-01 v noci 11:59"}
].forEach(function (oFixture, i) {
	var sTitle = "format and parse overlapping time period rules for 'B' in 'cs_CZ': " + i;

	QUnit.test(sTitle, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.aDateParts),
			oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd BBBB hh:mm"
			}, new Locale("cs_CZ"));

		assert.strictEqual(oDateFormat.format(oDate), oFixture.sFormatted,
			"Formatted: " + oFixture.sFormatted);
		assert.deepEqual(oDateFormat.parse(oFixture.sFormatted), oDate,
			"The formatted string can be correctly parsed");
	});
});

	//*********************************************************************************************
[
	{sFormatted : "2017-01-01 夜 10:59", aDateParts : [2017, 0, 1, 22, 59], sLocale : "ja_JP"},
	{sFormatted : "2017-01-01 夜中 11:00", aDateParts : [2017, 0, 1, 23], sLocale : "ja_JP"},
	{sFormatted : "2017-01-01 pusnaktī 00:00", aDateParts : [2017, 0, 1], sLocale : "lv_LV"},
	{sFormatted : "2017-01-01 naktī 00:01", aDateParts : [2017, 0, 1, 0, 1], sLocale : "lv_LV"}
].forEach(function (oFixture, i) {
	// These cases are special since, the parsed day period strings contain other day periods as
	// substrings e.g. pusnaktī contains naktī
	var sTitle = "parse flexible time period special cases for 'B' in different languages: " + i;

	QUnit.test(sTitle, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.aDateParts),
			oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd B hh:mm"
			}, new Locale(oFixture.sLocale));

		assert.deepEqual(oDateFormat.parse(oFixture.sFormatted), oDate,
			"The formatted string can be correctly parsed");
	});
});

	//*********************************************************************************************
		QUnit.test("origin info", function (assert) {
			var oOriginInfoStub = this.stub(Supportability, "collectOriginInfo").returns(true);
			var oOriginDate = DateFormat.getInstance(), sValue = oOriginDate.format(oDateTime), oInfo = sValue.originInfo;
			assert.strictEqual(oInfo.source, "Common Locale Data Repository", "Origin Info: source");
			assert.strictEqual(oInfo.locale, "en-US", "Origin Info: locale");
			assert.strictEqual(oInfo.style, "medium", "Origin Info: style");
			assert.strictEqual(oInfo.pattern, "MMM d, y", "Origin Info: pattern");
			oOriginInfoStub.restore();
		});

		QUnit.module("Calendar Week precedence", {
			beforeEach: function () {
				Localization.setLanguage("de_DE"); // ISO 8601
			},
			afterEach: function () {
				Localization.setLanguage(sDefaultLanguage);
			}
		});

		QUnit.test("invalid calendar week configuration", function (assert) {
			assert.throws(function() {
				DateFormat.getDateInstance({
					calendarWeekNumbering: "DoesNotExist"
				});
			}, new TypeError("Illegal format option calendarWeekNumbering: 'DoesNotExist'"));

			assert.throws(function() {
					DateFormat.getDateInstance({
						minimalDaysInFirstWeek: 4
					});
				}, new TypeError("Format options firstDayOfWeek and minimalDaysInFirstWeek need both to be set, but only one was provided."),
				"only minimalDaysInFirstWeek is provided without firstDayOfWeek");
			assert.throws(function() {
					DateFormat.getDateInstance({
						firstDayOfWeek: 1
					});
				}, new TypeError("Format options firstDayOfWeek and minimalDaysInFirstWeek need both to be set, but only one was provided."),
				"only firstDayOfWeek is provided without minimalDaysInFirstWeek");
		});

		//******************************************************************************************
		QUnit.test("central calendar week configuration", function (assert) {
			// Fri Jan 01 2021
			// local: de-DE -> ISO_8601
			// firstDayOfWeek: 1
			// minimalDaysInFirstWeek: 4
			var oDate = UI5Date.getInstance(2021, 0, 1),
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53");

			// instance > locale
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 1
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-1");

			// configuration > locale
			Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.WesternTraditional);
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w"
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-1");

			// instance > configuration
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 1,
				minimalDaysInFirstWeek: 4
			});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53");

			// instance > instance deprecated > configuration
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0, // deprecated
				minimalDaysInFirstWeek: 1, // deprecated
				calendarWeekNumbering: CalendarWeekNumbering.ISO_8601 // must win over deprecated & configuration
			});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53");

			// reset central calendar week config
			Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.Default);
		});

		QUnit.test("calendar week configuration precedence 2021", function (assert) {
			// Fri Jan 01 2021
			// local: de-DE -> ISO_8601
			// firstDayOfWeek: 1
			// minimalDaysInFirstWeek: 4
			var oDate = UI5Date.getInstance("2021-01-01T00:00:00Z");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w"
			});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53", "2020-53");

			// Default to locale
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				calendarWeekNumbering: CalendarWeekNumbering.Default
			});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53", "2020-53");

			// instance > locale
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 1
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-1", "2021-1");

			// instance > instance deprecated
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 1,
				calendarWeekNumbering: CalendarWeekNumbering.ISO_8601
			});
			assert.strictEqual(oDateFormat.format(oDate), "2020-53", "2020-53");
		});

		QUnit.test("calendar week configuration precedence 2022", function (assert) {
			// Sat Jan 01 2022
			// local: de-DE -> ISO_8601
			// firstDayOfWeek: 1
			// minimalDaysInFirstWeek: 4
			var oDate = UI5Date.getInstance("2022-01-01T00:00:00Z");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w"
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-52", "2021-52");

			// Default to locale
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				calendarWeekNumbering: CalendarWeekNumbering.Default
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-52", "2021-52");

			// instance > locale
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 1
			});
			assert.strictEqual(oDateFormat.format(oDate), "2022-1", "2022-1");

			// instance > instance deprecated
			oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 1,
				calendarWeekNumbering: CalendarWeekNumbering.ISO_8601
			});
			assert.strictEqual(oDateFormat.format(oDate), "2021-52", "2021-52");
		});

		QUnit.module("Scaling: Relative Time Formatter", {
			beforeEach: function () {
				var iJanTzOffset, iJulTzOffset;

				// Tue Oct 13 2015 10:21:16 (in current time zone)
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2015-10-13T10:21:16").getTime());

				iJanTzOffset = UI5Date.getInstance(2015, 0, 1).getTimezoneOffset();
				iJulTzOffset = UI5Date.getInstance(2015, 6, 1).getTimezoneOffset();
				// check whether the Daylight Saving Time is used in the current timezone
				if (iJanTzOffset === iJulTzOffset) {
					this.dst = 0;
				} else {
					this.dst = iJanTzOffset > iJulTzOffset ? 1 : -1;
				}
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		function date(scale, diff) {
			var oNow = UI5Date.getInstance(),
				oResult = UI5Date.getInstance(Date.UTC(oNow.getFullYear(), oNow.getMonth(), oNow.getDate(), oNow.getHours(), oNow.getMinutes(), oNow.getSeconds(), oNow.getMilliseconds()));
			switch (scale) {
				case "second": oResult.setUTCSeconds(oResult.getUTCSeconds() + diff); break;
				case "minute": oResult.setUTCMinutes(oResult.getUTCMinutes() + diff); break;
				case "hour": oResult.setUTCHours(oResult.getUTCHours() + diff); break;
				case "day": oResult.setUTCDate(oResult.getUTCDate() + diff); break;
				case "month": oResult.setUTCMonth(oResult.getUTCMonth() + diff); break;
				case "year": oResult.setUTCFullYear(oResult.getUTCFullYear() + diff); break;
				default: throw new TypeError("unexpected scale " + scale);
			}
			return UI5Date.getInstance(oResult.getUTCFullYear(), oResult.getUTCMonth(), oResult.getUTCDate(), oResult.getUTCHours(), oResult.getUTCMinutes(), oResult.getUTCSeconds(), oResult.getUTCMilliseconds());
		}

		QUnit.test("Time relative: format and parse", function (assert) {
			var aStyles = [undefined, 'wide', 'short', 'narrow'],
				aTestData = [{
					scale: "auto",
					data: [
						{ unit: "second", diff: 0, results: ["now", "now", "now", "now"], description: "now" },
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1s"],
							description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1s ago"],
							description: "Now - 1 Second --> 1 second ago" },
						{ unit: "second", diff: 2, results: ["in 2 seconds", "in 2 seconds", "in 2 sec.", "in 2s"],
							description: "Now + 2 Seconds --> in 2 seconds" },
						{ unit: "second", diff: -7, results: ["7 seconds ago", "7 seconds ago", "7 sec. ago", "7s ago"],
							description: "Now + 2 Seconds --> in 2 seconds" },
						{ unit: "second", diff: 61, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1m"],
							description: "Now + 61 Seconds --> in 1 minute", parseDiff: 1000 },
						{ unit: "second", diff: 3601, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 3601 Seconds --> in 1 hour", parseDiff: 1000 },
						{ unit: "minute", diff: 1, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1m"],
							description: "Now + 1 Minute --> in 1 minute" },
						{ unit: "minute", diff: -1, results: ["1 minute ago", "1 minute ago", "1 min. ago", "1m ago"],
							description: "Now - 1 Minute --> 1 minute ago" },
						{ unit: "minute", diff: 13, results: ["in 13 minutes", "in 13 minutes", "in 13 min.", "in 13m"],
							description: "Now + 13 Minutes --> in 13 minutes" },
						{ unit: "minute", diff: -54,
							results: ["54 minutes ago", "54 minutes ago", "54 min. ago", "54m ago"],
							description: "Now - 54 Minutes --> 54 minutes ago" },
						{ unit: "minute", diff: 95, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 95 Minutes --> in 1 hour", parseDiff: 35 * 60 * 1000 },
						{ unit: "hour", diff: 1, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 1 Hour --> in 1 hour" },
						{ unit: "day", diff: -5, results: ["120 hours ago", "120 hours ago", "120 hr. ago", "120h ago"],
							description: "Now - 5 Days --> 120 hours ago" }
					]
				}, {
					scale: "hour",
					data: [
						{ unit: "second", diff: 0, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now --> 0 hours ago" },
						{ unit: "second", diff: 1, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now + 1 Second --> this hour", parseDiff: 1000 },
						{ unit: "second", diff: -1, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now - 1 Second --> this hour", parseDiff: -1000 },
						{ unit: "minute", diff: 30, results: ["this hour", "this hour", "this hour", "this hour"], description: "Now + 30 Minutes --> this hour", parseDiff: 30 * 60 * 1000 },
						{ unit: "minute", diff: -30, results: ["1 hour ago", "1 hour ago", "1 hr. ago", "1h ago"],
							description: "Now - 30 Minutes --> 1 hour ago", parseDiff: 30 * 60 * 1000 },
						{ unit: "hour", diff: 4, results: ["in 4 hours", "in 4 hours", "in 4 hr.", "in 4h"],
							description: "Now + 4 Hours --> in 4 hours" },
						{ unit: "hour", diff: -10, results: ["10 hours ago", "10 hours ago", "10 hr. ago", "10h ago"],
							description: "Now - 10 Hours --> 10 hours ago" }
					]
				}, {
					scale: "minute",
					data: [
						{ unit: "second", diff: 0, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now --> 0 minutes ago" },
						{ unit: "second", diff: 1, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now + 1 Second --> in 0 minutes", parseDiff: 1000 },
						{ unit: "second", diff: -1, results: ["this minute", "this minute", "this minute", "this minute"], description: "Now - 1 Second --> 0 minutes ago", parseDiff: -1000 },
						{ unit: "minute", diff: 30, results: ["in 30 minutes", "in 30 minutes", "in 30 min.", "in 30m"],
							description: "Now + 30 Minutes --> in 30 minutes" },
						{ unit: "minute", diff: -30,
							results: ["30 minutes ago", "30 minutes ago", "30 min. ago", "30m ago"],
							description: "Now - 30 Minutes --> 30 minutes ago" },
						{ unit: "hour", diff: 1, results: ["in 60 minutes", "in 60 minutes", "in 60 min.", "in 60m"],
							description: "Now + 4 Hours --> in 60 minutes" }
					]
				}, {
					scale: "second",
					data: [
						{ unit: "second", diff: 0, results: ["now", "now", "now", "now"], description: "Now --> now" },
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1s"],
							description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1s ago"],
							description: "Now - 1 Second --> 1 second ago" },
						{ unit: "minute", diff: 1, results: ["in 60 seconds", "in 60 seconds", "in 60 sec.", "in 60s"],
							description: "Now + 1 Minute --> in 60 seconds" },
						{ unit: "minute", diff: -1,
							results: ["60 seconds ago", "60 seconds ago", "60 sec. ago", "60s ago"],
							description: "Now - 1 Minute --> 60 seconds ago" }
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
							assert.strictEqual(oTime.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.strictEqual(oTime.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
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
						{ unit: "second", diff: -86400, results: ["1 day ago", "1 day ago", "1 day ago", "1d ago"],
							description: "Today - 86400 Seconds --> 1 day ago" },
						{ unit: "minute", diff: 1440, results: ["in 1 day", "in 1 day", "in 1 day", "in 1d"],
							description: "Today + 1440 Minutes --> in 1 day" },
						{ unit: "hour", diff: 24, results: ["in 1 day", "in 1 day", "in 1 day", "in 1d"],
							description: "Today + 24 Hours --> tomorrow" },
						{ unit: "day", diff: 5, results: ["in 5 days", "in 5 days", "in 5 days", "in 5d"],
							description: "Today + 5 Days --> in 5 days" },
						{ unit: "day", diff: -5, results: ["5 days ago", "5 days ago", "5 days ago", "5d ago"],
							description: "Today - 5 Days --> 5 days ago" },
						{ unit: "day", diff: 8, results: ["in 1 week", "in 1 week", "in 1 wk.", "in 1w"],
							description: "Today + 8 Days --> in 1 week", parseDiff: 24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -8, results: ["1 week ago", "1 week ago", "1 wk. ago", "1w ago"],
							description: "Today - 8 Days --> 1 week ago", parseDiff: -24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -32, results: ["1 month ago", "1 month ago", "1 mo. ago", "1mo ago"],
							description: "Today - 32 Days --> 1 month ago", parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "month", diff: 1, results: ["in 1 month", "in 1 month", "in 1 mo.", "in 1mo"],
							description: "Today + 1 Month --> in 1 month" },
						{ unit: "month", diff: -1, results: ["1 month ago", "1 month ago", "1 mo. ago", "1mo ago"],
							description: "Today - 1 Month --> 1 month ago" },
						{ unit: "month", diff: 13, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1y"],
							description: "Today + 13 Months --> in 1 year",
							parseDiff: (31 * 24 + that.dst) * 60 * 60 * 1000 },
						{ unit: "month", diff: 26, results: ["in 2 years", "in 2 years", "in 2 yr.", "in 2y"],
							description: "Today + 26 Months --> in 2 years",
							parseDiff: (61 * 24 + that.dst) * 60 * 60 * 1000 },
						{ unit: "day", diff: 90, results: ["in 1 quarter", "in 1 quarter", "in 1 qtr.", "in 1q"],
							description: "Today + 90 Days", parseOnly: true, parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "hour", diff: 24, results: ["in 24 hours", "in 24 hours", "in 24 hr.", "in 24h"],
							description: "Today + 1 Days", parseOnly: true },
						{ unit: "hour", diff: 72, results: ["in 72 hours", "in 72 hours", "in 72 hr.", "in 72h"],
							description: "Today + 3 Days", parseOnly: true },
						{ unit: "minute", diff: -4320,
							results: ["4320 minutes ago", "4320 minutes ago", "4320 min. ago", "4320m ago"],
							description: "Today - 3 Days", parseOnly: true }
					]
				}, {
					scale: "week",
					data: [
						{ unit: "day", diff: 13, results: ["in 2 weeks", "in 2 weeks", "in 2 wk.", "in 2w"],
							description: "Today + 13 Days --> in 2 weeks", parseDiff: (-1 * 24 * 60 * 60 * 1000) }
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
							assert.strictEqual(oDate.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.strictEqual(oDate.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
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
						{ unit: "second", diff: 1, results: ["in 1 second", "in 1 second", "in 1 sec.", "in 1s"],
							description: "Now + 1 Second --> in 1 second" },
						{ unit: "second", diff: -1, results: ["1 second ago", "1 second ago", "1 sec. ago", "1s ago"],
							description: "Now - 1 Second --> 1 second ago" },
						{ unit: "second", diff: 2, results: ["in 2 seconds", "in 2 seconds", "in 2 sec.", "in 2s"],
							description: "Now + 2 Second --> in 2 seconds" },
						{ unit: "second", diff: -7, results: ["7 seconds ago", "7 seconds ago", "7 sec. ago", "7s ago"],
							description: "Now - 7 Second --> 7 seconds ago" },
						{ unit: "second", diff: 61, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1m"],
							description: "Now + 61 Seconds --> in 1 minute", parseDiff: 1000 },
						{ unit: "second", diff: 3601, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 3601 Seconds --> in 1 hour", parseDiff: 1000 },
						{ unit: "second", diff: -86401, results: ["1 day ago", "1 day ago", "1 day ago", "1d ago"],
							description: "Today - 86401 Seconds --> 1 day ago", parseDiff: -1000 },
						{ unit: "minute", diff: 1, results: ["in 1 minute", "in 1 minute", "in 1 min.", "in 1m"],
							description: "Now + 1 Minute --> in 1 minute" },
						{ unit: "minute", diff: -1, results: ["1 minute ago", "1 minute ago", "1 min. ago", "1m ago"],
							description: "Now - 1 Minute --> 1 minute ago" },
						{ unit: "minute", diff: 13, results: ["in 13 minutes", "in 13 minutes", "in 13 min.", "in 13m"],
							description: "Now + 13 Mintues --> in 13 minutes" },
						{ unit: "minute", diff: -54,
							results: ["54 minutes ago", "54 minutes ago", "54 min. ago", "54m ago"],
							description: "Now - 54 Minutes --> 54 minutes ago" },
						{ unit: "minute", diff: 95, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 95 Minutes --> in 1 hour", parseDiff: 35 * 60 * 1000 },
						{ unit: "minute", diff: 1440, results: ["in 1 day", "in 1 day", "in 1 day", "in 1d"],
							description: "Today + 1440 Minutes --> in 1 day" },
						{ unit: "hour", diff: 1, results: ["in 1 hour", "in 1 hour", "in 1 hr.", "in 1h"],
							description: "Now + 1 Hour --> in 1 hour" },
						{ unit: "day", diff: 5, results: ["in 5 days", "in 5 days", "in 5 days", "in 5d"],
							description: "Today + 5 Days --> in 5 days" },
						{ unit: "day", diff: -5, results: ["5 days ago", "5 days ago", "5 days ago", "5d ago"],
							description: "Today - 5 Days --> 5 days ago" },
						{ unit: "day", diff: 8, results: ["in 1 week", "in 1 week", "in 1 wk.", "in 1w"],
							description: "Today + 8 Days --> in 1 week", parseDiff: 24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -8, results: ["1 week ago", "1 week ago", "1 wk. ago", "1w ago"],
							description: "Today - 8 Days --> 1 week ago", parseDiff: -24 * 60 * 60 * 1000 },
						{ unit: "day", diff: -32, results: ["1 month ago", "1 month ago", "1 mo. ago", "1mo ago"],
							description: "Today - 32 Days --> 1 month ago", parseDiff: -2 * 24 * 60 * 60 * 1000 },
						{ unit: "month", diff: 1, results: ["in 1 month", "in 1 month", "in 1 mo.", "in 1mo"],
							description: "Today + 1 Month --> in 1 month" },
						{ unit: "month", diff: -1, results: ["1 month ago", "1 month ago", "1 mo. ago", "1mo ago"],
							description: "Today - 1 Month --> 1 month" },
						{ unit: "month", diff: 13, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1y"],
							description: "Today + 13 Months --> in 1 year",
							parseDiff: (31 * 24 + that.dst) * 60 * 60 * 1000 },
						{ unit: "month", diff: 26, results: ["in 2 years", "in 2 years", "in 2 yr.", "in 2y"],
							description: "Today + 26 Months --> in 2 years",
							parseDiff: (61 * 24 + that.dst) * 60 * 60 * 1000 },
						{ unit: "year", diff: 1, results: ["in 1 year", "in 1 year", "in 1 yr.", "in 1y"],
							description: "Today + 1 year --> in 1 year" }
					]
				}];

			aStyles.forEach(function (sStyle, index) {
				aTestData.forEach(function (oTestData) {
					var oDateTime = DateFormat.getDateTimeInstance({
						relative: true,
						relativeStyle: sStyle
					});

					oTestData.data.forEach(function (data) {
						if (!data.parseOnly) {
							assert.strictEqual(oDateTime.format(date(data.unit, data.diff)), data.results[index], data.description + " (" + sStyle + ")");
						}
						assert.strictEqual(oDateTime.parse(data.results[index]).getTime() + (data.parseDiff || 0), date(data.unit, data.diff).getTime(), "Parse: " + data.results[index] + " (" + sStyle + ")");
					});
				});
			});
		});

		QUnit.module("Islamic Date in locale en");

		QUnit.test("format date to Islamic type with locale en", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Islamic
				});

			assert.strictEqual(oDateFormat.format(oDate), "Rab. II 12, 1422 AH", "Date is formatted in Islamic calendar");
		});

		QUnit.test("format date to Islamic type with relative and locale en", function (assert) {
			doTestRelative(assert, true, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Islamic }, "en", "yyyy-MM-dd, default range, en with calendar type Islamic");
			doTestRelative(assert, true, { relativeRange: [-9, 0], calendarType: CalendarType.Islamic }, "en", "default style, range [-9, 0], en with calendar type Islamic");
			doTestRelative(assert, true, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Islamic }, "en", "style long, range [1, 5], en with calendar type Islamic");
		});

		QUnit.test("format date to Islamic type edge cases", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Islamic
			}, new Locale("en"));
			[{
				timezone: "Europe/Berlin", // +1
				date: Date.UTC(1999, 2, 18, 22, 12, 11)
			}, {
				timezone: "America/New_York", // -5
				date: Date.UTC(1999, 2, 19, 4, 12, 11)
			}].forEach(function(oFixture) {
				Localization.setTimezone(oFixture.timezone);
				var oDate = UI5Date.getInstance(oFixture.date);

				assert.strictEqual(oDateFormat.format(oDate), "Dhuʻl-Q. 30, 1419 AH",
					"current month in " + oFixture.timezone);

				// add 1 hour to proceed with the next day when converting to the given timezone
				oDate.setUTCHours(oDate.getUTCHours() + 1);

				assert.strictEqual(oDateFormat.format(oDate), "Dhuʻl-H. 1, 1419 AH",
					"succeeding month in " + oFixture.timezone);
				Localization.setTimezone(sDefaultTimezone);
			});
		});

		QUnit.test("parse date to Islamic type with locale en", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Islamic
			});

			var oDate = oDateFormat.parse("Rab. II 12, 1422 AH");
			assert.ok(oDate instanceof Date, "Parsed date is always an instance of Javascript Date");
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2011");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
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
			"12 ברביע ב׳ 1422 הג׳רה"
		];

		QUnit.module("Islamic Date in other locales", {
			beforeEach: function () {
				Formatting.setCalendarType(CalendarType.Islamic);
			},
			afterEach: function () {
				Formatting.setCalendarType(null);
			}
		});

		["ar", "ar_EG", "ar_SA", "he"].forEach(function (sLocale, index) {
			QUnit.test("format Islamic date " + sLocale, function (assert) {
				var oDate = UI5Date.getInstance(2001, 6, 4),
					oDateFormat = DateFormat.getDateInstance(new Locale(sLocale));

				assert.strictEqual(oDateFormat.format(oDate), aResultLocal[index], "Date is formatted to Islamic Date in " + sLocale + " locale");
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
				assert.strictEqual(oDate.getFullYear(), 2001, "Year 2001");
				assert.strictEqual(oDate.getMonth(), 6, "Month July");
				assert.strictEqual(oDate.getDate(), 4, "Day 4th");
			});

			// QUnit.test("parse Islamic date relative " + sLocale, function(assert) {
			// 	doTestRelative(assert, false, {pattern: "yyyy-MM-dd"}, sLocale, "yyyy-MM-dd, default range, " + sLocale);
			// 	doTestRelative(assert, false, {relativeRange: [-9, 0]}, sLocale, "default style, range [-9, 0], " + sLocale);
			// 	doTestRelative(assert, false, {style: "long", relativeRange: [1, 5]}, sLocale, "style long, range [1, 5], " + sLocale);
			// });
		});

		QUnit.module("Japanese Date");

		QUnit.test("format date to Japanese type", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese
				}, new Locale("ja_JP"));

			assert.strictEqual(oDateFormat.format(oDate), "平成13年7月4日", "Date is formatted in Japanese calendar");
		});

		QUnit.test("format date to Japanese type - edge cases", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese
			}, new Locale("ja_JP"));
			[{
				timezone: "Europe/Berlin",
				date: Date.UTC(2019, 3, 30, 20, 12, 11)
			}, {
				timezone: "America/New_York",
				date: Date.UTC(2019, 4, 1, 2, 12, 11)
			}].forEach(function(oFixture) {
				Localization.setTimezone(oFixture.timezone);

				// 2019-5-1 era change
				var oDate1 = UI5Date.getInstance(oFixture.date);

				assert.strictEqual(oDateFormat.format(oDate1), "平成31年4月30日", "old era in " + oFixture.timezone);

				// add 2 hour
				oDate1.setUTCHours(oDate1.getUTCHours() + 2);

				assert.strictEqual(oDateFormat.format(oDate1), "令和元年5月1日", "new era in " + oFixture.timezone);
				Localization.setTimezone(sDefaultTimezone);
			});
		});

		QUnit.test("format/parse date with Gannen instead of Ichinen", function (assert) {
			var oDate = UI5Date.getInstance(2019, 4, 1),
				sDate = "令和元年5月1日",
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese
				}, new Locale("ja_JP")),
				sFormatted = oDateFormat.format(oDate),
				oParsed = oDateFormat.parse(sDate);

			assert.strictEqual(sFormatted, sDate, "Date is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date with Gannen year is parsed correctly");

			oDate = UI5Date.getInstance(2019, 3, 1);
			sDate = "平成31年4月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.strictEqual(sFormatted, sDate, "Year ending with 1 is formatted as a number");
			assert.deepEqual(oParsed, oDate, "Date with numeric year is parsed correctly");

			oDate = UI5Date.getInstance(2019, 4, 1);
			sDate = "R1/5/1";
			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				style: "short"
			}, new Locale("ja_JP"));
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.strictEqual(sFormatted, sDate, "Date is formatted correctly with numeric year");
			assert.deepEqual(oParsed, oDate, "Date with numeric year is parsed correctly");

			oDate = [UI5Date.getInstance(2019, 4, 1), UI5Date.getInstance(2019, 4, 10)];
			sDate = "令和元年5月1日～10日";
			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				interval: true,
				format: "yMMMd"
			}, new Locale("ja_JP"));
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.strictEqual(sFormatted, sDate, "Date interval is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date interval with Gannen year is parsed correctly");

			oDate = [UI5Date.getInstance(2019, 3, 1), UI5Date.getInstance(2019, 4, 1)];
			sDate = "平成31年4月1日～令和元年5月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.strictEqual(sFormatted, sDate, "Date interval is formatted correctly with Gannen year");
			assert.deepEqual(oParsed, oDate, "Date interval with Gannen year is parsed correctly");

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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2011");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Japanese type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "ja_JP", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "ja_JP", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "ja_JP", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.module("Japanese Date in locale en");

		QUnit.test("format date to Japanese type with locale en", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese
				});

			assert.strictEqual(oDateFormat.format(oDate), "Jul 4, 13 Heisei", "Date is formatted in Japanese calendar");
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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2011");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Japanese type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Japanese }, "en", "yyyy-MM-dd, default range, en with calendar type Japanese");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Japanese }, "en", "default style, range [-9, 0], en with calendar type Japanese");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Japanese }, "en", "style long, range [1, 5], en with calendar type Japanese");
		});

		QUnit.module("Persian Date");

		QUnit.test("format date to Persian type", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Persian
				}, new Locale("fa_IR"));

			assert.strictEqual(oDateFormat.format(oDate), "13 تیر 1380", "Date is formatted in Persian calendar");
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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2011");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Persian type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "fa_IR", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "fa_IR", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "fa_IR", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.module("Persian Date in locale en");

		QUnit.test("format date to Persian type with locale en", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Persian
				});

			assert.strictEqual(oDateFormat.format(oDate), "Tir 13, 1380 AP", "Date is formatted in Persian calendar");
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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2001");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Persian type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Persian }, "en", "yyyy-MM-dd, default range, en with calendar type Persian");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Persian }, "en", "default style, range [-9, 0], en with calendar type Persian");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Persian }, "en", "style long, range [1, 5], en with calendar type Persian");
		});

		QUnit.module("Buddhist Date");

		QUnit.test("format date to Buddhist type", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Buddhist
				}, new Locale("th_TH"));

			assert.strictEqual(oDateFormat.format(oDate), "4 ก.ค. 2544", "Date is formatted in Buddhist calendar");
		});

		QUnit.test("format date to Buddhist type edge cases", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			}, new Locale("th_TH"));
			[{
				timezone: "Europe/Berlin",
				date: Date.UTC(1940, 2, 31, 22, 12, 11)
			}, {
				timezone: "America/New_York",
				date: Date.UTC(1940, 3, 1, 4, 12, 11)
			}].forEach(function(oFixture) {
				Localization.setTimezone(oFixture.timezone);
				var oDate1 = UI5Date.getInstance(oFixture.date);

				// Before 1941 new year started on 1st of April
				assert.strictEqual(oDateFormat.format(oDate1), "31 มี.ค. 2482",
					"previous year in " + oFixture.timezone);

				// add 1 hour
				oDate1.setUTCHours(oDate1.getUTCHours() + 1);

				assert.strictEqual(oDateFormat.format(oDate1), "1 เม.ย. 2483",
					"succeeding year in " + oFixture.timezone);
				Localization.setTimezone(sDefaultTimezone);
			});
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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2001");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Buddhist type with relative", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "th_TH", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "th_TH", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "th_TH", "style long, range [1, 5], en with calendar type Buddhist");
		});

		QUnit.module("Buddhist Date in locale en");

		QUnit.test("format date to Buddhist type with locale en", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Buddhist
				});

			assert.strictEqual(oDateFormat.format(oDate), "Jul 4, 2544 BE", "Date is formatted in Buddhist calendar");
		});

		QUnit.test("format date to Buddhist type with locale en and calendar week", function (assert) {
			var oDate = UI5Date.getInstance(2001, 6, 4),
				oDateFormat = DateFormat.getDateInstance({
					calendarType: CalendarType.Buddhist,
					pattern: "YYYY'/'ww"
				});

			assert.strictEqual(oDateFormat.format(oDate), "2544/27", "Date is formatted in Buddhist calendar");


			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist,
				pattern: "yyyy"
			});
			assert.strictEqual(oDateFormat.format(oDate), "2544", "Date is formatted in Buddhist calendar");
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
			assert.strictEqual(oDate.getFullYear(), 2001, "Year 2011");
			assert.strictEqual(oDate.getMonth(), 6, "Month July");
			assert.strictEqual(oDate.getDate(), 4, "Day 4th");
		});

		QUnit.test("parse date to Buddhist type with relative and locale en", function (assert) {
			doTestRelative(assert, false, { pattern: "yyyy-MM-dd", calendarType: CalendarType.Buddhist }, "en", "yyyy-MM-dd, default range, en with calendar type Buddhist");
			doTestRelative(assert, false, { relativeRange: [-9, 0], calendarType: CalendarType.Buddhist }, "en", "default style, range [-9, 0], en with calendar type Buddhist");
			doTestRelative(assert, false, { style: "long", relativeRange: [1, 5], calendarType: CalendarType.Buddhist }, "en", "style long, range [1, 5], en with calendar type Buddhist");
		});

	// DINC0133323
	[
		{buddhistYear : 2465, date : "May 1, 2465 BE", expected : {day : 1, month : 4, year : 1922}},
		{buddhistYear : 2482, date : "Mar 1, 2482 BE", expected : {day : 1, month : 2, year : 1940}},
		{buddhistYear : 2483, date : "Apr 1, 2483 BE", expected : {day : 1, month : 3, year : 1940}},
		{buddhistYear : 2484, date : "Jan 1, 2484 BE", expected : {day : 1, month : 0, year : 1941}},
		{buddhistYear : 2484, date : "Apr 1, 2484 BE", expected : {day : 1, month : 3, year : 1941}}
	].forEach(function (oFixture, i) {
		QUnit.test("parse and format dates with Buddhist calendar around era change " + i, function (assert) {
			const oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist
			});
			const oFullYearSpy = this.spy(Buddhist.prototype, "setUTCFullYear");
			const oMonthSpy = this.spy(Buddhist.prototype, "setUTCMonth");

			// code under test
			const oDate = oDateFormat.parse(oFixture.date);

			assert.ok(oFullYearSpy.calledOnceWithExactly(oFixture.buddhistYear, oFixture.expected.month,
				oFixture.expected.day));
			assert.ok(oMonthSpy.notCalled, "setMonth is not called");
			assert.strictEqual(oDate.getFullYear(), oFixture.expected.year);
			assert.strictEqual(oDate.getMonth(), oFixture.expected.month);
			assert.strictEqual(oDate.getDate(), 1, oFixture.expected.day);

			// code under test
			assert.strictEqual(oDateFormat.format(oDate), oFixture.date);
		});
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
			this.oIntervalFormat.format(UI5Date.getInstance());
			assert.strictEqual(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.strictEqual(this.oErrorSpy.getCall(0).args[0], "Interval DateFormat expects an array with two dates for the first argument but only one date is given.", "Correct log message");
		});

		QUnit.test("Interval format with array but length != 2", function (assert) {
			this.oIntervalFormat.format([UI5Date.getInstance()]);
			assert.strictEqual(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.strictEqual(this.oErrorSpy.getCall(0).args[0], "Interval DateFormat can only format with 2 date instances but 1 is given.");
		});

		QUnit.test("Interval format with invalid date", function (assert) {
			this.oIntervalFormat.format([UI5Date.getInstance(), UI5Date.getInstance("abc")]);
			assert.strictEqual(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.strictEqual(this.oErrorSpy.getCall(0).args[0], "At least one date instance which is passed to the interval DateFormat isn't valid.");
		});

		QUnit.test("DateFormat with array", function (assert) {
			this.oFormat.format([]);
			assert.strictEqual(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.strictEqual(this.oErrorSpy.getCall(0).args[0], "Non-interval DateFormat can't format more than one date instance.");
		});

		QUnit.test("Check if end date is before start date", function (assert) {
			var aParsedInterval,
			 oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				strictParsing: true
			});

			var endDate = UI5Date.getInstance(2018,1,1);
			var startDate = UI5Date.getInstance(2019,1,15);

			// no strictParsing
			aParsedInterval = this.oIntervalFormat.parse("Feb 15, 2019 \u2013 Feb 1, 2018");
			assert.deepEqual(aParsedInterval, [startDate, endDate], "Parsed array is returned.");

			// strictParsing
			aParsedInterval = oIntervalFormat.parse("Feb 1, 2019 \u2013 Feb 15, 2018");
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
			assert.strictEqual(this.oErrorSpy.callCount, 1, "Error is logged");
			assert.strictEqual(this.oErrorSpy.getCall(0).args[0], "The given date instance isn't valid.");
		});

		QUnit.module("interval behavior");

		QUnit.test("_getDiffFields: Date instance", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMd"
			});

			// + 2 days
			var oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)), CalendarType.Gregorian);
			var oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 2 * 24 * 3600 * 1000), CalendarType.Gregorian);

			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "Day": true }, "correct diff returned");

			// + 0.5 day
			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 12 * 3600 * 1000));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), null,
				"if two dates are identical on the fields which we compare, 'null' will be returned");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "Md"
			});

			// + 1 month and + 1 year
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2018, 4, 11)));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]),
				{ "Year": true, "Month": true, "Week": true }, "correct diff returned");

			// + 3 month
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)), CalendarType.Gregorian);
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 6, 11)), CalendarType.Gregorian);
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]),
				{ "Quarter": true, "Month": true, "Week": true }, "correct diff returned");
		});

		QUnit.test("_getDiffFields: Time instance", function (assert) {
			var oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			var oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "Hour": true, "Minute": true },
				"correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 4, 11)));
			assert.strictEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 1800 * 1000));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "Minute": true },
				"the correct diff returned.");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			});

			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 4, 11, 12)));

			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "DayPeriod": true, "Hour": true },
				"correct diff returned");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "K"
			});

			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 4, 11, 12)));

			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "DayPeriod": true, "Hour": true },
				"correct diff returned");
		});

		QUnit.test("_getDiffFields: DateTime instance", function (assert) {
			var oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			var oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "Hour": true, "Minute": true },
				"correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 999));
			assert.strictEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(UI5Date.getInstance(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(oDate.getTime() + 1800 * 1000));
			assert.deepEqual(oIntervalFormat._getDiffFields([oDate, oDate1]), { "Minute": true },
				"correct diff returned.");
		});

		QUnit.module("format & parse interval");

		QUnit.test("Interval format with Date instance under locale DE", function (assert) {
			var oLocale = new Locale("de-DE");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			}, oLocale);

			var oDate = UI5Date.getInstance(2017, 3, 11);
			var oDate1 = UI5Date.getInstance(oDate.getTime() + 2 * 24 * 3600 * 1000);
			var sResult = oIntervalFormat.format([oDate, oDate1]);

			assert.strictEqual(sResult, "11.\u201313. Apr. 2017");
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
			oDate1 = UI5Date.getInstance(2019, 2, 1);
			oDate2 = UI5Date.getInstance(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "Mar 1\u2009\u2013\u2009Apr 1, 31 Heisei");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Same era, different year
			oDate1 = UI5Date.getInstance(2018, 3, 1);
			oDate2 = UI5Date.getInstance(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "Apr 1, 30\u2009\u2013\u2009Apr 1, 31 Heisei");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era
			oDate1 = UI5Date.getInstance(2019, 3, 1);
			oDate2 = UI5Date.getInstance(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "Apr 1, 31 Heisei\u2009\u2013\u2009May 1, 1 Reiwa");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era, same year
			oDate1 = UI5Date.getInstance(1989, 4, 1);
			oDate2 = UI5Date.getInstance(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "May 1, 1 Heisei\u2009\u2013\u2009May 1, 1 Reiwa");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

		});

		QUnit.test("format date to Japanese type with locale de and calendar week",
			function (assert) {
				var oDate, oDateFormatCalendarYear, oDateFormatYearWeek,
					oDeLocale = new Locale("de");

				oDateFormatYearWeek = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese,
					pattern: "YYYY'/'ww"
				}, oDeLocale);

				oDateFormatCalendarYear = DateFormat.getDateInstance({
					calendarType: CalendarType.Japanese,
					pattern: "yyyy"
				}, oDeLocale);


				// 2022 (Reiwa 4)
				oDate = UI5Date.getInstance(2022, 0, 1);
				assert.strictEqual(oDateFormatYearWeek.format(oDate), "2021/52",
					"Date is formatted in Japanese calendar (YYYY'/'ww)");
				assert.strictEqual(oDateFormatCalendarYear.format(oDate), "0004",
					"Date is formatted in Japanese calendar (yyyy)");

				// 2016 (Heisei 28)
				oDate = UI5Date.getInstance(2016, 0, 1);
				assert.strictEqual(oDateFormatYearWeek.format(oDate), "2015/53",
					"Date is formatted in Japanese calendar (YYYY'/'ww)");
				assert.strictEqual(oDateFormatCalendarYear.format(oDate), "0028",
					"Date is formatted in Japanese calendar (yyyy)");
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
			oDate1 = UI5Date.getInstance(2019, 2, 1);
			oDate2 = UI5Date.getInstance(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "平成31年3月1日～4月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Same era, different year
			oDate1 = UI5Date.getInstance(2018, 3, 1);
			oDate2 = UI5Date.getInstance(2019, 3, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "平成30年4月1日～31年4月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era
			oDate1 = UI5Date.getInstance(2019, 3, 1);
			oDate2 = UI5Date.getInstance(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "平成31年4月1日～令和元年5月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

			// Different era, same year
			oDate1 = UI5Date.getInstance(1989, 4, 1);
			oDate2 = UI5Date.getInstance(2019, 4, 1);
			sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "平成元年5月1日～令和元年5月1日");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate1, oDate2]);

		});

		QUnit.test("Interval format with Date instance regarding calendar week and quarter", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yw"
			});

			var oDate = UniversalDate.getInstance(UI5Date.getInstance(2017, 2, 31));
			var oDate1 = UniversalDate.getInstance(UI5Date.getInstance(2017, 3, 1));
			var sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "week 13 of 2017", "Two dates correctly formatted");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMw"
			});
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "Mar 2017 (week: 13)\u2009\u2013\u2009Apr 2017 (week: 13)",
				"Two dates correctly formatted");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yQ"
			});
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "Q1 2017\u2009\u2013\u2009Q2 2017", "Two dates correctly formatted");

			oDate = UniversalDate.getInstance(UI5Date.getInstance(2017, 3, 1));
			oDate1 = UniversalDate.getInstance(UI5Date.getInstance(2017, 3, 13));
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "Q2 2017", "Two dates correctly formatted");
		});

		QUnit.test("Interval format without 'format' option - fallback interval pattern is used", function (assert) {
			var oLocale = new Locale("de-DE");

			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				style: "short"
			}, oLocale);
			var oDate = UI5Date.getInstance(2017, 3, 11);
			var oDate1 = UI5Date.getInstance(oDate.getTime() + 2 * 24 * 3600 * 1000);

			var sResult = oIntervalFormat.format([oDate, oDate1]);

			assert.strictEqual(sResult, "11.04.17\u2009\u2013\u200913.04.17");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oLocale = new Locale("de-DE");
			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				pattern: "G y MM d"
			}, oLocale);

			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "n. Chr. 2017 04 11\u2009\u2013\u2009n. Chr. 2017 04 13");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);
		});

		QUnit.test("Allow single date", function(assert) {
			var oDate1 = UI5Date.getInstance(2019, 0, 24),
				oDate2 = UI5Date.getInstance(2019, 0, 31);

			// default interval formatting
			var oIntervalFormat = DateFormat.getDateInstance({ interval: true	});
			assert.strictEqual(oIntervalFormat.format([oDate1, oDate2]), "Jan 24, 2019\u2009\u2013\u2009Jan 31, 2019",
				"Date interval returned");
			assert.strictEqual(oIntervalFormat.format([oDate1, null]), "", "Empty String returned");
			assert.strictEqual(oIntervalFormat.format([oDate1, oDate1]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019"), [oDate1, oDate1], "Array with two dates returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 - Jan 31, 2019"), [oDate1, oDate2], "Array with two dates returned.");

			// allow single date option set
			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				singleIntervalValue: true
			});

			assert.strictEqual(oIntervalFormat.format([oDate1, null]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.strictEqual(oIntervalFormat.format([oDate1, oDate2]), "Jan 24, 2019\u2009\u2013\u2009Jan 31, 2019", "Date interval returned");
			assert.strictEqual(oIntervalFormat.format([oDate1, null]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");
			assert.strictEqual(oIntervalFormat.format([null, oDate1]), "", "Empty String returned.");
			assert.strictEqual(oIntervalFormat.format([null, null]), "", "Empty String returned.");
			assert.strictEqual(oIntervalFormat.format([oDate1, oDate1]), "Jan 24, 2019", "Single Date returned: Jan 24, 2019");

			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019"), [oDate1, null], "Array with single Date and null returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 \u2013 Jan 24, 2019"), [oDate1, null],
				"Array with two date objects is returned.");
			assert.deepEqual(oIntervalFormat.parse("Jan 24, 2019 \u2013 Jan 31, 2019"), [oDate1, oDate2],
				"Array with two date objects is returned.");
		});

		QUnit.test("am/pm", function (assert) {
			var oLocale = new Locale("en");

			var oDate = UI5Date.getInstance(1970, 0, 1, 9, 0, 0);
			var oDate1 = UI5Date.getInstance(1970, 0, 1, 13, 0, 0);

			var oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			}, oLocale);

			var sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "9\u202fAM\u2009\u2013\u20091\u202fPM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oDate = UI5Date.getInstance(1970, 0, 1, 11, 0, 0);
			oDate1 = UI5Date.getInstance(1970, 0, 1, 12, 0, 0);

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "K"
			}, oLocale);

			// optimised interval pattern only uses 'h'. 'K' is automatically converted
			// to 'h'.
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(sResult, "11\u202fAM\u2009\u2013\u200912\u202fPM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);

			oDate = UI5Date.getInstance(1970, 0, 1, 10, 0, 0);
			oDate1 = UI5Date.getInstance(1970, 0, 1, 11, 0, 0);

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			}, oLocale);

			// optimised interval pattern only uses 'h'. 'K' is automatically converted
			// to 'h'.
			sResult = oIntervalFormat.format([oDate, oDate1]);
			assert.strictEqual(oIntervalFormat.format([oDate, oDate1]), "10\u2009\u2013\u200911\u202fAM");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate1]);
		});

		QUnit.test("Interval with two identical dates", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMd"
			});

			var oFormat = DateFormat.getDateInstance({
				format: "yMd"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = UI5Date.getInstance(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.strictEqual(sResult, oFormat.format(oDate), "if two dates are identical on the fields which we compare, a single date will be formatted.");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate]);
		});

		QUnit.test("Interval with two identical dates after formatting different dates", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yMMMd"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = UI5Date.getInstance(2017, 3, 11);
			var oDate2 = UI5Date.getInstance(2017, 3, 12);
			var sResult = oIntervalFormat.format([oDate1, oDate2]);
			assert.strictEqual(sResult, "Apr 11\u2009\u2013\u200912, 2017", "Different dates are formatted correctly");

			sResult = oIntervalFormat.format([oDate1, oDate1]);
			assert.strictEqual(sResult, "Apr 11, 2017", "Single Date if formatted correctly afterwards");
		});

		QUnit.test("Interval with two identical dates without format property", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true
			});

			var oFormat = DateFormat.getDateInstance();

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = UI5Date.getInstance(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.strictEqual(sResult, oFormat.format(oDate), "if two dates are identical on the fields which we compare, a single date will be formatted.");
			assert.deepEqual(oIntervalFormat.parse(sResult), [oDate, oDate]);
		});

		QUnit.test("Interval with year and quarter in skeleton", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yQQQ"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = UI5Date.getInstance(2017, 2, 11);
			var oDate2 = UI5Date.getInstance(2017, 5, 11);
			var oDate3 = UI5Date.getInstance(2017, 1, 11);

			var sResult1 = oIntervalFormat.format([oDate1, oDate2]);
			var sResult2 = oIntervalFormat.format([oDate1, oDate3]);

			assert.strictEqual(sResult1, "Q1 2017\u2009\u2013\u2009Q2 2017");
			assert.strictEqual(sResult2, "Q1 2017");
		});

		QUnit.test("Interval with year and weekNumber in skeleton", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "yw"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate1 = UI5Date.getInstance(2017, 2, 11);
			var oDate2 = UI5Date.getInstance(2017, 2, 21);
			var oDate3 = UI5Date.getInstance(2017, 2, 22);

			var sResult1 = oIntervalFormat.format([oDate1, oDate2]);
			var sResult2 = oIntervalFormat.format([oDate2, oDate3]);

			assert.strictEqual(sResult1, "week 10 of 2017\u2009\u2013\u2009week 12 of 2017");
			assert.strictEqual(sResult2, "week 12 of 2017");
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

			var oDate = UI5Date.getInstance(2017, 3, 11);
			var oDate1 = UI5Date.getInstance(oDate.getTime() + 2 * 24 * 3600 * 1000);

			var sResult = oIntervalFormat1.format([oDate, oDate1]);
			assert.deepEqual(oIntervalFormat2.parse(sResult), [null, null]);
		});

		QUnit.test("Interval parse with fallback pattern", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				format: "yMMMd",
				interval: true
			});

			var oDate = UI5Date.getInstance(2017, 3, 11);
			var oDate1 = UI5Date.getInstance(2017, 3, 13);
			var aCompare = [oDate, oDate1];

			assert.deepEqual(oIntervalFormat.parse("4/11/17 \u2013 4/13/17"), aCompare, "Parse fallback short style");
			assert.deepEqual(oIntervalFormat.parse("4/11/17 - 4/13/17"), aCompare, "Parse fallback short style with common connector");
			assert.deepEqual(oIntervalFormat.parse("Apr 11, 2017 \u2013 Apr 13, 2017"), aCompare,
				"Parse fallback medium style");
			assert.deepEqual(oIntervalFormat.parse("Apr 11, 2017 - Apr 13, 2017"), aCompare, "Parse fallback medium style with common connector");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 \u2013 2017-04-13"), aCompare,
				"Parse fallback with pattern 'yyyy-MM-dd'");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 - 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("20170411 \u2013 20170413"), aCompare,
				"Parse fallback with pattern 'yyyyMMdd'");
			assert.deepEqual(oIntervalFormat.parse("20170411 - 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("041117 \u2013 041317"), aCompare,
				"Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("041117 - 041317"), aCompare, "Parse fallback with no delimiter and common connector");
			assert.deepEqual(oIntervalFormat.parse("04112017 \u2013 04132017"), aCompare,
				"Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("04112017 - 04132017"), aCompare, "Parse fallback with no delimiter and common connector");
		});

		QUnit.test("Interval parse with fallback locale de-DE", function (assert) {
			var oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				pattern: "'abc' dd.MM" // a non match pattern to test the fallbacks
			}, new Locale("de_DE"));

			var oDate = UI5Date.getInstance(2017, 3, 11);
			var oDate1 = UI5Date.getInstance(2017, 3, 13);
			var aCompare = [oDate, oDate1];

			assert.deepEqual(oIntervalFormat.parse("11.04.17 \u2013 13.04.17"), aCompare,
				"Parse fallback short style");
			assert.deepEqual(oIntervalFormat.parse("11.04.17 - 13.04.17"), aCompare, "Parse fallback short style with common connector");
			assert.deepEqual(oIntervalFormat.parse("11.04.2017 \u2013 13.04.2017"), aCompare,
				"Parse fallback medium style");
			assert.deepEqual(oIntervalFormat.parse("11.04.2017 - 13.04.2017"), aCompare, "Parse fallback medium style with common connector");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 \u2013 2017-04-13"), aCompare,
				"Parse fallback with pattern 'yyyy-MM-dd'");
			assert.deepEqual(oIntervalFormat.parse("2017-04-11 - 2017-04-13"), aCompare, "Parse fallback with pattern 'yyyy-MM-dd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("20170411 \u2013 20170413"), aCompare,
				"Parse fallback with pattern 'yyyyMMdd'");
			assert.deepEqual(oIntervalFormat.parse("20170411 - 20170413"), aCompare, "Parse fallback with pattern 'yyyyMMdd' and common connector");
			assert.deepEqual(oIntervalFormat.parse("110417 \u2013 130417"), aCompare,
				"Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("110417 - 130417"), aCompare, "Parse fallback with no delimiter and common connector");
			assert.deepEqual(oIntervalFormat.parse("11042017 \u2013 13042017"), aCompare,
				"Parse fallback with no delimiter");
			assert.deepEqual(oIntervalFormat.parse("11042017 - 13042017"), aCompare, "Parse fallback with no delimiter and common connector");
		});

		QUnit.module("FallbackFormatOptions");

		QUnit.test("Immutability of multiple DateFormat instances", function (assert) {
			var oDate = UI5Date.getInstance(2017, 3, 11);
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

		QUnit.module("Timezone pattern symbol VV", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("Format with pattern symbol non VV", function (assert) {
			assert.strictEqual(DateFormat.getDateTimeInstance({pattern: "V"}).format(oDateTime), "",
				"No timezone is formatted for pattern 'V'");

			assert.strictEqual(DateFormat.getDateTimeInstance({pattern: "VVV"}).format(oDateTime), "",
				"No timezone is formatted for pattern 'VVV'");
		});

		QUnit.test("Format with pattern symbol VV", function (assert) {
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).format(oDateTime, true), "",
				"No timezone is formatted for UTC");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).format(oDateTime), "Europe, Berlin",
				"Only local timezone is formatted");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "z"
				}).format(oDateTime), "GMT+02:00",
				"Only local offset is formatted");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV z"
				}).format(oDateTime), "2000-09-23T08:46:13 Europe, Berlin GMT+02:00",
				"Local timezone and offset is formatted");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"
				}).format(oDateTime), "2000-09-23T08:46:13 GMT+02:00 Europe, Berlin",
				"Local offset and timezone is formatted");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
				}).format(oDateTime), "2000-09-23T08:46:13 Europe, Berlin",
				"Local timezone is formatted");
		});

		QUnit.test("Parse with pattern symbol VV", function (assert) {
			var oDate = UI5Date.getInstance(Date.UTC(1970, 0, 1, 0, 0, 0));
			oDate.setUTCHours(oDate.getUTCHours() - 1); // GMT+1 (Europe/Berlin)
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).parse("Europe, Berlin", false, true).getTime(), oDate.getTime(),
				"Parsed the initial unix epoch date with pattern symbol VV.");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "z"
				}).parse("GMT+01:00").getTime(), oDate.getTime(),
				"Parsed the initial unix epoch date with pattern symbol z.");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV z"
				}).parse("2000-09-23T08:46:13 Europe, Berlin GMT+02:00").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbols VV and z.");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"
				}).parse("2000-09-23T08:46:13 GMT+02:00 Europe, Berlin").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbols z and VV.");
			assert.strictEqual(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
				}).parse("2000-09-23T08:46:13 Europe, Berlin").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbol VV.");
		});

		QUnit.module("DateFormat relative date with timezone America/New_York", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(UI5Date.getInstance("2021-10-09T02:37:00Z").getTime());
				// Oct 8th 22:37 (New York -4 EDT)
				Localization.setTimezone("America/New_York");
			},
			afterEach: function () {
				this.clock.restore();
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("format date relative date", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = UI5Date.getInstance(Date.UTC(2021, 9, 9, 7, 37));
			// Oct 8th 22:37 (New York) -
			// Oct 9th 3:37 (New York)

			var sRelative = oDateFormat.format(oDate);

			assert.strictEqual(sRelative, "in 1 Tag");
		});

		QUnit.test("parse date relative date in 1 Tag", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");
			oDate.setDate(oDate.getDate() + 1);

			// Oct 8th 22:37 (New York) -
			// Oct 9th 22:37 (New York)

			var oRelative = oDateFormat.parse("in 1 Tag");
			assert.strictEqual(oDateFormat.parse("morgen").getTime(), oRelative.getTime());

			assert.strictEqual(oRelative.getTime(), oDate.getTime());
		});

		QUnit.module("DateFormat with timezone Australia/Sydney", {
			beforeEach: function () {
				Localization.setTimezone("Australia/Sydney");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("integration: format and parse with pattern 'yyyy-MM-dd'T'HH:mm:ss.SSSXXX", function (assert) {
			// Sydney
			// 2018	Sun, 1 Apr, 03:00	AEDT → AEST
			// from UTC+11h to UTC+10
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
			}, new Locale("de"));

			// AEDT
			var oDateAEDT = UI5Date.getInstance("2018-03-31T13:00:00Z");
			var sFormattedAEDT = oDateFormat.format(oDateAEDT);
			assert.strictEqual(sFormattedAEDT, "2018-04-01T00:00:00.000+11:00", "format AEDT");
			assert.strictEqual(oDateFormat.parse(sFormattedAEDT).getTime(), oDateAEDT.getTime(), "parse AEST");

			// AEST
			var oDateAEST = UI5Date.getInstance("2018-03-31T18:00:00Z");
			var sFormattedAEST = oDateFormat.format(oDateAEST);
			assert.strictEqual(sFormattedAEST, "2018-04-01T04:00:00.000+10:00", "format AEST");
			assert.strictEqual(oDateFormat.parse(sFormattedAEST).getTime(), oDateAEST.getTime(), "parse AEST");
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
			// Sydney
			// 2018	Sun, 1 Apr, 03:00	AEDT → AEST
			// 2018 Sun, 7 Oct, 02:00	AEST → AEDT
			[
				"31.03.2018, 17:00:00", // DST
				"01.04.2018, 00:00:00", // still DST
				"01.04.2018, 01:00:00", // still DST
				"01.04.2018, 02:00:00", // twice (regular + "switch back")
				"01.04.2018, 02:59:00", // shortly before "switch back" to standard time
				"01.04.2018, 03:00:00", // standard time (discard time at "switch back")
				"01.04.2018, 03:01:00", // standard time
				"01.04.2018, 04:00:00", // standard time
				"01.04.2018, 05:00:00", // standard time
				"01.04.2018, 17:00:00", // standard time

				"06.10.2018, 17:00:00", // standard time
				"07.10.2018, 00:00:00", // still standard time
				"07.10.2018, 01:00:00", // still standard time
				"07.10.2018, 01:59:00", // still standard time
				"07.10.2018, 02:00:00", // becomes 03:00 at "switch forward"
				"07.10.2018, 02:01:00", // does not exist (as does 02:01 - 02:59)
				"07.10.2018, 03:00:00", // DST (direct "switch forward" from 02:00)
				"07.10.2018, 03:01:00", // DST
				"07.10.2018, 08:00:00", // DST
				"07.10.2018, 15:00:00"  // DST
			].forEach(function (sFormatted) {
				assert.deepEqual(oDateFormat.parse(sFormatted),
					oDateFormat.parse(oDateFormat.format(oDateFormat.parse(sFormatted))), "check formats: " + sFormatted);
			});

			// does not exist (as does 02:01 - 02:59)
			assert.deepEqual(oDateFormat.parse("07.10.2018, 03:01:00"), oDateFormat.parse("07.10.2018, 02:01:00"),
				"parse to the same date/time, but formatted to: '07.10.2018, 02:01:00'");
		});


		QUnit.module("DateFormat with timezone Europe/Berlin", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
			// Berlin
			// 2018	Sun, 25 Mar, 02:00	CET → CEST	+1 hour (DST start)	UTC+2h
			//  	Sun, 28 Oct, 03:00	CEST → CET	-1 hour (DST end)	UTC+1h
			[
				"24.03.2018, 20:00:00",
				"24.03.2018, 23:00:00",
				"25.03.2018, 00:00:00",
				"25.03.2018, 01:00:00",
				"25.03.2018, 02:00:00",
				"25.03.2018, 02:30:00",
				"25.03.2018, 03:00:00",
				"25.03.2018, 03:30:00",
				"25.03.2018, 04:00:00",
				"25.03.2018, 10:00:00",
				"25.03.2018, 20:00:00",

				"27.10.2018, 20:00:00",
				"27.10.2018, 23:00:00",
				"28.10.2018, 00:00:00",
				"28.10.2018, 01:00:00",
				"28.10.2018, 02:00:00",
				"28.10.2018, 03:00:00",
				"28.10.2018, 04:00:00",
				"28.10.2018, 10:00:00",
				"28.10.2018, 20:00:00"
			].forEach(function (sFormatted) {
				assert.deepEqual(oDateFormat.parse(sFormatted),
					oDateFormat.parse(oDateFormat.format(oDateFormat.parse(sFormatted))), "check formats: " + sFormatted);
			});
		});

		QUnit.module("DateFormat with timezone America/Adak", {
			beforeEach: function () {
				Localization.setTimezone("America/Adak");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
			// Adak
			// Sun, 11 Mar, 02:00	HST → HDT	+1 hour (DST start)	UTC-9h
			// Sun, 4 Nov, 02:00	HDT → HST	-1 hour (DST end)	UTC-10h
			[
				"10.03.2018, 10:00:00",
				"10.03.2018, 20:00:00",
				"11.03.2018, 00:00:00",
				"11.03.2018, 01:00:00",
				"11.03.2018, 02:00:00",
				"11.03.2018, 02:30:00",
				"11.03.2018, 03:00:00",
				"11.03.2018, 03:30:00",
				"11.03.2018, 04:00:00",
				"11.03.2018, 10:00:00",
				"11.03.2018, 20:00:00",

				"03.11.2018, 10:00:00",
				"03.11.2018, 20:00:00",
				"04.11.2018, 00:00:00",
				"04.11.2018, 01:00:00",
				"04.11.2018, 02:00:00",
				"04.11.2018, 03:00:00",
				"04.11.2018, 04:00:00",
				"04.11.2018, 10:00:00",
				"04.11.2018, 20:00:00"
			].forEach(function (sFormatted) {
				assert.deepEqual(oDateFormat.parse(sFormatted),
					oDateFormat.parse(oDateFormat.format(oDateFormat.parse(sFormatted))), "check formats: " + sFormatted);
			});
		});

		QUnit.module("DateFormat with timezone Pacific/Kiritimati", {
			beforeEach: function () {
				Localization.setTimezone("Pacific/Kiritimati");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
			// Kiritimati
			[
				"01.01.2018, 14:00:00",
				"02.02.2018, 14:00:00",
				"03.03.2018, 14:00:00",
				"04.04.2018, 14:00:00",
				"05.05.2018, 14:00:00",
				"06.06.2018, 14:00:00",
				"07.07.2018, 14:00:00",
				"08.08.2018, 14:00:00",
				"09.09.2018, 14:00:00",
				"10.10.2018, 14:00:00",
				"11.11.2018, 14:00:00",
				"12.12.2018, 14:00:00"
			].forEach(function (sFormatted) {
				assert.deepEqual(oDateFormat.parse(sFormatted),
					oDateFormat.parse(oDateFormat.format(oDateFormat.parse(sFormatted))), "check formats: " + sFormatted);
			});
		});


		QUnit.module("DateFormat with timezone America/New_York", {
			beforeEach: function () {
				Localization.setTimezone("America/New_York");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.strictEqual(sFormatted, "08.10.2021, 22:37:00");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime());
		});

		QUnit.test("integration: format and parse for different locales", function (assert) {
			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");
			["ar", "sv", "fr", "en", "da", "tr", "ja", "ru"].forEach(function(sLocale) {
				var oDateFormat = DateFormat.getDateTimeInstance(new Locale(sLocale));
				var sFormatted = oDateFormat.format(oDate);

				assert.ok(sFormatted, "formatted '" + sFormatted + "' correctly for locale " + sLocale);

				var oParsedDate = oDateFormat.parse(sFormatted);

				assert.strictEqual(oParsedDate.getTime(), oDate.getTime(), "correctly parsed for locale " + sLocale);
			});
		});

		QUnit.test("integration: format and parse for different timezones", function (assert) {
			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");
			[
				{timezone: "Pacific/Niue",          expectedDate: "08.10.2021, 15:37:00"}, // -11:00
				{timezone: "Pacific/Tahiti",        expectedDate: "08.10.2021, 16:37:00"}, // -10:00
				{timezone: "Pacific/Marquesas",     expectedDate: "08.10.2021, 17:07:00"}, // -09:30
				{timezone: "America/Adak",          expectedDate: "08.10.2021, 17:37:00"}, // -09:00
				{timezone: "America/Boise",         expectedDate: "08.10.2021, 20:37:00"}, // -06:00
				{timezone: "America/Bogota",        expectedDate: "08.10.2021, 21:37:00"}, // -05:00
				{timezone: "America/Indiana/Knox",  expectedDate: "08.10.2021, 21:37:00"}, // -05:00
				{timezone: "America/New_York",      expectedDate: "08.10.2021, 22:37:00"}, // -04:00
				{timezone: "Atlantic/Azores",       expectedDate: "09.10.2021, 02:37:00"}, // +00:00
				{timezone: "Europe/Berlin",         expectedDate: "09.10.2021, 04:37:00"}, // +02:00
				{timezone: "Asia/Gaza",             expectedDate: "09.10.2021, 05:37:00"}, // +03:00
				{timezone: "Europe/Athens",         expectedDate: "09.10.2021, 05:37:00"}, // +03:00
				{timezone: "Europe/Saratov",        expectedDate: "09.10.2021, 06:37:00"}, // +04:00
				{timezone: "Asia/Taipei",           expectedDate: "09.10.2021, 10:37:00"}, // +08:00
				{timezone: "Antarctica/Casey",      expectedDate: "09.10.2021, 13:37:00"}, // +11:00
				{timezone: "Pacific/Fiji",          expectedDate: "09.10.2021, 14:37:00"}, // +12:00
				{timezone: "Pacific/Chatham",       expectedDate: "09.10.2021, 16:22:00"}  // +13:45
			].forEach(function(oFixture) {
				Localization.setTimezone(oFixture.timezone);
				var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
				var sFormatted = oDateFormat.format(oDate);

				assert.strictEqual(sFormatted, oFixture.expectedDate,
					"formatted '" + sFormatted + "' correctly for timezone " + oFixture.timezone);

				var oParsedDate = oDateFormat.parse(sFormatted);

				assert.strictEqual(oParsedDate.getTime(), oDate.getTime(),
					"correctly parsed for timezone " + oFixture.timezone);
			});
		});

		QUnit.test("integration: format and parse with pattern 'yyyy-MM-dd'T'HH:mm:ss.SSSXXX'-'VV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX'-'VV"
			}, new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.strictEqual(sFormatted, "2021-10-08T22:37:00.000-04:00-Amerika, New York");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime());
		});

		QUnit.test("integration: format and parse with pattern 'yyyy-MM-dd'T'HH:mm:ss.SSS'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS"
			}, new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.strictEqual(sFormatted, "2021-10-08T22:37:00.000");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime());
		});

		// zulu timestamp coming from backend (e.g. for OData)
		QUnit.test("parse: data conversion with pattern 'yyyy-MM-dd'T'HH:mm:ssXXX'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ssXXX"
			}, new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");

			var oParsedDate = oDateFormat.parse("2021-10-09T02:37:00Z");
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");

			// utc
			oParsedDate = oDateFormat.parse("2021-10-09T02:37:00Z", true);
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");
		});

		QUnit.test("parse UTC: with pattern 'yyyy-MM-dd'T'HH:mm:ss'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss"
			}, new Locale("de"));

			var oDate = UI5Date.getInstance("2021-10-09T02:37:00Z");

			var oParsedDate = oDateFormat.parse("2021-10-09T02:37:00", true);
			assert.strictEqual(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");
		});

		QUnit.module("DateFormat with timezone Europe/Berlin", {
			beforeEach: function () {
				Localization.setTimezone("Europe/Berlin");
			},
			afterEach: function () {
				Localization.setTimezone(sDefaultTimezone);
			}
		});

		QUnit.test("fallback instance with UTC format option inheritence", function (assert) {
			var oDateFormatted = "2018-08-15T13:07:47.000Z";
			var oFormatter = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
				UTC: true
			});

			var oUTCDate = UI5Date.getInstance("2018-08-15T13:07:47Z");
			var oParsed = oFormatter.parse(oDateFormatted);
			assert.deepEqual(oParsed, oUTCDate);
			assert.deepEqual(oFormatter.format(oParsed), oDateFormatted);

			// fallback
			oDateFormatted = "Aug 15, 2018, 1:07:47 PM";
			oParsed = oFormatter.parse(oDateFormatted);
			assert.deepEqual(oParsed, oUTCDate);
		});

		QUnit.test("Historical timezones", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss"
			}, new Locale("de_DE"));

			[
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate: "1894-01-01T00:00:00Z",
					formatted: "1894-01-01T01:00:00"
				},
				// Before: (UTC+0:53:28)
				{
					inputDate: "1893-01-01T00:00:00Z",
					formatted: "1893-01-01T00:53:28"
				},
				{
					inputDate: "1730-01-01T00:00:00Z",
					formatted: "1730-01-01T00:53:28"
				},
				{
					inputDate: "1730-01-01T00:00:02Z",
					formatted: "1730-01-01T00:53:30"
				},
				{
					inputDate: "1730-01-01T00:00:32Z",
					formatted: "1730-01-01T00:54:00"
				}
			].forEach(function (oFixture) {
				assert.deepEqual(oDateFormat.format(UI5Date.getInstance(oFixture.inputDate)),
					oFixture.formatted, "Format '" + oFixture.formatted + "'");
				assert.deepEqual(oDateFormat.parse(oFixture.formatted),
					UI5Date.getInstance(oFixture.inputDate), "Parse '" + oFixture.formatted + "'");
			});
		});

		QUnit.test("Historical timezones with timezone patterns", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "yyyy'-'z' 'Z' 'X' 'XX' 'XXX"
			}, new Locale("de_DE"));

			[
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate: "1894-01-01T00:00:00Z",
					formatted: "1894-GMT+01:00 +0100 +01 +0100 +01:00"
				},
				// Before: (UTC+0:53:28)
				{
					inputDate: "1893-01-01T00:00:00Z",
					formatted: "1893-GMT+00:53 +0053 +0053 +0053 +00:53"
				},
				{
					inputDate: "1730-01-01T00:00:00Z",
					formatted: "1730-GMT+00:53 +0053 +0053 +0053 +00:53"
				}
			].forEach(function (oFixture) {
				assert.deepEqual(oDateFormat.format(UI5Date.getInstance(oFixture.inputDate)),
					oFixture.formatted, "Format '" + oFixture.formatted + "'");
			});
		});

	//*****************************************************************************************************************
	QUnit.module("sap.ui.core.format.DateFormat", {
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			Localization.setLanguage("en_US");
			Localization.setTimezone("Europe/Berlin");
		},
		afterEach: function () {
			Localization.setTimezone(sDefaultTimezone);
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************************************************
	QUnit.test("_createPatternSymbol", function (assert) {
		// code under test: defaulting
		var oSymbol = DateFormat._createPatternSymbol({});

		assert.strictEqual(oSymbol.name, undefined);
		assert.strictEqual(oSymbol.format(), "");
		assert.deepEqual(oSymbol.parse(), {});
		assert.strictEqual(oSymbol.isNumeric(), false);

		// code under test: with args
		oSymbol = DateFormat._createPatternSymbol({
			name: "~name",
			format: "~format",
			parse: "~parse",
			isNumeric: "~isNumeric"
		});

		assert.strictEqual(oSymbol.name, "~name");
		assert.strictEqual(oSymbol.format, "~format");
		assert.deepEqual(oSymbol.parse, "~parse");
		assert.strictEqual(oSymbol.isNumeric(), "~isNumeric");

		// code under test: with args, isNumeric as function
		oSymbol = DateFormat._createPatternSymbol({isNumeric: function () { return "~foo"; }});

		assert.strictEqual(oSymbol.isNumeric(), "~foo");
	});

	//*****************************************************************************************************************
["y", "Y", "d", "u", "H", "k", "K", "h", "m", "s", "S"].forEach(function (sSymbol) {
	QUnit.test("Pattern Symbol '" + sSymbol + "' #isNumeric=true", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance(),
			oSymbol = oFormat.oSymbols[sSymbol];

		// code under test
		assert.strictEqual(oSymbol.isNumeric(/*not relevant*/), true);
	});
});

	//*****************************************************************************************************************
["", "G", "W", "D", "F", "E", "c", "a", "B", "z", "Z", "X", "V"].forEach(function (sSymbol) {
	QUnit.test("Pattern Symbol '" + sSymbol + "' #isNumeric=false", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance(),
			oSymbol = oFormat.oSymbols[sSymbol];

		// code under test
		assert.strictEqual(oSymbol.isNumeric(/*not relevant*/), false);
	});
});

	//*****************************************************************************************************************
["M", "L", "w", "Q", "q"].forEach(function (sSymbol) {
	QUnit.test("Pattern Symbol '" + sSymbol + "' #isNumeric, depends on symbol repetitions", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance(),
			oSymbol = oFormat.oSymbols[sSymbol];

		// code under test
		assert.strictEqual(oSymbol.isNumeric(1), true);
		assert.strictEqual(oSymbol.isNumeric(2), true);
		assert.strictEqual(oSymbol.isNumeric(3), false);
		assert.strictEqual(oSymbol.isNumeric(4), false);
		assert.strictEqual(oSymbol.isNumeric(5), false);
	});
});

	//*****************************************************************************************************************
[{
	pattern: "dd",
	input: "11",
	expected: [{symbol: "d", subValue: "11", exactLength: false}],
	dateParts: [1970, 0, 11]
}, {
	pattern: "ddMM",
	input: "1102",
	expected: [{symbol: "d", subValue: "1102", exactLength: true}, {symbol: "M", subValue: "02", exactLength: true}],
	dateParts: [1970, 1, 11]
}, {
	pattern: "dd-MM",
	input: "11-02",
	expected: [
		{symbol: "d", subValue: "11-02", exactLength: false},
		{symbol: "", subValue: "-02", exactLength: false},
		{symbol: "M", subValue: "02", exactLength: false}
	],
	dateParts: [1970, 1, 11]
}, {
	pattern: "-ddMM",
	input: "-1102",
	expected: [
		{symbol: "", subValue: "-1102", exactLength: false},
		{symbol: "d", subValue: "1102", exactLength: true},
		{symbol: "M", subValue: "02", exactLength: true}
	],
	dateParts: [1970, 1, 11]
}, {
	pattern: "ddMM-",
	input: "1102-",
	expected: [
		{symbol: "d", subValue: "1102-", exactLength: true},
		{symbol: "M", subValue: "02-", exactLength: true},
		{symbol: "", subValue: "-", exactLength: false}
	],
	dateParts: [1970, 1, 11]
}].forEach(function (oFixture) {
	QUnit.test("_parse: determine exactLength for parse config; pattern: " + oFixture.pattern, function (assert) {
		var // create UI5Date instance within the test to consider the time zone defined in beforeEach
			oDate = UI5Date.getInstance.apply(null, oFixture.dateParts),
			mExpectedParts = {
				"": {type: "text", value: "-"},
				"d": {type: "day", symbol: "d", digits: 2},
				"M": {type: "month", symbol: "M", digits: 2}
			},
			oFormat = DateFormat.getDateTimeInstance({pattern: oFixture.pattern}),
			that = this;

		oFixture.expected.forEach(function (oExpected) {
			that.mock(oFormat.oSymbols[oExpected.symbol])
				.expects("parse")
				.withExactArgs(oExpected.subValue,
					mExpectedParts[oExpected.symbol],
					sinon.match.same(oFormat),
					sinon.match.object.and(sinon.match.has("exactLength", oExpected.exactLength)),
					"Europe/Berlin")
				.callThrough();
		});

		// code under test
		assert.deepEqual(oFormat.parse(oFixture.input), oDate);
	});
});

	//*****************************************************************************************************************
	// note: the last pattern symbol is responsible for a failing 'exactLength' check
[
	{pattern: "MMdd", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "ddMM", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "MMyyyy", inputWithExactLength: "052001", inputWithoutExactLength: "0501"},
	{pattern: "MMy", inputWithExactLength: "052001", inputWithoutExactLength: "0501"},
	{pattern: "MMyy", inputWithExactLength: "0501", inputWithoutExactLength: "052001"},
	{pattern: "MMYYYY", inputWithExactLength: "052001", inputWithoutExactLength: "0501"},
	{pattern: "MMY", inputWithExactLength: "052001", inputWithoutExactLength: "0501"},
	{pattern: "MMYY", inputWithExactLength: "0501", inputWithoutExactLength: "052001"},
	{pattern: "mmHH", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "mmhh", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "mmKK", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "mmkk", inputWithExactLength: "1105", inputWithoutExactLength: "115"}
].forEach(function (oFixture) {
	var sTitle = "Parsing w/o delimiters requires exact length for required parts; pattern: " + oFixture.pattern;

	QUnit.test(sTitle, function (assert) {
		var oDate,
			oFormat = DateFormat.getDateTimeInstance({pattern: oFixture.pattern}, new Locale("de"));

		// code under test: input with exact length is parsable
		oDate = oFormat.parse(oFixture.inputWithExactLength);
		assert.strictEqual(oFormat.format(oDate), oFixture.inputWithExactLength);

		// code under test: input without exact length is not parsable
		assert.strictEqual(oFormat.parse(oFixture.inputWithoutExactLength), null);
	});
});

	//*****************************************************************************************************************
[
	{pattern: "ddLL", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "yyqq", inputWithExactLength: "2203", inputWithoutExactLength: "223"},
	{pattern: "yyQQ", inputWithExactLength: "2203", inputWithoutExactLength: "223"},
	{pattern: "yyww", inputWithExactLength: "2203", inputWithoutExactLength: "223"},
	{pattern: "HHmm", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "mmss", inputWithExactLength: "1105", inputWithoutExactLength: "115"},
	{pattern: "ssSS", inputWithExactLength: "1150", inputWithoutExactLength: "115"}
].forEach(function (oFixture) {
	var sTitle = "Parsing w/o delimiters does not require exact length for not required parts; pattern: "
			+ oFixture.pattern;

	QUnit.test(sTitle, function (assert) {
		var oDate,
			oFormat = DateFormat.getDateTimeInstance({pattern: oFixture.pattern}, new Locale("de"));

		// code under test: input with exact length is parsable
		oDate = oFormat.parse(oFixture.inputWithExactLength);
		assert.strictEqual(oFormat.format(oDate), oFixture.inputWithExactLength);

		// code under test: input without exact length is parsable and will be formatted into the exact length
		oDate = oFormat.parse(oFixture.inputWithoutExactLength);
		assert.strictEqual(oFormat.format(oDate), oFixture.inputWithExactLength);
	});
});

	//*****************************************************************************************************************
	// note: unlike the other symbols, 'u' does not yet support formatting with 0 pad
	QUnit.test("Parsing w/o delimiters does not require exact length for not required parts; symbol 'u' (special case)",
			function (assert) {
		var oDate,
			oFormat = DateFormat.getDateTimeInstance({pattern: "y wwuu"}, new Locale("de"));

		// code under test
		oDate = oFormat.parse("2022 0105");
		assert.strictEqual(oFormat.format(oDate), "2022 015");

		// code under test
		oDate = oFormat.parse("2022 015");
		assert.strictEqual(oFormat.format(oDate), "2022 015");
	});

	//*****************************************************************************************************************
	QUnit.test("createInstance: creates interval pattern with custom delimiter", function (assert) {
		var oFormat,
			oInfo = {oDefaultFormatOptions: {}, aFallbackFormatOptions: []},
			oLocale = new Locale("de");

		// code under test: format option 'format'
		oFormat = DateFormat.createInstance({interval: true, intervalDelimiter: "_", format: "yM"}, oLocale, oInfo);

		assert.strictEqual(oFormat.intervalPatterns[0], "M/y'_'M/y");

		// code under test: format option 'pattern'
		oFormat = DateFormat.createInstance({interval: true, intervalDelimiter: "_", pattern: "foo"}, oLocale, oInfo);

		assert.strictEqual(oFormat.intervalPatterns[0], "foo'_'foo");
	});

	//*****************************************************************************************************************
[
	{instanceFunction: "getDateInstance", defaults: DateFormat.oDateInfo},
	{instanceFunction: "getDateTimeInstance", defaults: DateFormat.oDateTimeInfo},
	{instanceFunction: "getTimeInstance", defaults: DateFormat.oTimeInfo}
].forEach(function (oFixture) {
	QUnit.test(oFixture.instanceFunction + ": Forward oFormatOptions and oLocale to createInstance", function (assert) {
		this.mock(DateFormat).expects("createInstance")
			.withExactArgs("~formatOptions", "~locale", sinon.match.same(oFixture.defaults))
			.returns("~newInstance");

		// code under test
		assert.strictEqual(DateFormat[oFixture.instanceFunction]("~formatOptions", "~locale"), "~newInstance");
	});
});

	//*****************************************************************************************************************
[{
	instanceFunction: "getDateInstance",
	formattedInterval: "01.01.20 & 31.12.22",
	fallbackInterval: "01.01.20 - 31.12.22",
	singleValue: "01.01.20",
	fromDate: [2020, 0, 1],
	toDate: [2022, 11, 31]
}, {
	instanceFunction: "getDateTimeInstance",
	formattedInterval: "01.01.20, 09:15 & 31.12.22, 11:45",
	fallbackInterval: "01.01.20, 09:15 - 31.12.22, 11:45",
	singleValue: "01.01.20, 09:15",
	fromDate: [2020, 0, 1, 9, 15],
	toDate: [2022, 11, 31, 11, 45]
}, {
	instanceFunction: "getTimeInstance",
	formattedInterval: "09:15 & 11:45",
	fallbackInterval: "09:15 - 11:45",
	singleValue: "09:15",
	fromDate: [1970, 0, 1, 9, 15],
	toDate: [1970, 0, 1, 11, 45]
}].forEach(function (oFixture) {
	QUnit.test(oFixture.instanceFunction + ": format/parse with intervalDelimiter", function (assert) {
		var oDate0 = UI5Date.getInstance.apply(null, oFixture.fromDate),
			oDate1 = UI5Date.getInstance.apply(null, oFixture.toDate),
			oFormatOptions = {interval: true, intervalDelimiter: " & ", style: "short"},
			oLocale = new Locale("de"),
			oFormat = DateFormat[oFixture.instanceFunction](oFormatOptions, oLocale);

		// code under test: format
		assert.strictEqual(oFormat.format([oDate0, oDate1]), oFixture.formattedInterval);

		// code under test: parse with configured delimiter
		assert.deepEqual(oFormat.parse(oFixture.formattedInterval), [oDate0, oDate1]);

		// code under test: parse with fallback delimiter
		assert.deepEqual(oFormat.parse(oFixture.fallbackInterval), [oDate0, oDate1]);

		// ****************
		// single intervals

		// code under test: format + parse
		assert.strictEqual(oFormat.format([oDate0, oDate0]), oFixture.singleValue);
		assert.deepEqual(oFormat.parse(oFixture.singleValue), [oDate0, oDate0]);

		oFormatOptions.singleIntervalValue = true;
		oFormat = DateFormat[oFixture.instanceFunction](oFormatOptions, oLocale);

		// code under test: format + parse (singleIntervalValue=true)
		assert.strictEqual(oFormat.format([oDate0, null]), oFixture.singleValue);
		assert.deepEqual(oFormat.parse(oFixture.singleValue), [oDate0, null]);
	});
});

	//*****************************************************************************************************************
	QUnit.test("getDateTimeInstance: format single interval (no diff in output format)", function (assert) {
		var oFormat,
			oDate0 = UI5Date.getInstance(2008, 0, 10, 9 , 15),
			oDate1 = UI5Date.getInstance(2008, 0, 10, 11, 45),
			oLocale = new Locale("en");

		// code under test: createInstance with format
		oFormat = DateFormat.getDateTimeInstance({interval: true, format: "yMMM"}, oLocale);
		assert.strictEqual(oFormat.format([oDate0, oDate1]), "Jan 2008");

		// code under test: createInstance with format
		oFormat = DateFormat.getDateTimeInstance({interval: true, format: "yMMM", intervalDelimiter: "..."}, oLocale);
		assert.strictEqual(oFormat.format([oDate0, oDate1]), "Jan 2008");
	});

	//*****************************************************************************************************************
	QUnit.test("getDateTimeInstance: format interval (with diff in output format)", function (assert) {
		var oFormat,
			oDate0 = UI5Date.getInstance(2008, 0, 10, 9 , 15),
			oDate1 = UI5Date.getInstance(2008, 0, 10, 11, 45),
			oLocale = new Locale("en");

		// code under test: createInstance with format
		oFormat = DateFormat.getDateTimeInstance({interval: true, format: "yMMMdhm"}, oLocale);
		assert.strictEqual(oFormat.format([oDate0, oDate1]), "Jan 10, 2008, 9:15\u2009\u2013\u200911:45\u202fAM");

		// code under test: createInstance with format
		oFormat = DateFormat.getDateTimeInstance({interval: true, format: "yMMMdhm", intervalDelimiter: "..."},
			oLocale);
		assert.strictEqual(oFormat.format([oDate0, oDate1]), "Jan 10, 2008, 9:15\u202fAM...Jan 10, 2008, 11:45\u202fAM");
	});

	//*****************************************************************************************************************
	QUnit.test("FormatOption 'intervalDelimiter': delimiter is handled as escaped literal text", function (assert) {
		var oDate20 = UI5Date.getInstance(2020, 0, 1),
			oDate22 = UI5Date.getInstance(2022, 0, 1),
			oFormat = DateFormat.getDateInstance({interval: true, intervalDelimiter: " B'ar' ", pattern: "y"});

		assert.strictEqual(oFormat.intervalPatterns[0], "y' B''ar'' 'y");
		assert.strictEqual(oFormat.format([oDate20, oDate22]), "2020 B'ar' 2022");
		assert.deepEqual(oFormat.parse("2020 B'ar' 2022"), [oDate20, oDate22]);
	});

	//*****************************************************************************************************************
	QUnit.test("_useCustomIntervalDelimiter: no intervalDelimiter", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance({}, new Locale("en"));

		this.mock(oFormat.oLocaleData).expects("_parseSkeletonFormat").never();

		// code under test
		assert.strictEqual(oFormat._useCustomIntervalDelimiter({}), false);
	});

	//*****************************************************************************************************************
	QUnit.test("_useCustomIntervalDelimiter: with intervalDelimiter, use pattern", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance({intervalDelimiter: "&", pattern: "foo"}, new Locale("en"));

		this.mock(oFormat.oLocaleData).expects("_parseSkeletonFormat").never();

		// code under test
		assert.strictEqual(oFormat._useCustomIntervalDelimiter({}), true);
	});

	//*****************************************************************************************************************
	QUnit.test("_useCustomIntervalDelimiter: with intervalDelimiter, use format", function (assert) {
		var oFormat = DateFormat.getDateTimeInstance({intervalDelimiter: "&", format: "yM"}, new Locale("en")),
			oLocaleDataMock = this.mock(oFormat.oLocaleData),
			aTokens = [{group: "~group0"}, {group: "~group1"}];

		oLocaleDataMock.expects("_parseSkeletonFormat").withExactArgs("yM").returns(aTokens);

		// code under test
		assert.strictEqual(oFormat._useCustomIntervalDelimiter({"~group1": true}), true);

		oLocaleDataMock.expects("_parseSkeletonFormat").withExactArgs("yM").returns(aTokens);

		// code under test
		assert.strictEqual(oFormat._useCustomIntervalDelimiter({"~group2": true}), false);
	});

	//*****************************************************************************************************************
[
	{method: "getDateInstance", result: "date.placeholder Dec 31, 2012"},
	{method: "getDateTimeInstance", result: "date.placeholder Dec 31, 2012, 11:59:58\u202fPM"},
	{method: "getTimeInstance", result: "date.placeholder 11:59:58\u202fPM"},
	{
		method: "getDateTimeWithTimezoneInstance",
		result: "date.placeholder Dec 31, 2012, 11:59:58\u202fPM Europe, Berlin"
	}
].forEach(function (oFixture) {
	QUnit.test("getPlaceholderText: " + oFixture.method, function (assert) {
		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(DateFormat[oFixture.method]().getPlaceholderText(), oFixture.result);
		});
	});
});

	//*****************************************************************************************************************
[
	{method: "getDateInstance", result: "date.placeholder Dec 22, 2012\u2009\u2013\u2009Dec 31, 2012"},
	{
		method: "getDateTimeInstance",
		result: "date.placeholder Dec 22, 2012, 9:12:34\u202fAM\u2009\u2013\u2009Dec 31, 2012, 11:59:58\u202fPM"
	},
	{method: "getTimeInstance", result: "date.placeholder 9:12:34\u202fAM\u2009\u2013\u200911:59:58\u202fPM"}
].forEach(function (oFixture) {
	QUnit.test("getPlaceholderText, with interval: " + oFixture.method, function (assert) {
		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(DateFormat[oFixture.method]({interval: true}).getPlaceholderText(), oFixture.result);
		});
	});
});

	//*****************************************************************************************************************
[
	{type: CalendarType.Gregorian, result: "date.placeholder Dec 31, 2012"},
	{type: CalendarType.Buddhist, result: "date.placeholder Dec 31, 2555 BE"},
	{type: CalendarType.Japanese, result: "date.placeholder Dec 31, 24 Heisei"},
	{type: CalendarType.Islamic, result: "date.placeholder Saf. 17, 1434 AH"},
	{type: CalendarType.Persian, result: "date.placeholder Dey 11, 1391 AP"}
].forEach(function (oFixture) {
	QUnit.test("getPlaceholderText: different calendar types: " + oFixture.type, function (assert) {
		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(
				DateFormat.getDateInstance({calendarType: oFixture.type}).getPlaceholderText(),
				oFixture.result);
		});
	});
});

	//*****************************************************************************************************************
["getDateInstance", "getDateTimeInstance", "getTimeInstance"].forEach(function (sMethod) {
	[false, true].forEach(function (bUTC) {
	QUnit.test("getSampleValue single date, " + sMethod + "; UTC=" + bUTC, function (assert) {
		var sExpectedDate = "2012-12-31T23:59:58.123" + (bUTC ? "Z" : "");

		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		// code under test
		assert.deepEqual(
			DateFormat[sMethod]({UTC: bUTC}).getSampleValue(),
			[UI5Date.getInstance(sExpectedDate)]);
	});

	QUnit.test("getSampleValue date interval, " + sMethod + "; UTC=" + bUTC, function (assert) {
		var sExpectedEndDate = "2012-12-31T23:59:58.123" + (bUTC ? "Z" : ""),
			sExpectedStartDate = "2012-12-22T09:12:34.567" + (bUTC ? "Z" : "");

		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		// code under test
		assert.deepEqual(
			DateFormat[sMethod]({interval: true, UTC: bUTC}).getSampleValue(),
			[[UI5Date.getInstance(sExpectedStartDate), UI5Date.getInstance(sExpectedEndDate)]]);
	});
	});
});

	//*****************************************************************************************************************
	QUnit.test("getSampleValue DateTimeWithTimezone", function (assert) {
		this.stub(UI5Date, "getInstance").onFirstCall().returns({getFullYear: function () {return 2012;}})
			.callThrough(); // only stub first call of UI5Date.getInstance to fake current year

		// code under test
		assert.deepEqual(
			DateFormat.getDateTimeWithTimezoneInstance().getSampleValue(),
			[UI5Date.getInstance("2012-12-31T23:59:58.123"), "Europe/Berlin"]);
	});

	//*****************************************************************************************************************
	// BCP 002075129400005085862023
	QUnit.test("DateTime parse, format options style=long, UTC=true, locale=zh_CN", function (assert) {
		var oParsedDate,
			oDate = UI5Date.getInstance("2021-10-13T02:22:33Z"),
			oFormat = DateFormat.getDateTimeInstance({style : "long", UTC : true}, new Locale("zh_CN"));

		// code under test
		oParsedDate = oFormat.parse(oFormat.format(oDate));

		assert.deepEqual(oParsedDate, oDate);
	});

	//*****************************************************************************************************************
	QUnit.test("parse: normalize input and pattern values (integrative test)", function (assert) {
		const oDate0 = UI5Date.getInstance("1970-01-01T02:22:33Z");
		const oLocale = new Locale("en_US");
		let oFormat = DateFormat.getDateTimeInstance({pattern: "h:mm:ss\u202fa", UTC: true}, oLocale);

		// code under test - formatted string can be parsed again
		assert.deepEqual(oFormat.parse(oFormat.format(oDate0)), oDate0);

		// code under test - input without special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33 AM"), oDate0);

		const oFormatOptions = {interval: true, pattern: "h:mm:ss\u202fa", UTC: true};
		oFormat = DateFormat.getDateTimeInstance(oFormatOptions, oLocale);

		// code under test - default interval pattern uses " - " as delimiter
		assert.strictEqual(oFormat.intervalPatterns[oFormat.intervalPatterns.length - 1],
			"h:mm:ss\u202fa - h:mm:ss\u202fa");

		const oDate1 = UI5Date.getInstance("1970-01-01T15:16:17Z");

		// code under test - formatted string can be parsed again
		assert.deepEqual(oFormat.parse(oFormat.format([oDate0, oDate1])), [oDate0, oDate1]);

		// code under test - input with special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33\u202fAM\u2009\u2013\u200903:16:17\u202fPM"), [oDate0, oDate1]);

		// code under test - input without special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33 AM - 03:16:17 PM"), [oDate0, oDate1]);
		// code under test - input without spaces can be parsed
		assert.deepEqual(oFormat.parse("02:22:33AM-03:16:17PM"), [oDate0, oDate1]);

		oFormat = DateFormat.getDateTimeInstance(oFormatOptions, new Locale("es_AR"));

		// code under test - default interval pattern uses " - " as delimiter
		assert.strictEqual(oFormat.intervalPatterns[oFormat.intervalPatterns.length - 1],
			"h:mm:ss\u202fa - h:mm:ss\u202fa");

		// code under test - formatted string can be parsed again
		assert.deepEqual(oFormat.parse(oFormat.format([oDate0, oDate1])), [oDate0, oDate1]);

		// code under test - input with special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33\u202fa.\u00a0m. a el 03:16:17\u202fp.\u00a0m."), [oDate0, oDate1]);

		// code under test - input without special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33a.m. - 03:16:17p.m."), [oDate0, oDate1]);

		oFormat = DateFormat.getDateTimeInstance(oFormatOptions, new Locale("fa"));

		// code under test - default interval pattern uses " - " as delimiter
		assert.strictEqual(oFormat.intervalPatterns[oFormat.intervalPatterns.length - 1],
			"h:mm:ss\u202fa - h:mm:ss\u202fa");

		// code under test - formatted string can be parsed again
		assert.deepEqual(oFormat.parse(oFormat.format([oDate0, oDate1])), [oDate0, oDate1]);

		// code under test - input with special characters can be parsed
		assert.deepEqual(oFormat.parse("2:22:33\u202f\u0642.\u0638. \u062a\u0627 3:16:17\u202f\u0628\.\u0638\."),
			[oDate0, oDate1]);

		// code under test - input without special characters can be parsed
		assert.deepEqual(oFormat.parse("02:22:33\u202f\u0642.\u0638.-03:16:17\u202f\u0628\.\u0638\."),
			[oDate0, oDate1]);
	});

	//*****************************************************************************************************************
	QUnit.test("DateFormat#oSymbols[''].parse: normalizes part value", function (assert) {
		const oPart = {value: "~partValue"};

		this.mock(FormatUtils).expects("normalize").withExactArgs("~partValue").returns("~sNormalized");

		// code under test
		assert.deepEqual(DateFormat.prototype.oSymbols[""].parse("~sNormalizedValue", oPart),
			{length: 12});
	});

	//*****************************************************************************************************************
	QUnit.test("DateFormat#oSymbols['a'].parse: normalizes variants", function (assert) {
		const oFormat = {
			aDayPeriodsWide: ["~wide0"],
			aDayPeriodsAbbrev: ["~abbrev0", "~abbrev1"],
			aDayPeriodsNarrow: ["~narrow0", "~narrow1"],
			oLocaleData: {sCLDRLocaleId: "en-US"}
		};
		const oDateFormatMock = this.mock(FormatUtils);
		oDateFormatMock.expects("normalize").withExactArgs("~wide0").returns("~sNormalizedWide0");
		oDateFormatMock.expects("normalize").withExactArgs("~abbrev0").returns("~sNormalizedAbbrev0");
		oDateFormatMock.expects("normalize").withExactArgs("~abbrev1").returns("~sDayPeriod");

		// code under test
		assert.deepEqual(
			DateFormat.prototype.oSymbols["a"].parse("~sDayPeriodValue", /*unused*/undefined, oFormat),
			{pm: true, length: 11});
	});

	//*****************************************************************************************************************
	QUnit.test("DateFormat#parse: normalizes user input", function (assert) {
		const oFormat = {
			oFormatOptions: {},
			parseRelative() {}
		};
		this.mock(FormatUtils).expects("normalize").withExactArgs("~value").returns("~normalizedValue");
		this.mock(Localization).expects("getTimezone").exactly(3).withExactArgs().returns("~timezone");
		this.mock(oFormat).expects("parseRelative").withExactArgs("~normalizedValue", undefined)
			.returns("~dateObject");

		// code under test
		assert.strictEqual(DateFormat.prototype.parse.call(oFormat, "~value"), "~dateObject");
	});

	//*****************************************************************************************************************
	// BCP: 2380137559
	QUnit.test("DateFormat: alternative month abbreviations (integrative test)", function (assert) {
		Localization.setLanguage("en_GB");
		const oDateFormat = DateFormat.getDateInstance();
		const oDate = UI5Date.getInstance(2023, 8, 15);

		// code under test - format based on current CLDR version
		assert.strictEqual(oDateFormat.format(oDate), "15 Sept 2023");

		// code under test - parse abreviated month based on current CLDR version (43.0)
		assert.strictEqual(oDateFormat.parse("15 Sept 2023").getTime(), oDate.getTime());

		// code under test - parsing abreviated month based on older CLDR version (41.0) still possible
		assert.strictEqual(oDateFormat.parse("15 Sep 2023").getTime(), oDate.getTime());
	});

	//*****************************************************************************************************************
	QUnit.test("DateFormat#init", function (assert) {
		const oLocalData = {
			_getMonthsWithAlternatives() {},
			_getMonthsStandAloneWithAlternatives() {},
			getDayPeriods() {},
			getDays() {},
			getDaysStandAlone() {},
			getEras() {},
			getFlexibleDayPeriods() {},
			getFlexibleDayPeriodsStandAlone() {},
			getMonths() {},
			getMonthsStandAlone() {},
			getQuarters() {},
			getQuartersStandAlone() {}
		};
		const oDateFormat = {
			oFormatOptions: {calendarType: "~calendarType", pattern: "~pattern"},
			oLocaleData: oLocalData,
			getAllowedCharacters() {},
			parseCldrDatePattern() {}
		};
		const oLocalDataMock = this.mock(oLocalData);
		oLocalDataMock.expects("_getMonthsWithAlternatives").withExactArgs("abbreviated", "~calendarType")
			.returns("~aMonthsAbbrev");
		oLocalDataMock.expects("getMonths").withExactArgs("wide", "~calendarType").returns("~aMonthsWide");
		oLocalDataMock.expects("getMonths").withExactArgs("narrow", "~calendarType").returns("~aMonthsNarrow");
		oLocalDataMock.expects("_getMonthsStandAloneWithAlternatives").withExactArgs("abbreviated", "~calendarType")
			.returns("~aMonthsAbbrevSt");
		oLocalDataMock.expects("getMonthsStandAlone").withExactArgs("wide", "~calendarType").returns("~aMonthsWideSt");
		oLocalDataMock.expects("getMonthsStandAlone").withExactArgs("narrow", "~calendarType")
			.returns("~aMonthsNarrowSt");
		oLocalDataMock.expects("getDays").withExactArgs("abbreviated", "~calendarType").returns("~aDaysAbbrev");
		oLocalDataMock.expects("getDays").withExactArgs("wide", "~calendarType").returns("~aDaysWide");
		oLocalDataMock.expects("getDays").withExactArgs("narrow", "~calendarType").returns("~aDaysNarrow");
		oLocalDataMock.expects("getDays").withExactArgs("short", "~calendarType").returns("~aDaysShort");
		oLocalDataMock.expects("getDaysStandAlone").withExactArgs("abbreviated", "~calendarType")
			.returns("~aDaysAbbrevSt");
		oLocalDataMock.expects("getDaysStandAlone").withExactArgs("wide", "~calendarType").returns("~aDaysWideSt");
		oLocalDataMock.expects("getDaysStandAlone").withExactArgs("narrow", "~calendarType").returns("~aDaysNarrowSt");
		oLocalDataMock.expects("getDaysStandAlone").withExactArgs("short", "~calendarType").returns("~aDaysShortSt");
		oLocalDataMock.expects("getQuarters").withExactArgs("abbreviated", "~calendarType").returns("~aQuartersAbbrev");
		oLocalDataMock.expects("getQuarters").withExactArgs("wide", "~calendarType").returns("~aQuartersWide");
		oLocalDataMock.expects("getQuarters").withExactArgs("narrow", "~calendarType").returns("~aQuartersNarrow");
		oLocalDataMock.expects("getQuartersStandAlone").withExactArgs("abbreviated", "~calendarType")
			.returns("~aQuartersAbbrevSt");
		oLocalDataMock.expects("getQuartersStandAlone").withExactArgs("wide", "~calendarType")
			.returns("~aQuartersWideSt");
		oLocalDataMock.expects("getQuartersStandAlone").withExactArgs("narrow", "~calendarType")
			.returns("~aQuartersNarrowSt");
		oLocalDataMock.expects("getEras").withExactArgs("abbreviated", "~calendarType").returns("~aErasAbbrev");
		oLocalDataMock.expects("getEras").withExactArgs("wide", "~calendarType").returns("~aErasWide");
		oLocalDataMock.expects("getEras").withExactArgs("narrow", "~calendarType").returns("~aErasNarrow");
		oLocalDataMock.expects("getDayPeriods").withExactArgs("abbreviated", "~calendarType")
			.returns("~aDayPeriodsAbbrev");
		oLocalDataMock.expects("getDayPeriods").withExactArgs("wide", "~calendarType").returns("~aDayPeriodsWide");
		oLocalDataMock.expects("getDayPeriods").withExactArgs("narrow", "~calendarType").returns("~aDayPeriodsNarrow");
		oLocalDataMock.expects("getFlexibleDayPeriods").withExactArgs("abbreviated", "~calendarType")
			.returns("~oFlexibleDayPeriodsAbbrev");
		oLocalDataMock.expects("getFlexibleDayPeriods").withExactArgs("wide", "~calendarType")
			.returns("~oFlexibleDayPeriodsWide");
		oLocalDataMock.expects("getFlexibleDayPeriods").withExactArgs("narrow", "~calendarType")
			.returns("~oFlexibleDayPeriodsNarrow");
		oLocalDataMock.expects("getFlexibleDayPeriodsStandAlone").withExactArgs("abbreviated", "~calendarType")
			.returns("~oFlexibleDayPeriodsAbbrevSt");
		oLocalDataMock.expects("getFlexibleDayPeriodsStandAlone").withExactArgs("wide", "~calendarType")
			.returns("~oFlexibleDayPeriodsWideSt");
		oLocalDataMock.expects("getFlexibleDayPeriodsStandAlone").withExactArgs("narrow", "~calendarType")
			.returns("~oFlexibleDayPeriodsNarrowSt");
		this.mock(oDateFormat).expects("parseCldrDatePattern").withExactArgs("~pattern").returns("~aFormatArray");
		this.mock(oDateFormat).expects("getAllowedCharacters").withExactArgs("~aFormatArray")
			.returns("~sAllowedCharacters");

		// code under test
		DateFormat.prototype.init.call(oDateFormat);

		assert.strictEqual(oDateFormat.aMonthsAbbrev, "~aMonthsAbbrev");
		assert.strictEqual(oDateFormat.aMonthsWide, "~aMonthsWide");
		assert.strictEqual(oDateFormat.aMonthsNarrow, "~aMonthsNarrow");
		assert.strictEqual(oDateFormat.aMonthsAbbrevSt, "~aMonthsAbbrevSt");
		assert.strictEqual(oDateFormat.aMonthsWideSt, "~aMonthsWideSt");
		assert.strictEqual(oDateFormat.aMonthsNarrowSt, "~aMonthsNarrowSt");
		assert.strictEqual(oDateFormat.aDaysAbbrev, "~aDaysAbbrev");
		assert.strictEqual(oDateFormat.aDaysWide, "~aDaysWide");
		assert.strictEqual(oDateFormat.aDaysNarrow, "~aDaysNarrow");
		assert.strictEqual(oDateFormat.aDaysShort, "~aDaysShort");
		assert.strictEqual(oDateFormat.aDaysAbbrevSt, "~aDaysAbbrevSt");
		assert.strictEqual(oDateFormat.aDaysWideSt, "~aDaysWideSt");
		assert.strictEqual(oDateFormat.aDaysNarrowSt, "~aDaysNarrowSt");
		assert.strictEqual(oDateFormat.aDaysShortSt, "~aDaysShortSt");
		assert.strictEqual(oDateFormat.aQuartersAbbrev, "~aQuartersAbbrev");
		assert.strictEqual(oDateFormat.aQuartersWide, "~aQuartersWide");
		assert.strictEqual(oDateFormat.aQuartersNarrow, "~aQuartersNarrow");
		assert.strictEqual(oDateFormat.aQuartersAbbrevSt, "~aQuartersAbbrevSt");
		assert.strictEqual(oDateFormat.aQuartersWideSt, "~aQuartersWideSt");
		assert.strictEqual(oDateFormat.aQuartersNarrowSt, "~aQuartersNarrowSt");
		assert.strictEqual(oDateFormat.aErasNarrow, "~aErasNarrow");
		assert.strictEqual(oDateFormat.aErasAbbrev, "~aErasAbbrev");
		assert.strictEqual(oDateFormat.aErasWide, "~aErasWide");
		assert.strictEqual(oDateFormat.aDayPeriodsAbbrev, "~aDayPeriodsAbbrev");
		assert.strictEqual(oDateFormat.aDayPeriodsNarrow, "~aDayPeriodsNarrow");
		assert.strictEqual(oDateFormat.aDayPeriodsWide, "~aDayPeriodsWide");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsAbbrev, "~oFlexibleDayPeriodsAbbrev");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsNarrow, "~oFlexibleDayPeriodsNarrow");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsWide, "~oFlexibleDayPeriodsWide");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsAbbrevSt, "~oFlexibleDayPeriodsAbbrevSt");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsNarrowSt, "~oFlexibleDayPeriodsNarrowSt");
		assert.strictEqual(oDateFormat.oFlexibleDayPeriodsWideSt, "~oFlexibleDayPeriodsWideSt");
		assert.strictEqual(oDateFormat.aFormatArray, "~aFormatArray");
		assert.strictEqual(oDateFormat.sAllowedCharacters, "~sAllowedCharacters");
	});

	//*****************************************************************************************************************
	QUnit.test("DateFormat#findEntry", function (assert) {
		const oParseHelperMock = this.mock(DateFormat._oParseHelper);
		oParseHelperMock.expects("startsWithIgnoreCase").never();

		// code under test
		assert.deepEqual(DateFormat._oParseHelper.findEntry("foo", [], "~sLocale"), {index: -1, length: 0});

		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "f", "~sLocale").returns(true);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "foo", "~sLocale").returns(true);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "FooBar", "~sLocale").returns(false);

		// code under test
		assert.deepEqual(
			DateFormat._oParseHelper.findEntry("~value", ["f", "foo", "fo", "FooBar", "baz"], "~sLocale"),
			{index: 1, length: 3});

		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "a", "~sLocale").returns(false);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "f", "~sLocale").returns(true);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "alt1", "~sLocale").returns(false);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "alt2", "~sLocale").returns(true);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "alt99", "~sLocale").returns(true);
		oParseHelperMock.expects("startsWithIgnoreCase").withExactArgs("~value", "FooBar", "~sLocale").returns(false);

		// code under test
		assert.deepEqual(
			DateFormat._oParseHelper.findEntry("~value", ["a", "f", "x", ["alt1", "alt2", "alt3", "alt99"], "FooBar"],
				"~sLocale"),
			{index: 3, length: 5});
	});

	//*****************************************************************************************************************
	QUnit.test("oSymbols.M#format: abbreviations contains array", function (assert) {
		const oField = {digits: 3};
		const oFormat = {aMonthsAbbrev: ["foo", "bar", ["baz", "qux"]]};
		// code under test
		assert.strictEqual(
			DateFormat.prototype.oSymbols.M.format(oField, new Date(Date.UTC(2023, 1, 1)), undefined, oFormat),
			"bar");

		// code under test
		assert.strictEqual(
			DateFormat.prototype.oSymbols.M.format(oField, new Date(Date.UTC(2023, 2, 1)), undefined, oFormat),
			"baz");
	});

	//*****************************************************************************************************************
	QUnit.test("oSymbols.L#format: abbreviations contains array", function (assert) {
		const oField = {digits: 3};
		const oFormat = {aMonthsAbbrevSt: ["foo", "bar", ["baz", "qux"]]};
		// code under test
		assert.strictEqual(
			DateFormat.prototype.oSymbols.L.format(oField, new Date(Date.UTC(2023, 1, 1)), undefined, oFormat),
			"bar");

		// code under test
		assert.strictEqual(
			DateFormat.prototype.oSymbols.L.format(oField, new Date(Date.UTC(2023, 2, 1)), undefined, oFormat),
			"baz");
	});
});
