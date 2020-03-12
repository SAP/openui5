/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel"
], function (
	StringEditor,
	JSONModel,
	QUnitUtils,
	ResourceBundle,
	ResourceModel
) {
	"use strict";

	QUnit.module("String Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test String",
				type: "string",
				defaultValue: "Test",
				path: "content"
			};
		},
		beforeEach: function (assert) {
			this.oStringEditor = new StringEditor();
			this.oStringEditor.setConfig(this.oPropertyConfig);
			this.oStringEditor.setValue("Hello World.");
			this.oStringEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var fnReady = assert.async();
			this.oStringEditor.ready().then(function () {
				this.oStringEditorElement = this.oStringEditor.getContent();
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oStringEditor.destroy();
		}
	}, function () {
		QUnit.test("When a StringEditor is created", function (assert) {
			assert.ok(this.oStringEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oStringEditor.getDomRef() && this.oStringEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oStringEditor.getDomRef() && this.oStringEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oStringEditorElement.getValue(), "Hello World.", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "FooBar", "Then it is updated correctly");
				fnDone();
			});

			this.oStringEditorElement.setValue("FooBar");
			QUnitUtils.triggerEvent("input", this.oStringEditorElement.getDomRef());
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oStringEditorElement.setValue("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oStringEditorElement.getDomRef());
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			// Load the i18n model for the value state text on error
			return ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				oI18nModel.setDefaultBindingMode("OneWay");
				this.oStringEditor.setModel(oI18nModel, "i18n");

				// Test
				this.oStringEditorElement.setValue("{brokenBindingString");
				QUnitUtils.triggerEvent("input", this.oStringEditorElement.getDomRef());

				assert.strictEqual(this.oStringEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oStringEditor.getValue(), "Hello World.", "Then the editor value is not updated");
			}.bind(this));
		});

		QUnit.test("When a primitive non-string value is set", function (assert) {
			this.oStringEditor.setValue(42);
			assert.strictEqual(this.oStringEditor.getValue(), "42", "Then the value is parsed to a string");
		});

		QUnit.test("When an object value is set", function (assert) {
			this.oStringEditor.setValue({foo: "bar"});
			assert.deepEqual(
				this.oStringEditor.getValue(),
				{
					foo: "bar"
				},
				"Then the value is not parsed"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});