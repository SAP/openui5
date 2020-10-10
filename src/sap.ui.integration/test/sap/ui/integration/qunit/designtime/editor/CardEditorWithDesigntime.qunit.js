/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card"
], function (
	merge,
	CardEditor,
	Host,
	sinon,
	ContextHost,
	Core,
	Card
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/";
	document.body.className = document.body.className + " sapUiSizeCompact ";
	QUnit.module("Create an editor based on card with designtime module", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "noconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": {} } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyparameters.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptydestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {}, "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "emptyparametersdestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1string", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameterDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter with values and no label (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringwithvalues", "type": "List", "configuration": { "parameters": { "stringParameterWithValues": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameterWithValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Select"), "Field: Editor is Select");
					assert.ok(oField.getAggregation("_field").getItems().length === 3, "Field: Select items lenght is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter with request values from json file", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					setTimeout(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
						var oField = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringParameterWithValues", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.Select"), "Field: Editor is Select");
						assert.ok(oField.getAggregation("_field").getItems().length === 4, "Field: Select items lenght is OK");
						resolve();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with values (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/1stringarray",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringArrayParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
					assert.ok(oField.getAggregation("_field").getItems().length === 3, "Field: MultiComboBox items lenght is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with no values (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringArrayParameterNoValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.ok(oField.getAggregation("_field").getValue() === "key1", "Field: Select items lenght is OK");
					oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringArrayParameterNoValuesNotEditable", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Text"), "Field: Editor is Text");
					assert.ok(oField.getAggregation("_field").getText() === "key1", "Field: Select items lenght is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with request values from json file", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/1stringArrayWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					setTimeout(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
						var oField = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.ok(oLabel.getText() === "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.ok(oField.getAggregation("_field").getItems().length === 4, "Field: MultiComboBox items lenght is OK");
						resolve();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StaticLabelDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameter.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameterDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameterlabel.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StaticLabelDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringLabelTransDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1translatedstring.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "StringLabelTransDefaultValue", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("1 integer parameter and no label no default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1integer", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value and Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and no label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1integerWithDefaultValue", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "1", "Field: Value 1 from Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1integerlabel", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value and Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1integerlabelWithDefaultValue", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.IntegerField"), "Field: Integer Field");
					assert.ok(oField.getAggregation("_field").getValue() === "1", "Field: Value 1 from Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label with no default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1number", "type": "List", "configuration": { "parameters": { "numberParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.NumberField"), "Field: Number Field");
					assert.ok(oField.getAggregation("_field").getValue() === "0", "Field: Value 0 since No Value and Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1numberWithDefaultValue", "type": "List", "configuration": { "parameters": { "numberParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.NumberField"), "Field: Number Field");
					assert.ok(oField.getAggregation("_field").getValue() === "2", "Field: Value 2 from Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label with no default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1date", "type": "List", "configuration": { "parameters": { "dateParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateField"), "Field: Date Field");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: No Default Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setDateValue(new Date());
					oField.getAggregation("_field").fireChange({ valid: true });
					assert.ok(oField.getAggregation("_field").getBinding("dateValue").getRawValue() === oField.getAggregation("_field").getValue(), "Field: Date Field binding raw value '" + oField.getAggregation("_field").getValue() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.ok(oField.getAggregation("_field").getBinding("dateValue").getRawValue() === "", "Field: Date Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1dateWithDefaultValue", "type": "List", "configuration": { "parameters": { "dateParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateField"), "Field: Date Field");
					assert.ok(oField.getAggregation("_field").getValue() === "2020-09-02", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label with no default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1datetime", "type": "List", "configuration": { "parameters": { "datetimeParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.ok(oField.getAggregation("_field").getValue() === "", "Field: No Default Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setDateValue(new Date());
					oField.getAggregation("_field").fireChange({ valid: true });
					assert.ok(oField.getAggregation("_field").getBinding("dateValue").getRawValue() === oField.getAggregation("_field").getDateValue().toISOString(), "Field: DateTime Field binding raw value '" + oField.getAggregation("_field").getDateValue().toISOString() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.ok(oField.getAggregation("_field").getBinding("dateValue").getRawValue() === "", "Field: DateTime Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("1 datetime parameter and label with default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1datetimeWithDefaultValue", "type": "List", "configuration": { "parameters": { "datetimeParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateTimeField"), "Field: DateTime Field");
					var sDatetimeValueUTC = new Date(oField.getAggregation("_field").getValue()).toISOString();
					assert.ok(sDatetimeValueUTC === "2020-09-02T11:21:51.000Z", "Field: Default Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("1 boolean parameter and label with no default value (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1boolean", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === false, "Field: No default value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label with default value true (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1booleanWithDefaultValueTrue", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === true, "Field: default value TRUE");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label with default value false (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1booleanWithDefaultValueFalse", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === false, "Field: default value FALSE");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 destination (as json)", function (assert) {
			this.oCardEditor.setCard({ host: "host", manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle = this.oCardEditor.getAggregation("_formContent")[0];
					var oLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oTitle.isA("sap.m.Title"), "Title: Form content contains a Title");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in admin mode", function (assert) {
			this.oCardEditor.setMode("admin");
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} }, "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					var oTitle = this.oCardEditor.getAggregation("_formContent")[2];
					var oLabel1 = this.oCardEditor.getAggregation("_formContent")[3];
					var oField1 = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oTitle.isA("sap.m.Title"), "Title: Form content contains a Title");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel1.getText() === "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField1.isA("sap.ui.integration.designtime.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in content mode", function (assert) {
			this.oCardEditor.setMode("content");
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Start the editor in translation mode", function (assert) {
			this.oCardEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oCardEditor.setLanguage("badlanguage");

			this.oCardEditor.setLanguage("fr");

			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");

					var oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					var oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");

					oLabel = this.oCardEditor.getAggregation("_formContent")[4];
					oField = this.oCardEditor.getAggregation("_formContent")[5];

					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "", "Label: Has no label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with live and abstract (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with abstract and live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewAbstractLive",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with none(as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewNone",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					setTimeout(function () {
						var cardPreview = this.oCardEditor.getAggregation("_preview");
						var card = cardPreview._getCardPreview();
						assert.ok(card === null, "Preview mode card is OK");
						resolve();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with live and own image (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveOwnImage",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with own image and live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewOwnImageLive",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var image = card.getAggregation("items")[0];
							assert.ok(image.getSrc().endsWith("./img/preview.png"), "Preview mode image: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewLive",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef() === null, "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with abstract (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
					},
					"sap.card": {
						"designtime": "designtime/previewAbstract",
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef() === null, "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview not scaled (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewNoScale", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							assert.ok(card.mCustomStyleClassMap.sapUiIntegrationDTPreviewNoScale, "Preview mode no scale: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.ok(modeToggleButton.getIcon() === "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.ok(modeToggleButton.getTooltip() === "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		// QUnit.test("Switch the theme light to dark and back", function (assert) {
		// 	sap.ui.getCore().applyTheme("sap_fiori_3");
		// 	this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveOwnImage", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
		// 	return new Promise(function (resolve, reject) {
		// 		this.oCardEditor.attachReady(function () {
		// 			assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
		// 			sap.ui.getCore().applyTheme("sap_fiori_3_dark");
		// 			sap.ui.getCore().attachThemeChanged(function () {
		// 				sap.ui.getCore().attachThemeChanged(function () {
		// 					resolve();
		// 				});
		// 				sap.ui.getCore().applyTheme("sap_fiori_3");
		// 			});
		// 		}.bind(this));
		// 	}.bind(this));
		// });

		// QUnit.test("Switch the theme dark to light and back", function (assert) {
		// 	sap.ui.getCore().applyTheme("sap_fiori_3_dark");
		// 	this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveOwnImage", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
		// 	return new Promise(function (resolve, reject) {
		// 		this.oCardEditor.attachReady(function () {
		// 			assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
		// 			sap.ui.getCore().applyTheme("sap_fiori_3");
		// 			sap.ui.getCore().attachThemeChanged(function () {
		// 				sap.ui.getCore().attachThemeChanged(function () {
		// 					sap.ui.getCore().applyTheme("sap_fiori_3");
		// 					resolve();
		// 				});
		// 				sap.ui.getCore().applyTheme("sap_fiori_3_dark");
		// 			});
		// 		}.bind(this));
		// 	}.bind(this));
		// });
		var oDefaultContextModel = {
			"card.internal": {
				"currentLanguage": {
					"customize": [
						"languageFormatters"
					],
					"description": "Current Language",
					"label": "Current Language",
					"placeholder": "Current Language",
					"tags": [
						"technical"
					],
					"type": "string",
					"value": "{{parameters.LOCALE}}"
				},
				"label": "Other Values",
				"nowIso": {
					"customize": [
						"dateFormatters"
					],
					"description": "The current date and time can be used for filters or strings",
					"label": "Now, date and time",
					"placeholder": "Now, date and time",
					"tags": [],
					"type": "string",
					"value": "{{parameters.NOW_ISO}}"
				},
				"todayIso": {
					"customize": [
						"format.dataTime"
					],
					"description": "The current date can be used for filters or strings.",
					"label": "Current date",
					"placeholder": "Current date",
					"tags": [],
					"type": "string",
					"value": "{{parameters.TODAY_ISO}}"
				}
			},
			"empty": {
				"description": "Select a dynamic value from the list",
				"label": "None",
				"placeholder": "",
				"type": "string",
				"value": ""
			}
		};
		QUnit.test("Empty Host Context", function (assert) {
			this.oCardEditor.setCard({ host: "host", manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oModel = this.oCardEditor.getModel("context");
					assert.ok(oModel !== null, "Card Editor has a context model");
					assert.deepEqual(oModel.getData(), oDefaultContextModel, "Card Editor has a default context model");
					assert.ok(oModel.getProperty("/sap.workzone/currentUser/id") === undefined, "Card Editor context /sap.workzone/currentUser/id is undefned");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Context Host checks to access context data async", function (assert) {
			this.oCardEditor.setCard({ host: "contexthost", manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oModel = this.oCardEditor.getModel("context");
					assert.ok(oModel !== null, "Card Editor has a context model");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/label"), "Id of the Work Zone user", "Card Editor host context contains the user id label 'Id of the Work Zone'");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/placeholder"), "Work Zone user id", "Card Editor host context contains the user id placeholder 'Work Zone user id'");
					var oBinding = oModel.bindProperty("/sap.workzone/currentUser/id/value");
					oBinding.attachChange(function () {
						assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), "MyCurrentUserId", "Card Editor host context user id value is 'MyCurrentUserId'");
						resolve();
					});
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), undefined, "Card Editor host context user id value is undefined");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Create a CardEditor with an existing Card instance", function (assert) {
			var oCard1 = new Card({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			var oCard2 = new Card("card2", { baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			this.oCardEditor.setCard(oCard1);
			this.oCardEditor.setCard(oCard1);
			this.oCardEditor.setCard(oCard2);
			this.oCardEditor.setCard("card2");
			assert.ok(this.oCardEditor.getCard() === "card2", "Card is set correctly");

			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check Description", function (assert) {
			var oCard = new Card({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			this.oCardEditor.setCard(oCard);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					oLabel.getDependents()[0].onmouseover();
					var oDescriptionText = this.oCardEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.ok(oDescriptionText.getText() === "Description", "Text: Description OK");
					oLabel.getDependents()[0].onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Change Check from lays: Admin, Content and Translate", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);

		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin", function (assert) {
			this.oCardEditor.setMode("content");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
			};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin and Content", function (assert) {
			this.oCardEditor.setMode("content");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Content Mode: change from Admin, Content and Translate", function (assert) {
			this.oCardEditor.setMode("content");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Translation Mode: change from Admin", function (assert) {
			this.oCardEditor.setMode("translation");
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
			this.oCardEditor.setLanguage("badlanguage");

			this.oCardEditor.setLanguage("fr");

			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");

					var oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					var oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");

					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Admin", "Field: Value from Admin change");

					oLabel = this.oCardEditor.getAggregation("_formContent")[4];
					oField = this.oCardEditor.getAggregation("_formContent")[5];

					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "", "Label: Has no label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Translation Mode: change from Admin and Content", function (assert) {
			this.oCardEditor.setMode("translation");
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
			this.oCardEditor.setLanguage("badlanguage");

			this.oCardEditor.setLanguage("fr");

			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");

					var oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					var oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

					oLabel = this.oCardEditor.getAggregation("_formContent")[4];
					oField = this.oCardEditor.getAggregation("_formContent")[5];

					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "", "Label: Has no label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in Translation Mode: change from Admin, Content and Translate", function (assert) {
			this.oCardEditor.setMode("translation");
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
			this.oCardEditor.setLanguage("badlanguage");

			this.oCardEditor.setLanguage("fr");

			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				manifestChanges: [adminchanges, pagechanges, translationchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");

					var oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					var oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getText() === "stringParameter Value Content", "Field: Value from Content change");

					oLabel = this.oCardEditor.getAggregation("_formContent")[4];
					oField = this.oCardEditor.getAggregation("_formContent")[5];

					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "", "Label: Has no label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in All Mode: change from Admin", function (assert) {
			this.oCardEditor.setMode("all");
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Admin",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
			};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Admin", "Field: Value from Admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in All Mode: change from Admin and Content", function (assert) {
			this.oCardEditor.setMode("all");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Content", "Field: Value from Content change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check changes in All Mode: change from Admin, Content and Translate", function (assert) {
			this.oCardEditor.setMode("all");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translate: translate the nomal value", function (assert) {
			this.oCardEditor.setMode("all");
			var adminchanges = {
			};
			var pagechanges = {
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getValue() === "stringParameter Value Translate", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translate: translate the translated value", function (assert) {
			this.oCardEditor.setMode("all");
			var adminchanges = {
			};
			var pagechanges = {
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "stringParameter Value Translate",
				":layer": 10,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getVisible(), "Field: Visible not changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in Content Mode: change visible from Admin", function (assert) {
			this.oCardEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oFormContent = this.oCardEditor.getAggregation("_formContent");
					assert.ok(oFormContent === null, "Visible: visible change from Admin");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in Translation Mode: change visible from Admin", function (assert) {
			this.oCardEditor.setMode("translation");
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
			this.oCardEditor.setLanguage("badlanguage");
			this.oCardEditor.setLanguage("fr");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");
					assert.ok(this.oCardEditor.getAggregation("_formContent").length === 2, "Field: No field since change from Admin");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible changes in All Mode: change visible from Admin", function (assert) {
			this.oCardEditor.setMode("all");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oFormContent = this.oCardEditor.getAggregation("_formContent");
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable not changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in Content Mode: change editable from Admin", function (assert) {
			this.oCardEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Editable changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in Translation Mode: change editable from Admin", function (assert) {
			this.oCardEditor.setMode("translation");
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
			this.oCardEditor.setLanguage("badlanguage");
			this.oCardEditor.setLanguage("fr");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oTitle1 = this.oCardEditor.getAggregation("_formContent")[0];
					var oTitle2 = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oTitle1.isA("sap.m.Title"), "Title1: Form content contains a Group Title");
					assert.ok(oTitle1.getText() === this.oCardEditor._oResourceBundle.getText("CARDEDITOR_ORIGINALLANG"), "Title2: has the correct text CARDEDITOR_ORIGINALLANG");
					assert.ok(oTitle2.isA("sap.m.Title"), "Title2: Form content contains a Group Title");
					assert.ok(oTitle2.getText() === CardEditor._languages[this.oCardEditor.getLanguage()], "Title2: has the correct text (language)");

					var oLabel = this.oCardEditor.getAggregation("_formContent")[2];
					var oField = this.oCardEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");

					oLabel = this.oCardEditor.getAggregation("_formContent")[4];
					oField = this.oCardEditor.getAggregation("_formContent")[5];

					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "", "Label: Has no label text");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Input not changed by the Admin change for editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check editable changes in All Mode: change editable from Admin", function (assert) {
			this.oCardEditor.setMode("all");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			var contentchanges = {};
			var translationchanges = {};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Editable changed from admin change");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Check settings UI for Admin", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
			this.oCardEditor.setMode("admin");
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getBeginButton().firePress();
						assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("With a dynamic value, remove and cancel", function (assert) {
			this.oCardEditor.setMode("admin");
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[0];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getEndButton().firePress();
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].firePress();
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was canceled");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Change visible in settings panel", function (assert) {
			this.oCardEditor.setMode("admin");
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					var oCardEditor = this.oCardEditor;
					assert.ok(oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = oCardEditor.getAggregation("_formContent")[0];
					var oField = oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						testInterface.oSettingsPanel.getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is not enabled after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting visible to false");
						testInterface.oPopover.getBeginButton().firePress();
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
						var oCurrentSettings = oCardEditor.getCurrentSettings();
						var sContext = oField.getBindingContext("currentSettings");
						var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
						assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Change editing enable in settings panel", function (assert) {
			this.oCardEditor.setMode("admin");
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample"
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
				this.oCardEditor.attachReady(function () {
					var oCardEditor = this.oCardEditor;
					assert.ok(oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = oCardEditor.getAggregation("_formContent")[0];
					var oField = oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						testInterface.oSettingsPanel.getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting editing enable to false");
						testInterface.oPopover.getBeginButton().firePress();
						assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
						var oCurrentSettings = oCardEditor.getCurrentSettings();
						var sContext = oField.getBindingContext("currentSettings");
						var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
						assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
						resolve();
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
