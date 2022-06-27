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

	function getDefaultContextModel(oResourceBundle) {
		return {
			empty: {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	}

	QUnit.module("Create an editor based on old manifest without dt", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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
		QUnit.test("1 string parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value",
									"label": "string Parameter",
									"type": "string"
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
					assert.ok(oLabel.getText() === "string Parameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value", "Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.ok(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"] === "stringParameter Value", "Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Create an editor based on json with designtime module", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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

		QUnit.test("No configuration section (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as file)", function (assert) {
			this.oEditor.setJson({ manifest: sBaseUrl + "noconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyparameters.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptydestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {}, "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyparametersdestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter using TextArea", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oControl = oField.getAggregation("_field");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "Use TextArea for a string field", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
					assert.ok(oControl.getValue() === "stringWithTextArea Value", "Field: String Value");
					oControl.setValue("stringWithTextArea new Value");
					assert.ok(oField._getCurrentProperty("value") === "stringWithTextArea new Value", "Field: String Value updated");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 hint below a group (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			this.oEditor.attachReady(function () {
				assert.ok(this.oEditor.isReady(), "Editor is ready");
				var oHint = this.oEditor.getAggregation("_formContent")[1];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.ok(oHint.getHtmlText() === 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 hint below an item (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			this.oEditor.attachReady(function () {
				assert.ok(this.oEditor.isReady(), "Editor is ready");
				var oHint = this.oEditor.getAggregation("_formContent")[4];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.ok(oHint.getHtmlText() === 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 string parameter with values and no label (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringwithvalues", "type": "List", "configuration": { "parameters": { "stringParameterWithValues": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringParameterWithValues", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
						var aItems = oField.getAggregation("_field").getItems();
						assert.ok(aItems.length === 3, "Field: Select items lenght is OK");
						assert.ok(aItems[0].getKey() === "key1", "Field: Select item 0 Key is OK");
						assert.ok(aItems[0].getText() === "text1", "Field: Select item 0 Text is OK");
						assert.ok(aItems[1].getKey() === "key2", "Field: Select item 1 Key is OK");
						assert.ok(aItems[1].getText() === "text2", "Field: Select item 1 Text is OK");
						assert.ok(aItems[2].getKey() === "key3", "Field: Select item 1 Key is OK");
						assert.ok(aItems[2].getText() === "text3", "Field: Select item 1 Text is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter with request values from json file", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"type": "string"
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
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringParameterWithValues", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
						var aItems = oField.getAggregation("_field").getItems();
						assert.ok(aItems.length === 4, "Field: Select items lenght is OK");
						assert.ok(aItems[0].getKey() === "key1", "Field: Select item 0 Key is OK");
						assert.ok(aItems[0].getText() === "text1req", "Field: Select item 0 Text is OK");
						assert.ok(aItems[1].getKey() === "key2", "Field: Select item 1 Key is OK");
						assert.ok(aItems[1].getText() === "text2req", "Field: Select item 1 Text is OK");
						assert.ok(aItems[2].getKey() === "key3", "Field: Select item 2 Key is OK");
						assert.ok(aItems[2].getText() === "text3req", "Field: Select item 2 Text is OK");
						assert.ok(aItems[3].getKey() === "key4", "Field: Select item 3 Key is OK");
						assert.ok(aItems[3].getText() === "text4req", "Field: Select item 3 Text is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with values (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.ok(oField.getAggregation("_field").getItems().length === 5, "Field: MultiComboBox items lenght is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with values (as json) with value missing", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": ["key1", "key4"]
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
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
						var oMultiComboBox = oField.getAggregation("_field");
						assert.ok(oMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.ok(oMultiComboBox.getItems().length === 5, "Field: MultiComboBox items lenght is OK");
						assert.ok(oMultiComboBox.getSelectedKeys().length === 1, "Field: Selected Keys length correct");
						assert.ok(oMultiComboBox.getSelectedKeys()[0] === "key1", "Field: Selected Keys correct");
						var aValue = this.oEditor.getCurrentSettings()["/sap.card/configuration/parameters/stringArrayParameter/value"];
						assert.ok(aValue.length === 1, "Field: value length correct");
						assert.ok(aValue[0] === "key1", "Field: value correct");
						resolve();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with no values (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringarraynovalues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameterNoValues": {},
								"stringArrayParameterNoValuesNotEditable": {}
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
					assert.ok(oLabel.getText() === "stringArrayParameterNoValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: Input value is OK");
					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringArrayParameterNoValuesNotEditable", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: Input value is OK");
					assert.ok(!oField.getAggregation("_field").getEditable(), "Field: Input editable is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with request values from json file", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.ok(oField.getAggregation("_field").getItems().length === 6, "Field: MultiComboBox items lenght is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringlabel",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StaticLabel Value"
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
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StaticLabel Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameter.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameterlabel.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StaticLabel Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						oSelect.setSelectedIndex(10);
						oSelect.open();
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow File (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowFile", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						assert.ok(oSelect.getItemByKey("").getEnabled(), "Icon: item none is enabled");
						assert.ok(!oSelect.getItemByKey("file").getEnabled(), "Icon: item file is disabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow None (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						assert.ok(!oSelect.getItemByKey("").getEnabled(), "Icon: item none is disabled");
						assert.ok(oSelect.getItemByKey("file").getEnabled(), "Icon: item file is enabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow File and None (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowFileAndNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						assert.ok(!oSelect.getItemByKey("").getEnabled(), "Icon: item none is disabled");
						assert.ok(!oSelect.getItemByKey("file").getEnabled(), "Icon: item file is disabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected git sis disabled");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with image (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.setSelectedIndex(10);
						oSelect.open();
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with change to new icon (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.open();
						oSelect.setSelectedIndex(10);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[10] });
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with change to file (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.open();
						oSelect.setSelectedItem(oSelect.getItems()[2]);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[2] });
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.setSelectedIndex(10);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[10] });
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for 3 < index < 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 39, "Field: Page DOWN navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Page Up navigation correct for index = 39");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Down navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Down navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 76, "Field: Page DOWN navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Page Up navigation correct for index = 76");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Left navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Left navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Right navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 17, "Field: Arrow Right navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Down navigation correct for index = 17");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 30, "Field: Arrow Right navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Right navigation correct for index = 30");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 43, "Field: Arrow Down navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Up navigation correct for index = 43");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 19, "Field: Arrow Up navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 7, "Field: Arrow Up navigation correct for index = 19");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 7");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with NOT Allow None: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.setSelectedIndex(10);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[10] });
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for 3 < index < 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Down navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Left navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 13, "Field: Arrow Left navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 12, "Field: Arrow Left navigation correct for index = 13");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 11, "Field: Arrow Left navigation correct for index = 12");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 12, "Field: Arrow Right navigation correct for index = 11");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 13, "Field: Arrow Right navigation correct for index = 12");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Right navigation correct for index = 13");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 26, "Field: Arrow Down navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 27, "Field: Arrow Right navigation correct for index = 26");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 28, "Field: Arrow Right navigation correct for index = 27");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 40, "Field: Arrow Down navigation correct for index = 28");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 28, "Field: Arrow Up navigation correct for index = 40");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Up navigation correct for index = 28");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 4, "Field: Arrow Up navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 4");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with NOT Allow File: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowFile", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.setSelectedIndex(10);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[10] });
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for 3 < index < 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Down navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Left navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 13, "Field: Arrow Left navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 12, "Field: Arrow Left navigation correct for index = 13");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 13, "Field: Arrow Right navigation correct for index = 12");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Right navigation correct for index = 13");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Right navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 27, "Field: Arrow Down navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 28, "Field: Arrow Right navigation correct for index = 27");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Right navigation correct for index = 28");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 41, "Field: Arrow Down navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Up navigation correct for index = 41");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 17, "Field: Arrow Up navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 5, "Field: Arrow Up navigation correct for index = 17");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 5");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with NOT Allow None and NOT Allow File: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowFileAndNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						oSelect.setSelectedIndex(10);
						oSelect.fireChange({ selectedItem: oSelect.getItems()[10] });
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Up navigation correct for 3 < index < 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Up navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 27, "Field: Arrow Down navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 26, "Field: Arrow Left navigation correct for index = 27");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 25, "Field: Arrow Left navigation correct for index = 26");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 24, "Field: Arrow Left navigation correct for index = 25");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 25, "Field: Arrow Right navigation correct for index = 24");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 26, "Field: Arrow Right navigation correct for index = 25");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 27, "Field: Arrow Right navigation correct for index = 26");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 39, "Field: Arrow Down navigation correct for index = 27");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 40, "Field: Arrow Right navigation correct for index = 39");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 41, "Field: Arrow Right navigation correct for index = 40");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 53, "Field: Arrow Down navigation correct for index = 41");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 41, "Field: Arrow Up navigation correct for index = 53");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Up navigation correct for index = 41");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 17, "Field: Arrow Up navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 5, "Field: Arrow Up navigation correct for index = 17");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Up navigation correct for index = 5");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with image: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						assert.ok(oSelect.getSelectedIndex() === 2, "Field: selected index is 2");
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Arrow Up navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 39, "Field: Page DOWN navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 0, "Field: Page Up navigation correct for index = 39");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Down navigation correct for index = 0");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 2, "Field: Arrow Down navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Down navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 2, "Field: Arrow Up navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Right navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 76, "Field: Page DOWN navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Page Up navigation correct for index = 76");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Left navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Left navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Right navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 17, "Field: Arrow Right navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Down navigation correct for index = 17");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 30, "Field: Arrow Right navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Right navigation correct for index = 30");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 43, "Field: Arrow Down navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Up navigation correct for index = 43");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 19, "Field: Arrow Up navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 7, "Field: Arrow Up navigation correct for index = 19");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 7");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with image and Not Allow None: keyboard navigation (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/iconWithNotAllowNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgCKr4qjAAD//gAQTGF2YzU4LjM1LjEwMAD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xACFAAACAgMBAAAAAAAAAAAAAAAAAwIBBQQGBwEBAQEBAQEAAAAAAAAAAAAAAAEDAgQFEAACAQICBgUHCwUBAQAAAAAAAQIDERIEcTFBIVEFgaFhkbFSQnLRIjIT4dKCwfAVBkNTIzNj4pKToxSiEQEBAQEBAQAAAAAAAAAAAAAAEQESMVH/wAARCAB4AJUDASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWGERh9SslkgJCgJgSFFEiyQoiWTAUQAmAoWUNKJQoiOsRsKFANsUShYEwFGmhhSGIyrVZIsmKKJlkxURLJ2JWFEAsMsXYULsFhtgFCbANCwoTYLDQJQmxVhpEUJsFiZQGmMQtDUZtUxhFDAJEgJhIomWSBFWLsW2krt20nD57ndOg8FG1WW1+aulaxR2VScKUXOclGK1t6kYWfMcvGpSpxl8WVVxSULOyltbv1azxzM5yvm3+7NtbI6oroN7lMqcM7Sc9yu0vSasjjpHuZQwo7WFlEyDYIiLJtiHK2zp2AWAjHfZ3hj7OtAIQ1CENRw0PQqpXpUI4qk4wXa/Ba2YrOZ2GThd75P3Y8fkR49WrVMxNzqSxN9y7F2Erndepz55lY6lUnojbxaNCX4gh5tCT0yS8EzzICVzXdT5/mH7lOnHTeXqMRPm2dn+bh9FJHOARGQq5vMV/5Ks5Lhfd3LcY8AIgC9nda1vQ6nTnVmoQWKUnZI9GX4ejgV6zU7b/AGU437NTC+u3yeap5ulGcHfclJbYy2p/beZI43l/KnkqjqOs5O1sMVhi/S37+w7A0aIsQ3wJvea7iKqDm72w2enXo2PxNf4jT1Jdl9z0cHpJSW7zl/8AS+3cYipOaXlLirYlpVxRvOdnulhvsav3cO0Piv8AUj/iYVVVLz8D7MGF8GrpksX9Z/8AP5oRmEybkoRcnqSv3Gumc1zTNKFF04tYp7nZ70tpw18cFmK88zVlUlte5cFsSNMCg8qwKO2yPKP/AE0lUqSlC79lJa48eki5lcUB6kuRUNs6j7vUcfzLKQydWEYYrSjffxuHW5uOdN3L5epmaip01dvW9iXFmtCDqTjBa5NRWls92ymUp5SGCC3+dLbJhMytbIcvp5KPlVHrn9S4I6EiRuV6JE7kSFyiEDFk2zUlIC39uJpTUGt9n2rdLqEVK8Ye9KMdMkvFHM1ea0Yt2bm+yPs+KvpCa2KtGli9521r2b+r5TW+DR8p/wCv+4xEuaKbu6fRua6xf3jD9PqidM7jEVc9mK2ubS4R9ldRiywIyUWAEAZrL8wzOWWGE7x8mXtJaOBhQCu9p8+ml+5SUnxi8PU7mG5jn4Z34eGDjgvraevQc2QsFutuhV+DVhUtiwSUrXte3aegR/EEfOoNejK/ikea2KsUzdx6n9/0LfxVL/R9Zrvn8NlGXTNeo80sFiL1r0J8/lsoLpm/mmjPnmZl7sacOhvxZxpYOt+ugnzXOT/MtojFfUYueazE/eq1H9JmmAc1Hey7FgEUWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXC4sCIZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwAZcLiwA//Z" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					setTimeout(function () {
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						assert.ok(oSelect.getSelectedIndex() === 2, "Field: selected index is 2");
						oSelect.focus();
						oSelect.open();
						setTimeout(function () {
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 39, "Field: Page DOWN navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Page Up navigation correct for index = 39");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 2, "Field: Arrow Down navigation correct for index = 1");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Down navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 2, "Field: Arrow Up navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 3, "Field: Arrow Right navigation correct for index = 2");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Down navigation correct for index = 3");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 76, "Field: Page DOWN navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.PAGE_UP);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Page Up navigation correct for index = 76");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Left navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_LEFT);
							assert.ok(oSelect.getSelectedIndex() === 14, "Field: Arrow Left navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 15, "Field: Arrow Right navigation correct for index = 14");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 16, "Field: Arrow Right navigation correct for index = 15");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 17, "Field: Arrow Right navigation correct for index = 16");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 29, "Field: Arrow Down navigation correct for index = 17");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 30, "Field: Arrow Right navigation correct for index = 29");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_RIGHT);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Right navigation correct for index = 30");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_DOWN);
							assert.ok(oSelect.getSelectedIndex() === 43, "Field: Arrow Down navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 31, "Field: Arrow Up navigation correct for index = 43");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 19, "Field: Arrow Up navigation correct for index = 31");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 7, "Field: Arrow Up navigation correct for index = 19");
							QUnitUtils.triggerKeydown(oSelect.getDomRef(), KeyCodes.ARROW_UP);
							assert.ok(oSelect.getSelectedIndex() === 1, "Field: Arrow Up navigation correct for index = 7");
							resolve();
						}, 1000);
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans (as json)", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
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
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringParameter Value Trans in i18n", "Field: Value from Translate change");
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
						"i18n": "../i18n/i18n.properties"
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringParameter Value Trans in i18n", "Field: Value from Translate change");
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
						"i18n": "../i18n/i18n.properties"
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
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as file)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1translatedstring.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("1 integer parameter and no label no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1integer", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label with no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1integerlabel", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label with no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1number", "type": "List", "configuration": { "parameters": { "numberParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label with no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1date", "type": "List", "configuration": { "parameters": { "dateParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: No Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(new Date());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.ok(oField.getAggregation("_field").getBinding("value").getValue() === oField.getAggregation("_field").getValue(), "Field: Date Field binding raw value '" + oField.getAggregation("_field").getValue() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.ok(oField.getAggregation("_field").getBinding("value").getValue() === "", "Field: Date Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label with no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1datetime", "type": "List", "configuration": { "parameters": { "datetimeParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: No Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(new Date());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.ok(oField.getAggregation("_field").getBinding("value").getValue() === oField.getAggregation("_field").getValue().toISOString(), "Field: DateTime Field binding raw value '" + oField.getAggregation("_field").getDateValue().toISOString() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.ok(oField.getAggregation("_field").getBinding("value").getValue() === "", "Field: DateTime Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label with no value (as json)", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1boolean", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === false, "Field: No value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 destination (as json)", function (assert) {
			this.oEditor.setJson({ host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} }, "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oPanel = this.oEditor.getAggregation("_formContent")[3];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel1.getText() === "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Start the editor in translation mode", function (assert) {
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible string parameters", function (assert) {
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/stringsTransWithNotEditableOrNotVisible",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringNotEditableParameter": {
									"value": ""
								},
								"stringNotVisibleParameter": {
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
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringNotEditableParameter", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getEditable(), "Field: String Field editable");

					assert.ok(this.oEditor.getAggregation("_formContent").length === 5, "Field: stringNotVisibleParameter Field not exist");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty Host Context", function (assert) {
			this.oEditor.setJson({ host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.deepEqual(oModel.getData(), getDefaultContextModel(this.oEditor._oResourceBundle), "Editor has a default context model");
					assert.ok(oModel.getProperty("/sap.workzone/currentUser/id") === undefined, "Editor context /sap.workzone/currentUser/id is undefned");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Context Host checks to access context data async", function (assert) {
			this.oEditor.setJson({ host: "contexthost", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/label"), "Id of the Work Zone user", "Editor host context contains the user id label 'Id of the Work Zone'");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/placeholder"), "Work Zone user id", "Editor host context contains the user id placeholder 'Work Zone user id'");
					var oBinding = oModel.bindProperty("/sap.workzone/currentUser/id/value");
					oBinding.attachChange(function () {
						assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), "MyCurrentUserId", "Editor host context user id value is 'MyCurrentUserId'");
						resolve();
					});
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), undefined, "Editor host context user id value is undefined");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check Description", function (assert) {
			var oJson = { baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } };
			this.oEditor.setJson(oJson);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					oField._descriptionIcon.onmouseover();
					var oDescriptionText = this.oEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
					oField._descriptionIcon.onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Change Check from lays: Admin, Content and Translate", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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
		QUnit.test("Check changes in Admin Mode: change from Admin", function (assert) {
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Admin Mode: change from Admin and Content", function (assert) {
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Admin Mode: change from Admin, Content and Translate", function (assert) {
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
			};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin and Content", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin, Content and Translate", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Translation Mode: change from Admin", function (assert) {
            this.oEditor.setMode("translation");
            var adminchanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
                ":layer": 0,
                ":errors": false
            };
            var pagechanges = {
            };
            var translationchanges = {
            };

            //TODO: check the log for the warning
            this.oEditor.setLanguage("badlanguage");

            this.oEditor.setLanguage("fr");

            this.oEditor.setJson({
                baseUrl: sBaseUrl,
                manifest: {
                    "sap.app": {
                        "id": "test.sample",
                        "i18n": "../i18n/i18n.properties"
                    },
                    "sap.card": {
                        "designtime": "designtime/1stringtrans",
                        "type": "List",
                        "configuration": {
                            "parameters": {
                                "stringParameter": {
									"value": ""
								}
                            }
                        }
                    }
                },
                manifestChanges: [adminchanges, pagechanges, translationchanges]
            });
            return new Promise(function (resolve, reject) {
                this.oEditor.attachReady(function () {
                    assert.ok(this.oEditor.isReady(), "Editor is ready");
                    var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

                    var oLabel = this.oEditor.getAggregation("_formContent")[2];
                    var oField = this.oEditor.getAggregation("_formContent")[3];
                    assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
                    assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Admin", "Field: Value from Admin change");

                    oField = this.oEditor.getAggregation("_formContent")[4];
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    resolve();
                }.bind(this));
            }.bind(this));
        });

        QUnit.test("Check changes in Translation Mode: change from Admin and Content", function (assert) {
            this.oEditor.setMode("translation");
            var adminchanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
                ":layer": 0,
                ":errors": false
            };
            var pagechanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
                ":layer": 5,
                ":errors": false
            };
            var translationchanges = {
            };

            //TODO: check the log for the warning
            this.oEditor.setLanguage("badlanguage");

            this.oEditor.setLanguage("fr");

            this.oEditor.setJson({
                baseUrl: sBaseUrl,
                manifest: {
                    "sap.app": {
                        "id": "test.sample",
                        "i18n": "../i18n/i18n.properties"
                    },
                    "sap.card": {
                        "designtime": "designtime/1stringtrans",
                        "type": "List",
                        "configuration": {
                            "parameters": {
                                "stringParameter": {
									"value": ""
								}
                            }
                        }
                    }
                },
                manifestChanges: [adminchanges, pagechanges, translationchanges]
            });
            return new Promise(function (resolve, reject) {
                this.oEditor.attachReady(function () {
                    assert.ok(this.oEditor.isReady(), "Editor is ready");
                    var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

                    var oLabel = this.oEditor.getAggregation("_formContent")[2];
                    var oField = this.oEditor.getAggregation("_formContent")[3];
                    assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
                    assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

                    oField = this.oEditor.getAggregation("_formContent")[4];
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    resolve();
                }.bind(this));
            }.bind(this));
        });

        QUnit.test("Check changes in Translation Mode: change from Admin, Content and Translate", function (assert) {
            this.oEditor.setMode("translation");
            var adminchanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
                ":layer": 0,
                ":errors": false
            };
            var pagechanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
                ":layer": 5,
                ":errors": false
            };
            var translationchanges = {
                "/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
                ":layer": 10,
                ":errors": false
            };

            //TODO: check the log for the warning
            this.oEditor.setLanguage("badlanguage");

            this.oEditor.setLanguage("fr");

            this.oEditor.setJson({
                baseUrl: sBaseUrl,
                manifest: {
                    "sap.app": {
                        "id": "test.sample",
                        "i18n": "../i18n/i18n.properties"
                    },
                    "sap.card": {
                        "designtime": "designtime/1stringtrans",
                        "type": "List",
                        "configuration": {
                            "parameters": {
                                "stringParameter": {
									"value": ""
								}
                            }
                        }
                    }
                },
                manifestChanges: [adminchanges, pagechanges, translationchanges]
            });
            return new Promise(function (resolve, reject) {
                this.oEditor.attachReady(function () {
                    assert.ok(this.oEditor.isReady(), "Editor is ready");
                    var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

                    var oLabel = this.oEditor.getAggregation("_formContent")[2];
                    var oField = this.oEditor.getAggregation("_formContent")[3];
                    assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
                    assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

                    oField = this.oEditor.getAggregation("_formContent")[4];
                    assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
                    assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
                    resolve();
                }.bind(this));
            }.bind(this));
        });

		QUnit.test("Check changes in All Mode: change from Admin", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
			};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in All Mode: change from Admin and Content", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in All Mode: change from Admin, Content and Translate", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translate: translate the translated value", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
			};
			var pagechanges = {
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in Admin Mode: change visible from Admin", function (assert) {
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getVisible(), "Field: Visible not changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in Content Mode: change visible from Admin", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oFormContent = this.oEditor.getAggregation("_formContent");
					assert.ok(oFormContent === null, "Visible: visible change from Admin");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in Translation Mode: change visible from Admin", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");
			this.oEditor.setLanguage("fr");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": ""
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
                    var oPanel = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(this.oEditor.getAggregation("_formContent").length === 1, "Field: No field since change from Admin");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in All Mode: change visible from Admin", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oFormContent = this.oEditor.getAggregation("_formContent");
					assert.ok(oFormContent === null, "Visible: visible change from Admin");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in Admin Mode: change editable from Admin", function (assert) {
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable not changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in Content Mode: change editable from Admin", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Editable changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in Translation Mode: change editable from Admin", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");
			this.oEditor.setLanguage("fr");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Input not changed by the Admin change for editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in All Mode: change editable from Admin", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
				},
				manifestChanges: [adminchanges, contentchanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Editable changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in admin mode: change from admin", function (assert) {
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in content mode: change from admin", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in content mode: change from content", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in content mode: change from admin and content", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from admin", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
			};
			var translationchanges = {
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Admin", "Field: Value from Admin change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from content", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 0,
				":errors": false
			};
			var translationchanges = {
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from admin and content", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from translate", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
			};
			var pagechanges = {
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getText() === "StringParameter Value Trans in i18n", "Field: Value from Translate change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from admin and translate", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Admin", "Field: Value from Admin change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in Translation mode: change from admin, content and translate", function (assert) {
			this.oEditor.setMode("translation");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
                    assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
                    assert.ok(oPanel1.getHeaderText() === this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel: has the correct text EDITOR_ORIGINALLANG");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value in Translate input");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in all mode: change from admin", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in all mode: change from admin and content", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changed value override translate in all mode: change from admin, content and translate", function (assert) {
			this.oEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var pagechanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Content",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
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
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Create editors from existing controls", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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

		QUnit.test("Slider is created from dt json inline", function (assert) {

			var dt = {
				"form": {
					"items": {
						"integer": {
							"manifestpath": "/sap.card/configuration/parameters/integer/value",
							"defaultValue": 1,
							"type": "integer",
							"visualization": {
								"type": "Slider", //NO CLASS ANYMORE
								"settings": {
									"value": "{currentSettings>value}",
									"min": 0,
									"max": 10,
									"width": "100%",
									"showAdvancedTooltip": true,
									"showHandleTooltip": false,
									"inputsAsTooltips": true,
									"enabled": "{currentSettings>editable}"
								}
							}
						}
					}
				}
			};

			this.oEditor.setDesigntime(dt);
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].getAggregation("_field").isA("sap.m.Slider"), "Content of Form contains: Slider ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Slider is created from dt class inline", function (assert) {
			var dt = function () {
				return new Designtime(
					{
						"form": {
							"items": {
								"integer": {
									"manifestpath": "/sap.card/configuration/parameters/integer/value",
									"defaultValue": 1,
									"type": "integer",
									"visualization": {
										"type": "Slider", //NO CLASS ANYMORE
										"settings": {
											"value": "{currentSettings>value}",
											"min": 0,
											"max": 10,
											"width": "100%",
											"showAdvancedTooltip": true,
											"showHandleTooltip": false,
											"inputsAsTooltips": true,
											"enabled": "{currentSettings>editable}"
										}
									}
								}
							}
						}
					});
			};

			this.oEditor.setDesigntime(dt);
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].getAggregation("_field").isA("sap.m.Slider"), "Content of Form contains: Slider ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("TextArea is created from dt class inline", function (assert) {
			var dt = function () {
				return new Designtime(
					{
						"form": {
							"items": {
								"string": {
									"manifestpath": "/sap.card/configuration/parameters/string/value",
									"type": "string",
									"visualization": {
										"type": "TextArea", //NO CLASS ANYMORE
										"settings": {
											"value": "{currentSettings>value}",
											"width": "100%",
											"editable": "{config/editable}",
											"placeholder": "{currentSettings>placeholder}",
											"rows": 7
										}
									}
								}
							}
						}
					});
			};

			this.oEditor.setDesigntime(dt);
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oControl = oField.getAggregation("_field");
					assert.ok(oControl.isA("sap.m.TextArea"), "Content of Form contains: TextArea ");
					oControl.setValue("stringWithTextArea new Value");
					assert.ok(oField._getCurrentProperty("value") === "stringWithTextArea new Value", "Field: String Value updated");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("IconSelect is created from dt class inline", function (assert) {
			var dt = function () {
				return new Designtime(
					{
						"form": {
							"items": {
								"icon": {
									"manifestpath": "/sap.card/configuration/parameters/icon/value",
									"defaultValue": "sap-icon://accept",
									"type": "string",
									"visualization": {
										"type": "IconSelect"
									}
								}
							}
						}
					});
			};

			this.oEditor.setDesigntime(dt);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/noconfig",
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Content of Form contains: IconSelect ");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Lazy loading of destinations", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oHost.getDestinations = function () {
				return new Promise(function (resolve) {
					setTimeout(function () {
						resolve([
							{
								"name": "Products"
							},
							{
								"name": "Orders"
							},
							{
								"name": "Portal"
							},
							{
								"name": "Northwind"
							}
						]);
					}, 1000);
				});
			};
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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

		QUnit.test("Check Loading animation on destination", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "MyDestination" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(oField.getAggregation("_field").getBusy() === true, "Content of Form contains: Destination Field that is busy");
					setTimeout(function () {
						//should resolve the destination within 1000ms
						assert.ok(oField.getAggregation("_field").getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						resolve();
					}, 1500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check default destination", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var DestinationSelect = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationSelect.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					setTimeout(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationSelect.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.ok(DestinationSelect.getItems().length === 4, "Content of Form contains: Destination Field items lengh OK");
						assert.ok(DestinationSelect.getSelectedIndex() === 3, "Content of Form contains: Destination Field selectedItem: Index OK");
						assert.ok(DestinationSelect.getSelectedItem().getKey() === "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.ok(DestinationSelect.getSelectedItem().getText() === "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						resolve();
					}, 1500);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get destinations list timeout", {
		beforeEach: function() {
			this.oHost = new Host("host");
			this.oHost.getDestinations = function() {
				return new Promise(function(resove, reject) {
					setTimeout(function() {
						reject("Get destinations list timeout.");
					}, 3000);
				});
			};
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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
	}, function() {
		QUnit.test("Check destination is", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(oField.getAggregation("_field").getBusy() === true, "Content of Form contains: Destination Field that is busy");
					setTimeout(function () {
						//should resolve the destination within 6000ms
						assert.ok(oField.getAggregation("_field").getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.ok(oField.getAggregation("_field").getItems().length === 0, "Content of Form contains: Destination Field items lengh OK");
						resolve();
					}, 8000);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Separator", {
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
		QUnit.test("Check the separator with default config", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "separators.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oSeparator = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oSeparator.isA("sap.m.ToolbarSpacer"), "Label: Form content contains a ToolbarSpacer");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Check the separator can not be seen in translation mode", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "separators.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(!oLabel.isA("sap.m.ToolbarSpacer"), "Label: The 1st content is not a ToolbarSpacer");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		/*
		QUnit.test("Check the separator with line property", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "separators.json" });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oSeparator = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oSeparator.isA("sap.m.ToolbarSpacer"), "Label: Form content contains a ToolbarSpacer");
					resolve();
				}.bind(this));
			}.bind(this));
		});*/
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
