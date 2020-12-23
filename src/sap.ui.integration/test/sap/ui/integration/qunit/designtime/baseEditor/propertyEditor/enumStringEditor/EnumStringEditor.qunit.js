/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils"
], function (
	BaseEditor,
	EditorQunitUtils
) {
	"use strict";
	var isIE = false;
	if (navigator.userAgent.toLowerCase().indexOf("trident") > 0) {
		isIE = true;
	}
	function _createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign({
			label: "Test Enum",
			type: "enum",
			defaultValue: "Option A",
			path: "content"
		}, mConfigOptions);

		mPropertyConfig["enum"] = [
			"Option A",
			"Option B",
			"Option C"
		];

		return {
			context: "/",
			properties: {
				sampleEnum: mPropertyConfig
			},
			propertyEditors: {
				"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor",
				"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
				"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
			}
		};
	}

	QUnit.module("Given an editor config", {
		beforeEach: function (assert) {
			var fnReady = assert.async();
			var mConfig = _createBaseEditorConfig();
			var mJson = {
				content: "Option B"
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.getPropertyEditorsByName("sampleEnum").then(function (aPropertyEditor) {
				this.oEnumStringEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oEnumStringEditorElement = this.oEnumStringEditor.getContent();
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		if (!isIE) {
			QUnit.test("When an EnumStringEditor is created", function (assert) {
				var oEnumStringEditorDomRef = this.oEnumStringEditor.getDomRef();
				assert.ok(oEnumStringEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
				assert.ok(oEnumStringEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
				assert.ok(oEnumStringEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
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

				EditorQunitUtils.setInputValueAndConfirm(this.oEnumStringEditorElement, "Option C");
			});

			QUnit.test("When a binding path is provided in the input field", function (assert) {
				var fnDone = assert.async();

				this.oEnumStringEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
					fnDone();
				});

				EditorQunitUtils.setInputValueAndConfirm(this.oEnumStringEditorElement, "{someBindingPath}");
			});

			QUnit.test("When a binding path is provided as the editor value", function (assert) {
				this.oEnumStringEditor.setValue("{= ${url}}");
				assert.strictEqual(this.oEnumStringEditorElement.$("inner").val(), "{= ${url}}");
			});

			QUnit.test("When an invalid input is provided", function (assert) {
				EditorQunitUtils.setInputValueAndConfirm(this.oEnumStringEditorElement, "Invalid Option");

				assert.strictEqual(this.oEnumStringEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oEnumStringEditor.getValue(), "Option B", "Then the editor value is not updated");
			});
		}
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
		if (!isIE) {
			QUnit.test("When custom values are allowed", function (assert) {
				var fnDone = assert.async();

				var mConfig = _createBaseEditorConfig({
					allowCustomValues: true
				});
				this.oBaseEditor.setConfig(mConfig);

				this.oBaseEditor.getPropertyEditorsByName("sampleEnum").then(function (aPropertyEditor) {
					var oEnumStringEditor = aPropertyEditor[0];
					sap.ui.getCore().applyChanges();
					var oEnumStringEditorElement = oEnumStringEditor.getContent();

					oEnumStringEditor.attachValueChange(function (oEvent) {
						assert.strictEqual(oEvent.getParameter("value"), "Option D", "Then a custom value can be set in the editor");
						fnDone();
					});

					EditorQunitUtils.setInputValueAndConfirm(oEnumStringEditorElement, "Option D");
				});
			});

			QUnit.test("When binding strings are forbidden", function (assert) {
				var mConfig = _createBaseEditorConfig({
					allowBindings: false
				});
				this.oBaseEditor.setConfig(mConfig);

				return this.oBaseEditor.getPropertyEditorsByName("sampleEnum").then(function (aPropertyEditor) {
					var oEnumStringEditor = aPropertyEditor[0];
					sap.ui.getCore().applyChanges();
					var oEnumStringEditorElement = oEnumStringEditor.getContent();

					EditorQunitUtils.setInputValueAndConfirm(oEnumStringEditorElement, "validBindingString}");

					assert.strictEqual(oEnumStringEditorElement.getValueState(), "Error", "Then the error is displayed");
					assert.strictEqual(oEnumStringEditor.getValue(), "Option B", "Then the editor value is not updated");
				});
			});
		} else {
			QUnit.test("Test for IE11", function (assert) {
				assert.ok(true, "Test for IE11 passed");
			});
		}
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});