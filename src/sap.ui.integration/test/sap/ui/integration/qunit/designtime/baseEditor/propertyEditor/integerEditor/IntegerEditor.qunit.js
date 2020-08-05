/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/core/format/NumberFormat"
], function (
	BaseEditor,
	EditorQunitUtils,
	NumberFormat
) {
	"use strict";

	QUnit.module("Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				label: "Test Integer",
				type: "integer",
				path: "content"
			};
		},
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleInteger: this.oPropertyConfig
				},
				propertyEditors: {
					"integer": "sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor"
				}
			};
			var mJson = {
				content: 42
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleInteger").then(function (aPropertyEditor) {
				this.oIntegerEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oIntegerEditorElement = this.oIntegerEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When an IntegerEditor is created", function (assert) {
			var oIntegerEditorDomRef = this.oIntegerEditor.getDomRef();
			assert.ok(oIntegerEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oIntegerEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oIntegerEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oIntegerEditorElement.getValue(), NumberFormat.getIntegerInstance().format(42), "Then the editor value is formatted properly");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oIntegerEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), 43, "Then it is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValue(this.oIntegerEditorElement, "43");
		});

		QUnit.test("When a float value is provided", function (assert) {
			EditorQunitUtils.setInputValue(this.oIntegerEditorElement, NumberFormat.getFloatInstance().format(3.14).toString());

			assert.strictEqual(this.oIntegerEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.strictEqual(this.oIntegerEditor.getValue(), 42, "Then the editor value is not updated");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});