/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	TableUtils,
	Row,
	RowAction,
	RowActionItem,
	FixedRowMode,
	Device,
	Control,
	oCore
) {
	"use strict";

	const TestContextMenu = Control.extend("sap.ui.table.test.ContextMenu", {
		metadata: {
			interfaces: ["sap.ui.core.IContextMenu"]
		},
		constructor: function() {
			Control.apply(this, arguments);
			this.openAsContextMenu = sinon.spy();
		}
	});

	const aRowStates = [{
		title: "Standard row",
		type: Row.prototype.Type.Standard
	}, {
		title: "Collapsed standard row",
		type: Row.prototype.Type.Standard,
		expandable: true,
		expanded: false
	}, {
		title: "Expanded standard row",
		type: Row.prototype.Type.Standard,
		expandable: true,
		expanded: true
	}, {
		title: "Non-expandable group header row",
		type: Row.prototype.Type.GroupHeader,
		level: 1,
		expandable: false
	}, {
		title: "Collapsed group header row",
		type: Row.prototype.Type.GroupHeader,
		level: 1,
		expandable: true,
		expanded: false
	}, {
		title: "Expanded group header row",
		type: Row.prototype.Type.GroupHeader,
		level: 1,
		expandable: true,
		expanded: true
	}, {
		title: "Group summary row",
		type: Row.prototype.Type.Summary,
		level: 1
	}, {
		title: "Total summary row",
		type: Row.prototype.Type.Summary
	}];

	function createFakeEventObject(oTarget) {
		return {
			target: oTarget,
			preventDefault: sinon.spy()
		};
	}

	TableQUnitUtils.setDefaultSettings({
		columns: [
			TableQUnitUtils.createTextColumn(),
			TableQUnitUtils.createTextColumn().setVisible(false),
			TableQUnitUtils.createTextColumn()
		],
		models: TableQUnitUtils.createJSONModel(aRowStates.length),
		rowActionTemplate: new RowAction({
			items: new RowActionItem({type: "Navigation"})
		}),
		rowActionCount: 1,
		rowMode: new FixedRowMode({
			rowCount: aRowStates.length + 1
		})
	});

	QUnit.module("Misc");

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Menu, "MenuUtils namespace available");
		assert.ok(TableUtils.Menu.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("#openContextMenu - Column header", {
		before: function() {
			this.oBeforeOpenContextMenuEvenHandler = sinon.spy();
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				contextMenu: new TestContextMenu(),
				beforeOpenContextMenu: this.oBeforeOpenContextMenuEvenHandler,
				rows: "{/}"
			});

			this.oTable.getColumns().forEach((oColumn) => sinon.spy(oColumn, "_openHeaderMenu"));

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.resetSpies();
			this.oTable.destroy();
		},
		resetSpies: function() {
			this.oBeforeOpenContextMenuEvenHandler.resetHistory();
			this.oTable.getColumns().forEach((oColumn) => oColumn._openHeaderMenu.resetHistory());
			this.oTable.getContextMenu().openAsContextMenu.resetHistory();
		},
		test: function(assert, mSettings) {
			var oEvent = createFakeEventObject(mSettings.element);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);

			assert.ok(true, "--- Opening context menu for: " + mSettings.elementName);

			this.oTable.getColumns().forEach((oColumn) => {
				const sCallTitle = `Column[${oColumn.getIndex()}]#_openHeaderMenu call`;

				if (oColumn.getIndex() === mSettings.columnIndex) {
					assert.ok(oColumn._openHeaderMenu.calledOnceWithExactly(mSettings.element), sCallTitle);
					assert.ok(oEvent.preventDefault.called, "preventDefault");
				} else {
					assert.notOk(oColumn._openHeaderMenu.called, sCallTitle);
				}
			});

			if (!mSettings.skipRowContextMenuChecks) {
				assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
				assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
			}

			this.resetSpies();
		}
	});

	QUnit.test("Elements that do not support column header context menus", function(assert) {
		this.test(assert, {
			element: this.oTable.qunit.getSelectAllCell(),
			elementName: "SelectAll cell"
		});
		this.test(assert, {
			element: this.oTable.qunit.getDataCell(0, 0),
			elementName: "Data cell",
			skipRowContextMenuChecks: true
		});
		this.test(assert, {
			element: document.getElementsByTagName("body").item(0),
			elementName: "Element outside the table"
		});
	});

	QUnit.test("Column header cell", function(assert) {
		this.test(assert, {
			element: this.oTable.qunit.getColumnHeaderCell(0),
			elementName: "Header cell of first visible column",
			columnIndex: 0
		});
		this.test(assert, {
			element: this.oTable.qunit.getColumnHeaderCell(1),
			elementName: "Header cell of second visible column",
			columnIndex: 2
		});
	});

	QUnit.module("#openContextMenu - Custom context menu", {
		before: function() {
			this.oBeforeOpenContextMenuEventInfo = {
				name: "beforeOpenContextMenu",
				lastCallParameters: null,
				handler: sinon.spy((oEvent) => {
					this.oBeforeOpenContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				contextMenu: new TestContextMenu(),
				beforeOpenContextMenu: this.oBeforeOpenContextMenuEventInfo.handler
			});

			TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, function(oState) {
				Object.assign(oState, aRowStates[parseInt(oState.context.getPath().substring(1))]);
			}, this);

			this.oTable.bindRows({
				path: "/"
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.resetSpies();
			this.oTable.destroy();
		},
		resetSpies: function() {
			this.oBeforeOpenContextMenuEventInfo.handler.resetHistory();
			this.oTable.getContextMenu()?.openAsContextMenu.resetHistory();
		},
		assertEventCalled: function(assert, bCalled, mExpectedParameters) {
			const oEventInfo = this.oBeforeOpenContextMenuEventInfo;

			if (bCalled) {
				assert.ok(oEventInfo.handler.calledOnce, oEventInfo.name + ": The event handler has been called");
				assert.deepEqual(oEventInfo.lastCallParameters, Object.assign({id: this.oTable.getId()}, mExpectedParameters),
					oEventInfo.name + ": The event object contains the correct parameters");
			} else {
				assert.ok(oEventInfo.handler.notCalled, oEventInfo.name + ": The event handler has not been called");
			}

			oEventInfo.handler.resetHistory();
			oEventInfo.lastCallParameters = null;
		},
		assertBindingContext: function(assert, iRowIndex) {
			const sModelName = this.oTable.getBindingInfo("rows").model;

			assert.ok(this.oTable.getContextMenu().getBindingContext(sModelName) === this.oTable.getRows()[iRowIndex].getBindingContext(sModelName),
				"Binding context");
		}
	});

	QUnit.test("Elements that do not support a custom context menu", function(assert) {
		const test = (oElement, sElementName) => {
			var oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);

			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
			assert.notOk(this.oTable._oCellContextMenu, "Default context menu existance");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");

			this.assertEventCalled(assert, false);
			this.resetSpies();
		};

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		test(this.oTable.qunit.getDataCell(8, 0), "Cell in empty row");
		test(document.getElementsByTagName("body").item(0), "Element outside the table");
	});

	QUnit.test("Data cell", async function(assert) {
		let oEvent;

		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		this.assertEventCalled(assert, true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(assert, 0);
		assert.ok(oEvent.preventDefault.called, "preventDefault");

		this.resetSpies();
		this.oTable.setModel(this.oTable.getModel(), "OtherModel");
		this.oTable.bindRows({path: "OtherModel>/"});
		await this.oTable.qunit.whenRenderingFinished();
		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(1, 1));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		this.assertEventCalled(assert, true, {
			rowIndex: 1,
			columnIndex: 2,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(assert, 1);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Row header cell", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getRowHeaderCell(0));

		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		this.assertEventCalled(assert, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(assert, 0);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Row action cell", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getRowActionCell(0));

		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		this.assertEventCalled(assert, true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(assert, 0);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("preventDefault", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));

		this.oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
			oEvent.preventDefault();
		});
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Destroy context menu in 'beforeOpenContextMenu' event", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		const oContextMenu = this.oTable.getContextMenu();

		this.oTable.attachEventOnce("beforeOpenContextMenu", (oEvent) => {
			this.oTable.destroyContextMenu();
		});
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		assert.notOk(oContextMenu.openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("With cell filter menu", function(assert) {
		let oEvent;

		this.oTable.getColumns()[0].setFilterProperty("name");
		this.oTable.setEnableCellFilter(true);

		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
		assert.notOk(this.oTable._oCellContextMenu, "Default context menu existance");
		assert.ok(oEvent.preventDefault.called, "preventDefault");

		this.resetSpies();
		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(6, 0)); // Summary row - not supported by custom menu, but by cell filter menu
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
		assert.notOk(this.oTable._oCellContextMenu, "Default context menu existance");
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.module("#openContextMenu - Default context menu", {
		beforeEach: function() {
			this.oBeforeOpenContextMenuEvenHandler = sinon.spy();
			this.oTable = TableQUnitUtils.createTable({
				columns: [
					TableQUnitUtils.createTextColumn({text: "name", bind: true}).setFilterProperty("name"),
					TableQUnitUtils.createTextColumn().setVisible(false),
					TableQUnitUtils.createTextColumn({text: "firstName", bind: true}).setFilterProperty("firstName"),
					TableQUnitUtils.createTextColumn()
				],
				enableCellFilter: true,
				beforeOpenContextMenu: this.oBeforeOpenContextMenuEvenHandler
			});

			TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, function(oState) {
				Object.assign(oState, aRowStates[parseInt(oState.context.getPath().substring(1))]);
			}, this);

			this.oTable.bindRows({
				path: "/"
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.resetSpies();
			this.oTable.destroy();
		},
		resetSpies: function() {
			this.oBeforeOpenContextMenuEvenHandler.resetHistory();
		}
	});

	QUnit.test("Elements that do not support the default context menu", function(assert) {
		const test = (oElement, sElementName, bMenuExists) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.cleanupDefaultContentCellContextMenu(this.oTable); // Delete the default context menu to be table to test the creation.
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);

			assert.ok(true, "--- Opening context menu for: " + sElementName);

			if (bMenuExists) {
				assert.notOk(this.oTable._oCellContextMenu.isOpen(), "ContextMenu#isOpen()");
			} else {
				assert.notOk(this.oTable._oCellContextMenu, "Context menu existance");
			}

			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");

			this.resetSpies();
		};

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell", false);
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row", true);
		test(this.oTable.qunit.getDataCell(8, 0), "Cell in empty row", false);
		test(this.oTable.qunit.getRowHeaderCell(0), "Row header cell", true);
		test(this.oTable.qunit.getRowActionCell(0), "Row action cell", true);
		test(document.getElementsByTagName("body").item(0), "Element outside the table", false);
	});

	QUnit.test("Data cell", function(assert) {
		let oEvent;

		// We first need to create the default context menu to attach a spy on it.
		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		sinon.spy(this.oTable._oCellContextMenu, "openAsContextMenu");

		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
		assert.ok(this.oTable._oCellContextMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target),
			"ContextMenu#openAsContextMenu call");
		assert.ok(oEvent.preventDefault.called, "preventDefault");

		this.resetSpies();
		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(1, 2));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		assert.notOk(this.oTable._oCellContextMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target),
			"ContextMenu#openAsContextMenu call");
		assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Cell filter; Default filter", function(assert) {
		this.spy(this.oTable, "filter");
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		this.oTable._oCellContextMenu.getItems()[0].fireSelect();
		assert.ok(this.oTable.filter.calledOnceWithExactly(this.oTable.getColumns()[0], "name_0"), "Table#filter call");
	});

	QUnit.test("Cell filter; Custom filter", function(assert) {
		let mParameters;

		this.spy(this.oTable, "filter");
		this.oTable.setEnableCustomFilter(true);
		this.oTable.attachCustomFilter((oEvent) => {
			mParameters = oEvent.getParameters();
		});

		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		this.oTable._oCellContextMenu.getItems()[0].fireSelect();
		assert.deepEqual(mParameters, {
			column: this.oTable.getColumns()[0],
			value: "name_0",
			id: this.oTable.getId()
		}, "customFilter event handler");
		assert.notOk(this.oTable.filter.called, "Table#filter call");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}"
			});
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#closeContentCellContextMenu - No menus", function(assert) {
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(true, "Does not throw if there is nothing to close");
	});

	QUnit.test("#closeContentCellContextMenu - Custom context menu", function(assert) {
		this.oTable.setContextMenu(new TestContextMenu());
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(true, "Does not throw if the context menu does not implement #close");

		this.oTable.getContextMenu().close = sinon.spy();
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(this.oTable.getContextMenu().close.calledOnceWithExactly(), "ContextMenu#close call");
	});

	QUnit.test("#closeContentCellContextMenu - Default context menu", function(assert) {
		this.oTable.setEnableCellFilter(true);
		this.oTable.getColumns()[0].setFilterProperty("test");
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		sinon.spy(this.oTable._oCellContextMenu, "close");

		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(this.oTable._oCellContextMenu.close.calledOnceWithExactly(), "ContextMenu#close call");
	});

	QUnit.test("#cleanupDefaultContentCellContextMenu", function(assert) {
		this.oTable.setEnableCellFilter(true);
		this.oTable.getColumns()[0].setFilterProperty("test");

		TableUtils.Menu.cleanupDefaultContentCellContextMenu(this.oTable);
		assert.ok(true, "Does not throw if the default cell context menu does not exist");

		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		this.spy(this.oTable._oCellContextMenu, "destroy");

		const oCellContextMenu = this.oTable._oCellContextMenu;
		TableUtils.Menu.cleanupDefaultContentCellContextMenu(this.oTable);
		assert.ok(oCellContextMenu.destroy.called, "#destroy call");
		assert.notOk(this.oTable._oCellContextMenu, "Reference to the default context menu instance is removed");
	});

	/**
	 * @deprecated As of version 1.54
	 */
	QUnit.module("Context Menus - cellContextmenu (legacy)", {
		before: function() {
			var oCellContextMenuEventInfo = {
				name: "CellContextMenu",
				lastCallParameters: null,
				handler: sinon.spy(function(oEvent) {
					oCellContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
			this.oCellContextMenuEventInfo = oCellContextMenuEventInfo;
		},
		beforeEach: function() {
			window.createTables();
			oTable.attachCellContextmenu(this.oCellContextMenuEventInfo.handler);
		},
		afterEach: function() {
			window.destroyTables();
			this.oCellContextMenuEventInfo.handler.resetHistory();
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
		}
	});

	/**
	 * @deprecated As of version 1.54
	 */
	QUnit.test("openContextMenu - Header cells", function(assert) {
		var oColumnA = oTable.getColumns()[0];
		var oColumnB = oTable.getColumns()[1];
		var bOriginalDeviceSystemDesktop = Device.system.desktop;
		var oEvent;

		Device.system.desktop = true;
		oColumnA.setFilterProperty("A");
		oColumnB.setFilterProperty("A");

		oEvent = createFakeEventObject(oColumnA.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		oEvent = createFakeEventObject(oColumnB.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		// Prevent the default action. The context menu should not be opened.
		oTable.attachEventOnce("columnSelect", function(oEvent) {
			oEvent.preventDefault();
		});

		oEvent = createFakeEventObject(oColumnA.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		// Make the first column invisible and open the menu of column 2 (which is not the first visible column).
		oColumnA.setVisible(false);
		oCore.applyChanges();

		oEvent = createFakeEventObject(oColumnB.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		oColumnA.setVisible(true);
		oCore.applyChanges();

		Device.system.desktop = false;

		oEvent = createFakeEventObject(oColumnA.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		oTable.attachEventOnce("columnSelect", function(oEvent) {
			oEvent.preventDefault();
		});
		oEvent = createFakeEventObject(oColumnA.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		Device.system.desktop = bOriginalDeviceSystemDesktop;
	});

	/**
	 * @deprecated As of version 1.54
	 */
	QUnit.test("openContextMenu - Content cells", function(assert) {
		var oDomRef;
		var aColumns = oTable.getColumns();
		var aRows = oTable.getRows();
		var oColumnA = aColumns[0];
		var oCellA = aRows[0].getCells()[0];
		var oColumnB = aColumns[1];
		var oCellB = aRows[0].getCells()[1];
		var oCustomContextMenu = new TestContextMenu();
		var oEvent;

		oDomRef = oCellA.getDomRef();
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.oCellContextMenuEventInfo.handler.resetHistory();

		oTable.setContextMenu(oCustomContextMenu);
		oDomRef = oCellB.getDomRef();
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 1,
			columnId: oColumnB.getId(),
			cellControl: oCellB,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.oCellContextMenuEventInfo.handler.resetHistory();

		oTable.attachEventOnce("cellContextmenu", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oCellA.getDomRef();
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.oCellContextMenuEventInfo.handler.resetHistory();

		oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
			oEvent.preventDefault();
		});

		oDomRef = oCellA.getDomRef();
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, true, {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: aRows[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: TableUtils.getCell(oTable, oDomRef)[0]
		});
		this.oCellContextMenuEventInfo.handler.resetHistory();

		oDomRef = window.getRowHeader(0)[0];
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		oTable.destroyContextMenu();
		oDomRef = window.getRowAction(0)[0];
		oEvent = createFakeEventObject(oDomRef);
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.notOk(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);
	});
});