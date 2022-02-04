/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/QuickActionBase"
], function (QUnitUtils, QuickActionBase) {
	"use strict";

	// Test setup
	QUnit.module("Plain ItemBase", {
		beforeEach: function () {
			this.oQuickActionBase = new QuickActionBase();
		},
		afterEach: function () {
			this.oQuickActionBase.destroy();
		}
	});

	QUnit.test("Instantiate QuickActionBase", function(assert) {
		assert.ok(this.oQuickActionBase);
	});

	QUnit.test("Return effective items", function(assert) {
		assert.deepEqual(this.oQuickActionBase.getEffectiveQuickActions(), [this.oQuickActionBase]);
	});
});