/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/unified/MenuItem",
	"sap/ui/core/Control"
], function(
	TableQUnitUtils,
	TableUtils,
	Row,
	RowAction,
	RowActionItem,
	FixedRowMode,
	MenuItem,
	Control
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
			const oEvent = createFakeEventObject(mSettings.element);

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		const oOpenMenuHook = sinon.stub();
		const test = (oElement, sElementName, bDefaultMenuExists = false) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.cleanupDefaultContentCellContextMenu(this.oTable); // Delete the default context menu to be table to test the creation.
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.notOk(oEvent.preventDefault.called, "preventDefault");

			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");

			if (bDefaultMenuExists) {
				assert.notOk(this.oTable._oCellContextMenu.isOpen(), "Default context menu open state if empty");

				oOpenMenuHook.callsFake((oCellInfo, oMenu) => { oMenu.addItem(new MenuItem()); });
				sinon.spy(this.oTable._oCellContextMenu, "openAsContextMenu");
				TableUtils.Menu.openContextMenu(this.oTable, oEvent);
				assert.ok(this.oTable._oCellContextMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target),
					"Default context menu #openAsContextMenu call if it has items");
				assert.ok(oEvent.preventDefault.called, "preventDefault");
				this.oTable._oCellContextMenu.destroyItems();
				oOpenMenuHook.reset();
			} else {
				assert.notOk(!!this.oTable._oCellContextMenu, "Default context menu existance");
			}

			this.assertEventCalled(assert, false);
			this.resetSpies();
		};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.OpenContextMenu, oOpenMenuHook, this);

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row", true);
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row", true);
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

	QUnit.test("Cell filter enabled", function(assert) {
		this.oTable.getColumns()[0].setFilterProperty("name");
		this.oTable.setEnableCellFilter(true);

		const oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
		assert.notOk(!!this.oTable._oCellContextMenu, "Default context menu existance");
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.module("#openContextMenu - Default context menu", {
		beforeEach: async function() {
			this.oBeforeOpenContextMenuEvenHandler = sinon.spy();
			this.oTable = await TableQUnitUtils.createTable({
				columns: [
					TableQUnitUtils.createTextColumn({text: "name", bind: true}).setFilterProperty("name"),
					TableQUnitUtils.createTextColumn().setVisible(false),
					TableQUnitUtils.createTextColumn({text: "firstName", bind: true}).setFilterProperty("firstName"),
					TableQUnitUtils.createTextColumn()
				],
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
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(!!this.oTable._oCellContextMenu, "Context menu existance");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			this.resetSpies();
		};

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell");
		test(this.oTable.qunit.getDataCell(8, 0), "Cell in empty row");
		test(document.getElementsByTagName("body").item(0), "Element outside the table");
	});

	QUnit.test("Elements that support the default context menu", function(assert) {
		const oOpenMenuHook = sinon.stub();
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.cleanupDefaultContentCellContextMenu(this.oTable); // Delete the default context menu to be table to test the creation.
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);

			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(this.oTable._oCellContextMenu.isOpen(), "Context menu open state if empty");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			oOpenMenuHook.callsFake((oCellInfo, oMenu) => { oMenu.addItem(new MenuItem()); });
			sinon.spy(this.oTable._oCellContextMenu, "openAsContextMenu");
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(this.oTable._oCellContextMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target),
				"Default context menu #openAsContextMenu call if it has items");
			assert.ok(oEvent.preventDefault.called, "preventDefault");
			this.oTable._oCellContextMenu.destroyItems();
			oOpenMenuHook.reset();

			this.resetSpies();
		};

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Table.OpenContextMenu, oOpenMenuHook, this);

		test(this.oTable.qunit.getDataCell(0, 0), "Cell in standard row");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		test(this.oTable.qunit.getRowHeaderCell(0), "Row header cell");
		test(this.oTable.qunit.getRowActionCell(0), "Row action cell");
	});

	QUnit.test("Cell filter enabled", function(assert) {
		const test = (oElement, sElementName, bHasCellFilter = false) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);

			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			if (bHasCellFilter) {
				assert.ok(this.oTable._oCellContextMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target),
					"ContextMenu#openAsContextMenu call");
				assert.ok(oEvent.preventDefault.called, "preventDefault");
			} else {
				assert.notOk(this.oTable._oCellContextMenu.openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
				assert.notOk(oEvent.preventDefault.called, "preventDefault");
			}

			this.resetSpies();
			this.oTable._oCellContextMenu.openAsContextMenu.resetHistory();
		};

		this.oTable.setEnableCellFilter(true);

		// We first need to create the default context menu to attach a spy on it.
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		sinon.spy(this.oTable._oCellContextMenu, "openAsContextMenu");

		test(this.oTable.qunit.getDataCell(0, 0), "Cell in filterable column", true);
		test(this.oTable.qunit.getDataCell(0, 2), "Cell in non-filterable column");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		test(this.oTable.qunit.getRowHeaderCell(0), "Row header cell");
		test(this.oTable.qunit.getRowActionCell(0), "Row action cell");
	});

	QUnit.test("Cell filter; Default filter", function(assert) {
		this.spy(this.oTable, "filter");
		this.oTable.setEnableCellFilter(true);
		TableUtils.Menu.openContextMenu(this.oTable, createFakeEventObject(this.oTable.qunit.getDataCell(0, 0)));
		this.oTable._oCellContextMenu.getItems()[0].fireSelect();
		assert.ok(this.oTable.filter.calledOnceWithExactly(this.oTable.getColumns()[0], "name_0"), "Table#filter call");
	});

	QUnit.test("Cell filter; Custom filter", function(assert) {
		let mParameters;

		this.spy(this.oTable, "filter");
		this.oTable.setEnableCellFilter(true);
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

	QUnit.module("Other methods", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
});