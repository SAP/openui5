/*!
 * ${copyright}
 */
/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/plugins/CellSelector",
	"sap/ui/core/CustomData",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/events/KeyCodes",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Fixed"
], function (Dialog, Text, MTable, MColumn, ColumnListItem, CellSelector, CustomData, MockServer, DragDropInfo, DropInfo, KeyCodes, MDCTable, MDCColumn, JSONModel, ODataModel, qutils, nextUIUpdate, GridColumn, GridTable, GridFixedRowMode) {
	"use strict";

	const sServiceURI = "/service/";

	const aData = [];
	for (let i = 0; i < 25; i++) {
		aData.push({
			id: i,
			name: "name" + i,
			color: "color" + (i % 10)
		});
	}

	const oJSONModel = new JSONModel(aData);

	function createGridTable() {
		return new GridTable({
			threshold: 5,
			rowMode: new GridFixedRowMode({
				rowCount: 5
			}),
			columns: [
				new GridColumn({ template: new Text({text: "{ProductId}"}) }),
				new GridColumn({ template: new Text({text: "{Name}"}) }),
				new GridColumn({ template: new Text({text: "{Category}"}) })
			],
			rows: "{/Products}",
			models: new ODataModel(sServiceURI, true)
		});
	}

	function createResponsiveTable() {
		return new MTable({
			columns: [
				new MColumn({ header: new Text({text: "ProductId"}) }),
				new MColumn({ header: new Text({text: "Name"}) }),
				new MColumn({ header: new Text({text: "Category"}) })
			],
			items: {
				path: "/Products",
				template : new ColumnListItem({
					cells: [
						new Text({text: "{ProductId}"}),
						new Text({text: "{Name}"}),
						new Text({text: "{Category}"})
					],
					type: "Active"
				})
			},
			models: new ODataModel(sServiceURI, true)
		});
	}

	async function getTable() {
		const oCellSelector = new CellSelector({ rangeLimit: 15 });
		const oTable = createGridTable();
		const nextRowsUpdatedEvent = new Promise((fnResolve) => {
			oTable.attachEventOnce("rowsUpdated", fnResolve);
		});

		oTable.addDependent(oCellSelector);
		oTable.placeAt("qunit-fixture");

		await nextRowsUpdatedEvent;
		return oTable;
	}

	async function createMDCTable(mSettings) {
		mSettings = Object.assign({
			type: "Table",
			delegate: {
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/"
				}
			},
			selectionMode: "Multi",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new MDCColumn({
					header: sKey,
					propertyKey: sKey,
					template: new Text({ text: "{" + sKey + "}" }),
					customData: new CustomData({ key: "property", value: sKey })
				});
			}),
			models: oJSONModel
		}, mSettings);

		const oTable = new MDCTable(mSettings);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oTable;
	}

	function getCell(oTable, iRow, iCol) {
		if (oTable.isA("sap.ui.table.Table")) {
			const oRowInstance = oTable.getRows().find(function (oRow) {
				return oRow.getIndex() === iRow;
			});

			return oRowInstance?.getCells()[iCol].$().parents("td")[0];
		} else {
			const oItem = oTable.getItems()[iRow];
			return oItem.getCells()[iCol].$().closest(".sapMTblCellFocusable")[0];
		}
	}

	QUnit.module("API", {
		beforeEach: async function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oTable = await getTable();
			this.oCellSelector = this.oTable.getDependents().find((oPlugin) => oPlugin.isA("sap.m.plugins.CellSelector"));
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("RangeLimit Property - getSelectionRange/getSelectedRowContexts APIs", function (assert) {
		const done = assert.async();
		const oTable = this.oTable;

		const oBinding = oTable.getBinding("rows");
		const oGetContextsSpy = sinon.spy(oBinding, "getContexts");
		assert.ok(oBinding.getLength() > this.oCellSelector.getRangeLimit());

		const oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.equal(oBinding.getAllCurrentContexts().length, oTable.getThreshold() + oTable.getRowMode().getRowCount());

		qutils.triggerKeyup(oCell, KeyCodes.SPACE, false, false, true /* Ctrl */); // enlarge selection to all rows and cells
		assert.equal(oGetContextsSpy.callCount, 1);
		assert.ok(oGetContextsSpy.calledWithExactly(0, this.oCellSelector.getRangeLimit(), 0, true));
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 0, colIndex: 0}, to: {rowIndex: Infinity, colIndex: 0}});

		oBinding.attachEventOnce("dataReceived", () => {
			assert.equal(oBinding.getAllCurrentContexts().length, this.oCellSelector.getRangeLimit());
			assert.equal(this.oCellSelector.getSelectedRowContexts().length, this.oCellSelector.getRangeLimit());
			assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(0, this.oCellSelector.getRangeLimit()));

			oGetContextsSpy.restore();
			done();
		});
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(CellSelector.findOn(this.oTable) === this.oCellSelector, "Plugin found via CellSelector.findOn");
	});

	QUnit.test("Drag compatibility", function(assert) {
		const oTable = this.oTable;

		assert.ok(this.oCellSelector.getEnabled(), "CellSelector is enabled");
		assert.ok(this.oCellSelector.isActive(), "CellSelector is active");

		oTable.removeDependent(this.oCellSelector);

		const oConfig = new DragDropInfo({
			sourceAggregation: "rows",
			targetAggregation: "rows",
			enabled: true
		});
		oTable.addDragDropConfig(oConfig);
		oTable.addDependent(this.oCellSelector);
		assert.ok(this.oCellSelector.isActive(), "CellSelector is active");

		const oSelectCellsSpy = sinon.spy(this.oCellSelector, "_selectCells");
		const oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.equal(oSelectCellsSpy.callCount, 0, "No cells are selected");
		assert.deepEqual(this.oCellSelector.getSelectionRange(), null);

		oConfig.setEnabled(false);
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.equal(oSelectCellsSpy.callCount, 1, "Cells have been selected");
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

		this.oCellSelector.removeSelection();

		oSelectCellsSpy.reset();

		const oDropInfo = new DropInfo({
			targetAggregation: "rows",
			enabled: true
		});
		oTable.addDragDropConfig(oDropInfo);

		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.equal(oSelectCellsSpy.callCount, 1, "Cells have been selected");
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});
	});

	QUnit.test("removeSelection with invalid session object", function (assert) {
		const oCell = getCell(this.oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

		this.oCellSelector.removeSelection();
		assert.deepEqual(this.oCellSelector.getSelectionRange(), null, "Selection has been removed");

		this.oCellSelector.exit();
		this.oCellSelector.removeSelection();
		assert.deepEqual(this.oCellSelector._oSession, { cellRefs: [], cellTypes: [] }, "Session has been cleared");
	});

	QUnit.test("getSelection", function (assert) {
		var oTable = this.oTable;
		const oCellSelector = this.oCellSelector;
		const oBinding = this.oTable.getBinding("rows");

		let oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 0, "Selection contains 0 column");
		assert.equal(oSelection.rows.length, 0, "Selection contains 0 rows");

		const fnSelectionChangeSpy = sinon.spy();
		oCellSelector.attachEvent("selectionChange", fnSelectionChangeSpy);

		let oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 1, "Selection contains one column");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 1, "Selection contains 1 row");
		assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains correct context");

		qutils.triggerKeydown(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oCell = getCell(oTable, 1, 1);
		qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oCell = getCell(oTable, 2, 1);
		qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
		assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains context of second row");
		assert.equal(oSelection.rows[1], oBinding.getContextByIndex(2), "Selection contains context of third row");
		assert.equal(oSelection.rows[2], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

		oSelection = oCellSelector.getSelection(true);
		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
		assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains context of second row");
		assert.equal(oSelection.rows[1], oBinding.getContextByIndex(2), "Selection contains context of third row");
		assert.equal(oSelection.rows[2], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

		// Grouping with V4 (Context with property)

		const oBindingContextStub = sinon.stub(oBinding.getContextByIndex(1), "getProperty");
		oBindingContextStub.withArgs("@ui5.node.isExpanded").returns(true);
		oSelection = oCellSelector.getSelection(true);

		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 2, "Selection contains only 2 rows (Group Header with V4)");
		assert.equal(oSelection.rows[0], oBinding.getContextByIndex(2), "Selection contains context of third row");
		assert.equal(oSelection.rows[1], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

		oBindingContextStub.restore();

		// Grouping with V2 (Node)

		// very hacky way to simulate grouping
		oBinding.getNodeByIndex = function(iIndex) {
			return iIndex == 1 ? "ignore" : "content";
		};
		oBinding.nodeHasChildren = function(oContext) {
			return oContext == "ignore";
		};

		oSelection = this.oCellSelector.getSelection(true);

		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 2, "Selection contains only 2 rows (Group Header with V2)");
		assert.equal(oSelection.rows[0], oBinding.getContextByIndex(2), "Selection contains context of third row");
		assert.equal(oSelection.rows[1], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

		this.oCellSelector.removeSelection();
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		this.oCellSelector.removeSelection();
		assert.equal(fnSelectionChangeSpy.callCount, 0);
		fnSelectionChangeSpy.reset();
	});

	QUnit.test("MDCTable - getSelection", async function(assert) {
		const done = assert.async();

		// Release CellSelector from preconfigured table
		this.oTable.removeDependent(this.oCellSelector);
		this.oTable.destroy();

		const oTable = await createMDCTable();
		oTable.addDependent(this.oCellSelector);

		await oTable.initialized();

		oTable._oTable.attachEventOnce("rowsUpdated", () => {
			assert.equal(oTable.getCellSelectorPluginOwner(), oTable._oTable, "The inner table is set as plugin owner for the CellSelector");
			assert.ok(this.oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
			assert.ok(this.oCellSelector.isActive(), "CellSelector is active");

			const oCell = oTable._oTable.getRows()[0].getCells()[0].$().parents("td")[0];

			let oSelection = this.oCellSelector.getSelection();
			assert.equal(oSelection.rows.length, 0, "No cells selected (rows)");
			assert.equal(oSelection.columns.length, 0, "No cells selected (columns)");

			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row

			oSelection = this.oCellSelector.getSelection();
			assert.equal(oSelection.rows.length, 1, "1 cell selected (rows)");
			assert.equal(oSelection.columns.length, 1, "1 cell selected (columns)");

			const oBinding = oTable._oTable.getBinding("rows");
			assert.equal(oSelection.rows[0], oBinding.getContexts(0, 1)[0], "Returned row context is correct");
			assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Retruned column is correct");
			assert.ok(oSelection.columns[0].isA("sap.ui.mdc.table.Column"), "Column is a MDCColumn");

			oTable.destroy();
			done();
		});
	});

	QUnit.module("Interaction - GridTable", {
		beforeEach: async function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = createGridTable();
			this.oTable.addDependent(this.oCellSelector);
			this.oTable.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Selection with mouse only with left-click", function(assert) {
		const oCellSelector = this.oCellSelector;
		const oCell = getCell(this.oTable, 1, 0); // first cell of first row

		qutils.triggerEvent("mousedown", oCell, { button: 0, ctrlKey: true }); // select first cell of first row with left-click/primary button
		assert.ok(oCellSelector._bMouseDown, "Flag has been set");
		qutils.triggerEvent("mouseup", oCell);
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");

		oCellSelector.removeSelection();
		assert.deepEqual(oCellSelector.getSelectionRange(), null, "Selection has been removed");

		qutils.triggerEvent("mousedown", oCell, { button: 1, ctrlKey: true }); // try to select with something else than left-click/primary button
		assert.notOk(oCellSelector._bMouseDown, "Flag has not been set");
		qutils.triggerEvent("mouseup", oCell);
		assert.deepEqual(oCellSelector.getSelectionRange(), null, "Nothing has been selected");
	});

	QUnit.test("_selectCells should not be called when hovering same cell", function(assert) {
		const oTable = this.oTable;
		const oCellSelector = this.oCellSelector;
		const oEvent = {target: null, preventDefault: () => {}, stopImmediatePropagation: () => {}};
		const oSelectCellsSpy = sinon.spy(oCellSelector, "_selectCells");

		let oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerEvent("mousedown", oCell, { button: 0, ctrlKey: true }); // select first cell of first row with left-click/primary button
		assert.ok(oCellSelector._bMouseDown, "Flag has been set");
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");
		assert.equal(oSelectCellsSpy.callCount, 1, "_selectCells was called once");

		oCell = getCell(oTable, 1, 1);
		oEvent.target = oCell;
		oCellSelector._onmousemove(oEvent);
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 1}}, "Cell has been selected");
		assert.equal(oSelectCellsSpy.callCount, 2, "_selectCells was called again");

		// Hover same cell again
		oCellSelector._onmousemove(oEvent);
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 1}}, "Cell has been selected");
		assert.equal(oSelectCellsSpy.callCount, 2, "_selectCells was not called again, as hovered cell has not changed");

		oCell = getCell(oTable, 1, 0);
		oEvent.target = oCell;
		oCellSelector._onmousemove(oEvent);
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");
		assert.equal(oSelectCellsSpy.callCount, 3, "_selectCells was called thrice as hovered cell changed");

		qutils.triggerEvent("mouseup", oCell);
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");
	});

	QUnit.test("Remove selection on _rowsUpdated", function(assert) {
		const oTable = this.oTable;
		const oCellSelector = this.oCellSelector;
		const oRemoveSelectionSpy = sinon.spy(oCellSelector, "removeSelection");

		oTable.fireEvent("_rowsUpdated", {reason: "expand"});
		assert.ok(oRemoveSelectionSpy.called, "removeSelection is called");
		oRemoveSelectionSpy.reset();
		oTable.fireEvent("_rowsUpdated", {reason: "collapse"});
		assert.ok(oRemoveSelectionSpy.called, "removeSelection is called");
	});

	QUnit.module("Interaction - ResponsiveTable", {
		beforeEach: async function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = createResponsiveTable();
			this.oTable.addDependent(this.oCellSelector);
			this.oTable.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Remove selection on updateFinished", function(assert) {
		const oTable = this.oTable;
		const oCellSelector = this.oCellSelector;
		const oRemoveSelectionSpy = sinon.spy(oCellSelector, "removeSelection");

		oTable.fireUpdateFinished({reason: "Sort"});
		assert.ok(oRemoveSelectionSpy.called, "removeSelection is called");
		oRemoveSelectionSpy.reset();
		oTable.fireUpdateFinished({reason: "Filter"});
		assert.ok(oRemoveSelectionSpy.called, "removeSelection is called");
	});

	QUnit.test("No hover effect on items during selection", function(assert) {
		const oTable = this.oTable;
		const oCellSelector = this.oCellSelector;
		const oEvent = {target: null, preventDefault: () => {}, stopImmediatePropagation: () => {}};

		let oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerEvent("mousedown", oCell, { button: 0, ctrlKey: true }); // select first cell of first row with left-click/primary button

		oCell = getCell(oTable, 1, 1);
		oEvent.target = oCell;
		oCellSelector._onmousemove(oEvent);
		oTable.getItems().forEach(function(oItem) {
			const aClasses = oItem.getDomRef().classList;
			assert.ok(!aClasses.contains("sapMLIBHoverable"), "Item has no hover effect during selection");
		});
		qutils.triggerEvent("mouseup", oCell, { button: 0 });
		oTable.getItems().forEach(function(oItem) {
			const aClasses = oItem.getDomRef().classList;
			assert.ok(aClasses.contains("sapMLIBHoverable"), "Item has hover effect after selection ended");
		});
	});

	QUnit.test("getSelection", function (assert) {
		var oTable = this.oTable;
		const oCellSelector = this.oCellSelector;

		let oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 0, "Selection contains 0 column");
		assert.equal(oSelection.rows.length, 0, "Selection contains 0 rows");

		const fnSelectionChangeSpy = sinon.spy();
		oCellSelector.attachEvent("selectionChange", fnSelectionChangeSpy);

		let oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.deepEqual(oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 1, "Selection contains one column");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 1, "Selection contains 1 row");
		assert.equal(oSelection.rows[0], oTable.getItems()[1].getBindingContext(), "Selection contains correct context");

		qutils.triggerKeydown(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oCell = getCell(oTable, 1, 1);
		qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oCell = getCell(oTable, 2, 1);
		qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		oSelection = oCellSelector.getSelection();
		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
		assert.equal(oSelection.rows[0], oTable.getItems()[1].getBindingContext(), "Selection contains context of second row");
		assert.equal(oSelection.rows[1], oTable.getItems()[2].getBindingContext(), "Selection contains context of third row");
		assert.equal(oSelection.rows[2], oTable.getItems()[3].getBindingContext(), "Selection contains context of fourth row");

		oSelection = oCellSelector.getSelection(true);
		assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
		assert.equal(oSelection.columns[0], oTable.getColumns()[0], "Selection contains correct column");
		assert.equal(oSelection.columns[1], oTable.getColumns()[1], "Selection contains correct column");
		assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
		assert.equal(oSelection.rows[0], oTable.getItems()[1].getBindingContext(), "Selection contains context of second row");
		assert.equal(oSelection.rows[1], oTable.getItems()[2].getBindingContext(), "Selection contains context of third row");
		assert.equal(oSelection.rows[2], oTable.getItems()[3].getBindingContext(), "Selection contains context of fourth row");

		this.oCellSelector.removeSelection();
		assert.equal(fnSelectionChangeSpy.callCount, 1);
		fnSelectionChangeSpy.reset();

		this.oCellSelector.removeSelection();
		assert.equal(fnSelectionChangeSpy.callCount, 0);
		fnSelectionChangeSpy.reset();
	});

	QUnit.test("keyboard remove selection", function (assert) {
		const oTable = this.oTable;
		const oCellSelector = this.oCellSelector;

		const fnSelectionChangeSpy = sinon.spy();
		oCellSelector.attachEvent("selectionChange", fnSelectionChangeSpy);

		let oCell = getCell(oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row

		oTable.addDelegate({
			onkeydown: function(oEvent) {
				oEvent.setMarked(oCellSelector.getConfig("eventClearedAll"));
			}
		}, true);

		oCell = getCell(oTable, 2, 0);
		qutils.triggerKeydown(oCell, KeyCodes.A, false, false, true);

		assert.equal(this.oCellSelector.getSelectionRange(), null, "Selection is cleared");
	});

	QUnit.module("Dialog Behavior", {
		beforeEach: async function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = createGridTable();
			this.oTable.addDependent(this.oCellSelector);

			this.oDialog = new Dialog({
				title: "Table Dialog",
				content: this.oTable
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Escape Handling", async function(assert) {
		this.oDialog.open();
		await new Promise((fnResolve) => {
			this.oDialog.attachEventOnce("afterOpen", function(oEvent) {
				assert.ok(oEvent.getSource().isOpen(), "Dialog is open");
				fnResolve();
			});
		});

		const oCell = getCell(this.oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

		qutils.triggerKeydown(oCell, KeyCodes.ESCAPE);
		qutils.triggerKeyup(oCell, KeyCodes.ESCAPE);
		await nextUIUpdate();

		assert.equal(this.oCellSelector.getSelectionRange(), null, "Selection is cleared");
		assert.ok(this.oDialog.isOpen(), "Dialog is still open");

		qutils.triggerKeydown(oCell, KeyCodes.ESCAPE);

		await new Promise((fnResolve) => {
			this.oDialog.attachEventOnce("afterClose", function(oEvent) {
				assert.notOk(oEvent.getSource().isOpen(), "Dialog is closed");
				fnResolve();
			});
		});
	});
});