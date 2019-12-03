/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4"
], function (
	JsonEditor,
	JSONModel,
	QUnitUtils,
	sinon
) {
	"use strict";

	var oSandbox = sinon.createSandbox();

	QUnit.module("JSON Data Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test JSON",
				type: "json",
				path: "content"
			};
			this.oOriginalModelContent = {
				content: [{
					name: "John Foo",
					age: 47
				}, {
					name: "Jane Bar",
					age: 22
				}]
			};
		},
		beforeEach: function (assert) {
			this.oContextModel = new JSONModel(this.oOriginalModelContent);
			this.oContextModel.setDefaultBindingMode("OneWay");

			oSandbox.spy(JsonEditor.prototype, "_openJsonEditor");
			this.oEditor = new JsonEditor();
			this.oEditor.setModel(this.oContextModel, "_context");
			this.oEditor.setConfig(this.oPropertyConfig);
			this.oEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var fnReady = assert.async();
			this.oEditor.attachReady(function () {
				this.oEditorElement = this.oEditor.getContent();
				fnReady();
			}, this);
		},
		afterEach: function () {
			this.oContextModel.destroy();
			this.oEditor.destroy();
			oSandbox.restore();
		}
	}, function () {
		QUnit.test("When a JsonEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then the inline editor is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then the inline editor is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then the inline editor is rendered correctly (3/3)");
		});

		QUnit.test("When the JsonEditor Dialog is opened", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the editor is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the editor is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the editor is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When the JsonEditor Dialog is re-opened", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					if (this.bOpenedBefore) {
						assert.strictEqual(
							oDialog.getContent()[1].getValue(),
							JSON.stringify(this.oOriginalModelContent.content, 0, "\t"),
							"Then the changes are discarded"
						);
						delete this.bOpenedBefore;
						fnDone();
					} else {
						this.bOpenedBefore = true;
						oDialog.getContent()[1].setValue("");
						QUnitUtils.triggerEvent("input", oDialog.getContent()[1].getDomRef());
						QUnitUtils.triggerEvent("tap", oDialog.getEndButton().getDomRef());
						QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
					}
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a model is set", function (assert) {
			var fnDone = assert.async();

			assert.strictEqual(this.oEditorElement.getValue(), JSON.stringify(this.oOriginalModelContent.content), "Then the inline editor has the correct value");

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.strictEqual(
						oDialog.getContent()[1].getValue(),
						JSON.stringify(this.oOriginalModelContent.content, 0, "\t"),
						"Then the editor dialog has the correct value"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a value is changed in the model", function (assert) {
			var fnDone = assert.async();

			this.oContextModel.setData({
				content: [{
					name: "Jane Bar",
					age: 23
				}]
			});
			assert.strictEqual(
				this.oEditorElement.getValue(),
				JSON.stringify([{
					name: "Jane Bar",
					age: 23
				}]),
				"Then the inline editor value is updated"
			);

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.strictEqual(
						oDialog.getContent()[1].getValue(),
						JSON.stringify([{
							name: "Jane Bar",
							age: 23
						}], 0, "\t"),
						"Then the editor dialog value is updated"
					);
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a value is incorrectly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.setValue("[{\"name\": John}]");
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());

			assert.strictEqual(this.oEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.deepEqual(this.oEditor.getBindingContext().getObject().value, this.oOriginalModelContent.content, "Then the model is not updated");

			// Edit the error in the dialog

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[1]._getEditorInstance().getSession().on("changeAnnotation", function () {
						assert.ok(oDialog.getContent()[0].getText().length > 0, "Then an error is displayed in the editor dialog");
						oDialog.getContent()[1]._getEditorInstance().getSession().removeAllListeners("changeAnnotation");
						fnDone();
					});
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					[{
						name: "John Foo",
						age: 48
					}],
					"Then it is updated correctly"
				);
				assert.strictEqual(this.oEditorElement.getValueState(), "None", "No error is displayed");
				fnDone();
			}.bind(this));
			this.oEditorElement.setValue(JSON.stringify([{
				name: "John Foo",
				age: 48
			}]));
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());
		});

		QUnit.test("When a value is incorrectly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[1].setValue("{\"msg\": Hello World}");
					QUnitUtils.triggerEvent("input", oDialog.getContent()[1].getDomRef());

					assert.strictEqual(oDialog.getBeginButton().getEnabled(), false, "Then the changes cannot be saved");

					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[1].setValue(JSON.stringify({
						msg: "Hello World"
					}));
					QUnitUtils.triggerEvent("input", oDialog.getContent()[1].getDomRef());
					QUnitUtils.triggerEvent("tap", oDialog.getBeginButton().getDomRef());
				});
			}.bind(this));

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("value"), {msg: "Hello World"}, "Then it is updated correctly");
				fnDone();
			});

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When the 'Beautify' button is pressed", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[1].setValue("{\"msg\":\n\n\t\"Hello World\"}");
					QUnitUtils.triggerEvent("input", oDialog.getContent()[1].getDomRef());
					QUnitUtils.triggerEvent("tap", oDialog.getCustomHeader().getContentLeft()[0].getDomRef());

					assert.strictEqual(
						oDialog.getContent()[1].getValue(),
						JSON.stringify({
							msg: "Hello World"
						}, 0, "\t"),
						"Then the code is properly beautified"
					);
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});
	});
});