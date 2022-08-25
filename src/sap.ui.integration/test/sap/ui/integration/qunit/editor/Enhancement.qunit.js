/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
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
	CardEditor,
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

	QUnit.module("Fields enhancement", {
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
		QUnit.test("Visualization: no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementVisualization",
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
					assert.equal(oLabel.getText(), "Integer Label", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[3];
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.equal(oLabel1.getText(), "Integer Label using Slider", "Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField1.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.equal(oField1.getAggregation("_field").getValue(), 0, "Field: Value correct");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel2.isA("sap.m.Label"), "Label: Form content contains 3 Labels");
					assert.equal(oLabel2.getText(), "Boolean Label", "Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField2.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Default CheckBox control");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					var oField3 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel3.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.equal(oLabel3.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField3.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField3.getAggregation("_field").getState() === false, "Field: Value correct");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Visualization: value from manifest", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementVisualization",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"integerVisualization": {
									"value": 3
								},
								"booleanVisualization": {
									"value": true
								},
								"integerVisualization1": {
									"value": 4
								},
								"booleanVisualization1": {
									"value": false
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
					assert.equal(oLabel.getText(), "Integer Label", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[3];
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.equal(oLabel1.getText(), "Integer Label using Slider", "Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField1.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.equal(oField1.getAggregation("_field").getValue(), 3, "Field: Value correct");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel2.isA("sap.m.Label"), "Label: Form content contains 3 Labels");
					assert.equal(oLabel2.getText(), "Boolean Label", "Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField2.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Default CheckBox control");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					var oField3 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel3.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.equal(oLabel3.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField3.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField3.getAggregation("_field").getState() === true, "Field: Value correct");
					var oLabel4 = this.oEditor.getAggregation("_formContent")[9];
					var oField4 = this.oEditor.getAggregation("_formContent")[10];
					assert.ok(oLabel4.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.equal(oLabel4.getText(), "Integer Label using sap/m/Slider", "Label: Has label text");
					assert.ok(oField4.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField4.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.equal(oField4.getAggregation("_field").getValue(), 4, "Field: Value correct");
					var oLabel5 = this.oEditor.getAggregation("_formContent")[11];
					var oField5 = this.oEditor.getAggregation("_formContent")[12];
					assert.ok(oLabel5.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.equal(oLabel5.getText(), "Boolean Label using sap/m/Switch", "Label: Has label text");
					assert.ok(oField5.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField5.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField5.getAggregation("_field").getState() === false, "Field: Value correct");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: Boolean no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForBoolean",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"dependentfield1": {
									"value": "Editable changes from boolean"
								},
								"dependentfield2": {
									"value": "Visible changes from boolean"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
					assert.equal(oLabel.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setState(true);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === true, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: Boolean false value from manifest", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForBoolean",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"boolean": {
									"value": false
								},
								"dependentfield1": {
									"value": "Editable changes from boolean"
								},
								"dependentfield2": {
									"value": "Visible changes from boolean"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
					assert.equal(oLabel.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setState(true);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === true, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: Boolean true value from manifest", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForBoolean",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"boolean": {
									"value": true
								},
								"dependentfield1": {
									"value": "Editable changes from boolean"
								},
								"dependentfield2": {
									"value": "Visible changes from boolean"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
					assert.equal(oLabel.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === true, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");

					oField.getAggregation("_field").setState(false);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: String value from manifest", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForString",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"string": {
									"value": "visible"
								},
								"dependentfield1": {
									"value": "Editable changes from string"
								},
								"dependentfield2": {
									"value": "Visible changes from string"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.equal(oField.getAggregation("_field").getValue(), "visible", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === true, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("editable");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("label");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
							assert.ok(oField2.getVisible() === false, "Field: Value correct");
							assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: Integer value default", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForInteger",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"dependentfield1": {
									"value": "Editable changes from integer"
								},
								"dependentfield2": {
									"value": "Visible changes from integer"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("3");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("10");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
							assert.ok(oField2.getVisible() === true, "Field: Value correct");
							assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dependence: Integer value from manifest", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldEnhancementDependenceForInteger",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"integer": {
									"value": 4
								},
								"dependentfield1": {
									"value": "Editable changes from integer"
								},
								"dependentfield2": {
									"value": "Visible changes from integer"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.equal(oField.getAggregation("_field").getValue(), "4", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("1");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.equal(oLabel3.getText(), "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("10");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
							assert.ok(oField2.getVisible() === true, "Field: Value correct");
							assert.equal(oLabel3.getText(), "dependentfield3 True", "Label: Value correct");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Groups", {
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
		QUnit.test("Default group", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameter.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
					assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
					assert.ok(oPanel.getExpanded(), "Group expanded by default");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No default group", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "noDefaultGroup.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
					assert.ok(oPanel.getExpanded(), "Group expanded by default");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Group collapsed by setting", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "groupCollapsed.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
					assert.ok(!oPanel.getExpanded(), "Group collapsed by setting");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the error message strip of sub group", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "groupsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait().then(function () {
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oSubPanel = oPanel.getContent()[0].getAggregation("_field");
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Sub group expanded by default");
						assert.equal(oSubPanel.getHeaderText(), "Sub group", "Sub group text");
						var oMessageStripOfSubPanel = oPanel.getContent()[1];
						assert.ok(!oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is not visible since sub group is expanded");
						var oField1 = oSubPanel.getContent()[1].getAggregation("_field");
						var oField2 = oSubPanel.getContent()[3].getAggregation("_field");
						oSubPanel.setExpanded(false);
						wait(500).then(function () {
							assert.ok(oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is visible since sub group is collapsed and has error");
							assert.equal(oMessageStripOfSubPanel.getText(), oDefaultBundle.getText("EDITOR_GROUP_ERRORS"), "Message strip error text correct");
							oSubPanel.setExpanded(true);
							wait(500).then(function () {
								assert.ok(!oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is not visible since sub group is expanded again");
								oField1.setValue("1234567890");
								oField2.setValue("aa");
								wait(500).then(function () {
									oSubPanel.setExpanded(false);
									wait(500).then(function () {
										assert.ok(oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is visible since has warning");
										assert.equal(oMessageStripOfSubPanel.getText(), oDefaultBundle.getText("EDITOR_GROUP_WARNINGS"), "Message strip warning text correct");
										oSubPanel.setExpanded(true);
										oField2.setValue("aaa");
										wait(500).then(function () {
											oSubPanel.setExpanded(false);
											assert.ok(!oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is not visible since no error or warning");
											resolve();
										});
									});
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the error message strip of sub tab", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "subTabsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait().then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oSubTab = oPanel.getContent()[1].getAggregation("_field");
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 0 of Default Panel is sub tab bar");
						assert.ok(oSubTab.getExpanded(), "Sub group expanded by default");
						var oMessageStripOfSubTab = oPanel.getContent()[0];
						assert.ok(!oMessageStripOfSubTab.getVisible(), "Message strip of sub tab is not visible since sub tab is expanded");
						var oSubTabFilter = oSubTab.getItems()[0];
						oSubTab.setExpanded(false);
						wait(500).then(function () {
							var expandedBtn = oSubTabFilter._getExpandButton();
							assert.ok(expandedBtn.getVisible(), "Error icon appeared.");
							resolve();
							//TBD
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the error message strip of group", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "groupsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					wait().then(function () {
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oMessageStripOfPanel = oPanel._messageStrip;
						assert.ok(!oMessageStripOfPanel.getVisible(), "Message strip of group is not visible since group is expanded");
						var oSubPanel = oPanel.getContent()[0].getAggregation("_field");
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Sub group expanded by default");
						assert.equal(oSubPanel.getHeaderText(), "Sub group", "Sub group text");
						var oField1 = oSubPanel.getContent()[1].getAggregation("_field");
						var oField2 = oSubPanel.getContent()[3].getAggregation("_field");
						oPanel.setExpanded(false);
						wait().then(function () {
							assert.ok(oMessageStripOfPanel.getVisible(), "Message strip of group is visible since group is collapsed and has error");
							assert.equal(oMessageStripOfPanel.getText(), oDefaultBundle.getText("EDITOR_GROUP_ERRORS"), "Message strip error text correct");
							oPanel.setExpanded(true);
							wait(500).then(function () {
								assert.ok(!oMessageStripOfPanel.getVisible(), "Message strip of group is not visible since group is expanded again");
								oField1.setValue("1234567890");
								oField2.setValue("aa");
								wait(500).then(function () {
									oPanel.setExpanded(false);
									wait().then(function () {
										assert.ok(oMessageStripOfPanel.getVisible(), "Message strip of group is visible since has warning");
										assert.equal(oMessageStripOfPanel.getText(), oDefaultBundle.getText("EDITOR_GROUP_WARNINGS"), "Message strip warning text correct");
										oPanel.setExpanded(true);
										oField2.setValue("aaa");
										wait(500).then(function () {
											oPanel.setExpanded(false);
											assert.ok(!oMessageStripOfPanel.getVisible(), "Message strip of group is not visible since no error or warning");
											resolve();
										});
									});
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Sub groups (Panel)", {
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
		QUnit.test("2 Sub groups in default group with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "subGroupsInDefaultGroup.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 3, "Default Panel contains 3 items");
						var oSubPanel = oPanel.getContent()[0].getAggregation("_field");
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(!oSubPanel.getExpanded(), "Group collapsed by setting");
						assert.equal(oSubPanel.getHeaderText(), "Sub group", "Sub group text");
						assert.equal(oSubPanel.getContent().length, 2, "Sub group contains 2 items");
						assert.equal(oSubPanel.getContent()[0].getItems()[0].getText(), "stringParameter", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubPanel.getContent()[1].getAggregation("_field").getValue(), "stringParameter Value", "Value of item 2 of Sub Group correct");
						assert.ok(oPanel.getContent()[1].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						assert.ok(oPanel.getContent()[2].isA("sap.m.MessageStrip"), "Item 3 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Multi Sub groups in default group with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "multiSubGroupsInDefaultGroup.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 4, "Default Panel contains 4 items");
						var oSubPanel1 = oPanel.getContent()[0].getAggregation("_field");
						assert.ok(oSubPanel1.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(!oSubPanel1.getExpanded(), "Group collapsed by setting");
						assert.equal(oSubPanel1.getHeaderText(), "Sub group 1", "Sub group 1 text");
						assert.equal(oSubPanel1.getContent().length, 2, "Sub group contains 2 items");
						assert.equal(oSubPanel1.getContent()[0].getItems()[0].getText(), "stringParameter1", "Lable of item 1 of Sub Group 1 correct");
						assert.ok(oSubPanel1.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 1 is a String field");
						assert.equal(oSubPanel1.getContent()[1].getAggregation("_field").getValue(), "stringParameter1 Value", "Value of item 2 of Sub Group 1 correct");
						assert.ok(oPanel.getContent()[1].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						var oSubPanel2 = oPanel.getContent()[2].getAggregation("_field");
						assert.ok(oSubPanel2.isA("sap.m.Panel"), "Item 3 of Default Panel is sub panel");
						assert.ok(oSubPanel2.getExpanded(), "Group expended by default");
						assert.equal(oSubPanel2.getHeaderText(), "Sub group 3", "Sub group 3 text");
						assert.equal(oSubPanel2.getContent().length, 3, "Sub group 3 contains 3 items");
						assert.equal(oSubPanel2.getContent()[0].getItems()[0].getText(), "stringParameter2", "Lable of item 1 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 3 is a String field");
						assert.equal(oSubPanel2.getContent()[1].getAggregation("_field").getValue(), "stringParameter2 Value", "Value of item 3 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[2].isA("sap.m.MessageStrip"), "Item 3 of Sub Group 3 is a message strip");
						assert.ok(oPanel.getContent()[3].isA("sap.m.MessageStrip"), "Item 4 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Multi Sub groups with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "multiSubGroups.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 6, "Default Panel contains 6 items");
						assert.equal(oPanel.getContent()[0].getItems()[0].getText(), "stringParameter", "Lable of item 1 of Group correct");
						assert.ok(oPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Group is a String field");
						assert.equal(oPanel.getContent()[1].getAggregation("_field").getValue(), "stringParameter Value", "Value of item 2 of Group correct");
						var oSubPanel1 = oPanel.getContent()[2].getAggregation("_field");
						assert.ok(oSubPanel1.isA("sap.m.Panel"), "Item 3 of Default Panel is sub panel");
						assert.ok(!oSubPanel1.getExpanded(), "Group collapsed by setting");
						assert.equal(oSubPanel1.getHeaderText(), "Sub group 2", "Sub group 2 text");
						assert.equal(oSubPanel1.getContent().length, 2, "Sub group contains 2 items");
						assert.equal(oSubPanel1.getContent()[0].getItems()[0].getText(), "stringParameter1", "Lable of item 1 of Sub Group 2 correct");
						assert.ok(oSubPanel1.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 2 is a String field");
						assert.equal(oSubPanel1.getContent()[1].getAggregation("_field").getValue(), "stringParameter1 Value", "Value of item 2 of Sub Group 2 correct");
						assert.ok(oPanel.getContent()[3].isA("sap.m.MessageStrip"), "Item 4 of Default Panel is a message strip");
						var oSubPanel2 = oPanel.getContent()[4].getAggregation("_field");
						assert.ok(oSubPanel2.isA("sap.m.Panel"), "Item 5 of Default Panel is sub panel");
						assert.ok(oSubPanel2.getExpanded(), "Group expended by default");
						assert.equal(oSubPanel2.getHeaderText(), "Sub group 3", "Sub group 3 text");
						assert.equal(oSubPanel2.getContent().length, 3, "Sub group 3 contains 3 items");
						assert.equal(oSubPanel2.getContent()[0].getItems()[0].getText(), "stringParameter2", "Lable of item 1 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 3 is a String field");
						assert.equal(oSubPanel2.getContent()[1].getAggregation("_field").getValue(), "stringParameter2 Value", "Value of item 3 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[2].isA("sap.m.MessageStrip"), "Item 3 of Sub Group 3 is a message strip");
						assert.ok(oPanel.getContent()[5].isA("sap.m.MessageStrip"), "Item 6 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Sub groups (Tab)", {
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
		QUnit.test("2 Sub Tabs in default group with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "subTabsInDefaultGroup.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 3, "Default Panel contains 3 items");
						var oSubGroup = oPanel.getContent()[1].getAggregation("_field");
						assert.ok(oSubGroup.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub Tab");
						assert.ok(!oSubGroup.getExpanded(), "Group collapsed by setting");
						assert.equal(oSubGroup.getItems().length, 1, "Icon tab bar contains 1 icon tab filter.");
						assert.equal(oSubGroup.getItems()[0].getText(), "Sub group", "Find 'Sub group' tab filter.");
						assert.equal(oSubGroup.getItems()[0].getContent().length, 2, "Icon tab filter contains 2 elements.");
						assert.equal(oSubGroup.getItems()[0].getContent()[0].getItems()[0].getText(), "stringParameter", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubGroup.getItems()[0].getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubGroup.getItems()[0].getContent()[1].getAggregation("_field").getValue(), "stringParameter Value", "Value of item 2 of Sub Group correct");
						assert.ok(oPanel.getContent()[0].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Multi Sub tabs in default group with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "multiSubTabsInDefaultGroup.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 3, "Default Panel contains 4 items");
						var oSubTab = oPanel.getContent()[1].getAggregation("_field");
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						assert.equal(oSubTab.getItems().length, 3, "Icon tab bar contains 1 icon tab filter.");
						var oSubTabFilter = oSubTab.getItems()[0];
						assert.equal(oSubTabFilter.getText(), "Sub group 1", "Find 'Sub group 1' tab filter.");
						assert.equal(oSubTabFilter.getContent().length, 2, "Icon tab filter contains 2 elements.");
						assert.equal(oSubTabFilter.getContent()[0].getItems()[0].getText(), "stringParameter1", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubTabFilter.getContent()[1].getAggregation("_field").getValue(), "stringParameter1 Value", "Value of item 2 of Sub Group correct");
						var oSubTabFilter3 = oSubTab.getItems()[2];
						assert.equal(oSubTabFilter3.getText(), "Sub group 3", "Find 'Sub group 3' tab filter.");
						assert.equal(oSubTabFilter3.getContent().length, 2, "Icon tab filter contains 2 elements.");
						assert.equal(oSubTabFilter3.getContent()[0].getItems()[0].getText(), "stringParameter2", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter3.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubTabFilter3.getContent()[1].getAggregation("_field").getValue(), "stringParameter2 Value", "Value of item 2 of Sub Group correct");
						assert.ok(oPanel.getContent()[0].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Multi Sub tabs with one is empty", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "multiSubTabs.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					wait().then(function () {
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.equal(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.equal(oPanel.getContent().length, 5, "Default Panel contains 6 items");
						assert.equal(oPanel.getContent()[0].getItems()[0].getText(), "stringParameter", "Lable of item 1 of Group correct");
						assert.ok(oPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Group is a String field");
						assert.equal(oPanel.getContent()[1].getAggregation("_field").getValue(), "stringParameter Value", "Value of item 2 of Group correct");
						var oSubTab = oPanel.getContent()[3].getAggregation("_field");
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 3 of Default Panel is sub panel");
						assert.ok(oSubTab.getExpanded(), "Group collapsed by setting");
						assert.equal(oSubTab.getItems().length, 2, "Icon tab bar contains 1 icon tab filter.");
						var oSubTabFilter = oSubTab.getItems()[0];
						assert.equal(oSubTabFilter.getText(), "Sub group 2", "Find 'Sub group 1' tab filter.");
						assert.equal(oSubTabFilter.getContent().length, 2, "Icon tab filter contains 2 elements.");
						assert.equal(oSubTabFilter.getContent()[0].getItems()[0].getText(), "stringParameter1", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubTabFilter.getContent()[1].getAggregation("_field").getValue(), "stringParameter1 Value", "Value of item 2 of Sub Group correct");
						var oSubTabFilter3 = oSubTab.getItems()[1];
						assert.equal(oSubTabFilter3.getText(), "Sub group 3", "Find 'Sub group 3' tab filter.");
						assert.equal(oSubTabFilter3.getContent().length, 2, "Icon tab filter contains 2 elements.");
						assert.equal(oSubTabFilter3.getContent()[0].getItems()[0].getText(), "stringParameter2", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter3.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.equal(oSubTabFilter3.getContent()[1].getAggregation("_field").getValue(), "stringParameter2 Value", "Value of item 2 of Sub Group correct");
						assert.ok(oPanel.getContent()[2].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Fields customization", {
		beforeEach: function () {
			sap.ui.loader.config({
				paths: {
					"sap/ui/integration/editor/test/customfield": "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/designtime"
				}
			});
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
		QUnit.test("Extends VizBase", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldExtendsVizBase",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"dateRange": {
									"value": ""
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
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
						assert.equal(oLabel.getText(), "Date Range", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getModel("currentSettings"), "Field: model currentSettings");
						assert.ok(oField.getModel("items"), "Field: model items");
						assert.ok(oField.getModel("i18n"), "Field: model i18n");
						assert.ok(oField.getModel("context"), "Field: model context");
						assert.ok(oField.getModel("contextflat"), "Field: contextflat context");
						var oControl = oField.getAggregation("_field").getAggregation("_control");
						assert.ok(oControl.isA("sap.m.DateRangeSelection"), "Field: DateRangeSelection control");
						assert.ok(oControl.getModel("currentSettings"), "DateRangeSelection: model currentSettings");
						assert.ok(oControl.getModel("items"), "DateRangeSelection: model items");
						assert.ok(oControl.getModel("i18n"), "DateRangeSelection: model i18n");
						assert.ok(oControl.getModel("context"), "DateRangeSelection: model context");
						assert.ok(oControl.getModel("contextflat"), "DateRangeSelection: contextflat context");
						oControl._getValueHelpIcon().firePress();
						wait().then(function () {
							assert.ok(oControl._oPopup.isOpen(), "DateRangeSelection: date popup open");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Fragment", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/fieldWithFragment",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"cardTitle": {
									"value": "Card Title Default"
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
					wait().then(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains 1 Label");
						assert.equal(oLabel.getText(), "Card Title", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getModel("currentSettings"), "Field: model currentSettings");
						assert.ok(oField.getModel("items"), "Field: model items");
						assert.ok(oField.getModel("i18n"), "Field: model i18n");
						assert.ok(oField.getModel("context"), "Field: model context");
						assert.ok(oField.getModel("contextflat"), "Field: contextflat context");
						var oControl = oField.getAggregation("_field");
						assert.ok(oControl.isA("sap.m.Input"), "Field: Input control");
						assert.ok(oControl.getModel("currentSettings"), "Input: model currentSettings");
						assert.ok(oControl.getModel("items"), "Input: model items");
						assert.ok(oControl.getModel("i18n"), "Input: model i18n");
						assert.ok(oControl.getModel("context"), "Input: model context");
						assert.ok(oControl.getModel("contextflat"), "Input: contextflat context");
						assert.equal(oControl.getValue(), "Card Title Default", "Input: Value");
						oControl.setValue("Card Title New");
						wait().then(function () {
							assert.equal(oControl.getValue(), "Card Title New", "Input: Value changed");
							var oSettings = oControl.getModel("currentSettings");
							assert.equal(oSettings.getProperty("/form/items/cardTitle/value"), "Card Title New", "Settings: Value changed");
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
