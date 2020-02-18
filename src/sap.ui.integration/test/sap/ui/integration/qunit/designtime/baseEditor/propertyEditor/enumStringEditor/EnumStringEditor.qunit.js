/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/events/KeyCodes"
], function (
	EnumStringEditor,
	JSONModel,
	QUnitUtils,
	ResourceBundle,
	ResourceModel,
	KeyCodes
) {
	"use strict";

	QUnit.module("Enum Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Enum",
				type: "enum",
				defaultValue: "Option A",
				path: "content"
			};
			this.oPropertyConfig["enum"] = [
				"Option A",
				"Option B",
				"Option C"
			];
		},
		beforeEach: function () {
			this.oEnumStringEditor = new EnumStringEditor();
			this.oEnumStringEditor.setConfig(this.oPropertyConfig);
			this.oEnumStringEditor.setValue("Option B");
			this.oEnumStringEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			return this.oEnumStringEditor.ready().then(function () {
				this.oEnumStringEditorElement = this.oEnumStringEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oEnumStringEditor.destroy();
		}
	}, function () {
		QUnit.test("When an EnumStringEditor is created", function (assert) {
			assert.ok(this.oEnumStringEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEnumStringEditor.getDomRef() && this.oEnumStringEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEnumStringEditor.getDomRef() && this.oEnumStringEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oEnumStringEditorElement.getValue(), "Option B", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oEnumStringEditor.setValue("Option C");
			assert.strictEqual(this.oEnumStringEditorElement.getValue(), "Option C", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oEnumStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "Option C", "Then it is updated correctly");
				fnDone();
			});

			this.oEnumStringEditorElement.getDomRef().value = "Option C";
			QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oEnumStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oEnumStringEditorElement.$("inner").val("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.$("inner"));
			QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);
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
				this.oEnumStringEditor.setModel(oI18nModel, "i18n");

				// Test
				this.oEnumStringEditorElement.$("inner").val("Invalid Option");
				QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.$("inner"));
				QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);

				assert.strictEqual(this.oEnumStringEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oEnumStringEditor.getValue(), "Option B", "Then the editor value is not updated");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});