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
	var _oTextsOfString2 = {
		"ms": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 ms"
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
			"/sap.card/configuration/parameters/stringParameter/value": "String2 ro"
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS"
		},
		"th": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 th"
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
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String1 ms",
			"th": "String1 th"
		},
		"string2": {
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th"
		},
		"string1string2": {
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

	var oSubLanguages = EditorQunitUtils.getRandomPropertiesOfObject(Utils.languageMapping);
	var oEditorLanguages = deepClone(oSubLanguages, 500);

	Object.keys(oSubLanguages).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
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
				var sMappingEditorLanguage = Utils.languageMapping[sEditorLanguage];
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
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								assert.equal(oField1Ori.getAggregation("_field").getText(), "StringParameter Value Trans in i18n " + sMappingLanguage, "Field1Ori: StringParameter Value Trans in i18n " + sMappingLanguage);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.equal(oField1Trans.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n " + Utils.languageMapping[sEditorLanguage], "Field1Trans: StringParameter Value Trans in i18n " + Utils.languageMapping[sEditorLanguage]);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Admin change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
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
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Content change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oContentChanges = deepClone(_oContentChangeBase, 500);
					oContentChanges.texts = _oTextsOfString2;
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
						manifestChanges: [oContentChanges]
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
								var sExpectedValueOfOriText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Translation change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
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
											"value": "{i18n>STRINGPARAMETERVALUE}"
										}
									}
								}
							}
						},
						manifestChanges: [oTranslationChanges]
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
								var sExpectedValueOfOriText = sLanguage === sEditorLanguage ? "String3 translation" : "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.equal(oField1Trans.getAggregation("_field").getValue(), "String3 translation", "Field1Trans: String3 translation");
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
