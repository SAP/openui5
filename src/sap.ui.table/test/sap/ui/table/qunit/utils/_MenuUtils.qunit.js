/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/Device",
	"sap/ui/core/Popup"
], function(TableUtils, TableQUnitUtils, qutils, MenuUnified, MenuItemUnified, MenuM, MenuItemM, Device, Popup) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var initRowActions = window.initRowActions;
	var iNumberOfRows = window.iNumberOfRows;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	//************************************************************************
	// Test Code
	//************************************************************************

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
			this.oUtilsOpenColumnContextMenu = sinon.spy(TableUtils.Menu, "_openColumnContextMenu");
			this.oUtilsCloseColumnContextMenu = sinon.spy(TableUtils.Menu, "_closeColumnContextMenu");
			this.oUtilsApplyColumnHeaderCellMenu = sinon.spy(TableUtils.Menu, "_applyColumnHeaderCellMenu");
			this.oUtilsRemoveColumnHeaderCellMenu = sinon.spy(TableUtils.Menu, "_removeColumnHeaderCellMenu");
			this.oUtilsOpenContentCellContextMenu = sinon.spy(TableUtils.Menu, "_openContentCellContextMenu");

			var oColumnSelectEventInfo = {
				name: "ColumnSelect",
				lastCallParameters: null,
				handler: sinon.spy(function(oEvent) {
					oColumnSelectEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
			this.oColumnSelectEventInfo = oColumnSelectEventInfo;

			var oCellContextMenuEventInfo = {
				name: "CellContextMenu",
				lastCallParameters: null,
				handler: sinon.spy(function(oEvent) {
					oCellContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
			this.oCellContextMenuEventInfo = oCellContextMenuEventInfo;

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
			oTable.attachColumnSelect(this.oColumnSelectEventInfo.handler);
			oTable.attachCellContextmenu(this.oCellContextMenuEventInfo.handler);
			oTable.attachBeforeOpenContextMenu(this.oBeforeOpenContextMenuEventInfo.handler);
		},
		afterEach: function() {
			destroyTables();
			this.resetSpies();
		},
		after: function() {
			this.oUtilsOpenColumnContextMenu.restore();
			this.oUtilsCloseColumnContextMenu.restore();
			this.oUtilsApplyColumnHeaderCellMenu.restore();
			this.oUtilsRemoveColumnHeaderCellMenu.restore();
			this.oUtilsOpenContentCellContextMenu.restore();
		},
		resetSpies: function() {
			[
				this.oColumnSelectEventInfo.handler,
				this.oCellContextMenuEventInfo.handler,
				this.oBeforeOpenContextMenuEventInfo.handler,
				this.oUtilsOpenColumnContextMenu,
				this.oUtilsCloseColumnContextMenu,
				this.oUtilsApplyColumnHeaderCellMenu,
				this.oUtilsRemoveColumnHeaderCellMenu,
				this.oUtilsOpenContentCellContextMenu
			]
				.forEach(function(oSpy) {
					oSpy.reset();
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

			oEventInfo.handler.reset();
			oEventInfo.lastCallParameters = null;
		},
		assertNoEventsCalled: function(assert) {
			this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
			this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
			this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		},
		assertAllColumnContextMenusClosed: function(assert) {
			oTable.getColumns().forEach(function(oColumn) {
				this.assertColumnContextMenuOpen(assert, oColumn, false);
			}.bind(this));
		},
		assertColumnContextMenuOpen: function(assert, oColumn, bOpen) {
			var oMenu = oColumn.getAggregation("menu");
			var bMenuOpen = oMenu.bOpen;
			assert.strictEqual(bMenuOpen, bOpen,
				"The column context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (oColumn.getIndex() + 1) + ")");
		},
		assertNoColumnContextMenusExist: function(assert) {
			oTable.getColumns().forEach(function(oColumn) {
				this.assertColumnContextMenuExists(assert, oColumn, false);
			}.bind(this));
		},
		assertColumnContextMenuExists: function(assert, oColumn, bExists) {
			assert.strictEqual(oColumn.getAggregation("menu"), null,
				"The column menu does" + (bExists ? " " : " not ") + "exist (Column: " + (oColumn.getIndex() + 1) + ")");
		},
		assertNoColumnHeaderCellMenusExist: function(assert) {
			oTable.getColumns().forEach(function(oColumn) {
				this.assertColumnHeaderCellMenuExists(assert, oColumn, false);
			}.bind(this));
		},
		assertColumnHeaderCellMenuExists: function(assert, oColumn, bExists) {
			var $Column = oColumn.$();
			var bCellExists = $Column.find(".sapUiTableCellInner").is(":hidden");
			assert.strictEqual(bExists, bCellExists,
				"The cell is" + (bExists ? " not " : " ") + "visible (Column: " + (oColumn.getIndex() + 1) + ")");

			var bCellMenuExists = $Column.find(".sapUiTableCellTouchMenu").length > 0;
			assert.strictEqual(bExists, bCellMenuExists,
				"The cell menu does" + (bExists ? " " : " not ") + "exist (Column: " + (oColumn.getIndex() + 1) + ")");
		},
		assertColumnHeaderCellMenuButtonExists: function(assert, oColumn, bExists) {
			var $Column = oColumn.$();
			var bContextMenuButtonExists = $Column.find(".sapUiTableCellTouchMenu > .sapUiTableColDropDown").length > 0;
			assert.strictEqual(bExists, bContextMenuButtonExists,
				"The context menu button does" + (bExists ? " " : " not ") + "exist (Column: " + (oColumn.getIndex() + 1) + ")");
		},
		assertColumnHeaderCellResizeButtonExists: function(assert, oColumn, bExists) {
			var $Column = oColumn.$();
			var bResizeButtonExists = $Column.find(".sapUiTableCellTouchMenu > .sapUiTableColResizer").length > 0;
			assert.strictEqual(bExists, bResizeButtonExists,
				"The resize button does" + (bExists ? " " : " not ") + "exist (Column: " + oColumn.getIndex() + ")");
		},
		assertContentCellContextMenuOpen: function(assert, iRowIndex, iColumnIndex, bOpen) {
			var bMenuOpen = oTable._oCellContextMenu && oTable._oCellContextMenu.bOpen;
			var oCellElement = TableUtils.getCell(oTable, oTable.getRows()[iRowIndex].getCells()[iColumnIndex].getDomRef())[0];
			var bMenuOpenAtSpecifiedCell = bMenuOpen && oTable._oCellContextMenu.oOpenerRef === oCellElement;
			assert.strictEqual(bMenuOpenAtSpecifiedCell, bOpen,
				"The data cell context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (iColumnIndex + 1)
				+ ", Row: " + (iRowIndex + 1) + ")");
		},
		assertDefaultContentCellContextMenuExists: function(assert, bExists) {
			if (bExists) {
				assert.notEqual(oTable._oCellContextMenu, undefined, "The content cell context menu does exist");
			} else {
				assert.equal(oTable._oCellContextMenu, undefined, "The content cell context menu does not exist");
			}
		},
		assertCustomContextMenuOpen: function(assert, bOpen) {
			var oMenu = oTable.getContextMenu();
			var bMenuOpen = oMenu.bOpen === true;
			assert.strictEqual(bMenuOpen, bOpen, "The custom context menu is" + (bOpen ? " " : " not ") + "open");
		},
		assertFirstMenuItemHovered: function(assert, oMenu) {
			assert.strictEqual(oMenu.oHoveredItem, oMenu.getItems()[0], "The first item in the menu is hovered");
		}
	});

	QUnit.test("openContextMenu - Elements that do not support context menus", function(assert) {
		var test = function() {
			assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
			assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
			assert.ok(this.oUtilsRemoveColumnHeaderCellMenu.notCalled, "_removeColumnHeaderCellMenu was not called");
			assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
			this.assertNoEventsCalled(assert);
			this.resetSpies();
		}.bind(this);

		assert.strictEqual(TableUtils.Menu.openContextMenu(), false, "Returned false");
		test();

		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable), false, "Returned false");
		test();

		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, getSelectAll()), false, "Returned false");
		test();

		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, document.getElementsByTagName("body").item(0)), false,
			"Returned false");
		test();
	});

	QUnit.test("openContextMenu - Header cells", function(assert) {
		var oDomRef;
		var oColumnA = oTable.getColumns()[0];
		var oColumnB = oTable.getColumns()[1];
		var bOriginalDeviceSystemDesktop = Device.system.desktop;

		Device.system.desktop = true;
		oColumnA.setFilterProperty("A");
		oColumnB.setFilterProperty("A");

		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_openColumnContextMenu was called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnA
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		oDomRef = oColumnB.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_openColumnContextMenu was called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnB
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		// Prevent the default action. The context menu should not be opened.
		oTable.attachEventOnce("columnSelect", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnA
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		// Make the first column invisible and open the menu of column 2 (which is not the first visible column).
		oColumnA.setVisible(false);
		sap.ui.getCore().applyChanges();

		oDomRef = oColumnB.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_openColumnContextMenu was called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnB
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		oColumnA.setVisible(true);
		sap.ui.getCore().applyChanges();

		Device.system.desktop = false;

		oDomRef = oColumnB.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_applyColumnHeaderCellMenu was called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertNoEventsCalled(assert);
		this.resetSpies();

		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_applyColumnHeaderCellMenu was called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertNoEventsCalled(assert);
		this.resetSpies();

		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0]),
			"_openColumnContextMenu was called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsRemoveColumnHeaderCellMenu.calledOnceWithExactly(oTable),
			"_removeColumnHeaderCellMenu was called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnA
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		this.resetSpies();
		oTable.attachEventOnce("columnSelect", function(oEvent) {
			oEvent.preventDefault();
		});
		oDomRef = oColumnA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsRemoveColumnHeaderCellMenu.calledOnceWithExactly(oTable),
			"_removeColumnHeaderCellMenu was called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, true, {
			column: oColumnA
		});
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);

		Device.system.desktop = bOriginalDeviceSystemDesktop;
	});

	QUnit.test("openContextMenu - Content cells", function(assert) {
		var oDomRef;
		var aColumns = oTable.getColumns();
		var aRows = oTable.getRows();
		var oColumnA = aColumns[0];
		var oCellA = aRows[0].getCells()[0];
		var oColumnB = aColumns[1];
		var oCellB = aRows[0].getCells()[1];
		var oCustomContextMenu = new MenuM({
			items: [
				new MenuItemM({text: "ContextMenuItem"})
			]
		});
		var oFakeEventObject = {};

		oDomRef = oCellA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), false, "Returned false");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0], undefined),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: null
		});
		this.resetSpies();

		oTable.setContextMenu(oCustomContextMenu);
		oDomRef = oCellB.getDomRef();
		oFakeEventObject.target = oDomRef;
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oCellB.$(), oFakeEventObject), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, TableUtils.getCell(oTable, oDomRef)[0], oFakeEventObject),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 1,
			columnId: oColumnB.getId(),
			cellControl: oCellB,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
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
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, false);
		this.resetSpies();

		oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oCellA.getDomRef();
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.notCalled, "_openContentCellContextMenu was not called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oCustomContextMenu
		});
		this.resetSpies();

		oDomRef = getRowHeader(0)[0];
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef), true, "Returned true");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, oDomRef, undefined),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: oCustomContextMenu
		});
		this.resetSpies();

		oTable.setContextMenu(null);
		oDomRef = getRowAction(0)[0];
		oFakeEventObject.target = oDomRef;
		assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oDomRef, oFakeEventObject), false, "Returned false");
		assert.ok(this.oUtilsOpenColumnContextMenu.notCalled, "_openColumnContextMenu was not called");
		assert.ok(this.oUtilsApplyColumnHeaderCellMenu.notCalled, "_applyColumnHeaderCellMenu was not called");
		assert.ok(this.oUtilsOpenContentCellContextMenu.calledOnceWithExactly(oTable, oDomRef, oFakeEventObject),
			"_openContentCellContextMenu was called");
		this.assertEventCalled(assert, this.oColumnSelectEventInfo, false);
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
		this.assertEventCalled(assert, this.oBeforeOpenContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: null
		});
	});

	QUnit.test("_openColumnContextMenu", function(assert) {
		var aColumns = oTable.getColumns();
		var aColumnOpenMenuSpies = aColumns.map(function(oColumn) {
			return this.spy(oColumn, "_openMenu");
		}.bind(this));
		var that = this;
		var oCloseContentCellContextMenu = this.spy(TableUtils.Menu, "_closeContentCellContextMenu");

		function assertColumnOpenMenuSpiesCalled(iIndexOfCalledSpy, oCellArgument) {
			aColumns.forEach(function(oColumn, iIndex) {
				var oSpy = aColumnOpenMenuSpies[iIndex];

				if (iIndex === iIndexOfCalledSpy) {
					assert.ok(oSpy.calledOnceWithExactly(oCellArgument),
						"Column._openMenu was called for column " + (iIndex + 1));
				} else {
					assert.ok(oSpy.notCalled, "Column._openMenu was not called for column " + (iIndex + 1));
				}
			});
		}

		function assertCloseColumnContextMenuSpiesCalled(iIndexOfUncalledSpy) {
			aColumns.forEach(function(oColumn, iIndex) {
				if (iIndex === iIndexOfUncalledSpy) {
					assert.ok(that.oUtilsCloseColumnContextMenu.withArgs(oTable, iIndex).notCalled,
						"_closeColumnContextMenu was not called for column " + (iIndex + 1));
				} else {
					assert.ok(that.oUtilsCloseColumnContextMenu.withArgs(oTable, iIndex).calledOnce,
						"_closeColumnContextMenu was called for column " + (iIndex + 1));
				}
			});
		}

		function resetSpies() {
			that.resetSpies();
			aColumnOpenMenuSpies.forEach(function(oSpy) {
				oSpy.reset();
			});
			oCloseContentCellContextMenu.reset();
		}

		aColumns[1].setHeaderSpan(2);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(TableUtils.Menu._openColumnContextMenu(oTable, aColumns[1].getDomRef()), false, "Returned false");
		assertCloseColumnContextMenuSpiesCalled(1);
		assert.ok(oCloseContentCellContextMenu.calledOnceWithExactly(oTable), "_closeContentCellContextMenu was called");
		assertColumnOpenMenuSpiesCalled();
		aColumns[1].setHeaderSpan();
		sap.ui.getCore().applyChanges();
		resetSpies();

		assert.strictEqual(TableUtils.Menu._openColumnContextMenu(oTable, getColumnHeader(0)[0]), false, "Returned false");
		assertCloseColumnContextMenuSpiesCalled(0);
		assert.ok(oCloseContentCellContextMenu.calledOnceWithExactly(oTable), "_closeContentCellContextMenu was called");
		assertColumnOpenMenuSpiesCalled(0, getColumnHeader(0)[0]);

		oCloseContentCellContextMenu.restore();
	});

	QUnit.test("_closeColumnContextMenu", function(assert) {
		var aColumns = oTable.getColumns();
		var aColumnCloseMenuSpies = aColumns.map(function(oColumn) {
			return this.spy(oColumn, "_closeMenu");
		}.bind(this));

		function assertColumnCloseMenuSpiesCalled(iIndexOfCalledSpy) {
			aColumns.forEach(function(oColumn, iIndex) {
				var oSpy = aColumnCloseMenuSpies[iIndex];

				if (iIndex === iIndexOfCalledSpy) {
					assert.ok(oSpy.calledOnceWithExactly(),
						"Column._closeMenu was called for column " + (iIndex + 1));
				} else {
					assert.ok(oSpy.notCalled, "Column._closeMenu was not called for column " + (iIndex + 1));
				}
			});
		}

		TableUtils.Menu._closeColumnContextMenu(oTable, 1);
		assertColumnCloseMenuSpiesCalled(1);
	});

	QUnit.test("_openContentCellContextMenu", function(assert) {
		var oCell;
		var oFakeEventObject = {};
		var oOpenCustomContentCellContextMenu = this.spy(TableUtils.Menu, "_openCustomContentCellContextMenu");
		var oOpenDefaultContentCellContextMenu = this.spy(TableUtils.Menu, "_openDefaultContentCellContextMenu");
		var that = this;

		function resetSpies() {
			that.resetSpies();
			oOpenCustomContentCellContextMenu.reset();
			oOpenDefaultContentCellContextMenu.reset();
		}

		oTable.setVisibleRowCount(iNumberOfRows + 1);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, getCell(iNumberOfRows, 0)[0]), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getCell(0, 0)[0];
		oFakeEventObject.target = oCell;
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openDefaultContentCellContextMenu was called");
		resetSpies();

		oCell = getRowHeader(0)[0];
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell), false, "Returned false");
		assert.ok(oOpenCustomContentCellContextMenu.notCalled, "_openCustomContentCellContextMenu was not called");
		assert.ok(oOpenDefaultContentCellContextMenu.calledOnceWithExactly(oTable, oCell, undefined),
			"_openDefaultContentCellContextMenu was called");
		resetSpies();

		oCell = getRowAction(0)[0];
		oFakeEventObject.target = oCell;
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
		oFakeEventObject.target = oCell;
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getRowHeader(0)[0];
		oFakeEventObject.target = oCell;
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, oFakeEventObject),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");
		resetSpies();

		oCell = getRowAction(0)[0];
		assert.strictEqual(TableUtils.Menu._openContentCellContextMenu(oTable, oCell), true, "Returned true");
		assert.ok(oOpenCustomContentCellContextMenu.calledOnceWithExactly(oTable, oCell, undefined),
			"_openCustomContentCellContextMenu was called");
		assert.ok(oOpenDefaultContentCellContextMenu.notCalled, "_openDefaultContentCellContextMenu was not called");

		oOpenCustomContentCellContextMenu.restore();
		oOpenDefaultContentCellContextMenu.restore();
	});

	QUnit.test("_openCustomContentCellContextMenu", function(assert) {
		var oCell = getCell(0, 0)[0];
		var oCloseDefaultContentCellContextMenu = this.spy(TableUtils.Menu, "_closeDefaultContentCellContextMenu");
		var that = this;

		function createMenuM() {
			return new MenuM({
				items: [
					new MenuItemM({text: "ContextMenuItem"})
				]
			});
		}

		function createMenuUnified() {
			return new MenuUnified({
				items: [
					new MenuItemUnified({text: "ContextMenuItem"})
				]
			});
		}

		function assertCloseMenuSpiesCalled() {
			oTable.getColumns().forEach(function(oColumn, iIndex) {
				assert.ok(that.oUtilsCloseColumnContextMenu.withArgs(oTable, iIndex).calledOnce,
					"_closeColumnContextMenu was called for column " + (iIndex + 1));
			});
			assert.ok(oCloseDefaultContentCellContextMenu.calledOnceWithExactly(oTable), "_closeDefaultContentCellContextMenu was called");
		}

		function assertCloseMenuSpiesNotCalled() {
			oTable.getColumns().forEach(function(oColumn, iIndex) {
				assert.ok(that.oUtilsCloseColumnContextMenu.notCalled,
					"_closeColumnContextMenu was not called for column " + (iIndex + 1));
			});
			assert.ok(oCloseDefaultContentCellContextMenu.notCalled, "_closeDefaultContentCellContextMenu was not called");
		}

		function resetSpies() {
			that.resetSpies();
			oCloseDefaultContentCellContextMenu.reset();
		}

		function test(fnCreateMenu, sModelName, oEvent) {
			var oMenu = fnCreateMenu();
			var oRowBindingContext = oTable.getRows()[0].getBindingContext(sModelName);
			var fnOpenAsContextMenu = that.spy(oMenu, "openAsContextMenu");
			var fnOpen = that.spy(oMenu, oMenu.openBy ? "openBy" : "open");

			oTable.setContextMenu(oMenu);
			oTable.attachEventOnce("beforeOpenContextMenu", function() {
				assert.ok(oTable.getContextMenu().getBindingContext(sModelName) === oRowBindingContext,
					"The binding context is correct in the beforeOpenContextMenu event (Model: " + sModelName + ")");
			});

			// "openContextMenu" is called instead of "_openCustomContentCellContextMenu", because we need to check the event parameters.
			assert.strictEqual(TableUtils.Menu.openContextMenu(oTable, oCell, oEvent), true, "Returned true");

			assertCloseMenuSpiesCalled();

			if (oEvent) {
				assert.ok(fnOpenAsContextMenu.calledOnceWithExactly(oEvent, oCell), "#openAsContextMenu called with correct args");
			} else if (oMenu.openBy) {
				assert.ok(fnOpen.calledOnceWithExactly(oCell), "#openBy called with correct args");
			} else {
				assert.ok(fnOpen.calledOnceWithExactly(null, oCell, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oCell),
					"#open called with correct args");
			}

			assert.ok(oTable.getContextMenu().getBindingContext(sModelName) === oRowBindingContext,
				"The binding context is correct after opening the context menu (Model: " + sModelName + ")");

			resetSpies();
			oMenu.destroy();
		}

		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		test(createMenuM);
		test(createMenuUnified);

		var oBindingInfo = oTable.getBindingInfo("rows");
		var sModelName = "myModel";

		oBindingInfo.path = sModelName + ">" + oBindingInfo.path;
		oTable.setModel(oTable.getModel(), sModelName);
		oTable.bindRows(oBindingInfo);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("_rowsUpdated", resolve);
		}).then(function() {
			test(createMenuM, sModelName, {
				target: oCell
			});
			test(createMenuUnified, sModelName, {
				target: oCell
			});

			var oContextMenu = createMenuM();
			oTable.setContextMenu(oContextMenu);
			var fnOpenAsContextMenu = that.spy(oContextMenu, "openAsContextMenu");
			var fnOpen = that.spy(oContextMenu, "openBy");

			fakeGroupRow(0);
			assert.strictEqual(TableUtils.Menu._openCustomContentCellContextMenu(oTable, oCell), false, "Returned false");
			assertCloseMenuSpiesNotCalled();
			assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
			assert.ok(fnOpen.notCalled, "#open was not called");
			resetSpies();
			fnOpenAsContextMenu.reset();
			fnOpen.reset();

			oCell = getCell(1, 0)[0];
			fakeSumRow(1);
			assert.strictEqual(TableUtils.Menu._openCustomContentCellContextMenu(oTable, oCell), false, "Returned false");
			assertCloseMenuSpiesNotCalled();
			assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
			assert.ok(fnOpen.notCalled, "#open was not called");

			oCloseDefaultContentCellContextMenu.restore();
		});
	});

	QUnit.test("_openDefaultContentCellContextMenu", function(assert) {
		var aColumns = oTable.getColumns();
		var oColumn = aColumns[0];
		var oCell;
		var oFakeEventObject = {};
		var that = this;
		var oCloseCustomContentCellContextMenu = this.spy(TableUtils.Menu, "_closeCustomContentCellContextMenu");

		function assertCloseMenuSpiesCalled() {
			oTable.getColumns().forEach(function(oColumn, iIndex) {
				assert.ok(that.oUtilsCloseColumnContextMenu.withArgs(oTable, iIndex).calledOnce,
					"_closeColumnContextMenu was called for column " + (iIndex + 1));
			});
			assert.ok(oCloseCustomContentCellContextMenu.calledOnceWithExactly(oTable), "_closeCustomContentCellContextMenu was called");
		}

		function assertCloseMenuSpiesNotCalled() {
			oTable.getColumns().forEach(function(oColumn, iIndex) {
				assert.ok(that.oUtilsCloseColumnContextMenu.notCalled,
					"_closeColumnContextMenu was not called for column " + (iIndex + 1));
			});
			assert.ok(oCloseCustomContentCellContextMenu.notCalled, "_closeCustomContentCellContextMenu was not called");
		}

		function resetSpies() {
			that.resetSpies();
			oCloseCustomContentCellContextMenu.reset();
		}

		oCell = getCell(0, 0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell), false, "Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assertCloseMenuSpiesNotCalled();
		resetSpies();

		oTable.setEnableCellFilter(true);
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell), false, "Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assertCloseMenuSpiesNotCalled();
		resetSpies();

		oColumn.setFilterProperty("A");
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell), true, "Returned true");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assertCloseMenuSpiesCalled();
		resetSpies();

		var oContentCellContextMenu = oTable._oCellContextMenu;
		var fnOpenAsContextMenu = this.spy(oContentCellContextMenu, "openAsContextMenu");
		var fnOpen = this.spy(oContentCellContextMenu, "open");

		oCell = getCell(1, 0)[0];
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell), true, "Returned true");
		assert.strictEqual(oContentCellContextMenu, oTable._oCellContextMenu, "The cell content context menu was reused");
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		assert.ok(fnOpen.calledOnceWithExactly(null, oCell, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oCell),
			"#open was called");
		assertCloseMenuSpiesCalled();
		resetSpies();
		fnOpenAsContextMenu.reset();
		fnOpen.reset();

		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, getRowHeader(0)[0]), false, "Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		assert.ok(fnOpen.notCalled, "#open was not called");
		assertCloseMenuSpiesNotCalled();
		resetSpies();
		fnOpenAsContextMenu.reset();
		fnOpen.reset();

		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, getRowAction(0)[0]), false, "Returned false");
		this.assertDefaultContentCellContextMenuExists(assert, true);
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		assert.ok(fnOpen.notCalled, "#open was not called");
		assertCloseMenuSpiesNotCalled();
		resetSpies();
		fnOpenAsContextMenu.reset();
		fnOpen.reset();

		oCell = getCell(0, 0)[0];
		oFakeEventObject.target = oCell;
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell, oFakeEventObject), true, "Returned true");
		assert.ok(oContentCellContextMenu, oTable._oCellContextMenu, "The cell content context menu was reused");
		assert.ok(fnOpenAsContextMenu.calledOnceWithExactly(oFakeEventObject, oCell), "#openAsContextMenu was called");
		assertCloseMenuSpiesCalled();
		resetSpies();
		fnOpenAsContextMenu.reset();
		fnOpen.reset();

		fakeGroupRow(0);
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, oCell), false, "Returned false");
		assert.ok(oContentCellContextMenu, oTable._oCellContextMenu, "The cell content context menu still exists");
		assert.ok(fnOpenAsContextMenu.notCalled, "#openAsContextMenu was not called");
		assert.ok(fnOpen.notCalled, "#open was not called");
		assertCloseMenuSpiesNotCalled();

		oCloseCustomContentCellContextMenu.restore();
	});

	QUnit.test("Cell filter menu item", function(assert) {
		var oColumn = oTable.getColumns()[0];

		oTable.setEnableCellFilter(true);
		oColumn.setFilterProperty("A");

		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, getCell(0, 0)[0]), true, "Returned true");

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

	QUnit.test("_closeContentCellContextMenu", function(assert) {
		var oCloseCustomContentCellContextMenu = this.spy(TableUtils.Menu, "_closeCustomContentCellContextMenu");
		var oCloseDefaultContentCellContextMenu = this.spy(TableUtils.Menu, "_closeDefaultContentCellContextMenu");

		TableUtils.Menu._closeContentCellContextMenu(oTable);
		assert.ok(oCloseCustomContentCellContextMenu.calledOnceWithExactly(oTable), "_closeCustomContentCellContextMenu was called");
		assert.ok(oCloseDefaultContentCellContextMenu.calledOnceWithExactly(oTable), "_closeDefaultContentCellContextMenu was called");

		oCloseCustomContentCellContextMenu.restore();
		oCloseDefaultContentCellContextMenu.restore();
	});

	QUnit.test("_closeCustomContentCellContextMenu", function(assert) {
		var oContextMenu = new MenuUnified({
			items: [
				new MenuItemUnified({text: "ContextMenuItem"})
			]
		});
		var oCloseMenu = this.spy(oContextMenu, "close");

		oTable.setContextMenu(oContextMenu);

		TableUtils.Menu._closeCustomContentCellContextMenu(oTable);
		assert.ok(oCloseMenu.notCalled, "#close was not called");

		oContextMenu.open();

		TableUtils.Menu._closeCustomContentCellContextMenu(oTable);
		assert.ok(oCloseMenu.calledOnce, "#close was called");
	});

	QUnit.test("_closeDefaultContentCellContextMenu", function(assert) {
		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, getCell(0, 0)[0]), true, "Returned true");

		var oCloseMenu = this.spy(oTable._oCellContextMenu, "close");

		TableUtils.Menu._closeDefaultContentCellContextMenu(oTable);
		assert.ok(oCloseMenu.calledOnce, "#close was called");
		oCloseMenu.reset();

		TableUtils.Menu._closeDefaultContentCellContextMenu(oTable);
		assert.ok(oCloseMenu.notCalled, "#close was not called");
	});

	QUnit.test("cleanupDefaultContentCellContextMenu", function(assert) {
		oTable.setEnableCellFilter(true);
		oTable.getColumns()[0].setFilterProperty("A");

		TableUtils.Menu.cleanupDefaultContentCellContextMenu(oTable);
		assert.strictEqual(TableUtils.Menu._openDefaultContentCellContextMenu(oTable, getCell(0, 0)[0]), true, "Returned true");

		var oDestroyMenu = this.spy(oTable._oCellContextMenu, "destroy");

		TableUtils.Menu.cleanupDefaultContentCellContextMenu();
		this.assertDefaultContentCellContextMenuExists(assert, true);
		TableUtils.Menu.cleanupDefaultContentCellContextMenu(oTable);
		this.assertDefaultContentCellContextMenuExists(assert, false);
		assert.ok(oDestroyMenu.calledOnce, "#destroy was called");
	});

	QUnit.test("_applyColumnHeaderCellMenu", function(assert) {
		var oColumn = oTable.getColumns()[0];

		// Column is not resizable and has no menu items: The cell menu will not be applied.
		oColumn.setResizable(false);
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), false, "Returned false");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);
		oColumn.setResizable(true);

		// Column is resizable and has no menu items: A cell menu with a resize button will be applied.
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, oColumn, false);
		this.assertColumnHeaderCellResizeButtonExists(assert, oColumn, true);

		oColumn = oTable.getColumns()[1];

		// Column is not resizable and has menu items: A cell menu with a context menu button will be applied.
		oColumn.setResizable(false);
		this.stub(oColumn, "_menuHasItems").returns(true);
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, oColumn, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, oColumn, false);

		oColumn = oTable.getColumns()[2];

		// Column is resizable and has menu items: A cell menu with a context menu and a resize button will be applied.
		this.stub(oColumn, "_menuHasItems").returns(true);
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, oColumn, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, oColumn, true);

		// Applying the cell menu to the same column header cell again.
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), false, "Returned false");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, oColumn, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, oColumn, true);

		// Applying the cell menu to another column header cell.
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oTable.getColumns()[3].getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);
		this.assertColumnHeaderCellMenuExists(assert, oTable.getColumns()[3], true);
	});

	QUnit.test("_removeColumnHeaderCellMenu", function(assert) {
		var oColumn = oTable.getColumns()[0];

		// Apply the cell menu.
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);

		// Remove the cell menu.
		TableUtils.Menu._removeColumnHeaderCellMenu(oTable);
		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);

		// When a column header cell has no cell menu, removing the cell menu has no effect.
		TableUtils.Menu._removeColumnHeaderCellMenu(oTable);
		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);
	});

	QUnit.test("_removeColumnHeaderCellMenu - On focus out", function(assert) {
		var oColumn = oTable.getColumns()[0];

		function createFocusOutEvent() {
			if (typeof FocusEvent === "function") {
				return new FocusEvent("focusout", {
					bubbles: true,
					cancelable: true
				});
			} else {
				var oFocusEvent = document.createEvent("Event");
				oFocusEvent.initEvent("focusout", true, true);
				return oFocusEvent;
			}
		}

		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);

		// Apply the cell menu.
		assert.strictEqual(TableUtils.Menu._applyColumnHeaderCellMenu(oTable, oColumn.getDomRef()), true, "Returned true");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, true);

		this.resetSpies();

		// When the column header cell looses the focus the cell menu should be removed.
		oColumn.getDomRef().dispatchEvent(createFocusOutEvent());
		assert.ok(this.oUtilsRemoveColumnHeaderCellMenu.calledOnceWithExactly(oTable),
			"_removeColumnHeaderCellMenu was called when the column header cell has lost the focus");
		this.assertColumnHeaderCellMenuExists(assert, oColumn, false);
	});
});