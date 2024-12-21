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
	var oValue = {"string": "string value", "boolean": true, "integer": 3, "number": 3.22, "object": {"key": "key", "text": "text"}, "_dt": {"_uuid": "eec29fc6-d4a0-469e-a79d-e09486f74293"}};
	var oManifestForObjectField = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectField",
			"type": "List",
			"configuration": {
				"parameters": {
					"object": {
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
		QUnit.test("no value: add, update, delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectField",
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
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTextArea = oField.getAggregation("_field");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
						assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
						var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");
						var oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/object/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value");
						sNewValue = '{\n\t"string1": "string value 1",\n\t"boolean1": false,\n\t"integer1": 6,\n\t"number1": 8.22,\n\t"new": "new"\n}';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"string1":"string value 1", "boolean1": false, "integer1": 6, "number1": 8.22, "new": "new"}), "Field 1: DT Value updated");
						oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/object/value"], oField._getCurrentProperty("value"), "Editor: field 1 setting value updated");
						sNewValue = '';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/object/value"], "Editor: field 1 setting value deleted");
						sNewValue = '{}';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value {}");
						oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/object/value"], {}, "Editor: field 1 setting value {}");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("{} as value: add, update, delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectField",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTextArea = oField.getAggregation("_field");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
						assert.equal(oTextArea.getValue(), "{}", "Field: Object Value {}");
						var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");
						sNewValue = '';
						oTextArea.setValue(sNewValue);
						oTextArea.fireChange({ value: sNewValue});
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("TextArea->SimpleForm: switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectField
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					var oUpdatedValue = deepClone(oValue, 500);
					delete oUpdatedValue._dt;
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 12, "SimpleForm: length");
						assert.ok(deepEqual(JSON.parse(oContents[11].getValue()), oValue), "SimpleForm field textArea: Has Origin value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "string", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "string value", "SimpleForm field1: Has value");
						oUpdatedValue.string = "string value 1";
						oFormField.setValue(oUpdatedValue.string);
						oFormField.fireChange({ value: oUpdatedValue.string });
						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "boolean", "SimpleForm label2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field2: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
						assert.ok(oFormField.getSelected(), "SimpleForm field2: Has value");
						oUpdatedValue.boolean = false;
						oFormField.setSelected(oUpdatedValue.boolean);
						oFormField.fireSelect({ selected: oUpdatedValue.boolean });
						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "integer", "SimpleForm label3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
						assert.equal(oFormField.getValue(), "3", "SimpleForm field3: Has value");
						oUpdatedValue.integer = 4;
						oFormField.setValue(oUpdatedValue.integer);
						oFormField.fireChange({ value: oUpdatedValue.integer });
						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "number", "SimpleForm label4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
						assert.equal(oFormField.getValue(), "3.22", "SimpleForm field4: Has value");
						oUpdatedValue.number = 4.22;
						oFormField.setValue("4.22");
						oFormField.fireChange({ value: "4.22" });

						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "object", "SimpleForm label 5: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label 5: Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field 5: TextArea Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field 5: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field 5: Editable");
						assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oValue.object), "SimpleForm field 5: Has value");
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

						oFormLabel = oContents[10];
						oFormField = oContents[11];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label6: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field6: TextArea Field");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
						assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedValue), "SimpleForm field textArea: value updated");
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
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(deepEqual(cleanDT(oFormField.getValue()), oUpdatedValue), "SimpleForm field5: value updated");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oUpdatedValue), "Field 1: Value");
							//var sNewValue = '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22\n}';
							var sNewValue = '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22,\n\t"object": {\n\t\t"key": "keynew",\n\t\t"text": "textnew"\n\t}\n}';
							var oNewValue = JSON.parse(sNewValue);
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue });
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.equal(oFormLabel.getText(), "string2", "SimpleForm label1: Label text changed");
								assert.equal(oFormField.getValue(), "string value 2", "SimpleForm field1: Value changed");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.equal(oFormLabel.getText(), "boolean2", "SimpleForm label2: Label text changed");
								assert.ok(!oFormField.getSelected(), "SimpleForm field2: Value changed");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.equal(oFormLabel.getText(), "integer2", "SimpleForm label3: Label text changed");
								assert.equal(oFormField.getValue(), "5", "SimpleForm field1: Value changed");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.equal(oFormLabel.getText(), "number2", "SimpleForm label4: Label text changed");
								assert.equal(oFormField.getValue(), "5.22", "SimpleForm field1: Value changed");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oNewValue.object), "SimpleForm field 5: value updated");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								var oSettings = this.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings["/sap.card/configuration/parameters/object/value"], oNewValue, "Editor: field 1 setting value");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), oNewValue), "Field 1: Value");
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("TextArea->SimpleForm: delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectField",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": { "string": "string value", "boolean": false, "integer": 3, "number": 3.22 }
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 10, "SimpleForm: length");
						assert.equal(oContents[9].getValue(), '{\n\t"string": "string value",\n\t"boolean": false,\n\t"integer": 3,\n\t"number": 3.22\n}', "SimpleForm field textArea: Has Origin value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "string", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "string value", "SimpleForm field1: Has value");
						oFormField.setValue("string value 1");
						oFormField.fireChange({ value: "string value 1"});
						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.equal(oFormLabel.getText(), "boolean", "SimpleForm label2: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
						assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field2: CheckBox Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
						assert.ok(!oFormField.getSelected(), "SimpleForm field2: Has value");
						oFormField.setSelected(false);
						oFormField.fireSelect({ selected: false});
						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.equal(oFormLabel.getText(), "integer", "SimpleForm label3: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
						assert.equal(oFormField.getValue(), "3", "SimpleForm field3: Has value");
						oFormField.setValue("4");
						oFormField.fireChange({ value: "4"});
						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.equal(oFormLabel.getText(), "number", "SimpleForm label4: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
						assert.equal(oFormField.getValue(), "3.22", "SimpleForm field4: Has value");
						oFormField.setValue("4.22");
						oFormField.fireChange({ value: "4.22"});
						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
						assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field5: TextArea Field");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field5: Editable");
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
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has no value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
							assert.ok(!oFormField.getSelected(), "SimpleForm field2: Has no value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
							assert.equal(oFormField.getValue(), "", "SimpleForm field3: Has No value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
							assert.equal(oFormField.getValue(), "", "SimpleForm field4: Has No value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.equal(oFormField.getValue(), "", "SimpleForm field5: Has No value");
							var sNewValue = '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oSwitchModeButton = oSimpleForm.getToolbar().getContent()[1];
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.equal(oFormLabel.getText(), "string2", "SimpleForm label1: Label text changed");
								assert.equal(oFormField.getValue(), "string value 2", "SimpleForm field1: Value changed");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.equal(oFormLabel.getText(), "boolean2", "SimpleForm label2: Label text changed");
								assert.ok(!oFormField.getSelected(), "SimpleForm field2: Value changed");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.equal(oFormLabel.getText(), "integer2", "SimpleForm label3: Label text changed");
								assert.equal(oFormField.getValue(), "5", "SimpleForm field1: Value changed");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.equal(oFormLabel.getText(), "number2", "SimpleForm label4: Label text changed");
								assert.equal(oFormField.getValue(), "5.22", "SimpleForm field1: Value changed");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								assert.equal(oFormField.getValue(), '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22\n}', "SimpleForm field5: Value changed");
								var oSettings = this.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings["/sap.card/configuration/parameters/object/value"], JSON.parse(sNewValue), "Editor: field 1 setting value");
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
