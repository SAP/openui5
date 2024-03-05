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
		"cy-GB": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 cy-GB",
					"text": "String1 cy-GB"
				}
			}
		},
		"da": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 da",
					"text": "String1 da"
				}
			}
		},
		"hi": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 hi",
					"text": "String1 hi"
				}
			}
		},
		"hu": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 hu",
					"text": "String1 hu"
				}
			}
		},
		"id": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 id",
					"text": "String1 id"
				}
			}
		},
		"ms": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 ms",
					"text": "String1 ms"
				}
			}
		},
		"th": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String1 th",
					"text": "String1 th"
				}
			}
		}
	};
	var _oTextsOfString2 = {
		"ms": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 ms",
					"text": "String2 ms"
				}
			}
		},
		"nl": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 nl",
					"text": "String2 nl"
				}
			}
		},
		"nb-NO": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 nb-NO",
					"text": "String2 nb-NO"
				}
			}
		},
		"pl": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 pl",
					"text": "String2 pl"
				}
			}
		},
		"ro": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 ro",
					"text": "String2 ro"
				}
			}
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 sr-RS",
					"text": "String2 sr-RS"
				}
			}
		},
		"th": {
			"/sap.card/configuration/parameters/object/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"key": "String2 th",
					"text": "String2 th"
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
	var _sManifestPath = "/sap.card/configuration/parameters/object/value";

	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default": "string1",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String1 ms",
			"th": "String1 th"
		},
		"string2": {
			"default": "string2",
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th"
		},
		"string1string2NoTransValue": {
			"default": "string2",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String1 ms",
			"th": "String1 th"
		},
		"string1string2": {
			"default": "string2",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th"
		}
	};

	Object.keys(Utils.languageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
		QUnit.module("Object - Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function() {
				Localization.setLanguage(sLanguage);
			},
			afterEach: function() {
				Localization.setLanguage("en");
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

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject;
				oAdminChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject;
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value.text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});
		});
	});

	Object.keys(Utils.languageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
		QUnit.module("Object list - Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function() {
				Localization.setLanguage(sLanguage);
			},
			afterEach: function() {
				Localization.setLanguage("en");
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

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string1", "text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = [oObject];
				oAdminChanges.texts = _oTextsOfString1;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oAdminChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oCopy = merge({}, _oBaseJson);
				var oObject = merge(deepClone(_oObject, 500), {"key": "string2", "text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = [oObject];
				oContentChanges.texts = _oTextsOfString2;
				var oNewManifest = CardMerger.mergeCardDelta(_oBaseJson, [oContentChanges]);
				assert.deepEqual(oCopy, _oBaseJson, "the original manifest was not mutated");
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of key was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2NoTransValue"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
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
				var sExpectedValueOfKey = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].key, sExpectedValueOfKey, "the delta of 'key' was merged correctly");
				var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
				assert.deepEqual(oNewManifest["sap.card"].configuration.parameters.object.value[0].text, sExpectedValueOfText, "the delta of 'text' was merged correctly");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
