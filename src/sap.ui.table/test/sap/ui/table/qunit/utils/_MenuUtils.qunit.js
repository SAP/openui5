/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/unified/MenuItem",
	"sap/ui/Device",
	"sap/ui/core/Control"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	Row,
	RowAction,
	RowActionItem,
	FixedRowMode,
	MenuItem,
	Device,
	Control
) {
	"use strict";

	const TestContextMenu = Control.extend("sap.ui.table.test.ContextMenu", {
		metadata: {
			interfaces: ["sap.ui.core.IContextMenu"]
		},

		// no rendering required for the tests in this module
		renderer: null,

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
		models: TableQUnitUtils.createJSONModelWithEmptyRows(aRowStates.length),
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
				lastCallParameters: null,
				handler: sinon.spy((oEvent) => {
					this.oBeforeOpenContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				contextMenu: new TestContextMenu(),
				beforeOpenContextMenu: this.oBeforeOpenContextMenuEventInfo.handler,
				extension: new TableQUnitUtils.TestControl(),
				footer: new TableQUnitUtils.TestControl()
			});
			this.oTable.qunit.setRowStates(aRowStates);

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
		assertEventCalled: function(bCalled, mExpectedParameters) {
			const oEventInfo = this.oBeforeOpenContextMenuEventInfo;

			if (bCalled) {
				QUnit.assert.ok(oEventInfo.handler.calledOnce, "beforeOpenContextMenu: The event handler has been called");
				QUnit.assert.deepEqual(oEventInfo.lastCallParameters, Object.assign({id: this.oTable.getId()}, mExpectedParameters),
					"beforeOpenContextMenu: The event object contains the correct parameters");
			} else {
				QUnit.assert.ok(oEventInfo.handler.notCalled, "beforeOpenContextMenu: The event handler has not been called");
			}

			oEventInfo.handler.resetHistory();
			oEventInfo.lastCallParameters = null;
		},
		assertBindingContext: function(iRowIndex) {
			const sModelName = this.oTable.getBindingInfo("rows").model;
			const oContextMenuBindingContext = this.oTable.getContextMenu().getBindingContext(sModelName);
			const oRowBindingContext = this.oTable.getRows()[iRowIndex].getBindingContext(sModelName);

			QUnit.assert.ok(oContextMenuBindingContext === oRowBindingContext, "Binding context");
		}
	});

	QUnit.test("Elements that do not support a custom context menu", function(assert) {
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");
			this.assertEventCalled(false);

			this.resetSpies();
		};

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getRowActionCell(3), "Row action cell in group header row");
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		test(this.oTable.qunit.getDataCell(8, 0), "Cell in empty row");
		test(this.oTable.getExtension()[0].getDomRef(), "Extension");
		test(this.oTable.getFooter().getDomRef(), "Footer");
		test(document.getElementsByTagName("body").item(0), "Element outside the table");
	});

	QUnit.test("Data cell", async function(assert) {
		let oEvent;

		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(0, 0));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		this.assertEventCalled(true, {
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(0);
		assert.ok(oEvent.preventDefault.called, "preventDefault");

		this.resetSpies();
		this.oTable.setModel(this.oTable.getModel(), "OtherModel");
		this.oTable.bindRows({path: "OtherModel>/"});
		await this.oTable.qunit.whenRenderingFinished();
		oEvent = createFakeEventObject(this.oTable.qunit.getDataCell(1, 1));
		TableUtils.Menu.openContextMenu(this.oTable, oEvent);
		this.assertEventCalled(true, {
			rowIndex: 1,
			columnIndex: 2,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(1);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Row header cell", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getRowHeaderCell(0));

		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		this.assertEventCalled(true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(0);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
	});

	QUnit.test("Row action cell", function(assert) {
		const oEvent = createFakeEventObject(this.oTable.qunit.getRowActionCell(0));

		TableUtils.Menu.openContextMenu(this.oTable, oEvent);

		this.assertEventCalled(true, {
			rowIndex: 0,
			columnIndex: null,
			contextMenu: this.oTable.getContextMenu()
		});
		assert.ok(this.oTable.getContextMenu().openAsContextMenu.calledOnceWithExactly(oEvent, oEvent.target), "ContextMenu#openAsContextMenu call");
		this.assertBindingContext(0);
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

	QUnit.module("#openContextMenu - Default context menu", {
		beforeEach: function() {
			this.oBeforeOpenContextMenuEvenHandler = sinon.spy();
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				columns: [
					TableQUnitUtils.createTextColumn({text: "name", bind: true}).setFilterProperty("name"),
					TableQUnitUtils.createTextColumn().setVisible(false),
					TableQUnitUtils.createTextColumn({text: "firstName", bind: true}).setFilterProperty("firstName"),
					TableQUnitUtils.createTextColumn()
				],
				beforeOpenContextMenu: this.oBeforeOpenContextMenuEvenHandler,
				extension: new TableQUnitUtils.TestControl(),
				footer: new TableQUnitUtils.TestControl()
			});
			this.oTable.qunit.setRowStates(aRowStates);
			this.oDefaultContextMenu = this.oTable._getDefaultContextMenu();

			sinon.spy(this.oDefaultContextMenu, "initContent");
			sinon.spy(this.oDefaultContextMenu, "open");
			sinon.stub(this.oDefaultContextMenu, "isEmpty").returns(false);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.resetSpies();
			this.oTable.destroy();
		},
		resetSpies: function() {
			this.oBeforeOpenContextMenuEvenHandler.resetHistory();
			this.oDefaultContextMenu.initContent.resetHistory();
			this.oDefaultContextMenu.open.resetHistory();
		},
		assertBindingContext: function(iRowIndex) {
			const sModelName = this.oTable.getBindingInfo("rows").model;
			const oContextMenuBindingContext = this.oDefaultContextMenu.getBindingContext(sModelName);
			const oRowBindingContext = this.oTable.getRows()[iRowIndex].getBindingContext(sModelName);

			QUnit.assert.ok(oContextMenuBindingContext === oRowBindingContext, "Binding context");
		}
	});

	QUnit.test("Elements that do not support context menus", function(assert) {
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);

			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.notOk(this.oDefaultContextMenu.initContent.called, "DefaultContextMenu#initContent call");
			assert.notOk(this.oDefaultContextMenu.open.called, "DefaultContextMenu#open call");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			this.resetSpies();
		};

		test(this.oTable.qunit.getSelectAllCell(), "SelectAll cell");
		test(this.oTable.qunit.getDataCell(8, 0), "Cell in empty row");
		test(this.oTable.getExtension()[0].getDomRef(), "Extension");
		test(this.oTable.getFooter().getDomRef(), "Footer");
		test(document.getElementsByTagName("body").item(0), "Element outside the table");
	});

	QUnit.test("Elements that do not support a custom context menu", function(assert) {
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);
			const $Cell = TableUtils.getCell(this.oTable, oEvent.target);
			const oCellInfo = TableUtils.getCellInfo($Cell);
			const oRow = this.oTable.getRows()[oCellInfo.rowIndex];
			const oColumn = this.oTable.getColumns()[oCellInfo.columnIndex];

			this.oDefaultContextMenu.isEmpty.returns(false);
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.ok(oEvent.preventDefault.called, "preventDefault");
			assert.ok(this.oDefaultContextMenu.initContent.calledOnceWithExactly(oRow, oColumn), "DefaultContextMenu#initContent call");
			assert.ok(this.oDefaultContextMenu.open.calledOnceWithExactly(oEvent, oCellInfo.cell), "DefaultContextMenu#open call");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
			assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");

			this.oDefaultContextMenu.isEmpty.returns(true);
			this.resetSpies();
			oEvent.preventDefault.resetHistory();
			this.oTable.getContextMenu().openAsContextMenu.resetHistory();
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName + " (context menu empty)");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.ok(this.oDefaultContextMenu.initContent.calledOnceWithExactly(oRow, oColumn), "DefaultContextMenu#initContent call");
			assert.notOk(this.oDefaultContextMenu.open.called, "DefaultContextMenu#open call");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");
			assert.notOk(this.oTable.getContextMenu().openAsContextMenu.called, "ContextMenu#openAsContextMenu call");

			this.resetSpies();
		};

		this.oTable.setContextMenu(new TestContextMenu());
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getRowActionCell(3), "Row action cell in group header row");

		this.oTable.setAggregation("groupHeaderRowContextMenu", new TestContextMenu());
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		assert.notOk(this.oTable.getAggregation("groupHeaderRowContextMenu").openAsContextMenu.called,
			"GroupHeaderRowContextMenu#openAsContextMenu call");
	});

	QUnit.test("Elements that support the default context menu", function(assert) {
		const test = (oElement, sElementName) => {
			const oEvent = createFakeEventObject(oElement);
			const $Cell = TableUtils.getCell(this.oTable, oEvent.target);
			const oCellInfo = TableUtils.getCellInfo($Cell);
			const oRow = this.oTable.getRows()[oCellInfo.rowIndex];
			const oColumn = this.oTable.getColumns()[oCellInfo.columnIndex];

			this.oDefaultContextMenu.isEmpty.returns(false);
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName);
			assert.ok(oEvent.preventDefault.called, "preventDefault");
			assert.ok(this.oDefaultContextMenu.initContent.calledOnceWithExactly(oRow, oColumn), "DefaultContextMenu#initContent call");
			assert.ok(this.oDefaultContextMenu.open.calledOnceWithExactly(oEvent, oCellInfo.cell), "DefaultContextMenu#open call");
			sinon.assert.callOrder(this.oDefaultContextMenu.initContent, this.oDefaultContextMenu.open);
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			this.oDefaultContextMenu.isEmpty.returns(true);
			this.resetSpies();
			oEvent.preventDefault.resetHistory();
			TableUtils.Menu.openContextMenu(this.oTable, oEvent);
			assert.ok(true, "--- Opening context menu for: " + sElementName + " (context menu empty)");
			assert.notOk(oEvent.preventDefault.called, "preventDefault");
			assert.ok(this.oDefaultContextMenu.initContent.calledOnceWithExactly(oRow, oColumn), "DefaultContextMenu#initContent call");
			assert.notOk(this.oDefaultContextMenu.open.called, "DefaultContextMenu#open call");
			assert.notOk(this.oBeforeOpenContextMenuEvenHandler.called, "beforeOpenContextMenu event");

			this.resetSpies();
		};

		test(this.oTable.qunit.getDataCell(0, 0), "Cell in standard row");
		test(this.oTable.qunit.getDataCell(3, 0), "Cell in group header row");
		test(this.oTable.qunit.getRowHeaderCell(3), "Row header cell in group header row");
		test(this.oTable.qunit.getDataCell(6, 0), "Cell in summary row");
		test(this.oTable.qunit.getRowHeaderCell(0), "Row header cell");
		test(this.oTable.qunit.getRowActionCell(0), "Row action cell");
	});

	QUnit.module("#closeContentCellContextMenu", {
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

	QUnit.test("No menus exist", function(assert) {
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(true, "Does not throw if there is nothing to close");
	});

	QUnit.test("Menus without #close method exist", function(assert) {
		this.oTable.setContextMenu(new TestContextMenu());
		this.oTable.setAggregation("groupHeaderRowContextMenu", new TestContextMenu());
		sinon.spy(this.oTable._getDefaultContextMenu(), "close");
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(true, "Does not throw if there is a custom context menu that does not implement #close");
		assert.ok(this.oTable._getDefaultContextMenu().close.calledOnceWithExactly(), "DefaultContextMenu#close call");
	});

	QUnit.test("Menus exist", function(assert) {
		this.oTable.setContextMenu(new TestContextMenu());
		this.oTable.setAggregation("groupHeaderRowContextMenu", new TestContextMenu());
		this.oTable.getContextMenu().close = sinon.spy();
		this.oTable.getAggregation("groupHeaderRowContextMenu").close = sinon.spy();
		sinon.spy(this.oTable._getDefaultContextMenu(), "close");
		TableUtils.Menu.closeContentCellContextMenu(this.oTable);
		assert.ok(this.oTable.getContextMenu().close.calledOnceWithExactly(), "ContextMenu#close call");
		assert.ok(this.oTable.getAggregation("groupHeaderRowContextMenu").close.calledOnceWithExactly(), "GroupHeaderRowContextMenu#close call");
		assert.ok(this.oTable._getDefaultContextMenu().close.calledOnceWithExactly(), "DefaultContextMenu#close call");
	});

	/**
	 * @deprecated As of version 1.54
	 */
	QUnit.module("Context Menus - cellContextmenu (legacy)", {
		before: function() {
			const oCellContextMenuEventInfo = {
				name: "CellContextMenu",
				lastCallParameters: null,
				handler: sinon.spy(function(oEvent) {
					oCellContextMenuEventInfo.lastCallParameters = oEvent.mParameters;
				})
			};
			this.oCellContextMenuEventInfo = oCellContextMenuEventInfo;
		},
		beforeEach: async function() {
			await window.createTables();
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
	QUnit.test("openContextMenu - Header cells", async function(assert) {
		const oColumnA = oTable.getColumns()[0];
		const oColumnB = oTable.getColumns()[1];
		const bOriginalDeviceSystemDesktop = Device.system.desktop;
		let oEvent;

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
		await nextUIUpdate();

		oEvent = createFakeEventObject(oColumnB.getDomRef());
		TableUtils.Menu.openContextMenu(oTable, oEvent);
		assert.ok(oEvent.preventDefault.called, "preventDefault");
		this.assertEventCalled(assert, this.oCellContextMenuEventInfo, false);

		oColumnA.setVisible(true);
		await nextUIUpdate();

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
		let oDomRef;
		const aColumns = oTable.getColumns();
		const aRows = oTable.getRows();
		const oColumnA = aColumns[0];
		const oCellA = aRows[0].getCells()[0];
		const oColumnB = aColumns[1];
		const oCellB = aRows[0].getCells()[1];
		const oCustomContextMenu = new TestContextMenu();
		let oEvent;

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