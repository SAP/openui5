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

	QUnit.test("Visibility for effective items", function(assert) {
		var oEffectiveItem = this.oItemBase.getEffectiveItems();
		assert.deepEqual(oEffectiveItem, [this.oItemBase], "Effective item is returned");

		this.oItemBase.setVisible(false);
		oEffectiveItem = this.oItemBase.getEffectiveItems();
		assert.deepEqual(oEffectiveItem, [], "No effective items are returned for invisible item");
	});
});