/*global QUnit */
sap.ui.define([
	"sap/ui/commons/MenuItem",
	"sap/ui/commons/MenuTextFieldItem",
	"sap/ui/commons/MenuItemBase",
	"sap/ui/unified/MenuItemBase"
], function(
	MenuItem,
	MenuTextFieldItem,
	MenuItemBase,
	unifiedMenuItemBase
) {
	"use strict";

	QUnit.test("Type check: sap.ui.commons.MenuItemBase", function(assert) {
		var oItem1 = new MenuItem();
		var oItem2 = new MenuTextFieldItem();

		assert.ok(MenuItemBase === unifiedMenuItemBase, "sap.ui.commons.MenuItemBase = sap.ui.unified.MenuItemBase");
		assert.ok(oItem1 instanceof MenuItemBase, "sap.ui.commons.MenuItem is a sap.ui.commons.MenuItemBase");
		assert.ok(oItem1 instanceof unifiedMenuItemBase, "sap.ui.commons.MenuItem is a sap.ui.unified.MenuItemBase");
		assert.ok(oItem2 instanceof MenuItemBase, "sap.ui.commons.MenuTextFieldItem is a sap.ui.commons.MenuItemBase");
		assert.ok(oItem2 instanceof unifiedMenuItemBase, "sap.ui.commons.MenuTextFieldItem is a sap.ui.unified.MenuItemBase");
	});

});