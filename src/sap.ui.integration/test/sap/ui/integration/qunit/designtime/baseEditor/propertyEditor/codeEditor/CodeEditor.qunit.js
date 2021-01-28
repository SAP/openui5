/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/codeEditor/CodeEditor",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/deepEqual"
], function (
	Core,
	CodeEditor,
	BaseEditor,
	EditorQunitUtils,
	QUnitUtils,
	sinon,
	deepEqual
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function setCodeEditorValue (oCodeEditor, sInput) {
		oCodeEditor.setValue(sInput);
		Core.applyChanges();
	}

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("Code Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Code",
				type: "code",
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
			sandbox.spy(CodeEditor.prototype, "_openCodeEditor");

			var mConfig = {
				context: "/",
				properties: {
					sampleJson: this.oPropertyConfig
				},
				propertyEditors: {
					"code": "sap/ui/integration/designtime/baseEditor/propertyEditor/codeEditor/CodeEditor"
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
				this.oCodeEditor = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oCodeEditor.setValue(this.oValue);
				Core.applyChanges();
				this.oCodeEditorElement = this.oCodeEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a CodeEditor is created", function (assert) {
			assert.ok(this.oCodeEditor.getDomRef() instanceof HTMLElement, "Then the inline editor is rendered correctly (1/3)");
			assert.ok(this.oCodeEditor.getDomRef() && this.oCodeEditor.getDomRef().offsetHeight > 0, "Then the inline editor is rendered correctly (2/3)");
			assert.ok(this.oCodeEditor.getDomRef() && this.oCodeEditor.getDomRef().offsetWidth > 0, "Then the inline editor is rendered correctly (3/3)");
		});

		QUnit.test("When the CodeEditor Dialog is opened", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the editor is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the editor is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the editor is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When the CodeEditor Dialog is re-opened", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					if (this.bOpenedBefore) {
						assert.ok(deepEqual(JSON.parse(this.oCodeEditorElement.getValue()), this.oValue), "Then the changes are discarded");
						delete this.bOpenedBefore;
						fnDone();
					} else {
						this.bOpenedBefore = true;

						setCodeEditorValue(oDialog.getContent()[0], "");

						QUnitUtils.triggerEvent("tap", oDialog.getEndButton().getDomRef());
						QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
					}
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When a value is set", function (assert) {
			var fnDone = assert.async();
			assert.ok(deepEqual(JSON.parse(this.oCodeEditorElement.getValue()), this.oValue), "Then the inline editor has the correct value");

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					assert.ok(deepEqual(JSON.parse(oDialog.getContent()[0].getValue()), this.oValue), "Then the editor dialog has the correct value");
					fnDone();
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();
			var oNextValue = [{
				name: "Jane Bar",
				age: 23
			}];

			this.oCodeEditor.setValue(oNextValue);
			assert.ok(deepEqual(JSON.parse(this.oCodeEditorElement.getValue()), oNextValue), "Then the inline editor value is updated");

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					assert.strictEqual(
						oDialog.getContent()[0].getValue(),
						JSON.stringify(oNextValue, 0, "\t"),
						"Then the editor dialog value is updated"
					);
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When a value is incorrectly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			EditorQunitUtils.setInputValue(this.oCodeEditorElement, "[{\"name\": John}]");

			assert.strictEqual(this.oCodeEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.deepEqual(this.oCodeEditor.getValue(), this.oValue, "Then the editor value is not updated");

			// Edit the error in the dialog
			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					oDialog.getContent()[0].getInternalEditorInstance().getSession().on("changeAnnotation", function () {
						assert.ok(oDialog.getContent()[0].getValue().length > 0, "Then an error is displayed in the editor dialog");
						oDialog.getContent()[0].getInternalEditorInstance().getSession().removeAllListeners("changeAnnotation");
						fnDone();
					});
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the inline editor", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					[{
						name: "John Foo",
						age: 48
					}],
					"Then it is updated correctly"
				);
				assert.strictEqual(this.oCodeEditorElement.getValueState(), "None", "No error is displayed");
				fnDone();
			}.bind(this));
			EditorQunitUtils.setInputValue(this.oCodeEditorElement, JSON.stringify([{
				name: "John Foo",
				age: 48
			}]));
			Core.applyChanges();
		});

		QUnit.test("When a value is incorrectly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					var oCodeEditor = oDialog.getContent()[0];
					setCodeEditorValue(oCodeEditor, "{\"msg\": Hello World}");
					wait().then(function () {
						assert.strictEqual(oDialog.getBeginButton().getEnabled(), false, "Then the changes cannot be saved");
						fnDone();
					});
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When a value is correctly changed in the editor dialog", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					setCodeEditorValue(oDialog.getContent()[0], JSON.stringify({
						msg: "Hello World"
					}));
					wait().then(function () {
						QUnitUtils.triggerEvent("tap", oDialog.getBeginButton().getDomRef());
					});
				});
			}.bind(this));

			this.oCodeEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("value"), {msg: "Hello World"}, "Then it is updated correctly");
				fnDone();
			});

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});

		QUnit.test("When the 'Beautify' button is pressed", function (assert) {
			var fnDone = assert.async();

			this.oCodeEditorElement.attachValueHelpRequest(function () {
				this.oCodeEditor._openCodeEditor.returnValues[0].then(function (oDialog) {
					var oCodeEditor = oDialog.getContent()[0];
					setCodeEditorValue(oCodeEditor, "{\"msg\":\n\n\t\"Hello World\"}");
					QUnitUtils.triggerEvent("tap", oDialog.getCustomHeader().getContentLeft()[0].getDomRef());

					wait().then(function () {
						assert.strictEqual(
							oCodeEditor.getValue(),
							JSON.stringify({
								msg: "Hello World"
							}, 0, "\t"),
							"Then the code is properly beautified"
						);
						fnDone();
					});
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oCodeEditorElement.$("vhi"));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});