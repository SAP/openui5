/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/events/KeyCodes"
], function (
	BooleanEditor,
	JSONModel,
	QUnitUtils,
	ResourceBundle,
	ResourceModel,
	KeyCodes
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
			this.oContextModel = new JSONModel({
				content: true
			});
			this.oContextModel.setDefaultBindingMode("OneWay");

			this.oEditor = new BooleanEditor();
			this.oEditor.setModel(this.oContextModel, "_context");
			this.oEditor.setConfig(this.oPropertyConfig);
			this.oEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oContextModel.destroy();
			this.oEditor.destroy();
		}
	}, function () {
		QUnit.test("When a BooleanEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			assert.strictEqual(this.oEditor.getContent()[0].getSelectedItem().getKey(), "true", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the model", function (assert) {
			this.oContextModel.setData({
				content: false
			});
			assert.strictEqual(this.oEditor.getContent()[0].getSelectedItem().getKey(), "false", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), false, "Then it is updated correctly");
				fnDone();
			});

			this.oEditor.getContent()[0].getDomRef().value = 'false';
			QUnitUtils.triggerEvent("input", this.oEditor.getContent()[0].getDomRef());
			QUnitUtils.triggerKeydown(this.oEditor.getContent()[0].getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oEditor.getContent()[0].$("inner").val('{someBindingPath}');
			QUnitUtils.triggerEvent("input", this.oEditor.getContent()[0].$("inner"));
			QUnitUtils.triggerKeydown(this.oEditor.getContent()[0].getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var fnDone = assert.async();

			// Load the i18n model for the value state text on error
			ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var _oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				_oI18nModel.setDefaultBindingMode("OneWay");
				this.oEditor.setModel(_oI18nModel, "i18n");

				// Test
				this.oEditor.getContent()[0].$("inner").val('abc');
				QUnitUtils.triggerEvent("input", this.oEditor.getContent()[0].$("inner"));
				QUnitUtils.triggerKeydown(this.oEditor.getContent()[0].getDomRef(), KeyCodes.ENTER);

				assert.strictEqual(this.oEditor._oCombo.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oEditor.getBindingContext().getObject().value, true, "Then the model is not updated");

				fnDone();
			}.bind(this));
		});
	});
});