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

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

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
					var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
					var oSelect = oField.getAggregation("_field").getAggregation("_select");
					setTimeout(function () {
						assert.ok(oSelect.getItemByKey("empty").getEnabled(), "Icon: item none is enabled");
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
					var oSelect = oField.getAggregation("_field").getAggregation("_select");
					setTimeout(function () {
						assert.ok(!oSelect.getItemByKey("empty").getEnabled(), "Icon: item none is disabled");
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
					var oSelect = oField.getAggregation("_field").getAggregation("_select");
					setTimeout(function () {
						assert.ok(!oSelect.getItemByKey("empty").getEnabled(), "Icon: item none is disabled");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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
						var oSelect = oField.getAggregation("_field").getAggregation("_select");
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

	QUnit.module("Check settings UI for Admin", {
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
		QUnit.test("Change a dynamic value and take over", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
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
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("With a dynamic value, remove and cancel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
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
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[0];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getEndButton().firePress();
						testInterface.oSegmentedButton.getItems()[1].firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Reset: String value With a dynamic value change", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
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
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					assert.ok(oField.getAggregation("_field").getValue() === "{{parameters.TODAY_ISO}}", "Field: Value is correct");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value", "Field: Value is reset");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Reset: Translated value With a dynamic value change", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
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
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					assert.ok(oField.getAggregation("_field").getValue() === "{{parameters.TODAY_ISO}}", "Field: Value is correct");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							// assert.ok(oField.getAggregation("_field").getValue() === "StringParameter Value Trans in i18n", "Field: Value is reset");
							assert.ok(oField.getAggregation("_field").getValue() === "{{STRINGPARAMETERVALUE}}", "Field: Value is reset");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change visible in settings panel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is not enabled after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting visible to false");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change editing enable in settings panel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting editing enable to false");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt: in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
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
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === false, "Settings: Allow visible option is unselected by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is disabled by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === false, "Settings: Allow editing option is unselected by editableToUser");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: true });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected after setting visible to true");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === true, "Settings: Allow editing option is enabled after setting editing enable to true");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by editableToUser");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && bVisible, "Field: visible value true is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && bEditable, "Field: editable value true is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt: in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
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
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.ok(oEditor.getAggregation("_formContent") === null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but enable both in settings panel : in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": true,
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but just enable visible in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Is NOT editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but just enable editable in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.ok(oEditor.getAggregation("_formContent") === null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt: in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
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
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems().length === 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === true, "Settings: Allow editing option is enabled by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by editableToUser");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === false, "Settings: Allow visible option is unselected after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is enabled after setting visible enable to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === false, "Settings: Allow editing option is unselected after setting editable to false");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt: in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
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
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but disabled both in settings panel : in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false,
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.ok(oEditor.getAggregation("_formContent") === null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but just disable visible in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.ok(oEditor.getAggregation("_formContent") === null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but just disable editable in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
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
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Is NOT editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		//tests for page admin values
		QUnit.test("check page admin values list exists in settings page", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var oTable = testInterface.oSettingsPanel.getItems()[1].getContent()[0];
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel initially visible");
						assert.ok(oTable.isA("sap.m.Table"), "Settings: page admin values table exists.");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function() {
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check page admin values list is invisible if the filed isn't editable or visible", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.ok(oField._oSettingsPanel._oOpener === oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var oTable = testInterface.oSettingsPanel.getItems()[1].getContent()[0];
						assert.ok(testInterface.oCurrentInstance === oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel initially visible");
						assert.ok(oTable.isA("sap.m.Table"), "Settings: page admin values table exists.");
						assert.ok(oTable.getSelectedItems().length === 6, "Settings: all 6 records are selected by default.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[1].getVisible() === false, "Settings: page admin values list is invisible.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[1].getVisible() === false, "Settings: page admin values list is invisible.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[4].getItems()[1].firePress();
						assert.ok(oTable.getSelectedItems().length === 0, "Settings: 0 record is selected.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[4].getItems()[1].firePress();
						assert.ok(oTable.getSelectedItems().length === 6, "Settings: all 6 records are selected.");
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function() {
							assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check page admin values display correctly in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/pageAdminValues": ["key2", "key3"]
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

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
					assert.ok(oLabel.getText() === "Integer Label", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[3];
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.ok(oLabel1.getText() === "Integer Label using Slider", "Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField1.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.ok(oField1.getAggregation("_field").getValue() === 0, "Field: Value correct");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel2.isA("sap.m.Label"), "Label: Form content contains 3 Labels");
					assert.ok(oLabel2.getText() === "Boolean Label", "Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField2.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Default CheckBox control");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					var oField3 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel3.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.ok(oLabel3.getText() === "Boolean Label using Switch", "Label: Has label text");
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
					assert.ok(oLabel.getText() === "Integer Label", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[3];
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.ok(oLabel1.getText() === "Integer Label using Slider", "Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField1.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.ok(oField1.getAggregation("_field").getValue() === 3, "Field: Value correct");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel2.isA("sap.m.Label"), "Label: Form content contains 3 Labels");
					assert.ok(oLabel2.getText() === "Boolean Label", "Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField2.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Default CheckBox control");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					var oField3 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel3.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.ok(oLabel3.getText() === "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField3.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField3.getAggregation("_field").getState() === true, "Field: Value correct");
					var oLabel4 = this.oEditor.getAggregation("_formContent")[9];
					var oField4 = this.oEditor.getAggregation("_formContent")[10];
					assert.ok(oLabel4.isA("sap.m.Label"), "Label: Form content contains 2 Labels");
					assert.ok(oLabel4.getText() === "Integer Label using sap/m/Slider", "Label: Has label text");
					assert.ok(oField4.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField4.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.ok(oField4.getAggregation("_field").getValue() === 4, "Field: Value correct");
					var oLabel5 = this.oEditor.getAggregation("_formContent")[11];
					var oField5 = this.oEditor.getAggregation("_formContent")[12];
					assert.ok(oLabel5.isA("sap.m.Label"), "Label: Form content contains 4 Labels");
					assert.ok(oLabel5.getText() === "Boolean Label using sap/m/Switch", "Label: Has label text");
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
					assert.ok(oLabel.getText() === "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setState(true);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === true, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");
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
					assert.ok(oLabel.getText() === "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setState(true);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === true, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");
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
					assert.ok(oLabel.getText() === "Boolean Label using Switch", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField.getAggregation("_field").getState() === true, "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === true, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");

					oField.getAggregation("_field").setState(false);
					setTimeout(function () {
						assert.ok(oField.getAggregation("_field").getState() === false, "Field: Value correct");
						assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");
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
					assert.ok(oField.getAggregation("_field").getValue() === "visible", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === true, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("editable");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("label");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
							assert.ok(oField2.getVisible() === false, "Field: Value correct");
							assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");
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
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("3");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("10");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
							assert.ok(oField2.getVisible() === true, "Field: Value correct");
							assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");
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
					assert.ok(oField.getAggregation("_field").getValue() === "4", "Field: Value correct");
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oField2.getVisible() === false, "Field: Value correct");
					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");

					oField.getAggregation("_field").setValue("1");
					setTimeout(function () {
						assert.ok(oField1.getAggregation("_field").getEditable() === false, "Field: Value correct");
						assert.ok(oField2.getVisible() === false, "Field: Value correct");
						assert.ok(oLabel3.getText() === "dependentfield3 False", "Label: Value correct");
						oField.getAggregation("_field").setValue("10");
						setTimeout(function () {
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field: Value correct");
							assert.ok(oField2.getVisible() === true, "Field: Value correct");
							assert.ok(oLabel3.getText() === "dependentfield3 True", "Label: Value correct");
							resolve();
						}, 1000);
					}, 1000);
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
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
					assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
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
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					assert.ok(oPanel.getHeaderText() === "no default group", "Group text");
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
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
					assert.ok(oPanel.getHeaderText() === "no default group", "Group text");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.ok(oPanel.getHeaderText() === "no default group", "Group text");
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Sub group expanded by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oMessageStripOfSubPanel = oPanel.getContent()[1];
						assert.ok(!oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is not visible since sub group is expanded");
						var oField1 = oSubPanel.getContent()[1].getAggregation("_field");
						var oField2 = oSubPanel.getContent()[3].getAggregation("_field");
						oSubPanel.setExpanded(false);
						wait(500).then(function () {
							assert.ok(oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is visible since sub group is collapsed and has error");
							assert.ok(oMessageStripOfSubPanel.getText() === oDefaultBundle.getText("EDITOR_GROUP_ERRORS"), "Message strip error text correct");
							oSubPanel.setExpanded(true);
							wait(500).then(function () {
								assert.ok(!oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is not visible since sub group is expanded again");
								oField1.setValue("1234567890");
								oField2.setValue("aa");
								wait(500).then(function () {
									oSubPanel.setExpanded(false);
									wait(500).then(function () {
										assert.ok(oMessageStripOfSubPanel.getVisible(), "Message strip of sub group is visible since has warning");
										assert.ok(oMessageStripOfSubPanel.getText() === oDefaultBundle.getText("EDITOR_GROUP_WARNINGS"), "Message strip warning text correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.ok(oPanel.getHeaderText() === "no default group", "Group text");
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab bar");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.ok(oPanel.getHeaderText() === "no default group", "Group text");
						var oMessageStripOfPanel = oPanel._messageStrip;
						assert.ok(!oMessageStripOfPanel.getVisible(), "Message strip of group is not visible since group is expanded");
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Sub group expanded by default");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						var oField1 = oSubPanel.getContent()[1].getAggregation("_field");
						var oField2 = oSubPanel.getContent()[3].getAggregation("_field");
						oPanel.setExpanded(false);
						wait().then(function () {
							assert.ok(oMessageStripOfPanel.getVisible(), "Message strip of group is visible since group is collapsed and has error");
							assert.ok(oMessageStripOfPanel.getText() === oDefaultBundle.getText("EDITOR_GROUP_ERRORS"), "Message strip error text correct");
							oPanel.setExpanded(true);
							wait(500).then(function () {
								assert.ok(!oMessageStripOfPanel.getVisible(), "Message strip of group is not visible since group is expanded again");
								oField1.setValue("1234567890");
								oField2.setValue("aa");
								wait(500).then(function () {
									oPanel.setExpanded(false);
									wait().then(function () {
										assert.ok(oMessageStripOfPanel.getVisible(), "Message strip of group is visible since has warning");
										assert.ok(oMessageStripOfPanel.getText() === oDefaultBundle.getText("EDITOR_GROUP_WARNINGS"), "Message strip warning text correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 3, "Default Panel contains 3 items");
						var oSubPanel = oPanel.getContent()[0];
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(!oSubPanel.getExpanded(), "Group collapsed by setting");
						assert.ok(oSubPanel.getHeaderText() === "Sub group", "Sub group text");
						assert.ok(oSubPanel.getContent().length === 2, "Sub group contains 2 items");
						assert.ok(oSubPanel.getContent()[0].getItems()[0].getText() === "stringParameter", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubPanel.getContent()[1].getAggregation("_field").getValue() === "stringParameter Value", "Value of item 2 of Sub Group correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 4, "Default Panel contains 4 items");
						var oSubPanel1 = oPanel.getContent()[0];
						assert.ok(oSubPanel1.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(!oSubPanel1.getExpanded(), "Group collapsed by setting");
						assert.ok(oSubPanel1.getHeaderText() === "Sub group 1", "Sub group 1 text");
						assert.ok(oSubPanel1.getContent().length === 2, "Sub group contains 2 items");
						assert.ok(oSubPanel1.getContent()[0].getItems()[0].getText() === "stringParameter1", "Lable of item 1 of Sub Group 1 correct");
						assert.ok(oSubPanel1.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 1 is a String field");
						assert.ok(oSubPanel1.getContent()[1].getAggregation("_field").getValue() === "stringParameter1 Value", "Value of item 2 of Sub Group 1 correct");
						assert.ok(oPanel.getContent()[1].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						var oSubPanel2 = oPanel.getContent()[2];
						assert.ok(oSubPanel2.isA("sap.m.Panel"), "Item 3 of Default Panel is sub panel");
						assert.ok(oSubPanel2.getExpanded(), "Group expended by default");
						assert.ok(oSubPanel2.getHeaderText() === "Sub group 3", "Sub group 3 text");
						assert.ok(oSubPanel2.getContent().length === 3, "Sub group 3 contains 3 items");
						assert.ok(oSubPanel2.getContent()[0].getItems()[0].getText() === "stringParameter2", "Lable of item 1 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 3 is a String field");
						assert.ok(oSubPanel2.getContent()[1].getAggregation("_field").getValue() === "stringParameter2 Value", "Value of item 3 of Sub Group 3 correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 6, "Default Panel contains 6 items");
						assert.ok(oPanel.getContent()[0].getItems()[0].getText() === "stringParameter", "Lable of item 1 of Group correct");
						assert.ok(oPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Group is a String field");
						assert.ok(oPanel.getContent()[1].getAggregation("_field").getValue() === "stringParameter Value", "Value of item 2 of Group correct");
						var oSubPanel1 = oPanel.getContent()[2];
						assert.ok(oSubPanel1.isA("sap.m.Panel"), "Item 3 of Default Panel is sub panel");
						assert.ok(!oSubPanel1.getExpanded(), "Group collapsed by setting");
						assert.ok(oSubPanel1.getHeaderText() === "Sub group 2", "Sub group 2 text");
						assert.ok(oSubPanel1.getContent().length === 2, "Sub group contains 2 items");
						assert.ok(oSubPanel1.getContent()[0].getItems()[0].getText() === "stringParameter1", "Lable of item 1 of Sub Group 2 correct");
						assert.ok(oSubPanel1.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 2 is a String field");
						assert.ok(oSubPanel1.getContent()[1].getAggregation("_field").getValue() === "stringParameter1 Value", "Value of item 2 of Sub Group 2 correct");
						assert.ok(oPanel.getContent()[3].isA("sap.m.MessageStrip"), "Item 4 of Default Panel is a message strip");
						var oSubPanel2 = oPanel.getContent()[4];
						assert.ok(oSubPanel2.isA("sap.m.Panel"), "Item 5 of Default Panel is sub panel");
						assert.ok(oSubPanel2.getExpanded(), "Group expended by default");
						assert.ok(oSubPanel2.getHeaderText() === "Sub group 3", "Sub group 3 text");
						assert.ok(oSubPanel2.getContent().length === 3, "Sub group 3 contains 3 items");
						assert.ok(oSubPanel2.getContent()[0].getItems()[0].getText() === "stringParameter2", "Lable of item 1 of Sub Group 3 correct");
						assert.ok(oSubPanel2.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group 3 is a String field");
						assert.ok(oSubPanel2.getContent()[1].getAggregation("_field").getValue() === "stringParameter2 Value", "Value of item 3 of Sub Group 3 correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 3, "Default Panel contains 3 items");
						var oSubGroup = oPanel.getContent()[1];
						assert.ok(oSubGroup.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub Tab");
						assert.ok(!oSubGroup.getExpanded(), "Group collapsed by setting");
						assert.ok(oSubGroup.getItems().length === 1, "Icon tab bar contains 1 icon tab filter.");
						assert.ok(oSubGroup.getItems()[0].getText() === "Sub group", "Find 'Sub group' tab filter.");
						assert.ok(oSubGroup.getItems()[0].getContent().length === 2, "Icon tab filter contains 2 elements.");
						assert.ok(oSubGroup.getItems()[0].getContent()[0].getItems()[0].getText() === "stringParameter", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubGroup.getItems()[0].getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubGroup.getItems()[0].getContent()[1].getAggregation("_field").getValue() === "stringParameter Value", "Value of item 2 of Sub Group correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 3, "Default Panel contains 4 items");
						var oSubTab = oPanel.getContent()[1];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 1 of Default Panel is sub tab");
						assert.ok(oSubTab.getExpanded(), "Tab expanded by setting");
						assert.ok(oSubTab.getItems().length === 3, "Icon tab bar contains 1 icon tab filter.");
						var oSubTabFilter = oSubTab.getItems()[0];
						assert.ok(oSubTabFilter.getText() === "Sub group 1", "Find 'Sub group 1' tab filter.");
						assert.ok(oSubTabFilter.getContent().length === 2, "Icon tab filter contains 2 elements.");
						assert.ok(oSubTabFilter.getContent()[0].getItems()[0].getText() === "stringParameter1", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubTabFilter.getContent()[1].getAggregation("_field").getValue() === "stringParameter1 Value", "Value of item 2 of Sub Group correct");
						var oSubTabFilter3 = oSubTab.getItems()[2];
						assert.ok(oSubTabFilter3.getText() === "Sub group 3", "Find 'Sub group 3' tab filter.");
						assert.ok(oSubTabFilter3.getContent().length === 2, "Icon tab filter contains 2 elements.");
						assert.ok(oSubTabFilter3.getContent()[0].getItems()[0].getText() === "stringParameter2", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter3.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubTabFilter3.getContent()[1].getAggregation("_field").getValue() === "stringParameter2 Value", "Value of item 2 of Sub Group correct");
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
						var oPanel = this.oEditor.getAggregation("_formContent")[0];
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
						assert.ok(oDefaultBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS") === oPanel.getHeaderText(), "Default group text");
						assert.ok(oPanel.getExpanded(), "Group expanded by default");
						assert.ok(oPanel.getContent().length === 5, "Default Panel contains 6 items");
						assert.ok(oPanel.getContent()[0].getItems()[0].getText() === "stringParameter", "Lable of item 1 of Group correct");
						assert.ok(oPanel.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Group is a String field");
						assert.ok(oPanel.getContent()[1].getAggregation("_field").getValue() === "stringParameter Value", "Value of item 2 of Group correct");
						var oSubTab = oPanel.getContent()[3];
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 3 of Default Panel is sub panel");
						assert.ok(oSubTab.getExpanded(), "Group collapsed by setting");
						assert.ok(oSubTab.getItems().length === 2, "Icon tab bar contains 1 icon tab filter.");
						var oSubTabFilter = oSubTab.getItems()[0];
						assert.ok(oSubTabFilter.getText() === "Sub group 2", "Find 'Sub group 1' tab filter.");
						assert.ok(oSubTabFilter.getContent().length === 2, "Icon tab filter contains 2 elements.");
						assert.ok(oSubTabFilter.getContent()[0].getItems()[0].getText() === "stringParameter1", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubTabFilter.getContent()[1].getAggregation("_field").getValue() === "stringParameter1 Value", "Value of item 2 of Sub Group correct");
						var oSubTabFilter3 = oSubTab.getItems()[1];
						assert.ok(oSubTabFilter3.getText() === "Sub group 3", "Find 'Sub group 3' tab filter.");
						assert.ok(oSubTabFilter3.getContent().length === 2, "Icon tab filter contains 2 elements.");
						assert.ok(oSubTabFilter3.getContent()[0].getItems()[0].getText() === "stringParameter2", "Lable of item 1 of Sub Group correct");
						assert.ok(oSubTabFilter3.getContent()[1].isA("sap.ui.integration.editor.fields.StringField"), "Item 2 of Sub Group is a String field");
						assert.ok(oSubTabFilter3.getContent()[1].getAggregation("_field").getValue() === "stringParameter2 Value", "Value of item 2 of Sub Group correct");
						assert.ok(oPanel.getContent()[2].isA("sap.m.MessageStrip"), "Item 2 of Default Panel is a message strip");
						resolve();
					}.bind(this));
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
