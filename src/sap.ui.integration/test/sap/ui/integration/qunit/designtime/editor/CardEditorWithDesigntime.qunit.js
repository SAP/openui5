/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost"
], function (
	merge,
	CardEditor,
	Host,
	sinon,
	ContextHost
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/";

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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1string", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					resolve();
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
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as file)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: sBaseUrl + "1stringparameter.json" });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[0];
					var oField = this.oCardEditor.getAggregation("_formContent")[1];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oLabel.getText() === "stringParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
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
					resolve();
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("1 integer parameter and label (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1integer", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1number", "type": "List", "configuration": { "parameters": { "numberParameter": { "type": "number" } } } } } });
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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1date", "type": "List", "configuration": { "parameters": { "dateParameter": { "type": "date" } } } } } });
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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1datetime", "type": "List", "configuration": { "parameters": { "datetimeParameter": { "type": "datetime" } } } } } });
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
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/1boolean", "type": "List", "configuration": { "parameters": { "booleanParameter": { "type": "boolean" } } } } } });
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

		QUnit.test("Preview with live and abstract (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveAbstract", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");

					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Preview with abstract and live (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewAbstractLive", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");

					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Preview with none(as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewNone", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");

					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with live and own image (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveOwnImage", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with own image and live (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewOwnImageLive", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Preview with live (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLive", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					resolve();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Preview not scaled (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewNoScale", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		// QUnit.test("Switch the theme light to dark and back", function (assert) {
		// 	sap.ui.getCore().applyTheme("sap_fiori_3");
		// 	this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveOwnImage", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
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
		// 	this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "designtime": "designtime/previewLiveOwnImage", "type": "List", "configuration": { "parameters": { "stringParameter": { "type": "string" } } } } } });
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

		QUnit.test("Empty Host Context", function (assert) {
			this.oCardEditor.setCard({ host: "host", manifest: { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oModel = this.oCardEditor.getModel("context");
					assert.ok(oModel !== null, "Card Editor has a context model");
					assert.deepEqual(oModel.getData(), {}, "Card Editor has an empty context model");
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
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
