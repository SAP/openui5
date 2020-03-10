/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/format/NumberFormat"
], function (
	BaseEditor,
	QUnitUtils,
	NumberFormat
) {
	"use strict";

	QUnit.module("Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Number",
				type: "number",
				defaultValue: 0,
				path: "content"
			};
		},
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleNumber: this.oPropertyConfig
				},
				propertyEditors: {
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
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

			return this.oBaseEditor.getPropertyEditorsByName("sampleNumber").then(function (aPropertyEditor) {
				this.oNumberEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oNumberEditorElement = this.oNumberEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a NumberEditor is created", function (assert) {
			var oNumberEditorDomRef = this.oNumberEditor.getDomRef();
			assert.ok(oNumberEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oNumberEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oNumberEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oNumberEditorElement.getValue(), NumberFormat.getFloatInstance().format(3.14), "Then the editor value is formatted properly");
		});

		QUnit.test("When a value is changed in the code editor", function (assert) {
			this.oNumberEditor.setValue(41);
			assert.strictEqual(this.oNumberEditorElement.getValue(), "41", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oNumberEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), 42.123, "Then it is updated correctly");
				fnDone();
			});

			this.oNumberEditorElement.setValue("42.123");
			QUnitUtils.triggerEvent("input", this.oNumberEditorElement.getDomRef());
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oNumberEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oNumberEditorElement.setValue("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oNumberEditorElement.getDomRef());
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			this.oNumberEditorElement.setValue("abc");
			QUnitUtils.triggerEvent("input", this.oNumberEditorElement.getDomRef());

			assert.strictEqual(this.oNumberEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.strictEqual(this.oNumberEditor.getValue(), 3.14, "Then the editor value is not updated");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});