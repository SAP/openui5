/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/sinon-4",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/integration/util/Utils",
	"sap/base/util/deepClone",
	"sap/base/util/LoaderExtensions"
], function (
	Localization,
	sinon,
	EditorQunitUtils,
	Utils,
	deepClone,
	LoaderExtensions
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oLanguages = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
		dataType: "json",
		failOnError: false,
		async: false
	});

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

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
			"default": "StringParameter Value Trans in i18n en"
		},
		"string2": {
			"default": "StringParameter Value Trans in i18n en"
		},
		"string1string2": {
			"default": "StringParameter Value Trans in i18n en"
		}
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

	var oSubLanguageMappingForString1 = EditorQunitUtils.getRandomPropertiesOfObject(_oLanguageMapping);
	var oSubLanguageMappingForString2 = EditorQunitUtils.getRandomPropertiesOfObject(_oLanguageMapping);
	Object.keys(oSubLanguageMappingForString1).forEach(function(sLanguage) {
		_oTextsOfString1[sLanguage] = {};
		_oTextsOfString1[sLanguage][_sManifestPath] = "String1 " + sLanguage;
		var sLanguageValue = oSubLanguageMappingForString1[sLanguage];
		_oExpectedValuesOfChangesWithTransFormat["string1"][sLanguageValue] = "String1 " + sLanguage;
	});

	Object.keys(oSubLanguageMappingForString2).forEach(function(sLanguage) {
		_oTextsOfString2[sLanguage] = {};
		_oTextsOfString2[sLanguage][_sManifestPath] = "String2 " + sLanguage;
		var sLanguageValue = oSubLanguageMappingForString2[sLanguage];
		_oExpectedValuesOfChangesWithTransFormat["string2"][sLanguageValue] = "String2 " + sLanguage;
	});

	_oExpectedValuesOfChangesWithTransFormat["string1string2"] = Object.assign({}, _oExpectedValuesOfChangesWithTransFormat["string1"], _oExpectedValuesOfChangesWithTransFormat["string2"]);

	var aLanguageMappingValues = Object.values(_oLanguageMapping);
	Object.keys(_oLanguageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = _oLanguageMapping[sLanguage];
		QUnit.module("Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function () {
				this.oEditor = EditorQunitUtils.createEditor(sLanguage);
				this.oEditor.setMode("all");
			},
			afterEach: function () {
				EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
				Localization.setLanguage("en");
			}
		}, function () {
			QUnit.test("1 string parameter with Admin, Content and Translation translations", function (assert) {
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges.texts = _oTextsOfString1;
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges.texts = _oTextsOfString2;
				var oTranslationChanges = deepClone(_oTranslationChangeBase, 500);
				oTranslationChanges[_sManifestPath] = "String3 translation";
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
					},
					manifestChanges: [oAdminChanges, oContentChanges, oTranslationChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oField.getAggregation("_field").getValue(), "String3 translation", "Field value : String3 translation");
							var oValueHelpIcon = oField.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
							assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
							oValueHelpIcon.firePress();
							oValueHelpIcon.focus();
							EditorQunitUtils.wait().then(function () {
								var oTranslationPopover = oField._oTranslationPopover;
								var aHeaderItems1 = oTranslationPopover.getCustomHeader().getItems();
								assert.equal(aHeaderItems1[0].getText(), this.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover Header: Title");
								assert.equal(aHeaderItems1[1].getText(), this.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover Header: Current Language");
								assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguages[sMappingLanguage], "oTranslationPopover Header: " + oLanguages[sMappingLanguage]);
								assert.equal(oField.getAggregation("_field").getValue(), "String3 translation", "Field value : String3 translation");
								assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover Header: Editable false");
								assert.equal(aHeaderItems1[3].getText(), this.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover Header: Other Languages");
								assert.ok(oTranslationPopover.getContent()[0].isA("sap.m.List"), "oTranslationPopover Content: List");
								var oLanguageItems1 = oTranslationPopover.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 48, "oTranslationPopover Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var sLanguageKey = oLanguageItems1[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1string2"][sLanguageKey];
									if (!sExpectedValue) {
										sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1string2"]["default"];
										if (aLanguageMappingValues.indexOf(sLanguageKey) > -1 && _oExpectedValuesOfLanguageMapping[sLanguageKey]) {
											sExpectedValue = "StringParameter Value Trans in i18n " + _oExpectedValuesOfLanguageMapping[sLanguageKey];
										}
									}
									var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover Content: item " + i + " " + sLanguageKey + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton1 = oTranslationPopover.getFooter().getContent()[2];
								oCancelButton1.firePress();
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
