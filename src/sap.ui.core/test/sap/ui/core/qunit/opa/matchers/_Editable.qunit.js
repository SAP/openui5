/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/_Editable',
	'sap/m/Input',
	'sap/m/Text',
	'sap/ui/layout/form/SimpleForm'
], function (_Editable, Input, Text, SimpleForm) {
	"use strict";

	QUnit.module("_Editable matcher", {
		beforeEach: function () {
			this.oInput = new Input("myInput");
			this.oText = new Text("myText");
			this.oForm = new SimpleForm("myForm", {
				content: [this.oInput, this.oText]
			});
			this.oForm.placeAt("qunit-fixture");
			this.oEditableMatcher = new _Editable();
			this.oSpy = sinon.spy(this.oEditableMatcher._oLogger, "debug");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSpy.restore();
			this.oForm.destroy();
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Should match editable control", function (assert) {
		this.oForm.setEditable(true);
		assert.ok(this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.notCalled(this.oSpy);
	});

	QUnit.test("Should not match non-editable control", function (assert) {
		this.oForm.setEditable(true);
		this.oInput.setEditable(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Input#myInput' is not editable");
	});

	QUnit.test("Should not match control with non-editable ancestor", function (assert) {
		this.oForm.setEditable(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oEditableMatcher.isMatching(this.oInput));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Input#myInput' has a parent 'Element sap.ui.layout.form.Form#myForm--Form' that is not editable");
	});

	QUnit.test("Should not match control when a parent is disabled and it has no Disabled propagator", function (assert) {
		this.oForm.setEditable(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oEditableMatcher.isMatching(this.oText));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Text#myText' has a parent 'Element sap.ui.layout.form.Form#myForm--Form' that is not editable");
	});
});
