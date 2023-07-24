/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	oCore,
	Device
) {
	"use strict";

	var createTables = window.createTables;
	var destroyTables = window.destroyTables;

	/**
	 * @deprecated As of Version 1.117
	 */
	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Open Menu", function(assert) {
		var oTable = window.oTable;
		var done = assert.async();
		var oColumnA = oTable.getColumns()[0];
		var oColumnB = oTable.getColumns()[1];
		var oMenuA = oColumnA.getMenu();
		var oColumnSelectSpy = sinon.spy(oTable, "fireColumnSelect");

		oColumnA.setSortProperty("A");
		oColumnB.setFilterProperty("B");
		assert.notOk(oMenuA, "column menu does not exist");

		oColumnA.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				assert.ok(oColumnSelectSpy.calledOnce, "ColumnSelect event is fired");
				var oMenuA = oColumnA.getMenu();
				assert.ok(oMenuA.isA("sap.ui.table.ColumnMenu"), "column menu is created and the menu aggregation of the column is set");
				assert.equal(oMenuA.getId(), oColumnA.getId() + "-menu", "column menu has correct id assigned");
				assert.ok(oMenuA.getDomRef(), "column menu is added to the dom");

				var oMenuOpenSpy = sinon.spy(oMenuA, "open");
				var oMenuCloseSpy = sinon.spy(oMenuA, "close");

				oColumnB._openHeaderMenu();
				assert.ok(oMenuCloseSpy.calledOnce, "other column menus are closed");

				oColumnA._openHeaderMenu();
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");
				assert.deepEqual(oMenuA, oColumnA.getMenu(), "column menu instance is reused");

				done();
			});
		});
		oColumnA._openHeaderMenu();
	});

	QUnit.test("Menu has no items", function(assert) {
		var oTable = window.oTable;
		var done = assert.async();
		var oColumn = oTable.getColumns()[0];
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				var oMenuOpenSpy = sinon.spy(oMenu, "open");
				oColumn._openHeaderMenu();
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");
				oMenuOpenSpy.resetHistory();

				oColumn.setFilterProperty(undefined);
				oColumn._openHeaderMenu();
				assert.ok(oMenuOpenSpy.notCalled, "column menu does not open because it contains no items");
				done();
			});
		});
		oColumn._openHeaderMenu();
	});

	QUnit.test("Column Header CellMenu", function(assert) {
		var oTable = window.oTable;
		var done = assert.async();
		var oColumn = oTable.getColumns()[0];
		var bOriginalDeviceSystemDesktop = Device.system.desktop;

		Device.system.desktop = true;
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				var oMenuOpenSpy = sinon.spy(oMenu, "open");
				oColumn._openHeaderMenu();
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");
				oMenuOpenSpy.resetHistory();

				Device.system.desktop = false;
				oColumn._openHeaderMenu();
				var $ColumnCellMenu = oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
				assert.ok($ColumnCellMenu.length, "cell menu is applied");
				assert.ok($ColumnCellMenu.find(".sapUiTableColDropDown").length, "cell menu contains a menu button");
				assert.ok($ColumnCellMenu.find(".sapUiTableColResizer").length, "cell menu contains a resizer button");

				oColumn._openHeaderMenu();
				$ColumnCellMenu = oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
				assert.notOk($ColumnCellMenu.length, "cell menu is removed");
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");

				Device.system.desktop = bOriginalDeviceSystemDesktop;
				done();
			});
		});
		oColumn._openHeaderMenu();
	});

	QUnit.test("Hooks", function(assert) {
		var oTable = window.oTable;
		var done = assert.async();
		var oColumn = oTable.getColumns()[0];
		oColumn.setSortProperty("A");
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				var oMenu = oColumn.getMenu();
				var oInvalidateSpy = sinon.spy(oMenu, "_invalidate");
				var oSetFilterValueSpy = sinon.spy(oMenu, "_setFilterValue");
				var oSetFilterStateSpy = sinon.spy(oMenu, "_setFilterState");
				oColumn.setSortProperty(undefined);
				assert.ok(oInvalidateSpy.calledOnce, "column menu is invalidated");

				oColumn.setFilterValue("test");
				assert.ok(oSetFilterValueSpy.calledOnce, "_setFilterValue called once");

				oColumn.filter();
				assert.ok(oSetFilterStateSpy.calledOnce, "_setFilterState called once");

				done();
			});
		});
		oColumn._openHeaderMenu();
	});
});