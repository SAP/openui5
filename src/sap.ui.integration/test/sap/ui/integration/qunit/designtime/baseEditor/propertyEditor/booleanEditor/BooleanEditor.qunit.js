/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"qunit/designtime/EditorQunitUtils"
], function (
	BaseEditor,
	ResourceBundle,
	ResourceModel,
	EditorQunitUtils
) {
	"use strict";

	QUnit.module("Boolean Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Boolean",
				type: "boolean",
				defaultValue: false,
				path: "content"
			};
		},
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					sampleBoolean: this.oPropertyConfig
				},
				propertyEditors: {
					"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor"
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

			return this.oBaseEditor.getPropertyEditorsByName("sampleBoolean").then(function (aPropertyEditor) {
				this.oBooleanEditor = aPropertyEditor[0];
				this.oBooleanEditor.setValue(true);
				sap.ui.getCore().applyChanges();
				this.oBooleanEditorElement = this.oBooleanEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a BooleanEditor is created", function (assert) {
			assert.ok(this.oBooleanEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oBooleanEditor.getDomRef() && this.oBooleanEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oBooleanEditor.getDomRef() && this.oBooleanEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oBooleanEditorElement.getSelectedItem().getKey(), "true", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oBooleanEditor.setValue(false);
			assert.strictEqual(this.oBooleanEditorElement.getSelectedItem().getKey(), "false", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			// Load i18n for labels
			ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				oI18nModel.setDefaultBindingMode("OneWay");
				this.oBooleanEditor.setModel(oI18nModel, "i18n");

				this.oBooleanEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("value"), false, "Then it is updated correctly");
					fnDone();
				});

				EditorQunitUtils.selectComboBoxValue(this.oBooleanEditorElement, "false");
			}.bind(this));
		});

		QUnit.test("When a binding path is provided in the input field", function (assert) {
			var fnDone = assert.async();

			this.oBooleanEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oBooleanEditorElement, "{someBindingPath}");
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oBooleanEditor.setValue("{= ${url}}");
			assert.strictEqual(this.oBooleanEditorElement.$("inner").val(), "{= ${url}}");
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
				this.oBooleanEditor.setModel(oI18nModel, "i18n");

				// Test
				EditorQunitUtils.setInputValueAndConfirm(this.oBooleanEditorElement, "abc");
				assert.strictEqual(this.oBooleanEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oBooleanEditor.getValue(), true, "Then the editor value is not updated");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});