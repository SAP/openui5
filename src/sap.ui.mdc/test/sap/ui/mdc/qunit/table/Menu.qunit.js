/* global QUnit, sinon */
sap.ui.define([
	"../QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/plugins/ColumnResizer"
], function(
	MDCQUnitUtils,
	Core,
	Table,
	GridTableType,
	Column,
	Text,
	ColumnResizer
) {
	"use strict";

	var sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";
	function wait(iMilliseconds) {
		return new Promise(function(resolve) {
			setTimeout(resolve, iMilliseconds);
		});
	}

	QUnit.module("Menu", {
		beforeEach: function() {
			this.oTable = new Table({
				type: "ResponsiveTable",
				columns: [
					new Column({
						header: "test",
						dataProperty: "test",
						template: new Text()
					})
				],
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});

			this.oTable._bUseColumnMenu = true;
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			MDCQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test"
				}
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Initialize", function(assert) {
		var oTable = this.oTable,
			oInnerColumn,
			fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		return oTable._fullyInitialized().then(function () {
			oTable.setEnableColumnResize(false);

			assert.ok(oTable._oTable.bActiveHeaders, "The table has active headers");
			assert.ok(!oTable._oColumnHeaderMenu, "The ColumnMenu is not initialized");
			assert.ok(!oTable._oQuickActionContainer, "The QuickActionContainer is not initialized");
			assert.ok(!oTable._oItemContainer, "The ItemContainer is not initialized");

			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnPress", {
				column: oInnerColumn
			});

			assert.ok(fColumnPressSpy.calledOnce, "_onColumnPress event handler is called");

			return wait(0);
		}).then(function() {
			assert.ok(oTable._oColumnHeaderMenu, "The ColumnMenu is initialized");
			assert.ok(oTable._oColumnHeaderMenu.isA("sap.m.table.columnmenu.Menu"), "The ColumnMenu is instance of the correct class");
			assert.ok(oTable._oQuickActionContainer, "The QuickActionContainer is initialized");
			assert.ok(oTable._oQuickActionContainer.isA("sap.m.table.columnmenu.QuickActionContainer"),
				"The QuickActionContainer is instance of the correct class");
			assert.ok(oTable._oItemContainer, "The ItemContainer is initialized");
			assert.ok(oTable._oItemContainer.isA("sap.m.table.columnmenu.ItemContainer"),
				"The Item Container is instance of the correct class");
			assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 0, "The ColumnMenu contains no quick actions");
			assert.equal(oTable._oItemContainer.getEffectiveItems().length, 0, "The ColumnMenu contains no items");
			assert.ok(!oTable._oColumnHeaderMenu._oPopover, "The popover is not initialized");

			oTable.setP13nMode([
				"Sort"
			]);
			oTable._oTable.fireEvent("columnPress", {
				column: oInnerColumn
			});

			assert.ok(fColumnPressSpy.calledTwice, "_onColumnPress event handler is called");

			return wait(0);
		}).then(function() {
			assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 1, "The ColumnMenu contains quick actions");
			assert.equal(oTable._oItemContainer.getEffectiveItems().length, 1, "The ColumnMenu contains items");
			assert.ok(oTable._oColumnHeaderMenu._oPopover, "The popover is initialized");
			assert.ok(oTable._oColumnHeaderMenu._oPopover.isOpen(), "The popover is open");

			fColumnPressSpy.restore();
		});
	});

	QUnit.module("QuickActionContainer", {
		beforeEach: function() {
			this.oTable = new Table({
				type: "ResponsiveTable",
				columns: [
					new Column({
						header: "test",
						dataProperty: "test",
						template: new Text()
					})
				],
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});

			this.oTable._bUseColumnMenu = true;
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			MDCQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test",
					groupable: true
				}
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Responsive table - Sort", function(assert) {
		var oTable = this.oTable,
			oInnerColumn;

		return oTable._fullyInitialized().then(function () {
			oTable.setP13nMode([
				"Sort"
			]);
			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnPress", {
				column: oInnerColumn
			});

			return Promise.all([
				wait(0),
				new Promise(function(resolve) {
					sap.ui.require(["sap/ui/mdc/table/TableSettings"], resolve);
				})
			]);
		}).then(function(aResult) {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickSort"), "The QuickActionContainer contains a QuickSort");

			var TableSettings = aResult[1];
			var fSortSpy = sinon.spy(TableSettings, "createSort");
			var aSortItemContent =  oQuickAction.getItems()[0]._getAction().getContent();

			aSortItemContent[0].firePress();
			assert.ok(fSortSpy.calledOnce, "createSort is called");

			fSortSpy.restore();
		});
	});

	QUnit.test("Responsive table - Resize on touch devices", function(assert) {
		var oTable = this.oTable;
		var oInnerColumn;

		return oTable._fullyInitialized().then(function () {
			sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnPress", {
				column: oInnerColumn
			});
		}).then(function() {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.equal(oQuickAction.getLabel(), Core.getLibraryResourceBundle("sap.m").getText("table.COLUMN_MENU_RESIZE"),
				"QuickAction resize column");

			var oColumnResizer = oTable._oTable.getDependents()[0];
			oColumnResizer.startResizing = function() {};
			var fnResizeSpy = sinon.spy(oColumnResizer, "startResizing");
			oQuickAction.getContent()[0].firePress();
			assert.ok(fnResizeSpy.calledOnce, "Resizing started");

			ColumnResizer._isInTouchMode.restore();
		});
	});

	QUnit.test("Grid table - Group", function(assert) {
		var oTable = this.oTable,
			oInnerColumn;

		return oTable._fullyInitialized().then(function () {
			oTable.setType("Table");
			return oTable._fullyInitialized();
		}).then(function(){
			oTable.setP13nMode([
				"Group"
			]);
			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._onColumnPress(oInnerColumn);

			return Promise.all([
				wait(0),
				new Promise(function(resolve) {
					sap.ui.require(["sap/ui/mdc/table/TableSettings"], resolve);
				})
			]);
		}).then(function(aResult) {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickGroup"), "The QuickActionContainer contains a QuickGroup");

			var TableSettings = aResult[1];
			var fGroupSpy = sinon.spy(TableSettings, "createGroup");
			var aGroupItemContent =  oQuickAction.getContent();

			aGroupItemContent[0].firePress();
			assert.ok(fGroupSpy.calledOnce, "createGroup is called");

			fGroupSpy.restore();
		});
	});

	QUnit.module("ItemContainer", {
		beforeEach: function() {
			this.oTable = new Table({
				type: "ResponsiveTable",
				columns: [
					new Column({
						header: "test",
						dataProperty: "test",
						template: new Text()
					})
				],
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});

			this.oTable._bUseColumnMenu = true;
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			MDCQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test",
					groupable: true
				}
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Initialize Items", function(assert) {
		var oTable = this.oTable,
			oInnerColumn;

		return oTable._fullyInitialized().then(function () {
			oTable.setType("Table");
			return oTable._fullyInitialized();
		}).then(function () {
			oTable.setP13nMode([
				"Sort", "Filter", "Group"
			]);
			oTable.getSupportedP13nModes = function() {
				return ["Sort", "Filter", "Group"];
			};
			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._onColumnPress(oInnerColumn);
		}).then(function() {
			var aItems = oTable._oItemContainer.getItems();

			assert.equal(aItems.length, 3, "The ItemContainer contains 3 Items");
			assert.equal(aItems[0].getKey(), "Sort", "Sort");
			assert.equal(aItems[1].getKey(), "Filter", "Filter");
			assert.equal(aItems[2].getKey(), "Group", "Group");
		});
	});

	QUnit.test("Item", function(assert) {
		var oTable = this.oTable,
			oInnerColumn;

		return oTable._fullyInitialized().then(function () {
			return wait(0);
		}).then(function () {
			oTable.setP13nMode([
				"Sort"
			]);
			oTable.getSupportedP13nModes = function() {
				return ["Sort"];
			};
			oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnPress", {
				column: oInnerColumn
			});

			return wait(0);
		}).then(function() {
			var aItems = oTable._oItemContainer.getItems();

			var oItem = aItems[0];
			var fUpdateSpy = sinon.spy(oTable.getEngine().getController(oTable, oItem.getKey()), "update");
			var fHandleP13nSpy = sinon.spy(oTable.getEngine(), "handleP13n");
			var fResetSpy = sinon.spy(oTable.getEngine(), "reset");

			oItem.onPress();
			assert.ok(fUpdateSpy.calledOnce, "Controller update called once");
			assert.ok(fUpdateSpy.calledWithExactly(oTable.getPropertyHelper()), "update called with the correct parameter");
			oItem.onConfirm();
			assert.ok(fHandleP13nSpy.calledOnce, "Engine handleP13n called once");
			assert.ok(fHandleP13nSpy.calledWithExactly(oTable, [oItem.getKey()]), "handleP13n called with the correct parameters");
			oItem.onReset();
			assert.ok(fResetSpy.calledOnce, "Engine reset called once");
			assert.ok(fResetSpy.calledWithExactly(oTable, [oItem.getKey()]), "reset called with the correct parameters");
		});
	});
});