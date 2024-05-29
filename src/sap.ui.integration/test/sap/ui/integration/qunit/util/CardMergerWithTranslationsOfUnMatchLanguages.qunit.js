/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap/ui/integration/util/CardMerger",
	"sap/base/util/deepClone",
	"sap/ui/integration/util/Utils"
], function (
	Localization,
	merge,
	CardMerger,
	deepClone,
	Utils
) {
	"use strict";

	var _oBaseJson = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/1string",
			"type": "List",
			"configuration": {
				"parameters": {
					"stringParameter": {}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
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

	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default": "string1",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da-DK",
			"hi": "String1 hi-IN",
			"hu": "String1 hu-HU",
			"id": "String1 id-ID",
			"ms": "String1 ms-MY",
			"th": "String1 th-TH"
		},
		"string2": {
			"default": "string2",
			"ms": "String2 ms-MY",
			"nl": "String2 nl-NL",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl-PL",
			"ro": "String2 ro-RO",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th-TH"
		},
		"string1string2NoTransValue": {
			"default": "string2",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da-DK",
			"hi": "String1 hi-IN",
			"hu": "String1 hu-HU",
			"id": "String1 id-ID",
			"ms": "String1 ms-MY",
			"th": "String1 th-TH"
		},
		"string1string2": {
			"default": "string2",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da-DK",
			"hi": "String1 hi-IN",
			"hu": "String1 hu-HU",
			"id": "String1 id-ID",
			"ms": "String2 ms-MY",
			"nl": "String2 nl-NL",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl-PL",
			"ro": "String2 ro-RO",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th-TH"
		}
	};

	Object.keys(Utils.languageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
		QUnit.module("String - Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function() {
				Localization.setLanguage(sLanguage);
			},
			afterEach: function() {
				Localization.setLanguage("en");
			}
		}, function() {
			QUnit.test("admin change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, "string1", "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("content change with string 'string2' with no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, "string2", "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, "string3", "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string2', "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta of 'text' was merged correctly");
			});

			QUnit.test("content change with value 'string2' and no translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts, translation change with string 'string3'", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = "string1";
				oAdminChanges.texts = _oTextsOfString1;
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = "string2";
				oContentChanges.texts = _oTextsOfString2;
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "string3";
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges, oTranslationChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, 'string3', "the delta was merged correctly");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
