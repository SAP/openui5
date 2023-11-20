/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/Button",
	"sap/m/library"
], function(QUnitUtils, QuickAction, Button, library) {
	"use strict";

	var sText = "Test";

	QUnit.module("Basic", {
		beforeEach: function() {
			var oContent = new Button({text: sText});
			this.oQuickAction = new QuickAction({
				label: sText,
				content: oContent,
				category: library.table.columnmenu.Category.Group
			});
		},
		afterEach: function() {
			this.oQuickAction.destroy();
		}
	});

	QUnit.test("Defaults", function(assert) {
		var oQuickAction = new QuickAction();

		assert.strictEqual(oQuickAction.getLabel(), "", "Label");
		assert.strictEqual(oQuickAction.getContent(), null, "Content");
		assert.strictEqual(oQuickAction.getCategory(), library.table.columnmenu.Category.Generic, "Category");

		oQuickAction.destroy();
	});

	QUnit.test("Return category", function(assert) {
		assert.strictEqual(this.oQuickAction.getCategory(), library.table.columnmenu.Category.Group);
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