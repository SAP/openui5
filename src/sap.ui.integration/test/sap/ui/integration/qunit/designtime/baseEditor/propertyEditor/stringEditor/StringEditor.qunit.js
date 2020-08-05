/* global QUnit */

sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/integration/designtime/baseEditor/BaseEditor"
], function (
	ResourceBundle,
	ResourceModel,
	EditorQunitUtils,
	BaseEditor
) {
	"use strict";

	function createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign(
			{
				label: "Test String",
				type: "string",
				path: "content",
				defaultValue: "Test",
				placeholder: "Placeholder"
			},
			mConfigOptions
		);

		return {
			context: "/",
			properties: {
				sampleString: mPropertyConfig
			},
			propertyEditors: {
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
			}
		};
	}

	QUnit.module("String Editor: Given an editor config", {
		beforeEach: function() {
			var mJson = {
				content: "Hello World."
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson,
				config: createBaseEditorConfig()
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleString").then(function (aPropertyEditors) {
				this.oStringEditor = aPropertyEditors[0];
				sap.ui.getCore().applyChanges();
				this.oStringEditorElement = this.oStringEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
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

		QUnit.test("When a placeholder is configured", function (assert) {
			assert.strictEqual(
				this.oStringEditorElement.getPlaceholder(),
				"Placeholder",
				"Then the placeholder is displayed in the editor"
			);
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "FooBar", "Then it is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValue(this.oStringEditorElement, "FooBar");
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValue(this.oStringEditorElement, "{someBindingPath}");
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
				EditorQunitUtils.setInputValue(this.oStringEditorElement, "{brokenBindingString");
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

	QUnit.module("Custom Configuration", {
		beforeEach: function () {
			var mJson = {
				content: "Sample string"
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When binding strings are forbidden", function (assert) {
			var mConfig = createBaseEditorConfig({
				allowBindings: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleString").then(function (aPropertyEditors) {
				var oStringEditor = aPropertyEditors[0];
				sap.ui.getCore().applyChanges();
				var oStringEditorElement = oStringEditor.getContent();

				EditorQunitUtils.setInputValue(oStringEditorElement, "{validBindingString}");

				assert.strictEqual(oStringEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(oStringEditor.getValue(), "Sample string", "Then the editor value is not updated");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});