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

	QUnit.module("single parameter", {
		beforeEach: function () {
			//oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			//EditorQunitUtils.afterEachTest(oEditor, sandbox);
		}
	}, function () {
		QUnit.test("1 number parameter (as json)", function (assert) {
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
					"designtime": "designtime/1number",
					"type": "List",
					"configuration": {
						"parameters": {
							"numberParameter": {
								"value": 3.2
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
					assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
					assert.equal(oField.getAggregation("_field").getValue(), 3.2, "Field: Value 3.2");
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
								assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
								assert.equal(oField.getAggregation("_field").getValue(), 3.2, "Field: Value 3.2");
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
											assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
											assert.equal(oField.getAggregation("_field").getValue(), 3.2, "Field: Value 3.2");
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
														assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
														assert.equal(oField.getAggregation("_field").getValue(), 3.2, "Field: Value 3.2");
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
																	assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
																	assert.equal(oField.getAggregation("_field").getValue(), 3.2, "Field: Value 3.2");
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

		QUnit.test("1 date parameter (as json)", function (assert) {
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
					"designtime": "designtime/1date",
					"type": "List",
					"configuration": {
						"parameters": {
							"dateParameter": {}
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
					assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
								assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
								assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
											assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
											assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
														assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
														assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
																	assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
																	assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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

		QUnit.test("1 datetime parameter (as json)", function (assert) {
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
					"designtime": "designtime/1datetime",
					"type": "List",
					"configuration": {
						"parameters": {
							"datetimeParameter": {}
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
					assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
								assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
								assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
											assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
											assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
														assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
														assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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
																	assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
																	assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
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

		QUnit.test("1 boolean parameter (as json)", function (assert) {
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
					"designtime": "designtime/1boolean",
					"type": "List",
					"configuration": {
						"parameters": {
							"booleanParameter": {
								"value": true
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
					assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: value true");
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
								assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
								assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: value true");
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
											assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
											assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: value true");
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
														assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
														assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: value true");
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
																	assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
																	assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: value true");
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

		QUnit.test("1 destination parameter (as json)", function (assert) {
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
					"type": "List",
					"configuration": {
						"destinations": {
							"dest1": {
								"name": "Sample",
								"label": "dest1 label"
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
					var oPanel = oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dest1 label", "Label: Has dest1 label from destination label property");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
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
								var oPanel = oEditor.getAggregation("_formContent")[0].getAggregation("_field");
								var oLabel = oEditor.getAggregation("_formContent")[1];
								var oField = oEditor.getAggregation("_formContent")[2];
								assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
								assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
								assert.equal(oLabel.getText(), "dest1 label", "Label: Has dest1 label from destination label property");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
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
											var oPanel = oEditor.getAggregation("_formContent")[0].getAggregation("_field");
											var oLabel = oEditor.getAggregation("_formContent")[1];
											var oField = oEditor.getAggregation("_formContent")[2];
											assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
											assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
											assert.equal(oLabel.getText(), "dest1 label", "Label: Has dest1 label from destination label property");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
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
														var oPanel = oEditor.getAggregation("_formContent")[0].getAggregation("_field");
														var oLabel = oEditor.getAggregation("_formContent")[1];
														var oField = oEditor.getAggregation("_formContent")[2];
														assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
														assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
														assert.equal(oLabel.getText(), "dest1 label", "Label: Has dest1 label from destination label property");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
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
																	var oPanel = oEditor.getAggregation("_formContent")[0].getAggregation("_field");
																	var oLabel = oEditor.getAggregation("_formContent")[1];
																	var oField = oEditor.getAggregation("_formContent")[2];
																	assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
																	assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
																	assert.equal(oLabel.getText(), "dest1 label", "Label: Has dest1 label from destination label property");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
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

		QUnit.test("1 object parameter - Simple Form", function (assert) {
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
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
								assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
								assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oSimpleForm = oField.getAggregation("_field");
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 16, "SimpleForm: length");
									assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
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
											assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
											assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oSimpleForm = oField.getAggregation("_field");
												assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
												var oContents = oSimpleForm.getContent();
												assert.equal(oContents.length, 16, "SimpleForm: length");
												assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
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
														assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
														assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oSimpleForm = oField.getAggregation("_field");
															assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
															var oContents = oSimpleForm.getContent();
															assert.equal(oContents.length, 16, "SimpleForm: length");
															assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
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
																	assert.ok(oLabel.isA("sap.m.Label"), "Label 2: Form content contains a Label");
																	assert.equal(oLabel.getText(), "Object properties defined", "Label 2: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oSimpleForm = oField.getAggregation("_field");
																		assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
																		var oContents = oSimpleForm.getContent();
																		assert.equal(oContents.length, 16, "SimpleForm: length");
																		assert.ok(deepEqual(cleanDT(oContents[15].getValue()), {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","int": 1,"editable": true,"number": 3.55}), "SimpleForm field textArea: Has Origin value");
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

		QUnit.test("1 object parameter - TextArea", function (assert) {
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
					assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oTextArea = oField.getAggregation("_field");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
						assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
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
								assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oTextArea = oField.getAggregation("_field");
									assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
									assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
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
											assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oTextArea = oField.getAggregation("_field");
												assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
												assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
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
														assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oTextArea = oField.getAggregation("_field");
															assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
															assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
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
																	assert.equal(oLabel.getText(), "Object Field", "Label: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oTextArea = oField.getAggregation("_field");
																		assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
																		assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
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

		QUnit.test("1 object parameter - Table", function (assert) {
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
					"designtime": "designtime/objectFieldWithValues",
					"type": "List",
					"configuration": {
						"parameters": {
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table: new row");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table: value row is at top");
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
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
								assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
								assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oTable = oField.getAggregation("_field");
									assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
									assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table: new row");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table: value row is at top");
									var oSelectionCell1 = oRow1.getCells()[0];
									assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
									assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
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
											assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
											assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oTable = oField.getAggregation("_field");
												assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
												assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
												assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table: new row");
												var oRow1 = oTable.getRows()[0];
												assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table: value row is at top");
												var oSelectionCell1 = oRow1.getCells()[0];
												assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
												assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
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
														assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
														assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oTable = oField.getAggregation("_field");
															assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
															assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
															assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table: new row");
															var oRow1 = oTable.getRows()[0];
															assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table: value row is at top");
															var oSelectionCell1 = oRow1.getCells()[0];
															assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
															assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
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
																	assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
																	assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oTable = oField.getAggregation("_field");
																		assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
																		assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
																		assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValue1InTable), "Table: new row");
																		var oRow1 = oTable.getRows()[0];
																		assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValue1InTable), "Table: value row is at top");
																		var oSelectionCell1 = oRow1.getCells()[0];
																		assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
																		assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
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

		QUnit.test("1 object list parameter - TextArea", function (assert) {
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
					"designtime": "designtime/objectListWithTypeDefinedOnly",
					"type": "List",
					"configuration": {
						"parameters": {
							"objects": {
								"value": []
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
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oTextArea = oField.getAggregation("_field");
						assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
						assert.equal(oTextArea.getValue(), "[]", "Field 1: Object Value []");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
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
								assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oTextArea = oField.getAggregation("_field");
									assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
									assert.equal(oTextArea.getValue(), "[]", "Field 1: Object Value []");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
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
											assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oTextArea = oField.getAggregation("_field");
												assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
												assert.equal(oTextArea.getValue(), "[]", "Field 1: Object Value []");
												assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
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
														assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oTextArea = oField.getAggregation("_field");
															assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
															assert.equal(oTextArea.getValue(), "[]", "Field 1: Object Value []");
															assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
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
																	assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oTextArea = oField.getAggregation("_field");
																		assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
																		assert.equal(oTextArea.getValue(), "[]", "Field 1: Object Value []");
																		assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
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

		QUnit.test("1 object list parameter - Table", function (assert) {
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
					"designtime": "designtime/objectListWithPropertiesDefinedOnly",
					"type": "List",
					"configuration": {
						"parameters": {
							"objectsWithPropertiesDefined": {
								"value": aObjectsParameterValue1
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
					EditorQunitUtils.isReady(oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
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
								assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
								assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
								assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
								EditorQunitUtils.isReady(oEditor).then(function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(oEditor.isReady(), "Editor is ready");
									var oTable = oField.getAggregation("_field");
									assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
									assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
									assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
									assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
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
											assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
											assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
											assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
											assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
											assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
											EditorQunitUtils.isReady(oEditor).then(function () {
												time = new Date().getTime() - start.getTime();
												assert.ok(oEditor.isReady(), "Editor is ready");
												var oTable = oField.getAggregation("_field");
												assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
												assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
												assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
												assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
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
														assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
														assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
														assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
														assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
														assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
														EditorQunitUtils.isReady(oEditor).then(function () {
															time = new Date().getTime() - start.getTime();
															assert.ok(oEditor.isReady(), "Editor is ready");
															var oTable = oField.getAggregation("_field");
															assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
															assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
															assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
															assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
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
																	assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
																	assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
																	assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
																	assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
																	assert.ok(time < EditorQunitUtils.performance.interaction, "Performance - Field Ready " + count + ": " + time + "ms OK");
																	EditorQunitUtils.isReady(oEditor).then(function () {
																		time = new Date().getTime() - start.getTime();
																		assert.ok(oEditor.isReady(), "Editor is ready");
																		var oTable = oField.getAggregation("_field");
																		assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
																		assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
																		assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
																		assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
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
