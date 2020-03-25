/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function (
	BaseEditor,
	QUnitUtils,
	KeyCodes
) {
	"use strict";

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
				"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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

			return this.oBaseEditor.getPropertyEditorsByName("sampleEnum").then(function (aPropertyEditor) {
				this.oEnumStringEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oEnumStringEditorElement = this.oEnumStringEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
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

			this.oEnumStringEditorElement.getDomRef().value = "Option C";
			QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.getDomRef());
			QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided in the input field", function (assert) {
			var fnDone = assert.async();

			this.oEnumStringEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oEnumStringEditorElement.$("inner").val("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.$("inner"));
			QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided as the editor value", function (assert) {
			this.oEnumStringEditor.setValue("{= ${url}}");
			assert.strictEqual(this.oEnumStringEditorElement.$("inner").val(), "{= ${url}}");
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			this.oEnumStringEditorElement.$("inner").val("Invalid Option");
			QUnitUtils.triggerEvent("input", this.oEnumStringEditorElement.$("inner"));
			QUnitUtils.triggerKeydown(this.oEnumStringEditorElement.getDomRef(), KeyCodes.ENTER);

			assert.strictEqual(this.oEnumStringEditorElement.getValueState(), "Error", "Then the error is displayed");
			assert.strictEqual(this.oEnumStringEditor.getValue(), "Option B", "Then the editor value is not updated");
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

			this.oBaseEditor.getPropertyEditorsByName("sampleEnum").then(function (aPropertyEditor) {
				var oEnumStringEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oEnumStringEditorElement = oEnumStringEditor.getContent();


				oEnumStringEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("value"), "Option D", "Then a custom value can be set in the editor");
					fnDone();
				});

				oEnumStringEditorElement.$("inner").val("Option D");
				QUnitUtils.triggerEvent("input", oEnumStringEditorElement.$("inner"));
				QUnitUtils.triggerKeydown(oEnumStringEditorElement.$("inner"), KeyCodes.ENTER);
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

				oEnumStringEditorElement.$("inner").val("{validBindingString}");
				QUnitUtils.triggerEvent("input", oEnumStringEditorElement.$("inner"));
				QUnitUtils.triggerKeydown(oEnumStringEditorElement.$("inner"), KeyCodes.ENTER);

				assert.strictEqual(oEnumStringEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(oEnumStringEditor.getValue(), "Option B", "Then the editor value is not updated");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});