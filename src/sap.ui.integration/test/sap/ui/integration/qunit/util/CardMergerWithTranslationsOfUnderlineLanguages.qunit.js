/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap/ui/integration/util/CardMerger",
	"sap/base/util/deepClone",
	"sap/ui/integration/util/Utils",
	"qunit/designtime/EditorQunitUtils"
], function (
	Localization,
	merge,
	CardMerger,
	deepClone,
	Utils,
	EditorQunitUtils
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

	var _oLanguageMapping = {
		"ar_SA": "ar-SA",
		"bg_BG": "bg-BG",
		"ca_ES": "ca-ES",
		"cs_CZ": "cs-CZ",
		"da_DK": "da",
		"de_CH": "de-CH",
		"de_DE": "de-DE",
		"el_GR": "el-GR",
		"en_US": "en",
		"en_GB": "en-GB",
		"es_ES": "es-ES",
		"es_MX": "es-MX",
		"fi_FI": "fi-FI",
		"fr": "fr",
		"fr_CA": "fr-CA",
		"fr_FR": "fr-FR",
		"hi_IN": "hi",
		"he_IL": "he-IL",
		"hr_HR": "hr-HR",
		"hu_HU": "hu",
		"id_ID": "id",
		"it_IT": "it-IT",
		"ja_JP": "ja-JP",
		"ko_KR": "ko-KR",
		"ms_MY": "ms",
		"nl_NL": "nl",
		"nb_NO": "nb-NO",
		"pl_PL": "pl",
		"pt_BR": "pt-BR",
		"pt_PT": "pt-PT",
		"ro_RO": "ro",
		"ru_RU": "ru-RU",
		"sk_SK": "sk-SK",
		"sl_SI": "sl-SI",
		"sv_SE": "sv-SE",
		"th_TH": "th",
		"tr_TR": "tr-TR",
		"uk_UA": "uk-UA",
		"vi_VN": "vi-VN",
		"zh_CN": "zh-CN",
		"zh_TW": "zh-TW"
	};

	var _oTextsOfString1 = {};
	var _oTextsOfString2 = {};

	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default": "string1"
		},
		"string2": {
			"default": "string2"
		},
		"string1string2NoTransValue": {
			"default": "string2"
		},
		"string1string2": {
			"default": "string2"
		}
	};

	var oSubLanguageMappingForString1 = EditorQunitUtils.getRandomPropertiesOfObject(_oLanguageMapping);
	var oSubLanguageMappingForString2 = EditorQunitUtils.getRandomPropertiesOfObject(_oLanguageMapping);
	Object.keys(oSubLanguageMappingForString1).forEach(function(sLanguage) {
		_oTextsOfString1[sLanguage] = {};
		_oTextsOfString1[sLanguage][_sManifestPath] = "String1 " + sLanguage;
		var sLanguageValue = oSubLanguageMappingForString1[sLanguage];
		_oExpectedValuesOfChangesWithTransFormat["string1"][sLanguageValue] = "String1 " + sLanguage;
		_oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguageValue] = "String1 " + sLanguage;
	});
	Object.keys(oSubLanguageMappingForString2).forEach(function(sLanguage) {
		_oTextsOfString2[sLanguage] = {};
		_oTextsOfString2[sLanguage][_sManifestPath] = "String2 " + sLanguage;
		var sLanguageValue = oSubLanguageMappingForString2[sLanguage];
		_oExpectedValuesOfChangesWithTransFormat["string2"][sLanguageValue] = "String2 " + sLanguage;
	});

	_oExpectedValuesOfChangesWithTransFormat["string1string2"] = Object.assign({}, _oExpectedValuesOfChangesWithTransFormat["string1"], _oExpectedValuesOfChangesWithTransFormat["string2"]);

	Object.keys(_oLanguageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = _oLanguageMapping[sLanguage];
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
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta value of 'text' - '" + sExpectedValueOfText + "' was merged correctly");
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
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta value of 'text' - '" + sExpectedValueOfText + "' was merged correctly");
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
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta value of 'text' - '" + sExpectedValueOfText + "' was merged correctly");
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
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta value of 'text' - '" + sExpectedValueOfText + "' was merged correctly");
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
				assert.equal(oNewManifest["sap.card"].configuration.parameters.stringParameter.value, sExpectedValueOfText, "the delta value of 'text' - '" + sExpectedValueOfText + "' was merged correctly");
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
