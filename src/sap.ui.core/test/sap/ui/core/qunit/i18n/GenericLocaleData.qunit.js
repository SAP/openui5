sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData"
], function(Localization, CalendarType, Locale, LocaleData) {
	"use strict";
	/* eslint-disable camelcase */
	/*global QUnit */

	var sDefaultLanguage = Localization.getLanguage();

	//var aUSDSymbols = ["US$", "$", "$", "$", "$", "US$", "$", "US$", "$", "US$", , "$", "$US", "$\u00a0US", "$US", "$", "US$", "US$", "$",
	//	"US$", "US$", "$", "$", "$", "US$", "US$", "USD", "US$", "US$", "$", "US$", "$", "USD"];

	/*
	"getOrientation", "getLanguages", "getScripts", "getTerritories", "getMonths", "getDays", "getQuarters", "getDayPeriods",
	"getDatePattern", "getTimePattern", "getDateTimePattern", "getNumberSymbol"
	*/
	function genericTests(assert, oLocaleData, sLocale) {
		var aCalendarTypes = [undefined],
			sCalendarType,
			j;

		assert.equal(typeof oLocaleData.getOrientation(), "string", "getOrientation()");
		assert.equal(typeof oLocaleData.getLanguages(), "object", "getLanguages()");
		assert.equal(typeof oLocaleData.getScripts(), "object", "getScripts()");
		assert.equal(typeof oLocaleData.getTerritories(), "object", "getTerritories()");

		if (sLocale !== "xx_XX") {
			for (sCalendarType in CalendarType) {
				aCalendarTypes.push(CalendarType[sCalendarType]);
			}
		}

		aCalendarTypes.forEach(function(sCalendarType) {
			assert.equal(oLocaleData.getMonths("narrow", sCalendarType) && oLocaleData.getMonths("narrow", sCalendarType).length, 12, "getMonths(\"narrow\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getMonths("abbreviated", sCalendarType) && oLocaleData.getMonths("abbreviated", sCalendarType).length, 12, "getMonths(\"abbreviated\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getMonths("wide", sCalendarType) && oLocaleData.getMonths("wide", sCalendarType).length, 12, "getMonths(\"wide\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDays("narrow", sCalendarType) && oLocaleData.getDays("narrow", sCalendarType).length, 7, "getDays(\"narrow\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDays("abbreviated", sCalendarType) && oLocaleData.getDays("abbreviated", sCalendarType).length, 7, "getDays(\"abbreviated\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDays("wide", sCalendarType) && oLocaleData.getDays("wide", sCalendarType).length, 7, "getDays(\"wide\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDays("short", sCalendarType) && oLocaleData.getDays("short", sCalendarType).length, 7, "getDays(\"short\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getQuarters("narrow", sCalendarType) && oLocaleData.getQuarters("narrow", sCalendarType).length, 4, "getQuarters(\"narrow\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getQuarters("abbreviated", sCalendarType) && oLocaleData.getQuarters("abbreviated", sCalendarType).length, 4, "getQuarters(\"abbreviated\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getQuarters("wide", sCalendarType) && oLocaleData.getQuarters("wide", sCalendarType).length, 4, "getQuarters(\"wide\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDayPeriods("narrow", sCalendarType) && oLocaleData.getDayPeriods("narrow", sCalendarType).length, 2, "getDayPeriods(\"narrow\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDayPeriods("abbreviated", sCalendarType) && oLocaleData.getDayPeriods("abbreviated", sCalendarType).length, 2, "getDayPeriods(\"abbreviated\", \"" + sCalendarType + "\")");
			assert.equal(oLocaleData.getDayPeriods("wide", sCalendarType) && oLocaleData.getDayPeriods("wide", sCalendarType).length, 2, "getDayPeriods(\"wide\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getEras("wide", sCalendarType), "object", "getEras(\"wide\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getEras("abbreviated", sCalendarType), "object", "getEras(\"abbreviated\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getEras("narrow", sCalendarType), "object", "getEras(\"narrow\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("short", sCalendarType), "string", "getDatePattern(\"short\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("medium", sCalendarType), "string", "getDatePattern(\"medium\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("long", sCalendarType), "string", "getDatePattern(\"long\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("full", sCalendarType), "string", "getDatePattern(\"full\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("short", sCalendarType), "string", "getTimePattern(\"short\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("medium", sCalendarType), "string", "getTimePattern(\"medium\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("long", sCalendarType), "string", "getTimePattern(\"long\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("full", sCalendarType), "string", "getTimePattern(\"full\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("short", sCalendarType), "string", "getTimePattern(\"short\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("medium", sCalendarType), "string", "getTimePattern(\"medium\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("long", sCalendarType), "string", "getTimePattern(\"long\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("full", sCalendarType), "string", "getTimePattern(\"full\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCombinedDateTimePattern("full", "medium", sCalendarType), "string", "getTimePattern(\"full\", \"medium\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCombinedDateTimePattern("medium", "short", sCalendarType), "string", "getTimePattern(\"medium\", \"short\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("y", sCalendarType), "string", "getCustomDateTimePattern(\"y\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMd", sCalendarType), "string", "getCustomDateTimePattern(\"yMd\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Hms", sCalendarType), "string", "getCustomDateTimePattern(\"Hms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("jms", sCalendarType), "string", "getCustomDateTimePattern(\"jms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Jms", sCalendarType), "string", "getCustomDateTimePattern(\"jms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdd", sCalendarType), "string", "getCustomDateTimePattern(\"yMdd\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Hmss", sCalendarType), "string", "getCustomDateTimePattern(\"Hmss\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMd", sCalendarType), "string", "getCustomDateTimePattern(\"yMMd\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMMw", sCalendarType), "string", "getCustomDateTimePattern(\"yMMMw\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdHms", sCalendarType), "string", "getCustomDateTimePattern(\"yMdHms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdjms", sCalendarType), "string", "getCustomDateTimePattern(\"yMdjms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms", sCalendarType), "string", "getCustomDateTimePattern(\"yMMMMEEEEdHms\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Q", sCalendarType), "string", "getCustomDateTimePattern(\"Q\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("w", sCalendarType), "string", "getCustomDateTimePattern(\"w\", \"" + sCalendarType + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("My", sCalendarType);}, Error, "getCustomDateTimePattern(\"My\", \"" + sCalendarType + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("yMLd", sCalendarType);}, Error, "getCustomDateTimePattern(\"yMLd\", \"" + sCalendarType + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("yMdp", sCalendarType);}, Error, "getCustomDateTimePattern(\"yMdp\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("y", "y", sCalendarType), "string", "getCustomIntervalPattern(\"y\", \"y\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yMd", "y", sCalendarType), "string", "getCustomIntervalPattern(\"yMd\", \"y\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yMd", "d", sCalendarType), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + sCalendarType + "\")");
			assert.ok(Array.isArray(oLocaleData.getCustomIntervalPattern("yMd", "", sCalendarType)), "getCustomIntervalPattern(\"yMd\", \"\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yw", "y", sCalendarType), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + sCalendarType + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("Q", "Q", sCalendarType), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + sCalendarType + "\")");
			[undefined, "wide", "short", "narrow"].forEach(function(sStyle, index) {
				assert.equal(typeof oLocaleData.getDisplayName("era", sStyle), "string", "getDisplayName(\"era\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("year", sStyle), "string", "getDisplayName(\"year\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("quarter", sStyle), "string", "getDisplayName(\"quarter\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("month", sStyle), "string", "getDisplayName(\"month\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("day", sStyle), "string", "getDisplayName(\"day\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("weekday", sStyle), "string", "getDisplayName(\"weekday\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("hour", sStyle), "string", "getDisplayName(\"hour\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("minute", sStyle), "string", "getDisplayName(\"minute\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("second", sStyle), "string", "getDisplayName(\"second\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				assert.equal(typeof oLocaleData.getDisplayName("zone", sStyle), "string", "getDisplayName(\"zone\"" + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				for (j = -2; j <= 2; j++) {
					assert.equal(typeof oLocaleData.getRelativeSecond(j), "string", "getRelativeSecond(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					if (j === 0) {
						assert.strictEqual(oLocaleData.getRelativeMinute(j), null, "getRelativeMinute(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
						assert.strictEqual(oLocaleData.getRelativeHour(j), null, "getRelativeHour(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					} else {
						assert.equal(typeof oLocaleData.getRelativeMinute(j), "string", "getRelativeMinute(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
						assert.equal(typeof oLocaleData.getRelativeHour(j), "string", "getRelativeHour(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					}
					assert.equal(typeof oLocaleData.getRelativeDay(j), "string", "getRelativeDay(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					assert.equal(typeof oLocaleData.getRelativeWeek(j), "string", "getRelativeWeek(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					assert.equal(typeof oLocaleData.getRelativeMonth(j), "string", "getRelativeMonth(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
					assert.equal(typeof oLocaleData.getRelativeYear(j), "string", "getRelativeYear(" + j + (sStyle === undefined ? "" : ', "' + sStyle + '"') + ")");
				}
			});
		});

		assert.equal(typeof oLocaleData.getNumberSymbol("decimal"), "string", "getNumberSymbol(\"decimal\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("group"), "string", "getNumberSymbol(\"group\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("plusSign"), "string", "getNumberSymbol(\"plusSign\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("minusSign"), "string", "getNumberSymbol(\"minusSign\")");
		assert.equal(typeof oLocaleData.getCurrencySpacing(), "object", "getCurrencySpacing()");
		assert.equal(typeof oLocaleData.getCurrencySpacing("after"), "object", "getCurrencySpacing(\"after\")");
		assert.equal(typeof oLocaleData.getFirstDayOfWeek(), "number", "getFirstDayOfWeek()");
		assert.ok(oLocaleData.getFirstDayOfWeek() >= 0 && oLocaleData.getFirstDayOfWeek() < 7, "getFirstDayOfWeek()");
		assert.equal(typeof oLocaleData.getWeekendStart(), "number", "getWeekendStart()");
		assert.ok(oLocaleData.getWeekendStart() >= 0 && oLocaleData.getWeekendStart() < 7, "getWeekendStart()");
		assert.equal(typeof oLocaleData.getWeekendEnd(), "number", "getWeekendEnd()");
		assert.ok(oLocaleData.getWeekendEnd() >= 0 && oLocaleData.getWeekendEnd() < 7, "getWeekendEnd()");
		assert.ok(oLocaleData.getPreferredCalendarType() in CalendarType, "getPreferredCalendar()");
		assert.equal(typeof oLocaleData.getCalendarWeek("wide", 1), "string", "getCalendarWeek wide");
		assert.equal(typeof oLocaleData.getCalendarWeek("narrow", 1), "string", "getCalendarWeek narrow");
		assert.equal(typeof oLocaleData.getPluralCategories(), "object", "getPluralCategories");
		assert.ok(oLocaleData.getPluralCategories().length >= 1, "object", "getPluralCategories contains at least \"other\"");
		assert.equal(typeof oLocaleData.getPluralCategory("0"), "string", "getPluralCategory(\"0\")");
		assert.equal(typeof oLocaleData.getPluralCategory("1"), "string", "getPluralCategory(\"1\")");
		assert.equal(typeof oLocaleData.getPluralCategory("-2.00"), "string", "getPluralCategory(\"-2.00\")");
		assert.equal(typeof oLocaleData.getPluralCategory("123.456"), "string", "getPluralCategory(\"123.456\")");

		assert.equal(typeof oLocaleData.getDecimalPattern(), "string", "getDecimalPattern");
		assert.equal(typeof oLocaleData.getCurrencyPattern(), "string", "getCurrencyPattern");
		assert.equal(typeof oLocaleData.getPercentPattern(), "string", "getPercentPattern");
		assert.equal(typeof oLocaleData.getMiscPattern("approximately"), "string", "getMiscPattern approximately");
		assert.equal(typeof oLocaleData.getMiscPattern("atLeast"), "string", "getMiscPattern atLeast");
		assert.equal(typeof oLocaleData.getMiscPattern("atMost"), "string", "getMiscPattern atMost");
		assert.equal(typeof oLocaleData.getMiscPattern("range"), "string", "getMiscPattern range");

		// there's no currency symbol defined for EUR and USD in 'es_MX' locale in CLDR data version 26
		if (sLocale !== "xx_XX" /*&& sLocale !== "es_MX"*/) {
			assert.equal(oLocaleData.getCurrencyCodeBySymbol(oLocaleData.getCurrencySymbol("EUR")), "EUR", "Currency Symbol € has currency code EUR");
			assert.equal(oLocaleData.getCurrencyCodeBySymbol(oLocaleData.getCurrencySymbol("USD")), "USD", "Currency Symbol for US Dollar has currency code USD");
		}
	}

	var customTests = {
		ar_SA: function customTests_ar_SA(assert, oLocaleData) {
			assert.equal(oLocaleData.getPluralCategories().length, 6, "six plural forms");
			assert.equal(oLocaleData.getPluralCategories()[0], "zero", "special plural form for zero");
			assert.equal(oLocaleData.getPluralCategories()[1], "one", "special plural form for one");
			assert.equal(oLocaleData.getPluralCategories()[2], "two", "special plural form for two");
			assert.equal(oLocaleData.getPluralCategory("0"), "zero", "plural category zero for 0");
			assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
			assert.equal(oLocaleData.getPluralCategory("2.0"), "two", "plural category two for 2.0");
			assert.equal(oLocaleData.getPluralCategory("4"), "few", "plural category few for 4");
			assert.equal(oLocaleData.getPluralCategory("11"), "many", "plural category many for 11");
			assert.equal(oLocaleData.getPluralCategory("101"), "other", "plural category other for 101");
			assert.equal(oLocaleData.getPreferredCalendarType(), "Islamic", "islamic calendar preferred");
		},

		de_AT: function customTests_de_AT(assert, oLocaleData) {
			assert.equal(oLocaleData.getMonths("wide")[0], "Jänner", "1st month");
		},

		de_DE: function customTests_de_DE(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "Deutsch", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "Lateinisch", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Deutschland", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "Januar", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "Jan.", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "J", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "Sonntag", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "So.", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "S", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "So.", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "dd.MM.y", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("long", "long"), "d. MMMM y, HH:mm:ss z",
				"datetime pattern \"long\", \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimeWithTimezonePattern("long", "long"), "d. MMMM y, HH:mm:ss z VV",
				"datetime pattern \"long\", \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "dd.MM.y, HH:mm", "datetime pattern \"medium\", \"short\"");
			assert.equal(oLocaleData.applyTimezonePattern("y"), "y VV", "time zone pattern applied");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short", "Japanese"), "dd.MM.y G, HH:mm", "datetime pattern \"medium\", \"short\", \"Japanese\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('Woche': w)", "datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "d.M.y, HH:mm:ss", "datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d. MMMM y, HH:mm:ss",
				"datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE, d. MMMM y, HH:mm:ss",
				"datetime format \"yMMMMdEEEEJms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('Tag': d), HH 'Uhr' ('Sekunde': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("km"), "HH:mm", "datetime format \"km\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("Km"), "h:mm\u202Fa", "datetime format \"Km\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "HH:mm:ss", "datetime format \"jms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "HH:mm:ss", "datetime format \"Jms\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y\u2013y", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd.\u2013dd.MM.y",
				"interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "d.M.y, HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"yMdjm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d.\u2013d. MMM",
				"interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"Hm\", \"H\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yw", "y"),
				"'Woche' w 'des' 'Jahres' Y\u2009\u2013\u2009'Woche' w 'des' 'Jahres' Y",
				"interval format \"yw\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Q", "Q"), "Q\u2009\u2013\u2009Q",
				"interval format \"Q\", \"Q\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y\u2013y",
				"interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd.\u2013dd.MM.y",
				"interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "d.M.y, HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"yMdjm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d.\u2013d. MMM",
				"interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", { Day: true}");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"Hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm\u2013HH:mm 'Uhr'",
				"interval format \"jm\", { Hour: true}");
			assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Year: true }),
				"'Woche' w 'des' 'Jahres' Y\u2009\u2013\u2009'Woche' w 'des' 'Jahres' Y",
				"interval format \"yw\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Week: true, Day: true }),
				"'Woche' w 'des' 'Jahres' Y\u2009\u2013\u2009'Woche' w 'des' 'Jahres' Y",
				"interval format \"yw\", { Week: true, Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Day: true }), "'Woche' w 'des' 'Jahres' Y",
				"interval format \"yw\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Q", { Quarter: true }), "Q\u2009\u2013\u2009Q",
				"interval format \"Q\", { Quarter: true }");
			// skeleton "yMMdd" has pattern "dd.MM.y" and
			// skeleton "yMMMd" has pattern "d. MMM y"
			// "yMMMMdd"'s best match is "yMMMd" since both "month" and "day" have the same representation category
			// and both should be expanded which results in "dd. MMMM y"
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMdd"), "dd. MMMM y", "datetime format 'yMMMMdd'");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getFirstDayOfWeek(), 1, "first day of week");
			assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
			assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
			assert.equal(oLocaleData.getPluralCategories().length, 2, "two plural forms");
			assert.equal(oLocaleData.getPluralCategories()[0], "one", "special plural form for one");
			assert.equal(oLocaleData.getPluralCategory("0"), "other", "plural category other for 0");
			assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
			assert.equal(oLocaleData.getPluralCategory("2.0"), "other", "plural category other for 2.0");
			assert.equal(oLocaleData.getPluralCategory("4"), "other", "plural category other for 4");
			assert.equal(oLocaleData.getPluralCategory("10"), "other", "plural category other for 10");
			assert.equal(oLocaleData.getPluralCategory("101"), "other", "plural category other for 101");
			assert.equal(oLocaleData.getPreferredCalendarType(), "Gregorian", "gregorian calendar preferred");
		},

		de_XX: function customTests_de_XX(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getMonths("wide")[0], "Januar", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "Jan.", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "J", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "Sonntag", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "So.", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "S", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "So.", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "dd.MM.y", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
		},

		en_GB: function customTests_en_GB(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "German", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "Latin", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Germany", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "January", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "Jan", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "J", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "Sunday", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "Sun", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "S", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "Su", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimeWithTimezonePattern("long", "long"), "d MMMM y, HH:mm:ss z VV",
				"datetime pattern \"long\", \"long\"");
			assert.equal(oLocaleData.applyTimezonePattern("y"), "y VV", "time zone pattern applied");
			assert.equal(oLocaleData.getCombinedDateTimePattern("long", "long"), "d MMMM y, HH:mm:ss z",
				"datetime pattern \"long\", \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d MMM y, HH:mm", "datetime pattern \"medium\", \"short\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short", "Japanese"), "MMM d, y G, HH:mm", "datetime pattern \"medium\", \"short\", \"Japanese\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd/MM/y", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('week': w)", "datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd/MM/y, HH:mm:ss", "datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE d MMMM y, HH:mm:ss",
				"datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE d MMMM y, HH:mm:ss",
				"datetime format \"yMMMMdEEEEJms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('day': d), HH ('second': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("km"), "HH:mm", "datetime format \"km\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("Km"), "h:mm\u202Fa", "datetime format \"Km\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "HH:mm:ss", "datetime format \"jms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "HH:mm:ss", "datetime format \"Jms\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y\u2013y", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd/MM/y\u2009\u2013\u2009dd/MM/y",
				"interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "dd/MM/y, HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d\u2013d MMM",
				"interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd\u2013dd MMM",
				"interval format \"MMMdd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", \"H\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm\u2013HH:mm",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", "a"), "h:mm\u202Fa\u2009\u2013\u2009h:mm\u202Fa",
				"interval format \"hm\", \"a\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", "h"), "h:mm\u2009\u2013\u2009h:mm\u202Fa",
				"interval format \"hm\", \"h\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", "H"), "h:mm\u202Fa\u2009\u2013\u2009h:mm\u202Fa",
				"interval format \"hm\", \"h\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", "j"), "h:mm\u202Fa\u2009\u2013\u2009h:mm\u202Fa",
				"interval format \"hm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "a"), "HH:mm\u2009\u2013\u2009HH:mm",
				"interval format \"Hm\", \"a\"");
			// if the diff field is smaller than the fields in skeleton format, create custom format for a single date
			assert.equal(oLocaleData.getCustomIntervalPattern("yMMM", "d"), "MMM y", "interval format \"yMMM\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "s"), "dd/MM/y, HH:mm", "interval format \"yMdjm\", \"s\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y\u2013y",
				"interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd/MM/y\u2009\u2013\u2009dd/MM/y",
				"interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "dd/MM/y, HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d\u2013d MMM",
				"interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd\u2013dd MMM",
				"interval format \"MMMdd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"jm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", { DayPeriod: true, Hour: true }),
				"h:mm\u202Fa\u2009\u2013\u2009h:mm\u202Fa", "interval format \"hm\", { DayPeriod: true, Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", { Hour: true }),
				"h:mm\u2009\u2013\u2009h:mm\u202Fa", "interval format \"hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("hm", { Year: true }), "h:mm\u202Fa",
				"interval format \"hm\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { DayPeriod: true, Hour: true }),
				"HH:mm\u2013HH:mm", "interval format \"Hm\", { DayPeriod: true, Hour: true }");
			// if the diff field is smaller than the fields in skeleton format, create custom format for a single date
			assert.equal(oLocaleData.getCustomIntervalPattern("yMMM", { Day: true }), "MMM y", "interval format \"yMMM\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Second: true }), "dd/MM/y, HH:mm", "interval format \"yMdjm\", { Second: true }");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ".", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ",", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‐‑‒–−⁻₋➖", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getFirstDayOfWeek(), 1, "first day of week"); // TODO decide 0 or 1
			assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
			assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
			assert.equal(oLocaleData.getEras("abbreviated")[1], "AD", "Abbreviated Era Name");
			assert.equal(oLocaleData.getEras("abbreviated")[0], "BC", "Abbreviated Era Name");
		},

		en_ZA: function customTests_en_ZA(assert, oLocaleData) {
			assert.equal(oLocaleData.getDatePattern("medium"), "dd MMM y", "date pattern \"medium\"");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ".", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ",", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‐‑‒–−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
		},

		en_US: function customTests_en_US(assert, oLocaleData) {
			assert.equal(oLocaleData.getDayPeriods("abbreviated")[0], "AM", "day periods \"abbreviated\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "h:mm:ss\u202Fa", "datetime format \"jms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "h:mm:ss\u202F", "datetime format \"Jms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdjms"), "EEEE, MMMM d, y, h:mm:ss\u202Fa",
				"datetime format \"yMMMMdEEEEjms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE, MMMM d, y, h:mm:ss\u202F",
				"datetime format \"yMMMMdEEEEJms\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "h:mm\u2009\u2013\u2009h:mm\u202Fa",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }),
				"h:mm\u2009\u2013\u2009h:mm\u202Fa", "interval format \"jm\", { Hour: true }");
		},

		he_IL: function customTests_he_IL(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "right-to-left", "orientation");
		},

		fa_IR: function customTests_fa_IR(assert, oLocaleData) {
			assert.equal(oLocaleData.getPreferredCalendarType(), "Persian", "persian calendar preferred");
		},

		fr_FR: function customTests_fr_FR(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "allemand", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "latin", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Allemagne", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "janvier", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "janv.", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "J", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "dimanche", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "dim.", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "D", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "di", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd/MM/y", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('semaine': w)", "datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd/MM/y HH:mm:ss", "datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE d MMMM y, HH:mm:ss",
				"datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('jour': d) HH 'h' ('seconde': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), "\u202f", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
		},

		ja_JP: function customTests_ja_JP(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "ドイツ語", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "ラテン文字", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "ドイツ", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "1月", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "1月", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "1", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "日曜日", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "日", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "日", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "日", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "y/MM/dd", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "H:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1} {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y年", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "Gy年", "datetime format \"y\"");
			// skeleton "yMMMd" has pattern "y年M月d日"
			// "yMMMdd"'s best match should be "yMMMd" and the "day" should be expanded which results in "y年M月dd日"
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMdd"), "y年M月dd日", "datetime format \"yMMMdd\"");
			// "yMMMMd"'s best match should be "yMMMd" and the "month" shouldn't be expanded which results in "y年M月d日"
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMd"), "y年M月d日", "datetime format \"yMMMMd\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y年～y年", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "y/MM/dd～y/MM/dd", "interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "M月d日～d日", "interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y年～y年", "interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "y/MM/dd～y/MM/dd", "interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "M月d日～d日", "interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ".", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ",", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.ok(oLocaleData.getCalendarWeek("wide", 0).toLowerCase().indexOf("week") === -1, "calendar week should be translated");
		},

		nl_BE: function customTests_nl_BE(assert, oLocaleData) {
			assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y", "date pattern \"medium\"");
		},

		sr_Latn: function customTests_sr_Latn(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "nemački", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "latinica", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Nemačka", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "januar", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "jan", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "j", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "nedelja", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "ned", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "n", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "ne", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "d. M. y.", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1} {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d. M. y. HH:mm", "datetime pattern \"medium\", \"short\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y.", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y. G", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y.", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y. ('nedelja': w)", "datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "d. M. y. HH:mm:ss",
				"datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d. MMMM y. HH:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y. ('dan': d) HH ('sekund': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y\u2013y", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "d. M. y.\u2009\u2013\u2009d. M. y.",
				"interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "d. M. y. HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "dd.\u2013dd. MMM",
				"interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", \"H\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm\u2013HH:mm",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y\u2013y",
				"interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }),
				"d. M. y.\u2009\u2013\u2009d. M. y.", "interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "d. M. y. HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "dd.\u2013dd. MMM",
				"interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"jm\", { Hour: true }");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getPluralCategories().length, 3, "four plural forms");
			assert.equal(oLocaleData.getPluralCategories()[0], "one", "special plural form for one");
			assert.equal(oLocaleData.getPluralCategory("0"), "other", "plural category many for 0");
			assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
			assert.equal(oLocaleData.getPluralCategory("2.0"), "other", "plural category other for 2.0");
			assert.equal(oLocaleData.getPluralCategory("4"), "few", "plural category few for 4");
			assert.equal(oLocaleData.getPluralCategory("10"), "other", "plural category many for 10");
			assert.equal(oLocaleData.getPluralCategory("101"), "one", "plural category one for 101");
		},
		sr: function customTests_sr_Latn(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "немачки", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "латиница", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Немачка", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "јануар", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "јан", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "ј", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "недеља", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "нед", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "н", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "не", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "d. M. y.", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1} {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d. M. y. HH:mm", "datetime pattern \"medium\", \"short\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y.", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y. G", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y.", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y. ('недеља': w)", "datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "d. M. y. HH:mm:ss",
				"datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d. MMMM y. HH:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y. ('дан': d) HH ('секунд': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y\u2013y", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "d. M. y. \u2013 d. M. y.",
				"interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "d. M. y. HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "dd.\u2013dd. MMM",
				"interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", \"H\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm\u2013HH:mm",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y\u2013y",
				"interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "d. M. y. \u2013 d. M. y.",
				"interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "d. M. y. HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "dd.\u2013dd. MMM",
				"interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd.\u2013dd. MMM",
				"interval format \"MMMdd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"jm\", { Hour: true }");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getPluralCategories().length, 3, "four plural forms");
			assert.equal(oLocaleData.getPluralCategories()[0], "one", "special plural form for one");
			assert.equal(oLocaleData.getPluralCategory("0"), "other", "plural category many for 0");
			assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
			assert.equal(oLocaleData.getPluralCategory("2.0"), "other", "plural category other for 2.0");
			assert.equal(oLocaleData.getPluralCategory("4"), "few", "plural category few for 4");
			assert.equal(oLocaleData.getPluralCategory("10"), "other", "plural category many for 10");
			assert.equal(oLocaleData.getPluralCategory("101"), "one", "plural category one for 101");
		},

		ru_RU: function customTests_ru_RU(assert, oLocaleData) {
			assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
			assert.equal(oLocaleData.getLanguages()["de"], "немецкий", "language");
			assert.equal(oLocaleData.getScripts()["Latn"], "латиница", "scripts");
			assert.equal(oLocaleData.getTerritories()["DE"], "Германия", "territories");
			assert.equal(oLocaleData.getMonths("wide")[0], "января", "1st month");
			assert.equal(oLocaleData.getMonths("abbreviated")[0], "янв.", "1st month abbreviated");
			assert.equal(oLocaleData.getMonths("narrow")[0], "Я", "1st month narrow");
			assert.equal(oLocaleData.getDays("wide")[0], "воскресенье", "1st day");
			assert.equal(oLocaleData.getDays("abbreviated")[0], "вс", "1st day abbreviated");
			assert.equal(oLocaleData.getDays("narrow")[0], "В", "1st day narrow");
			assert.equal(oLocaleData.getDays("short")[0], "вс", "1st day short");
			assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y\u202F'г'.", "date pattern \"medium\"");
			assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "time pattern \"medium\"");
			assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
			assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d MMM y\u202F'г'., HH:mm",
				"datetime pattern \"medium\", \"short\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y\u202F'г'. G",
				"datetime format \"y\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y", "datetime format \"yMMd\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "LLL y\u202F'г'. ('неделя': w)",
				"datetime format \"yMMMw\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd.MM.y, HH:mm:ss", "datetime format \"yMdHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d MMMM y\u202F'г'., HH:mm:ss",
				"datetime format \"yMMMMdEEEEHms\"");
			assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('день': d), HH ('секунда': s)", "datetime format \"ydHs\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y\u2013y", "interval format \"y\", \"y\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd.MM.y \u2013 dd.MM.y",
				"interval format \"yMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "dd.MM.y, HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d\u2013d MMM",
				"interval format \"MMMd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd\u2013dd MMM",
				"interval format \"MMMdd\", \"d\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", \"H\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm\u2013HH:mm",
				"interval format \"jm\", \"j\"");
			assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y\u2013y",
				"interval format \"y\", { Year: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd.MM.y \u2013 dd.MM.y",
				"interval format \"yMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "dd.MM.y, HH:mm\u2013HH:mm",
				"interval format \"yMdjm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d\u2013d MMM",
				"interval format \"MMMd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd\u2013dd MMM",
				"interval format \"MMMdd\", { Day: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"Hm\", { Hour: true }");
			assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm\u2013HH:mm",
				"interval format \"jm\", { Hour: true }");
			assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
			assert.equal(oLocaleData.getNumberSymbol("group"), "\xa0", "group separator");
			assert.equal(oLocaleData.getLenientNumberSymbols("minusSign"), "-－﹣ ‑‒−⁻₋➖", "Should return the correct minusSign symbols");
			assert.equal(oLocaleData.getLenientNumberSymbols("plusSign"), "+＋﬩﹢⁺₊ ➕", "Should return the correct plusSign symbols");
			assert.equal(oLocaleData.getPluralCategories().length, 4, "four plural forms");
			assert.equal(oLocaleData.getPluralCategories()[0], "one", "special plural form for one");
			assert.equal(oLocaleData.getPluralCategory("0"), "many", "plural category many for 0");
			assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
			assert.equal(oLocaleData.getPluralCategory("2.0"), "other", "plural category other for 2.0");
			assert.equal(oLocaleData.getPluralCategory("4"), "few", "plural category few for 4");
			assert.equal(oLocaleData.getPluralCategory("10"), "many", "plural category many for 10");
			assert.equal(oLocaleData.getPluralCategory("101"), "one", "plural category one for 101");
		},

		pt_BR: function customTests_pt_BR(assert, oLocaleData) {
			assert.equal(oLocaleData.getFirstDayOfWeek(), 0, "first day of week");
			assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
			assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
		},

		pt_PT: function customTests_pt_PT(assert, oLocaleData) {
			assert.equal(oLocaleData.getFirstDayOfWeek(), 0, "first day of week");
			assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
			assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
		},

		th_TH: function customTests_th_TH(assert, oLocaleData) {
			assert.equal(oLocaleData.getPreferredCalendarType(), "Buddhist", "buddhist calendar preferred");
		}
	};


	QUnit.module("Generic LocaleData", {
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

[
	"ar_SA", "de_AT", "de_CH", "de_DE", "da_DK", "en_AU", "en_CA", "en_GB", "en_US", "en_ZA",
	"es_MX", "es_ES", "fa_IR", "fr_FR", "fr_CA", "fr_BE", "ja_JP", "id_ID", "it_IT", "ru_RU",
	"sr_Latn", "sr", "pt_BR", "pt_PT", "hi_IN", "he_IL", "tr_TR", "nl_BE", "nl_NL", "pl_PL",
	"ko_KR", "th_TH", "zh_SG", "zh_TW", "zh_CN", "de_XX", "xx_XX"
].forEach(function (sLanguage) {
	QUnit.test("Locale " + sLanguage, function(assert) {
		var fnCustomTests, sLocale, oLocaleData;

		Localization.setLanguage(sLanguage);
		sLocale = Localization.getLanguage();
		oLocaleData = LocaleData.getInstance(new Locale(sLocale));
		fnCustomTests = customTests[sLocale];

		genericTests(assert, oLocaleData, sLocale);
		if (fnCustomTests) {
			fnCustomTests(assert, oLocaleData);
		}
	});
});
});
