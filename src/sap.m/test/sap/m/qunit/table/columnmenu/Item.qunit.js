/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Item",
	"sap/m/Button"
], function (QUnitUtils, Item, Button) {
	"use strict";

	var sText = "Test",
		sIcon = "sap-icon://example";

	// Test setup
	QUnit.module("Plain Item", {
		beforeEach: function () {
			this.oItem = new Item({
				label: sText,
				icon: sIcon,
				text: sText
			});
		},
		afterEach: function () {
			this.oItem.destroy();
		}
	});

	QUnit.test("Retrieve label", function (assert) {
		assert.equal(this.oItem.getLabel(), sText);
	});

	QUnit.test("Retrieve icon", function (assert) {
		assert.equal(this.oItem.getIcon(), sIcon);
	});

	QUnit.test("Retrieve default reset button value", function (assert) {
		assert.ok(this.oItem.getShowResetButton());
	});

	QUnit.test("Retrieve default reset button enablement value", function (assert) {
		assert.ok(this.oItem.getResetButtonEnabled());
	});

	QUnit.test("Retrieve default confirm button value", function (assert) {
		assert.ok(this.oItem.getShowConfirmButton());
	});

	QUnit.test("Retrieve default cancel button value", function (assert) {
		assert.ok(this.oItem.getShowCancelButton());
	});

	QUnit.test("Retrieve empty content", function (assert) {
		assert.notOk(this.oItem.getContent());
	});

	QUnit.module("Modified Item", {
		beforeEach: function () {
			var oContent  = new Button({text: sText});
			this.oItem = new Item({
				label: sText,
				icon: sIcon,
				text: sText,
				showResetButton: false,
				resetButtonEnabled: false,
				showConfirmButton: false,
				showCancelButton: false,
				content: oContent
			});
		},
		afterEach: function () {
			this.oItem.destroy();
		}
	});

	QUnit.test("Retrieve modified reset button value", function (assert) {
		assert.notOk(this.oItem.getShowResetButton());
	});

	QUnit.test("Retrieve modified reset button enablement value", function (assert) {
		assert.notOk(this.oItem.getResetButtonEnabled());
	});

	QUnit.test("Retrieve modified confirm button value", function (assert) {
		assert.notOk(this.oItem.getShowConfirmButton());
	});

	QUnit.test("Retrieve modified cancel button value", function (assert) {
		assert.notOk(this.oItem.getShowCancelButton());
	});

	QUnit.test("Retrieve content", function (assert) {
		assert.ok(this.oItem.getContent());
		assert.ok(this.oItem.getContent().isA("sap.m.Button"));
		assert.equal(this.oItem.getContent().getText(), sText);
	});

});