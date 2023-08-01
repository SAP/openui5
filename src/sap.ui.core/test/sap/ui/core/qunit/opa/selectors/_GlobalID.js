/*global QUnit */
sap.ui.define([
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/m/Button",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_ControlSelectorGenerator, Button, nextUIUpdate) {
	"use strict";

	QUnit.module("_GlobalID", {
		beforeEach: function () {
			this.oStableIDButton = new Button("myButton");
			this.oGeneratedIDButton = new Button();
			this.oStableIDButton.placeAt("qunit-fixture");
			this.oGeneratedIDButton.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oStableIDButton.destroy();
			this.oGeneratedIDButton.destroy();
		}
	});

	QUnit.test("Should generate selector for control with stable ID", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oStableIDButton})
			.then(function (mSelector) {
				assert.strictEqual(mSelector.id, "myButton", "Should include global ID");
				assert.ok(!mSelector.controlType, "Should not include controlType matcher");
			}).finally(fnDone);
	});

	QUnit.test("Should return undefined for control with generated ID", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oGeneratedIDButton, shallow: true})
			.catch(function (oError) {
				assert.ok(oError.message.match(/Could not generate a selector for control/), "Should not generate selector");
			}).finally(fnDone);
	});
});
