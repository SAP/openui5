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

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	var _oTextsWithBCChangeOfString1 = {
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
		"th-TH": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 th-TH"
		}
	};
	var _oTextsWithChangeOfString1 = {
		"cy-GB": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 cy-GB1"
		},
		"da": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 da"
		},
		"hu": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 hu"
		},
		"nl": {
			"/sap.card/configuration/parameters/stringParameter/value": "String1 nl"
		}
	};
	var _oTextsWithBCChangeOfString2 = {
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
	var _oTextsWithChangeOfString2 = {
		"ms": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 ms"
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 sr-RS1"
		},
		"ro": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 ro"
		},
		"nl": {
			"/sap.card/configuration/parameters/stringParameter/value": "String2 nl"
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
	var _oExpectedValuesOfBCChange = {
		"string1": {
			"cy-GB": "String1 cy-GB",
			"da": "String1 da-DK",
			"hi": "String1 hi-IN",
			"hu": "String1 hu-HU",
			"id": "String1 id-ID",
			"ms": "String1 ms-MY",
			"nl": "String1 nl-NL",
			"th": "String1 th-TH"
		},
		"string2": {
			"ms": "String2 ms-MY",
			"nl": "String2 nl-NL",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl-PL",
			"ro": "String2 ro-RO",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th-TH"
		},
		"string1string2": {
			"default_in_en": "StringParameter Value Trans in i18n",
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
	var _oExpectedValuesOfChangeAndBCChange = {
		"string1": {
			"cy-GB": "String1 cy-GB1",
			"da": "String1 da",
			"hi": "String1 hi-IN",
			"hu": "String1 hu",
			"id": "String1 id-ID",
			"ms": "String1 ms-MY",
			"nl": "String1 nl",
			"th": "String1 th-TH"
		},
		"string2": {
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl-PL",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS1",
			"th": "String2 th-TH"
		},
		"string1string2": {
			"default_in_en": "StringParameter Value Trans in i18n",
			"cy-GB": "String1 cy-GB1",
			"da": "String1 da",
			"hi": "String1 hi-IN",
			"hu": "String1 hu",
			"id": "String1 id-ID",
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl-PL",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS1",
			"th": "String2 th-TH"
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
				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Admin BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oAdminChange = deepClone(_oAdminChangeBase, 500);
					oAdminChange.texts = _oTextsWithBCChangeOfString1;
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
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfBCChange["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfBCChange["string1"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Admin change and BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oAdminChange = deepClone(_oAdminChangeBase, 500);
					var oTextsWIthChangeAndBCChangeOfString1 = Object.assign({}, _oTextsWithBCChangeOfString1, _oTextsWithChangeOfString1);
					oAdminChange.texts = oTextsWIthChangeAndBCChangeOfString1;
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
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfChangeAndBCChange["string1"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfChangeAndBCChange["string1"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Content BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oContentChange = deepClone(_oContentChangeBase, 500);
					oContentChange.texts = _oTextsWithBCChangeOfString2;
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
						manifestChanges: [oContentChange]
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfBCChange["string2"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfBCChange["string2"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Content change and BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oContentChange = deepClone(_oContentChangeBase, 500);
					var oTextsWIthChangeAndBCChangeOfString2 = Object.assign({}, _oTextsWithBCChangeOfString2, _oTextsWithChangeOfString2);
					oContentChange.texts = oTextsWIthChangeAndBCChangeOfString2;
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
						manifestChanges: [oContentChange]
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfChangeAndBCChange["string2"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfChangeAndBCChange["string2"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Admin BC change, Content BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oAdminChange = deepClone(_oAdminChangeBase, 500);
					oAdminChange.texts = _oTextsWithBCChangeOfString1;
					var oContentChange = deepClone(_oContentChangeBase, 500);
					oContentChange.texts = _oTextsWithBCChangeOfString2;
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
						manifestChanges: [oAdminChange, oContentChange]
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfBCChange["string1string2"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfBCChange["string1string2"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
							}).then(function () {
								resolve();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Editor language - " + sEditorLanguage + " : 1 string parameter with Admin change and BC change, Content change and BC change", function (assert) {
					this.oEditor.setLanguage(sEditorLanguage);
					var oAdminChange = deepClone(_oAdminChangeBase, 500);
					var oTextsWIthChangeAndBCChangeOfString1 = Object.assign({}, _oTextsWithBCChangeOfString1, _oTextsWithChangeOfString1);
					oAdminChange.texts = oTextsWIthChangeAndBCChangeOfString1;
					var oContentChange = deepClone(_oContentChangeBase, 500);
					var oTextsWIthChangeAndBCChangeOfString2 = Object.assign({}, _oTextsWithBCChangeOfString2, _oTextsWithChangeOfString2);
					oContentChange.texts = oTextsWIthChangeAndBCChangeOfString2;
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
						manifestChanges: [oAdminChange, oContentChange]
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							var oLabel = this.oEditor.getAggregation("_formContent")[2];
							assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
							assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
							var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
							EditorQunitUtils.wait().then(function () {
								var sExpectedValueOfOriText = _oExpectedValuesOfChangeAndBCChange["string1string2"][sMappingLanguage] || "StringParameter Value Trans in i18n " + sMappingLanguage;
								assert.equal(oField1Ori.getAggregation("_field").getText(), sExpectedValueOfOriText, "Field1Ori: " + sExpectedValueOfOriText);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								var sExpectedValueOfTransText = _oExpectedValuesOfChangeAndBCChange["string1string2"][sMappingEditorLanguage] || "StringParameter Value Trans in i18n " + sMappingEditorLanguage;
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sExpectedValueOfTransText, "Field1Trans: " + sExpectedValueOfTransText);
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
