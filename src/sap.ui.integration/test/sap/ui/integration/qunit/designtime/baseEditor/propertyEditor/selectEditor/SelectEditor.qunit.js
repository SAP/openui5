/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils"
], function (
	BaseEditor,
	EditorQunitUtils
) {
	"use strict";

	function _createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign({
			label: "Test Select",
			type: "select",
			defaultValue: "Option A",
			path: "content",
			items: [
				{
					"key":"Option A",
					"description" : "Description for Option A"
				},
				{
					"key":"Option B",
					"title": "Title for Option B",
					"description" : "Description for Option B"
				},
				{
					"key":"Option C",
					"title": "Title for Option C"
				}
			]
		}, mConfigOptions);

		return {
			context: "/",
			properties: {
				sampleSelect: mPropertyConfig
			},
			propertyEditors: {
				"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
			}
		};
	}

	QUnit.module("Given an editor config", {
		beforeEach: function () {
			var mConfig = _createBaseEditorConfig();
			var mJson = {
				content: "Option B"
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleSelect").then(function (aPropertyEditor) {
				this.oSelectEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oSelectEditorElement = this.oSelectEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When an SelectEditor is created", function (assert) {
			var oSelectEditorDomRef = this.oSelectEditor.getDomRef();
			assert.ok(oSelectEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oSelectEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oSelectEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oSelectEditorElement.getValue(), "Title for Option B", "Then the editor has the correct value");
			assert.strictEqual(this.oSelectEditor.getValue(), "Option B", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oSelectEditor.setValue("Option C");
			assert.strictEqual(this.oSelectEditorElement.getValue(), "Title for Option C", "Then the editor value is updated");
			assert.strictEqual(this.oSelectEditor.getValue(), "Option C", "Then the editor value is updated");
		});

		QUnit.test("When description is defined", function (assert) {
			this.oSelectEditor.setValue("Option B");
			var sText = this.oSelectEditorElement.getSelectedItem().getAdditionalText();
			assert.strictEqual(sText, "Description for Option B", "Then the correct Text is set");
		});

		QUnit.test("When description is not defined", function (assert) {
			this.oSelectEditor.setValue("Option C");
			var sText = this.oSelectEditorElement.getSelectedItem().getAdditionalText();
			assert.strictEqual(sText, "", "Then no text is set");
		});

		QUnit.test("When title is defined", function (assert) {
			this.oSelectEditor.setValue("Option C");
			var sTitle = this.oSelectEditorElement.getSelectedItem().getText();
			var sKey = this.oSelectEditorElement.getSelectedItem().getKey();
			assert.notStrictEqual(sTitle, sKey, "Then the Title is taken");
		});

		QUnit.test("When title is not defined", function (assert) {
			this.oSelectEditor.setValue("Option A");
			var sTitle = this.oSelectEditorElement.getSelectedItem().getText();
			var sKey = this.oSelectEditorElement.getSelectedItem().getKey();
			assert.strictEqual(sTitle, sKey, "Then the Key is taken");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oSelectEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "Option C", "Then it is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oSelectEditorElement, "Title for Option C");
		});

		QUnit.test("When a binding path is provided in the input field", function (assert) {
			var fnDone = assert.async();

			this.oSelectEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oSelectEditorElement, "{someBindingPath}");
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oSelectEditor.setValue("{= ${url}}");
			assert.strictEqual(this.oSelectEditorElement.$("inner").val(), "{= ${url}}", "Then the proper value is shown");
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			EditorQunitUtils.setInputValueAndConfirm(this.oSelectEditorElement, "Invalid Option");

			assert.strictEqual(this.oSelectEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.strictEqual(this.oSelectEditor.getValue(), "Option B", "Then the editor value is not updated");
		});
	});

	QUnit.module("Configuration options", {
		beforeEach: function () {
			var mJson = {
				content: "Option B"
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
		QUnit.test("When custom values are allowed", function (assert) {
			var fnDone = assert.async();

			var mConfig = _createBaseEditorConfig({
				allowCustomValues: true
			});
			this.oBaseEditor.setConfig(mConfig);

			this.oBaseEditor.getPropertyEditorsByName("sampleSelect").then(function (aPropertyEditor) {
				var oSelectEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oSelectEditorElement = oSelectEditor.getContent();

				oSelectEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("value"), "Option D", "Then a custom value can be set in the editor");
					fnDone();
				});

				EditorQunitUtils.setInputValueAndConfirm(oSelectEditorElement, "Option D");
			});
		});

		QUnit.test("When binding strings are forbidden", function (assert) {
			var mConfig = _createBaseEditorConfig({
				allowBindings: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleSelect").then(function (aPropertyEditor) {
				var oSelectEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oSelectEditorElement = oSelectEditor.getContent();

				EditorQunitUtils.setInputValueAndConfirm(oSelectEditorElement, "{validBindingString}");

				assert.strictEqual(oSelectEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(oSelectEditor.getValue(), "Option B", "Then the editor value is not updated");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});