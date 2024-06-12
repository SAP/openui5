/*!
 * ${copyright}
 */
/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/plugins/CellSelector",
	"sap/ui/table/Table",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/m/Text",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column"
], function (Core, qutils, KeyCodes, CellSelector, GridTable, ODataModel, MockServer, GridColumn, GridFixedRowMode, Text, DragDropInfo, DropInfo, Dialog, JSONModel, CustomData, MDCTable, MDCColumn) {
	"use strict";

	const sServiceURI = "/service/";

	var aData = [];
	for (var i = 0; i < 25; i++) {
		aData.push({
			id: i,
			name: "name" + i,
			color: "color" + (i % 10)
		});
	}

	var oJSONModel = new JSONModel(aData);

	function createTable() {
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

	function createMDCTable(mSettings) {
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

		var oTable = new MDCTable(mSettings);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		return oTable;
	}

	function getCell(oTable, iRow, iCol) {
		var oRowInstance = oTable.getRows().find(function (oRow) {
			return oRow.getIndex() === iRow;
		});
		if (oRowInstance) {
			return oRowInstance.getCells()[iCol].$().parents("td")[0];
		}
	}

	QUnit.module("API", {
		beforeEach: function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = createTable();
			this.oTable.addDependent(this.oCellSelector);
			this.oTable.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("RangeLimit Property - getSelectionRange/getSelectedRowContexts APIs", function (assert) {
		this.oTable.addDependent(this.oCellSelector);
		var done = assert.async();

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oBinding = this.oTable.getBinding("rows");
			// var oGetContextsSpy = sinon.spy(oBinding, "getContexts");
			assert.ok(oBinding.getLength() > this.oCellSelector.getRangeLimit());

			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oBinding.getAllCurrentContexts().length, this.oTable.getThreshold() + this.oTable.getRowMode().getRowCount());

			// qutils.triggerKeyup(oCell, KeyCodes.SPACE, false, false, true /* Ctrl */); // enlarge selection to all rows and cells
			// assert.equal(oGetContextsSpy.callCount, 1);
			// assert.ok(oGetContextsSpy.calledWithExactly(0, this.oCellSelector.getRangeLimit(), 0, true));
			// assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 0, colIndex: 0}, to: {rowIndex: Infinity, colIndex: 0}});

			qutils.triggerKeydown(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
			qutils.triggerKeyup(oCell, KeyCodes.ARROW_RIGHT, true, false, false);

			oCell = getCell(this.oTable, 1, 1);
			qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
			qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);

			// Commenting as Column Selection feature will be changed/adjusted in a separate BLI
			// qutils.triggerKeyup(oCell, KeyCodes.SPACE, false, false, true /* Ctrl */); // enlarge selection to all rows and cells
			// assert.equal(oGetContextsSpy.callCount, 1);
			// assert.ok(oGetContextsSpy.calledWithExactly(0, this.oCellSelector.getRangeLimit(), 0, true));

			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 2, colIndex: 1}});
			assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(1, 3));

			// Commenting as Column Selection feature will be changed/adjusted in a separate BLI
			// oBinding.attachEventOnce("dataReceived", () => {
			// 	assert.equal(oBinding.getAllCurrentContexts().length, this.oCellSelector.getRangeLimit());
			// 	assert.equal(this.oCellSelector.getSelectedRowContexts().length, this.oCellSelector.getRangeLimit());
			// 	assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(0, this.oCellSelector.getRangeLimit()));
			// 	assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(1, 2));

			// 	oGetContextsSpy.restore();
			done();
		});
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(CellSelector.findOn(this.oTable) === this.oCellSelector, "Plugin found via CellSelector.findOn");
	});

	QUnit.test("Drag compatibility", function(assert) {
		var done = assert.async();
		this.oTable.addDependent(this.oCellSelector);
		assert.ok(this.oCellSelector.getEnabled(), "CellSelector is enabled");
		assert.ok(this.oCellSelector.isActive(), "CellSelector is active");

		this.oTable.removeDependent(this.oCellSelector);

		const oConfig = new DragDropInfo({
			sourceAggregation: "rows",
			targetAggregation: "rows",
			enabled: true
		});
		this.oTable.addDragDropConfig(oConfig);
		this.oTable.addDependent(this.oCellSelector);
		assert.ok(this.oCellSelector.isActive(), "CellSelector is active");
		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oSelectCellsSpy = sinon.spy(this.oCellSelector, "_selectCells");
			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oSelectCellsSpy.callCount, 0, "No cells are selected");
			assert.deepEqual(this.oCellSelector.getSelectionRange(), null);

			oConfig.setEnabled(false);
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oSelectCellsSpy.callCount, 1, "Cells have been selected");
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

			this.oCellSelector.removeSelection();

			oSelectCellsSpy.reset();

			const oDropInfo = new DropInfo({
				targetAggregation: "rows",
				enabled: true
			});
			this.oTable.addDragDropConfig(oDropInfo);

			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oSelectCellsSpy.callCount, 1, "Cells have been selected");
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

			done();
		});
	});

	QUnit.test("removeSelection with invalid session object", function (assert) {
		this.oTable.addDependent(this.oCellSelector);
		var done = assert.async();

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

			this.oCellSelector.removeSelection();
			assert.deepEqual(this.oCellSelector.getSelectionRange(), null, "Selection has been removed");

			this.oCellSelector.exit();
			this.oCellSelector.removeSelection();
			assert.deepEqual(this.oCellSelector._oSession, { cellRefs: [] }, "Session has been cleared");

			done();
		});
	});

	QUnit.test("getSelection", function (assert) {
		this.oTable.addDependent(this.oCellSelector);
		var done = assert.async();

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oBinding = this.oTable.getBinding("rows");

			var oSelection = this.oCellSelector.getSelection();
			assert.equal(oSelection.columns.length, 0, "Selection contains 0 column");
			assert.equal(oSelection.rows.length, 0, "Selection contains 0 rows");

			const fnSelectionChangeSpy = sinon.spy();
			this.oCellSelector.attachEvent("selectionChange", fnSelectionChangeSpy);

			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});
			assert.equal(fnSelectionChangeSpy.callCount, 1);
			fnSelectionChangeSpy.reset();

			oSelection = this.oCellSelector.getSelection();
			assert.equal(oSelection.columns.length, 1, "Selection contains one column");
			assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Selection contains correct column");
			assert.equal(oSelection.rows.length, 1, "Selection contains 1 row");
			assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains correct context");

			qutils.triggerKeydown(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
			qutils.triggerKeyup(oCell, KeyCodes.ARROW_RIGHT, true, false, false);
			assert.equal(fnSelectionChangeSpy.callCount, 1);
			fnSelectionChangeSpy.reset();

			oCell = getCell(this.oTable, 1, 1);
			qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
			qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
			assert.equal(fnSelectionChangeSpy.callCount, 1);
			fnSelectionChangeSpy.reset();

			oCell = getCell(this.oTable, 2, 1);
			qutils.triggerKeydown(oCell, KeyCodes.ARROW_DOWN, true, false, false);
			qutils.triggerKeyup(oCell, KeyCodes.ARROW_DOWN, true, false, false);
			assert.equal(fnSelectionChangeSpy.callCount, 1);
			fnSelectionChangeSpy.reset();

			oSelection = this.oCellSelector.getSelection();
			assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
			assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Selection contains correct column");
			assert.equal(oSelection.columns[1], this.oTable.getColumns()[1], "Selection contains correct column");
			assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
			assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains context of second row");
			assert.equal(oSelection.rows[1], oBinding.getContextByIndex(2), "Selection contains context of third row");
			assert.equal(oSelection.rows[2], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

			oSelection = this.oCellSelector.getSelection(true);
			assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
			assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Selection contains correct column");
			assert.equal(oSelection.columns[1], this.oTable.getColumns()[1], "Selection contains correct column");
			assert.equal(oSelection.rows.length, 3, "Selection contains 3 rows");
			assert.equal(oSelection.rows[0], oBinding.getContextByIndex(1), "Selection contains context of second row");
			assert.equal(oSelection.rows[1], oBinding.getContextByIndex(2), "Selection contains context of third row");
			assert.equal(oSelection.rows[2], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

			// Grouping with V4 (Context with property)

			const oBindingContextStub = sinon.stub(oBinding.getContextByIndex(1), "getProperty");
			oBindingContextStub.withArgs("@ui5.node.isExpanded").returns(true);
			oSelection = this.oCellSelector.getSelection(true);

			assert.equal(oSelection.columns.length, 2, "Selection contains 2 columns");
			assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Selection contains correct column");
			assert.equal(oSelection.columns[1], this.oTable.getColumns()[1], "Selection contains correct column");
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
			assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Selection contains correct column");
			assert.equal(oSelection.columns[1], this.oTable.getColumns()[1], "Selection contains correct column");
			assert.equal(oSelection.rows.length, 2, "Selection contains only 2 rows (Group Header with V2)");
			assert.equal(oSelection.rows[0], oBinding.getContextByIndex(2), "Selection contains context of third row");
			assert.equal(oSelection.rows[1], oBinding.getContextByIndex(3), "Selection contains context of fourth row");

			this.oCellSelector.removeSelection();
			assert.equal(fnSelectionChangeSpy.callCount, 1);
			fnSelectionChangeSpy.reset();

			this.oCellSelector.removeSelection();
			assert.equal(fnSelectionChangeSpy.callCount, 0);
			fnSelectionChangeSpy.reset();

			done();
		});
	});

	QUnit.test("Selection with mouse only with left-click", function(assert) {
		this.oTable.addDependent(this.oCellSelector);
		var done = assert.async();

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerEvent("mousedown", oCell, { button: 0, ctrlKey: true }); // select first cell of first row with left-click/primary button
			assert.ok(this.oCellSelector._bMouseDown, "Flag has been set");
			qutils.triggerEvent("mouseup", oCell);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");

			this.oCellSelector.removeSelection();
			assert.deepEqual(this.oCellSelector.getSelectionRange(), null, "Selection has been removed");

			qutils.triggerEvent("mousedown", oCell, { button: 1, ctrlKey: true }); // try to select with something else than left-click/primary button
			assert.notOk(this.oCellSelector._bMouseDown, "Flag has not been set");
			qutils.triggerEvent("mouseup", oCell);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), null, "Nothing has been selected");

			done();
		});
	});

	QUnit.test("_selectCells should not be called when hovering same cell", function(assert) {
		this.oTable.addDependent(this.oCellSelector);
		var done = assert.async();

		const oEvent = {target: null, preventDefault: () => {}};
		const oSelectCellsSpy = sinon.spy(this.oCellSelector, "_selectCells");

		this.oTable.attachEventOnce("rowsUpdated", () => {
			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerEvent("mousedown", oCell, { button: 0, ctrlKey: true }); // select first cell of first row with left-click/primary button
			assert.ok(this.oCellSelector._bMouseDown, "Flag has been set");
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");
			assert.equal(oSelectCellsSpy.callCount, 1, "_selectCells was called once");

			oCell = getCell(this.oTable, 1, 1);
			oEvent.target = oCell;
			this.oCellSelector._onmousemove(oEvent);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 1}}, "Cell has been selected");
			assert.equal(oSelectCellsSpy.callCount, 2, "_selectCells was called again");

			// Hover same cell again
			this.oCellSelector._onmousemove(oEvent);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 1}}, "Cell has been selected");
			assert.equal(oSelectCellsSpy.callCount, 2, "_selectCells was not called again, as hovered cell has not changed");

			oCell = getCell(this.oTable, 1, 0);
			oEvent.target = oCell;
			this.oCellSelector._onmousemove(oEvent);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");
			assert.equal(oSelectCellsSpy.callCount, 3, "_selectCells was called thrice as hovered cell changed");

			qutils.triggerEvent("mouseup", oCell);
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}}, "Cell has been selected");

			done();
		});
	});

	QUnit.test("MDCTable - getSelection", function(assert) {
		const done = assert.async();
		this.oTable.removeDependent(this.oCellSelector);
		this.oTable.destroy();
		this.oTable = createMDCTable();
		this.oTable.addDependent(this.oCellSelector);

		this.oTable.initialized().then(() => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", () => {
				assert.equal(this.oTable.getCellSelectorPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for the CellSelector");
				assert.ok(this.oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
				assert.ok(this.oCellSelector.isActive(), "CellSelector is active");

				const oCell = this.oTable._oTable.getRows()[0].getCells()[0].$().parents("td")[0];

				let oSelection = this.oCellSelector.getSelection();
				assert.equal(oSelection.rows.length, 0, "No cells selected (rows)");
				assert.equal(oSelection.columns.length, 0, "No cells selected (columns)");

				qutils.triggerKeydown(oCell, KeyCodes.SPACE);

				oSelection = this.oCellSelector.getSelection();
				assert.equal(oSelection.rows.length, 1, "1 cell selected (rows)");
				assert.equal(oSelection.columns.length, 1, "1 cell selected (columns)");

				const oBinding = this.oTable._oTable.getBinding("rows");
				assert.equal(oSelection.rows[0], oBinding.getContexts(0, 1)[0], "Returned row context is correct");
				assert.equal(oSelection.columns[0], this.oTable.getColumns()[0], "Retruned column is correct");
				assert.ok(oSelection.columns[0].isA("sap.ui.mdc.table.Column"), "Column is a MDCColumn");

				done();
			});
		});
	});

	QUnit.module("Dialog Behavior", {
		beforeEach: function() {
			this.oMockServer = new MockServer({ rootUri : sServiceURI });
			this.oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
			this.oMockServer.start();

			this.oCellSelector = new CellSelector({ rangeLimit: 15 });
			this.oTable = createTable();
			this.oTable.addDependent(this.oCellSelector);

			this.oDialog = new Dialog({
				title: "Table Dialog",
				content: this.oTable
			}).placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach: function() {
			this.oMockServer.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Escape Handling", function(assert) {
		var clock = sinon.useFakeTimers();
		this.oDialog.open();
		clock.tick(500);
		Core.applyChanges();

		var oCell = getCell(this.oTable, 1, 0); // first cell of first row
		qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
		qutils.triggerKeyup(oCell, KeyCodes.SPACE); // select first cell of first row
		assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 1, colIndex: 0}, to: {rowIndex: 1, colIndex: 0}});

		qutils.triggerKeydown(oCell, KeyCodes.ESCAPE);
		qutils.triggerKeyup(oCell, KeyCodes.ESCAPE);
		clock.tick(500);
		Core.applyChanges();

		assert.equal(this.oCellSelector.getSelectionRange(), null, "Selection is cleared");
		assert.ok(this.oDialog.isOpen(), "Dialog is still open");

		qutils.triggerKeydown(oCell, KeyCodes.ESCAPE);
		clock.tick(500);
		Core.applyChanges();

		assert.notOk(this.oDialog.isOpen(), "Dialog is closed");
	});
});