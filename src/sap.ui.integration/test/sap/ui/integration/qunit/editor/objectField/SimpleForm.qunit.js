/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/MockServer",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Localization,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer,
	deepClone,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var oManifestForObjectFieldWithPropertiesDefined = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithPropertiesDefined",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefined": {
						"value": { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "int": 1 , "editable": true, "number": 3.55 }
					}
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

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

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

	function cleanDT(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				delete oResult._dt;
			});
		} else if (typeof oClonedValue === "object") {
			delete oClonedValue._dt;
		}
		return oClonedValue;
	}

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("no value: add, update", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
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
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label 2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 2: Has No value");
						oFormField.setValue("icon value 1");
						oFormField.fireChange({ value: "icon value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 3: Has No value");
						oFormField.setValue("text value 1");
						oFormField.fireChange({ value: "text value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "URL", "SimpleForm label 4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 4: Has No value");
						oFormField.setValue("url value 1");
						oFormField.fireChange({ value: "url value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label 5: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 5: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field 5: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 5: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 5: Editable");
						assert.ok(!oFormField.getSelected(), "SimpleForm field 5: Has No value");
						oFormField.setSelected(true);
						oFormField.fireSelect({ selected: true});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true}), "Field 1: DT Value updated");

						oFormLabel = oContents[10];
						oFormField = oContents[11];
						assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label 6: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 6: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 6: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 6: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 6: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 6: Has No value");
						oFormField.setValue(3);
						oFormField.fireChange({ value: 3});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3}), "Field 1: DT Value updated");

						oFormLabel = oContents[12];
						oFormField = oContents[13];
						assert.equal(oFormLabel.getText(), "Number", "SimpleForm label 7: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 7: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 7: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 7: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 7: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 7: Has No value");
						oFormField.setValue(3.11);
						oFormField.fireChange({ value: 3.11});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3, "number": 3.11}), "Field 1: DT Value updated");

						oFormLabel = oContents[14];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label 8: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label 8: Not Visible");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "SimpleForm Field 8: TextArea Field");
						assert.ok(!oTextArea.getVisible(), "SimpleForm Field 8: Not Visible");
						assert.ok(oTextArea.getEditable(), "SimpleForm Field 8: Editable");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), {"key": "string value 1","icon": "icon value 1","text": "text value 1","url": "url value 1","editable": true,"int": 3,"number": 3.11}), "SimpleForm field 8: Has value");
						var oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefined/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("{} as value: add, update", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithPropertiesDefined",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefined": {
									"value": {}
								}
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
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 2: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), "{}", "SimpleForm field textArea: Has value {}");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label 2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 2: Has No value");
						oFormField.setValue("icon value 1");
						oFormField.fireChange({ value: "icon value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 3: Has No value");
						oFormField.setValue("text value 1");
						oFormField.fireChange({ value: "text value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "URL", "SimpleForm label 4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 4: Has No value");
						oFormField.setValue("url value 1");
						oFormField.fireChange({ value: "url value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label 5: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 5: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field 5: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 5: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 5: Editable");
						assert.ok(!oFormField.getSelected(), "SimpleForm field 5: Has No value");
						oFormField.setSelected(true);
						oFormField.fireSelect({ selected: true});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true}), "Field 1: DT Value updated");

						oFormLabel = oContents[10];
						oFormField = oContents[11];
						assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label 6: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 6: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 6: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 6: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 6: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 6: Has No value");
						oFormField.setValue(3);
						oFormField.fireChange({ value: 3});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3}), "Field 1: DT Value updated");

						oFormLabel = oContents[12];
						oFormField = oContents[13];
						assert.equal(oFormLabel.getText(), "Number", "SimpleForm label 7: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 7: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 7: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 7: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 7: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 7: Has No value");
						oFormField.setValue(3.11);
						oFormField.fireChange({ value: 3.11});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3, "number": 3.11}), "Field 1: DT Value updated");

						oFormLabel = oContents[14];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label 8: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label 8: Not Visible");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "SimpleForm Field 8: TextArea Field");
						assert.ok(!oTextArea.getVisible(), "SimpleForm Field 8: Not Visible");
						assert.ok(oTextArea.getEditable(), "SimpleForm Field 8: Editable");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), {"key": "string value 1","icon": "icon value 1","text": "text value 1","url": "url value 1","editable": true,"int": 3,"number": 3.11}), "SimpleForm field 8: Has value");
						var oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefined/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefined
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Has value");
						oFormField.setValue("key01 1");
						oFormField.fireChange({ value: "key01 1" });
						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
						assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Has value");
						oFormField.setValue("sap-icon://accept 1");
						oFormField.fireChange({ value: "sap-icon://accept 1" });
						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
						assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Has value");
						oFormField.setValue("text01 1");
						oFormField.fireChange({ value: "text01 1" });
						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
						assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Has value");
						oFormField.setValue("https://sap.com/06 1");
						oFormField.fireChange({ value: "https://sap.com/06 1" });
						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
						assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
						assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
						oFormField.setSelected(false);
						oFormField.fireSelect({ selected: false });
						oFormLabel = oContents[10];
						oFormField = oContents[11];
						assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
						assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Has value");
						oFormField.setValue("2");
						oFormField.fireChange({value: "2"});
						oFormLabel = oContents[12];
						oFormField = oContents[13];
						assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
						assert.equal(oFormField.getValue(), "3.6", "SimpleForm field7: Has value");
						oFormField.setValue("4.55");
						oFormField.fireChange({ value: "4.55"});
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						oDeleteButton.firePress();
						var oSwitchModeButton = oSimpleForm.getToolbar().getContent()[1];
						oSwitchModeButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
							oContents = oSimpleForm.getContent();
							oFormLabel = oContents[0];
							oFormField = oContents[1];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.equal(oFormField.getValue(), '', "SimpleForm Field8: Has No value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": true,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
								assert.equal(oFormField.getValue(), "key01 2", "SimpleForm field1: Value changed");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
								assert.equal(oFormField.getValue(), "sap-icon://accept 2", "SimpleForm field2: Value changed");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
								assert.equal(oFormField.getValue(), "text01 2", "SimpleForm field3: Value changed");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
								assert.equal(oFormField.getValue(), "https://sap.com/06 2", "SimpleForm field4: Value changed");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
								assert.ok(oFormField.getSelected(), "SimpleForm field5: Value changed");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
								assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Value changed");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
								assert.equal(oFormField.getValue(), "5.6", "SimpleForm field7: Value changed");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
								assert.equal(oFormField.getValue(), sNewValue, "SimpleForm field5: Value changed");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefined
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Has value");
						oFormField.setValue("key01 1");
						oFormField.fireChange({ value: "key01 1" });
						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
						assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Has value");
						oFormField.setValue("sap-icon://accept 1");
						oFormField.fireChange({ value: "sap-icon://accept 1" });
						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
						assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Has value");
						oFormField.setValue("text01 1");
						oFormField.fireChange({ value: "text01 1" });
						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
						assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Has value");
						oFormField.setValue("https://sap.com/06 1");
						oFormField.fireChange({ value: "https://sap.com/06 1" });
						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
						assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
						assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
						oFormField.setSelected(false);
						oFormField.fireSelect({ selected: false });
						oFormLabel = oContents[10];
						oFormField = oContents[11];
						assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
						assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Has value");
						oFormField.setValue("2");
						oFormField.fireChange({value: "2"});
						oFormLabel = oContents[12];
						oFormField = oContents[13];
						assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
						assert.equal(oFormField.getValue(), "3.6", "SimpleForm field7: Has value");
						oFormField.setValue("4.55");
						oFormField.fireChange({ value: "4.55"});
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
						var oSwitchModeButton = oSimpleForm.getToolbar().getContent()[1];
						oSwitchModeButton.firePress();
						EditorQunitUtils.wait().then(function () {
							oContents = oSimpleForm.getContent();
							oFormLabel = oContents[0];
							oFormField = oContents[1];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(deepEqual(cleanDT(oFormField.getValue()), {"text": "text01 1","key": "key01 1","url": "https://sap.com/06 1","icon": "sap-icon://accept 1","int": 2,"editable": false,"number": 4.55}), "SimpleForm field8: Has value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": true,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
								assert.equal(oFormField.getValue(), "key01 2", "SimpleForm field1: Value changed");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
								assert.equal(oFormField.getValue(), "sap-icon://accept 2", "SimpleForm field2: Value changed");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
								assert.equal(oFormField.getValue(), "text01 2", "SimpleForm field3: Value changed");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
								assert.equal(oFormField.getValue(), "https://sap.com/06 2", "SimpleForm field4: Value changed");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
								assert.ok(oFormField.getSelected(), "SimpleForm field5: Value changed");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
								assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Value changed");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
								assert.equal(oFormField.getValue(), "5.6", "SimpleForm field7: Value changed");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
								assert.equal(oFormField.getValue(), sNewValue, "SimpleForm field5: Value changed");
								var oSettings = this.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefined/value"], JSON.parse(sNewValue), "Editor: field 1 setting value");
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("SpecialProperties", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("no value: add, update", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithSpecialPropertiesDefined",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithSpecialPropertiesDefined": {}
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
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object with special properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(!oDeleteButton.getEnabled(), "SimpleForm: Delete button is not enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 10, "SimpleForm: length");
						var oTextArea = oContents[9];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label 2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 2: Has No value");
						oFormField.setValue("text value 1");
						oFormField.fireChange({ value: "text value 1"});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "text": "text value 1"}), "Field 1: DT Value updated");

						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Type", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm Field 3: ComboBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
						assert.equal(oFormField.getSelectedKey(), "", "SimpleForm Field 3: Has No value");
						var aComboBoxItems = oFormField.getItems();
						assert.equal(aComboBoxItems.length, 6, "SimpleForm field3: ComboBox items length");
						assert.equal(aComboBoxItems[0].getKey(), "type01", "SimpleForm field3: ComboBox item1 key");
						assert.equal(aComboBoxItems[0].getText(), "Type 01", "SimpleForm field3: ComboBox item1 text");
						assert.equal(aComboBoxItems[1].getKey(), "type02", "SimpleForm field3: ComboBox item2 key");
						assert.equal(aComboBoxItems[1].getText(), "Type 02", "SimpleForm field3: ComboBox item2 text");
						assert.equal(aComboBoxItems[2].getKey(), "type03", "SimpleForm field3: ComboBox item3 key");
						assert.equal(aComboBoxItems[2].getText(), "Type 03", "SimpleForm field3: ComboBox item3 text");
						assert.equal(aComboBoxItems[3].getKey(), "type04", "SimpleForm field3: ComboBox item4 key");
						assert.equal(aComboBoxItems[3].getText(), "Type 04", "SimpleForm field3: ComboBox item4 text");
						assert.equal(aComboBoxItems[4].getKey(), "type05", "SimpleForm field3: ComboBox item5 key");
						assert.equal(aComboBoxItems[4].getText(), "Type 05", "SimpleForm field3: ComboBox item5 text");
						assert.equal(aComboBoxItems[5].getKey(), "type06", "SimpleForm field3: ComboBox item6 key");
						assert.equal(aComboBoxItems[5].getText(), "Type 06", "SimpleForm field3: ComboBox item6 text");
						oFormField.setSelectedKey("type05");
						oFormField.fireChange({ selectedItem: oFormField.getItems()[4] });
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "text": "text value 1", "type": "type05"}), "Field 1: DT Value updated");

						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "Object", "SimpleForm label 4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field 4: TextArea Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
						assert.equal(oFormField.getValue(), "", "SimpleForm field 4: Has No value");
						var sNewObjectPropertyValue = JSON.stringify({
							"text": "textupdated",
							"key": "keyupdated"
						}, null, "\t");
						sNewObjectPropertyValue = sNewObjectPropertyValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
							return s.substring(3, s.length - 3);
						});
						oFormField.setValue(sNewObjectPropertyValue);
						oFormField.fireChange({ value: sNewObjectPropertyValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"key": "string value 1", "text": "text value 1", "type": "type05", "object": {"text": "textupdated", "key": "keyupdated"}}), "Field 1: DT Value updated");

						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
						assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
						assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), {"key": "string value 1", "text": "text value 1", "type": "type05", "object": {"text": "textupdated", "key": "keyupdated"}}), "SimpleForm field5 textArea: Has correct value");

						var oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithSpecialPropertiesDefined/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("exist value: update", function (assert) {
			var oValue = {
				"text": "textnew",
				"key": "keynew",
				"type": "type03",
				"object": {
					"text": "textnew",
					"key": "keynew"
				}
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithSpecialPropertiesDefined",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithSpecialPropertiesDefined": {
									"value": oValue
								}
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
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					var oUpdatedValue = deepClone(oValue, 500);
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object with special properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 2: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
						assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 10, "SimpleForm: length");
						var oTextArea = oContents[9];
						assert.ok(oTextArea.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
						assert.ok(!oTextArea.getVisible(), "SimpleForm field5: Not Visible");
						assert.ok(oTextArea.getEditable(), "SimpleForm field5: Editable");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oValue), "SimpleForm field textArea: Has value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField.getValue(), oValue.key, "SimpleForm field 1: Has No value");
						oUpdatedValue.key = "key updated";
						oFormField.setValue(oUpdatedValue.key);
						oFormField.fireChange({ value: oUpdatedValue.key});
						assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: DT Value updated");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");

						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "Text", "SimpleForm label 2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
						assert.equal(oFormField.getValue(), "textnew", "SimpleForm field 2: Has value");
						oUpdatedValue.text = "text value 1";
						oFormField.setValue(oUpdatedValue.text);
						oFormField.fireChange({ value: oUpdatedValue.text});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: DT Value updated");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");

						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "Type", "SimpleForm label 3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
						assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm Field 3: ComboBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
						assert.equal(oFormField.getSelectedKey(), "type03", "SimpleForm Field 3: Has value");
						var aComboBoxItems = oFormField.getItems();
						assert.equal(aComboBoxItems.length, 6, "SimpleForm field3: ComboBox items length");
						assert.equal(aComboBoxItems[0].getKey(), "type01", "SimpleForm field3: ComboBox item1 key");
						assert.equal(aComboBoxItems[0].getText(), "Type 01", "SimpleForm field3: ComboBox item1 text");
						assert.equal(aComboBoxItems[1].getKey(), "type02", "SimpleForm field3: ComboBox item2 key");
						assert.equal(aComboBoxItems[1].getText(), "Type 02", "SimpleForm field3: ComboBox item2 text");
						assert.equal(aComboBoxItems[2].getKey(), "type03", "SimpleForm field3: ComboBox item3 key");
						assert.equal(aComboBoxItems[2].getText(), "Type 03", "SimpleForm field3: ComboBox item3 text");
						assert.equal(aComboBoxItems[3].getKey(), "type04", "SimpleForm field3: ComboBox item4 key");
						assert.equal(aComboBoxItems[3].getText(), "Type 04", "SimpleForm field3: ComboBox item4 text");
						assert.equal(aComboBoxItems[4].getKey(), "type05", "SimpleForm field3: ComboBox item5 key");
						assert.equal(aComboBoxItems[4].getText(), "Type 05", "SimpleForm field3: ComboBox item5 text");
						assert.equal(aComboBoxItems[5].getKey(), "type06", "SimpleForm field3: ComboBox item6 key");
						assert.equal(aComboBoxItems[5].getText(), "Type 06", "SimpleForm field3: ComboBox item6 text");
						oUpdatedValue.type = "type05";
						oFormField.setSelectedKey(oUpdatedValue.type);
						oFormField.fireChange({ selectedItem: oFormField.getItems()[4] });
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: DT Value updated");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");

						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "Object", "SimpleForm label 4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field 4: TextArea Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
						assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oUpdatedValue.object), "SimpleForm field 4: Has value");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");
						oUpdatedValue.object = {
							"text": "textupdated",
							"key": "keyupdated"
						};
						var sNewObjectPropertyValue = JSON.stringify(oUpdatedValue.object, null, "\t");
						sNewObjectPropertyValue = sNewObjectPropertyValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
							return s.substring(3, s.length - 3);
						});
						oFormField.setValue(sNewObjectPropertyValue);
						oFormField.fireChange({ value: sNewObjectPropertyValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: DT Value updated");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");

						oFormLabel = oContents[8];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");

						oUpdatedValue.type = "type06";
						oUpdatedValue.object = {
							"text": "textupdated2",
							"key": "keyupdated2"
						};
						var sNewValue = JSON.stringify(oUpdatedValue, null, "\t");
						sNewValue = sNewValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
							return s.substring(3, s.length - 3);
						});
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: DT Value updated");
						assert.ok(deepEqual(cleanUUID(oTextArea.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");
						oFormField = oContents[5];
						assert.equal(oFormField.getSelectedKey(), "type06", "SimpleForm Field 3: value updated");
						oFormField = oContents[7];
						assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oUpdatedValue.object), "SimpleForm field 4: value updated");

						var oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithSpecialPropertiesDefined/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
