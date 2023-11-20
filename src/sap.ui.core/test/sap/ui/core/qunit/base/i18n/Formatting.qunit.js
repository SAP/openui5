/* global QUnit, sinon */
sap.ui.define([
	"sap/base/config",
	"sap/base/Log",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/date/CalendarType",
	"sap/base/i18n/date/CalendarWeekNumbering",
	"sap/ui/base/config/URLConfigurationProvider"
], function(
	BaseConfig,
	Log,
	LanguageTag,
	Formatting,
	CalendarType,
	CalendarWeekNumbering,
	URLConfigurationProvider
) {
	"use strict";

	var oSinonSandbox,
		oURLConfigurationProviderStub,
		mConfigStubValues;

	// Tests within modules are independent but getter test should run first
	// in order to ensure empty writable config
	QUnit.config.reorder = false;

	QUnit.module("Formatting getter", {
		beforeEach: function() {
			mConfigStubValues = {};
			oSinonSandbox = sinon.createSandbox();
			oURLConfigurationProviderStub = oSinonSandbox.stub(URLConfigurationProvider, "get").callsFake(function(sKey) {
				return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
		},
		afterEach: function() {
			oSinonSandbox.restore();
		}
	});

	QUnit.test("getLanguageTag", function(assert) {
		assert.expect(4);
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapLanguage": "en"
		};
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("en"),
			"getLanguageTag should return new 'sap/base/i18n/LanguageTag' derived from Localization.getLanguageTag in case no LanguageTag is set");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiFormatLocale": "de"
		};
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("de"),
			"getLanguageTag should return new 'sap/base/i18n/LanguageTag' for LanguageTag 'de'");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapLanguage": "de",
			"sapUiCalendarWeekNumbering": CalendarWeekNumbering.ISO_8601
		};
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("de-x-sapufmt"),
			"getLanguageTag should return new 'sap/base/i18n/LanguageTag' for LanguageTag 'de-x-sapufmt'");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapLanguage": "de-x-aa",
			"sapUiCalendarWeekNumbering": CalendarWeekNumbering.ISO_8601
		};
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("de-x-aa-sapufmt"),
			"getLanguageTag should return new 'sap/base/i18n/LanguageTag' for LanguageTag 'de-x-aa-sapufmt'");
	});

	QUnit.test("getABAPDateFormat", function(assert) {
		assert.expect(2);
		assert.strictEqual(Formatting.getABAPDateFormat(), "2", "getABAPDateFormat should return '2' as provided by URL");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiABAPDateFormat": "a"
		};
		assert.strictEqual(Formatting.getABAPDateFormat(), "A", "getABAPDateFormat should return expected value 'A'");
	});

	QUnit.test("getABAPTimeFormat", function(assert) {
		assert.expect(2);

		assert.strictEqual(Formatting.getABAPTimeFormat(), "3", "getABAPTimeFormat should return '3' as provided by URL");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiABAPTimeFormat": "0"
		};
		assert.strictEqual(Formatting.getABAPTimeFormat(), "0", "getABAPTimeFormat should return expected value '0'");
	});

	QUnit.test("getABAPNumberFormat", function(assert) {
		assert.expect(2);

		assert.strictEqual(Formatting.getABAPNumberFormat(), "X", "getABAPNumberFormat should return 'Y' as provided by URL");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiABAPNumberFormat": "y"
		};
		assert.strictEqual(Formatting.getABAPNumberFormat(), "Y", "getABAPNumberFormat should return expected value 'Y'");
	});

	QUnit.test("getTrailingCurrencyCode", function(assert) {
		assert.expect(2);

		assert.strictEqual(Formatting.getTrailingCurrencyCode(), true, "getTrailingCurrencyCode should return 'true' in case no trailingCurrencyCode was provided");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiTrailingCurrencyCode": false
		};
		assert.strictEqual(Formatting.getTrailingCurrencyCode(), false, "getTrailingCurrencyCode should return expected value 'false'");
	});

	QUnit.test("getCalendarWeekNumbering", function(assert) {
		assert.expect(3);

		assert.strictEqual(Formatting.getCalendarWeekNumbering(), CalendarWeekNumbering.Default, "getCalendarWeekNumbering should return default 'Default' in case no calendarWeekNumbering was provided");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiCalendarWeekNumbering": CalendarWeekNumbering.MiddleEastern
		};
		assert.strictEqual(Formatting.getCalendarWeekNumbering(), CalendarWeekNumbering.MiddleEastern, "getCalendarWeekNumbering should return expected value 'MiddleEastern'");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiCalendarWeekNumbering": "invalidCalendarWeekNumbering"
		};
		assert.strictEqual(Formatting.getCalendarWeekNumbering(), CalendarWeekNumbering.Default, "getCalendarWeekNumbering should return value 'Default' for invalid calendarWeekNumbering");
	});

	QUnit.test("getCalendarType", function(assert) {
		assert.expect(5);
		oSinonSandbox.spy(Log, "warning");

		assert.strictEqual(Formatting.getCalendarType(), CalendarType.Gregorian, "getCalendarType should return default 'Gregorian' in case no calendarType was provided");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiCalendarType": CalendarType.Japanese
		};
		assert.strictEqual(Formatting.getCalendarType(), CalendarType.Japanese, "getCalendarType should return expected value 'Japanese'");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiCalendarType": "invalidCalendarType"
		};
		assert.strictEqual(Formatting.getCalendarType(), CalendarType.Gregorian, "getCalendarType should return value 'Gregorian' for invalid calendarType");
		assert.ok(Log.warning.calledOnceWithExactly("Parameter 'calendarType' is set to invalidCalendarType which" +
			" isn't a valid value and therefore ignored. The calendar type is determined from format setting and current locale"),
			"Warning logged for invalid value of parameter 'calendarType'");
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiABAPDateFormat": "a"
		};
		assert.strictEqual(Formatting.getCalendarType(), CalendarType.Islamic, "getCalendarType should return expected value 'Islamic' derived from ABAPDateFormat");
	});

	QUnit.module("Formatting setter");

	QUnit.test("setLanguageTag", function(assert) {
		assert.expect(2);

		function formattingChanged(oEvent) {
			assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("fr"),
				"getLanguageTag should return new 'sap/base/i18n/LanguageTag' for LanguageTag 'fr'");
			assert.strictEqual(oEvent.languageTag, "fr", "Change event should contain the correct language 'fr'");
		}

		Formatting.attachChange(formattingChanged);
		Formatting.setLanguageTag("fr");
		// Setting same locale again shouldn't trigger a change event
		Formatting.setLanguageTag("fr");

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("setABAPDateFormat", function(assert) {
		assert.expect(6);
		function test(oEvent) {
			assert.strictEqual(oEvent["dateFormats-medium"], "yyyy/MM/dd", "dateFormat event parameter set correctly");
			assert.strictEqual(oEvent["dateFormats-short"], "yyyy/MM/dd", "dateFormat event parameter set correctly");
			assert.strictEqual(oEvent["ABAPDateFormat"], "B", "dateFormat event parameter set correctly");
			assert.strictEqual(Formatting.getABAPDateFormat(), "B", "getABAPDateFormat should return expected value 'B'");
			assert.strictEqual(Formatting.getDatePattern("short"), "yyyy/MM/dd", "getDatePattern('short') should return expected value 'yyyy/MM/dd'");
			assert.strictEqual(Formatting.getDatePattern("medium"), "yyyy/MM/dd", "getDatePattern('medium') should return expected value 'yyyy/MM/dd'");
		}
		Formatting.attachChange(test);
		Formatting.setABAPDateFormat("b");
		// Setting same format again shouldn't trigger a change event
		Formatting.setABAPDateFormat("b");
		Formatting.detachChange(test);
	});

	QUnit.test("setABAPTimeFormat", function(assert) {
		assert.expect(7);
		function test(oEvent) {
			assert.strictEqual(oEvent["timeFormats-medium"], "KK:mm:ss a", "timeFormat event parameter set correctly");
			assert.strictEqual(oEvent["timeFormats-short"], "KK:mm a", "timeFormat event parameter set correctly");
			assert.strictEqual(oEvent["ABAPTimeFormat"], "4", "timeFormat event parameter set correctly");
			assert.deepEqual(oEvent["dayPeriods-format-abbreviated"], ["am", "pm"], "timeFormat event parameter set correctly");
			assert.strictEqual(Formatting.getABAPTimeFormat(), "4", "getABAPTimeFormat should return expected value 'B'");
			assert.strictEqual(Formatting.getTimePattern("short"), "KK:mm a", "getTimePattern('short') should return expected value 'KK:mm a'");
			assert.strictEqual(Formatting.getTimePattern("medium"), "KK:mm:ss a", "getTimePattern('medium') should return expected value 'KK:mm:ss a'");
		}
		Formatting.attachChange(test);
		Formatting.setABAPTimeFormat("4");
		// Setting same format again shouldn't trigger a change event
		Formatting.setABAPTimeFormat("4");
		Formatting.detachChange(test);
	});

	QUnit.test("setABAPNumberFormat", function(assert) {
		assert.expect(6);
		function test(oEvent) {
			assert.strictEqual(oEvent["symbols-latn-decimal"], ",", "numberFormat event parameter set correctly");
			assert.strictEqual(oEvent["symbols-latn-group"], " ", "numberFormat event parameter set correctly");
			assert.strictEqual(oEvent["ABAPNumberFormat"], "Y", "numberFormat event parameter set correctly");
			assert.strictEqual(Formatting.getABAPNumberFormat(), "Y", "getABAPNumberFormat should return expected value 'Y'");
			assert.strictEqual(Formatting.getNumberSymbol("group"), " ", "getNumberSymbol('group') should return expected value ' '");
			assert.strictEqual(Formatting.getNumberSymbol("decimal"), ",", "getNumberSymbol('decimal') should return expected value ','");
		}
		Formatting.attachChange(test);
		Formatting.setABAPNumberFormat("y");
		// Setting same type again shouldn't trigger a change event
		Formatting.setABAPNumberFormat("y");
		Formatting.detachChange(test);
	});

	QUnit.test("setTrailingCurrencyCode", function(assert) {
		assert.expect(2);

		Formatting.setTrailingCurrencyCode(false);
		assert.strictEqual(Formatting.getTrailingCurrencyCode(), false, "getTrailingCurrencyCode should return expected value 'false'");

		assert.throws(function() {
			Formatting.setTrailingCurrencyCode();
		}, new TypeError("bTrailingCurrencyCode must be a boolean"), "setTrailingCurrencyCode with invalid parameter should throw an error");
	});

	QUnit.test("setCalendarWeekNumbering", function(assert) {
		assert.expect(3);

		function formattingChanged(oEvent) {
			assert.strictEqual(Formatting.getCalendarWeekNumbering(), CalendarWeekNumbering.ISO_8601, "getCalendarWeekNumbering should return expected value 'ISO_8601'");
			assert.strictEqual(oEvent.calendarWeekNumbering, CalendarWeekNumbering.ISO_8601, "Change event should contain the correct calendarWeekNumbering 'ISO_8601");
		}
		Formatting.attachChange(formattingChanged);

		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);
		// Setting same locale again shouldn't trigger a change event
		Formatting.setCalendarWeekNumbering(CalendarWeekNumbering.ISO_8601);

		assert.throws(function() {
			Formatting.setCalendarWeekNumbering("invalidCalendarWeekNumbering");
		}, "setTrailingCurrencyCode without invalid parameter should throw an error");

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("setCalendarType", function(assert) {
		assert.expect(4);
		var sExpectedCalendarType = CalendarType.Japanese;

		function formattingChanged(oEvent) {
			assert.strictEqual(Formatting.getCalendarType(), sExpectedCalendarType, "getCalendarType should return expected value '" + sExpectedCalendarType + "'");
			assert.strictEqual(oEvent.calendarType, sExpectedCalendarType, "Change event should contain the correct calendarType '" + sExpectedCalendarType + "'");
		}
		Formatting.attachChange(formattingChanged);

		Formatting.setCalendarType(CalendarType.Japanese);
		// Setting same locale again shouldn't trigger a change event
		Formatting.setCalendarType(CalendarType.Japanese);

		sExpectedCalendarType = CalendarType.Islamic;
		Formatting.setCalendarType("invalidCalendarType");

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("CustomIslamicCalendarData", function(assert) {
		var aData = [{
			"dateFormat": "A",
			"islamicMonthStart": "14351201",
			"gregDate": "20140925"
		}, {
			"dateFormat": "A",
			"islamicMonthStart": "14360101",
			"gregDate": "20141024"
		}, {
			"dateFormat": "A",
			"islamicMonthStart": "14360201",
			"gregDate": "20141123"
		}];

		Formatting.setCustomIslamicCalendarData(aData);
		assert.deepEqual(Formatting.getCustomIslamicCalendarData(), aData, "The customizing data set can be retrieved");
	});
});