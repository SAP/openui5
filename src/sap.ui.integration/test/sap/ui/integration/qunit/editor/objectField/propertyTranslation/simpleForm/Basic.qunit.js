/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldWithPropertiesDefinedWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithPropertiesDefined",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefined": {}
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

	var _oOriginExpectedValues = {
		"string1": {
			"default": "String 1 English",
			"en": "String 1 English",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String 1 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA"
		},
		"string2": {
			"default": "String 2 English",
			"en": "String 2 English",
			"en-US": "String 2 US English",
			"es-MX": "String 2 Spanish MX",
			"fr": "String 2 French",
			"fr-FR": "String 2 French",
			"fr-CA": "String 2 French CA"
		},
		"string3": {
			"default": "String 3 English",
			"en": "String 3 English",
			"en-US": "String 3 US English",
			"es": "String 3 Spanish",
			"es-MX": "String 3 Spanish",
			"fr": "String 3 French",
			"fr-FR": "String 3 French",
			"fr-CA": "String 3 French CA"
		},
		"string4": {
			"default": "String 4 English",
			"en": "String 4 English",
			"en-US": "String 4 US English",
			"fr": "String 4 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 4 French CA"
		}
	};
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	function cleanUUID(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("Translation type : key", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("check translation icon", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							assert.ok(oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon exist");
							assert.ok(oFormField._oValueHelpIcon.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oFormField._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oFormField._oValueHelpIcon.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oFormField.setValue("string1");
							oFormField.fireChange({ value: "string1"});
							wait().then(function () {
								assert.ok(oFormField.getValue() === "string1", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string1"}), "Field 1: DT Value updated");
								assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
								assert.ok(oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon exist");
								assert.ok(!oFormField._oValueHelpIcon.getVisible(), "SimpleForm field 1: Value help icon not visible");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check translation values for {{KEY}} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{{string1}}");
						oFormField.fireChange({ value: "{{string1}}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oCancelButton1.firePress();
								oFormField.setValue("{{string2}}");
								oFormField.fireChange({ value: "{{string2}}"});
								wait().then(function () {
									assert.ok(oFormField.getValue() === "{i18n>string2}", "SimpleForm field 1: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string2}"}), "Field 1: DT Value updated");
									assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
									assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
									oValueHelpIcon1.firePress();
									wait().then(function () {
										var oTranslationPopover1 = oField._oTranslationPopover;
										var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check translation values for {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("change translation values but reset", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
								assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
								oResetButton1.firePress();
								wait().then(function () {
									assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
									assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
									var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
									assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
									var sUUID = oField._getCurrentProperty("value")._dt._uuid;
									var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
									assert.ok(!sTranslationTextOfEN, "Texts: no value");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
								assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
								oSaveButton1.firePress();
								wait().then(function () {
									oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
									assert.ok(oLanguageItems1.length === 51, "oTranslationPopover1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											if (sLanguage === "en") {
												sExpectedValue = "string1 en";
											}
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
									var sUUID = oField._getCurrentProperty("value")._dt._uuid;
									var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

									oDeleteButton.firePress();
									wait().then(function () {
										assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");
										sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.ok(!sTranslationTextOfEN, "Texts: no value");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and change property value to normal value to close translation feature", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
								assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
								oSaveButton1.firePress();
								wait().then(function () {
									oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
									assert.ok(oLanguageItems1.length === 51, "oTranslationPopover1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											if (sLanguage === "en") {
												sExpectedValue = "string1 en";
											}
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
									var sUUID = oField._getCurrentProperty("value")._dt._uuid;
									var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

									oFormField.setValue("string value 2");
									oFormField.fireChange({ value: "string value 2"});
									wait().then(function () {
										assert.ok(oFormField.getValue() === "string value 2", "SimpleForm field 1: Has new value");
										assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 2"}), "Field 1: DT Value updated");
										assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
										var oValueHelpIcon1 = oFormField._oValueHelpIcon;
										assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
										assert.ok(!oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon not visible");
										sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.ok(!sTranslationTextOfEN, "Texts: no value");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and change property value to another {i18n>KEY}", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(oFormField.getValue() === "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField.setValue("{i18n>string1}");
						oFormField.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										if (sLanguage === "en"){
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
								}
								assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button enabled");
								assert.ok(oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button enabled");
								oSaveButton1.firePress();
								wait().then(function () {
									oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
									assert.ok(oLanguageItems1.length === 51, "oTranslationPopover1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											if (sLanguage === "en") {
												sExpectedValue = "string1 en";
											}
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value");
									var sUUID = oField._getCurrentProperty("value")._dt._uuid;
									var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

									oFormField.setValue("{i18n>string2}");
									oFormField.fireChange({ value: "{i18n>string2}"});
									wait().then(function () {
										assert.ok(oFormField.getValue() === "{i18n>string2}", "SimpleForm field 1: Has new value");
										assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "{i18n>string2}"}), "Field 1: DT Value updated");
										assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
										var oValueHelpIcon1 = oFormField._oValueHelpIcon;
										assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
										assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
										sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");
										oValueHelpIcon1.firePress();
										wait().then(function () {
											oTranslationPopover1 = oField._oTranslationPopover;
											oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
											for (var i = 0; i < oLanguageItems1.length; i++) {
												var oCustomData = oLanguageItems1[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
													if (sLanguage === "en"){
														sExpectedValue = "string1 en";
													}
													var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
													assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											resolve();
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Translation type : property", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("check translation icon", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
						assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oFormField3._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oFormField3._oValueHelpIcon.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oFormField3.setValue("text value 1");
						oFormField3.fireChange({ value: "text value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value updated");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
						assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
						oFormField3.setValue("{i18n>string1}");
						oFormField3.fireChange({ value: "{i18n>string1}"});
						wait().then(function () {
							assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 3: Has new value");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
							assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
							oFormField3.setValue("string1");
							oFormField3.fireChange({ value: "string1"});
							wait().then(function () {
								assert.ok(oFormField3.getValue() === "string1", "SimpleForm field 3: Has new value");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string1"}), "Field 1: DT Value updated");
								assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
								assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
								assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check translation values", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oLanguageItems1 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems1.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var oCustomData = oLanguageItems1[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = "";
									var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
							}
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							oCancelButton3.firePress();
							oFormField3.setValue("text value 1");
							oFormField3.fireChange({ value: "text value 1"});
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value updated");
							oValueHelpIcon3.firePress();
							wait().then(function () {
								oLanguageItems1 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems1.length === 50, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text value 1";
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oCancelButton3.firePress();
								oFormField3.setValue("{i18n>string1}");
								oFormField3.fireChange({ value: "{i18n>string1}"});
								wait().then(function () {
									assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 1: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
									assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
									oValueHelpIcon1.firePress();
									wait().then(function () {
										var oTranslationPopover1 = oField._oTranslationPopover;
										var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.ok(oLanguageItems1.length === 50, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and delete for normal string value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("text value 1");
						oFormField3.fireChange({ value: "text value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = "text value 1";
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("text value 1 en");
										oInput.fireChange({ value: "text value 1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text value 1";
										if (sLanguage === "en") {
											sExpectedValue = "text value 1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "text value 1 en", "Texts: Translation text of EN correct");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(!sTranslationTextOfEN, "Texts: no value");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values and delete for {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("{i18n>string1}");
						oFormField3.fireChange({ value: "{i18n>string1}"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										if (sLanguage === "en") {
											sExpectedValue = "string1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(!sTranslationTextOfEN, "Texts: no value");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("change translation values but reset for normal string value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("text value 1");
						oFormField3.fireChange({ value: "text value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = "text value 1";
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("text value 1 en");
										oInput.fireChange({ value: "text value 1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oResetButton3.firePress();
							wait().then(function () {
								assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
								assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text value 1";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "text value 1"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(!sTranslationTextOfEN, "Texts: no value");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("change translation values but reset for {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("{i18n>string1}");
						oFormField3.fireChange({ value: "{i18n>string1}"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oResetButton3.firePress();
							wait().then(function () {
								assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
								assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(!sTranslationTextOfEN, "Texts: no value");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values for normal value and change property value to another normal value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("string value 1");
						oFormField3.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 1"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = "string value 1";
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "string value 1";
										if (sLanguage === "en") {
											sExpectedValue = "string1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 1"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

								oFormField3.setValue("string value 2");
								oFormField3.fireChange({ value: "string value 2"});
								wait().then(function () {
									assert.ok(oFormField3.getValue() === "string value 2", "SimpleForm field 3: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 2"}), "Field 1: DT Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									oValueHelpIcon3 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");
									oValueHelpIcon3.firePress();
									wait(1500).then(function () {
										oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
										assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
										for (var i = 0; i < oLanguageItems3.length; i++) {
											var oCustomData = oLanguageItems3[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = "string value 2";
												if (sLanguage === "en"){
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values for normal value and change property value to {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("string value 1");
						oFormField3.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 1"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = "string value 1";
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "string value 1";
										if (sLanguage === "en") {
											sExpectedValue = "string1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 1"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

								oFormField3.setValue("{i18n>string1}");
								oFormField3.fireChange({ value: "{i18n>string1}"});
								wait().then(function () {
									assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 3: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									oValueHelpIcon3 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");
									oValueHelpIcon3.firePress();
									wait(1500).then(function () {
										oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
										assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
										for (var i = 0; i < oLanguageItems3.length; i++) {
											var oCustomData = oLanguageItems3[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en"){
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values for {i18n>KEY} format and change property value to normal value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("{i18n>string1}");
						oFormField3.fireChange({ value: "{i18n>string1}"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										if (sLanguage === "en") {
											sExpectedValue = "string1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

								oFormField3.setValue("string value 2");
								oFormField3.fireChange({ value: "string value 2"});
								wait().then(function () {
									assert.ok(oFormField3.getValue() === "string value 2", "SimpleForm field 3: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "string value 2"}), "Field 1: DT Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									oValueHelpIcon3 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");
									oValueHelpIcon3.firePress();
									wait(1500).then(function () {
										oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
										assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
										for (var i = 0; i < oLanguageItems3.length; i++) {
											var oCustomData = oLanguageItems3[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = "string value 2";
												if (sLanguage === "en"){
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update translation values for {i18n>KEY} format and change property value to another {i18n>KEY} format", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
						var oFormLabel3 = oContents[4];
						var oFormField3 = oContents[5];
						assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
						assert.ok(oFormField3.getValue() === "", "SimpleForm field 3: Has No value");
						assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						oFormField3.setValue("{i18n>string1}");
						oFormField3.fireChange({ value: "{i18n>string1}"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value updated");

						var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
						assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
						assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						oValueHelpIcon3.firePress();
						wait(1500).then(function () {
							var oTranslationPopover3 = oField._oTranslationPopover;
							var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
							assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
							assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
							var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
							assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
							assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
							var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
							assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
							assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
							var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
							assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
							for (var i = 0; i < oLanguageItems3.length; i++) {
								var oCustomData = oLanguageItems3[i].getCustomData();
								if (oCustomData && oCustomData.length > 0) {
									var sLanguage = oCustomData[0].getKey();
									var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									if (sLanguage === "en"){
										var oInput = oLanguageItems3[i].getContent()[0].getItems()[1];
										oInput.setValue("string1 en");
										oInput.fireChange({ value: "string1 en"});
										break;
									}
								}
							}
							assert.ok(oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button enabled");
							assert.ok(oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button enabled");
							oSaveButton3.firePress();
							wait().then(function () {
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.ok(oLanguageItems3.length === 51, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										if (sLanguage === "en") {
											sExpectedValue = "string1 en";
										}
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string1}"}), "Field 1: DT Value");
								var sUUID = oField._getCurrentProperty("value")._dt._uuid;
								var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
								assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");

								oFormField3.setValue("{i18n>string2}");
								oFormField3.fireChange({ value: "{i18n>string2}"});
								wait().then(function () {
									assert.ok(oFormField3.getValue() === "{i18n>string2}", "SimpleForm field 3: Has new value");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"text": "{i18n>string2}"}), "Field 1: DT Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									oValueHelpIcon3 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
									sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "text");
									assert.ok(sTranslationTextOfEN === "string1 en", "Texts: Translation text of EN correct");
									oValueHelpIcon3.firePress();
									wait(1500).then(function () {
										oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
										assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
										for (var i = 0; i < oLanguageItems3.length; i++) {
											var oCustomData = oLanguageItems3[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
												if (sLanguage === "en"){
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
