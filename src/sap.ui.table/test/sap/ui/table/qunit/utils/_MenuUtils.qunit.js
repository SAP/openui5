/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Popup",
	"sap/ui/core/Core",
	"sap/ui/table/qunit/TableQUnitUtils" // implicitly used via globals (e.g. createTables)
], function(
	TableUtils,
	MenuUnified,
	MenuItemUnified,
	MenuM,
	MenuItemM,
	Device,
	Control,
	Popup,
	oCore
) {
	"use strict";

	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var initRowActions = window.initRowActions;
	var iNumberOfRows = window.iNumberOfRows;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;
	var TestContextMenu = Control.extend("sap.ui.table.test.ContextMenu", {
		metadata: {
			interfaces: ["sap.ui.core.IContextMenu"]
		},
		constructor: function() {
			Control.apply(this, arguments);
			this.openAsContextMenu = sinon.spy();
		}
	});

	function createFakeEventObject(oTarget) {
		return {target: oTarget};
	}

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Menu, "MenuUtils namespace available");
		assert.ok(TableUtils.Menu.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Context Menus", {
		before: function() {
			this.oUtilsOpenContentCellContextMenu = sinon.spy(TableUtils.Menu, "_openContentCellContextMenu");

			var oBeforeOpenContextMenuEventInfo = {
				name: "BeforeOpenContextMenu",
				lastCallParameters: null,
				handler: sinon.spy(function(oEvent) {
					oBeforeOpenContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
			this.oBeforeOpenContextMenuEventInfo = oBeforeOpenContextMenuEventInfo;
		},
		beforeEach: function() {
			createTables();
			initRowActions(oTable, 1, 1);
			oTable.attachBeforeOpenContextMenu(this.oBeforeOpenContextMenuEventInfo.handler);
		},
		afterEach: function() {
			destroyTables();
			this.resetSpies();
		},
		after: function() {
			this.oUtilsOpenContentCellContextMenu.restore();
		},
		resetSpies: function() {
			[
				this.oBeforeOpenContextMenuEventInfo.handler,
				this.oUtilsOpenContentCellContextMenu
			]
				.forEach(function(oSpy) {
					oSpy.resetHistory();
				});
		},
		assertEventCalled: function(assert, oEventInfo, bCalled, mExpectedParameters) {
			if (bCalled) {
				assert.ok(oEventInfo.handler.calledOnce, oEventInfo.name + ": The event handler has been called");
				assert.deepEqual(oEventInfo.lastCallParameters, Object.assign({id: oTable.getId()}, mExpectedParameters),
					oEventInfo.name + ": The event object contains the correct parameters");
			} else {
				assert.ok(oEventInfo.handler.notCalled, oEventInfo.name + ": The event handler has not been called");
			}

			oEventInfo.handler.resetHistory();
			oEventInfo.lastCallParameters = null;
		},
		assertNoEventsCalled: function(assert) {
			this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		},
		assertDefaultContentCellContextMenuExists: function(assert, bExists) {
			if (bExists) {
				assert.notEqual(oTable._oCellContextMenu, undefined, "The content cell context menu does exist");
			} else {
				assert.equal(oTable._oCellContextMenu, undefined, "The content cell context menu does not exist");
			}
		}
	});

	QUnit.test("openContextMenu - Elements that do not support context menus", function(assert) {
		var test = function() {
			assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
			this.assertNoEventsCalled(assert);
			this.resetSpies();
		}.bind(this);

		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, createFakeEventObject(getSelectAll()[0])), false, "Returned false");
		test();

		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, createFakeEventObject(document.getElementsByTagName("body").item(0))), false,
			"Returned false");
		test();
	});

	QUnit.test("openContextMenu - Content cells", function(assert) {
		var oDomRef;
		var aRows = oTable.getRows();
		var oCellA = aRows[0].getCells()[0];
		var oCellB = aRows[0].getCells()[1];
		var oCustomContextMenu = new MenuM({
			items: [
				new MenuItemM({text: "ContextMenuItem"})
			]
		});
		var oFakeEventObject;

		oDomRef = oCellA.getDomRef();
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), false, "Returned false");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0], oFakeEventObject),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: null
		});
		this.resetSpies();

		oTable.setContextMenu(oCustomContextMenu);
		oDomRef = oCellB.getDomRef();
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), true, "Returned true");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0], oFakeEventObject),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 1,
			contextMenu: oCustomContextMenu
		});
		this.resetSpies();

		oTable.attachEventOnce("cellContextmenu", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oCellA.getDomRef();
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), true, "Returned true");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oCellA.getDomRef();
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), true, "Returned true");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oCustomContextMenu
		});
		this.resetSpies();

		oDomRef = getRowHeader(0)[0];
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), true, "Returned false");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, oDomRef, oFakeEventObject),
			"_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: oCustomContextMenu
		});
		this.resetSpies();

		oTable.setContextMenu(null);
		oDomRef = getRowAction(0)[0];
		oFakeEventObject = createFakeEventObject(oDomRef);
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oFakeEventObject), false, "Returned false");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, oDomRef, oFakeEventObject),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: null
		});
	});

	QUnit.test("_openContentCellContextMenu", function(assert) {
		var oCell;
		var oFakeEventObject;
		var oOpenCustomContentCellContextMenu = this.spy(TableUtils.Menu, "_openCustomContentCellContextMenu");
		var oOpenDefaultContentCellContextMenu = this.spy(TableUtils.Menu, "_openDefaultContentCellContextMenu");
		var that = this;

		function resetSpies() {
			that.resetSpies();
			oOpenCustomContentCellContextMenu.resetHistory();
			oOpenDefaultContentCellContextMenu.resetHistory();
		}

		oTable.getRowMode().setRowCount(iNumberOfRows + 1);
		oCore.applyChanges();
		oCell = getCell(iNumberOfRows, 0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getCell(0, 0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openDefaultContentCellContextMenu was called");
		resetSpies();

		oCell = getRowHeader(0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openDefaultContentCellContextMenu was called");
		resetSpies();

		oCell = getRowAction(0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openDefaultContentCellContextMenu was called");
		resetSpies();

		oTable.setContextMenu(new MenuM({
			items: [
				new MenuItemM({text: "ContextMenuItem"})
			]
		}));

		oCell = getCell(0, 0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getRowHeader(0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getRowAction(0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");

		oOpenCustomContentCellContextMenu.restore();
		oOpenDefaultContentCellContextMenu.restore();
	});

	QUnit.test("_openCustomContentCellContextMenu", function(assert) {
		var that = this;

		function test(sModelName, oCell) {
			var oEvent = createFakeEventObject(oCell);
			var oMenu = new TestContextMenu();
			var oRowBindingContext = oTable.getRows()[0].getBindingContext(sModelName);

			oTable.setContextMenu(oMenu);
			oTable.attachEventOnce("beforeOpenContextMenu", function() {
				assert.ok(oTable.getContextMenu().getBindingContext(sModelName) === oRowBindingContext,
					"The binding context is correct in the beforeOpenContextMenu event (Model: " + sModelName + ")");
			});

			// "openContextMenu" is called instead of "_openCustomContentCellContextMenu", because we need to check the event parameters.
			assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oEvent), true, "Returned true");
			assert.ok(oMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oCell), "#openAsContextMenu called with correct args");
			assert.ok(oMenu.getBindingContext(sModelName) === oRowBindingContext,
				"The binding context is correct after opening the context menu (Model: " + sModelName + ")");

			that.resetSpies();
			oMenu.destroy();
		}

		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		test(undefined, getCell(0, 0)[0]);

		var oBindingInfo = oTable.getBindingInfo("rows");
		var sModelName = "myModel";

		oBindingInfo.path = sModelName + ">" + oBindingInfo.path;
		oTable.setModel(oTable.getModel(), sModelName);
		oTable.bindRows(oBindingInfo);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			test(sModelName, getCell(0, 0)[0]);

			var oMenu = new TestContextMenu();
			oTable.setContextMenu(oMenu);

			return fakeGroupRow(0).then(function() {
				var oCellInGroupRow = getCell(0, 0)[0];
				that.resetSpies();
				assert.strictEqual(TableUtils.Menu._openCustomContentCellContextMenu(
					oTable, oCellInGroupRow, createFakeEventObject(oCellInGroupRow)
				), false, "Returned false");
				assert.ok(oMenu.openAsContextMenu.notCalled, "#openAsContextMenu was not called");
				that.resetSpies();
				oMenu.openAsContextMenu.resetHistory();

				return fakeSumRow(1);
			}).then(function() {
				var oCellInSumRow = getCell(1, 0)[0];
				that.resetSpies();
				assert.strictEqual(TableUtils.Menu._openCustomContentCellContextMenu(
					oTable, oCellInSumRow, createFakeEventObject(oCellInSumRow)
				), false, "Returned false");
				assert.ok(oMenu.openAsContextMenu.notCalled, "#openAsContextMenu was not called");
			});
		});
	});

	QUnit.test("_openDefaultContentCellContextMenu", function(assert) {
		var aColumns = oTable.getColumns();
		var oColumn = aColumns[0];
		var oCell;
		var oFakeEventObject;

		oCell = getCell(0, 0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), false,
			"Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);

		oTable.setEnableCellFilter(true);
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), false,
			"Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);

		oColumn.setFilterProperty("A");
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), true,
			"Returned true");
		this.assertDefaultContentCellContextMenuExists(assert, true);

		var oContentCellContextMenu = oTable._oCellContextMenu;
		var fnOpenAsContextMenu = this.spy(oContentCellContextMenu, "openAsContextMenu");

		oCell = getRowHeader(0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), false,
			"Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		fnOpenAsContextMenu.resetHistory();

		oCell = getRowAction(0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), false,
			"Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		fnOpenAsContextMenu.resetHistory();

		oCell = getCell(0, 0)[0];
		oFakeEventObject = createFakeEventObject(oCell);
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oContentCellContextMenu, oTable._oCellContextMenu, "The cell content context menu was reused");
		assert.ok(fnOpenAsContextMenu.calledOnceWithExactly(oFakeEventObject, oCell), "#openAsContextMenu was called");
		fnOpenAsContextMenu.resetHistory();

		return fakeGroupRow(0).then(() => {
			oCell = getCell(0, 0)[0];
			assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), false,
				"Returned false");
			assert.ok(oContentCellContextMenu, oTable._oCellContextMenu, "The cell content context menu still exists");
			assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		});
	});

	QUnit.test("Cell filter menu item", function(assert) {
		var oColumn = oTable.getColumns()[0];
		var oCell;

		oTable.setEnableCellFilter(true);
		oColumn.setFilterProperty("A");

		oCell = getCell(0, 0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell)), true,
			"Returned true");

		var oFilter = this.spy(oTable, "filter");
		oTable._oCellContextMenu.getItems()[0].fireSelect();

		assert.ok(oFilter.calledOnce, "The filter function has been called");

		var mActualColumnArgument = oFilter.args[0][0];
		assert.deepEqual(mActualColumnArgument, oColumn,
			"The CustomFilter event handler has been called with the correct column argument");

		var sActualFilterValueArgument = oFilter.args[0][1];
		var oRowContext = oTable.getContextByIndex(0);
		var sFilterProperty = oColumn.getFilterProperty();
		var sExpectedFilterValueArgument = oRowContext.getProperty(sFilterProperty);
		assert.strictEqual(sActualFilterValueArgument, sExpectedFilterValueArgument,
			"The CustomFilter event handler has been called with the correct filter value argument");

		// CustomFilter
		var oCustomFilterEvent = this.spy(oTable, "fireCustomFilter");
		oTable.setEnableCustomFilter(true);
		oTable._oCellContextMenu.getItems()[0].fireSelect();

		assert.ok(oCustomFilterEvent.calledOnce, "The CustomFilter event handler has been called");

		var mExpectedArguments = {
			column: oColumn,
			value: sExpectedFilterValueArgument,
			id: oTable.getId()
		};
		var mActualArguments = oCustomFilterEvent.args[0][0];
		assert.deepEqual(mActualArguments, mExpectedArguments,
			"The CustomFilter event handler has been called with the correct arguments");
	});

	QUnit.test("closeContentCellContextMenu", function(assert) {
		var oCloseCustomContentCellContextMenu = this.spy(TableUtils.Menu, "_closeCustomContentCellContextMenu");
		var oCloseDefaultContentCellContextMenu = this.spy(TableUtils.Menu, "_closeDefaultContentCellContextMenu");

		TableUtils.Menu.closeContentCellContextMenu(oTable);
		assert.ok(oCloseCustomContentCellContextMenu.calledOnceWithExactly(oTable), "_closeCustomContentCellContextMenu was called");
		assert.ok(oCloseDefaultContentCellContextMenu.calledOnceWithExactly(oTable), "_closeDefaultContentCellContextMenu was called");

		oCloseCustomContentCellContextMenu.restore();
		oCloseDefaultContentCellContextMenu.restore();
	});

	QUnit.test("_closeCustomContentCellContextMenu", function(assert) {
		TableUtils.Menu._closeCustomContentCellContextMenu(oTable);
		assert.ok(true, "Does not throw an error if there is no context menu");

		oTable.setContextMenu(new TestContextMenu());
		TableUtils.Menu._closeCustomContentCellContextMenu(oTable);
		assert.ok(true, "Does not throw an error if the context menu does not implement #close");

		oTable.destroyContextMenu();
		oTable.setContextMenu(new MenuUnified({
			items: [
				new MenuItemUnified({text: "ContextMenuItem"})
			]
		}));
		this.spy(oTable.getContextMenu(), "close");
		TableUtils.Menu._closeCustomContentCellContextMenu(oTable);
		assert.ok(oTable.getContextMenu().close.calledOnce, "#close was called");
	});

	QUnit.test("_closeDefaultContentCellContextMenu", function(assert) {
		TableUtils.Menu._closeDefaultContentCellContextMenu(oTable);
		assert.ok(true, "Does not throw an error if there is no context menu");

		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		// Creates the default context menu instance.
		var oCell = getCell(0, 0)[0];
		TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell));

		var oCloseMenuSpy = this.spy(oTable._oCellContextMenu, "close");

		TableUtils.Menu._closeDefaultContentCellContextMenu(oTable);
		assert.ok(oCloseMenuSpy.calledOnce, "#close was called");
	});

	QUnit.test("cleanupDefaultContentCellContextMenu", function(assert) {
		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		TableUtils.Menu.cleanupDefaultContentCellContextMenu(oTable);
		assert.ok(true, "Does not throw if the default cell context menu does not exist");

		// Creates the default context menu instance.
		var oCell = getCell(0, 0)[0];
		TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, createFakeEventObject(oCell));

		var oDestroyMenu = this.spy(oTable._oCellContextMenu, "destroy");

		TableUtils.Menu.cleanupDefaultContentCellContextMenu();
		this.assertDefaultContentCellContextMenuExists(assert, true);
		TableUtils.Menu.cleanupDefaultContentCellContextMenu(oTable);
		this.assertDefaultContentCellContextMenuExists(assert, false);
		assert.ok(oDestroyMenu.calledOnce, "#destroy was called");
	});
});