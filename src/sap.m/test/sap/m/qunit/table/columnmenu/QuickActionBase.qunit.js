/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/library"
], function (QUnitUtils, QuickActionBase, library) {
	"use strict";

	QUnit.module("Plain QuickActionbase", {
		beforeEach: function () {
			this.oQuickActionBase = new QuickActionBase();
		},
		afterEach: function () {
			this.oQuickActionBase.destroy();
		}
	});

	QUnit.test("Return effective items", function(assert) {
		assert.deepEqual(this.oQuickActionBase.getEffectiveQuickActions(), [this.oQuickActionBase]);

		this.oQuickActionBase.setVisible(false);
		assert.deepEqual(this.oQuickActionBase.getEffectiveQuickActions(), [], "No effective actions returned");
	});

	QUnit.test("Category", function(assert) {
		assert.strictEqual(this.oQuickActionBase.getCategory(), library.table.columnmenu.Category.Generic);
	});

	QUnit.test("Category of a subclass with a property named 'category'", function(assert) {
		var QuickActionBaseSubClass = QuickActionBase.extend("sap.m.test.table.columnmenu.QuickActionBaseSubClass", {
			metadata: {
				properties: {
					category: {type: "sap.m.table.columnmenu.Category"}
				}
			}
		});
		var oQuickAction = new QuickActionBaseSubClass({category: library.table.columnmenu.Category.Filter});

		assert.strictEqual(oQuickAction.getCategory(), library.table.columnmenu.Category.Filter);

		oQuickAction.destroy();
	});
});