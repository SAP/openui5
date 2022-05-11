/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/table/columnmenu/QuickActionContainer",
	"sap/m/library"
], function (QUnitUtils, QuickActionBase, QuickActionContainer, library) {
	"use strict";

	QUnit.module("Plain QuickActionContainer", {
		beforeEach: function () {
			this.oQuickAction1 = new QuickActionBase();
			this.oQuickAction2 = new QuickActionBase();
			this.oQuickActionContainer = new QuickActionContainer({
				quickActions: [this.oQuickAction1, this.oQuickAction2]
			});
		},
		afterEach: function () {
			this.oQuickAction1.destroy();
			this.oQuickAction2.destroy();
			this.oQuickActionContainer.destroy();
		}
	});

	QUnit.test("Return effective items", function(assert) {
		assert.deepEqual(this.oQuickActionContainer.getEffectiveQuickActions(), [this.oQuickAction1, this.oQuickAction2]);

		this.oQuickActionContainer.setVisible(false);
		assert.deepEqual(this.oQuickActionContainer.getEffectiveQuickActions(), [], "No effective actions returned");

		this.oQuickActionContainer.setVisible(true);
		this.oQuickAction1.setVisible(false);
		assert.deepEqual(this.oQuickActionContainer.getEffectiveQuickActions(), [this.oQuickAction2], "QuickAction1 not returned as effective action");

		this.oQuickAction2.setVisible(false);
		assert.deepEqual(this.oQuickActionContainer.getEffectiveQuickActions(), [], "No effective actions returned");
	});

	QUnit.test("Category", function(assert) {
		assert.strictEqual(this.oQuickActionContainer.getCategory(), library.table.columnmenu.Category.Generic);
	});
});