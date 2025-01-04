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

	QUnit.module("single parameter", {
		beforeEach: function () {
			//oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			//EditorQunitUtils.afterEachTest(oEditor, sandbox);
		}
	}, function () {
		QUnit.test("1 string parameter (as json)", function (assert) {
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
					"designtime": "designtime/1string",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"value": "stringParameter Value"
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
								assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
											assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
														assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
																	assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 string parameter - TextArea", function (assert) {
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
					"designtime": "designtime/1stringUsingTextArea",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringWithTextArea": {
								"value": "stringWithTextArea Value"
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					var oControl = oField.getAggregation("_field");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "Use TextArea for a string field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
					assert.equal(oControl.getValue(), "stringWithTextArea Value", "Field: String Value");
					oControl.setValue("stringWithTextArea new Value");
					assert.equal(oField._getCurrentProperty("value"), "stringWithTextArea new Value", "Field: String Value updated");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								var oControl = oField.getAggregation("_field");
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "Use TextArea for a string field", "Label: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
								assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
								assert.equal(oControl.getValue(), "stringWithTextArea Value", "Field: String Value");
								oControl.setValue("stringWithTextArea new Value");
								assert.equal(oField._getCurrentProperty("value"), "stringWithTextArea new Value", "Field: String Value updated");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											var oControl = oField.getAggregation("_field");
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "Use TextArea for a string field", "Label: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
											assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
											assert.equal(oControl.getValue(), "stringWithTextArea Value", "Field: String Value");
											oControl.setValue("stringWithTextArea new Value");
											assert.equal(oField._getCurrentProperty("value"), "stringWithTextArea new Value", "Field: String Value updated");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														var oControl = oField.getAggregation("_field");
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "Use TextArea for a string field", "Label: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
														assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
														assert.equal(oControl.getValue(), "stringWithTextArea Value", "Field: String Value");
														oControl.setValue("stringWithTextArea new Value");
														assert.equal(oField._getCurrentProperty("value"), "stringWithTextArea new Value", "Field: String Value updated");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	var oControl = oField.getAggregation("_field");
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "Use TextArea for a string field", "Label: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
																	assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
																	assert.equal(oControl.getValue(), "stringWithTextArea Value", "Field: String Value");
																	oControl.setValue("stringWithTextArea new Value");
																	assert.equal(oField._getCurrentProperty("value"), "stringWithTextArea new Value", "Field: String Value updated");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 string parameter with values (as json)", function (assert) {
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
					"designtime": "designtime/1stringwithvalues",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameterWithValues": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
						assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
								assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									var aItems = oField.getAggregation("_field").getItems();
									assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
									assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
									assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
									assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
									assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
									assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
									assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
											assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												var aItems = oField.getAggregation("_field").getItems();
												assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
												assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
												assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
												assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
												assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
												assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
												assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
														assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															var aItems = oField.getAggregation("_field").getItems();
															assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
															assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
															assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
															assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
															assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
															assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
															assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
																	assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		var aItems = oField.getAggregation("_field").getItems();
																		assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
																		assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
																		assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
																		assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
																		assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
																		assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
																		assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 string parameter with request values from json file", function (assert) {
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
					"designtime": "designtime/1stringWithRequestValues",
					"type": "List",
					"configuration": {
						"parameters": {
							"1stringWithRequestValues": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
						assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
						assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
						assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
								assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									var aItems = oField.getAggregation("_field").getItems();
									assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
									assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
									assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
									assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
									assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
									assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
									assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
									assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
									assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
											assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												var aItems = oField.getAggregation("_field").getItems();
												assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
												assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
												assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
												assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
												assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
												assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
												assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
												assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
												assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
														assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															var aItems = oField.getAggregation("_field").getItems();
															assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
															assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
															assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
															assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
															assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
															assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
															assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
															assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
															assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
																	assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Control is ComboBox");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		var aItems = oField.getAggregation("_field").getItems();
																		assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
																		assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
																		assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
																		assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
																		assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
																		assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
																		assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
																		assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
																		assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 string array parameter with values (as json)", function (assert) {
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
					"designtime": "designtime/1stringarray",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
								assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
											assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
														assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
																	assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 string array parameter with request values from json file", function (assert) {
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
					"designtime": "designtime/1stringArrayWithRequestValues",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
								assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
											assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
														assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
																	assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Control is MultiComboBox");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 icon parameter (as json)", function (assert) {
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
					"designtime": "designtime/icon",
					"type": "List",
					"configuration": {
						"parameters": {
							"iconParameter": {
								"value": "sap-icon://cart"
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						oSelect.setSelectedIndex(10);
						oSelect.open();
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
								var oSelect = oField.getAggregation("_field").getAggregation("_control");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									oSelect.setSelectedIndex(10);
									oSelect.open();
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
											var oSelect = oField.getAggregation("_field").getAggregation("_control");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												oSelect.setSelectedIndex(10);
												oSelect.open();
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
														var oSelect = oField.getAggregation("_field").getAggregation("_control");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															oSelect.setSelectedIndex(10);
															oSelect.open();
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
																	var oSelect = oField.getAggregation("_field").getAggregation("_control");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		oSelect.setSelectedIndex(10);
																		oSelect.open();
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 icon parameter with image (as json)", function (assert) {
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
					"designtime": "designtime/icon",
					"type": "List",
					"configuration": {
						"parameters": {
							"iconParameter": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						oSelect.setSelectedIndex(10);
						oSelect.open();
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
								var oSelect = oField.getAggregation("_field").getAggregation("_control");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									oSelect.setSelectedIndex(10);
									oSelect.open();
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
											var oSelect = oField.getAggregation("_field").getAggregation("_control");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												oSelect.setSelectedIndex(10);
												oSelect.open();
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
														var oSelect = oField.getAggregation("_field").getAggregation("_control");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															oSelect.setSelectedIndex(10);
															oSelect.open();
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
																	var oSelect = oField.getAggregation("_field").getAggregation("_control");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		oSelect.setSelectedIndex(10);
																		oSelect.open();
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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

		QUnit.test("1 image parameter", function (assert) {
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
					"designtime": "designtime/image",
					"type": "List",
					"configuration": {
						"parameters": {
							"imageParameter": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field: Image Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.equal(oSelect.getSelectedIndex(), 2, "Field: selected index is 2");
						assert.equal(oSelect.getItems().length, 3, "Field: select item number is 3");
						oSelect.focus();
						var oIconDomRef = oSelect.getDomRef("labelIcon");
						var oIcon = Element.getElementById(oIconDomRef.id);
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
						QUnitUtils.triggerMouseEvent(oIconDomRef, "click");
						EditorQunitUtils.wait().then(function () {
							assert.ok(oIcon._oImagePopover.isOpen(), "Field: popover is open");
							oSelect.focus();
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field: Image Select Field");
								var oSelect = oField.getAggregation("_field").getAggregation("_control");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.equal(oSelect.getSelectedIndex(), 2, "Field: selected index is 2");
									assert.equal(oSelect.getItems().length, 3, "Field: select item number is 3");
									oSelect.focus();
									var oIconDomRef = oSelect.getDomRef("labelIcon");
									var oIcon = Element.getElementById(oIconDomRef.id);
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
									QUnitUtils.triggerMouseEvent(oIconDomRef, "click");
									EditorQunitUtils.wait().then(function () {
										assert.ok(oIcon._oImagePopover.isOpen(), "Field: popover is open");
										oSelect.focus();
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field: Image Select Field");
											var oSelect = oField.getAggregation("_field").getAggregation("_control");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.equal(oSelect.getSelectedIndex(), 2, "Field: selected index is 2");
												assert.equal(oSelect.getItems().length, 3, "Field: select item number is 3");
												oSelect.focus();
												var oIconDomRef = oSelect.getDomRef("labelIcon");
												var oIcon = Element.getElementById(oIconDomRef.id);
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
												QUnitUtils.triggerMouseEvent(oIconDomRef, "click");
												EditorQunitUtils.wait().then(function () {
													assert.ok(oIcon._oImagePopover.isOpen(), "Field: popover is open");
													oSelect.focus();
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field: Image Select Field");
														var oSelect = oField.getAggregation("_field").getAggregation("_control");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.equal(oSelect.getSelectedIndex(), 2, "Field: selected index is 2");
															assert.equal(oSelect.getItems().length, 3, "Field: select item number is 3");
															oSelect.focus();
															var oIconDomRef = oSelect.getDomRef("labelIcon");
															var oIcon = Element.getElementById(oIconDomRef.id);
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
															QUnitUtils.triggerMouseEvent(oIconDomRef, "click");
															EditorQunitUtils.wait().then(function () {
																assert.ok(oIcon._oImagePopover.isOpen(), "Field: popover is open");
																oSelect.focus();
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.ImageSelect"), "Field: Image Select Field");
																	var oSelect = oField.getAggregation("_field").getAggregation("_control");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.equal(oSelect.getSelectedIndex(), 2, "Field: selected index is 2");
																		assert.equal(oSelect.getItems().length, 3, "Field: select item number is 3");
																		oSelect.focus();
																		var oIconDomRef = oSelect.getDomRef("labelIcon");
																		var oIcon = Element.getElementById(oIconDomRef.id);
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
																		QUnitUtils.triggerMouseEvent(oIconDomRef, "click");
																		EditorQunitUtils.wait().then(function () {
																			assert.ok(oIcon._oImagePopover.isOpen(), "Field: popover is open");
																			oSelect.focus();
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

		QUnit.test("1 integer parameter (as json)", function (assert) {
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
					"designtime": "designtime/1integerlabel",
					"type": "List",
					"configuration": {
						"parameters": {
							"integerParameter": {
								"value": 3
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField.getAggregation("_field").getValue(), 3, "Field: Value 3");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
								assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
								assert.equal(oField.getAggregation("_field").getValue(), 3, "Field: Value 3");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
											assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
											assert.equal(oField.getAggregation("_field").getValue(), 3, "Field: Value 3");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
														assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
														assert.equal(oField.getAggregation("_field").getValue(), 3, "Field: Value 3");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
																	assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
																	assert.equal(oField.getAggregation("_field").getValue(), 3, "Field: Value 3");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Ready " + count + ": " + time + "ms OK");
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
