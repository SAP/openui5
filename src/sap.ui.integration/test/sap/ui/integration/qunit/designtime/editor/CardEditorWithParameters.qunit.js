/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4"
], function (
	merge,
	CardEditor,
	Host,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withParameters/";

	QUnit.module("Create an editor based on card without designtime module", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
			this.oHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
			}
		}
	}, function () {

		QUnit.test("No configuration section (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "noconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": {} } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "emptyconfig.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Empty parameters section (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "emptyparameters.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destination": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "emptydestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destination": {}, "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "emptyparametersdestinations.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					assert.ok(this.oCardEditor.getAggregation("_formContent") === null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "StaticLabel" } } } } } });
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

		QUnit.test("1 string parameter and label (as file)", function (assert) {
			this.oCardEditor.setCard({ manifest: sBaseUrl + "1stringparameterlabel.json" });
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

		QUnit.test("1 string parameter and translatable label (parameter syntax) (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "{{STRINGLABEL}}" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("1 string parameter and translatable label (parameter syntax) (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1translatedstringparameterparam.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and translatable label (i18n binding syntax) (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties", "title": "{{STRINGLABEL}}" }, "sap.card": { "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string", "label": "{i18n>STRINGLABEL}" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "StringLabelTrans", "Label: Has translated text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "integerParameter": { "type": "integer" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.IntegerField"), "Field: Integer Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "numberParameter": { "type": "number" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.NumberField"), "Field: Number Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "dateParameter": { "type": "date" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateField"), "Field: Date Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "datetimeParameter": { "type": "datetime" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.DateTimeField"), "Field: DateTime Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "parameters": { "booleanParameter": { "type": "boolean" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.BooleanField"), "Field: Boolean Field");
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


	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
