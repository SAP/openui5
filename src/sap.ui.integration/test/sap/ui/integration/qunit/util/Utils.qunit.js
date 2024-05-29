/* global QUnit*/

sap.ui.define([
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/util/BindingHelper",
	"sap/base/util/deepEqual",
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap/base/util/deepClone"
], function (
	Utils,
	BindingHelper,
	deepEqual,
	Localization,
	merge,
	deepClone
) {
	"use strict";
	QUnit.config.reorder = false;

	QUnit.module("Utils.timeoutPromise()");

	QUnit.test("Fulfills normally before timeout", function (assert) {
		// Arrange
		var done = assert.async(),
			pPromise = new Promise(function (resolve, reject) {
				setTimeout(function () {
					resolve(true);
				}, 100);
			}),
			pWithTimeout = Utils.timeoutPromise(pPromise, 200);

		// Act
		this.clock.tick(300);

		// Assert
		pWithTimeout.then(function (bResovled) {
			assert.ok(bResovled, "The promise fulfilled without timeout to be reached.");
			done();
		});
	});

	QUnit.test("Rejects normally before timeout", function (assert) {
		// Arrange
		var done = assert.async(),
			pPromise = new Promise(function (resolve, reject) {
				setTimeout(function () {
					reject(true);
				}, 100);
			}),
			pWithTimeout = Utils.timeoutPromise(pPromise, 200);

		// Act
		this.clock.tick(300);

		// Assert
		pWithTimeout.catch(function (bRejected) {
			assert.ok(bRejected, "The promise rejects without timeout to be reached.");
			done();
		});
	});

	QUnit.test("Does not fulfill or reject before timeout", function (assert) {
		// Arrange
		var done = assert.async(),
			pPromise = new Promise(function () {}),
			pWithTimeout = Utils.timeoutPromise(pPromise, 200),
			bFulfilled = false;

		pWithTimeout.then(function () {
			bFulfilled = true;
		});

		// Act
		this.clock.tick(210);

		// should not fulfill even after timeout
		pWithTimeout.then(function () {
			bFulfilled = true;
		});

		// Assert
		pWithTimeout.catch(function (sMessage) {
			assert.notOk(bFulfilled, "The promise did not fulfill before the timeout.");
			assert.ok(sMessage, "The promise timed out with expected message.");
			done();
		});
	});

	QUnit.test("Default timeout period", function (assert) {
		// Arrange
		var done = assert.async(),
			pPromise = new Promise(function () {}),
			pWithTimeout = Utils.timeoutPromise(pPromise);

		// Act
		this.clock.tick(Utils.DEFAULT_PROMISE_TIMEOUT + 100);

		// Assert
		pWithTimeout.catch(function (sMessage) {
			assert.ok(sMessage, "Timeout after default period.");
			done();
		});
	});

	QUnit.module("Utils.getNestedPropertyValue()");

	QUnit.test("Get value", function (assert) {
		// Arrange
		var oObject = {
			a: {
				b: {
					c: "value"
				}
			}
		};

		// Assert
		assert.strictEqual(Utils.getNestedPropertyValue(oObject, "/a/b/c"), oObject.a.b.c, "The value corresponding to the given path is found");
	});

	QUnit.module("Utils.setNestedPropertyValue()");

	QUnit.test("Set value", function (assert) {
		// Arrange
		var oObject = {
			a: {
				b: {
					c: "value"
				}
			}
		};

		// Act
		Utils.setNestedPropertyValue(oObject, "/a/b/c", "new value");

		// Assert
		assert.strictEqual(oObject.a.b.c, "new value", "The value corresponding to the given path is properly updated");
	});

	QUnit.module("Utils.makeUndefinedValuesNull");

	QUnit.test("makeUndefinedValuesNull with nested objects", function (assert) {
		// arrange
		var oData = {
			a: undefined,
			b: {
				c: undefined
			}
		};

		var oExpected = {
			a: null,
			b: {
				c: null
			}
		};

		// act
		var oRes = Utils.makeUndefinedValuesNull(oData);

		// assert
		assert.deepEqual(oRes, oExpected, "Undefined values are change to 'null'");
	});

	QUnit.test("makeUndefinedValuesNull with array", function (assert) {
		// arrange
		var oData = {
			a: {
				b: [
					1,
					"a",
					{
						c: undefined
					}
				]
			}
		};

		var oExpected = {
			a: {
				b: [
					1,
					"a",
					{
						c: null
					}
				]
			}
		};

		// act
		var oRes = Utils.makeUndefinedValuesNull(oData);

		// assert
		assert.deepEqual(oRes, oExpected, "Undefined values are change to 'null'");
	});

	QUnit.test("makeUndefinedValuesNull with 'undefined'", function (assert) {
		// assert
		assert.strictEqual(Utils.makeUndefinedValuesNull(undefined), undefined, "'undefined' is returned when no parameters are provided");
	});

	QUnit.module("getStatusTextBindingInfo");

	QUnit.test("generates Binding info if the formatter is correctly defined", function (assert) {
		var oCorrectFormatterFromManifest = {
			translationKey: "someTranslationKey",
			parts: ["/firstParam", "/secondParam"]
		};

		var oResult = Utils.getStatusTextBindingInfo(oCorrectFormatterFromManifest);

		assert.strictEqual(BindingHelper.isBindingInfo(oResult), true, "binding info was generated");
	});

	QUnit.test("returns undefined for incorrectly defined formatter", function (assert) {
		var oIncorrectFormatterFromManifest = {};

		var oResult = Utils.getStatusTextBindingInfo(oIncorrectFormatterFromManifest);

		assert.strictEqual(BindingHelper.isBindingInfo(oResult), false, "binding info was not generated");
	});

	QUnit.module("language");

	QUnit.test("check languageMapping", function (assert) {
		assert.ok(deepEqual(Utils.languageMapping, {
			//"cy": "cy-GB",
			"da-DK": "da",
			"hi-IN": "hi",
			"hu-HU": "hu",
			"id-ID": "id",
			"ms-MY": "ms",
			"nl-NL": "nl",
			//"no-NO": "nb-NO",
			"pl-PL": "pl",
			"ro-RO": "ro",
			//"sh": "sr-RS",
			"th-TH": "th"
		}), "languageMapping object ok");
	});

	QUnit.test("Language changing", function (assert) {
		// Arrange
		var done = assert.async();
		Localization.setLanguage("en");
		assert.equal(Utils._language, "en", "language en ok");
		Localization.setLanguage("fr_CA");
		var pPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				assert.equal(Utils._language, "fr-CA", "language fr_CA mapping to fr-CA ok");
				resolve();
			}, 1000);
		});

		// Act
		this.clock.tick(2000);

		// Assert
		pPromise.then(function () {
			done();
		});
	});

	Object.keys(Utils.languageMapping).forEach(function(sWZLanguage) {
		QUnit.test("Language changing - " + sWZLanguage, function (assert) {
			// Arrange
			var done = assert.async();
			Localization.setLanguage("en");
			assert.equal(Utils._language, "en", "language en ok");
			Localization.setLanguage(sWZLanguage);
			var pPromise = new Promise(function (resolve, reject) {
				setTimeout(function () {
					assert.equal(Utils._language, Utils.languageMapping[sWZLanguage], "language " + sWZLanguage + " mapping to " + Utils.languageMapping[sWZLanguage] + " ok");
					resolve();
				}, 1000);
			});

			// Act
			this.clock.tick(2000);

			// Assert
			pPromise.then(function () {
				done();
			});
		});
	});

	QUnit.test("mapLanguagesInManifestChanges - BC trans only", function (assert) {
		// Arrange
		var done = assert.async();

		var _oTextsOfString1 = {
			"cy-GB": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB"
			},
			"da-DK": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 da-DK"
			},
			"hi-IN": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 hi-IN"
			},
			"hu-HU": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 hu-HU"
			},
			"id-ID": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 id-ID"
			},
			"ms-MY": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 ms-MY"
			},
			"th-TH": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 th-TH"
			}
		};
		var _oTextsOfString2 = {
			"ms-MY": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 ms-MY"
			},
			"nl-NL": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 nl-NL"
			},
			"nb-NO": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 nb-NO"
			},
			"pl-PL": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 pl-PL"
			},
			"ro-RO": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 ro-RO"
			},
			"sr-RS": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS"
			},
			"th-TH": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 th-TH"
			}
		};
		var _oAdminChangeBase = {
			":layer": 0,
			":errors": false
		};
		var _oContentChangeBase = {
			":layer": 5,
			":errors": false
		};
		var _oTranslationChangeBase = {
			":layer": 10,
			":errors": false
		};
		var _sManifestPath = "/sap.card/configuration/parameters/stringParameter/value";

		var oAdminChanges = deepClone(_oAdminChangeBase, 500);
		oAdminChanges.texts = _oTextsOfString1;
		var oContentChanges = deepClone(_oContentChangeBase, 500);
		oContentChanges.texts = _oTextsOfString2;
		var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
		oTranslationChanges[_sManifestPath] = "string3";

		var aChanges = [oAdminChanges, oContentChanges, oTranslationChanges];

		var aExpectedChanges = [
			{
				":layer": 0,
				":errors": false,
				"texts": {
					"cy-GB": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB"
					},
					"da": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 da-DK"
					},
					"hi": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 hi-IN"
					},
					"hu": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 hu-HU"
					},
					"id": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 id-ID"
					},
					"ms": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 ms-MY"
					},
					"th": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 th-TH"
					}
				}
			},
			{
				":layer": 5,
				":errors": false,
				"texts": {
					"ms": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 ms-MY"
					},
					"nl": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 nl-NL"
					},
					"nb-NO": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 nb-NO"
					},
					"pl": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 pl-PL"
					},
					"ro": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 ro-RO"
					},
					"sr-RS": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS"
					},
					"th": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 th-TH"
					}
				}
			},
			oTranslationChanges
		];

		var pPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				Utils.mapLanguagesInManifestChanges(aChanges);
				assert.deepEqual(aChanges, aExpectedChanges, "translation remapping correct");
				resolve();
			}, 1000);
		});

		// Act
		this.clock.tick(2000);

		// Assert
		pPromise.then(function () {
			done();
		});
	});

	QUnit.test("mapLanguagesInManifestChanges - BC and New trans", function (assert) {
		// Arrange
		var done = assert.async();

		var _oTextsOfString1 = {
			"cy-GB": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB"
			},
			"da": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 da"
			},
			"da-DK": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 da-DK"
			},
			"hi-IN": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 hi-IN"
			},
			"hu-HU": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 hu-HU"
			},
			"id": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 id"
			},
			"id-ID": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 id-ID"
			},
			"ms-MY": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 ms-MY"
			},
			"th": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 th"
			},
			"th-TH": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 th-TH"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 zh-CN"
			}
		};
		var _oTextsOfString2 = {
			"ms-MY": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 ms-MY"
			},
			"nl": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 nl"
			},
			"nl-NL": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 nl-NL"
			},
			"nb-NO": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 nb-NO"
			},
			"pl": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 pl"
			},
			"pl-PL": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 pl-PL"
			},
			"ro-RO": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 ro-RO"
			},
			"sr-RS": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS"
			},
			"th": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 th"
			},
			"th-TH": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 th-TH"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/stringParameter/value": "String2 zh-CN"
			}
		};
		var _oAdminChangeBase = {
			":layer": 0,
			":errors": false
		};
		var _oContentChangeBase = {
			":layer": 5,
			":errors": false
		};
		var _oTranslationChangeBase = {
			":layer": 10,
			":errors": false
		};
		var _sManifestPath = "/sap.card/configuration/parameters/stringParameter/value";

		var oAdminChanges = deepClone(_oAdminChangeBase, 500);
		oAdminChanges.texts = _oTextsOfString1;
		var oContentChanges = deepClone(_oContentChangeBase, 500);
		oContentChanges.texts = _oTextsOfString2;
		var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
		oTranslationChanges[_sManifestPath] = "string3";

		var aChanges = [oAdminChanges, oContentChanges, oTranslationChanges];

		var aExpectedChanges = [
			{
				":layer": 0,
				":errors": false,
				"texts": {
					"cy-GB": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB"
					},
					"da": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 da"
					},
					"hi": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 hi-IN"
					},
					"hu": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 hu-HU"
					},
					"id": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 id"
					},
					"ms": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 ms-MY"
					},
					"th": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 th"
					},
					"zh-CN": {
						"/sap.card/configuration/parameters/stringParameter/value": "String1 zh-CN"
					}
				}
			},
			{
				":layer": 5,
				":errors": false,
				"texts": {
					"ms": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 ms-MY"
					},
					"nl": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 nl"
					},
					"nb-NO": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 nb-NO"
					},
					"pl": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 pl"
					},
					"ro": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 ro-RO"
					},
					"sr-RS": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS"
					},
					"th": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 th"
					},
					"zh-CN": {
						"/sap.card/configuration/parameters/stringParameter/value": "String2 zh-CN"
					}
				}
			},
			oTranslationChanges
		];

		var pPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				Utils.mapLanguagesInManifestChanges(aChanges);
				assert.deepEqual(aChanges, aExpectedChanges, "translation remapping correct");
				resolve();
			}, 1000);
		});

		// Act
		this.clock.tick(2000);

		// Assert
		pPromise.then(function () {
			done();
		});
	});

	QUnit.module("Utils.polling()", {
		beforeEach: function () {
			// don't use fake timers for this module
			this.clock.restore();
		}
	});

	QUnit.test("Callback executes until done", function (assert) {
		// Arrange
		const done = assert.async();
		assert.expect(1);

		const fnCallback = this.spy(() => {
			if (fnCallback.callCount === 1) {
				return false;
			}

			// Assert
			assert.ok(true, "The polling function was called two times.");
			done();
			return true;
		});

		// Act
		Utils.polling(fnCallback, 10, 30);
	});

	QUnit.test("Callback executes until maximum", function (assert) {
		// Arrange
		const done = assert.async();
		assert.expect(1);

		const fnCallback = this.spy(() => {
			if (fnCallback.callCount === 3) {
				// Assert
				assert.ok(true, "The polling function was called three times.");
				done();
			}

			return false;
		});

		// Act
		Utils.polling(fnCallback, 10, 30);
	});

	QUnit.test("Calling the stop method", function (assert) {
		// Arrange
		const done = assert.async();
		assert.expect(1);

		const fnCallback = this.spy(() => {
			// Assert
			assert.ok(true, "The polling function was called once and polling stopped.");
			done();
		});

		// Act
		const oPolling = Utils.polling(fnCallback, 10, 30);

		oPolling.stop();
	});
});