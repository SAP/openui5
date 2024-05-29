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

	var _oTextsWIthBCChange = {
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
		"nl-NL": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 nl-NL"
		},
		"nb-NO": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 nb-NO"
		},
		"pl-PL": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 pl-PL"
		},
		"ro-RO": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 ro-RO"
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 sr-RS"
		},
		"th-TH": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 th-TH"
		}
	};
	var _oTextsWithChange = {
		"cy-GB": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB1"
		},
		"da": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 da"
		},
		"hu": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 hu"
		},
		"ms": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 ms"
		},
		"nl": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 nl"
		},
		"nb-NO": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 nb-NO1"
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 sr-RS1"
		}
	};
	var _oAdminChangeBase = {
		":layer": 0,
		":errors": false
	};
	var _oExpectedValuesOfBCChange = {
		"string1": {
			"default_in_en": "StringParameter Value Trans in i18n",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da-DK",
			"hi": "String1 hi-IN",
			"hu": "String1 hu-HU",
			"id": "String1 id-ID",
			"ms": "String1 ms-MY",
			"nl": "String1 nl-NL",
			"nb-NO": "String1 nb-NO",
			"pl": "String1 pl-PL",
			"ro": "String1 ro-RO",
			"sr-RS": "String1 sr-RS",
			"th": "String1 th-TH"
		}
	};
	var _oExpectedValuesOfChangeAndBCChange = {
		"string1": {
			"default_in_en": "StringParameter Value Trans in i18n",
			"cy-GB": "String1 cy-GB1",
			"da": "String1 da",
			"hi": "String1 hi-IN",
			"hu": "String1 hu",
			"id": "String1 id-ID",
			"ms": "String1 ms",
			"nl": "String1 nl",
			"nb-NO": "String1 nb-NO1",
			"pl": "String1 pl-PL",
			"ro": "String1 ro-RO",
			"sr-RS": "String1 sr-RS1",
			"th": "String1 th-TH"
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
			QUnit.test("1 string parameter with Admin BC change", function (assert) {
				var oAdminChange = deepClone(_oAdminChangeBase, 500);
				oAdminChange.texts = _oTextsWIthBCChange;
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
					manifestChanges: [oAdminChange]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						EditorQunitUtils.wait().then(function () {
							var sExpectedValueOfText = _oExpectedValuesOfBCChange["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
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
									var sExpectedValue = _oExpectedValuesOfBCChange["string1"][sLanguageKey];
									if (!sExpectedValue) {
										sExpectedValue = _oExpectedValuesOfBCChange["string1"]["default_in_en"];
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

			QUnit.test("1 string parameter with Admin change and BC change", function (assert) {
				var oAdminChange = deepClone(_oAdminChangeBase, 500);
				var oTextsWIthChangeAndBCChange = Object.assign({}, _oTextsWIthBCChange, _oTextsWithChange);
				oAdminChange.texts = oTextsWIthChangeAndBCChange;
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
					manifestChanges: [oAdminChange]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						EditorQunitUtils.wait().then(function () {
							var sExpectedValueOfText = _oExpectedValuesOfChangeAndBCChange["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
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
									var sExpectedValue = _oExpectedValuesOfChangeAndBCChange["string1"][sLanguageKey];
									if (!sExpectedValue) {
										sExpectedValue = _oExpectedValuesOfChangeAndBCChange["string1"]["default_in_en"];
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
