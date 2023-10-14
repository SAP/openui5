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
	"sap/m/Dialog"
], function (Core, qutils, KeyCodes, CellSelector, GridTable, ODataModel, MockServer, GridColumn, GridFixedRowMode, Text, DragDropInfo, DropInfo, Dialog) {
	"use strict";

	const sServiceURI = "/service/";

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
			var oGetContextsSpy = sinon.spy(oBinding, "getContexts");
			assert.ok(oBinding.getLength() > this.oCellSelector.getRangeLimit());

			var oCell = getCell(this.oTable, 1, 0); // first cell of first row
			qutils.triggerKeydown(oCell, KeyCodes.SPACE); // select first cell of first row
			assert.equal(oBinding.getAllCurrentContexts().length, this.oTable.getThreshold() + this.oTable.getRowMode().getRowCount());

			qutils.triggerKeyup(oCell, KeyCodes.SPACE, false, false, true /* Ctrl */); // enlarge selection to all rows and cells
			assert.equal(oGetContextsSpy.callCount, 1);
			assert.ok(oGetContextsSpy.calledWithExactly(0, this.oCellSelector.getRangeLimit(), 0, true));
			assert.deepEqual(this.oCellSelector.getSelectionRange(), {from: {rowIndex: 0, colIndex: 0}, to: {rowIndex: Infinity, colIndex: 0}});

			oBinding.attachEventOnce("dataReceived", setTimeout.bind(0, () => {
				assert.equal(oBinding.getAllCurrentContexts().length, this.oCellSelector.getRangeLimit());
				assert.equal(this.oCellSelector.getSelectedRowContexts().length, this.oCellSelector.getRangeLimit());
				assert.deepEqual(this.oCellSelector.getSelectedRowContexts(), oBinding.getAllCurrentContexts().slice(0, this.oCellSelector.getRangeLimit()));

				oGetContextsSpy.restore();
				done();
			}));
		});
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