/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
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

	QUnit.module("Basic", {
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

		QUnit.test("update translation values and change property value to another normal value", function (assert) {
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

		QUnit.test("update translation values and change property value to {i18n>KEY} format", function (assert) {
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
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
