/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer,
	Core,
	deepClone
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
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
						"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22, "_dt": {"_uuid": "eec29fc6-d4a0-469e-a79d-e09486f74293"}}
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

	Core.getConfiguration().setLanguage("en");
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

	QUnit.module("TextArea", {
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
					var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");
					sNewValue = '{\n\t"string1": "string value 1",\n\t"boolean1": false,\n\t"integer1": 6,\n\t"number1": 8.22,\n\t"new": "new"\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"string1":"string value 1", "boolean1": false, "integer1": 6, "number1": 8.22, "new": "new"}), "Field 1: DT Value updated");
					sNewValue = '';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
					sNewValue = '{}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value {}");
					resolve();
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
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
		});

		QUnit.test("TextArea->SimpleForm: switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectField
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.equal(oContents.length, 10, "SimpleForm: length");
					assert.equal(oContents[9].getValue(), '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 3,\n\t"number": 3.22,\n\t"_dt": {\n\t\t"_uuid": "eec29fc6-d4a0-469e-a79d-e09486f74293"\n\t}\n}', "SimpleForm field textArea: Has Origin value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.equal(oFormLabel.getText(), "string", "SimpleForm label1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
					assert.equal(oFormField.getValue(), "string value", "SimpleForm field1: Has value");
					oFormField.setValue("string value 1");
					oFormField.fireChange({ value: "string value 1" });
					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.equal(oFormLabel.getText(), "boolean", "SimpleForm label2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field2: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
					assert.ok(oFormField.getSelected(), "SimpleForm field2: Has value");
					oFormField.setSelected(false);
					oFormField.fireSelect({ selected: false });
					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.equal(oFormLabel.getText(), "integer", "SimpleForm label3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
					assert.equal(oFormField.getValue(), "3", "SimpleForm field3: Has value");
					oFormField.setValue("4");
					oFormField.fireChange({ value: "4" });
					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.equal(oFormLabel.getText(), "number", "SimpleForm label4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
					assert.equal(oFormField.getValue(), "3.22", "SimpleForm field4: Has value");
					oFormField.setValue("4.22");
					oFormField.fireChange({ value: "4.22" });
					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
					assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
					assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field5: TextArea Field");
					assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field5: Editable");
					var oSwitchModeButton = oSimpleForm.getToolbar().getContent()[1];
					oSwitchModeButton.firePress();
					wait().then(function () {
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
						assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
						assert.ok(deepEqual(cleanDT(oFormField.getValue()), {"string": "string value 1","boolean": false,"integer": 4,"number": 4.22}), "SimpleForm field5: Has value");
						var sNewValue = '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22\n}';
						oFormField.setValue(sNewValue);
						oFormField.fireChange({ value: sNewValue });
						oSwitchModeButton.firePress();
						wait().then(function () {
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
							assert.equal(oFormField.getValue(), sNewValue, "SimpleForm field5: Value changed");
							resolve();
						});
					});
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
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
					wait().then(function () {
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
						wait().then(function () {
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
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("SimpleForm", {
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
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
					resolve();
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 2: Value");
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
					resolve();
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
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
					wait().then(function () {
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
						wait().then(function () {
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
		});

		QUnit.test("switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefined
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
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
					wait().then(function () {
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
						wait().then(function () {
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
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
