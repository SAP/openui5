/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/util/CardMerger",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	merge,
	CardMerger,
	Core,
	deepClone
) {
	"use strict";

	var _aCheckedLanguages = [
		{
			"key": "en",
			"description": "English"
		},
		{
			"key": "en-GB",
			"description": "English UK"
		},
		{
			"key": "fr",
			"description": "Français"
		},
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		},
		{
			"key": "zh-TW",
			"description": "繁體中文"
		}
	];
	var _oBaseJson = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"object": {}
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
	var _oObject = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"key": "key",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var _oTextsOfString1 = {
		"en": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 EN",
					"text": "String1 EN"
				}
			}
		},
		"fr": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 FR",
					"text": "String1 FR"
				}
			}
		},
		"zh-CN": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 简体",
					"text": "String1 简体"
				}
			}
		}
	};
	var _oTextsOfString2 = {
		"en": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 EN",
					"text": "String2 EN"
				}
			}
		},
		"ru": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 RU",
					"text": "String2 RU"
				}
			}
		},
		"zh-TW": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 繁體",
					"text": "String2 繁體"
				}
			}
		}
	};
	var oTextPropertyNotTranslatable = {
		"/sap.card/configuration/parameters/object/value": {
			"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
				"text": {
					"translatable": false
				}
			}
		}
	};
	var _oAdminChangeBase = {
		":layer": 0,
		":errors": false
	};
	var _oContentChangeBase = {
		":layer": 0,
		":errors": false
	};
	var _sManifestPath = "/sap.card/configuration/parameters/object/value";

	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default": "string1",
			"en": "String1 EN",
			"fr": "String1 FR",
			"zh-CN": "String1 简体"
		},
		"string2": {
			"default": "string2",
			"en": "String2 EN",
			"ru": "String2 RU",
			"zh-TW": "String2 繁體"
		},
		"string1string2NoTransValue": {
			"default": "string2",
			"en": "String1 EN",
			"fr": "String1 FR",
			"zh-CN": "String1 简体"
		},
		"string2string1NoTransValue": {
			"default": "string1",
			"en": "String2 EN",
			"ru": "String2 RU",
			"zh-TW": "String2 繁體"
		},
		"string1string2": {
			"default": "string2",
			"en": "String2 EN",
			"fr": "String1 FR",
			"ru": "String2 RU",
			"zh-CN": "String1 简体",
			"zh-TW": "String2 繁體"
		},
		"string2string1": {
			"default": "string1",
			"en": "String1 EN",
			"fr": "String1 FR",
			"ru": "String2 RU",
			"zh-CN": "String1 简体",
			"zh-TW": "String2 繁體"
		}
	};

	_aCheckedLanguages.forEach(function(sLanguage) {
		QUnit.module("Object - In " + sLanguage.key, {
			beforeEach: function() {
				Core.getConfiguration().setLanguage(sLanguage.key);
			},
			afterEach: function() {
				Core.getConfiguration().setLanguage("en");
			}
		}, function() {
			QUnit.test("admin change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with string 'string2' with no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with string 'string2' with no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("content change with string 'string2' with no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with string 'string2' with no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta of 'text was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value, oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, oObject2.text, "the delta was merged correctly");
			});
		});
	});

	_aCheckedLanguages.forEach(function(sLanguage) {
		QUnit.module("Object list - In " + sLanguage.key, {
			beforeEach: function() {
				Core.getConfiguration().setLanguage(sLanguage.key);
			},
			afterEach: function() {
				Core.getConfiguration().setLanguage("en");
			}
		}, function() {
			QUnit.test("admin change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with string 'string2' with no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with string 'string2' with no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				oAdminChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("content change with string 'string2' with no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with string 'string2' with no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta was merged correctly");
			});

			QUnit.test("content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject.text, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and no translation texts, content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta of 'text was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string1' and translation texts, content change with value 'string2' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString2;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0], oObject2, "the delta was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and no translation texts, content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and no translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and no translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});

			QUnit.test("admin change with value 'string2' and translation texts, content change with value 'string1' and translation texts and 'text' property was set to not translatable", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString2;
				var oObject2 = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject2];
				oContentChanges.texts = _oTextsOfString1;
				oContentChanges[":designtime"] = oTextPropertyNotTranslatable;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges, oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2string1"][sLanguage.key] || _oExpectedValuesOfChangesWithTransFormat["string2string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, oObject2.text, "the delta was merged correctly");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
