/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/ItemBase",
	"sap/m/table/columnmenu/ItemContainer"
], function (QUnitUtils, ItemBase, ItemContainer) {
	"use strict";

	// Test setup
	QUnit.module("Plain ItmeContainer", {
		beforeEach: function () {
			this.oItem1 = new ItemBase();
			this.oItem2 = new ItemBase();
			this.oItemContainer = new ItemContainer({items: [this.oItem1, this.oItem2]});
		},
		afterEach: function () {
			this.oItem1.destroy();
			this.oItem2.destroy();
			this.oItemContainer.destroy();
		}
	});

	QUnit.test("Return effective items", function(assert) {
		var aEffectiveItems = this.oItemContainer.getEffectiveItems();
		assert.deepEqual(aEffectiveItems, [this.oItem1, this.oItem2]);
	});

	QUnit.test("Access unimplemented icon", function(assert) {
		try {
			this.oItemContainer.getIcon();
		} catch (error) {
			assert.equal(error.message, this.oItemContainer + " does not implement #getIcon");
		}
	});

	QUnit.test("Visibility for effective items", function(assert) {
		var aEffectiveItems = this.oItemContainer.getEffectiveItems();
		assert.deepEqual(aEffectiveItems, [this.oItem1, this.oItem2], "Effective item is returned");

		this.oItemContainer.setVisible(false);
		aEffectiveItems = this.oItemContainer.getEffectiveItems();
		assert.deepEqual(aEffectiveItems, [], "No effective items are returned for invisible container");

		this.oItemContainer.setVisible(true);
		this.oItem1.setVisible(false);
		aEffectiveItems = this.oItemContainer.getEffectiveItems();
		assert.deepEqual(aEffectiveItems, [this.oItem2], "Item1 is not returned as effective item");

		this.oItem2.setVisible(false);
		aEffectiveItems = this.oItemContainer.getEffectiveItems();
		assert.deepEqual(aEffectiveItems, [], "Item1, Item2 are not returned as effective items");
	});
});