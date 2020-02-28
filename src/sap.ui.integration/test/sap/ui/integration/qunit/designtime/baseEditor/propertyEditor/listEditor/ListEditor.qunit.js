/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4"
], function (
	BaseEditor,
	QUnitUtils,
	KeyCodes,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an editor config", {
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleList: {
						label: "Test List",
						type: "list",
						path: "foo"
					}
				},
				propertyEditors: {
					"list": "sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor"
				}
			};
			var mJson = {
				foo: ["bar", "baz"]
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleList").then(function (aPropertyEditor) {
				this.oListEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oListEditorElement = this.oListEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a ListEditor is created", function (assert) {
			var oListEditorDomRef = this.oListEditor.getDomRef();
			assert.ok(oListEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oListEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oListEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When config and json data were set", function (assert) {
			var aTokenTexts = this.oListEditorElement.getTokens().map(function (oToken) {
				return oToken.getText();
			});
			assert.deepEqual(
				aTokenTexts,
				["bar", "baz"],
				"Then the editor has the correct value"
			);
		});

		QUnit.test("When an item is added in the editor", function (assert) {
			var fnDone = assert.async();

			this.oListEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					["bar", "baz", "foobar"],
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			this.oListEditorElement.setValue("foobar");
			QUnitUtils.triggerEvent("input", this.oListEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oListEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When an item is removed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oListEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					["baz"],
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			var oTokenToDelete = this.oListEditorElement.getTokens()[0];
			QUnitUtils.triggerEvent("click", oTokenToDelete.$("icon")[0]);
		});

		QUnit.test("When a binding path is added in the editor", function (assert) {
			var fnDone = assert.async();

			this.oListEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					["bar", "baz", "{foobarPath}"],
					"Then the editor value is updated correctly"
				);
				fnDone();
			});

			this.oListEditorElement.setValue("{foobarPath}");
			QUnitUtils.triggerEvent("input", this.oListEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oListEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oListEditor.setValue(["{= ${someExpressionBindingString}}"]);
			assert.strictEqual(
				this.oListEditorElement.getTokens()[0].getText(),
				"{= ${someExpressionBindingString}}",
				"Then it is properly added as a token"
			);
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var oSpy = sandbox.spy();
			this.oListEditor.attachValueChange(oSpy);

			this.oListEditorElement.setValue("{brokenBindingString");
			QUnitUtils.triggerEvent("input", this.oListEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oListEditorElement.getDomRef(), KeyCodes.ENTER);

			assert.strictEqual(this.oListEditorElement.getValueState(), "Error", "Then the error is displayed");

			assert.ok(oSpy.notCalled, "Then no value change is triggered");
			var aTokenTexts = this.oListEditorElement.getTokens().map(function (oToken) {
				return oToken.getText();
			});
			assert.deepEqual(
				aTokenTexts,
				["bar", "baz"],
				"Then the editor value is not updated"
			);
		});

		QUnit.test("When a duplicate value is provided", function (assert) {
			var oSpy = sandbox.spy();
			this.oListEditor.attachValueChange(oSpy);

			this.oListEditorElement.setValue("bar");
			QUnitUtils.triggerEvent("input", this.oListEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oListEditorElement.getDomRef(), KeyCodes.ENTER);

			assert.strictEqual(this.oListEditorElement.getValueState(), "Error", "Then the error is displayed");

			assert.ok(oSpy.notCalled, "Then no value change is triggered");
			var aTokenTexts = this.oListEditorElement.getTokens().map(function (oToken) {
				return oToken.getText();
			});
			assert.deepEqual(
				aTokenTexts,
				["bar", "baz"],
				"Then the editor value is not updated"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});