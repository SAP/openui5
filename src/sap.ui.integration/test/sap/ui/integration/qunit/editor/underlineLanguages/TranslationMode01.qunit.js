/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/sinon-4",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/integration/util/Utils",
	"sap/base/util/deepClone"
], function (
	Localization,
	sinon,
	EditorQunitUtils,
	Utils,
	deepClone
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

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

	var _oExpectedValuesOfLanguageMapping = {
		"ar-SA": "ar",
		"bg-BG": "bg",
		"da": "da",
		"de-CH": "de-CH",
		"de-DE": "de-DE",
		"fr": "France",
		"fr-CA": "fr-CA",
		"fr-FR": "France",
		"hi": "hi",
		"hu": "hu",
		"id": "id",
		"ms": "ms",
		"nl": "nl",
		"pl": "pl",
		"ro": "ro",
		"th": "th"
	};

	var oSubLanguages = EditorQunitUtils.getRandomPropertiesOfObject(_oLanguageMapping, 7);
	var oEditorLanguages = deepClone(oSubLanguages, 500);

	Object.keys(oSubLanguages).forEach(function(sLanguage) {
		var sMappingLanguage = _oLanguageMapping[sLanguage];
		var sMappingLanguageValue = _oExpectedValuesOfLanguageMapping[sMappingLanguage] ? _oExpectedValuesOfLanguageMapping[sMappingLanguage] : "en";
		QUnit.module("Translation mode - language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function () {
				this.oEditor = EditorQunitUtils.createEditor(sLanguage);
				this.oEditor.setMode("translation");
			},
			afterEach: function () {
				EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
				Localization.setLanguage("en");
			}
		}, function () {
			Object.keys(oEditorLanguages).forEach(function(sEditorLanguage) {
				var sMappingLanguageTrans = _oLanguageMapping[sEditorLanguage];
				var sMappingLanguageValueTrans = _oExpectedValuesOfLanguageMapping[sMappingLanguageTrans] ? _oExpectedValuesOfLanguageMapping[sMappingLanguageTrans] : "en";

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						manifest: {
							"sap.app": {
								"id": "test.sample",
								"i18n": "../i18n/i18n.properties"
							},
							"sap.card": {
								"designtime": "designtime/1string",
								"type": "List",
								"configuration": {
									"parameters": {
										"stringParameter": {
											"value": "{i18n>STRINGPARAMETERVALUE_UNDERLINE}"
										}
									}
								}
							}
						}
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
							assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
							assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								assert.equal(oField1Ori.getAggregation("_field").getText(), "StringParameter Value Trans in i18n " + sMappingLanguageValue, "Field1Ori: StringParameter Value Trans in i18n " + sMappingLanguageValue);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.equal(oField1Trans.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n " + sMappingLanguageValueTrans, "Field1Trans: StringParameter Value Trans in i18n " + sMappingLanguageValueTrans);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
