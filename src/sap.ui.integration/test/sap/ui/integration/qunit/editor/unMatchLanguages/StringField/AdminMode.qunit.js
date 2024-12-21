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

	var _oTextsOfString1 = {
		"cy-GB": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB"
		},
		"da": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 da"
		},
		"hi": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 hi"
		},
		"hu": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 hu"
		},
		"id": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 id"
		},
		"ms": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 ms"
		},
		"th": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 th"
		}
	};
	var _oAdminChangeBase = {
		":layer": 0,
		":errors": false
	};
	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default_in_en": "StringParameter Value Trans in i18n",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String1 ms",
			"th": "String1 th"
		}
	};

	var aLanguageMappingValues = Object.values(Utils.languageMapping);
	Object.keys(Utils.languageMapping).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
		QUnit.module("Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function () {
				this.oEditor = EditorQunitUtils.createEditor(sLanguage);
				this.oEditor.setMode("admin");
			},
			afterEach: function () {
				EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
				Localization.setLanguage("en");
			}
		}, function () {
			QUnit.test("1 string parameter", function (assert) {
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
										"value": "{i18n>STRINGPARAMETERVALUE}"
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
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n " + sMappingLanguage, "Field value : StringParameter Value Trans in i18n " + sMappingLanguage);
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
								assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "StringParameter Value Trans in i18n " + sMappingLanguage, "oTranslationPopover Header: String1 Value");
								assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover Header: Editable false");
								assert.equal(aHeaderItems1[3].getText(), this.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover Header: Other Languages");
								assert.ok(oTranslationPopover.getContent()[0].isA("sap.m.List"), "oTranslationPopover Content: List");
								var oLanguageItems1 = oTranslationPopover.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 48, "oTranslationPopover Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var sLanguageKey = oLanguageItems1[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1"]["default_in_en"];
									if (aLanguageMappingValues.indexOf(sLanguageKey) > -1) {
										sExpectedValue = "StringParameter Value Trans in i18n " + sLanguageKey;
									}
									if (sLanguageKey.startsWith("fr")) {
										sExpectedValue = "StringParameter Value Trans in i18n France";
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

			QUnit.test("1 string parameter with Admin change", function (assert) {
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges.texts = _oTextsOfString1;
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
										"value": "{i18n>STRINGPARAMETERVALUE}"
									}
								}
							}
						}
					},
					manifestChanges: [oAdminChanges]
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
							var sExpectedValueOfText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
							assert.equal(oField.getAggregation("_field").getValue(), sExpectedValueOfText, "Field value : " + sExpectedValueOfText);
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
								assert.equal(aHeaderItems1[2].getItems()[1].getValue(),sExpectedValueOfText, "oTranslationPopover Header: String1 Value");
								assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover Header: Editable false");
								assert.equal(aHeaderItems1[3].getText(), this.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover Header: Other Languages");
								assert.ok(oTranslationPopover.getContent()[0].isA("sap.m.List"), "oTranslationPopover Content: List");
								var oLanguageItems1 = oTranslationPopover.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 48, "oTranslationPopover Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var sLanguageKey = oLanguageItems1[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguageKey];
									if (!sExpectedValue) {
										sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1"]["default_in_en"];
										if (aLanguageMappingValues.indexOf(sLanguageKey) > -1) {
											sExpectedValue = "StringParameter Value Trans in i18n " + sLanguageKey;
										}
										if (sLanguageKey.startsWith("fr")) {
											sExpectedValue = "StringParameter Value Trans in i18n France";
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
