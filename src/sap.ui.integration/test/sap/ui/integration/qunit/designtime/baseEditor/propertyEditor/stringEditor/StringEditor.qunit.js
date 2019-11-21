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
			this.oContextModel = new JSONModel({
				content: "Hello World."
			});
			this.oContextModel.setDefaultBindingMode("OneWay");

			this.oEditor = new StringEditor();
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
		}
	}, function () {
		QUnit.test("When a StringEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			assert.strictEqual(this.oEditorElement.getValue(), "Hello World.", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the model", function (assert) {
			this.oContextModel.setData({
				content: "FooBar"
			});
			assert.strictEqual(this.oEditorElement.getValue(), "FooBar", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "FooBar", "Then it is updated correctly");
				fnDone();
			});

			this.oEditorElement.setValue("FooBar");
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oEditorElement.setValue("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var fnDone = assert.async();

			// Load the i18n model for the value state text on error
			ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				oI18nModel.setDefaultBindingMode("OneWay");
				this.oEditor.setModel(oI18nModel, "i18n");

				// Test
				this.oEditorElement.setValue("{brokenBindingString");
				QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());

				assert.strictEqual(this.oEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oEditor.getBindingContext().getObject().value, "Hello World.", "Then the model is not updated");

				fnDone();
			}.bind(this));
		});
	});
});