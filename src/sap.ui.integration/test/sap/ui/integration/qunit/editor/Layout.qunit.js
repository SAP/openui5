/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle"
], function (
	merge,
	x,
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes,
	ResourceBundle
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("Layout", {
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
		QUnit.test("No Wrap With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols2",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No Wrap With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols1",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols2",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0];
						var oField1 = oHBox1.getItems()[0];
						var oLabel1 = oHBox1.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oPanel.getContent()[2];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oPanel.getContent()[3];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oPanel.getContent()[4];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oPanel.getContent()[5];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oPanel.getContent()[6];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oPanel.getContent()[7];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols1",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[0];
						var oLabel1 = oHBox1.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[0].getItems()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oPanel.getContent()[1].getItems()[0];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oPanel.getContent()[1].getItems()[1];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oPanel.getContent()[2].getItems()[0];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oPanel.getContent()[2].getItems()[1];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oPanel.getContent()[3].getItems()[0];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oPanel.getContent()[3].getItems()[1];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols2",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols1",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols2",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oHBox1.getItems()[0].getLayoutData().getMaxWidth() === "9.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[1].getLayoutData().getMaxWidth() === "89.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "19.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "79.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "29.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "69.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "39.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "59.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "49.5%", "Label: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "49.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "59.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "39.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "69.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "29.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "79.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "19.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols1",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oHBox1 = oPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oHBox1.getItems()[0].getLayoutData().getMaxWidth() === "10%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[1].getLayoutData().getMaxWidth() === "90%", "Field HBox: Has max width from field HBox");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "20%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "80%", "Field HBox: Has max width from field HBox");

						var oHBox3 = oPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "30%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "70%", "Field HBox: Has max width from field HBox");

						var oHBox4 = oPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "40%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "60%", "Field HBox: Has max width from field HBox");

						var oHBox5 = oPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "50%", "Label HBox: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "50%", "Field HBox: Has max width from field HBox");

						var oHBox6 = oPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "60%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "40%", "Field HBox: Has max width from field HBox");

						var oHBox7 = oPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "70%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "30%", "Field HBox: Has max width from field HBox");

						var oHBox8 = oPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "80%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "20%", "Field HBox: Has max width from field HBox");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Layout in sub group(panel)", {
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
		QUnit.test("No Wrap With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols2InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No Wrap With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols1InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols2InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0];
						var oField1 = oHBox1.getItems()[0];
						var oLabel1 = oHBox1.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubPanel.getContent()[2];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubPanel.getContent()[3];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubPanel.getContent()[4];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubPanel.getContent()[5];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubPanel.getContent()[6];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubPanel.getContent()[7];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols1InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[0];
						var oLabel1 = oHBox1.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[0].getItems()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubPanel.getContent()[1].getItems()[0];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubPanel.getContent()[1].getItems()[1];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubPanel.getContent()[2].getItems()[0];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubPanel.getContent()[2].getItems()[1];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubPanel.getContent()[3].getItems()[0];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubPanel.getContent()[3].getItems()[1];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols2InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oSubPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oSubPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oSubPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oSubPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oSubPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oSubPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols1InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oSubPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oSubPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oSubPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oSubPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oSubPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oSubPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols2InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oHBox1.getItems()[0].getLayoutData().getMaxWidth() === "9.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[1].getLayoutData().getMaxWidth() === "89.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "19.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "79.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubPanel.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "29.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "69.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubPanel.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "39.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "59.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubPanel.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "49.5%", "Label: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "49.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubPanel.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "59.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "39.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubPanel.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "69.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "29.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubPanel.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "79.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "19.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols1InSubPanel",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Group collapsed by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oHBox1 = oSubPanel.getContent()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oHBox1.getItems()[0].getLayoutData().getMaxWidth() === "10%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[1].getLayoutData().getMaxWidth() === "90%", "Field HBox: Has max width from field HBox");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubPanel.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "20%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "80%", "Field HBox: Has max width from field HBox");

						var oHBox3 = oSubPanel.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "30%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "70%", "Field HBox: Has max width from field HBox");

						var oHBox4 = oSubPanel.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "40%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "60%", "Field HBox: Has max width from field HBox");

						var oHBox5 = oSubPanel.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "50%", "Label HBox: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "50%", "Field HBox: Has max width from field HBox");

						var oHBox6 = oSubPanel.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "60%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "40%", "Field HBox: Has max width from field HBox");

						var oHBox7 = oSubPanel.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "70%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "30%", "Field HBox: Has max width from field HBox");

						var oHBox8 = oSubPanel.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "80%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "20%", "Field HBox: Has max width from field HBox");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Layout in sub group(tab)", {
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
		QUnit.test("No Wrap With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols2InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubTabFilter.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubTabFilter.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubTabFilter.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubTabFilter.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubTabFilter.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubTabFilter.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No Wrap With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWithCols1InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[0].getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubTabFilter.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubTabFilter.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubTabFilter.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubTabFilter.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubTabFilter.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubTabFilter.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols2InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oField1 = oHBox1.getItems()[0];
						var oLabel1 = oHBox1.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubTabFilter.getContent()[2];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubTabFilter.getContent()[3];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubTabFilter.getContent()[4];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubTabFilter.getContent()[5];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubTabFilter.getContent()[6];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubTabFilter.getContent()[7];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapPositionWithCols1InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oField1 = oHBox1.getItems()[0].getItems()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[0].getItems()[1];
						var oField2 = oHBox2.getItems()[0];
						var oLabel2 = oHBox2.getItems()[1].getItems()[0].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubTabFilter.getContent()[1].getItems()[0];
						var oField3 = oHBox3.getItems()[0];
						var oLabel3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubTabFilter.getContent()[1].getItems()[1];
						var oField4 = oHBox4.getItems()[0];
						var oLabel4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubTabFilter.getContent()[2].getItems()[0];
						var oField5 = oHBox5.getItems()[0];
						var oLabel5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubTabFilter.getContent()[2].getItems()[1];
						var oField6 = oHBox6.getItems()[0];
						var oLabel6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubTabFilter.getContent()[3].getItems()[0];
						var oField7 = oHBox7.getItems()[0];
						var oLabel7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubTabFilter.getContent()[3].getItems()[1];
						var oField8 = oHBox8.getItems()[0];
						var oLabel8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols2InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oSubTabFilter.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oSubTabFilter.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oSubTabFilter.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oSubTabFilter.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oSubTabFilter.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oSubTabFilter.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Alignment With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapAlignmentWithCols1InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[0].getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oLabel1.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oField1.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oLabel2.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oField2.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox3 = oSubTabFilter.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oLabel3.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oField3.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox4 = oSubTabFilter.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oLabel4.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oField4.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox5 = oSubTabFilter.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oLabel5.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oField5.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox6 = oSubTabFilter.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oLabel6.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oField6.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox7 = oSubTabFilter.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oLabel7.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oField7.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");

						var oHBox8 = oSubTabFilter.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oLabel8.getTextAlign() === "End", "Label: Alignment End");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oField8.hasStyleClass("sapUiIntegrationEditorFieldAlignEnd"), "Field: Alignment End");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols2", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols2InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oHBox1.getItems()[0].getLayoutData().getMaxWidth() === "9.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[1].getLayoutData().getMaxWidth() === "89.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "19.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "79.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");

						var oHBox3 = oSubTabFilter.getContent()[2];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "29.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "69.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");

						var oHBox4 = oSubTabFilter.getContent()[3];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "39.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "59.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");

						var oHBox5 = oSubTabFilter.getContent()[4];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "49.5%", "Label: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "49.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");

						var oHBox6 = oSubTabFilter.getContent()[5];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "59.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "39.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");

						var oHBox7 = oSubTabFilter.getContent()[6];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "69.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "29.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");

						var oHBox8 = oSubTabFilter.getContent()[7];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "79.5%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "19.5%", "Field HBox: Has max width from field HBox");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Width With Cols1", function (assert) {
			this.oEditor.setJson({
				"baseUrl": sBaseUrl,
				"manifest": {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noWrapWidthWithCols1InSubTab",
						"type": "List",
						"configuration": {
							"parameters": {
								"booleanParameter": {},
								"booleanParameterWithSwitch": {},
								"dateParameter": {},
								"datetimeParameter": {},
								"stringArray": [],
								"numberParameter": 0,
								"stringParameter": ""
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait(1000).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						var oSubTabFilter = oSubTab.getItems()[0];
						var oHBox1 = oSubTabFilter.getContent()[0];
						var oLabel1 = oHBox1.getItems()[0].getItems()[0].getItems()[0];
						var oField1 = oHBox1.getItems()[0].getItems()[1].getItems()[0];
						assert.ok(oLabel1.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel1.getText() === "booleanParameter", "Label: Has booleanParameter label from label");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Boolean Field control is CheckBox");
						assert.ok(!oField1.getAggregation("_field").getSelected(), "Field: Value false since No Value and Default Value");
						assert.ok(oHBox1.getItems()[0].getItems()[0].getLayoutData().getMaxWidth() === "10%", "Label HBox: Has max width from label");
						assert.ok(oHBox1.getItems()[0].getItems()[1].getLayoutData().getMaxWidth() === "90%", "Field HBox: Has max width from field HBox");
						oField1._descriptionIcon.onmouseover();
						var oDescriptionText = this.oEditor._getPopover().getContent()[0];
						assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
						assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
						oField1._descriptionIcon.onmouseout();

						var oHBox2 = oSubTabFilter.getContent()[0].getItems()[1];
						var oLabel2 = oHBox2.getItems()[0].getItems()[0];
						var oField2 = oHBox2.getItems()[1].getItems()[0];
						assert.ok(oLabel2.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel2.getText() === "booleanParameterWithSwitch", "Label: Has booleanParameterWithSwitch label from label");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Switch"), "Field: Boolean Field control is Switch");
						assert.ok(oHBox2.getItems()[0].getLayoutData().getMaxWidth() === "20%", "Label HBox: Has max width from label");
						assert.ok(oHBox2.getItems()[1].getLayoutData().getMaxWidth() === "80%", "Field HBox: Has max width from field HBox");

						var oHBox3 = oSubTabFilter.getContent()[1].getItems()[0];
						var oLabel3 = oHBox3.getItems()[0];
						var oField3 = oHBox3.getItems()[1].getItems()[0];
						assert.ok(oLabel3.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel3.getText() === "dateParameter", "Label: Has dateParameter label from label");
						assert.ok(oField3.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
						assert.ok(oHBox3.getItems()[0].getLayoutData().getMaxWidth() === "30%", "Label HBox: Has max width from label");
						assert.ok(oHBox3.getItems()[1].getLayoutData().getMaxWidth() === "70%", "Field HBox: Has max width from field HBox");

						var oHBox4 = oSubTabFilter.getContent()[1].getItems()[1];
						var oLabel4 = oHBox4.getItems()[0];
						var oField4 = oHBox4.getItems()[1].getItems()[0];
						assert.ok(oLabel4.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel4.getText() === "datetimeParameter", "Label: Has datetimeParameter label from label");
						assert.ok(oField4.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
						assert.ok(oHBox4.getItems()[0].getLayoutData().getMaxWidth() === "40%", "Label HBox: Has max width from label");
						assert.ok(oHBox4.getItems()[1].getLayoutData().getMaxWidth() === "60%", "Field HBox: Has max width from field HBox");

						var oHBox5 = oSubTabFilter.getContent()[2].getItems()[0];
						var oLabel5 = oHBox5.getItems()[0];
						var oField5 = oHBox5.getItems()[1].getItems()[0];
						assert.ok(oLabel5.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel5.getText() === "integerParameter", "Label: Has integerParameter label from label");
						assert.ok(oField5.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: IntegerField Field");
						assert.ok(oHBox5.getItems()[0].getLayoutData().getMaxWidth() === "50%", "Label HBox: Has max width from label");
						assert.ok(oHBox5.getItems()[1].getLayoutData().getMaxWidth() === "50%", "Field HBox: Has max width from field HBox");

						var oHBox6 = oSubTabFilter.getContent()[2].getItems()[1];
						var oLabel6 = oHBox6.getItems()[0];
						var oField6 = oHBox6.getItems()[1].getItems()[0];
						assert.ok(oLabel6.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel6.getText() === "stringArray", "Label: Has stringArray label from label");
						assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringListField Field");
						assert.ok(oHBox6.getItems()[0].getLayoutData().getMaxWidth() === "60%", "Label HBox: Has max width from label");
						assert.ok(oHBox6.getItems()[1].getLayoutData().getMaxWidth() === "40%", "Field HBox: Has max width from field HBox");

						var oHBox7 = oSubTabFilter.getContent()[3].getItems()[0];
						var oLabel7 = oHBox7.getItems()[0];
						var oField7 = oHBox7.getItems()[1].getItems()[0];
						assert.ok(oLabel7.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel7.getText() === "numberParameter", "Label: Has numberParameter label from label");
						assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: NumberField Field");
						assert.ok(oHBox7.getItems()[0].getLayoutData().getMaxWidth() === "70%", "Label HBox: Has max width from label");
						assert.ok(oHBox7.getItems()[1].getLayoutData().getMaxWidth() === "30%", "Field HBox: Has max width from field HBox");

						var oHBox8 = oSubTabFilter.getContent()[3].getItems()[1];
						var oLabel8 = oHBox8.getItems()[0];
						var oField8 = oHBox8.getItems()[1].getItems()[0];
						assert.ok(oLabel8.isA("sap.m.Label"), "Label: VBox contains a Label");
						assert.ok(oLabel8.getText() === "stringParameter", "Label: Has stringParameter label from label");
						assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringField"), "Field: StringField Field");
						assert.ok(oHBox8.getItems()[0].getLayoutData().getMaxWidth() === "80%", "Label HBox: Has max width from label");
						assert.ok(oHBox8.getItems()[1].getLayoutData().getMaxWidth() === "20%", "Field HBox: Has max width from field HBox");
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
