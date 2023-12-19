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
			BaseConfig._.invalidate();
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
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("en-x-sapufmt"),
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
		assert.expect(4);
		assert.strictEqual(Formatting.getABAPDateFormat(), "2", "getABAPDateFormat should return '2' as provided by URL");
		assert.strictEqual(Formatting.getDatePattern("short"), "MM/dd/yyyy", "getDatePattern('short') should return expected value 'MM/dd/yyyy'");
		assert.strictEqual(Formatting.getDatePattern("medium"), "MM/dd/yyyy", "getDatePattern('medium') should return expected value 'MM/dd/yyyy'");
		assert.strictEqual(Formatting.getCalendarType(), CalendarType.Gregorian, "getCalendarType should return expected value 'Gregorian' derived from ABAPDateFormat");
	});

	QUnit.test("getABAPTimeFormat", function(assert) {
		assert.expect(3);

		assert.strictEqual(Formatting.getABAPTimeFormat(), "3", "getABAPTimeFormat should return '3' as provided by URL");
		assert.strictEqual(Formatting.getTimePattern("short"), "KK:mm a", "getTimePattern('short') should return expected value 'KK:mm a'");
		assert.strictEqual(Formatting.getTimePattern("medium"), "KK:mm:ss a", "getTimePattern('medium') should return expected value 'KK:mm:ss a'");
	});

	QUnit.test("getABAPNumberFormat", function(assert) {
		assert.expect(3);

		assert.strictEqual(Formatting.getABAPNumberFormat(), "X", "getABAPNumberFormat should return 'Y' as provided by URL");
		assert.strictEqual(Formatting.getNumberSymbol("group"), ",", "getNumberSymbol('group') should return expected value ','");
		assert.strictEqual(Formatting.getNumberSymbol("decimal"), ".", "getNumberSymbol('decimal') should return expected value '.'");
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
		assert.expect(4);
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
	});

	QUnit.module("Formatting setter", {
		beforeEach: function() {
			BaseConfig._.invalidate();
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

	QUnit.test("setLanguageTag", function(assert) {
		assert.expect(7);
		let sExpectedLanguageTag;

		function formattingChanged(oEvent) {
			assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag(sExpectedLanguageTag),
				"getLanguageTag should return new 'sap/base/i18n/LanguageTag' for LanguageTag " + sExpectedLanguageTag);
			assert.strictEqual(oEvent.languageTag, sExpectedLanguageTag, "Change event should contain the correct language " + sExpectedLanguageTag);
		}
		Formatting.attachChange(formattingChanged);

		BaseConfig._.invalidate();
		mConfigStubValues = { sapUiLanguage: "es" };
		assert.deepEqual(Formatting.getLanguageTag(), new LanguageTag("es-x-sapufmt"),
			"getLanguageTag should consider the changed Localization language but there is no change event because there was no 'real' change within Formatting.");

		sExpectedLanguageTag = "fr";
		Formatting.setLanguageTag(sExpectedLanguageTag);
		// Setting same locale again shouldn't trigger a change event
		Formatting.setLanguageTag(sExpectedLanguageTag);

		sExpectedLanguageTag = "it";
		Formatting.setLanguageTag(new LanguageTag(sExpectedLanguageTag));

		assert.throws(() => {
			Formatting.setLanguageTag('6N');
		}, new TypeError("vLanguageTag must be a BCP47 language tag or Java Locale id or null"), "setting an invalid (non-BCP-47) format locale should cause an error");
		assert.throws(() => {
			Formatting.setLanguageTag(new Date());
		}, new TypeError("vLanguageTag must be a BCP47 language tag or Java Locale id or null"), "setting a non-string value as format locale should cause an error");

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("setABAPDateFormat", function(assert) {
		assert.expect(24);
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

		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiLanguage": "ar_SA"
		};

		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The default calendar type for ar_SA is islamic");

		Formatting.setABAPDateFormat("1");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '1' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat("2");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '2' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat("3");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '3' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat("4");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '4' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat("5");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '5' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat("6");
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The legacy date format '6' changes the calendar type to gregorian");

		Formatting.setABAPDateFormat(null);
		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The default calendar type for ar_SA is islamic");

		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapUiLanguage": "en_US"
		};
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The default calendar type for en_US is gregorian");

		Formatting.setABAPDateFormat("A");
		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");

		Formatting.setCalendarType(CalendarType.Gregorian);
		assert.equal(Formatting.getCalendarType(), CalendarType.Gregorian, "The calendar type is modified back to gregorian via calling setCalendarType");

		Formatting.setCalendarType(null);
		Formatting.setABAPDateFormat("B");
		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The legacy date format 'B' changes the calendar type to islamic");

		Formatting.setABAPDateFormat("7");
		assert.equal(Formatting.getCalendarType(), CalendarType.Japanese, "The legacy date format '7' changes the calendar type to japanese");

		Formatting.setABAPDateFormat("A");
		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");
		Formatting.setABAPDateFormat("8");
		assert.equal(Formatting.getCalendarType(), CalendarType.Japanese, "The legacy date format '8' changes the calendar type to japanese");

		Formatting.setABAPDateFormat("A");
		assert.equal(Formatting.getCalendarType(), CalendarType.Islamic, "The legacy date format 'A' changes the calendar type to islamic");
		Formatting.setABAPDateFormat("9");
		assert.equal(Formatting.getCalendarType(), CalendarType.Japanese, "The legacy date format '9' changes the calendar type to japanese");

		Formatting.setABAPDateFormat("C");
		assert.equal(Formatting.getCalendarType(), CalendarType.Persian, "The legacy date format 'C' changes the calendar type to persian");

		// Reset
		Formatting.setCalendarType(null);
		// Set ABAPDateFormat to '2' because deleting writeable instance isn't possible
		// and '2' reflects the initially provided URL parameter
		Formatting.setABAPDateFormat("2");
	});

	QUnit.test("setABAPTimeFormat", function(assert) {
		assert.expect(7);
		function test(oEvent) {
			assert.strictEqual(oEvent["timeFormats-medium"], "HH:mm:ss", "timeFormat event parameter set correctly");
			assert.strictEqual(oEvent["timeFormats-short"], "HH:mm", "timeFormat event parameter set correctly");
			assert.strictEqual(oEvent["ABAPTimeFormat"], "0", "timeFormat event parameter set correctly");
			assert.deepEqual(oEvent["dayPeriods-format-abbreviated"], null, "timeFormat event parameter set correctly");
			assert.strictEqual(Formatting.getABAPTimeFormat(), "0", "getABAPTimeFormat should return expected value 'B'");
			assert.strictEqual(Formatting.getTimePattern("short"), "HH:mm", "getTimePattern('short') should return expected value 'HH:mm'");
			assert.strictEqual(Formatting.getTimePattern("medium"), "HH:mm:ss", "getTimePattern('medium') should return expected value 'HH:mm:ss'");
		}
		Formatting.attachChange(test);
		Formatting.setABAPTimeFormat("0");
		// Setting same format again shouldn't trigger a change event
		Formatting.setABAPTimeFormat("0");
		Formatting.detachChange(test);

		// Set ABAPTimeFormat to '3' because deleting writeable instance isn't possible
		// and '3' reflects the initially provided URL parameter
		Formatting.setABAPTimeFormat("3");
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

		// Set ABAPNumberFormat to 'X' because deleting writeable instance isn't possible
		// and 'X' reflects the initially provided URL parameter
		Formatting.setABAPNumberFormat("X");
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

		sExpectedCalendarType = CalendarType.Gregorian;
		Formatting.setCalendarType("invalidCalendarType");

		sExpectedCalendarType = CalendarType.Gregorian;
		Formatting.setCalendarType(null);

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

	QUnit.test("getCustomUnits, setCustomUnits and addCustomUnits", (assert) => {
		assert.expect(7);
		assert.strictEqual(Formatting.getCustomUnits(), undefined, "By default there shouldn't be any customUnits");
		let oExpectedCustomUnits;
		let oExpectedCustomUnitsEvent;

		function formattingChanged(oEvent) {
			assert.deepEqual(Formatting.getCustomUnits(), oExpectedCustomUnits, "getCustomUnits should return expected value '" + JSON.stringify(oExpectedCustomUnits) + "'");
			assert.deepEqual(oEvent.units, oExpectedCustomUnitsEvent, "Change event should contain the correct customUnits '" + JSON.stringify(oExpectedCustomUnits) + "'");
		}
		Formatting.attachChange(formattingChanged);

		oExpectedCustomUnits = {
			"BAG": {
				"displayName": "Bag",
				"unitPattern-count-one": "{0} bag",
				"unitPattern-count-other": "{0} bags"
			}
		};
		oExpectedCustomUnitsEvent = {
			"short": oExpectedCustomUnits
		};
		Formatting.addCustomUnits(oExpectedCustomUnits);

		oExpectedCustomUnits = {
			"BOTTLE": {
				"displayName": "Bottle",
				"unitPattern-count-one": "{0} bottle",
				"unitPattern-count-other": "{0} bottles"
			}
		};
		oExpectedCustomUnitsEvent = {
			"short": oExpectedCustomUnits
		};
		Formatting.setCustomUnits(oExpectedCustomUnits);

		oExpectedCustomUnits = {
			"BAG": {
				"displayName": "Bag",
				"unitPattern-count-one": "{0} bag",
				"unitPattern-count-other": "{0} bags"
			},
			"BOTTLE": {
				"displayName": "Bottle",
				"unitPattern-count-one": "{0} bottle",
				"unitPattern-count-other": "{0} bottles"
			}
		};
		oExpectedCustomUnitsEvent = {
			"short": oExpectedCustomUnits
		};
		Formatting.addCustomUnits({
			"BAG": {
				"displayName": "Bag",
				"unitPattern-count-one": "{0} bag",
				"unitPattern-count-other": "{0} bags"
			}
		});

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("getUnitMappings, setUnitMappings and addUnitMappings", (assert) => {
		assert.expect(7);
		assert.strictEqual(Formatting.getUnitMappings(), undefined, "By default there shouldn't be any UnitMappings");
		let oExpectedUnitMappings;

		function formattingChanged(oEvent) {
			assert.deepEqual(Formatting.getUnitMappings(), oExpectedUnitMappings, "getUnitMappings should return expected value '" + JSON.stringify(oExpectedUnitMappings) + "'");
			assert.deepEqual(oEvent.unitMappings, oExpectedUnitMappings, "Change event should contain the correct unitMappings '" + JSON.stringify(oExpectedUnitMappings) + "'");
		}
		Formatting.attachChange(formattingChanged);

		oExpectedUnitMappings = {
			"kitties": "cats"
		};
		Formatting.addUnitMappings(oExpectedUnitMappings);

		oExpectedUnitMappings = {
			"doggies": "dogs"
		};
		Formatting.setUnitMappings(oExpectedUnitMappings);

		oExpectedUnitMappings = {
			"doggies": "dogs",
			"kitties": "cats"
		};
		Formatting.addUnitMappings({
			"kitties": "cats"
		});

		Formatting.detachChange(formattingChanged);
	});

	QUnit.test("getCustomCurrencies, setCustomCurrencies and addCustomCurrencies", (assert) => {
		assert.expect(7);
		assert.strictEqual(Formatting.getCustomCurrencies(), undefined, "By default there shouldn't be any customCurrencies");
		let oExpectedCustomCurrencies;

		function formattingChanged(oEvent) {
			assert.deepEqual(Formatting.getCustomCurrencies(), oExpectedCustomCurrencies, "getCustomCurrencies should return expected value '" + JSON.stringify(oExpectedCustomCurrencies) + "'");
			assert.deepEqual(oEvent.currency, oExpectedCustomCurrencies, "Change event should contain the correct customCurrencies '" + JSON.stringify(oExpectedCustomCurrencies) + "'");
		}
		Formatting.attachChange(formattingChanged);

		oExpectedCustomCurrencies = {
			"MyCoin": {
				"symbol": "MC"
			}
		};
		Formatting.addCustomCurrencies(oExpectedCustomCurrencies);

		oExpectedCustomCurrencies = {
			"BitCoin": {
				"symbol": "BC",
				"digits": 3
			}
		};
		Formatting.setCustomCurrencies(oExpectedCustomCurrencies);

		oExpectedCustomCurrencies = {
			"MyCoin": {
				"symbol": "MC"
			},
			"BitCoin": {
				"symbol": "BC",
				"digits": 3
			}
		};
		Formatting.addCustomCurrencies({
			"MyCoin": {
				"symbol": "MC"
			}
		});

		Formatting.detachChange(formattingChanged);
	});
});