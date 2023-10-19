/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"../ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"qunit/designtime/EditorQunitUtils"
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
	ResourceBundle,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("1 string parameter and value trans (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": {
							"bundleUrl": "../i18n/i18n.properties",
							"supportedLocales": [
								"",
								"fr",
								"en"
							],
							"fallbackLocale": "en"
						}
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans in i18n format (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": {
							"bundleUrl": "../i18n/i18n.properties",
							"supportedLocales": [
								"",
								"fr",
								"en"
							],
							"fallbackLocale": "en"
						}
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{i18n>STRINGPARAMETERVALUE}"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": {
							"bundleUrl": "../i18n/i18n.properties",
							"supportedLocales": [
								"",
								"fr",
								"en"
							],
							"fallbackLocale": "en"
						}
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StringLabelTrans Value"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1translatedstringWithI18nObject.json" });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in translation mode", function (assert) {
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": {
							"bundleUrl": "../i18n/i18n.properties",
							"supportedLocales": [
								"",
								"fr",
								"en"
							],
							"fallbackLocale": "en"
						}
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Check Translation Values for Admin, Content, Translation", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Check translation for value, label, description in admin mode", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "Field1: String 1 English");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 English", "Label2: Desc 1 English");
					}).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 English", "Field2: String 2 English");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 English", "Label2: Desc 2 English");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 English", "Field2: String 3 English");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 English", "Label3: Desc 3 English");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("en-US");
					this.oEditor.setMode("admin");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.wait().then(function () {
							assert.equal(oLabel1.getText(), "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 US English", "Label2: Desc 1 US English");
						}).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 US English", "Label2: Desc 2 US English");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 US English", "Label3: Desc 3 US English");
						}).then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in admin mode, supportedLocales not defined in i18n object", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "Field1: String 1 English");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 English", "Label2: Desc 1 English");
					}).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 English", "Field2: String 2 English");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 English", "Label2: Desc 2 English");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 English", "Field2: String 3 English");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 English", "Label3: Desc 3 English");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("en-US");
					this.oEditor.setMode("admin");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.wait().then(function () {
							assert.equal(oLabel1.getText(), "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 US English", "Label2: Desc 1 US English");
						}).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 US English", "Label2: Desc 2 US English");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 US English", "Label3: Desc 3 US English");
						}).then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in content mode", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("content");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "Field1: String 1 English");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 English", "Label2: Desc 1 English");
					}).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 English", "Field2: String 2 English");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 English", "Label2: Desc 2 English");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 English", "Field2: String 3 English");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 English", "Label3: Desc 3 English");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("en-US");
					this.oEditor.setMode("content");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.wait().then(function () {
							assert.equal(oLabel1.getText(), "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 US English", "Label2: Desc 1 US English");
						}).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 US English", "Label2: Desc 2 US English");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 US English", "Label3: Desc 3 US English");
						}).then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) to fr", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French", "Field1Trans: String 1 French");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French", "Field3Trans: String 3 French");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 English", "Field4Ori: String 4 English");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 French", "Field4Trans: String 4 French");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) to fr-CA", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French CA", "Field1Trans: String 1 French CA");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French CA", "Field2Trans: String 2 French CA");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French CA", "Field3Trans: String 3 French CA");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 English", "Field4Ori: String 4 English");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 French CA", "Field4Trans: String 4 French CA");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) to fr", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					EditorQunitUtils.wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French", "Field1Trans: String 1 French");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French", "Field3Trans: String 3 French");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) to fr-CA", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French CA", "Field1Trans: String 1 French CA");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French CA", "Field2Trans: String 2 French CA");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French CA", "Field3Trans: String 3 French CA");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 English", "Field4Ori: String 4 English");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 French CA", "Field4Trans: String 4 French CA");
					}).then(function () {
						destroyEditor(this.oEditor);
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
