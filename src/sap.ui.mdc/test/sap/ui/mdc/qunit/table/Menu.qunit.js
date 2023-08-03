/* global QUnit, sinon */
sap.ui.define([
	"./QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/m/table/columnmenu/Item",
	"sap/m/Text",
	"sap/m/plugins/ColumnResizer",
	"sap/ui/performance/trace/FESRHelper"
], function(
	TableQUnitUtils,
	Core,
	Table,
	GridTableType,
	Column,
	PersonalizationUtils,
	ItemBase,
	Text,
	ColumnResizer,
	FESRHelper
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
				columns: [
					new Column({
						header: "test",
						propertyKey: "test",
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

			TableQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test"
				}
			]);

			return this.oTable.initialized().then(function() {
				this.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			TableQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Initialize", function(assert) {
		var oTable = this.oTable;
		var oOpenSpy = sinon.spy(oTable._oColumnHeaderMenu, "openBy");

		oTable.setP13nMode([
			"Sort"
		]);
		oTable.setEnableColumnResize(false);

		assert.ok(oTable._oColumnHeaderMenu, "The ColumnMenu is initialized");
		assert.ok(oTable._oColumnHeaderMenu.isA("sap.m.table.columnmenu.Menu"), "The ColumnMenu is instance of the correct class");
		assert.equal(FESRHelper.getSemanticStepname(oTable._oColumnHeaderMenu, "beforeOpen"), "mdc:tbl:p13n:col", "Correct FESR StepName");
		assert.ok(oTable._oQuickActionContainer, "The QuickActionContainer is initialized");
		assert.ok(oTable._oQuickActionContainer.isA("sap.m.table.columnmenu.QuickActionContainer"),
			"The QuickActionContainer is instance of the correct class");
		assert.ok(oTable._oItemContainer, "The ItemContainer is initialized");
		assert.ok(oTable._oItemContainer.isA("sap.m.table.columnmenu.ItemContainer"),
			"The Item Container is instance of the correct class");
		assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 0, "The ColumnMenu contains no quick actions");
		assert.equal(oTable._oItemContainer.getEffectiveItems().length, 0, "The ColumnMenu contains no items");
		assert.ok(!oTable._oColumnHeaderMenu._oPopover, "The popover is not initialized");

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 1, "The ColumnMenu contains quick actions");
			assert.equal(oTable._oItemContainer.getEffectiveItems().length, 1, "The ColumnMenu contains items");
			assert.ok(oOpenSpy.calledWithExactly(oTable.getColumns()[0].getInnerColumn(), true), "openBy is called once with the correct parameters");
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
				columns: [
					new Column({
						header: "test",
						propertyKey: "test",
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

			TableQUnitUtils.stubPropertyInfos(this.oTable, [{
				name: "test",
				label: "Test",
				path: "test",
				sortable: true,
				groupable: true
			}]);

			return this.oTable.initialized().then(function() {
				this.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			TableQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Responsive table - Sort", function(assert) {
		var oTable = this.oTable;

		oTable.setType("ResponsiveTable");
		oTable.setP13nMode([
			"Sort"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickSort"), "The QuickActionContainer contains a QuickSort");

			var fSortSpy = sinon.spy(PersonalizationUtils, "createSortChange");
			var aSortItemContent =  oQuickAction.getItems()[0]._getAction().getContent();

			aSortItemContent[0].firePress();
			assert.ok(fSortSpy.calledOnce, "createSortChange is called");
			assert.ok(fSortSpy.calledWithExactly(oTable, {
				property: "test",
				sortOrder: "None"
			}), "createSortChange is called with the correct parameters");

			fSortSpy.restore();
		});
	});

	QUnit.test("Responsive table - Resize on touch devices", function(assert) {
		var oTable = this.oTable;

		sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
		oTable.setType("ResponsiveTable");

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
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
		var oTable = this.oTable;

		oTable.setP13nMode([
			"Group"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			var oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickGroup"), "The QuickActionContainer contains a QuickGroup");

			var fGroupSpy = sinon.spy(PersonalizationUtils, "createGroupChange");
			var aGroupItemContent =  oQuickAction.getContent();

			aGroupItemContent[0].firePress();
			assert.ok(fGroupSpy.calledOnce, "createGroupChange is called");
			assert.ok(fGroupSpy.calledWithExactly(oTable, {
				property: "test"
			}), "createGroupChange is called with the correct parameters");

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

		oTable.setP13nMode([
			"Sort", "Group"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
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
				p13nMode: ["Sort", "Filter", "Group", "Column"],
				columns: [
					new Column({
						header: "test",
						propertyKey: "test",
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

			TableQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "test",
					label: "Test",
					path: "test",
					groupable: true
				}
			]);

			return this.oTable.initialized().then(function() {
				this.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			TableQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Initialize Items", function(assert) {
		var oTable = this.oTable, oMenu, oItemBaseDestroySpy = sinon.spy(ItemBase.prototype, "destroyAggregation");

		function checkItems(aItems) {
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
		}

		oTable.getSupportedP13nModes = function() {
			return ["Sort", "Filter", "Group", "Column"];
		};

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			checkItems(oTable._oItemContainer.getItems());
			assert.ok(oItemBaseDestroySpy.notCalled);

			oMenu = oTable._oTable.getColumns()[0].getHeaderMenuInstance();
			oMenu.close();
			return wait(1000);
		}).then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			assert.ok(oItemBaseDestroySpy.calledThrice); // the content of the sort, group and column items are destroyed, the content of the filter item is not
			assert.ok(oItemBaseDestroySpy.alwaysCalledWith("content"));
			checkItems(oTable._oItemContainer.getItems());

			oTable._getP13nButton().firePress();
			return wait(1000);
		}).then(function() {
			assert.notOk(oTable._oP13nFilter.getProperty("_useFixedWidth"), "in the P13nDialog the FilterPanel doesn't get a fixed width");
		});
	});

	QUnit.test("Item", function(assert) {
		var oTable = this.oTable,
			fUpdateSpy,
			fHandleP13nSpy,
			fResetSpy,
			fUpdateQuickActionsSpy;

		oTable.setP13nMode([
			"Sort"
		]);
		oTable.getSupportedP13nModes = function() {
			return ["Sort"];
		};

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
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
			return Promise.resolve();
		});
	});
});