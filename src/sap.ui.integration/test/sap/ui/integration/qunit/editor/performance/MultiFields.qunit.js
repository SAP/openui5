/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/date/UI5Date",
	"sap/ui/integration/formatters/IconFormatter",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone"
], function(
	Localization,
	merge,
	x,
	Element,
	Editor,
	CardEditor,
	Designtime,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	UI5Date,
	IconFormatter,
	EditorQunitUtils,
	deepEqual,
	deepClone
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
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

	function cleanUUIDAndPosition(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
					delete oResult._dt._position;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
				delete oClonedValue._dt._position;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("multi fields", {
		beforeEach: function () {
			//oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			//EditorQunitUtils.afterEachTest(oEditor, sandbox);
		}
	}, function () {
		QUnit.test("string parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiStringFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"value": "stringParameter Value"
							},
							"stringWithTextArea": {
								"value": "stringWithTextArea Value"
							},
							"stringParameterWithValues": {
								"value": "key1"
							},
							"stringWithRequestValues": {
								"value": "key1"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oControl2 = oField2.getAggregation("_field");
					var oLabel3 = oEditor.getAggregation("_formContent")[5];
					var oField3 = oEditor.getAggregation("_formContent")[6];
					var oControl3 = oField3.getAggregation("_field");
					var oLabel4 = oEditor.getAggregation("_formContent")[7];
					var oField4 = oEditor.getAggregation("_formContent")[8];
					var oControl4 = oField4.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
					assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
					assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
					oControl2.setValue("stringWithTextArea new Value");
					assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
					assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
					assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
					assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
					assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
					assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
					assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						var aItems3 = oControl3.getItems();
						assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
						assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
						assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
						assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
						assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
						assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
						assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
						var aItems4 = oField4.getAggregation("_field").getItems();
						assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
						assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
						assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
						assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
						assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
						assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
						assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
						assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
						assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oControl2 = oField2.getAggregation("_field");
								var oLabel3 = oEditor.getAggregation("_formContent")[5];
								var oField3 = oEditor.getAggregation("_formContent")[6];
								var oControl3 = oField3.getAggregation("_field");
								var oLabel4 = oEditor.getAggregation("_formContent")[7];
								var oField4 = oEditor.getAggregation("_formContent")[8];
								var oControl4 = oField4.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
								assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
								assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
								assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
								assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
								oControl2.setValue("stringWithTextArea new Value");
								assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
								assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
								assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
								assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
								assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
								assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									var aItems3 = oControl3.getItems();
									assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
									assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
									assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
									assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
									assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
									assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
									assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
									var aItems4 = oField4.getAggregation("_field").getItems();
									assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
									assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
									assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
									assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
									assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
									assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
									assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
									assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
									assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oControl2 = oField2.getAggregation("_field");
											var oLabel3 = oEditor.getAggregation("_formContent")[5];
											var oField3 = oEditor.getAggregation("_formContent")[6];
											var oControl3 = oField3.getAggregation("_field");
											var oLabel4 = oEditor.getAggregation("_formContent")[7];
											var oField4 = oEditor.getAggregation("_formContent")[8];
											var oControl4 = oField4.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
											assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
											assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
											assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
											assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
											assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
											oControl2.setValue("stringWithTextArea new Value");
											assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
											assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
											assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
											assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
											assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
											assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
											assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
											assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
											assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												var aItems3 = oControl3.getItems();
												assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
												assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
												assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
												assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
												assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
												assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
												assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
												var aItems4 = oField4.getAggregation("_field").getItems();
												assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
												assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
												assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
												assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
												assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
												assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
												assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
												assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
												assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oControl2 = oField2.getAggregation("_field");
														var oLabel3 = oEditor.getAggregation("_formContent")[5];
														var oField3 = oEditor.getAggregation("_formContent")[6];
														var oControl3 = oField3.getAggregation("_field");
														var oLabel4 = oEditor.getAggregation("_formContent")[7];
														var oField4 = oEditor.getAggregation("_formContent")[8];
														var oControl4 = oField4.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
														assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
														assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
														assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
														assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
														assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
														oControl2.setValue("stringWithTextArea new Value");
														assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
														assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
														assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
														assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
														assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
														assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
														assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
														assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
														assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															var aItems3 = oControl3.getItems();
															assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
															assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
															assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
															assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
															assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
															assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
															assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
															var aItems4 = oField4.getAggregation("_field").getItems();
															assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
															assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
															assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
															assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
															assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
															assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
															assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
															assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
															assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oControl2 = oField2.getAggregation("_field");
																	var oLabel3 = oEditor.getAggregation("_formContent")[5];
																	var oField3 = oEditor.getAggregation("_formContent")[6];
																	var oControl3 = oField3.getAggregation("_field");
																	var oLabel4 = oEditor.getAggregation("_formContent")[7];
																	var oField4 = oEditor.getAggregation("_formContent")[8];
																	var oControl4 = oField4.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
																	assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
																	assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
																	assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
																	assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
																	assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
																	oControl2.setValue("stringWithTextArea new Value");
																	assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
																	assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
																	assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
																	assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
																	assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
																	assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
																	assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
																	assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
																	assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var aItems3 = oControl3.getItems();
																		assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
																		assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
																		assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
																		assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
																		assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
																		assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
																		assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
																		var aItems4 = oField4.getAggregation("_field").getItems();
																		assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
																		assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
																		assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
																		assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
																		assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
																		assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
																		assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
																		assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
																		assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("string array parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiStringArrayFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter1": {
								"value": ["key1"]
							},
							"stringArrayParameter2": {
								"value": ["key1"]
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oControl1 = oField1.getAggregation("_field");
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oControl2 = oField2.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "stringArrayParameter1", "Label 1: Has static label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringListField"), "Field 1: List Field");
					assert.ok(oControl1.isA("sap.m.MultiComboBox"), "Field 1: Control is MultiComboBox");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "stringArrayParameter2", "Label 2: Has static label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringListField"), "Field 2: List Field");
					assert.ok(oControl2.isA("sap.m.MultiComboBox"), "Field 2: Control is MultiComboBox");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.equal(oControl1.getItems().length, 5, "Field 1: MultiComboBox items lenght is OK");
						assert.equal(oControl2.getItems().length, 6, "Field 2: MultiComboBox items lenght is OK");
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oControl1 = oField1.getAggregation("_field");
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oControl2 = oField2.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "stringArrayParameter1", "Label 1: Has static label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringListField"), "Field 1: List Field");
								assert.ok(oControl1.isA("sap.m.MultiComboBox"), "Field 1: Control is MultiComboBox");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "stringArrayParameter2", "Label 2: Has static label text");
								assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringListField"), "Field 2: List Field");
								assert.ok(oControl2.isA("sap.m.MultiComboBox"), "Field 2: Control is MultiComboBox");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.equal(oControl1.getItems().length, 5, "Field 1: MultiComboBox items lenght is OK");
									assert.equal(oControl2.getItems().length, 6, "Field 2: MultiComboBox items lenght is OK");
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oControl1 = oField1.getAggregation("_field");
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oControl2 = oField2.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "stringArrayParameter1", "Label 1: Has static label text");
											assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringListField"), "Field 1: List Field");
											assert.ok(oControl1.isA("sap.m.MultiComboBox"), "Field 1: Control is MultiComboBox");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "stringArrayParameter2", "Label 2: Has static label text");
											assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringListField"), "Field 2: List Field");
											assert.ok(oControl2.isA("sap.m.MultiComboBox"), "Field 2: Control is MultiComboBox");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.equal(oControl1.getItems().length, 5, "Field 1: MultiComboBox items lenght is OK");
												assert.equal(oControl2.getItems().length, 6, "Field 2: MultiComboBox items lenght is OK");
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oControl1 = oField1.getAggregation("_field");
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oControl2 = oField2.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "stringArrayParameter1", "Label 1: Has static label text");
														assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringListField"), "Field 1: List Field");
														assert.ok(oControl1.isA("sap.m.MultiComboBox"), "Field 1: Control is MultiComboBox");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "stringArrayParameter2", "Label 2: Has static label text");
														assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringListField"), "Field 2: List Field");
														assert.ok(oControl2.isA("sap.m.MultiComboBox"), "Field 2: Control is MultiComboBox");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.equal(oControl1.getItems().length, 5, "Field 1: MultiComboBox items lenght is OK");
															assert.equal(oControl2.getItems().length, 6, "Field 2: MultiComboBox items lenght is OK");
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oControl1 = oField1.getAggregation("_field");
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oControl2 = oField2.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "stringArrayParameter1", "Label 1: Has static label text");
																	assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringListField"), "Field 1: List Field");
																	assert.ok(oControl1.isA("sap.m.MultiComboBox"), "Field 1: Control is MultiComboBox");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "stringArrayParameter2", "Label 2: Has static label text");
																	assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringListField"), "Field 2: List Field");
																	assert.ok(oControl2.isA("sap.m.MultiComboBox"), "Field 2: Control is MultiComboBox");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.equal(oControl1.getItems().length, 5, "Field 1: MultiComboBox items lenght is OK");
																		assert.equal(oControl2.getItems().length, 6, "Field 2: MultiComboBox items lenght is OK");
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("icon parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiIconFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"iconParameter1": {
								"value": "sap-icon://cart"
							},
							"iconParameter2": {
								"value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oControl1 = oField1.getAggregation("_field");
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oControl2 = oField2.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "iconParameter1", "Label 1: Has static label text");
					assert.ok(oControl1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 1: Icon Select Field");
					var oSelect1 = oControl1.getAggregation("_control");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "iconParameter2", "Label 2: Has static label text");
					assert.ok(oControl2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 2: Icon Select Field");
					var oSelect2 = oControl2.getAggregation("_control");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						oSelect1.setSelectedIndex(10);
						oSelect1.open();
						oSelect2.setSelectedIndex(10);
						oSelect2.open();
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oControl1 = oField1.getAggregation("_field");
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oControl2 = oField2.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "iconParameter1", "Label 1: Has static label text");
								assert.ok(oControl1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 1: Icon Select Field");
								var oSelect1 = oControl1.getAggregation("_control");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "iconParameter2", "Label 2: Has static label text");
								assert.ok(oControl2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 2: Icon Select Field");
								var oSelect2 = oControl2.getAggregation("_control");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									oSelect1.setSelectedIndex(10);
									oSelect1.open();
									oSelect2.setSelectedIndex(10);
									oSelect2.open();
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oControl1 = oField1.getAggregation("_field");
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oControl2 = oField2.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "iconParameter1", "Label 1: Has static label text");
											assert.ok(oControl1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 1: Icon Select Field");
											var oSelect1 = oControl1.getAggregation("_control");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "iconParameter2", "Label 2: Has static label text");
											assert.ok(oControl2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 2: Icon Select Field");
											var oSelect2 = oControl2.getAggregation("_control");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												oSelect1.setSelectedIndex(10);
												oSelect1.open();
												oSelect2.setSelectedIndex(10);
												oSelect2.open();
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oControl1 = oField1.getAggregation("_field");
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oControl2 = oField2.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "iconParameter1", "Label 1: Has static label text");
														assert.ok(oControl1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 1: Icon Select Field");
														var oSelect1 = oControl1.getAggregation("_control");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "iconParameter2", "Label 2: Has static label text");
														assert.ok(oControl2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 2: Icon Select Field");
														var oSelect2 = oControl2.getAggregation("_control");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															oSelect1.setSelectedIndex(10);
															oSelect1.open();
															oSelect2.setSelectedIndex(10);
															oSelect2.open();
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oControl1 = oField1.getAggregation("_field");
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oControl2 = oField2.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "iconParameter1", "Label 1: Has static label text");
																	assert.ok(oControl1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 1: Icon Select Field");
																	var oSelect1 = oControl1.getAggregation("_control");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "iconParameter2", "Label 2: Has static label text");
																	assert.ok(oControl2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 2: Icon Select Field");
																	var oSelect2 = oControl2.getAggregation("_control");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		oSelect1.setSelectedIndex(10);
																		oSelect1.open();
																		oSelect2.setSelectedIndex(10);
																		oSelect2.open();
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("object parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiObjectFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"objectWithPropertiesDefined": {
								"value": { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "int": 1 , "editable": true, "number": 3.55 }
							},
							"object": {},
							"objectWithPropertiesDefinedAndValueFromJsonList": {
								"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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
			var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
			var oValue1InTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true} };
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oSimpleForm1 = oField1.getAggregation("_field");
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oTextArea2 = oField2.getAggregation("_field");
					var oLabel3 = oEditor.getAggregation("_formContent")[5];
					var oField3 = oEditor.getAggregation("_formContent")[6];
					var oTable3 = oField3.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "Object Field", "Label 2: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(oTextArea2.isA("sap.m.TextArea"), "Field 2: Control is TextArea");
					assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.equal(oLabel3.getText(), "Object properties defined: value from Json list", "Label 3: Has label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
					assert.ok(oTable3.isA("sap.ui.table.Table"), "Field 3: Control is Table");
					assert.ok(deepEqual(cleanDT(oField3._getCurrentProperty("value")), oValue), "Field 3: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oContents = oSimpleForm1.getContent();
						assert.equal(oContents.length, 16, "SimpleForm 1: length");
						assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 1 field textArea: Has Origin value");
						assert.equal(oTextArea2.getValue(), "", "Field 2: Object Value null");
						assert.equal(oTable3.getBinding().getCount(), 9, "Table 3: value length is 9");
						assert.ok(deepEqual(cleanUUID(oTable3.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 3: new row");
						var oRow1 = oTable3.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table 3: value row is at top");
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Table 3 Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Table 3 Row 1: Cell 1 is selected");
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oSimpleForm1 = oField1.getAggregation("_field");
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oTextArea2 = oField2.getAggregation("_field");
								var oLabel3 = oEditor.getAggregation("_formContent")[5];
								var oField3 = oEditor.getAggregation("_formContent")[6];
								var oTable3 = oField3.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "Object properties defined", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
								assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "Object Field", "Label 2: Has label text");
								assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
								assert.ok(oTextArea2.isA("sap.m.TextArea"), "Field 2: Control is TextArea");
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "Object properties defined: value from Json list", "Label 3: Has label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
								assert.ok(oTable3.isA("sap.ui.table.Table"), "Field 3: Control is Table");
								assert.ok(deepEqual(cleanDT(oField3._getCurrentProperty("value")), oValue), "Field 3: Value");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oContents = oSimpleForm1.getContent();
									assert.equal(oContents.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 1 field textArea: Has Origin value");
									assert.equal(oTextArea2.getValue(), "", "Field 2: Object Value null");
									assert.equal(oTable3.getBinding().getCount(), 9, "Table 3: value length is 9");
									assert.ok(deepEqual(cleanUUID(oTable3.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 3: new row");
									var oRow1 = oTable3.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table 3: value row is at top");
									var oSelectionCell1 = oRow1.getCells()[0];
									assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Table 3 Row 1: Cell 1 is CheckBox");
									assert.ok(oSelectionCell1.getSelected(), "Table 3 Row 1: Cell 1 is selected");
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oSimpleForm1 = oField1.getAggregation("_field");
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oTextArea2 = oField2.getAggregation("_field");
											var oLabel3 = oEditor.getAggregation("_formContent")[5];
											var oField3 = oEditor.getAggregation("_formContent")[6];
											var oTable3 = oField3.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "Object properties defined", "Label 1: Has label text");
											assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
											assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "Object Field", "Label 2: Has label text");
											assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
											assert.ok(oTextArea2.isA("sap.m.TextArea"), "Field 2: Control is TextArea");
											assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
											assert.equal(oLabel3.getText(), "Object properties defined: value from Json list", "Label 3: Has label text");
											assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
											assert.ok(oTable3.isA("sap.ui.table.Table"), "Field 3: Control is Table");
											assert.ok(deepEqual(cleanDT(oField3._getCurrentProperty("value")), oValue), "Field 3: Value");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oContents = oSimpleForm1.getContent();
												assert.equal(oContents.length, 16, "SimpleForm 1: length");
												assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 1 field textArea: Has Origin value");
												assert.equal(oTextArea2.getValue(), "", "Field 2: Object Value null");
												assert.equal(oTable3.getBinding().getCount(), 9, "Table 3: value length is 9");
												assert.ok(deepEqual(cleanUUID(oTable3.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 3: new row");
												var oRow1 = oTable3.getRows()[0];
												assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table 3: value row is at top");
												var oSelectionCell1 = oRow1.getCells()[0];
												assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Table 3 Row 1: Cell 1 is CheckBox");
												assert.ok(oSelectionCell1.getSelected(), "Table 3 Row 1: Cell 1 is selected");
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oSimpleForm1 = oField1.getAggregation("_field");
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oTextArea2 = oField2.getAggregation("_field");
														var oLabel3 = oEditor.getAggregation("_formContent")[5];
														var oField3 = oEditor.getAggregation("_formContent")[6];
														var oTable3 = oField3.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "Object properties defined", "Label 1: Has label text");
														assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
														assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "Object Field", "Label 2: Has label text");
														assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
														assert.ok(oTextArea2.isA("sap.m.TextArea"), "Field 2: Control is TextArea");
														assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
														assert.equal(oLabel3.getText(), "Object properties defined: value from Json list", "Label 3: Has label text");
														assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
														assert.ok(oTable3.isA("sap.ui.table.Table"), "Field 3: Control is Table");
														assert.ok(deepEqual(cleanDT(oField3._getCurrentProperty("value")), oValue), "Field 3: Value");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oContents = oSimpleForm1.getContent();
															assert.equal(oContents.length, 16, "SimpleForm 1: length");
															assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 1 field textArea: Has Origin value");
															assert.equal(oTextArea2.getValue(), "", "Field 2: Object Value null");
															assert.equal(oTable3.getBinding().getCount(), 9, "Table 3: value length is 9");
															assert.ok(deepEqual(cleanUUID(oTable3.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 3: new row");
															var oRow1 = oTable3.getRows()[0];
															assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table 3: value row is at top");
															var oSelectionCell1 = oRow1.getCells()[0];
															assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Table 3 Row 1: Cell 1 is CheckBox");
															assert.ok(oSelectionCell1.getSelected(), "Table 3 Row 1: Cell 1 is selected");
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oSimpleForm1 = oField1.getAggregation("_field");
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oTextArea2 = oField2.getAggregation("_field");
																	var oLabel3 = oEditor.getAggregation("_formContent")[5];
																	var oField3 = oEditor.getAggregation("_formContent")[6];
																	var oTable3 = oField3.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "Object properties defined", "Label 1: Has label text");
																	assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
																	assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "Object Field", "Label 2: Has label text");
																	assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
																	assert.ok(oTextArea2.isA("sap.m.TextArea"), "Field 2: Control is TextArea");
																	assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
																	assert.equal(oLabel3.getText(), "Object properties defined: value from Json list", "Label 3: Has label text");
																	assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
																	assert.ok(oTable3.isA("sap.ui.table.Table"), "Field 3: Control is Table");
																	assert.ok(deepEqual(cleanDT(oField3._getCurrentProperty("value")), oValue), "Field 3: Value");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oContents = oSimpleForm1.getContent();
																		assert.equal(oContents.length, 16, "SimpleForm 1: length");
																		assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 1 field textArea: Has Origin value");
																		assert.equal(oTextArea2.getValue(), "", "Field 2: Object Value null");
																		assert.equal(oTable3.getBinding().getCount(), 9, "Table 3: value length is 9");
																		assert.ok(deepEqual(cleanUUID(oTable3.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 3: new row");
																		var oRow1 = oTable3.getRows()[0];
																		assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table 3: value row is at top");
																		var oSelectionCell1 = oRow1.getCells()[0];
																		assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Table 3 Row 1: Cell 1 is CheckBox");
																		assert.ok(oSelectionCell1.getSelected(), "Table 3 Row 1: Cell 1 is selected");
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("object list parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oValue1 = { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
			var oValue2 = { "text": "text02", "key": "key02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
			var oValue3 = { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
			var oValue4 = { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
			var oValue5 = { "text": "text05", "key": "key05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
			var oValue6 = { "text": "text06", "key": "key06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
			var oValue7 = { "text": "text07", "key": "key07", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
			var oValue8 = { "text": "text08", "key": "key08", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
			var aObjectsParameterValue1 = [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8];
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiObjectListFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"objects": {
								"value": []
							},
							"objectsWithPropertiesDefined": {
								"value": aObjectsParameterValue1
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
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oTextArea1 = oField1.getAggregation("_field");
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oTable2 = oField2.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "Object List Field", "Label 1: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(oTextArea1.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 2: Object List Field");
					assert.ok(oTable2.isA("sap.ui.table.Table"), "Field 2: Control is Table");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.equal(oTextArea1.getValue(), "[]", "Field 1: Object Value []");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField1._getCurrentProperty("value")), []), "Field 1: DT Value []");
						assert.ok(oTable2.getEnableSelectAll(), "Table 2: SelectAll enabled");
						assert.equal(oTable2.getRows().length, 5, "Table 2: line number is 5");
						assert.equal(oTable2.getBinding().getCount(), aObjectsParameterValue1.length, "Table 2: value length is " + aObjectsParameterValue1.length);
						assert.ok(deepEqual(cleanUUIDAndPosition(oField2._getCurrentProperty("value")), aObjectsParameterValue1), "Field 2: DT Value");
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oTextArea1 = oField1.getAggregation("_field");
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oTable2 = oField2.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "Object List Field", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
								assert.ok(oTextArea1.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "Object properties defined", "Label 2: Has label text");
								assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 2: Object List Field");
								assert.ok(oTable2.isA("sap.ui.table.Table"), "Field 2: Control is Table");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.equal(oTextArea1.getValue(), "[]", "Field 1: Object Value []");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField1._getCurrentProperty("value")), []), "Field 1: DT Value []");
									assert.ok(oTable2.getEnableSelectAll(), "Table 2: SelectAll enabled");
									assert.equal(oTable2.getRows().length, 5, "Table 2: line number is 5");
									assert.equal(oTable2.getBinding().getCount(), aObjectsParameterValue1.length, "Table 2: value length is " + aObjectsParameterValue1.length);
									assert.ok(deepEqual(cleanUUIDAndPosition(oField2._getCurrentProperty("value")), aObjectsParameterValue1), "Field 2: DT Value");
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oTextArea1 = oField1.getAggregation("_field");
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oTable2 = oField2.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "Object List Field", "Label 1: Has label text");
											assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
											assert.ok(oTextArea1.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "Object properties defined", "Label 2: Has label text");
											assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 2: Object List Field");
											assert.ok(oTable2.isA("sap.ui.table.Table"), "Field 2: Control is Table");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.equal(oTextArea1.getValue(), "[]", "Field 1: Object Value []");
												assert.ok(deepEqual(cleanUUIDAndPosition(oField1._getCurrentProperty("value")), []), "Field 1: DT Value []");
												assert.ok(oTable2.getEnableSelectAll(), "Table 2: SelectAll enabled");
												assert.equal(oTable2.getRows().length, 5, "Table 2: line number is 5");
												assert.equal(oTable2.getBinding().getCount(), aObjectsParameterValue1.length, "Table 2: value length is " + aObjectsParameterValue1.length);
												assert.ok(deepEqual(cleanUUIDAndPosition(oField2._getCurrentProperty("value")), aObjectsParameterValue1), "Field 2: DT Value");
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oTextArea1 = oField1.getAggregation("_field");
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oTable2 = oField2.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "Object List Field", "Label 1: Has label text");
														assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
														assert.ok(oTextArea1.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "Object properties defined", "Label 2: Has label text");
														assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 2: Object List Field");
														assert.ok(oTable2.isA("sap.ui.table.Table"), "Field 2: Control is Table");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.equal(oTextArea1.getValue(), "[]", "Field 1: Object Value []");
															assert.ok(deepEqual(cleanUUIDAndPosition(oField1._getCurrentProperty("value")), []), "Field 1: DT Value []");
															assert.ok(oTable2.getEnableSelectAll(), "Table 2: SelectAll enabled");
															assert.equal(oTable2.getRows().length, 5, "Table 2: line number is 5");
															assert.equal(oTable2.getBinding().getCount(), aObjectsParameterValue1.length, "Table 2: value length is " + aObjectsParameterValue1.length);
															assert.ok(deepEqual(cleanUUIDAndPosition(oField2._getCurrentProperty("value")), aObjectsParameterValue1), "Field 2: DT Value");
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oTextArea1 = oField1.getAggregation("_field");
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oTable2 = oField2.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "Object List Field", "Label 1: Has label text");
																	assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
																	assert.ok(oTextArea1.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "Object properties defined", "Label 2: Has label text");
																	assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 2: Object List Field");
																	assert.ok(oTable2.isA("sap.ui.table.Table"), "Field 2: Control is Table");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.equal(oTextArea1.getValue(), "[]", "Field 1: Object Value []");
																		assert.ok(deepEqual(cleanUUIDAndPosition(oField1._getCurrentProperty("value")), []), "Field 1: DT Value []");
																		assert.ok(oTable2.getEnableSelectAll(), "Table 2: SelectAll enabled");
																		assert.equal(oTable2.getRows().length, 5, "Table 2: line number is 5");
																		assert.equal(oTable2.getBinding().getCount(), aObjectsParameterValue1.length, "Table 2: value length is " + aObjectsParameterValue1.length);
																		assert.ok(deepEqual(cleanUUIDAndPosition(oField2._getCurrentProperty("value")), aObjectsParameterValue1), "Field 2: DT Value");
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("all parameters", function (assert) {
			var oHost = new Host("host");
			var oContextHost = new ContextHost("contexthost");
			var start;
			var time = 0;
			var count = 0;
			var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
			var oValue1InTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true} };
			var oValue1 = { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
			var oValue2 = { "text": "text02", "key": "key02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
			var oValue3 = { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
			var oValue4 = { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
			var oValue5 = { "text": "text05", "key": "key05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
			var oValue6 = { "text": "text06", "key": "key06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
			var oValue7 = { "text": "text07", "key": "key07", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
			var oValue8 = { "text": "text08", "key": "key08", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
			var aObjectsParameterValue1 = [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8];
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiFields",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"value": "stringParameter Value"
							},
							"stringWithTextArea": {
								"value": "stringWithTextArea Value"
							},
							"stringParameterWithValues": {
								"value": "key1"
							},
							"stringWithRequestValues": {
								"value": "key1"
							},
							"stringArrayParameter1": {
								"value": ["key1"]
							},
							"stringArrayParameter2": {
								"value": ["key1"]
							},
							"iconParameter1": {
								"value": "sap-icon://cart"
							},
							"iconParameter2": {
								"value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z"
							},
							"imageParameter": {
								"value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z"
							},
							"integerParameter": {
								"value": 3
							},
							"numberParameter": {
								"value": 3.2
							},
							"dateParameter": {},
							"datetimeParameter": {},
							"booleanParameter": {
								"value": true
							},
							"objectWithPropertiesDefined": {
								"value": { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "int": 1 , "editable": true, "number": 3.55 }
							},
							"object": {},
							"objectWithPropertiesDefinedAndValueFromJsonList": {
								"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
							},
							"objects": {
								"value": []
							},
							"objectsWithPropertiesDefined": {
								"value": aObjectsParameterValue1
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
			return new Promise(function (resolve, reject) {
				count++;
				start = new Date();
				var oEditor = EditorQunitUtils.createEditor("en");
				oEditor.setMode("admin");
				oEditor.setAllowSettings(true);
				oEditor.setAllowDynamicValues(true);
				oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = oEditor.getAggregation("_formContent")[1];
					var oField1 = oEditor.getAggregation("_formContent")[2];
					var oLabel2 = oEditor.getAggregation("_formContent")[3];
					var oField2 = oEditor.getAggregation("_formContent")[4];
					var oControl2 = oField2.getAggregation("_field");
					var oLabel3 = oEditor.getAggregation("_formContent")[5];
					var oField3 = oEditor.getAggregation("_formContent")[6];
					var oControl3 = oField3.getAggregation("_field");
					var oLabel4 = oEditor.getAggregation("_formContent")[7];
					var oField4 = oEditor.getAggregation("_formContent")[8];
					var oControl4 = oField4.getAggregation("_field");
					var oLabel5 = oEditor.getAggregation("_formContent")[9];
					var oField5 = oEditor.getAggregation("_formContent")[10];
					var oControl5 = oField5.getAggregation("_field");
					var oLabel6 = oEditor.getAggregation("_formContent")[11];
					var oField6 = oEditor.getAggregation("_formContent")[12];
					var oControl6 = oField6.getAggregation("_field");
					var oLabel7 = oEditor.getAggregation("_formContent")[13];
					var oField7 = oEditor.getAggregation("_formContent")[14];
					var oControl7 = oField7.getAggregation("_field");
					var oSelect7 = oControl7.getAggregation("_control");
					var oLabel8 = oEditor.getAggregation("_formContent")[15];
					var oField8 = oEditor.getAggregation("_formContent")[16];
					var oControl8 = oField8.getAggregation("_field");
					var oSelect8 = oControl8.getAggregation("_control");
					var oLabel9 = oEditor.getAggregation("_formContent")[17];
					var oField9 = oEditor.getAggregation("_formContent")[18];
					var oControl9 = oField9.getAggregation("_field");
					var oSelect9 = oControl9.getAggregation("_control");
					var oLabel10 = oEditor.getAggregation("_formContent")[19];
					var oField10 = oEditor.getAggregation("_formContent")[20];
					var oControl10 = oField10.getAggregation("_field");
					var oLabel11 = oEditor.getAggregation("_formContent")[21];
					var oField11 = oEditor.getAggregation("_formContent")[22];
					var oControl11 = oField11.getAggregation("_field");
					var oLabel12 = oEditor.getAggregation("_formContent")[23];
					var oField12 = oEditor.getAggregation("_formContent")[24];
					var oControl12 = oField12.getAggregation("_field");
					var oLabel13 = oEditor.getAggregation("_formContent")[25];
					var oField13 = oEditor.getAggregation("_formContent")[26];
					var oControl13 = oField13.getAggregation("_field");
					var oLabel14 = oEditor.getAggregation("_formContent")[27];
					var oField14 = oEditor.getAggregation("_formContent")[28];
					var oControl14 = oField14.getAggregation("_field");
					var oLabel15 = oEditor.getAggregation("_formContent")[29];
					var oField15 = oEditor.getAggregation("_formContent")[30];
					var oSimpleForm15 = oField15.getAggregation("_field");
					var oLabel16 = oEditor.getAggregation("_formContent")[31];
					var oField16 = oEditor.getAggregation("_formContent")[32];
					var oTextArea16 = oField16.getAggregation("_field");
					var oLabel17 = oEditor.getAggregation("_formContent")[33];
					var oField17 = oEditor.getAggregation("_formContent")[34];
					var oTable17 = oField17.getAggregation("_field");
					var oLabel18 = oEditor.getAggregation("_formContent")[35];
					var oField18 = oEditor.getAggregation("_formContent")[36];
					var oTextArea18 = oField18.getAggregation("_field");
					var oLabel19 = oEditor.getAggregation("_formContent")[37];
					var oField19 = oEditor.getAggregation("_formContent")[38];
					var oTable19 = oField19.getAggregation("_field");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
					assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
					assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
					assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
					oControl2.setValue("stringWithTextArea new Value");
					assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
					assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
					assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
					assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
					assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
					assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
					assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
					assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
					assert.ok(oLabel5.isA("sap.m.Label"), "Label 5: Form content contains a Label");
					assert.equal(oLabel5.getText(), "stringArrayParameter1", "Label 5: Has static label text");
					assert.ok(oField5.isA("sap.ui.integration.editor.fields.StringListField"), "Field 5: List Field");
					assert.ok(oControl5.isA("sap.m.MultiComboBox"), "Field 5: Control is MultiComboBox");
					assert.ok(oLabel6.isA("sap.m.Label"), "Label 6: Form content contains a Label");
					assert.equal(oLabel6.getText(), "stringArrayParameter2", "Label 6: Has static label text");
					assert.ok(oField6.isA("sap.ui.integration.editor.fields.StringListField"), "Field 6: List Field");
					assert.ok(oControl6.isA("sap.m.MultiComboBox"), "Field 6: Control is MultiComboBox");
					assert.ok(oLabel7.isA("sap.m.Label"), "Label 7: Form content contains a Label");
					assert.equal(oLabel7.getText(), "iconParameter1", "Label 7: Has static label text");
					assert.ok(oControl7.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 7: Icon Select Field");
					assert.ok(oLabel8.isA("sap.m.Label"), "Label 8: Form content contains a Label");
					assert.equal(oLabel8.getText(), "iconParameter2", "Label 8: Has static label text");
					assert.ok(oControl8.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field 8: Icon Select Field");
					assert.ok(oLabel9.isA("sap.m.Label"), "Label 9: Form content contains a Label");
					assert.ok(oField9.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field 9: Image Select Field");
					assert.ok(oLabel10.isA("sap.m.Label"), "Label 10: Form content contains a Label");
					assert.equal(oLabel10.getText(), "integerParameterLabel", "Label 10: Has integerParameter label from label");
					assert.ok(oField10.isA("sap.ui.integration.editor.fields.IntegerField"), "Field 10: Integer Field");
					assert.equal(oControl10.getValue(), 3, "Field 10: Value 3");
					assert.ok(oLabel11.isA("sap.m.Label"), "Label 11: Form content contains a Label");
					assert.equal(oLabel11.getText(), "numberParameter", "Label 11: Has numberParameter label from parameter name");
					assert.ok(oField11.isA("sap.ui.integration.editor.fields.NumberField"), "Field 11: Number Field");
					assert.equal(oControl11.getValue(), 3.2, "Field 11: Value 3.2");
					assert.ok(oLabel12.isA("sap.m.Label"), "Label 12: Form content contains a Label");
					assert.equal(oLabel12.getText(), "dateParameter", "Label 12: Has dateParameter label from parameter name");
					assert.ok(oField12.isA("sap.ui.integration.editor.fields.DateField"), "Field 12: Date Field");
					assert.equal(oControl12.getValue(), "", "Field 12: No Value");
					assert.ok(oLabel13.isA("sap.m.Label"), "Label 13: Form content contains a Label");
					assert.equal(oLabel13.getText(), "datetimeParameter", "Label 13: Has datetimeParameter label from parameter name");
					assert.ok(oField13.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field 13: DateTime Field");
					assert.equal(oControl13.getValue(), "", "Field 13: No Value");
					assert.ok(oLabel14.isA("sap.m.Label"), "Label 14: Form content contains a Label");
					assert.equal(oLabel14.getText(), "booleanParameter", "Label 14: Has booleanParameter label from parameter name");
					assert.ok(oField14.isA("sap.ui.integration.editor.fields.BooleanField"), "Field 14: Boolean Field");
					assert.ok(oControl14.getSelected() === true, "Field 14: value true");
					assert.ok(oLabel15.isA("sap.m.Label"), "Label 15: Form content contains a Label");
					assert.equal(oLabel15.getText(), "Object properties defined", "Label 15: Has label text");
					assert.ok(oField15.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 15: Object Field");
					assert.ok(oSimpleForm15.isA("sap.ui.layout.form.SimpleForm"), "Field 15: Control is SimpleForm");
					assert.ok(oLabel16.isA("sap.m.Label"), "Label 16: Form content contains a Label");
					assert.equal(oLabel16.getText(), "Object Field", "Label 16: Has label text");
					assert.ok(oField16.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 16: Object Field");
					assert.ok(oTextArea16.isA("sap.m.TextArea"), "Field 16: Control is TextArea");
					assert.ok(oLabel17.isA("sap.m.Label"), "Label 17: Form content contains a Label");
					assert.equal(oLabel17.getText(), "Object properties defined: value from Json list", "Label 17: Has label text");
					assert.ok(oField17.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 17: Object Field");
					assert.ok(oTable17.isA("sap.ui.table.Table"), "Field 17: Control is Table");
					assert.ok(deepEqual(cleanDT(oField17._getCurrentProperty("value")), oValue), "Field 17: Value");
					assert.ok(oLabel18.isA("sap.m.Label"), "Label 18: Form content contains a Label");
					assert.equal(oLabel18.getText(), "Object List Field", "Label 18: Has label text");
					assert.ok(oField18.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 18: Object List Field");
					assert.ok(oTextArea18.isA("sap.m.TextArea"), "Field 18: Control is TextArea");
					assert.ok(oLabel19.isA("sap.m.Label"), "Label 19: Form content contains a Label");
					assert.equal(oLabel19.getText(), "Object properties defined", "Label 19: Has label text");
					assert.ok(oField19.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 19: Object List Field");
					assert.ok(oTable19.isA("sap.ui.table.Table"), "Field 19: Control is Table");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
						assert.ok(oEditor.isReady(), "Editor is ready");
						var aItems3 = oControl3.getItems();
						assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
						assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
						assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
						assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
						assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
						assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
						assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
						var aItems4 = oField4.getAggregation("_field").getItems();
						assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
						assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
						assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
						assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
						assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
						assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
						assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
						assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
						assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
						assert.equal(oControl5.getItems().length, 5, "Field 5: MultiComboBox items lenght is OK");
						assert.equal(oControl6.getItems().length, 6, "Field 6: MultiComboBox items lenght is OK");
						oSelect7.setSelectedIndex(10);
						oSelect7.open();
						oSelect8.setSelectedIndex(10);
						oSelect8.open();
						assert.equal(oSelect9.getSelectedIndex(), 2, "Field 9: selected index is 2");
						assert.equal(oSelect9.getItems().length, 3, "Field 9: select item number is 3");
						oSelect9.focus();
						var oContents15 = oSimpleForm15.getContent();
						assert.equal(oContents15.length, 16, "SimpleForm 15: length");
						assert.ok(deepEqual(cleanDT(oContents15[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm 15 field textArea: Has Origin value");
						assert.equal(oTextArea16.getValue(), "", "Field 16: Object Value null");
						assert.equal(oTable17.getBinding().getCount(), 9, "Table 17: value length is 9");
						assert.ok(deepEqual(cleanUUID(oTable17.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table 17: new row");
						var oRow1701 = oTable17.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1701.getBindingContext().getObject()), oValue1InTable), "Table 17: value row is at top");
						var oSelectionCell1701 = oRow1701.getCells()[0];
						assert.ok(oSelectionCell1701.isA("sap.m.CheckBox"), "Table 17 Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1701.getSelected(), "Table 17 Row 1: Cell 1 is selected");
						assert.equal(oTextArea18.getValue(), "[]", "Field 18: Object Value []");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField18._getCurrentProperty("value")), []), "Field 18: DT Value []");
						assert.ok(oTable19.getEnableSelectAll(), "Table 19: SelectAll enabled");
						assert.equal(oTable19.getRows().length, 5, "Table 19: line number is 5");
						assert.equal(oTable19.getBinding().getCount(), aObjectsParameterValue1.length, "Table 19: value length is " + aObjectsParameterValue1.length);
						assert.ok(deepEqual(cleanUUIDAndPosition(oField19._getCurrentProperty("value")), aObjectsParameterValue1), "Field 19: DT Value");
						EditorQunitUtils.wait().then(function () {
							destroyEditor(oEditor);
							count++;
							start = new Date();
							oEditor = EditorQunitUtils.createEditor("en");
							oEditor.setMode("admin");
							oEditor.setAllowSettings(true);
							oEditor.setAllowDynamicValues(true);
							oEditor.setJson({
								baseUrl: sBaseUrl,
								host: "contexthost",
								manifest: oManifest
							});
							EditorQunitUtils.isFieldReady(oEditor).then(function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel1 = oEditor.getAggregation("_formContent")[1];
								var oField1 = oEditor.getAggregation("_formContent")[2];
								var oLabel2 = oEditor.getAggregation("_formContent")[3];
								var oField2 = oEditor.getAggregation("_formContent")[4];
								var oControl2 = oField2.getAggregation("_field");
								var oLabel3 = oEditor.getAggregation("_formContent")[5];
								var oField3 = oEditor.getAggregation("_formContent")[6];
								var oControl3 = oField3.getAggregation("_field");
								var oLabel4 = oEditor.getAggregation("_formContent")[7];
								var oField4 = oEditor.getAggregation("_formContent")[8];
								var oControl4 = oField4.getAggregation("_field");
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
								assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
								assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
								assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
								assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
								assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
								oControl2.setValue("stringWithTextArea new Value");
								assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
								assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
								assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
								assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
								assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
								assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
									assert.ok(oEditor.isReady(), "Editor is ready");
									var aItems3 = oControl3.getItems();
									assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
									assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
									assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
									assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
									assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
									assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
									assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
									var aItems4 = oField4.getAggregation("_field").getItems();
									assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
									assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
									assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
									assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
									assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
									assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
									assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
									assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
									assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
									EditorQunitUtils.wait().then(function () {
										destroyEditor(oEditor);
										count++;
										start = new Date();
										oEditor = EditorQunitUtils.createEditor("en");
										oEditor.setMode("admin");
										oEditor.setAllowSettings(true);
										oEditor.setAllowDynamicValues(true);
										oEditor.setJson({
											baseUrl: sBaseUrl,
											host: "contexthost",
											manifest: oManifest
										});
										EditorQunitUtils.isFieldReady(oEditor).then(function () {
											time = new Date().getTime() - start.getTime();
											assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel1 = oEditor.getAggregation("_formContent")[1];
											var oField1 = oEditor.getAggregation("_formContent")[2];
											var oLabel2 = oEditor.getAggregation("_formContent")[3];
											var oField2 = oEditor.getAggregation("_formContent")[4];
											var oControl2 = oField2.getAggregation("_field");
											var oLabel3 = oEditor.getAggregation("_formContent")[5];
											var oField3 = oEditor.getAggregation("_formContent")[6];
											var oControl3 = oField3.getAggregation("_field");
											var oLabel4 = oEditor.getAggregation("_formContent")[7];
											var oField4 = oEditor.getAggregation("_formContent")[8];
											var oControl4 = oField4.getAggregation("_field");
											assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
											assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
											assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
											assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
											assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
											assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
											assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
											oControl2.setValue("stringWithTextArea new Value");
											assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
											assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
											assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
											assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
											assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
											assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
											assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
											assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
											assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
												assert.ok(oEditor.isReady(), "Editor is ready");
												var aItems3 = oControl3.getItems();
												assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
												assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
												assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
												assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
												assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
												assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
												assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
												var aItems4 = oField4.getAggregation("_field").getItems();
												assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
												assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
												assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
												assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
												assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
												assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
												assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
												assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
												assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
												EditorQunitUtils.wait().then(function () {
													destroyEditor(oEditor);
													count++;
													start = new Date();
													oEditor = EditorQunitUtils.createEditor("en");
													oEditor.setMode("admin");
													oEditor.setAllowSettings(true);
													oEditor.setAllowDynamicValues(true);
													oEditor.setJson({
														baseUrl: sBaseUrl,
														host: "contexthost",
														manifest: oManifest
													});
													EditorQunitUtils.isFieldReady(oEditor).then(function () {
														time = new Date().getTime() - start.getTime();
														assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel1 = oEditor.getAggregation("_formContent")[1];
														var oField1 = oEditor.getAggregation("_formContent")[2];
														var oLabel2 = oEditor.getAggregation("_formContent")[3];
														var oField2 = oEditor.getAggregation("_formContent")[4];
														var oControl2 = oField2.getAggregation("_field");
														var oLabel3 = oEditor.getAggregation("_formContent")[5];
														var oField3 = oEditor.getAggregation("_formContent")[6];
														var oControl3 = oField3.getAggregation("_field");
														var oLabel4 = oEditor.getAggregation("_formContent")[7];
														var oField4 = oEditor.getAggregation("_formContent")[8];
														var oControl4 = oField4.getAggregation("_field");
														assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
														assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
														assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
														assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
														assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
														assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
														assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
														oControl2.setValue("stringWithTextArea new Value");
														assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
														assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
														assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
														assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
														assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
														assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
														assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
														assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
														assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
															assert.ok(oEditor.isReady(), "Editor is ready");
															var aItems3 = oControl3.getItems();
															assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
															assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
															assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
															assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
															assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
															assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
															assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
															var aItems4 = oField4.getAggregation("_field").getItems();
															assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
															assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
															assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
															assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
															assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
															assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
															assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
															assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
															assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
															EditorQunitUtils.wait().then(function () {
																destroyEditor(oEditor);
																count++;
																start = new Date();
																oEditor = EditorQunitUtils.createEditor("en");
																oEditor.setMode("admin");
																oEditor.setAllowSettings(true);
																oEditor.setAllowDynamicValues(true);
																oEditor.setJson({
																	baseUrl: sBaseUrl,
																	host: "contexthost",
																	manifest: oManifest
																});
																EditorQunitUtils.isFieldReady(oEditor).then(function () {
																	time = new Date().getTime() - start.getTime();
																	assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel1 = oEditor.getAggregation("_formContent")[1];
																	var oField1 = oEditor.getAggregation("_formContent")[2];
																	var oLabel2 = oEditor.getAggregation("_formContent")[3];
																	var oField2 = oEditor.getAggregation("_formContent")[4];
																	var oControl2 = oField2.getAggregation("_field");
																	var oLabel3 = oEditor.getAggregation("_formContent")[5];
																	var oField3 = oEditor.getAggregation("_formContent")[6];
																	var oControl3 = oField3.getAggregation("_field");
																	var oLabel4 = oEditor.getAggregation("_formContent")[7];
																	var oField4 = oEditor.getAggregation("_formContent")[8];
																	var oControl4 = oField4.getAggregation("_field");
																	assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel1.getText(), "stringParameter", "Label 1: Has label text");
																	assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
																	assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "Field 1: String Value");
																	assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel2.getText(), "Use TextArea for a string field", "Label 2: Has label text");
																	assert.ok(oField2.isA("sap.ui.integration.editor.fields.StringField"), "Field 2: String Field");
																	assert.ok(oControl2.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
																	assert.equal(oControl2.getValue(), "stringWithTextArea Value", "Field 2: String Value");
																	oControl2.setValue("stringWithTextArea new Value");
																	assert.equal(oField2._getCurrentProperty("value"), "stringWithTextArea new Value", "Field 2: String Value updated");
																	assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
																	assert.equal(oLabel3.getText(), "stringParameterWithValues", "Label 3: Has static label text");
																	assert.ok(oField3.isA("sap.ui.integration.editor.fields.StringField"), "Field 3: String Field");
																	assert.ok(oControl3.isA("sap.m.ComboBox"), "Field 3: Control is ComboBox");
																	assert.ok(oLabel4.isA("sap.m.Label"), "Label 4: Form content contains a Label");
																	assert.equal(oLabel4.getText(), "stringWithRequestValues", "Label 4: Has static label text");
																	assert.ok(oField4.isA("sap.ui.integration.editor.fields.StringField"), "Field 4: String Field");
																	assert.ok(oControl4.isA("sap.m.ComboBox"), "Field 4: Control is ComboBox");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + count + ": " + time + "ms OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var aItems3 = oControl3.getItems();
																		assert.equal(aItems3.length, 3, "Field 3: Select items lenght is OK");
																		assert.equal(aItems3[0].getKey(), "key1", "Field 3: Select item 0 Key is OK");
																		assert.equal(aItems3[0].getText(), "text1", "Field 3: Select item 0 Text is OK");
																		assert.equal(aItems3[1].getKey(), "key2", "Field 3: Select item 1 Key is OK");
																		assert.equal(aItems3[1].getText(), "text2", "Field 3: Select item 1 Text is OK");
																		assert.equal(aItems3[2].getKey(), "key3", "Field 3: Select item 1 Key is OK");
																		assert.equal(aItems3[2].getText(), "text3", "Field 3: Select item 1 Text is OK");
																		var aItems4 = oField4.getAggregation("_field").getItems();
																		assert.equal(aItems4.length, 4, "Field 4: Select items lenght is OK");
																		assert.equal(aItems4[0].getKey(), "key1", "Field 4: Select item 0 Key is OK");
																		assert.equal(aItems4[0].getText(), "text1req", "Field 4: Select item 0 Text is OK");
																		assert.equal(aItems4[1].getKey(), "key2", "Field 4: Select item 1 Key is OK");
																		assert.equal(aItems4[1].getText(), "text2req", "Field 4: Select item 1 Text is OK");
																		assert.equal(aItems4[2].getKey(), "key3", "Field 4: Select item 2 Key is OK");
																		assert.equal(aItems4[2].getText(), "text3req", "Field 4: Select item 2 Text is OK");
																		assert.equal(aItems4[3].getKey(), "key4", "Field 4: Select item 3 Key is OK");
																		assert.equal(aItems4[3].getText(), "text4req", "Field 4: Select item 3 Text is OK");
																		EditorQunitUtils.wait().then(function () {
																			destroyEditor(oEditor);
																			oHost.destroy();
																			oContextHost.destroy();
																			resolve();
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
