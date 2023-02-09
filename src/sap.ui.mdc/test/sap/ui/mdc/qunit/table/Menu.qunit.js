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

	function openColumnMenu(oTable, iColumnIndex) {
		var oColumn = oTable._oTable.getColumns()[iColumnIndex];
		Core.byId(oColumn.getHeaderMenu()).openBy(oColumn);

		return oTable._fullyInitialized().then(function() {
			return oTable.propertiesFinalized();
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
		var oTable = this.oTable, oInnerColumn, oColumnMenu, oOpenSpy;
		oTable.setP13nMode([
			"Sort"
		]);

		return oTable._fullyInitialized().then(function () {
			oTable.setEnableColumnResize(false);

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

			oInnerColumn = oTable._oTable.getColumns()[0];
			oColumnMenu = oTable._oColumnHeaderMenu;
			oColumnMenu.openBy(oInnerColumn);
			oOpenSpy = sinon.spy(oColumnMenu, "openBy");

			return wait(0);
		}).then(function() {
			assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 1, "The ColumnMenu contains quick actions");
			assert.equal(oTable._oItemContainer.getEffectiveItems().length, 1, "The ColumnMenu contains items");
			assert.ok(oOpenSpy.calledWithExactly(oInnerColumn, true), "openBy is called once with the correct parameters");
		});
	});

	QUnit.test("Open menu before the table is fully initialized", function(assert) {
		var oTable = this.oTable, oColumn, oColumnMenu, oOpenMenuSpy;

		oTable.setP13nMode([
			"Sort"
		]);

		return Promise.all([
			oTable.initialized().then(function() {
				return new Promise(function(resolve) {
					oColumn = oTable._oTable.getColumns()[0];
					oColumnMenu = Core.byId(oColumn.getHeaderMenu());
					oColumnMenu.openBy(oColumn);

					oOpenMenuSpy = sinon.spy(oTable._oColumnHeaderMenu, "openBy");
					assert.ok(oOpenMenuSpy.notCalled, "Menu does not open because the PropertyInfos are not yet final");
					resolve();
				});
			}),

			oTable.propertiesFinalized().then(function() {
				wait(0).then(function() {
					return new Promise(function(resolve) {
						assert.ok(oOpenMenuSpy.calledOnce, "Menu opens after the table is fully initialized");
						resolve();
					});
				});
			})
		]);
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

			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			MDCQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test",
					sortable: true,
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
		var oTable = this.oTable, oInnerColumn, oColumnMenu;

		return oTable._fullyInitialized().then(function () {
			oTable.setP13nMode([
				"Sort"
			]);

			oInnerColumn = oTable._oTable.getColumns()[0];
			oColumnMenu = oTable._oColumnHeaderMenu;
			oColumnMenu.openBy(oInnerColumn);

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
			assert.ok(fSortSpy.calledWithExactly(oTable, "test", "None", true), "createSort is called with the correct parameters");

			fSortSpy.restore();
		});
	});

	QUnit.test("Responsive table - Resize on touch devices", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
			return openColumnMenu(oTable, 0);
		}).then(function() {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.equal(oQuickAction.getLabel(), "", "label is empty");
			assert.equal(oQuickAction.getContent()[0].getText(), Core.getLibraryResourceBundle("sap.m").getText("table.COLUMNMENU_RESIZE"), "button text is correct");

			var oColumnResizer = oTable._oTable.getDependents()[0];
			oColumnResizer.startResizing = function() {};
			var fnResizeSpy = sinon.spy(oColumnResizer, "startResizing");
			oQuickAction.getContent()[0].firePress();
			assert.ok(fnResizeSpy.calledOnce, "Resizing started");

			ColumnResizer._isInTouchMode.restore();
		});
	});

	QUnit.test("Grid table - Group", function(assert) {
		var oTable = this.oTable, oInnerColumn, oColumnMenu;

		return oTable._fullyInitialized().then(function () {
			oTable.setType("Table");
			return oTable._fullyInitialized();
		}).then(function(){
			oTable.setP13nMode([
				"Group"
			]);

			oInnerColumn = oTable._oTable.getColumns()[0];
			oColumnMenu = oInnerColumn.getHeaderMenuInstance();
			oColumnMenu.openBy(oInnerColumn);

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
			assert.ok(fGroupSpy.calledWithExactly(oTable, "test"), "createGroup is called with the correct parameters");

			fGroupSpy.restore();
		});
	});

	QUnit.test("updateQuickActions", function(assert) {
		var oTable = this.oTable;

		function testUpdateQuickActions(sSortOrder, bGrouped, bTotaled) {
			oTable._oQuickActionContainer.updateQuickActions(["Sort", "Group"]);
			oTable._oQuickActionContainer.getEffectiveQuickActions().forEach(function(oQuickAction) {
				if (oQuickAction.getParent().isA("sap.m.table.columnmenu.QuickSortItem")) {
					assert.equal(oQuickAction.getContent()[0].getPressed(), sSortOrder === "Ascending");
					assert.equal(oQuickAction.getContent()[1].getPressed(), sSortOrder === "Descending");
				} else if (oQuickAction.isA("sap.m.table.columnmenu.QuickGroup")) {
					assert.ok(oQuickAction.getContent()[0].getPressed() === bGrouped);
				} else if (oQuickAction.isA("sap.m.table.columnmenu.QuickTotal")) {
					assert.ok(oQuickAction.getContent()[0].getPressed() === bTotaled);
				}
			});
		}

		return oTable._fullyInitialized().then(function () {
			oTable.setP13nMode([
				"Sort", "Group"
			]);
			return openColumnMenu(oTable, 0);
		}).then(function() {
			oTable._getSortedProperties = function() {
				return [{ name: "test", Descending: false }];
			};
			oTable._getGroupedProperties = function() {
				return [];
			};
			testUpdateQuickActions("Ascending", false);

			oTable._getSortedProperties = function() {
				return [];
			};
			oTable._getGroupedProperties = function() {
				return [{ name: "test" }];
			};
			testUpdateQuickActions("None", true);
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
		var oTable = this.oTable;
		oTable.setP13nMode([
			"Sort", "Filter", "Group", "Column"
		]);

		return oTable._fullyInitialized().then(function () {
			oTable.setType("Table");
			return oTable._fullyInitialized();
		}).then(function () {
			oTable.getSupportedP13nModes = function() {
				return ["Sort", "Filter", "Group", "Column"];
			};
			return openColumnMenu(oTable, 0);
		}).then(function() {
			return wait(0);
		}).then(function() {
			var aItems = oTable._oItemContainer.getItems();
			var oItem;

			assert.equal(aItems.length, 4, "The ItemContainer contains 3 Items");
			oItem = aItems[0];
			assert.equal(oItem.getKey(), "Sort", "Sort");
			assert.ok(oItem.getContent().getProperty("_useFixedWidth"), "fixed width is applied to the sort panel");
			oItem = aItems[1];
			assert.equal(oItem.getKey(), "Filter", "Filter");
			assert.ok(oItem.getContent().getProperty("_useFixedWidth"), "fixed width is applied to the filter panel");
			oItem = aItems[2];
			assert.equal(oItem.getKey(), "Group", "Group");
			assert.ok(oItem.getContent().getProperty("_useFixedWidth"), "fixed width is applied to the group panel");
			oItem = aItems[3];
			assert.equal(oItem.getKey(), "Column", "Column");
			assert.ok(oItem.getContent().getProperty("_useFixedWidth"), "fixed width is applied to the column panel");

			oTable._getP13nButton().firePress();
			return wait(1000);
		}).then(function() {
			assert.notOk(oTable._oP13nFilter.getProperty("_useFixedWidth"), "in the P13nDialog the FilterPanel doesn't get a fixed width");
		});
	});

	QUnit.test("Item", function(assert) {
		var oTable = this.oTable,
			oInnerColumn,
			oColumnMenu,
			fUpdateSpy,
			fHandleP13nSpy,
			fResetSpy,
			fUpdateQuickActionsSpy;

		return oTable._fullyInitialized().then(function () {
			oTable.setP13nMode([
				"Sort"
			]);
			oTable.getSupportedP13nModes = function() {
				return ["Sort"];
			};
			oInnerColumn = oTable._oTable.getColumns()[0];
			oColumnMenu = oTable._oColumnHeaderMenu;
			oColumnMenu.openBy(oInnerColumn);

			return wait(0);
		}).then(function() {
			var aItems = oTable._oItemContainer.getItems();
			var oItem = aItems[0];

			fUpdateSpy = sinon.spy(oTable.getEngine().getController(oTable, oItem.getKey()), "update");
			fHandleP13nSpy = sinon.spy(oTable.getEngine(), "handleP13n");
			fResetSpy = sinon.stub(oTable.getEngine(), "reset").returns(Promise.resolve());
			fUpdateQuickActionsSpy = sinon.spy(oTable._oQuickActionContainer, "updateQuickActions");

			oItem.onPress();
			assert.ok(fUpdateSpy.calledOnce, "Controller update called once");
			assert.ok(fUpdateSpy.calledWithExactly(oTable.getPropertyHelper()), "update called with the correct parameter");
			oItem.onConfirm();
			assert.ok(fHandleP13nSpy.calledOnce, "Engine handleP13n called once");
			assert.ok(fHandleP13nSpy.calledWithExactly(oTable, [oItem.getKey()]), "handleP13n called with the correct parameters");
			oItem.onReset();

			return wait(0);
		}).then(function() {
			assert.ok(fResetSpy.calledOnce, "Engine reset called once");
			assert.ok(fResetSpy.calledWithExactly(oTable, ["Sort"]), "reset called with the correct parameters");
			assert.ok(fUpdateQuickActionsSpy.calledOnce, "updateQuickActions called once");
			assert.ok(fUpdateQuickActionsSpy.calledWithExactly(["Sort"]), "updateQuickActions called with the correct parameters");
		});
	});
});