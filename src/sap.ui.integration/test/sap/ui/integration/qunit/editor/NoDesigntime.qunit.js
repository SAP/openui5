/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4"
], function (
	merge,
	Editor,
	Host,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withParameters/sap.card/";

	QUnit.module("Create an editor based on json without designtime module", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
			}
		}
	}, function () {

		QUnit.test("No configuration section (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "noconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "emptyconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Empty parameters section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "emptyparameters.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destination": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "emptydestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destination": {}, "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "emptyparametersdestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "StaticLabel" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "1stringparameterlabel.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and translatable label (parameter syntax) (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "{{STRINGLABEL}}" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("1 string parameter and translatable label (parameter syntax) (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1translatedstringparameterparam.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and translatable label (i18n binding syntax) (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties", "title": "{{STRINGLABEL}}" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "{i18n>STRINGLABEL}" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "integerParameter": { "type": "integer" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "numberParameter": { "type": "number" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "dateParameter": { "type": "date" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "datetimeParameter": { "type": "datetime" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label (as json)", function (assert) {
			this.oEditor.setJson({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "booleanParameter": { "type": "boolean" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 destination (as json)", function (assert) {
			this.oEditor.setJson({ host: "host", manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter with formatter (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/intPara", "type": "List", "configuration": { "parameters": { "integerParameter": { "value": 99 } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.deepEqual(oField.getConfiguration().formatter, { minIntegerDigits: 3 }, "Formatter is correct");
					assert.equal(oField.getAggregation("_field").mProperties.value, "099", "The value was formatted correctly");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter with formatter (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/numPara", "type": "List", "configuration": { "parameters": { "floatParameter": { "value": 21.0028 } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.deepEqual(oField.getConfiguration().formatter, { decimals: 3 }, "formatter is correct");
					assert.equal(oField.getAggregation("_field").mProperties.value, "21.0028", "The value was formatted correctly");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter with formatter (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/datetimePara", "type": "List", "configuration": { "parameters": { "datetimeParameter": { "value": "2021/03/05 13:50:06" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.deepEqual(oField.getConfiguration().formatter, { style: 'long' }, "formatter is correct");
					// assert.equal(oField.getAggregation("_field").mProperties.value, "March 5, 2021 at 5:50:06 AM GMTZ", "The value was formatted correctly");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter with formatter (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/datePara", "type": "List", "configuration": { "parameters": { "dateParameter": { "value": "2021/03/05" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.deepEqual(oField.getConfiguration().formatter, { style: 'long' }, "formatter is correct");
					assert.equal(oField.getAggregation("_field").mProperties.value, "March 5, 2021", "The value was formatted correctly");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("format the values of string array data type (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/stringArray", "type": "List", "configuration": { "parameters": { "stringArray": { "value": ["key1", "key2"] } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var items = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field").mAggregations.items;
					for (var i = 0; i < items.length; i++) {
						if (items[i].mProperties.additionalText) {
							assert.equal(items[i].mProperties.additionalText, "2.67", "The value was formatted correctly");
						}
					}
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("format the array values (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/string", "type": "List", "configuration": { "parameters": { "string": { "value": "" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var items = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field").mAggregations.items;
					for (var i = 0; i < items.length; i++) {
						if (items[i].mProperties.additionalText) {
							assert.equal(items[i].mProperties.additionalText, "2.67", "The value was formatted correctly");
						}
					}
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Editable value binding to expression (return value: false)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/editable", "type": "List", "configuration": { "parameters": { "editableValue": { "value": false },  "boolean": { "value": true }} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField1 = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					var oField2 = this.oEditor.getAggregation("_formContent")[4].getAggregation("_field");
					var oField3 = this.oEditor.getAggregation("_formContent")[6].getAggregation("_field");
					var oField4 = this.oEditor.getAggregation("_formContent")[8].getAggregation("_field");
					var oField5 = this.oEditor.getAggregation("_formContent")[10].getAggregation("_field");
					var oField6 = this.oEditor.getAggregation("_formContent")[12].getAggregation("_field");
					var oField7 = this.oEditor.getAggregation("_formContent")[14].getAggregation("_field");
					var oField8 = this.oEditor.getAggregation("_formContent")[16].getAggregation("_field");
					var oField9 = this.oEditor.getAggregation("_formContent")[18].getAggregation("_field");
					assert.ok(oField1.getEditable(), "The field is editable.");
					assert.ok(!oField1.getSelected(), "The field is not selected.");
					assert.ok(!oField2.getEditable(), "The field is uneditable.");
					assert.ok(!oField3.getEditable(), "The field is uneditable.");
					assert.ok(!oField4.getEditable(), "The field is uneditable.");
					assert.ok(!oField5.getEditable(), "The field is uneditable.");
					assert.ok(!oField6.getEnabled(), "The field is uneditable.");
					assert.ok(!oField7.getEditable(), "The field is uneditable.");
					assert.ok(!oField8.getEditable(), "The field is uneditable.");
					assert.ok(!oField9.getEditable(), "The field is uneditable.");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Editable value binding to expression (return value: true)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/editable", "type": "List", "configuration": { "parameters": { "editableValue": { "value": true },  "boolean": { "value": false }} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField1 = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					var oField2 = this.oEditor.getAggregation("_formContent")[4].getAggregation("_field");
					var oField3 = this.oEditor.getAggregation("_formContent")[6].getAggregation("_field");
					var oField4 = this.oEditor.getAggregation("_formContent")[8].getAggregation("_field");
					var oField5 = this.oEditor.getAggregation("_formContent")[10].getAggregation("_field");
					var oField6 = this.oEditor.getAggregation("_formContent")[12].getAggregation("_field");
					var oField7 = this.oEditor.getAggregation("_formContent")[14].getAggregation("_field");
					var oField8 = this.oEditor.getAggregation("_formContent")[16].getAggregation("_field");
					var oField9 = this.oEditor.getAggregation("_formContent")[18].getAggregation("_field");
					assert.ok(oField1.getEditable(), "The field is editable.");
					assert.ok(oField1.getSelected(), "The field is selected.");
					assert.ok(oField2.getEditable(), "The field is editable.");
					assert.ok(oField3.getEditable(), "The field is editable.");
					assert.ok(oField4.getEditable(), "The field is editable.");
					assert.ok(oField5.getEditable(), "The field is editable.");
					assert.ok(oField6.getEnabled(), "The field is editable.");
					assert.ok(oField7.getEditable(), "The field is editable.");
					assert.ok(oField8.getEditable(), "The field is editable.");
					assert.ok(oField9.getEditable(), "The field is editable.");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
