/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/_Editable',
	'sap/m/Input',
	'sap/m/Text',
	'sap/ui/layout/library',
	'sap/ui/layout/form/SimpleForm',
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_Editable, Input, Text, layoutLibrary, SimpleForm, nextUIUpdate) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	QUnit.module("_Editable matcher", {
		beforeEach: function () {
			this.oInput = new Input("myInput");
			this.oText = new Text("myText");
			this.oForm = new SimpleForm("myForm", {
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oInput, this.oText]
			});
			this.oForm.placeAt("qunit-fixture");
			this.oEditableMatcher = new _Editable();
			this.oSpy = sinon.spy(this.oEditableMatcher._oLogger, "debug");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oSpy.restore();
			this.oForm.destroy();
			return nextUIUpdate();
		}
	});

	QUnit.test("Should match editable control", function (assert) {
		this.oForm.setEditable(true);
		assert.ok(this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.notCalled(this.oSpy);
	});

	QUnit.test("Should not match non-editable control", async function (assert) {
		this.oForm.setEditable(true);
		this.oInput.setEditable(false);
		await nextUIUpdate();

		assert.ok(!this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Input#myInput' is not editable");
	});

	QUnit.test("Should not match control with non-editable ancestor", async function (assert) {
		this.oForm.setEditable(false);
		await nextUIUpdate();

		assert.ok(!this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Input#myInput' has a parent 'Element sap.ui.layout.form.Form#myForm--Form' that is not editable");
	});

	QUnit.test("Should not match control when a parent is disabled and it has no Disabled propagator", async function (assert) {
		this.oForm.setEditable(false);
		await nextUIUpdate();

		assert.ok(!this.oEditableMatcher.isMatching(this.oText));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Text#myText' has a parent 'Element sap.ui.layout.form.Form#myForm--Form' that is not editable");
	});
});
