/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/menus/GroupHeaderContextMenuAdapter",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(
	nextUIUpdate,
	AnalyticalColumn,
	AnalyticalTable,
	GroupHeaderContextMenuAdapter,
	TableQUnitUtils,
	Menu,
	MenuItem
) {
	"use strict";

	let oGroupHeaderMenuAdapter;
	let oMenu;
	let oTable;

	function createColumn(mSettings) {
		return new AnalyticalColumn({
			grouped: mSettings.grouped || false,
			template: new TableQUnitUtils.TestControl({
				text: {
					path: mSettings.name
				}
			}),
			leadingProperty: mSettings.name
		});
	}

	function createTable() {
		const oTable = new AnalyticalTable("AnalyticalTable", {
			title: "AnalyticalTable",
			columns: [
				createColumn({grouped: true, name: "CostCenter"}),
				createColumn({name: "CostCenterText"})
			]
		});
		oTable.placeAt("qunit-fixture");

		return oTable;
	}

	const mModuleSettings = {
		beforeEach: async function() {
			oTable = createTable();
			oMenu = new Menu();
			oGroupHeaderMenuAdapter = new GroupHeaderContextMenuAdapter(oTable);
			await nextUIUpdate();
		},
		afterEach: function() {
			oGroupHeaderMenuAdapter.destroy();
			oMenu.destroy();
			oTable.destroy();
		}
	};

	QUnit.module("API", mModuleSettings);

	QUnit.test("addItemsTo - default", function(assert) {
		oGroupHeaderMenuAdapter.addItemsTo(oMenu, false /* bExtended */);
		assert.equal(oMenu.getItems().length, 6, "6 Items are available");
		assert.ok(!oMenu.getItems().every((oItem) => oItem.getVisible()), "Not all items are visible");
	});

	QUnit.test("addItemsTo - extended", function(assert) {
		assert.equal(oMenu.getItems().length, 0, "Items are not available");

		oGroupHeaderMenuAdapter.addItemsTo(oMenu, true /* bExtended */);
		assert.equal(oMenu.getItems().length, 6, "6 Items are available");
		assert.ok(oMenu.getItems().every((oItem) => oItem.getVisible()), "All items are visible");
	});

	QUnit.test("removeItemsFrom", function(assert) {
		assert.equal(oMenu.getItems().length, 0, "Items are not available");

		const oItem = new MenuItem({
			text: "Sample Item"
		});

		oMenu.addItem(oItem);
		assert.equal(oMenu.getItems().length, 1, "1 Item is available");

		// Create items and add first and last item to the menu
		oGroupHeaderMenuAdapter._createItems();
		oMenu.addItem([...oGroupHeaderMenuAdapter._mItems.values()].shift());
		oMenu.addItem([...oGroupHeaderMenuAdapter._mItems.values()].pop());
		assert.equal(oMenu.getItems().length, 3, "3 Items are available");

		oGroupHeaderMenuAdapter.removeItemsFrom(oMenu);
		assert.equal(oMenu.getItems().length, 1, "2 Items have been removed");
		assert.ok(oMenu.getItems().includes(oItem), "Custom MenuItem is still contained");
	});

	QUnit.test("destroy", function(assert) {
		oGroupHeaderMenuAdapter._createItems();
		assert.ok(oGroupHeaderMenuAdapter._mItems.size > 0, "Items are available before destroy");

		const oMenuItem = oGroupHeaderMenuAdapter._mItems.values().next().value;
		const oDestroySpy = sinon.spy(oMenuItem, "destroy");

		oGroupHeaderMenuAdapter.destroy();
		assert.ok(oDestroySpy.called, "Items are destroyed after Adapter has been destroyed");
		assert.equal(oGroupHeaderMenuAdapter._mItems, null, "Items are removed after destroy");
	});

	QUnit.module("Private functions", mModuleSettings);

	QUnit.test("_createItems", function(assert) {
		assert.equal(oGroupHeaderMenuAdapter._mItems.size, 0, "Items are not available");

		oGroupHeaderMenuAdapter._createItems();
		assert.equal(oGroupHeaderMenuAdapter._mItems.size, 6, "6 Items are available");
		assert.ok([...oGroupHeaderMenuAdapter._mItems.values()]
			.every((oItem) => oItem.isA?.("sap.ui.unified.MenuItem")), "All items are sap.ui.unified.MenuItem");
	});

	QUnit.test("_getGroupedColumnInfo", function(assert) {
		oTable._iGroupedLevel = 1;
		const {column: oColumn, index: iIndex} = oGroupHeaderMenuAdapter._getGroupedColumnInfo();

		assert.ok(oColumn.isA("sap.ui.table.AnalyticalColumn"), "Column is an AnalyticalColumn");
		assert.equal(iIndex, 0, "Index is 0");
	});
});