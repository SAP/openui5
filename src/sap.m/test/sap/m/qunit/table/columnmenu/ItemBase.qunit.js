/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/ItemBase"
], function (QUnitUtils, ItemBase) {
	"use strict";

	// Test setup
	QUnit.module("Plain ItemBase", {
		beforeEach: function () {
			this.oItemBase = new ItemBase();
		},
		afterEach: function () {
			this.oItemBase.destroy();
		}
	});

	QUnit.test("Return effective items", function(assert) {
		var effectiveItem = this.oItemBase.getEffectiveItems();
		assert.deepEqual(effectiveItem, [this.oItemBase]);
	});

	QUnit.test("Access unimplemented icon", function(assert) {
		try {
			this.oItemBase.getIcon();
		} catch (error) {
			assert.equal(error.message, this.oItemBase + " does not implement #getIcon");
		}
	});
});