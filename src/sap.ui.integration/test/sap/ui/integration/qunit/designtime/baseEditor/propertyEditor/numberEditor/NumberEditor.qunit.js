/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel"
], function (
	NumberEditor,
	JSONModel,
	QUnitUtils,
	ResourceBundle,
	ResourceModel
) {
	"use strict";

	QUnit.module("Number Editor: Given an editor config", {
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
			this.oNumberEditor = new NumberEditor();
			this.oNumberEditor.setConfig(this.oPropertyConfig);
			this.oNumberEditor.setValue(42);
			this.oNumberEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			return this.oNumberEditor.ready().then(function () {
				this.oNumberEditorElement = this.oNumberEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oNumberEditor.destroy();
		}
	}, function () {
		QUnit.test("When a NumberEditor is created", function (assert) {
			assert.ok(this.oNumberEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oNumberEditor.getDomRef() && this.oNumberEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oNumberEditor.getDomRef() && this.oNumberEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oNumberEditorElement.getValue(), "42", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oNumberEditor.setValue(41);
			assert.strictEqual(this.oNumberEditorElement.getValue(), "41", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oNumberEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), 43, "Then it is updated correctly");
				fnDone();
			});

			this.oNumberEditorElement.setValue("43");
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
			// Load the i18n model for the value state text on error
			return ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				oI18nModel.setDefaultBindingMode("OneWay");
				this.oNumberEditor.setModel(oI18nModel, "i18n");

				// Test
				this.oNumberEditorElement.setValue("abc");
				QUnitUtils.triggerEvent("input", this.oNumberEditorElement.getDomRef());

				assert.strictEqual(this.oNumberEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oNumberEditor.getValue(), 42, "Then the editor value is not updated");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});