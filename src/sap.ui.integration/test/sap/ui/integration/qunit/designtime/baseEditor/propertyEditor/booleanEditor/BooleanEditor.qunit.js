/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils"
], function (
	BooleanEditor,
	JSONModel,
	QUnitUtils
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
			assert.strictEqual(this.oEditor.getContent()[0].getSelected(), true, "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the model", function (assert) {
			this.oContextModel.setData({
				content: false
			});
			assert.strictEqual(this.oEditor.getContent()[0].getSelected(), false, "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChanged(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), false, "Then it is updated correctly");
				fnDone();
			});

			QUnitUtils.triggerEvent("tap", this.oEditor.getContent()[0].getDomRef());
		});
	});
});