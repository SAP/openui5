/*global QUnit, sinon */
sap.ui.define([
		"sap/base/util/extend",
		"sap/ui/core/format/DateFormat",
		"sap/ui/core/Locale",
		"sap/ui/core/LocaleData",
		"sap/ui/core/date/UniversalDate",
		"sap/ui/core/library"],
	function (extend, DateFormat, Locale, LocaleData, UniversalDate, library) {
		"use strict";

		// shortcut for sap.ui.core.CalendarType
		var CalendarType = library.CalendarType;

		var getTimezoneStub;
		var stubTimezone = function(sTimezoneID) {
			if (getTimezoneStub) {
				getTimezoneStub.restore();
			}
			if (sTimezoneID) {
				getTimezoneStub = sinon.stub(sap.ui.getCore().getConfiguration(), "getTimezone").returns(sTimezoneID);
			}
		};

		var oDateTime = new Date("Tue Sep 23 06:46:13 2000 GMT+0000"),
			oTZDateTime = new Date("Tue Sep 23 03:46:13 2000 GMT+0530"),
			oDefaultDate = DateFormat.getInstance(),
			oDefaultDateTime = DateFormat.getDateTimeInstance(),
			oDefaultTime = DateFormat.getTimeInstance();

		QUnit.module("DateFormat format", {
			beforeEach: function (assert) {
				stubTimezone("Europe/Berlin");
				var Log = sap.ui.require("sap/base/Log");
				assert.ok(Log, "Log module should be available");
				this.oErrorSpy = sinon.spy(Log, "error");
			},
			afterEach: function () {
				this.oErrorSpy.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("format invalid date", function (assert) {
			var that = this;
			var iInitialCount = 0;
			assert.equal(this.oErrorSpy.callCount, 0, "No error is logged yet");
			[{}, {getTime: function() {}}, new Date("")].forEach(function (oInvalidDate) {
				assert.strictEqual(oDefaultDate.format(oInvalidDate), "", "Formatting an invalid date should return ''");
				iInitialCount++;
				assert.equal(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
				assert.equal(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "The given date instance isn't valid.", "Correct log message");
			});

			// interval with only one value
			assert.strictEqual(DateFormat.getInstance({
				interval: true
			}).format([new Date("")]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.equal(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.equal(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "Interval DateFormat can only format with 2 date instances but 1 is given.", "Correct log message");

			// singleIntervalValue, with first date being null
			assert.deepEqual(DateFormat.getInstance({
				interval: true,
				singleIntervalValue: true
			}).format([null, null]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.equal(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.equal(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "First date instance which is passed to the interval DateFormat shouldn't be null.", "Correct log message");

			// interval with 2 invalid values
			assert.strictEqual(DateFormat.getInstance({
				interval: true
			}).format([new Date(""), null]), "", "Formatting an invalid date should return ''");

			iInitialCount++;
			assert.equal(that.oErrorSpy.callCount, iInitialCount, "Error is logged");
			assert.equal(that.oErrorSpy.getCall(iInitialCount - 1).args[0], "At least one date instance which is passed to the interval DateFormat isn't valid.", "Correct log message");
		});

		QUnit.test("format undefined date", function (assert) {
			var oDate;
			assert.strictEqual(oDefaultDate.format(oDate), "", "Formatting an undefined date should return ''");
		});

		QUnit.test("format default date", function (assert) {
			assert.equal(oDefaultDate.format(oDateTime), "Sep 23, 2000", "default date");
			assert.equal(oDefaultDateTime.format(oDateTime), "Sep 23, 2000, 8:46:13 AM", "default datetime");
			assert.equal(oDefaultTime.format(oDateTime), "8:46:13 AM", "default time");
		});

		QUnit.test("format default date UTC", function (assert) {
			assert.equal(oDefaultDate.format(oTZDateTime, true), "Sep 22, 2000", "default date UTC");
			assert.equal(oDefaultDateTime.format(oTZDateTime, true), "Sep 22, 2000, 10:16:13 PM", "default datetime UTC");
			assert.equal(oDefaultTime.format(oTZDateTime, true), "10:16:13 PM", "default time UTC");
		});

		QUnit.test("format date with given style", function (assert) {
			assert.equal(DateFormat.getDateInstance({ style: "short" }).format(oDateTime), "9/23/00", "short date");
			assert.equal(DateFormat.getDateInstance({ style: "medium" }).format(oDateTime), "Sep 23, 2000", "medium date");
			assert.equal(DateFormat.getDateInstance({ style: "long" }).format(oDateTime), "September 23, 2000", "long date");
			assert.equal(DateFormat.getDateInstance({ style: "full" }).format(oDateTime), "Saturday, September 23, 2000", "full date");
			assert.equal(DateFormat.getDateTimeInstance({ style: "short" }).format(oDateTime), "9/23/00, 8:46 AM", "short datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "medium" }).format(oDateTime), "Sep 23, 2000, 8:46:13 AM", "medium datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "long" }).format(oDateTime), "September 23, 2000 at 8:46:13 AM GMT+02:00", "long datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "full" }).format(oDateTime), "Saturday, September 23, 2000 at 8:46:13 AM GMT+02:00", "full datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "medium/short" }).format(oDateTime), "Sep 23, 2000, 8:46 AM", "medium/short datetime");
			assert.equal(DateFormat.getDateTimeInstance({ style: "long/medium" }).format(oDateTime), "September 23, 2000 at 8:46:13 AM", "long/medium datetime");
			assert.equal(DateFormat.getTimeInstance({ style: "short" }).format(oDateTime), "8:46 AM", "short time");
			assert.equal(DateFormat.getTimeInstance({ style: "medium" }).format(oDateTime), "8:46:13 AM", "medium time");
			assert.equal(DateFormat.getTimeInstance({ style: "long" }).format(oDateTime), "8:46:13 AM GMT+02:00", "long time");
			assert.equal(DateFormat.getTimeInstance({ style: "full" }).format(oDateTime), "8:46:13 AM GMT+02:00", "full time");
		});

		QUnit.test("format date for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.equal(DateFormat.getDateInstance(oLocale).format(oDateTime), "23.09.2000", "date with defaults for given locale");
			assert.equal(DateFormat.getDateTimeInstance(oLocale).format(oDateTime), "23.09.2000, 08:46:13", "datetime with defaults for given locale");
			assert.equal(DateFormat.getTimeInstance(oLocale).format(oDateTime), "08:46:13", "time with defaults for given locale");
		});

		QUnit.test("format date with custom pattern for a specific locale", function (assert) {
			var oLocale = new Locale("de-DE");
			assert.equal(DateFormat.getDateInstance({ pattern: "dd MMM yyyy" }, oLocale).format(oDateTime), "23 Sept. 2000", "date with custom pattern for given locale");
			assert.equal(DateFormat.getDateTimeInstance({ pattern: "dd MMM yyyy hh:mm:ss a" }, oLocale).format(oDateTime), "23 Sept. 2000 08:46:13 AM", "datetime with custom pattern for given locale");
			assert.equal(DateFormat.getTimeInstance({ pattern: "hh:mm:ss a" }, oLocale).format(oDateTime), "08:46:13 AM", "datetime with custom pattern for given locale");
		});

		QUnit.test("Parse out-of-normal-range seconds value to minutes and seconds", function (assert) {
			var sPattern = "mm:ss";
			var sSourcePattern = "ssss";

			var oParseDateFormat = DateFormat.getDateTimeInstance({ pattern: sSourcePattern });
			var sDateString = "1199"; // 1199 seconds equal 19 minutes and 59 seconds

			var oParsed = oParseDateFormat.parse(sDateString);
			assert.ok(oParsed instanceof Date, "should be a date");
			assert.equal(oParsed.getTime(), -2401000, // 31 Dec 1969 23:19:59 _UTC_
				"should parse to correct date");

			var oDateFormat = DateFormat.getDateTimeInstance({ pattern: sPattern });
			var sResult = oDateFormat.format(oParsed);
			assert.equal(sResult, "19:59", "Should return correct value");
		});

		QUnit.module("format relative with timezone America/Los_Angeles", {
			beforeEach: function () {
				stubTimezone("America/Los_Angeles");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("format custom date (UTC-7)", function (assert) {
			var oDate = new Date(Date.UTC(2001, 6, 4, 19, 8, 56)), // Wed Jul 4 12:08:56 2001 (Los Angeles UTC-7)
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
				assert.equal(oCustomDate.format(oDate), oCustomDatePatterns[sCustomPattern], "pattern:" + sCustomPattern + ", date: " + oDate);
			}

			delete Date.prototype.getTimezoneShort;
			delete Date.prototype.getTimezoneLong;
			oTimeZoneOffsetStub.restore();
			oGetTimezoneShortStub.restore();
			oGetTimezoneLongStub.restore();
		});

		QUnit.module("parse using pattern in UTC", {
			beforeEach: function () {
				stubTimezone("Etc/UTC");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("parse using pattern 'SSSSSS' (6 millisecond digits)", function (assert) {
			var sCustomPattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX";
			var oCustomDateFormat = DateFormat.getDateTimeInstance({ pattern: sCustomPattern });
			var sDateString = "2020-12-14T15:29:04.303118Z";
			var oParsed = oCustomDateFormat.parse(sDateString);
			assert.ok(oParsed instanceof Date, "should be a date");
			assert.equal(oParsed.getTime(), 1607959744303, "should match the first 3 millisecond digits of this date");
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

				var oDate = new Date(oFixture.date);
				var sResult = oFormat.format(oDate);

				assert.equal(sResult, oFixture.exactCase, "format matches exact case '" + oFixture.exactCase + "'");
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
				stubTimezone("Asia/Tokyo");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("timezone pattern", function (assert) {
			var oDate = new Date("2001-07-04T12:08:56.235Z");

			var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX" });
			assert.equal(oDateFormat.format(oDate, true), "2001-07-04T12:08:56.235Z", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSX with utc");
			assert.equal(oDateFormat.format(oDate), "2001-07-04T21:08:56.235+09", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSX");

			oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSz" });
			assert.equal(oDateFormat.format(oDate, true), "2001-07-04T12:08:56.235GMTZ", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSz with utc");
			assert.equal(oDateFormat.format(oDate), "2001-07-04T21:08:56.235GMT+09:00", "pattern yyyy-MM-dd'T'HH:mm:ss.SSSz");
		});

		QUnit.module("format with timezone Etc/UTC", {
			beforeEach: function () {
				stubTimezone("Etc/UTC");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("format custom date timezone UTC+0 (GMT)", function (assert) {
			var oDate = new Date(Date.UTC(2018, 9, 9, 13, 37, 56, 235)), // Tue Oct 9 13:37:56 2018 (Etc/UTC)
				oCustomDateFormat, oFormatted;

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
				oFormatted = oCustomDateFormat.format(oDate, false);
				assert.equal(oFormatted, oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(oFormatted, false, true) instanceof Date, "is a Date");
			});
			oTimeZoneOffsetStub.restore();
		});

		QUnit.module("format with timezone Europe/Berlin", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("format custom date timezone UTC+2 (EET)", function (assert) {
			var oDate = new Date("Tue Oct 9 11:37:56 2018 GMT+0000"),
				oCustomDateFormat, oFormatted;
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
				oFormatted = oCustomDateFormat.format(oDate, false);
				assert.equal(oFormatted.toString(), oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(oFormatted, false, true) instanceof Date, "is a Date");
			});
		});

		QUnit.module("format with timezone Asia/Calcutta", {
			beforeEach: function () {
				stubTimezone("Asia/Calcutta");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("format custom date timezone UTC+5:30 (IST)", function (assert) {
			var oDate = new Date(Date.UTC(2018, 9, 9, 8, 7, 56, 235)), //UTC+5.5
				oCustomDateFormat, oFormatted;

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
				oFormatted = oCustomDateFormat.format(oDate, false);
				assert.equal(oFormatted.toString(), oTestData.expected, oTestData.pattern);
				assert.ok(oCustomDateFormat.parse(oFormatted, false, true) instanceof Date, "is a Date");
			});
			oTimeZoneOffsetStub.restore();
		});

		QUnit.module("format relative");


		function getExpectedRelativeDate(iDiff, iTarget, oFormatOptions, sLocale) {
			oFormatOptions = extend({}, oFormatOptions);
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
				var oFormat1 = DateFormat.getDateInstance(extend({ relative: true }, oFormatOptions), new Locale(sLocale)),
					oFormat2 = DateFormat.getDateInstance(oFormatOptions, new Locale(sLocale)),
					oToday = new Date(),
					iToday = oToday.getTime(),
					iTarget, aExpected;

				for (var i = -10; i <= 10; i++) {
					// use Date Object for getting Dates in the past and in the future, to avoid summer/standard timezone change conflicts
					iTarget = new Date(iToday).setDate(oToday.getDate() + i);
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

		QUnit.test("format relative date without modifying the input date object", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				relative: true,
				relativeScale: "auto"
			});
			var oDate = new Date("2020-08-17T21:59:00Z");
			var beforeMs = oDate.getTime();

			oDateFormat.format(oDate);

			assert.equal(beforeMs, oDate.getTime(), "date instance should not be modified, after DateFormat#format call");
		});

		QUnit.module("DateFormat relative date (1st jan 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-01-01T09:59:00Z").getTime()); // Mon Mar 01 2021 10:59:00 GMT+0100
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
				inputDate: "2021-01-29T09:59:00Z", // jan 29th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-01-30T09:59:00Z", // jan 30th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-01-31T09:59:00Z", // jan 31th
				outputRelative: "this month"
			}, {
				inputDate: "2021-02-01T09:59:00Z", // feb 1st
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("relative to '2021-03-22T23:30:00Z'", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(new Date("2021-03-22T23:30:00Z").getTime());
				// 28.03 - 0:30 (GMT+1)
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("format and parse 3:33", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,2,21,3,33));

			var sRelativeUTC = oDateFormat.format(oDate, true);
			assert.equal(sRelativeUTC, "vorgestern");
			var oExpectedUTC = new Date(Date.UTC(2021,2,20,23,30));
			assert.equal(oDateFormat.parse(sRelativeUTC, true).getTime(), oExpectedUTC.getTime());

			var sRelative = oDateFormat.format(oDate);
			assert.equal(sRelative, "vorgestern");
			assert.equal(oDateFormat.parse(sRelative).getTime(), oExpectedUTC.getTime());
		});

		QUnit.test("format and parse 23:33", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,2,21,23,33));

			var sRelativeUTC = oDateFormat.format(oDate, true);
			assert.equal(sRelativeUTC, "vorgestern");
			var oExpectedUTC = new Date(Date.UTC(2021,2,20,23,30));
			assert.equal(oDateFormat.parse(sRelativeUTC, true).getTime(), oExpectedUTC.getTime());

			var sRelative = oDateFormat.format(oDate);
			assert.equal(sRelative, "vor 1 Tag");
			var oExpected = new Date(Date.UTC(2021,2,21,23,30));
			assert.equal(oDateFormat.parse(sRelative).getTime(), oExpected.getTime());
		});

		QUnit.module("relative to '2021-03-22T03:30:00Z'", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(new Date("2021-03-22T03:30:00Z").getTime());
				// 28.03 - 0:30 (GMT+1)
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("3:33", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,2,21,3,33));

			var sRelativeUTC = oDateFormat.format(oDate, true);
			assert.equal(sRelativeUTC, "vor 1 Tag");
			var oExpectedUTC = new Date(Date.UTC(2021,2,21,3,30));
			assert.equal(oDateFormat.parse(sRelativeUTC, true).getTime(), oExpectedUTC.getTime());

			var sRelative = oDateFormat.format(oDate);
			assert.equal(sRelative, "vor 1 Tag");
			var oExpected = new Date(Date.UTC(2021,2,21,3,30));
			assert.equal(oDateFormat.parse(sRelative).getTime(), oExpected.getTime());
		});


		QUnit.test("23:33", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,2,21,23,33));

			var sRelativeUTC = oDateFormat.format(oDate, true);
			assert.equal(sRelativeUTC, "vor 1 Tag");
			var oExpectedUTC = new Date(Date.UTC(2021,2,21,3,30));
			assert.equal(oDateFormat.parse(sRelativeUTC, true).getTime(), oExpectedUTC.getTime());

			var sRelative = oDateFormat.format(oDate);
			assert.equal(sRelative, "heute");
			var oExpected = new Date(Date.UTC(2021,2,22,3,30));
			assert.equal(oDateFormat.parse(sRelative).getTime(), oExpected.getTime());
		});

		QUnit.module("German summer time 28.03.2021 (2h->3h) (offset: +2 -> +1)", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(new Date("2021-03-27T23:30:00Z").getTime());
				// 28.03 - 0:30 (GMT+1)
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("format date relative to summer time +23 h same day", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,2,28,21,33));
			// 28.03 - 0:30 (GMT+1)
			// -
			// 28.03 - 23:33 (GMT+2)
			// => heute
			var sRelative = oDateFormat.format(oDate);

			assert.equal(sRelative, "heute");
		});

		QUnit.module("German winter time 31.10.2021 (3h->2h) (offset: +1 -> +2)", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
				this.clock = sinon.useFakeTimers(new Date("2021-10-30T22:30:00Z").getTime());
				// 31.10 - 0:30 (GMT+2)
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("format date relative to winter time +23 h same day", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021,9,31,22,59));
			// 31.10 - 23:30 (GMT+1)

			// today 0:30 - 23:30 => heute
			var sRelative = oDateFormat.format(oDate);

			assert.equal(sRelative, "heute");
		});

		QUnit.module("DateFormat relative date (jan 14th 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-01-14T09:59:00Z").getTime()); // Thu Jan 14 2021 10:59:00 GMT+0100
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
				inputDate: "2021-01-20T09:59:00Z", // jan 14th - jan 20th
				outputRelative: "in 6 days"
			}, {
				inputDate: "2021-01-21T09:59:00Z", // jan 14th - jan 21th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-22T09:59:00Z", // jan 14th - jan 22th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-23T09:59:00Z", // jan 14th - jan 23th
				outputRelative: "in 1 week"
			}, {
				inputDate: "2021-01-24T09:59:00Z", // jan 14th - jan 24th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-25T09:59:00Z", // jan 14th - jan 25th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-26T09:59:00Z", // jan 14th - jan 26th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-27T09:59:00Z", // jan 14th - jan 27th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-28T09:59:00Z", // jan 14th - jan 28th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-29T09:59:00Z", // jan 14th - jan 29th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-30T09:59:00Z", // jan 14th - jan 30th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-01-31T09:59:00Z", // jan 14th - jan 31th
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-02-01T09:59:00Z", // jan 14th - feb 1st
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-02-12T09:59:00Z", // jan 14th - feb 12th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-02-13T09:59:00Z", // jan 14th - feb 13th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-02-14T09:59:00Z", // jan 14th - feb 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-02-15T09:59:00Z", // jan 14th - feb 15th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (feb 1st 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-02-01T09:59:00Z").getTime()); // Mon Mar 01 2021 10:59:00 GMT+0100
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
				inputDate: "2021-02-28T09:59:00Z", // feb 1st - feb 28th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-03-01T09:59:00Z", // feb 1st - mar 1st
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-02T09:59:00Z", // feb 1st - mar 2nd
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-03T09:59:00Z", // feb 1st - mar 3rd
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-04T09:59:00Z", // feb 1st - mar 4th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-05T09:59:00Z", // feb 1st - mar 5th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-06T09:59:00Z", // feb 1st - mar 6th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (feb 14th 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-02-14T09:59:00Z").getTime()); // Mon Mar 01 2021 10:59:00 GMT+0100
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
				inputDate: "2021-01-13T09:59:00Z", // feb 14th - jan 13th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-01-14T09:59:00Z", // feb 14th - jan 14th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-01-15T09:59:00Z", // feb 14th - jan 15th
				outputRelative: "5 weeks ago"
			}, {
				inputDate: "2021-01-16T09:59:00Z", // feb 14th - jan 16th
				outputRelative: "5 weeks ago"
			}, {
				inputDate: "2021-01-17T09:59:00Z", // feb 14th - jan 17th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-01-18T09:59:00Z", // feb 14th - jan 18th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-01-19T09:59:00Z", // feb 14th - jan 19th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-28T09:59:00Z", // feb 14th - feb 28th
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-03-01T09:59:00Z", // feb 14th - mar 1st
				outputRelative: "in 2 weeks"
			}, {
				inputDate: "2021-03-13T09:59:00Z", // feb 14th - mar 13th
				outputRelative: "in 3 weeks"
			}, {
				inputDate: "2021-03-14T09:59:00Z", // feb 14th - mar 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-15T09:59:00Z", // feb 14th - mar 15th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-16T09:59:00Z", // feb 14th - mar 16th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-17T09:59:00Z", // feb 14th - mar 17th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-18T09:59:00Z", // feb 14th - mar 18th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-03-19T09:59:00Z", // feb 14th - mar 19th
				outputRelative: "in 1 month"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (mar 1st 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-03-01T09:59:00Z").getTime()); // Mon Mar 01 2021 10:59:00 GMT+0100
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
				inputDate: "2021-01-28T09:59:00Z", // mar 1st - jan 28th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-29T09:59:00Z", // mar 1st - jan 29th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-30T09:59:00Z", // mar 1st - jan 30th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-31T09:59:00Z", // mar 1st - jan 31st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-02-01T09:59:00Z", // mar 1st - feb 1st
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-13T09:59:00Z", // mar 1st - feb 13th
				outputRelative: "3 weeks ago"
			}, {
				inputDate: "2021-02-14T09:59:00Z", // mar 1st - feb 14th
				outputRelative: "2 weeks ago"
			}, {
				inputDate: "2021-02-15T09:59:00Z", // mar 1st - feb 15th
				outputRelative: "2 weeks ago"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal( oDateFormat.format(oDate), oFixture.outputRelative, "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat relative date (mar 14th 2021)", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-03-14T09:59:00Z").getTime());
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
				inputDate: "2021-01-01T09:59:00Z", // mar 14th - jan 1st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-12T09:59:00Z", // mar 14th - jan 12th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-13T09:59:00Z", // mar 14th - jan 13th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-14T09:59:00Z", // mar 14th - jan 14th
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-01-31T09:59:00Z", // mar 14th - jan 31st
				outputRelative: "2 months ago"
			}, {
				inputDate: "2021-02-01T09:59:00Z", // mar 14th - feb 1st
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-08T09:59:00Z", // mar 14th - feb 8th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-09T09:59:00Z", // mar 14th - feb 9th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-10T09:59:00Z", // mar 14th - feb 10th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-11T09:59:00Z", // mar 14th - feb 11th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-12T09:59:00Z", // mar 14th - feb 12th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-13T09:59:00Z", // mar 14th - feb 13th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-14T09:59:00Z", // mar 14th - feb 14th
				outputRelative: "1 month ago"
			}, {
				inputDate: "2021-02-15T09:59:00Z", // mar 14th - feb 15th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-16T09:59:00Z", // mar 14th - feb 16th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-17T09:59:00Z", // mar 14th - feb 17th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-02-18T09:59:00Z", // mar 14th - feb 18th
				outputRelative: "4 weeks ago"
			}, {
				inputDate: "2021-04-13T09:59:00Z", // mar 14th - apr 13th
				outputRelative: "in 4 weeks"
			}, {
				inputDate: "2021-04-14T09:59:00Z", // mar 14th - apr 14th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-15T09:59:00Z", // mar 14th - apr 15th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-16T09:59:00Z", // mar 14th - apr 16th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-04-30T09:59:00Z", // mar 14th - apr 30th
				outputRelative: "in 1 month"
			}, {
				inputDate: "2021-05-01T09:59:00Z", // mar 14th - may 1st
				outputRelative: "in 2 months"
			}].forEach(function (oFixture) {
				var oDate = new Date(oFixture.inputDate);
				assert.equal(oFixture.outputRelative, oDateFormat.format(oDate), "relative date: " + oDate);
			});
		});

		QUnit.module("DateFormat#parse custom patterns with timezone", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(Date.UTC(2018, 7, 2, 11, 37));
				stubTimezone("Europe/Berlin");
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
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
				assert.equal(oCustomDate.parse(oCustomDatePatterns[sCustomPattern][0]).getTime(), oCustomDatePatterns[sCustomPattern][1], "Pattern: " + sCustomPattern);

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
			assert.equal(oFormat.parse(twoDigitMinus70 + "-01-01").getFullYear(), 1908, "Year 1908");
			assert.equal(oFormat.parse(twoDigitMinus71 + "-01-01").getFullYear(), 2007, "Year 2007");
		});

		QUnit.module("DateFormat#parse (anno 2018)", {
			beforeEach: function () {
				// 2 digit years require the current year to be fixed
				// e.g. for pattern: "yyyy-MM-dd" with input "04-03-12" the result depends on the current year
				this.clock = sinon.useFakeTimers(Date.UTC(2018, 7, 2, 11, 37));
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
			assert.equal(oDate.getFullYear(), 2001, "Parsed as 2001");
			sDate = oFormat.format(oDate);
			assert.equal(sDate, "1/1/2001", "Formatted as 2001");

			// 1/1/1001
			oDate = new Date(0);
			oDate.setFullYear(1001, 0, 1);
			assert.equal(oDate.getFullYear(), 1001, "Fullyear is 1001");
			assert.equal(oDate.getMonth(), 0, "Month is 0");
			sDate = oFormat.format(oDate);
			assert.equal(sDate, "1/1/1001", "Formatted as 1001");
			oDate = oFormat.parse(sDate);
			assert.equal(oDate.getFullYear(), 1001, "Fullyear is still 1001");

			// 1/1/0002
			oDate = new Date(0);
			oDate.setFullYear(2, 0, 1);
			assert.equal(oDate.getFullYear(), 2, "Fullyear is 2");
			assert.equal(oDate.getMonth(), 0, "Month is 0");
			sDate = oFormat.format(oDate);
			assert.equal(sDate, "1/1/0002", "Formatted as 0002");
			oDate = oFormat.parse(sDate);
			assert.equal(oDate.getFullYear(), 2, "Fullyear is still 2");

			// 1/1/0001
			oDate = new Date(0);
			oDate.setFullYear(1, 0, 1);
			assert.equal(oDate.getFullYear(), 1, "Fullyear is 1");
			assert.equal(oDate.getMonth(), 0, "Month is 0");
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
			assert.notOk(isNaN(oDateFormat.parse("W1").getTime()), "Date is valid and can be correctly parsed 'W1'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "'W'ww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "W01", "week format with pattern 'ww'");
			assert.ok(oDateFormat.parse("W01") instanceof Date, "Date can be correctly parsed 'W01'");
			assert.notOk(isNaN(oDateFormat.parse("W01").getTime()), "Date is valid and can be correctly parsed 'W01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "www"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "CW 01", "week format with pattern 'www'");
			assert.ok(oDateFormat.parse("CW 01") instanceof Date, "Date can be correctly parsed 'CW 01'");
			assert.notOk(isNaN(oDateFormat.parse("CW 01").getTime()), "Date is valid and can be correctly parsed 'CW 01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww"
			}, /* need to use xx-XX locale because only the pattern in default bundle is known*/ new Locale("xx-XX"));
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 01", "week format with pattern 'wwww'");
			assert.ok(oDateFormat.parse("Calendar Week 01") instanceof Date, "Date can be correctly parsed 'Calendar Week 01'");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 01").getTime()), "Date is valid and can be correctly parsed 'Calendar Week 01'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Islamic
			});
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 11", "week number in Islamic calendar");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 11").getTime()), "Date can be correctly parsed in Islamic calendar 'Calendar Week 11'");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "wwww",
				calendarType: CalendarType.Japanese
			});
			assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "Calendar Week 01", "week number in Japanese calendar");
			assert.notOk(isNaN(oDateFormat.parse("Calendar Week 01").getTime()), "Date can be correctly parsed in Japanese calendar 'Calendar Week 01'");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern with 2 digits", function (assert) {
			sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "YY'-'ww"
			});
			assert.equal(oDateFormat.format(new Date(2014, 11, 22)), "14-52", "Date can be correctly formatted to '14-52'");
			assert.equal(oDateFormat.parse("14-52").valueOf(), new Date(2014, 11, 22).valueOf(), "'14-52' can be correctly parsed");

			assert.equal(oDateFormat.format(new Date(2014, 11, 29)), "15-01", "Date can be correctly formatted to '15-01'");
			assert.equal(oDateFormat.parse("15-01").valueOf(), new Date(2014, 11, 29).valueOf(), "'15-01' can be correctly parsed");

			assert.equal(oDateFormat.format(new Date(2015, 0, 5)), "15-02", "Date can be correctly formatted to '15-02'");
			assert.equal(oDateFormat.parse("15-02").valueOf(), new Date(2015, 0, 5).valueOf(), "'15-02' can be correctly parsed");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern with language en-AU", function (assert) {
			sap.ui.getCore().getConfiguration().setLanguage("en_AU");
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "YYYY'-'ww'-'EE"
			});

			// first day of the week is Monday
			var oSundayDate = new Date(2022, 1, 13);
			var oMondayDate = new Date(2022, 1, 14);

			assert.equal(oDateFormat.format(oSundayDate), "2022-07-Sun", "Date can be correctly formatted to '2022-07-Sun'");
			assert.deepEqual(oDateFormat.parse("2022-07-Sun"), oSundayDate, "'2022-07-Sun' can be correctly parsed");

			assert.equal(oDateFormat.format(oMondayDate), "2022-08-Mon", "Date can be correctly formatted to '2022-08-Mon'");
			assert.deepEqual(oDateFormat.parse("2022-08-Mon"), oMondayDate, "'2022-08-Mon' can be correctly parsed");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("format and parse weekYear/weekInYear pattern", function (assert) {
			var oDateFormat;
			var aLocales;

			// Split Week
			// "en_US" has a split week, which means that January 1st is always calendar week 1
			// and the last week of the year always ends with December 31st.
			aLocales = ["en_US"];
			aLocales.forEach(function(sLocale) {
				sap.ui.getCore().getConfiguration().setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.equal(oDateFormat.format(new Date(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2014-1"), new Date(2014, 0, 1), "Date can be correctly parsed to 1st of January 2014");
				assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2015, 0, 1), "Date can be correctly parsed to 1st of January 2015");
				assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2016-1", "For " + sLocale + " 1st of January is always week 1");
				assert.deepEqual(oDateFormat.parse("2016-1"), new Date(2016, 0, 1), "Date can be correctly parsed to 1st of January 2016");
				assert.equal(oDateFormat.format(new Date(2014, 11, 31)), "2014-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2014-53"), new Date(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.equal(oDateFormat.format(new Date(2015, 11, 31)), "2015-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2015-53"), new Date(2015, 11, 27), "Date can be correctly parsed to 27th of December 2015");
				assert.equal(oDateFormat.format(new Date(2016, 11, 31)), "2016-53", "For " + sLocale + " 31st of December is always week 53");
				assert.deepEqual(oDateFormat.parse("2016-53"), new Date(2016, 11, 25), "Date can be correctly parsed to 25th of December 2016");
			});

			// Western Traditional
			// en uses the Western Traditional calendar week calculation which means the week starts with sunday
			// and the first Saturday of a year is in calendar week 1 (minDays=1)
			aLocales = ["en"];
			aLocales.forEach(function(sLocale) {
				sap.ui.getCore().getConfiguration().setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.equal(oDateFormat.format(new Date(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January 2014 is week 1/2014");
				assert.deepEqual(oDateFormat.parse("2014-1"), new Date(2013, 11, 29), "Date can be correctly parsed to 29th of December 2014");
				assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2016-1", "For " + sLocale + " 1st of January 2016 is week 1/2016");
				assert.deepEqual(oDateFormat.parse("2016-1"), new Date(2015, 11, 27), "Date can be correctly parsed to 27th of December 2015");
				assert.equal(oDateFormat.format(new Date(2014, 11, 31)), "2015-1", "For " + sLocale + " 31st of December 2014 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2014, 11, 28), "Date can be correctly parsed to 28th of December 2014");
				assert.equal(oDateFormat.format(new Date(2015, 11, 31)), "2016-1", "For " + sLocale + " 31st of December 2015 is week 1/2016");
				assert.deepEqual(oDateFormat.parse("2015-53"), new Date(2015, 11, 27), "Date can be correctly parsed to 27th of December 2014");
				assert.equal(oDateFormat.format(new Date(2016, 11, 31)), "2016-53", "For " + sLocale + " 31st of December 2016 is week 53/2016");
				assert.deepEqual(oDateFormat.parse("2016-53"), new Date(2016, 11, 25), "Date can be correctly parsed to 25th of December 2016");
			});

			// ISO 8601
			// de and en_GB have the rule of "the first thursday in the year",
			// the first thursday in the year is part of calendar week 1 and every calendar week is 7 days long.
			// The week starts with Monday
			aLocales = ["de_DE", "en_GB"];
			aLocales.forEach(function(sLocale) {
				sap.ui.getCore().getConfiguration().setLanguage(sLocale);
				oDateFormat = DateFormat.getDateInstance({
					pattern: "Y-w"
				});
				assert.equal(oDateFormat.format(new Date(2014, 0, 1)), "2014-1", "For " + sLocale + " 1st of January 2014 is week 1/2014");
				assert.deepEqual(oDateFormat.parse("2014-1"), new Date(2013, 11, 30), "Date can be correctly parsed to 1st of January 2014");
				assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For " + sLocale + " 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2014, 11, 29), "Date can be correctly parsed to 1st of January 2015");
				assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2015-53", "For " + sLocale + " 1st of January 2016 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2016-1"), new Date(2016, 0, 4), "Date can be correctly parsed to 1st of January 2016");
				assert.equal(oDateFormat.format(new Date(2014, 11, 31)), "2015-1", "For " + sLocale + " 31st of December 2014 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2014, 11, 29), "Date can be correctly parsed to 29th of December 2014");
				assert.equal(oDateFormat.format(new Date(2015, 11, 31)), "2015-53", "For " + sLocale + " 31st of December 2015 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2015-53"), new Date(2015, 11, 28), "Date can be correctly parsed to 29th of December 2014");
				assert.equal(oDateFormat.format(new Date(2016, 11, 31)), "2016-52", "For " + sLocale + " 31st of December 2016 is week 52/2016");
				assert.deepEqual(oDateFormat.parse("2016-52"), new Date(2016, 11, 26), "Date can be correctly parsed to 29th of December 2016");
			});

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
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
				assert.equal(oDateFormat.format(new Date(2015, 0, 1)), "2015-1", "For 1st of January 2015 is week 1/2015");
				assert.deepEqual(oDateFormat.parse("2015-1"), new Date(2014, 11, 29), "Date can be correctly parsed to 1st of January 2015");
				assert.equal(oDateFormat.format(new Date(2016, 0, 1)), "2015-53", "For 1st of January 2016 is week 53/2015");
				assert.deepEqual(oDateFormat.parse("2016-1"), new Date(2016, 0, 4), "Date can be correctly parsed to 1st of January 2016");
			});

			// use formatOptions parameter and locale, formatOptions take precedence
			// with zero value
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "Y-w",
				firstDayOfWeek: 0,
				minimalDaysInFirstWeek: 0
			}, new Locale("en-US"));

			// no en_US split week since both paramaters are specified
			assert.equal(oDateFormat.format(new Date(2022, 0, 1)), "2022-1", "For 1st of January 2022 is week 1/2022");
			assert.equal(oDateFormat.format(new Date(2021, 11, 31)), "2022-1", "For 1st of January 2022 is week 1/2022");

			assert.throws(function() {
				DateFormat.getDateInstance({
					pattern: "Y-w",
					minimalDaysInFirstWeek: 4
				});
			}, new Error("Format options firstDayOfWeek and minimalDaysInFirstWeek need both to be set, but only one was provided."),
				"only minimalDaysInFirstWeek is provided without firstDayOfWeek");
			assert.throws(function() {
				DateFormat.getDateInstance({
					pattern: "Y-w",
					firstDayOfWeek: 1
				});
			}, new Error("Format options firstDayOfWeek and minimalDaysInFirstWeek need both to be set, but only one was provided."),
				"only firstDayOfWeek is provided without minimalDaysInFirstWeek");


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
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed to the same date");

			sap.ui.getCore().getConfiguration().setLanguage("de_DE");
			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			});
			sFormatted = "2016/45/7";

			assert.equal(oDateFormat.format(oDate), sFormatted, "13th, November 2016 Sunday is the 7th day of week 45 in de-DE");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed to the same date");

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
					assert.ok(sFormattedDate, "Format (" + sLanguage + "): " + sFormattedDate + " using pattern " + sPattern);
					oParsedDate = oDateFormat.parse(sFormattedDate);
					assert.deepEqual(oParsedDate, oDate, "Parse (" + sLanguage + "): " + sPattern);

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


		QUnit.test("format and parse week and dayName Jan 1st, 2017", function (assert) {
			var oDate = new Date(2017, 0, 1);
			var sPattern = "YYYY 'Week' ww EEEE";

			var oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("en_US"));
			var sFormatted = "2017 Week 01 Sunday";

			assert.equal(oDateFormat.format(oDate).toString(), sFormatted, "2017 Week 01 Sunday in en-US");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed");

			oDateFormat = DateFormat.getDateInstance({
				pattern: sPattern
			}, new Locale("de_DE"));
			sFormatted = "2016 Week 52 Sonntag";

			assert.equal(oDateFormat.format(oDate).toString(), sFormatted, "2016 Week 52 Sonntag in de-DE");
			assert.deepEqual(oDateFormat.parse(sFormatted), oDate, "The formatted string can be correctly parsed");

			sap.ui.getCore().getConfiguration().setLanguage("en_US");
		});

		QUnit.test("origin info", function (assert) {
			var oOriginDate = DateFormat.getInstance(), sValue = oOriginDate.format(oDateTime), oInfo = sValue.originInfo;
			assert.equal(oInfo.source, "Common Locale Data Repository", "Origin Info: source");
			assert.equal(oInfo.locale, "en-US", "Origin Info: locale");
			assert.equal(oInfo.style, "medium", "Origin Info: style");
			assert.equal(oInfo.pattern, "MMM d, y", "Origin Info: pattern");
		});

		QUnit.module("Scaling: Relative Time Formatter", {
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
				stubTimezone(oFixture.timezone);
				var oDate = new Date(oFixture.date);

				assert.equal(oDateFormat.format(oDate).toString(), "Dhuʻl-Q. 30, 1419 AH",
					"current month in " + oFixture.timezone);

				// add 1 hour to proceed with the next day when converting to the given timezone
				oDate.setUTCHours(oDate.getUTCHours() + 1);

				assert.equal(oDateFormat.format(oDate).toString(), "Dhuʻl-H. 1, 1419 AH",
					"succeeding month in " + oFixture.timezone);
				stubTimezone(null);
			});
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
				stubTimezone(oFixture.timezone);

				// 2019-5-1 era change
				var oDate1 = new Date(oFixture.date);

				assert.equal(oDateFormat.format(oDate1), "平成31年4月30日", "old era in " + oFixture.timezone);

				// add 2 hour
				oDate1.setUTCHours(oDate1.getUTCHours() + 2);

				assert.equal(oDateFormat.format(oDate1), "令和元年5月1日", "new era in " + oFixture.timezone);
				stubTimezone(null);
			});
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
			assert.deepEqual(oParsed, oDate, "Date with Gannen year is parsed correctly");

			oDate = new Date("Apr 1 2019");
			sDate = "平成31年4月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Year ending with 1 is formatted as a number");
			assert.deepEqual(oParsed, oDate, "Date with numeric year is parsed correctly");

			oDate = new Date("May 1 2019");
			sDate = "R1/5/1";
			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				style: "short"
			}, new Locale("ja_JP"));
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date is formatted correctly with numeric year");
			assert.deepEqual(oParsed, oDate, "Date with numeric year is parsed correctly");

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
			assert.deepEqual(oParsed, oDate, "Date interval with Gannen year is parsed correctly");

			oDate = [new Date("Apr 1 2019"), new Date("May 1 2019")];
			sDate = "平成31年4月1日～令和元年5月1日";
			sFormatted = oDateFormat.format(oDate);
			oParsed = oDateFormat.parse(sDate);

			assert.equal(sFormatted, sDate, "Date interval is formatted correctly with Gannen year");
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
				stubTimezone(oFixture.timezone);
				var oDate1 = new Date(oFixture.date);

				// Before 1941 new year started on 1st of April
				assert.equal(oDateFormat.format(oDate1).toString(), "31 มี.ค. 2482",
					"previous year in " + oFixture.timezone);

				// add 1 hour
				oDate1.setUTCHours(oDate1.getUTCHours() + 1);

				assert.equal(oDateFormat.format(oDate1).toString(), "1 เม.ย. 2483",
					"succeeding year in " + oFixture.timezone);
				stubTimezone(null);
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

		QUnit.test("format date to Buddhist type with locale en and calendar week", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist,
				pattern: "YYYY'/'ww"
			});

			assert.equal(oDateFormat.format(this.oDate), "2544/27", "Date is formatted in Buddhist calendar");


			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Buddhist,
				pattern: "yyyy"
			});
			assert.equal(oDateFormat.format(this.oDate), "2544", "Date is formatted in Buddhist calendar");
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

			// + 2 days
			var oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)), CalendarType.Gregorian);
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 2 * 24 * 3600 * 1000), CalendarType.Gregorian);

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Day": true }, "correct diff returned");

			// + 0.5 day
			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 12 * 3600 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "if two dates are identical on the fields which we compare, 'null' will be returned");

			oIntervalFormat = DateFormat.getDateInstance({
				interval: true,
				format: "Md"
			});

			// + 1 month and + 1 year
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(new Date(Date.UTC(2018, 4, 11)));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Year": true, "Month": true, "Week": true }, "correct diff returned");

			// + 3 month
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)), CalendarType.Gregorian);
			oDate1 = UniversalDate.getInstance(new Date(Date.UTC(2017, 6, 11)), CalendarType.Gregorian);
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Quarter": true, "Month": true, "Week": true }, "correct diff returned");
		});

		QUnit.test("Greatest Diff Group: Time instance", function (assert) {
			var oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Hour": true, "Minute": true }, "correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(new Date(Date.UTC(2017, 4, 11)));
			assert.equal(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 1800 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Minute": true }, "the correct diff returned.");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "h"
			});

			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11, 11)));
			oDate1 = UniversalDate.getInstance(new Date(Date.UTC(2017, 4, 11, 12)));

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "DayPeriod": true, "Hour": true }, "correct diff returned");

			oIntervalFormat = DateFormat.getTimeInstance({
				interval: true,
				format: "K"
			});

			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11, 11)));
			oDate1 = UniversalDate.getInstance(new Date(Date.UTC(2017, 4, 11, 12)));

			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "DayPeriod": true, "Hour": true }, "correct diff returned");
		});

		QUnit.test("Greatest Diff Group: DateTime instance", function (assert) {
			var oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "Hms"
			});
			var oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			var oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 5400 * 1000));
			assert.deepEqual(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), { "Hour": true, "Minute": true }, "correct diff returned");


			// if two dates are identical on the fields which we compare, no diff field will be returned
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
			oDate1 = UniversalDate.getInstance(new Date(oDate.getTime() + 999));
			assert.equal(oIntervalFormat._getGreatestDiffField([oDate, oDate1]), null, "'null' will be returned");

			// if the diff field doesn't exist in the 'format' option, the default diff field is used.
			oIntervalFormat = DateFormat.getDateTimeInstance({
				interval: true,
				format: "yMd"
			});
			oDate = UniversalDate.getInstance(new Date(Date.UTC(2017, 3, 11)));
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

		QUnit.test("format date to Japanese type with locale en and calendar week", function (assert) {
			var oDate = new Date(2017, 3, 11);

			var oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				pattern: "YYYY'/'ww"
			});

			assert.equal(oDateFormat.format(oDate), "0029/15", "Date is formatted in Buddhist calendar");

			oDateFormat = DateFormat.getDateInstance({
				calendarType: CalendarType.Japanese,
				pattern: "yyyy"
			});
			assert.equal(oDateFormat.format(oDate), "0029", "Date is formatted in Buddhist calendar");
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

			var oFormat = DateFormat.getDateInstance({
				format: "yMd"
			});

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = new Date(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.equal(sResult.toString(), oFormat.format(oDate).toString(), "if two dates are identical on the fields which we compare, a single date will be formatted.");
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

			var oFormat = DateFormat.getDateInstance();

			// if two dates are identical on the fields which we compare, no diff field will be returned
			var oDate = new Date(2017, 3, 11);
			var sResult = oIntervalFormat.format([oDate, oDate]);

			assert.equal(sResult.toString(), oFormat.format(oDate).toString(), "if two dates are identical on the fields which we compare, a single date will be formatted.");
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

		QUnit.module("Timezone pattern symbol VV", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("Format with pattern symbol non VV", function (assert) {
			assert.equal(DateFormat.getDateTimeInstance({pattern: "V"}).format(oDateTime), "",
				"No timezone is formatted for pattern 'V'");

			assert.equal(DateFormat.getDateTimeInstance({pattern: "VVV"}).format(oDateTime), "",
				"No timezone is formatted for pattern 'VVV'");
		});

		QUnit.test("Format with pattern symbol VV", function (assert) {
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).format(oDateTime, true), "",
				"No timezone is formatted for UTC");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).format(oDateTime), "Europe, Berlin",
				"Only local timezone is formatted");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "z"
				}).format(oDateTime).toString(), "GMT+02:00",
				"Only local offset is formatted");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV z"
				}).format(oDateTime).toString(), "2000-09-23T08:46:13 Europe, Berlin GMT+02:00",
				"Local timezone and offset is formatted");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"
				}).format(oDateTime).toString(), "2000-09-23T08:46:13 GMT+02:00 Europe, Berlin",
				"Local offset and timezone is formatted");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
				}).format(oDateTime).toString(), "2000-09-23T08:46:13 Europe, Berlin",
				"Local timezone is formatted");
		});

		QUnit.test("Parse with pattern symbol VV", function (assert) {
			var oDate = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
			oDate.setUTCHours(oDate.getUTCHours() - 1); // GMT+1 (Europe/Berlin)
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "VV"
				}).parse("Europe, Berlin", false, true).getTime(), oDate.getTime(),
				"Parsed the initial unix epoch date with pattern symbol VV.");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "z"
				}).parse("GMT+01:00").getTime(), oDate.getTime(),
				"Parsed the initial unix epoch date with pattern symbol z.");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV z"
				}).parse("2000-09-23T08:46:13 Europe, Berlin GMT+02:00").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbols VV and z.");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss z VV"
				}).parse("2000-09-23T08:46:13 GMT+02:00 Europe, Berlin").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbols z and VV.");
			assert.equal(DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss VV"
				}).parse("2000-09-23T08:46:13 Europe, Berlin").getTime(), oDateTime.getTime(),
				"Parsed with pattern symbol VV.");
		});

		QUnit.module("DateFormat relative date with timezone America/New_York", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2021-10-09T02:37:00Z").getTime());
				// Oct 8th 22:37 (New York -4 EDT)
				stubTimezone("America/New_York");
			},
			afterEach: function () {
				this.clock.restore();
				stubTimezone(null);
			}
		});

		QUnit.test("format date relative date", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date(Date.UTC(2021, 9, 9, 7, 37));
			// Oct 8th 22:37 (New York) -
			// Oct 9th 3:37 (New York)

			var sRelative = oDateFormat.format(oDate);

			assert.equal(sRelative, "in 1 Tag");
		});

		QUnit.test("parse date relative date in 1 Tag", function (assert) {
			var oDateFormat = DateFormat.getDateInstance({ relative: true }, new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");
			oDate.setDate(oDate.getDate() + 1);

			// Oct 8th 22:37 (New York) -
			// Oct 9th 22:37 (New York)

			var oRelative = oDateFormat.parse("in 1 Tag");
			assert.equal(oDateFormat.parse("morgen").getTime(), oRelative.getTime());

			assert.equal(oRelative.getTime(), oDate.getTime());
		});

		QUnit.module("DateFormat with timezone Australia/Sydney", {
			beforeEach: function () {
				stubTimezone("Australia/Sydney");
			},
			afterEach: function () {
				stubTimezone(null);
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
			var oDateAEDT = new Date("2018-03-31T13:00:00Z");
			var sFormattedAEDT = oDateFormat.format(oDateAEDT);
			assert.equal(sFormattedAEDT, "2018-04-01T00:00:00.000+11:00", "format AEDT");
			assert.equal(oDateFormat.parse(sFormattedAEDT).getTime(), oDateAEDT.getTime(), "parse AEST");

			// AEST
			var oDateAEST = new Date("2018-03-31T18:00:00Z");
			var sFormattedAEST = oDateFormat.format(oDateAEST);
			assert.equal(sFormattedAEST, "2018-04-01T04:00:00.000+10:00", "format AEST");
			assert.equal(oDateFormat.parse(sFormattedAEST).getTime(), oDateAEST.getTime(), "parse AEST");
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
				stubTimezone("Europe/Berlin");
			},
			afterEach: function () {
				stubTimezone(null);
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
				stubTimezone("America/Adak");
			},
			afterEach: function () {
				stubTimezone(null);
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
				stubTimezone("Pacific/Kiritimati");
			},
			afterEach: function () {
				stubTimezone(null);
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
				stubTimezone("America/New_York");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("integration: format and parse", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.equal(sFormatted, "08.10.2021, 22:37:00");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.equal(oParsedDate.getTime(), oDate.getTime());
		});

		QUnit.test("integration: format and parse for different locales", function (assert) {
			var oDate = new Date("2021-10-09T02:37:00Z");
			["ar", "sv", "fr", "en", "da", "tr", "ja", "ru"].forEach(function(sLocale) {
				var oDateFormat = DateFormat.getDateTimeInstance(new Locale(sLocale));
				var sFormatted = oDateFormat.format(oDate);

				assert.ok(sFormatted, "formatted '" + sFormatted + "' correctly for locale " + sLocale);

				var oParsedDate = oDateFormat.parse(sFormatted);

				assert.equal(oParsedDate.getTime(), oDate.getTime(), "correctly parsed for locale " + sLocale);
			});
		});

		QUnit.test("integration: format and parse for different timezones", function (assert) {
			var oDate = new Date("2021-10-09T02:37:00Z");
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
				stubTimezone(oFixture.timezone);
				var oDateFormat = DateFormat.getDateTimeInstance(new Locale("de"));
				var sFormatted = oDateFormat.format(oDate);

				assert.equal(sFormatted.toString(), oFixture.expectedDate,
					"formatted '" + sFormatted + "' correctly for timezone " + oFixture.timezone);

				var oParsedDate = oDateFormat.parse(sFormatted);

				assert.equal(oParsedDate.getTime(), oDate.getTime(),
					"correctly parsed for timezone " + oFixture.timezone);
			});
		});

		QUnit.test("integration: format and parse with pattern 'yyyy-MM-dd'T'HH:mm:ss.SSSXXX'-'VV'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX'-'VV"
			}, new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.equal(sFormatted, "2021-10-08T22:37:00.000-04:00-Amerika, New York");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.equal(oParsedDate.getTime(), oDate.getTime());
		});

		QUnit.test("integration: format and parse with pattern 'yyyy-MM-dd'T'HH:mm:ss.SSS'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS"
			}, new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");

			var sFormatted = oDateFormat.format(oDate);
			assert.equal(sFormatted, "2021-10-08T22:37:00.000");

			var oParsedDate = oDateFormat.parse(sFormatted);
			assert.equal(oParsedDate.getTime(), oDate.getTime());
		});

		// zulu timestamp coming from backend (e.g. for OData)
		QUnit.test("parse: data conversion with pattern 'yyyy-MM-dd'T'HH:mm:ssXXX'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ssXXX"
			}, new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");

			var oParsedDate = oDateFormat.parse("2021-10-09T02:37:00Z");
			assert.equal(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");

			// utc
			oParsedDate = oDateFormat.parse("2021-10-09T02:37:00Z", true);
			assert.equal(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");
		});

		QUnit.test("parse UTC: with pattern 'yyyy-MM-dd'T'HH:mm:ss'", function (assert) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss"
			}, new Locale("de"));

			var oDate = new Date("2021-10-09T02:37:00Z");

			var oParsedDate = oDateFormat.parse("2021-10-09T02:37:00", true);
			assert.equal(oParsedDate.getTime(), oDate.getTime(), "parse back to the the zulu timestamp from the input");
		});

		QUnit.module("DateFormat with timezone Europe/Berlin", {
			beforeEach: function () {
				stubTimezone("Europe/Berlin");
			},
			afterEach: function () {
				stubTimezone(null);
			}
		});

		QUnit.test("fallback instance with UTC format option inheritence", function (assert) {
			var oDateFormatted = "2018-08-15T13:07:47.000Z";
			var oFormatter = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
				UTC: true
			});

			var oUTCDate = new Date("2018-08-15T13:07:47Z");
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
				assert.deepEqual(oDateFormat.format(new Date(oFixture.inputDate)), oFixture.formatted, "Format '" + oFixture.formatted + "'");
				assert.deepEqual(oDateFormat.parse(oFixture.formatted), new Date(oFixture.inputDate), "Parse '" + oFixture.formatted + "'");
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
				assert.deepEqual(oDateFormat.format(new Date(oFixture.inputDate)),
					oFixture.formatted, "Format '" + oFixture.formatted + "'");
			});
		});
	});
