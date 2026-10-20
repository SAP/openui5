/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/table/RowItemActionItemBase",
	"sap/ui/mdc/list/ItemActionItem",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/ListActionType",
	"sap/ui/mdc/enums/TableRowActionType"
], function(RowItemActionItemBase, ItemActionItem, RowActionItem, ListActionType, TableRowActionType) {
	"use strict";

	QUnit.module("Base");

	QUnit.test("is abstract", function(assert) {
		assert.ok(RowItemActionItemBase.getMetadata().isAbstract(), "RowItemActionItemBase is abstract");
	});

	QUnit.test("shared metadata", function(assert) {
		const oMetadata = RowItemActionItemBase.getMetadata();
		assert.ok(oMetadata.getProperty("text"), "text property exists");
		assert.ok(oMetadata.getProperty("icon"), "icon property exists");
		assert.strictEqual(oMetadata.getProperty("visible").getDefaultValue(), true, "visible defaults to true");
		assert.ok(oMetadata.getEvent("press"), "press event exists");
		assert.notOk(oMetadata.getProperty("type"), "type is not declared on the base");
	});

	QUnit.test("_onPress fires press with the binding context", function(assert) {
		const Concrete = RowItemActionItemBase.extend("sap.ui.mdc.qunit.util.TestActionItem");
		const oItem = new Concrete();
		const oContext = {dummy: true};
		let oFired = null;
		oItem.attachPress((oEvent) => {
			oFired = oEvent.getParameter("bindingContext");
		});

		oItem._onPress({bindingContext: oContext});

		assert.strictEqual(oFired, oContext, "press fired with the given binding context");
		oItem.destroy();
	});

	QUnit.module("Subclasses");

	QUnit.test("ItemActionItem inherits shared surface and adds its own type", function(assert) {
		const oItem = new ItemActionItem();
		assert.ok(oItem.isA("sap.ui.mdc.table.RowItemActionItemBase"), "ItemActionItem extends the base");
		assert.strictEqual(oItem.getVisible(), true, "inherited visible default");
		assert.strictEqual(oItem.getType(), ListActionType.Custom, "type defaults to ListActionType.Custom");
		assert.strictEqual(typeof oItem._onPress, "function", "inherited _onPress");
		oItem.destroy();
	});

	QUnit.test("RowActionItem inherits shared surface and adds its own type", function(assert) {
		const oItem = new RowActionItem();
		assert.ok(oItem.isA("sap.ui.mdc.table.RowItemActionItemBase"), "RowActionItem extends the base");
		assert.strictEqual(oItem.getVisible(), true, "inherited visible default");
		assert.strictEqual(oItem.getType(), TableRowActionType.Custom, "type defaults to TableRowActionType.Custom");
		assert.strictEqual(typeof oItem._onPress, "function", "inherited _onPress");
		oItem.destroy();
	});
});
