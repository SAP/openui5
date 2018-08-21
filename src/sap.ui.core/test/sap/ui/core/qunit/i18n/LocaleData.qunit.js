/*global QUnit */
sap.ui.define([
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/library"
], function(Locale, LocaleData, coreLibrary) {
	"use strict";

	// shortcut for enum from sap.ui.core namespace
	var CalendarType = coreLibrary.CalendarType;

	var aLocales = [
		"ar_SA",
		"de_AT",
		"de_CH",
		"de_DE",
		"da_DK",
		"en_AU",
		"en_CA",
		"en_GB",
		"en_US",
		"en_ZA",
		"es_MX",
		"es_ES",
		"fa_IR",
		"fr_FR",
		"fr_CA",
		"fr_BE",
		"ja_JP",
		"id_ID",
		"it_IT",
		"ru_RU",
		"pt_BR",
		"pt_PT",
		"hi_IN",
		"he_IL",
		"tr_TR",
		"nl_BE",
		"nl_NL",
		"pl_PL",
		"ko_KR",
		"th_TH",
		"zh_SG",
		"zh_TW",
		"zh_CN",
		"de_XX",
		"xx_XX"
	];

	var aUSDSymbols = ["US$", "$", "$", "$", "$", "US$", "$", "US$", "$", "US$", , "$", "$US", "$ US", "$US", "$", "US$", "US$", "$",
		"US$", "US$", "$", "$", "$", "US$", "US$", "USD", "US$", "US$", "$", "US$", "$", "USD"];

	QUnit.module("Locales");
	// Run generic test for all supported locales, run custom tests where it is defined
	aLocales.forEach(function(sLocale) {
		QUnit.test("Locale " + sLocale, function(assert) {
			var oLocale = new sap.ui.core.Locale(sLocale),
				oLocaleData = new LocaleData(oLocale),
				fnCustomTests = window["customTests_" + sLocale];
			genericTests(assert, oLocaleData, sLocale);
			if (fnCustomTests) {
				fnCustomTests(assert, oLocaleData);
			}
		});
	});

	/*
	"getOrientation", "getLanguages", "getScripts", "getTerritories", "getMonths", "getDays", "getQuarters", "getDayPeriods",
	"getDatePattern", "getTimePattern", "getDateTimePattern", "getNumberSymbol"
	*/
	function genericTests(assert, oLocaleData, sLocale) {
		var aCalendarTypes = [undefined],
				sCalendarType,
				i, j;

		assert.equal(typeof oLocaleData.getOrientation(), "string", "getOrientation()");
		assert.equal(typeof oLocaleData.getLanguages(), "object", "getLanguages()");
		assert.equal(typeof oLocaleData.getScripts(), "object", "getScripts()");
		assert.equal(typeof oLocaleData.getTerritories(), "object", "getTerritories()");

		if (sLocale !== "xx_XX") {
			for (sCalendarType in CalendarType) {
				aCalendarTypes.push(CalendarType[sCalendarType]);
			}
		}

		for (i = 0 ; i < aCalendarTypes.length ; i++) {
			assert.equal(oLocaleData.getMonths("narrow", aCalendarTypes[i]) && oLocaleData.getMonths("narrow", aCalendarTypes[i]).length, 12, "getMonths(\"narrow\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getMonths("abbreviated", aCalendarTypes[i]) && oLocaleData.getMonths("abbreviated", aCalendarTypes[i]).length, 12, "getMonths(\"abbreviated\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getMonths("wide", aCalendarTypes[i]) && oLocaleData.getMonths("wide", aCalendarTypes[i]).length, 12, "getMonths(\"wide\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDays("narrow", aCalendarTypes[i]) && oLocaleData.getDays("narrow", aCalendarTypes[i]).length, 7, "getDays(\"narrow\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDays("abbreviated", aCalendarTypes[i]) && oLocaleData.getDays("abbreviated", aCalendarTypes[i]).length, 7, "getDays(\"abbreviated\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDays("wide", aCalendarTypes[i]) && oLocaleData.getDays("wide", aCalendarTypes[i]).length, 7, "getDays(\"wide\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDays("short", aCalendarTypes[i]) && oLocaleData.getDays("short", aCalendarTypes[i]).length, 7, "getDays(\"short\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getQuarters("narrow", aCalendarTypes[i]) && oLocaleData.getQuarters("narrow", aCalendarTypes[i]).length, 4, "getQuarters(\"narrow\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getQuarters("abbreviated", aCalendarTypes[i]) && oLocaleData.getQuarters("abbreviated", aCalendarTypes[i]).length, 4, "getQuarters(\"abbreviated\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getQuarters("wide", aCalendarTypes[i]) && oLocaleData.getQuarters("wide", aCalendarTypes[i]).length, 4, "getQuarters(\"wide\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDayPeriods("narrow", aCalendarTypes[i]) && oLocaleData.getDayPeriods("narrow", aCalendarTypes[i]).length, 2, "getDayPeriods(\"narrow\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDayPeriods("abbreviated", aCalendarTypes[i]) && oLocaleData.getDayPeriods("abbreviated", aCalendarTypes[i]).length, 2, "getDayPeriods(\"abbreviated\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(oLocaleData.getDayPeriods("wide", aCalendarTypes[i]) && oLocaleData.getDayPeriods("wide", aCalendarTypes[i]).length, 2, "getDayPeriods(\"wide\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getEras("wide", aCalendarTypes[i]), "object", "getEras(\"wide\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getEras("abbreviated", aCalendarTypes[i]), "object", "getEras(\"abbreviated\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getEras("narrow", aCalendarTypes[i]), "object", "getEras(\"narrow\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("short", aCalendarTypes[i]), "string", "getDatePattern(\"short\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("medium", aCalendarTypes[i]), "string", "getDatePattern(\"medium\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("long", aCalendarTypes[i]), "string", "getDatePattern(\"long\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDatePattern("full", aCalendarTypes[i]), "string", "getDatePattern(\"full\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("short", aCalendarTypes[i]), "string", "getTimePattern(\"short\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("medium", aCalendarTypes[i]), "string", "getTimePattern(\"medium\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("long", aCalendarTypes[i]), "string", "getTimePattern(\"long\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getTimePattern("full", aCalendarTypes[i]), "string", "getTimePattern(\"full\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("short", aCalendarTypes[i]), "string", "getTimePattern(\"short\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("medium", aCalendarTypes[i]), "string", "getTimePattern(\"medium\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("long", aCalendarTypes[i]), "string", "getTimePattern(\"long\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getDateTimePattern("full", aCalendarTypes[i]), "string", "getTimePattern(\"full\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCombinedDateTimePattern("full", "medium", aCalendarTypes[i]), "string", "getTimePattern(\"full\", \"medium\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCombinedDateTimePattern("medium", "short", aCalendarTypes[i]), "string", "getTimePattern(\"medium\", \"short\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("y", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"y\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMd", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMd\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Hms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"Hms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("jms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"jms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Jms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"jms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdd", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMdd\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Hmss", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"Hmss\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMd", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMMd\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMMw", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMMMw\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdHms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMdHms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMdjms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMdjms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"yMMMMEEEEdHms\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("Q", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"Q\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomDateTimePattern("w", aCalendarTypes[i]), "string", "getCustomDateTimePattern(\"w\", \"" + aCalendarTypes[i] + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("My", aCalendarTypes[i])}, Error, "getCustomDateTimePattern(\"My\", \"" + aCalendarTypes[i] + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("yMLd", aCalendarTypes[i])}, Error, "getCustomDateTimePattern(\"yMLd\", \"" + aCalendarTypes[i] + "\")");
			assert.throws(function(){oLocaleData.getCustomDateTimePattern("yMdp", aCalendarTypes[i])}, Error, "getCustomDateTimePattern(\"yMdp\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("y", "y", aCalendarTypes[i]), "string", "getCustomIntervalPattern(\"y\", \"y\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yMd", "y", aCalendarTypes[i]), "string", "getCustomIntervalPattern(\"yMd\", \"y\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yMd", "d", aCalendarTypes[i]), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + aCalendarTypes[i] + "\")");
			assert.ok(Array.isArray(oLocaleData.getCustomIntervalPattern("yMd", "", aCalendarTypes[i])), "getCustomIntervalPattern(\"yMd\", \"\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("yw", "y", aCalendarTypes[i]), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + aCalendarTypes[i] + "\")");
			assert.equal(typeof oLocaleData.getCustomIntervalPattern("Q", "Q", aCalendarTypes[i]), "string", "getCustomIntervalPattern(\"yMd\", \"d\", \"" + aCalendarTypes[i] + "\")");
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
				for (j = -2 ; j <= 2 ; j++) {
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
		}

		assert.equal(typeof oLocaleData.getNumberSymbol("decimal"), "string", "getNumberSymbol(\"decimal\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("group"), "string", "getNumberSymbol(\"group\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("plusSign"), "string", "getNumberSymbol(\"plusSign\")");
		assert.equal(typeof oLocaleData.getNumberSymbol("minusSign"), "string", "getNumberSymbol(\"minusSign\")");
		assert.equal(typeof oLocaleData.getCurrencySpacing(), "object", "getCurrencySpacing()");
		assert.equal(typeof oLocaleData.getCurrencySpacing("after"), "object", "getCurrencySpacing(\"after\")");
		assert.equal(typeof oLocaleData.getFirstDayOfWeek(), "number", "getFirstDayOfWeek()");
		assert.ok(oLocaleData.getFirstDayOfWeek() >= 0 && oLocaleData.getFirstDayOfWeek() <7, "getFirstDayOfWeek()");
		assert.equal(typeof oLocaleData.getWeekendStart(), "number", "getWeekendStart()");
		assert.ok(oLocaleData.getWeekendStart() >= 0 && oLocaleData.getWeekendStart() <7, "getWeekendStart()");
		assert.equal(typeof oLocaleData.getWeekendEnd(), "number", "getWeekendEnd()");
		assert.ok(oLocaleData.getWeekendEnd() >= 0 && oLocaleData.getWeekendEnd() <7, "getWeekendEnd()");
		assert.ok(oLocaleData.getPreferredCalendarType() in CalendarType, "getPreferredCalendar()");
		assert.equal(typeof oLocaleData.getCalendarWeek("wide", 1), "string", "getCalendarWeek wide");
		assert.equal(typeof oLocaleData.getCalendarWeek("narrow", 1), "string", "getCalendarWeek narrow");
		assert.equal(typeof oLocaleData.getPluralCategories(), "object", "getPluralCategories");
		assert.ok(oLocaleData.getPluralCategories().length >= 1, "object", "getPluralCategories contains at least \"other\"");
		assert.equal(typeof oLocaleData.getPluralCategory("0"), "string", "getPluralCategory(\"0\")");
		assert.equal(typeof oLocaleData.getPluralCategory("1"), "string", "getPluralCategory(\"1\")");
		assert.equal(typeof oLocaleData.getPluralCategory("-2.00"), "string", "getPluralCategory(\"-2.00\")");
		assert.equal(typeof oLocaleData.getPluralCategory("123.456"), "string", "getPluralCategory(\"123.456\")");


		// there's no currency symbol defined for EUR and USD in 'es_MX' locale in CLDR data version 26
		if (sLocale !== "xx_XX" /*&& sLocale !== "es_MX"*/) {
			assert.equal(oLocaleData.getCurrencyCodeBySymbol(oLocaleData.getCurrencySymbol("EUR")), "EUR", "Currency Symbol € has currency code EUR");
			assert.equal(oLocaleData.getCurrencyCodeBySymbol(oLocaleData.getCurrencySymbol("USD")), "USD", "Currency Symbol for US Dollar has currency code USD");
		}
	}

	function customTests_ar_SA(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getPreferredCalendarType(), "Islamic", "islamic calendar preferred")
	}

	function customTests_de_AT(assert, oLocaleData) {
		assert.equal(oLocaleData.getMonths("wide")[0], "Jänner", "1st month");
	}

	function customTests_de_DE(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getDateTimePattern("long"), "{1} 'um' {0}", "datetime pattern \"long\"");
		assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "dd.MM.y, HH:mm", "datetime pattern \"medium\", \"short\"");
		assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short", "Japanese"), "dd.MM.y G, HH:mm", "datetime pattern \"medium\", \"short\", \"Japanese\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y", "datetime format \"yMMd\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('Woche': w)", "datetime format \"yMMMw\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "d.M.y, HH:mm:ss", "datetime format \"yMdHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d. MMMM y 'um' HH:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE, d. MMMM y 'um' HH:mm:ss", "datetime format \"yMMMMdEEEEJms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('Tag': d), HH 'Uhr' ('Sekunde': s)", "datetime format \"ydHs\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("km"), "HH:mm", "datetime format \"km\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("Km"), "h:mm a", "datetime format \"Km\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "HH:mm:ss", "datetime format \"jms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "HH:mm:ss", "datetime format \"Jms\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y–y", "interval format \"y\", \"y\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd.MM.y – dd.MM.y", "interval format \"yMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "d.M.y, HH:mm–HH:mm 'Uhr'", "interval format \"yMdjm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d.–d. MMM", "interval format \"MMMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd.–dd. MMM", "interval format \"MMMdd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm–HH:mm 'Uhr'", "interval format \"Hm\", \"H\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm–HH:mm 'Uhr'", "interval format \"jm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yw", "y"), "'Woche' w 'des' 'Jahres' Y – 'Woche' w 'des' 'Jahres' Y", "interval format \"yw\", \"y\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("Q", "Q"), "Q – Q", "interval format \"Q\", \"Q\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y–y", "interval format \"y\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd.MM.y – dd.MM.y", "interval format \"yMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "d.M.y, HH:mm–HH:mm 'Uhr'", "interval format \"yMdjm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d.–d. MMM", "interval format \"MMMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd.–dd. MMM", "interval format \"MMMdd\", { Day: true}");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm–HH:mm 'Uhr'", "interval format \"Hm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm–HH:mm 'Uhr'", "interval format \"jm\", { Hour: true}");
		assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Year: true }), "'Woche' w 'des' 'Jahres' Y – 'Woche' w 'des' 'Jahres' Y", "interval format \"yw\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Week: true, Day: true }), "'Woche' w 'des' 'Jahres' Y – 'Woche' w 'des' 'Jahres' Y", "interval format \"yw\", { Week: true, Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yw", { Day: true }), "'Woche' w 'des' 'Jahres' Y", "interval format \"yw\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("Q", { Quarter: true }), "Q – Q", "interval format \"Q\", { Quarter: true }");
		// skeleton "yMMdd" has pattern "dd.MM.y" and
		// skeleton "yMMMd" has pattern "d. MMM y"
		// "yMMMMdd"'s best match is "yMMMd" since both "month" and "day" have the same representation category
		// and both should be expanded which results in "dd. MMMM y"
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMdd"), "dd. MMMM y", "datetime format 'yMMMMdd'");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
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
		assert.equal(oLocaleData.getPreferredCalendarType(), "Gregorian", "gregorian calendar preferred")
	}

	function customTests_de_XX(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getDateTimePattern("long"), "{1} 'um' {0}", "datetime pattern \"long\"");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), ".", "group separator");
	}

	function customTests_en_GB(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getDateTimePattern("long"), "{1} 'at' {0}", "datetime pattern \"long\"");
		assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d MMM y, HH:mm", "datetime pattern \"medium\", \"short\"");
		assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short", "Japanese"), "MMM d, y G, HH:mm", "datetime pattern \"medium\", \"short\", \"Japanese\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd/MM/y", "datetime format \"yMMd\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('week': w)", "datetime format \"yMMMw\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd/MM/y, HH:mm:ss", "datetime format \"yMdHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d MMMM y 'at' HH:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE, d MMMM y 'at' HH:mm:ss", "datetime format \"yMMMMdEEEEJms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('day': d), HH ('second': s)", "datetime format \"ydHs\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("km"), "HH:mm", "datetime format \"km\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("Km"), "h:mm a", "datetime format \"Km\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "HH:mm:ss", "datetime format \"jms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "HH:mm:ss", "datetime format \"Jms\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y–y", "interval format \"y\", \"y\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd/MM/y – dd/MM/y", "interval format \"yMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "dd/MM/y, HH:mm–HH:mm", "interval format \"yMdjm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d–d MMM", "interval format \"MMMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd–dd MMM", "interval format \"MMMdd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "HH:mm–HH:mm", "interval format \"Hm\", \"H\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "HH:mm–HH:mm", "interval format \"jm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", "a"), "h:mm a – h:mm a", "interval format \"hm\", \"a\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", "h"), "h:mm – h:mm a", "interval format \"hm\", \"h\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", "H"), "h:mm a – h:mm a", "interval format \"hm\", \"h\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", "j"), "h:mm a – h:mm a", "interval format \"hm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "a"), "HH:mm – HH:mm", "interval format \"Hm\", \"a\"");
		// if the diff field is smaller than the fields in skeleton format, create custom format for a single date
		assert.equal(oLocaleData.getCustomIntervalPattern("yMMM", "d"), "MMM y", "interval format \"yMMM\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "s"), "dd/MM/y, HH:mm", "interval format \"yMdjm\", \"s\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y–y", "interval format \"y\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd/MM/y – dd/MM/y", "interval format \"yMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "dd/MM/y, HH:mm–HH:mm", "interval format \"yMdjm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d–d MMM", "interval format \"MMMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd–dd MMM", "interval format \"MMMdd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "HH:mm–HH:mm", "interval format \"Hm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "HH:mm–HH:mm", "interval format \"jm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", { DayPeriod: true, Hour: true }), "h:mm a – h:mm a", "interval format \"hm\", { DayPeriod: true, Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", { Hour: true }), "h:mm – h:mm a", "interval format \"hm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("hm", { Year: true }), "h:mm a", "interval format \"hm\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { DayPeriod: true, Hour: true }), "HH:mm–HH:mm", "interval format \"Hm\", { DayPeriod: true, Hour: true }");
		// if the diff field is smaller than the fields in skeleton format, create custom format for a single date
		assert.equal(oLocaleData.getCustomIntervalPattern("yMMM", { Day: true }), "MMM y", "interval format \"yMMM\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Second: true }), "dd/MM/y, HH:mm", "interval format \"yMdjm\", { Second: true }");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ".", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), ",", "group separator");
		assert.equal(oLocaleData.getFirstDayOfWeek(), 1, "first day of week"); // TODO decide 0 or 1
		assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
		assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
		assert.equal(oLocaleData.getEras("abbreviated")[1], "AD", "Abbreviated Era Name");
		assert.equal(oLocaleData.getEras("abbreviated")[0], "BC", "Abbreviated Era Name");
	}

	function customTests_en_ZA(assert, oLocaleData) {
		assert.equal(oLocaleData.getDatePattern("medium"), "dd MMM y", "date pattern \"medium\"");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), "\xa0", "group separator");
	}

	function customTests_en_US(assert, oLocaleData) {
		assert.equal(oLocaleData.getDayPeriods("abbreviated")[0], "AM", "day periods \"abbreviated\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("jms"), "h:mm:ss a", "datetime format \"jms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("Jms"), "h:mm:ss", "datetime format \"Jms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdjms"), "EEEE, MMMM d, y 'at' h:mm:ss a", "datetime format \"yMMMMdEEEEjms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdJms"), "EEEE, MMMM d, y 'at' h:mm:ss", "datetime format \"yMMMMdEEEEJms\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "h:mm – h:mm a", "interval format \"jm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "h:mm – h:mm a", "interval format \"jm\", { Hour: true }");
	}

	function customTests_he_IL(assert, oLocaleData) {
		assert.equal(oLocaleData.getOrientation(), "right-to-left", "orientation");
	}

	function customTests_fa_IR(assert, oLocaleData) {
		assert.equal(oLocaleData.getPreferredCalendarType(), "Persian", "persian calendar preferred")
	}

	function customTests_fr_FR(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getDateTimePattern("long"), "{1} 'à' {0}", "datetime pattern \"long\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y G", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd/MM/y", "datetime format \"yMMd\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "MMM y ('semaine': w)", "datetime format \"yMMMw\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd/MM/y HH:mm:ss", "datetime format \"yMdHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE d MMMM y 'à' HH:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('jour': d) HH 'h' ('seconde': s)", "datetime format \"ydHs\"");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), "\xa0", "group separator");
	}

	function customTests_ja_JP(assert, oLocaleData) {
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
		assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y年～y年", "interval format \"y\", \"y\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "y/MM/dd～y/MM/dd", "interval format \"yMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "M月d日～d日", "interval format \"MMMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y年～y年", "interval format \"y\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "y/MM/dd～y/MM/dd", "interval format \"yMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "M月d日～d日", "interval format \"MMMd\", { Day: true }");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ".", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), ",", "group separator");
		assert.ok(oLocaleData.getCalendarWeek("wide", 0).toLowerCase().indexOf("week") === -1, "calendar week should be translated");
	}

	function customTests_nl_BE(assert, oLocaleData) {
		assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y", "date pattern \"medium\"");
	}

	function customTests_ru_RU(assert, oLocaleData) {
		assert.equal(oLocaleData.getOrientation(), "left-to-right", "orientation");
		assert.equal(oLocaleData.getLanguages()["de"], "немецкий", "language");
		assert.equal(oLocaleData.getScripts()["Latn"], "латиница", "scripts");
		assert.equal(oLocaleData.getTerritories()["DE"], "Германия", "territories");
		assert.equal(oLocaleData.getMonths("wide")[0], "января", "1st month");
		assert.equal(oLocaleData.getMonths("abbreviated")[0], "янв.", "1st month abbreviated");
		assert.equal(oLocaleData.getMonths("narrow")[0], "Я", "1st month narrow");
		assert.equal(oLocaleData.getDays("wide")[0], "воскресенье", "1st day");
		assert.equal(oLocaleData.getDays("abbreviated")[0], "вс", "1st day abbreviated");
		assert.equal(oLocaleData.getDays("narrow")[0], "вс", "1st day narrow");
		assert.equal(oLocaleData.getDays("short")[0], "вс", "1st day short");
		assert.equal(oLocaleData.getDatePattern("medium"), "d MMM y 'г'.", "date pattern \"medium\"");
		assert.equal(oLocaleData.getTimePattern("medium"), "H:mm:ss", "time pattern \"medium\"");
		assert.equal(oLocaleData.getDateTimePattern("long"), "{1}, {0}", "datetime pattern \"long\"");
		assert.equal(oLocaleData.getCombinedDateTimePattern("medium", "short"), "d MMM y 'г'., H:mm", "datetime pattern \"medium\", \"short\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y"), "y", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("y", "Japanese"), "y 'г'. G", "datetime format \"y\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMd"), "dd.MM.y", "datetime format \"yMMd\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMw"), "LLL y 'г'. ('неделя': w)", "datetime format \"yMMMw\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMdHms"), "dd.MM.y, H:mm:ss", "datetime format \"yMdHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("yMMMMEEEEdHms"), "EEEE, d MMMM y 'г'., H:mm:ss", "datetime format \"yMMMMdEEEEHms\"");
		assert.equal(oLocaleData.getCustomDateTimePattern("ydHs"), "y ('день': d), H ('секунда': s)", "datetime format \"ydHs\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", "y"), "y–y", "interval format \"y\", \"y\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", "d"), "dd.MM.y – dd.MM.y", "interval format \"yMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", "j"), "dd.MM.y, H:mm–H:mm", "interval format \"yMdjm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", "d"), "d–d MMM", "interval format \"MMMd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", "d"), "dd–dd MMM", "interval format \"MMMdd\", \"d\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", "H"), "H:mm–H:mm", "interval format \"Hm\", \"H\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", "j"), "H:mm–H:mm", "interval format \"jm\", \"j\"");
		assert.equal(oLocaleData.getCustomIntervalPattern("y", { Year: true }), "y–y", "interval format \"y\", { Year: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMd", { Day: true }), "dd.MM.y – dd.MM.y", "interval format \"yMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("yMdjm", { Hour: true }), "dd.MM.y, H:mm–H:mm", "interval format \"yMdjm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMd", { Day: true }), "d–d MMM", "interval format \"MMMd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("MMMdd", { Day: true }), "dd–dd MMM", "interval format \"MMMdd\", { Day: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("Hm", { Hour: true }), "H:mm–H:mm", "interval format \"Hm\", { Hour: true }");
		assert.equal(oLocaleData.getCustomIntervalPattern("jm", { Hour: true }), "H:mm–H:mm", "interval format \"jm\", { Hour: true }");
		assert.equal(oLocaleData.getNumberSymbol("decimal"), ",", "decimal separator");
		assert.equal(oLocaleData.getNumberSymbol("group"), "\xa0", "group separator");
		assert.equal(oLocaleData.getPluralCategories().length, 4, "four plural forms");
		assert.equal(oLocaleData.getPluralCategories()[0], "one", "special plural form for one");
		assert.equal(oLocaleData.getPluralCategory("0"), "many", "plural category many for 0");
		assert.equal(oLocaleData.getPluralCategory("1"), "one", "plural category one for 1");
		assert.equal(oLocaleData.getPluralCategory("2.0"), "other", "plural category other for 2.0");
		assert.equal(oLocaleData.getPluralCategory("4"), "few", "plural category few for 4");
		assert.equal(oLocaleData.getPluralCategory("10"), "many", "plural category many for 10");
		assert.equal(oLocaleData.getPluralCategory("101"), "one", "plural category one for 101");
	}

	function customTests_pt_BR(assert, oLocaleData) {
		assert.equal(oLocaleData.getFirstDayOfWeek(), 0, "first day of week");
		assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
		assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
	}

	function customTests_pt_PT(assert, oLocaleData) {
		assert.equal(oLocaleData.getFirstDayOfWeek(), 1, "first day of week");
		assert.equal(oLocaleData.getWeekendStart(), 6, "weekend start");
		assert.equal(oLocaleData.getWeekendEnd(), 0, "weekend end");
	}

	function customTests_th_TH(assert, oLocaleData) {
		assert.equal(oLocaleData.getPreferredCalendarType(), "Buddhist", "buddhist calendar preferred")
	}

	QUnit.module("Locale data types", {
		beforeEach: function(assert) {

			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}, afterEach: function(assert) {
			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}
	});

	QUnit.test("Currency digits", function(assert) {
		var oLocaleData = LocaleData.getInstance(new sap.ui.core.Locale("en_US"));
		assert.equal(oLocaleData.getCurrencyDigits("USD"), 2, "2 digits fuer USD");
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "2 digits fuer EUR");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "0 digits fuer JPY");
		assert.equal(oLocaleData.getCurrencyDigits("BHD"), 3, "3 digits fuer BHD");

		// CZK, CRC, SEK and NOK are explicitly tested
		// For these currencies the cash digits in the CLDR differ from the standard digits in CLDR,
		// as well as SAP's TCURX
		assert.equal(oLocaleData.getCurrencyDigits("CZK"), 2, "2 digits fuer CZK");
		assert.equal(oLocaleData.getCurrencyDigits("CRC"), 2, "2 digits fuer CRC");
		assert.equal(oLocaleData.getCurrencyDigits("SEK"), 2, "2 digits fuer SEK");
		assert.equal(oLocaleData.getCurrencyDigits("NOK"), 2, "2 digits fuer NOK");

		// HUF and TWD are explicitly set to 0 digits
		assert.equal(oLocaleData.getCurrencyDigits("HUF"), 0, "0 digits fuer HUF");
		assert.equal(oLocaleData.getCurrencyDigits("TWD"), 0, "0 digits fuer TWD");
	});

	QUnit.test("Calendar type should use the value set in configuration when getting calendar related values", function(assert) {
		sap.ui.getCore().getConfiguration().setCalendarType(CalendarType.Islamic);

		var oLocaleData = LocaleData.getInstance(new sap.ui.core.Locale("en_US"));

		assert.deepEqual(oLocaleData.getMonths("narrow"), oLocaleData.getMonths("narrow", CalendarType.Islamic), "getMonths uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDays("narrow"), oLocaleData.getDays("narrow", CalendarType.Islamic), "getDays uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getQuarters("narrow"), oLocaleData.getQuarters("narrow", CalendarType.Islamic), "getQuarters uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDayPeriods("narrow"), oLocaleData.getDayPeriods("narrow", CalendarType.Islamic), "getDayPeriods uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDatePattern("short"), oLocaleData.getDatePattern("short", CalendarType.Islamic), "getDatePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getTimePattern("short"), oLocaleData.getTimePattern("short", CalendarType.Islamic), "getTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getDateTimePattern("short"), oLocaleData.getDateTimePattern("short", CalendarType.Islamic), "getDateTimePattern uses calendar type in configuration");
		assert.deepEqual(oLocaleData.getEras("narrow"), oLocaleData.getEras("narrow", CalendarType.Islamic), "getEra uses calendar type in configuration");

		sap.ui.getCore().getConfiguration().setCalendarType(null);
	});

	QUnit.test("Locale data with customization from format settings in configuration", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		oFormatSettings.setLegacyDateFormat("3");
		var oLocaleData = LocaleData.getInstance(oFormatSettings.getFormatLocale());
		assert.equal(oLocaleData.getDatePattern("short"), "MM-dd-yyyy", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "MM-dd-yyyy", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Islamic), "M/d/y GGGGG", "short pattern for Islamic calendar type should be fetched from locale data");

		oFormatSettings.setLegacyTimeFormat("0");
		assert.equal(oLocaleData.getTimePattern("short"), "HH:mm", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("medium"), "HH:mm:ss", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getTimePattern("short", CalendarType.Islamic), "h:mm a", "short pattern for Islamic calendar type should be fetched from locale data");

		oFormatSettings.setLegacyDateFormat("A");
		assert.equal(oLocaleData.getDatePattern("short"), "yyyy/MM/dd", "short pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("medium"), "yyyy/MM/dd", "medium pattern should be the one defined in format settings");
		assert.equal(oLocaleData.getDatePattern("short", CalendarType.Gregorian), "M/d/yy", "short pattern for Gregorian calendar type should be fetched from locale data");
	});

	QUnit.test("Unit Display Name L10N", function(assert) {
		var oLocale = new Locale("de_DE");
		var oLocaleData = new LocaleData(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "Std.", "display name 'Std.' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "Gramm", "display name 'Gramm' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "Lux", "display name 'Lux' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "Lichtjahre", "display name 'Lichtjahre' is correct");
		// unknown code
		assert.equal(oLocaleData.getUnitDisplayName("foobar"), "", "display name 'foobar' is correct");

		oLocale = new Locale("es_ES");
		oLocaleData = new LocaleData(oLocale);

		assert.equal(oLocaleData.getUnitDisplayName("duration-hour"), "horas", "display name 'horas' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("mass-gram"), "g", "display name 'g' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("light-lux"), "lx", "display name 'lx' is correct");
		assert.equal(oLocaleData.getUnitDisplayName("length-light-year"), "a. l.", "display name 'a. l.' is correct");
	});

	QUnit.test("CustomLocaleData with getUnitFormats", function(assert) {
		var oLocaleData = LocaleData.getInstance(new Locale("en_US-x-sapufmt"));

		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		oFormatSettings.setCustomUnits({
			"cats": {
				"displayName": "kittens",
				"unitPattern-count-one": "{0} kitten",
				"unitPattern-count-other": "{0} kittens"
			}
		});

		oFormatSettings.setUnitMappings({
			"CAT": "cats"
		});

		assert.equal(oLocaleData.getUnitDisplayName("cats"), "kittens");
		assert.equal(oLocaleData.getUnitDisplayName("length-meter"), "m");
		assert.equal(oLocaleData.getUnitDisplayName("CAT"), "", "not found");

		// what format does
		assert.equal(oLocaleData.getUnitFormat("cats").displayName, "kittens", "name is shown");
		assert.equal(oLocaleData.getUnitFormat("length-meter").displayName, "m", "name is shown");
		assert.notOk(oLocaleData.getUnitFormat("CAT"), "not found as it does not take mapping into consideration");
		assert.equal(oLocaleData.getUnitFromMapping("CAT"), "cats", "cats is the respective mapping");
		assert.equal(oLocaleData.getResolvedUnitFormat("CAT").displayName, "kittens", "kittens is the displayName");

		//reset unit mappings
		oFormatSettings.setUnitMappings();
	});

	QUnit.test("Unit Mappings", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		var mUnitMappings = {
			"CAT": "cats",
			"KIT": "cats",
			"TAS": "volume-cups"
		};
		oFormatSettings.setUnitMappings(mUnitMappings);
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");

		// set to undefined
		oFormatSettings.setUnitMappings();
		assert.deepEqual(oFormatSettings.getUnitMappings(), undefined, "units must be undefined");


		oFormatSettings.addUnitMappings(mUnitMappings);
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");

		oFormatSettings.addUnitMappings(null);
		oFormatSettings.addUnitMappings(undefined);
		oFormatSettings.addUnitMappings();
		oFormatSettings.addUnitMappings({});

		//add should not delete mappings
		assert.deepEqual(oFormatSettings.getUnitMappings(), mUnitMappings, "units must be all specified");
		assert.equal(oFormatSettings.getUnitMappings()["CAT"], "cats", "unit mapping is initially defined");

		mUnitMappings = {
			"CAT": "volume-cups",
			"KIT": "cats",
			"RAT": "volume-rat"
		};
		oFormatSettings.addUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(oFormatSettings.getUnitMappings()), ["CAT", "KIT", "TAS", "RAT"], "unit mappings must be all specified");
		assert.equal(oFormatSettings.getUnitMappings()["CAT"], "volume-cups", "unit mappings was overwritten");

		oFormatSettings.setUnitMappings(mUnitMappings);
		assert.deepEqual(Object.keys(oFormatSettings.getUnitMappings()), ["CAT", "KIT", "RAT"], "unit mappings must be all specified");
	});

	QUnit.test("Custom Units get/set/add", function(assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

		var mUnits = {
			"cats": {
				"displayName": "kittens",
				"unitPattern-count-one": "{0} kitten",
				"unitPattern-count-other": "{0} kittens"
			},
			"dogs": {
				"displayName": "puppies",
				"unitPattern-count-one": "{0} puppy",
				"unitPattern-count-other": "{0} puppies"
			}
		};
		oFormatSettings.setCustomUnits(mUnits);

		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");


		// set to undefined
		oFormatSettings.setCustomUnits();
		assert.deepEqual(oFormatSettings.getCustomUnits(), undefined, "units must be all specified");


		oFormatSettings.addCustomUnits(mUnits);
		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");

		mUnits = {
			"cats": {
				"displayName": "kitties",
				"unitPattern-count-one": "{0} kitty",
				"unitPattern-count-other": "{0} kitties"
			},
			"dogs": {
				"displayName": "puppets",
				"unitPattern-count-one": "{0} puppy",
				"unitPattern-count-other": "{0} puppies"
			}
		};

		oFormatSettings.addCustomUnits(mUnits);
		assert.deepEqual(oFormatSettings.getCustomUnits(), mUnits, "units must be all specified");


		oFormatSettings.addCustomUnits({
			"birds": {
				"displayName": "birds",
				"unitPattern-count-one": "{0} bird",
				"unitPattern-count-other": "{0} birds"
			}
		});
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.addCustomUnits({});
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.addCustomUnits();
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs", "birds"], "units must be all specified");

		oFormatSettings.setCustomUnits(mUnits);
		assert.deepEqual(Object.keys(oFormatSettings.getCustomUnits()), ["cats", "dogs"], "units must be all specified");
	});

	var aDeprecatedLocales = [
		"in", // -> id
		"sh", // -> sr
		//"ji" -> yi not present
		"iw" // -> he
	];

	QUnit.test("Deprecated locales support", function(assert) {
		aDeprecatedLocales.forEach(function(sLocale) {
			var oLocale = new Locale(sLocale),
				oLocaleData = new LocaleData(oLocale);
			//check retrieval of languages to see if the localeData was successfully loaded
			assert.ok(Object.keys(oLocaleData.getLanguages()).length > 0, "languages are present for locale: " + sLocale);
		});
	});

	QUnit.test("Currency Digits", function(assert) {

		var oLocaleData = LocaleData.getInstance(
			sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
		);

		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");


		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({"EUR": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({"JPY": {"digits": 3}});
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 3, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 3, "number of digits for Japanese Yen");

		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		assert.equal(oLocaleData.getCurrencyDigits("EUR"), 2, "number of digits for Euro");
		assert.equal(oLocaleData.getCurrencyDigits("JPY"), 0, "number of digits for Japanese Yen");
	});
});
