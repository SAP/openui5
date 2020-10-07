/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4"
], function (
	Core,
	JsonEditor,
	BaseEditor,
	EditorQunitUtils,
	QUnitUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function setCodeEditorValue (oCodeEditor, sInput) {
		oCodeEditor.setValue(sInput);
		Core.applyChanges();
	}

	QUnit.module("JSON Data Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test JSON",
				type: "json",
				path: "content"
			};
			this.oValue = [{
				name: "John Foo",
				age: 47
			}, {
				name: "Jane Bar",
				age: 22
			}];
		},
		beforeEach: function () {
			// needed to properly wait for the value help dialog to be initialized / opened
			sandbox.spy(JsonEditor.prototype, "_openJsonEditor");

			var mConfig = {
				context: "/",
				properties: {
					sampleJson: this.oPropertyConfig
				},
				propertyEditors: {
					"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
				}
			};
			var mJson = {
				content: 3.14
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleJson").then(function(aPropertyEditor) {
				this.oJsonEditor = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oJsonEditor.setValue(this.oValue);
				sap.ui.getCore().applyChanges();
				this.oJsonEditorElement = this.oJsonEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a JsonEditor is created", function (assert) {
			assert.ok(this.oJsonEditor.getDomRef() instanceof HTMLElement, "Then the inline editor is rendered correctly (1/3)");
			assert.ok(this.oJsonEditor.getDomRef() && this.oJsonEditor.getDomRef().offsetHeight > 0, "Then the inline editor is rendered correctly (2/3)");
			assert.ok(this.oJsonEditor.getDomRef() && this.oJsonEditor.getDomRef().offsetWidth > 0, "Then the inline editor is rendered correctly (3/3)");
		});

		QUnit.test("When the JsonEditor Dialog is opened", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the editor is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the editor is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the editor is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When the JsonEditor Dialog is re-opened", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					if (this.bOpenedBefore) {
						assert.strictEqual(
							oDialog.getContent()[1].getValue(),
							JSON.stringify(this.oValue, 0, "\t"),
							"Then the changes are discarded"
						);
						delete this.bOpenedBefore;
						fnDone();
					} else {
						this.bOpenedBefore = true;

						EditorQunitUtils.setInputValue(oDialog.getContent()[1], "");

						QUnitUtils.triggerEvent("tap", oDialog.getEndButton().getDomRef());
						QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
					}
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When a value is set", function (assert) {
			var fnDone = assert.async();

			assert.strictEqual(this.oJsonEditorElement.getValue(), JSON.stringify(this.oValue), "Then the inline editor has the correct value");

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.strictEqual(
						oDialog.getContent()[1].getValue(),
						JSON.stringify(this.oValue, 0, "\t"),
						"Then the editor dialog has the correct value"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();
			var oNextValue = [{
				name: "Jane Bar",
				age: 23
			}];

			this.oJsonEditor.setValue(oNextValue);

			assert.strictEqual(
				this.oJsonEditorElement.getValue(),
				JSON.stringify([{
					name: "Jane Bar",
					age: 23
				}]),
				"Then the inline editor value is updated"
			);

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					assert.strictEqual(
						oDialog.getContent()[1].getValue(),
						JSON.stringify(oNextValue, 0, "\t"),
						"Then the editor dialog value is updated"
					);
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When a value is incorrectly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			EditorQunitUtils.setInputValue(this.oJsonEditorElement, "[{\"name\": John}]");

			assert.strictEqual(this.oJsonEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.deepEqual(this.oJsonEditor.getValue(), this.oValue, "Then the editor value is not updated");

			// Edit the error in the dialog
			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[1].getInternalEditorInstance().getSession().on("changeAnnotation", function () {
						assert.ok(oDialog.getContent()[0].getText().length > 0, "Then an error is displayed in the editor dialog");
						oDialog.getContent()[1].getInternalEditorInstance().getSession().removeAllListeners("changeAnnotation");
						fnDone();
					});
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					[{
						name: "John Foo",
						age: 48
					}],
					"Then it is updated correctly"
				);
				assert.strictEqual(this.oJsonEditorElement.getValueState(), "None", "No error is displayed");
				fnDone();
			}.bind(this));
			EditorQunitUtils.setInputValue(this.oJsonEditorElement, JSON.stringify([{
				name: "John Foo",
				age: 48
			}]));
			Core.applyChanges();
		});

		QUnit.test("When a value is incorrectly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					setCodeEditorValue(oDialog.getContent()[1], "{\"msg\": Hello World}");
					assert.strictEqual(oDialog.getBeginButton().getEnabled(), false, "Then the changes cannot be saved");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					setCodeEditorValue(oDialog.getContent()[1], JSON.stringify({
						msg: "Hello World"
					}));
					QUnitUtils.triggerEvent("tap", oDialog.getBeginButton().getDomRef());
				});
			}.bind(this));

			this.oJsonEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("value"), {msg: "Hello World"}, "Then it is updated correctly");
				fnDone();
			});

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});

		QUnit.test("When the 'Beautify' button is pressed", function (assert) {
			var fnDone = assert.async();

			this.oJsonEditorElement.attachValueHelpRequest(function () {
				this.oJsonEditor._openJsonEditor.returnValues[0].then(function (oDialog) {
					setCodeEditorValue(oDialog.getContent()[1], "{\"msg\":\n\n\t\"Hello World\"}");
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

			QUnitUtils.triggerEvent("click", this.oJsonEditorElement.$("vhi"));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});