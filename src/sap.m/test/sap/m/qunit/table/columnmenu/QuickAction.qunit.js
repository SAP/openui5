/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/Button"
], function (QUnitUtils, QuickAction, Button) {
	"use strict";

	var sText = "Test";

	QUnit.module("Basic", {
		beforeEach: function () {
			var oContent = new Button({text: sText});
			this.oQuickAction = new QuickAction({
				label: sText,
				content: oContent
			});
		},
		afterEach: function () {
			this.oQuickAction.destroy();
		}
	});

	QUnit.test("Instantiate QuickAction", function(assert) {
		assert.ok(this.oQuickAction);
	});

	QUnit.test("Return label", function(assert) {
		assert.equal(this.oQuickAction.getLabel(), sText);
	});

	QUnit.test("Return content", function(assert) {
		assert.ok(this.oQuickAction.getContent());
		assert.ok(this.oQuickAction.getContent()[0].isA("sap.m.Button"));
		assert.equal(this.oQuickAction.getContent()[0].getText(), sText);
	});
});