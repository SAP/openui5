/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer,
	Core
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var oManifestForObjectFields = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/object",
			"type": "List",
			"configuration": {
				"parameters": {
					"object": {
						"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
					},
					"objectWithPropertiesDefined": {
						"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
					},
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false}
					},
					"objectWithPropertiesDefinedAndValueFromRequestedFile": {
						"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
					},
					"objectWithPropertiesDefinedAndValueFromODataRequest": {
						"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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

	var oManifestForObjectFieldsWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false}
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					}
				}
			}
		}
	};

	var oResponseData = {
		"Customers": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"},
			{"CustomerID": "e", "CompanyName": "E Company", "Country": "Country 5", "City": "City 5", "Address": "Address 5"},
			{"CustomerID": "f", "CompanyName": "F Company", "Country": "Country 6", "City": "City 6", "Address": "Address 5"}
		]
	};

	function createEditor(sLanguage, oDesigtime) {
		Core.getConfiguration().setLanguage(sLanguage);
		var oEditor = new Editor({
			designtime: oDesigtime
		});
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		oEditor.placeAt(oContent);
		return oEditor;
	}

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("TextArea, SimpleForm", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {},
								"objectWithPropertiesDefined": {},
								"objectWithPropertiesDefinedAndValueFromJsonList": {},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {}
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
					assert.ok(oLabel.getText() === "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oTextArea.getValue() === "", "Field 1: Object Value null");
					var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");
					sNewValue = '{\n\t"string1": "string value 1",\n\t"boolean1": false,\n\t"integer1": 6,\n\t"number1": 8.22,\n\t"new": "new"\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"string1":"string value 1", "boolean1": false, "integer1": 6, "number1": 8.22, "new": "new"}), "Field 1: DT Value updated");
					sNewValue = '{}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 1: DT Value {}");

					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 2: Value");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 16, "SimpleForm: length");
					oTextArea = oContents[15];
					assert.ok(oTextArea.getValue() === '', "SimpleForm field textArea: Has No value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
					oFormField.setValue("string value 1");
					oFormField.fireChange({ value: "string value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label 2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 2: Has No value");
					oFormField.setValue("icon value 1");
					oFormField.fireChange({ value: "icon value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "Text", "SimpleForm label 3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 3: Has No value");
					oFormField.setValue("text value 1");
					oFormField.fireChange({ value: "text value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "URL", "SimpleForm label 4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 4: Has No value");
					oFormField.setValue("url value 1");
					oFormField.fireChange({ value: "url value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label 5: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 5: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field 5: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 5: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 5: Editable");
					assert.ok(!oFormField.getSelected(), "SimpleForm field 5: Has No value");
					oFormField.setSelected(true);
					oFormField.fireSelect({ selected: true});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true}), "Field 1: DT Value updated");

					oFormLabel = oContents[10];
					oFormField = oContents[11];
					assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label 6: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 6: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 6: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 6: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 6: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 6: Has No value");
					oFormField.setValue(3);
					oFormField.fireChange({ value: 3});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3}), "Field 1: DT Value updated");

					oFormLabel = oContents[12];
					oFormField = oContents[13];
					assert.ok(oFormLabel.getText() === "Number", "SimpleForm label 7: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 7: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 7: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 7: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 7: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 7: Has No value");
					oFormField.setValue(3.11);
					oFormField.fireChange({ value: 3.11});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3, "number": 3.11}), "Field 1: DT Value updated");

					oFormLabel = oContents[14];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label 8: Has no label text");
					assert.ok(!oFormLabel.getVisible(), "SimpleForm label 8: Not Visible");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "SimpleForm Field 8: TextArea Field");
					assert.ok(!oTextArea.getVisible(), "SimpleForm Field 8: Not Visible");
					assert.ok(oTextArea.getEditable(), "SimpleForm Field 8: Editable");
					assert.ok(oTextArea.getValue() === '{\n\t"key": "string value 1",\n\t"icon": "icon value 1",\n\t"text": "text value 1",\n\t"url": "url value 1",\n\t"editable": true,\n\t"int": 3,\n\t"number": 3.11\n}', "SimpleForm field 8: Has No value");
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
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {}
								},
								"objectWithPropertiesDefined": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
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
					assert.ok(oLabel.getText() === "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oTextArea.getValue() === "{}", "Field: Object Value {}");
					var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");

					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 2: Value");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 16, "SimpleForm: length");
					oTextArea = oContents[15];
					assert.ok(oTextArea.getValue() === "{}", "SimpleForm field textArea: Has value {}");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "Key", "SimpleForm label 1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 1: Has No value");
					oFormField.setValue("string value 1");
					oFormField.fireChange({ value: "string value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label 2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 2: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 2: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 2: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 2: Has No value");
					oFormField.setValue("icon value 1");
					oFormField.fireChange({ value: "icon value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "Text", "SimpleForm label 3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 3: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 3: Has No value");
					oFormField.setValue("text value 1");
					oFormField.fireChange({ value: "text value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "URL", "SimpleForm label 4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 4: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 4: Has No value");
					oFormField.setValue("url value 1");
					oFormField.fireChange({ value: "url value 1"});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1"}), "Field 1: DT Value updated");

					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label 5: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 5: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field 5: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 5: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 5: Editable");
					assert.ok(!oFormField.getSelected(), "SimpleForm field 5: Has No value");
					oFormField.setSelected(true);
					oFormField.fireSelect({ selected: true});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true}), "Field 1: DT Value updated");

					oFormLabel = oContents[10];
					oFormField = oContents[11];
					assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label 6: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 6: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 6: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 6: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 6: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 6: Has No value");
					oFormField.setValue(3);
					oFormField.fireChange({ value: 3});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3}), "Field 1: DT Value updated");

					oFormLabel = oContents[12];
					oFormField = oContents[13];
					assert.ok(oFormLabel.getText() === "Number", "SimpleForm label 7: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label 7: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 7: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field 7: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field 7: Editable");
					assert.ok(oFormField.getValue() === "", "SimpleForm field 7: Has No value");
					oFormField.setValue(3.11);
					oFormField.fireChange({ value: 3.11});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"key": "string value 1", "icon": "icon value 1", "text": "text value 1", "url": "url value 1", "editable": true, "int": 3, "number": 3.11}), "Field 1: DT Value updated");

					oFormLabel = oContents[14];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label 8: Has no label text");
					assert.ok(!oFormLabel.getVisible(), "SimpleForm label 8: Not Visible");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "SimpleForm Field 8: TextArea Field");
					assert.ok(!oTextArea.getVisible(), "SimpleForm Field 8: Not Visible");
					assert.ok(oTextArea.getEditable(), "SimpleForm Field 8: Editable");
					assert.ok(oTextArea.getValue() === '{\n\t"key": "string value 1",\n\t"icon": "icon value 1",\n\t"text": "text value 1",\n\t"url": "url value 1",\n\t"editable": true,\n\t"int": 3,\n\t"number": 3.11\n}', "SimpleForm field 8: Has No value");

					oLabel = this.oEditor.getAggregation("_formContent")[5];
					oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices Value after selection change");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: DT Value after selection change");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndices Value after selection change again");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, _editable: false }), "Field 3: DT Value after selection change again");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === -1, "Table: SetectedIndex Value after remove selection");
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndices Value after remove selection");
					assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value after remove selection");

					var oLabel4 = this.oEditor.getAggregation("_formContent")[7];
					var oField4 = this.oEditor.getAggregation("_formContent")[8];
					wait().then(function () {
						assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
						assert.ok(oLabel4.getText() === "Object properties defined: value from requested file", "Label 4: Has label text");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 4: Object Field");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), {}), "Field 4: Value");
						oTable = oField4.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 4: Control is Table");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_editable": false }), "Field 4: DT Value after selection change");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false }), "Field 4: DT Value after selection change again");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1, "Table: SetectedIndex Value after remove selection");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndices Value after remove selection");
						assert.ok(!oField4._getCurrentProperty("value"), "Field 4: Value after remove selection");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {},
								"objectWithPropertiesDefined": {
									"value": { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {}
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
					assert.ok(oLabel.getText() === "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oTextArea.getValue() === "", "Field 1: Object Value null");
					var sNewValue = '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {"string":"string value", "boolean": true, "integer": 5, "number": 5.22}), "Field 1: DT Value");
					sNewValue = '';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
					sNewValue = '{}';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 1: DT Value {}");

					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 16, "SimpleForm: length");
					assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has Origin value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
					assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
					oFormField.setValue("key01 1");
					oFormField.fireChange({ value: "key01 1" });
					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
					assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
					oFormField.setValue("sap-icon://accept 1");
					oFormField.fireChange({ value: "sap-icon://accept 1" });
					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
					assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
					oFormField.setValue("text01 1");
					oFormField.fireChange({ value: "text01 1" });
					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
					assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
					oFormField.setValue("https://sapui5.hana.ondemand.com/06 1");
					oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06 1" });
					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
					assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
					assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
					oFormField.setSelected(false);
					oFormField.fireSelect({ selected: false });
					oFormLabel = oContents[10];
					oFormField = oContents[11];
					assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
					assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
					oFormField.setValue("2");
					oFormField.fireChange({value: "2"});
					oFormLabel = oContents[12];
					oFormField = oContents[13];
					assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
					assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
					oFormField.setValue("4.55");
					oFormField.fireChange({ value: "4.55"});
					oFormLabel = oContents[14];
					oFormField = oContents[15];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
					assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
					assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
					assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
					var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
					oDeleteButton.firePress();
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
						assert.ok(oFormField.getValue() === '', "SimpleForm Field8: Has No value");
						var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": true,\n\t"number": 5.55\n}';
						oFormField.setValue(sNewValue);
						oFormField.fireChange({ value: sNewValue});
						oSwitchModeButton.firePress();
						wait().then(function () {
							oContents = oSimpleForm.getContent();
							oFormLabel = oContents[0];
							oFormField = oContents[1];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
							assert.ok(oFormField.getValue() === "key01 2", "SimpleForm field1: Value changed");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
							assert.ok(oFormField.getValue() === "sap-icon://accept 2", "SimpleForm field2: Value changed");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
							assert.ok(oFormField.getValue() === "text01 2", "SimpleForm field3: Value changed");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06 2", "SimpleForm field4: Value changed");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Value changed");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Value changed");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
							assert.ok(oFormField.getValue() === "5.6", "SimpleForm field7: Value changed");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getValue() === sNewValue, "SimpleForm field5: Value changed");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("TextArea->SimpleForm: switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 10, "SimpleForm: length");
					assert.ok(oContents[9].getValue() === '{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 3,\n\t"number": 3.22\n}', "SimpleForm field textArea: Has Origin value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "string", "SimpleForm label1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
					assert.ok(oFormField.getValue() === "string value", "SimpleForm field1: Has value");
					oFormField.setValue("string value 1");
					oFormField.fireChange({ value: "string value 1" });
					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "boolean", "SimpleForm label2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field2: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
					assert.ok(oFormField.getSelected(), "SimpleForm field2: Has value");
					oFormField.setSelected(false);
					oFormField.fireSelect({ selected: false });
					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "integer", "SimpleForm label3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
					assert.ok(oFormField.getValue() === "3", "SimpleForm field3: Has value");
					oFormField.setValue("4");
					oFormField.fireChange({ value: "4" });
					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "number", "SimpleForm label4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
					assert.ok(oFormField.getValue() === "3.22", "SimpleForm field4: Has value");
					oFormField.setValue("4.22");
					oFormField.fireChange({ value: "4.22" });
					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label5: Has no label text");
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
						assert.ok(oFormField.getValue() === '{\n\t"string": "string value 1",\n\t"boolean": false,\n\t"integer": 4,\n\t"number": 4.22\n}', "SimpleForm field5: Has value");
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
							assert.ok(oFormLabel.getText() === "string2", "SimpleForm label1: Label text changed");
							assert.ok(oFormField.getValue() === "string value 2", "SimpleForm field1: Value changed");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormLabel.getText() === "boolean2", "SimpleForm label2: Label text changed");
							assert.ok(!oFormField.getSelected(), "SimpleForm field2: Value changed");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormLabel.getText() === "integer2", "SimpleForm label3: Label text changed");
							assert.ok(oFormField.getValue() === "5", "SimpleForm field1: Value changed");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormLabel.getText() === "number2", "SimpleForm label4: Label text changed");
							assert.ok(oFormField.getValue() === "5.22", "SimpleForm field1: Value changed");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
							assert.ok(oFormField.getValue() === sNewValue, "SimpleForm field5: Value changed");
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
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": { "string": "string value", "boolean": false, "integer": 3, "number": 3.22 }
								},
								"objectWithPropertiesDefined": {
									"value": { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
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
					assert.ok(oLabel.getText() === "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 10, "SimpleForm: length");
					assert.ok(oContents[9].getValue() === '{\n\t"string": "string value",\n\t"boolean": false,\n\t"integer": 3,\n\t"number": 3.22\n}', "SimpleForm field textArea: Has Origin value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "string", "SimpleForm label1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
					assert.ok(oFormField.getValue() === "string value", "SimpleForm field1: Has value");
					oFormField.setValue("string value 1");
					oFormField.fireChange({ value: "string value 1"});
					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "boolean", "SimpleForm label2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field2: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
					assert.ok(!oFormField.getSelected(), "SimpleForm field2: Has value");
					oFormField.setSelected(false);
					oFormField.fireSelect({ selected: false});
					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "integer", "SimpleForm label3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
					assert.ok(oFormField.getValue() === "3", "SimpleForm field3: Has value");
					oFormField.setValue("4");
					oFormField.fireChange({ value: "4"});
					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "number", "SimpleForm label4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
					assert.ok(oFormField.getValue() === "3.22", "SimpleForm field4: Has value");
					oFormField.setValue("4.22");
					oFormField.fireChange({ value: "4.22"});
					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label5: Has no label text");
					assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
					assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field5: TextArea Field");
					assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field5: Editable");
					var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
					oDeleteButton.firePress();
					var oSwitchModeButton = oSimpleForm.getToolbar().getContent()[1];
					oSwitchModeButton.firePress();
					wait().then(function () {
						oContents = oSimpleForm.getContent();
						oFormLabel = oContents[0];
						oFormField = oContents[1];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has no value");
						oFormLabel = oContents[2];
						oFormField = oContents[3];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
						assert.ok(!oFormField.getSelected(), "SimpleForm field2: Has no value");
						oFormLabel = oContents[4];
						oFormField = oContents[5];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
						assert.ok(oFormField.getValue() === "", "SimpleForm field3: Has No value");
						oFormLabel = oContents[6];
						oFormField = oContents[7];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
						assert.ok(oFormField.getValue() === "", "SimpleForm field4: Has No value");
						oFormLabel = oContents[8];
						oFormField = oContents[9];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
						assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
						assert.ok(oFormField.getValue() === "", "SimpleForm field5: Has No value");
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
							assert.ok(oFormLabel.getText() === "string2", "SimpleForm label1: Label text changed");
							assert.ok(oFormField.getValue() === "string value 2", "SimpleForm field1: Value changed");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormLabel.getText() === "boolean2", "SimpleForm label2: Label text changed");
							assert.ok(!oFormField.getSelected(), "SimpleForm field2: Value changed");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormLabel.getText() === "integer2", "SimpleForm label3: Label text changed");
							assert.ok(oFormField.getValue() === "5", "SimpleForm field1: Value changed");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormLabel.getText() === "number2", "SimpleForm label4: Label text changed");
							assert.ok(oFormField.getValue() === "5.22", "SimpleForm field1: Value changed");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
							assert.ok(oFormField.getValue() === '{\n\t"string2": "string value 2",\n\t"boolean2": false,\n\t"integer2": 5,\n\t"number2": 5.22\n}', "SimpleForm field5: Value changed");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("SimpleForm: switch mode", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": { "string": "string value", "boolean": true, "integer": 3, "number": 3.22 }
								},
								"objectWithPropertiesDefined": {
									"value": { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1 , "editable": true, "number": 3.55 }
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 }
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out" }
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
					var oLabel = this.oEditor.getAggregation("_formContent")[3];
					var oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					var oContents = oSimpleForm.getContent();
					assert.ok(oContents.length === 16, "SimpleForm: length");
					assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has Origin value");
					var oFormLabel = oContents[0];
					var oFormField = oContents[1];
					assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
					assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
					oFormField.setValue("key01 1");
					oFormField.fireChange({ value: "key01 1" });
					oFormLabel = oContents[2];
					oFormField = oContents[3];
					assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
					assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
					oFormField.setValue("sap-icon://accept 1");
					oFormField.fireChange({ value: "sap-icon://accept 1" });
					oFormLabel = oContents[4];
					oFormField = oContents[5];
					assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
					assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
					oFormField.setValue("text01 1");
					oFormField.fireChange({ value: "text01 1" });
					oFormLabel = oContents[6];
					oFormField = oContents[7];
					assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
					assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
					oFormField.setValue("https://sapui5.hana.ondemand.com/06 1");
					oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06 1" });
					oFormLabel = oContents[8];
					oFormField = oContents[9];
					assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
					assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
					assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
					assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
					oFormField.setSelected(false);
					oFormField.fireSelect({ selected: false });
					oFormLabel = oContents[10];
					oFormField = oContents[11];
					assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
					assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
					oFormField.setValue("2");
					oFormField.fireChange({value: "2"});
					oFormLabel = oContents[12];
					oFormField = oContents[13];
					assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
					assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
					assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
					assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
					assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
					assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
					oFormField.setValue("4.55");
					oFormField.fireChange({ value: "4.55"});
					oFormLabel = oContents[14];
					oFormField = oContents[15];
					assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
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
						assert.ok(oFormField.getValue() === '{\n\t"text": "text01 1",\n\t"key": "key01 1",\n\t"url": "https://sapui5.hana.ondemand.com/06 1",\n\t"icon": "sap-icon://accept 1",\n\t"int": 2,\n\t"editable": false,\n\t"number": 4.55\n}', "SimpleForm field8: Has value");
						var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": true,\n\t"number": 5.55\n}';
						oFormField.setValue(sNewValue);
						oFormField.fireChange({ value: sNewValue});
						oSwitchModeButton.firePress();
						wait().then(function () {
							oContents = oSimpleForm.getContent();
							oFormLabel = oContents[0];
							oFormField = oContents[1];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
							assert.ok(oFormField.getValue() === "key01 2", "SimpleForm field1: Value changed");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
							assert.ok(oFormField.getValue() === "sap-icon://accept 2", "SimpleForm field2: Value changed");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
							assert.ok(oFormField.getValue() === "text01 2", "SimpleForm field3: Value changed");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06 2", "SimpleForm field4: Value changed");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Value changed");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Value changed");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
							assert.ok(oFormField.getValue() === "5.6", "SimpleForm field7: Value changed");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getValue() === sNewValue, "SimpleForm field5: Value changed");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table - basic", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
		QUnit.test("no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {},
								"objectWithPropertiesDefined": {},
								"objectWithPropertiesDefinedAndValueFromJsonList": {},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {}
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
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: DT Value after selection change");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, _editable: false }), "Field 3: DT Value after selection change again");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
					assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value after remove selection");

					var oLabel4 = this.oEditor.getAggregation("_formContent")[7];
					var oField4 = this.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = this.oEditor.getAggregation("_formContent")[9];
					var oField5 = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
						assert.ok(oLabel4.getText() === "Object properties defined: value from requested file", "Label 4: Has label text");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 4: Object Field");
						assert.ok(!oField4._getCurrentProperty("value"), "Field 4: Value");
						oTable = oField4.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 4: Control is Table");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_editable": false }), "Field 4: DT Value after selection change");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false }), "Field 4: DT Value after selection change again");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
						assert.ok(!oField4._getCurrentProperty("value"), "Field 4: Value after remove selection");
						wait().then(function () {
							assert.ok(oLabel5.isA("sap.m.Label"), "Label 5: Form content contains a Label");
							assert.ok(oLabel5.getText() === "Object properties defined: value from OData Request", "Label 5: Has label text");
							assert.ok(oField5.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 5: Object Field");
							assert.ok(!oField5._getCurrentProperty("value"), "Field 5: Value");
							oTable = oField5.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 5: Control is Table");
							assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
							assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_editable": false }), "Field 5: DT Value after selection change");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_editable": false }), "Field 5: DT Value after selection change again");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
							assert.ok(!oField5._getCurrentProperty("value"), "Field 5: Value after remove selection");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("{} as value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {}
								},
								"objectWithPropertiesDefined": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
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
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: DT Value after selection change");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, _editable: false }), "Field 3: DT Value after selection change again");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
					assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value after remove selection");

					var oLabel4 = this.oEditor.getAggregation("_formContent")[7];
					var oField4 = this.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = this.oEditor.getAggregation("_formContent")[9];
					var oField5 = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
						assert.ok(oLabel4.getText() === "Object properties defined: value from requested file", "Label 4: Has label text");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 4: Object Field");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), {}), "Field 4: Value");
						oTable = oField4.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 4: Control is Table");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_editable": false }), "Field 4: DT Value after selection change");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false }), "Field 4: DT Value after selection change again");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
						assert.ok(!oField4._getCurrentProperty("value"), "Field 4: Value after remove selection");
						wait().then(function () {
							assert.ok(oLabel5.isA("sap.m.Label"), "Label 5: Form content contains a Label");
							assert.ok(oLabel5.getText() === "Object properties defined: value from OData Request", "Label 5: Has label text");
							assert.ok(oField5.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 5: Object Field");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {}), "Field 5: Value");
							oTable = oField5.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 5: Control is Table");
							assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
							assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SetectedIndex and SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_editable": false }), "Field 5: DT Value after selection change");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SetectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_editable": false }), "Field 5: DT Value after selection change again");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SetectedIndex and SelectedIndices Value after remove selection");
							assert.ok(!oField5._getCurrentProperty("value"), "Field 5: Value after remove selection");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no add and clearFilter buttons in table toolbar", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectWithoutAddAndClearFilterButtons",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithoutAddAndClearFilterButtons": {
									"value": {}
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
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
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), {}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(!oAddButton.getVisible(), "Table toolbar: add button not visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and unselect", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices after selection change");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: DT Value after selection change");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, _editable: false }), "Field 3: DT Value after selection change again");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
					assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value after remove selection");

					var oLabel4 = this.oEditor.getAggregation("_formContent")[7];
					var oField4 = this.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = this.oEditor.getAggregation("_formContent")[9];
					var oField5 = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
						assert.ok(oLabel4.getText() === "Object properties defined: value from requested file", "Label 4: Has label text");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 4: Object Field");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false }), "Field 4: Value");
						oTable = oField4.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 4: Control is Table");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_editable": false }), "Field 4: DT Value after selection change");
						oTable.setSelectedIndex(2);
						oTable.fireRowSelectionChange({
							rowIndex: 2,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField4._getCurrentProperty("value"), { "text": "text3req", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in", "_editable": false }), "Field 4: DT Value after selection change again");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
						assert.ok(!oField4._getCurrentProperty("value"), "Field 4: Value after remove selection");
						wait().then(function () {
							assert.ok(oLabel5.isA("sap.m.Label"), "Label 5: Form content contains a Label");
							assert.ok(oLabel5.getText() === "Object properties defined: value from OData Request", "Label 5: Has label text");
							assert.ok(oField5.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 5: Object Field");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}), "Field 5: Value");
							oTable = oField5.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 5: Control is Table");
							assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
							assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
							assert.ok(oTable.getSelectedIndex() === 1 && oTable.getSelectedIndices()[0] === 1, "Table: selected row");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_editable": false }), "Field 5: DT Value after selection change");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField5._getCurrentProperty("value"), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_editable": false }), "Field 5: DT Value after selection change again");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SetectedIndex and SelectedIndices Value after remove selection");
							assert.ok(!oField5._getCurrentProperty("value"), "Field 5: Value after remove selection");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								oSwitchModeButton.firePress();
								wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
									assert.ok(oFormField.getValue() === "key01 2", "SimpleForm field1: Value changed");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
									assert.ok(oFormField.getValue() === "sap-icon://accept 2", "SimpleForm field2: Value changed");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
									assert.ok(oFormField.getValue() === "text01 2", "SimpleForm field3: Value changed");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06 2", "SimpleForm field4: Value changed");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value changed");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Value changed");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
									assert.ok(oFormField.getValue() === "5.6", "SimpleForm field7: Value changed");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getValue() === sNewValue, "SimpleForm field5: Value changed");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for not editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_editable": false }), "Table: target row");
					var oActionHBox = oRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oViewButton = oActionHBox.getItems()[0];
					assert.ok(oViewButton.getIcon() === "sap-icon://display", "Table: View button icon");
					assert.ok(oViewButton.getVisible(), "Table: View button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(!oDeleteButton.getVisible(), "Table: Delete button not visible");
					oViewButton.onAfterRendering = function(oEvent) {
						oViewButton.onAfterRendering = function () {};
						oViewButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"_editable": false\n}', "SimpleForm field textArea: Has the value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
								assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
								assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
								assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
								assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
								assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
								assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
								assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
								assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Value");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
								assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
								assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
								assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
								assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
								assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
								assert.ok(oFormField.getValue() === "", "SimpleForm field7: Value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
								assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"_editable": false\n}', "SimpleForm field textArea: Has the value");
								oSwitchModeButton.firePress();
								wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
									assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Value");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
									assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Value");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
									assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Value");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
									assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Value");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Value");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"_editable": false\n}', "SimpleForm field textArea: Has the value");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table - add", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
		QUnit.test("add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row data");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									assert.ok(deepEqual(oTable.getRows()[4].getBindingContext().getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row in the bottom");
									oTable.setSelectedIndex(0);
									oTable.fireRowSelectionChange({
										rowIndex: 0,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: Value after selection change");
									oTable.setSelectedIndex(8);
									oTable.fireRowSelectionChange({
										rowIndex: 8,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Field 3: Value after select the added one ");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with default property values in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: cancel button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "Table: new row");
									assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
									oTable.setSelectedIndex(0);
									oTable.fireRowSelectionChange({
										rowIndex: 0,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: Value after selection change");
									oTable.setSelectedIndex(8);
									oTable.fireRowSelectionChange({
										rowIndex: 8,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "Field 3: Value after select the added one ");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with property fields in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: cancel button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: cancel button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"text new": "textnew","text": "text01 2","key": "key01 2","url": "https://sapui5.hana.ondemand.com/06 2","icon": "sap-icon://accept 2","int": 3,"editable": false,"number": 5.55}), "Table: new row");
									assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
									oTable.setSelectedIndex(0);
									oTable.fireRowSelectionChange({
										rowIndex: 0,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: Value after selection change");
									oTable.setSelectedIndex(8);
									oTable.fireRowSelectionChange({
										rowIndex: 8,
										userInteraction: true
									});
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text new": "textnew","text": "text01 2","key": "key01 2","url": "https://sapui5.hana.ondemand.com/06 2","icon": "sap-icon://accept 2","int": 3,"editable": false,"number": 5.55}), "Field 3: Value after select the added one ");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with TextArea field in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: cancel button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table - update", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
		QUnit.test("update with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewValue), "Field 3: Value updated");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not change");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: new row");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewValue), "Table: value row is at top");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with property fields in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not changed");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row not changed");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewValue), "Field 3: Value updated");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not change");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: new row");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewValue), "Table: value row is at top");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with TextArea field in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not changed");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row not changed");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table - delete", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
		QUnit.test("delete selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oActionHBox = oNewRow.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
					oDeleteButton.firePress();
					wait().then(function () {
						assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value deleted");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: selected row value");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: selected row is at top");
					// add another one for deleting
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oField1 = this.oEditor.getAggregation("_formContent")[8];
					var oTable1 = oField1.getAggregation("_field");
					var oToolbar1 = oTable1.getToolbar();
					assert.ok(oToolbar1.getContent().length === 3, "Table toolbar 1: content length");
					var oAddButton1 = oToolbar1.getContent()[1];
					assert.ok(!oAddButton1.getVisible(), "Table toolbar 1: add button not visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
						assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
						var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
						assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
						var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
						assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row data");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not change");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not change");
							// scroll to the bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oAddedRow = oTable.getRows()[4];
								assert.ok(deepEqual(oAddedRow.getBindingContext().getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row in the bottom");
								var oActionHBox = oAddedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
								assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not change");
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not changed");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table - filter", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
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
		QUnit.test("filter via api", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oKeyColumn = oTable.getColumns()[0];
					oTable.filter(oKeyColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oKeyColumn, "n*");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						oTable.filter(oKeyColumn, "key0*");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
						oTable.filter(oKeyColumn, "keyn*");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering keyn*");
						oTable.filter(oKeyColumn, "*n");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						oTable.filter(oKeyColumn, "*01");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering *01");
						oTable.filter(oKeyColumn, "*0*");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
						oTable.filter(oKeyColumn, "");
						assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						var oTextColumn = oTable.getColumns()[2];
						oTable.filter(oTextColumn, "n");
						// check that the column menu filter input field was updated
						var oMenu = oTextColumn.getMenu();
						// open and close the menu to let it generate its items
						oMenu.open();
						oMenu.close();
						wait().then(function () {
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
							oTable.filter(oTextColumn, "*n*");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering *n*");
							oTable.filter(oTextColumn, "*n");
							assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							oTable.filter(oTextColumn, "*0*");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row not shown");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							oTable.filter(oTextColumn, "");
							wait().then(function () {
								assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("filter via ui", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oKeyColumn = oTable.getColumns()[0];
					var oURLColumn = oTable.getColumns()[3];
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu and input filter value
					oMenu.open();
					oMenu.getItems()[0].setValue("n");
					oMenu.getItems()[0].fireSelect();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						// open and close the menu and input filter value
						oMenu.open();
						oMenu.getItems()[0].setValue("keyn*");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering keyn*");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							// open and close the menu and input filter value
							oMenu.open();
							oMenu.getItems()[0].setValue("key0*");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
								assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided");
								oMenu = oURLColumn.getMenu();
								// open and close the menu and input filter value
								oMenu.open();
								oMenu.getItems()[0].setValue("http:");
								oMenu.getItems()[0].fireSelect();
								oMenu.close();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
									assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided");
									// clear all the filters
									oClearFilterButton.firePress();
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after filtering key0");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and deselect", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oKeyColumn = oTable.getColumns()[0];
					oTable.filter(oKeyColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oKeyColumn, "n*");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						oTable.filter(oKeyColumn, "key0*");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						oTable.filter(oKeyColumn, "");
						wait().then(function () {
							assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
							assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							oTable.filter(oKeyColumn, "key0*");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices after selection change");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, _editable: false }), "Field 3: DT Value after selection change");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, _editable: false }), "Field 3: DT Value after selection change again");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove selection");
							assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value after remove selection");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add 01 - match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oKeyColumn = oTable.getColumns()[0];
					oTable.filter(oKeyColumn, "new");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("keynew01");
							oFormField.fireChange({ value: "keynew01" });
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 2, "Table: value length is 2");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
								oTable.filter(oKeyColumn, "");
								assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add 02 - not match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oKeyColumn = oTable.getColumns()[0];
					oTable.filter(oKeyColumn, "new");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("keyne01");
							oFormField.fireChange({ value: "keyne01" });
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keyne01"\n}', "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
								oTable.filter(oKeyColumn, "");
								assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keyne01"}), "Table: new row is added to the end");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								oEditButton.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("keynew01");
									oFormField.fireChange({ value: "keynew01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "keynew01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										var oNewValue = {"text": "text01", "key": "keynew01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewValue), "Field 3: Value updated");
										assert.ok(oTable.getBinding().getCount() === 2, "Table: value length is 2");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row index not change");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: selected row updated");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update selected object, but been filtered out", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								oEditButton.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("keyne01");
									oFormField.fireChange({ value: "keyne01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "keyne01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										var oNewValue = {"text": "text01", "key": "keyne01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewValue), "Field 3: Value updated");
										assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
										assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row since it is been filtered out");
										oTable.filter(oKeyColumn, "");
										assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
											assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row come back");
											assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: selected row updated");
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

		QUnit.test("update not selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								var oNewRow = oTable.getRows()[1];
								var oActionHBox = oNewRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
								assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
								oEditButton.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew01", "SimpleForm field1: Has value");
									oFormField.setValue("keynew01 01");
									oFormField.fireChange({ value: "keynew01 01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew01 01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value not changed");
										assert.ok(oTable.getBinding().getCount() === 2, "Table: value length is 2");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not change");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"text": "text01", "key": "keynew01 01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55}), "Table: row updated");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update not selected object, but been filtered out", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								var oNewRow = oTable.getRows()[1];
								var oActionHBox = oNewRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
								assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");
								oEditButton.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew01", "SimpleForm field1: Has value");
									oFormField.setValue("keyne01 01");
									oFormField.fireChange({ value: "keyne01 01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keyne01 01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}), "Field 3: Value not changed");
										assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row not change");
										oTable.filter(oKeyColumn, "");
										assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
										assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value not changed after filtering");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"text": "text01", "key": "keyne01 01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55}), "Table: row updated");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value deleted");
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
									oTable.filter(oKeyColumn, "");
									assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(!oField._getCurrentProperty("value"), "Field 3: Value deleted");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete not selected object 01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
								var oNotSelectedRow = oTable.getRows()[1];
								var oActionHBox = oNotSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
									oTable.filter(oKeyColumn, "");
									assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete not selected object 02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/object",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_editable": false}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oLabel = this.oEditor.getAggregation("_formContent")[5];
					var oField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount beforeFiltering ok");
					assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
					assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oValue), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oValue), "Table: value row is at top");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.firePress();
					wait().then(function () {
						var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.ok(oContents.length === 16, "SimpleForm: length");
						assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
						assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
						oFormField.setValue("keynew01");
						oFormField.fireChange({ value: "keynew01" });
						oFormLabel = oContents[14];
						oFormField = oContents[15];
						assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
						assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
						assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"key": "keynew01"\n}', "SimpleForm field8: Has updated value");
						var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
						oAddButtonInPopover.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
							assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row is added to the end");
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
							var oKeyColumn = oTable.getColumns()[0];
							oTable.filter(oKeyColumn, "new01");
							// check that the column menu filter input field was updated
							var oMenu = oKeyColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
								assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering new");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Table: new row");
								assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided after filtering");
								var oNotSelectedRow = oTable.getRows()[0];
								var oActionHBox = oNotSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
									assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
									assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: selected row hided after filtering");
									oTable.filter(oKeyColumn, "");
									assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: selected row");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), oValue), "Field 3: Value");
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

	QUnit.module("Table - object property translate", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("syntax {{KEY}}: en", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[0];
					assert.ok(oKeyColumn.getLabel().getText() === "translated key en", "Column key: key label text translated");
					wait().then(function () {
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "translated key en", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("{{TRANSLATED_TEXT01}}");
							oFormField.fireChange({ value: "{{TRANSLATED_TEXT01}}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{{TRANSLATED_TEXT01}}","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[2];
									assert.ok(oTextCell.getText() === "translated text01 en", "Row: Text cell value");
									// select new row
									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewObject), "Field 1: Value after select the added one ");

									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {{KEY}}: fr", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("fr");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[0];
					assert.ok(oKeyColumn.getLabel().getText() === "translated key France", "Column key: key label text translated");
					wait().then(function () {
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "translated key France", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("{{TRANSLATED_TEXT01}}");
							oFormField.fireChange({ value: "{{TRANSLATED_TEXT01}}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{{TRANSLATED_TEXT01}}","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[2];
									assert.ok(oTextCell.getText() === "translated text01 France", "Row: Text cell value");
									// select new row
									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewObject), "Field 1: Value after select the added one ");

									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {i18n>KEY}: en", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oIconColumn = oTable.getColumns()[1];
					assert.ok(oIconColumn.getLabel().getText() === "translated icon en", "Column icon: icon label text translated");
					wait().then(function () {
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[2];
							var oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "translated icon en", "SimpleForm label2: icon label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has default value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("{i18n>TRANSLATED_TEXT02}");
							oFormField.fireChange({ value: "{i18n>TRANSLATED_TEXT02}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[2];
									assert.ok(oTextCell.getText() === "translated text02 en", "Row: Text cell value");
									// select new row
									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewObject), "Field 1: Value after select the added one ");

									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {i18n>KEY}: fr", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("fr");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(!oTable.getEnableSelectAll(), "Table: SelectAll disabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
					assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oIconColumn = oTable.getColumns()[1];
					assert.ok(oIconColumn.getLabel().getText() === "translated icon France", "Column icon: icon label text translated");
					wait().then(function () {
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[2];
							var oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "translated icon France", "SimpleForm label2: icon label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has default value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("{i18n>TRANSLATED_TEXT02}");
							oFormField.fireChange({ value: "{i18n>TRANSLATED_TEXT02}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: sff button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_editable": false }), "Field 3: Value not change");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[2];
									assert.ok(oTextCell.getText() === "translated text02 France", "Row: Text cell value");
									// select new row
									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndex() === 8 && oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndex and SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), oNewObject), "Field 1: Value after select the added one ");

									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
