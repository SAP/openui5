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
	"sap/ui/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/m/Text"
], function (Core, qutils, KeyCodes, CellSelector, GridTable, GridColumn, JSONModel, Text) {
	"use strict";

	function getData() {
		var oData = [];
		for (var i = 0; i < 20; i++) {
			oData.push({
				name: "Name" + i,
				lastname: "Lastname" + i,
				birthday: "Birthday" + i,
				street: "Street" + i,
				city: "City" + i,
				state: "State" + i,
				country: "Country" + i,
				continent: "Continent" + i,
				occupation: "Occupation" + i
			});
		}
		return oData;
	}

	function createGridTable() {
		var oTable = new GridTable({
			title: "CellSelection Test Table",
			columns: [
				new GridColumn({label: new Text({text: "Name"}), template: new Text({text: "{name}", wrapping: false})}),
				new GridColumn({label: new Text({text: "Last Name"}), template: new Text({text: "{lastname}"})}),
				new GridColumn({label: new Text({text: "Birthday"}), template: new Text({text: "{lastname}"})}),
				new GridColumn({label: new Text({text: "Street"}), template: new Text({text: "{street}"})}),
				new GridColumn({label: new Text({text: "City"}), template: new Text({text: "{city}"})}),
				new GridColumn({label: new Text({text: "State"}), template: new Text({text: "{state}"})}),
				new GridColumn({label: new Text({text: "Country"}), template: new Text({text: "{country}"})}),
				new GridColumn({label: new Text({text: "Continent"}), template: new Text({text: "{continent}"})}),
				new GridColumn({label: new Text({text: "Occupation"}), template: new Text({text: "{occupation}"})})
			]
		});
		var oModel = new JSONModel();
		oModel.setData({modelData: getData()});
		oTable.setModel(oModel);
		oTable.bindRows({path: "/modelData"});
		return oTable;
	}

	function assertSelection(assert, oTable, oSourceCellRef, oTargetCellRef, sContainer) {
		var oCanvasRef = oTable.getDomRef(sContainer).querySelector(".sapMPluginsCellSelectorCanvas");
		// getBoundingClientRect can return slightly incorrect values differing from the set width (see Firefox for example), so we introduce an EPSILON value, which tries to circumvent such situations
		var EPSILON = 1; // only 1px difference allowed

		var oSourceRect = oSourceCellRef.getBoundingClientRect(), oTargetRect = oTargetCellRef.getBoundingClientRect();
		var iExpLeft = oSourceRect.left;
		var iExpWidth = oTargetRect.right - oSourceRect.left;
		var iExpTop = oSourceRect.top;
		var iExpHeight = oTargetRect.bottom - oSourceRect.top;

		var oCanvasRect = oCanvasRef.getBoundingClientRect();
		assert.ok(oCanvasRect.left == iExpLeft && oCanvasRect.top == iExpTop
			&& oCanvasRect.width - iExpWidth < EPSILON && oCanvasRect.height - iExpHeight < EPSILON, "Canvas is at correct location");
	}

	function assertEmptySelection(assert, oTable, sContainer) {
		var oCanvasRef = oTable.getDomRef(sContainer).querySelector(".sapMPluginsCellSelectorCanvas");

		assert.equal(oCanvasRef.style.display, "", "Canvas not visible");
	}

	QUnit.module("Basic Tests", {
		beforeEach: function () {
			this._oTable = createGridTable();

			this._oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this._oTable.destroy();
		}
	});

	QUnit.test("Activate & Deactivate CellSelection Plugin", function (assert) {
		assert.notOk(this._oTable.getDependents().length, "By default, cell selection plugin is not active/existing");
		var oCellSelector = new CellSelector();
		var fnOnActivate = sinon.spy(oCellSelector, "onActivate");
		var fnOnDeactivate = sinon.spy(oCellSelector, "onDeactivate");

		this._oTable.addDependent(oCellSelector);
		assert.ok(this._oTable.getDependents().length, "Table has dependent");
		assert.ok(this._oTable.getDependents()[0].isA("sap.m.plugins.CellSelector"), "CellSelector plugin added as dependent");
		assert.ok(fnOnActivate.called, "Plugin is activated");
		assert.ok(this._oTable.hasListeners("firstVisibleRowChanged"), "firstVisibleRowChanged listener added");

		oCellSelector.setEnabled(false);
		assert.ok(fnOnDeactivate.called, "Plugin is deactivated");
		assert.notOk(this._oTable.hasListeners("firstVisibleRowChanged"), "firstVisibleRowChanged listener removed");
	});

	QUnit.module("Cell Selection - Keyboard", {
		beforeEach: function () {
			this._oTable = createGridTable();
			this._oCellSelector = new CellSelector();
			this._oTable.addDependent(this._oCellSelector);

			this._oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this._oTable.destroy();
		}
	});

	QUnit.test("Select and deselect single cell", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var aRows = this._oTable.getRows();
			assert.ok(aRows.length, "Rows are rendered");

			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");
			var oCellRef = aRows[2].getCells()[2].$().parents("td")[0];
			oCellRef.focus();
			qutils.triggerKeydown(oCellRef, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");

			oSelectCellsSpy.restore();

			// Move 2 to the right
			qutils.triggerKeydown(oCellRef, KeyCodes.ARROW_RIGHT, true);
			qutils.triggerKeydown(aRows[2].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_RIGHT, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, aRows[2].getCells()[4].$().parents("td")[0], "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Move 2 down
			qutils.triggerKeydown(aRows[2].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_DOWN, true);
			qutils.triggerKeydown(aRows[3].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_DOWN, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, aRows[4].getCells()[4].$().parents("td")[0], "tableCtrlCnt");

			oSelectCellsSpy.restore();

			// Move 4 up
			qutils.triggerKeydown(aRows[4].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(aRows[3].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(aRows[2].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(aRows[1].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_UP, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, aRows[0].getCells()[2].$().parents("td")[0], aRows[2].getCells()[4].$().parents("td")[0], "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Move 4 left
			qutils.triggerKeydown(aRows[2].getCells()[4].$().parents("td")[0], KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(aRows[2].getCells()[3].$().parents("td")[0], KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(aRows[2].getCells()[2].$().parents("td")[0], KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(aRows[2].getCells()[1].$().parents("td")[0], KeyCodes.ARROW_LEFT, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, aRows[0].getCells()[0].$().parents("td")[0], aRows[2].getCells()[2].$().parents("td")[0], "tableCtrlCnt");
			oSelectCellsSpy.restore();

			qutils.triggerKeydown(oCellRef, KeyCodes.A, true, false, true);
			assertEmptySelection(assert, this._oTable, "tableCtrlCnt");
			oSelectCellsSpy.restore();
		}.bind(this));
	});

	QUnit.test("Select and deselect single row area", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var aRows = this._oTable.getRows();
			assert.ok(aRows.length, "Rows are rendered");

			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");

			// Select first cell
			var oCellRefA = aRows[0].getCells()[0].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Select cell to the right
			var oCellRefB = aRows[0].getCells()[1].$().parents("td")[0];
			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_RIGHT, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			oCellRefA = aRows[0].getCells()[0].$().parents("td")[0];
			assertSelection(assert, this._oTable, oCellRefA, oCellRefB, "tableCtrlCnt");
		}.bind(this));
	});

	QUnit.test("Select/Deselect with Home/End", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var aRows = this._oTable.getRows();
			assert.ok(aRows.length, "Rows are rendered");

			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");

			// Select first cell
			var oCellRefA = aRows[0].getCells()[3].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Select cells to the right (END)
			qutils.triggerKeydown(oCellRefA, KeyCodes.END, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");

			var aCells = aRows[0].getCells();
			assertSelection(assert, this._oTable, oCellRefA, aCells[aCells.length - 1].$().parents("td")[0], "tableCtrlCnt");

			// Select cells to the left (HOME)
			qutils.triggerKeydown(aCells[aCells.length - 1].$().parents("td")[0], KeyCodes.HOME, true);
			assertSelection(assert, this._oTable, aCells[0].$().parents("td")[0], oCellRefA, "tableCtrlCnt");

			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");

			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_DOWN, true);
			assertSelection(assert, this._oTable, oCellRefA, aRows[1].getCells()[3].$().parents("td")[0], "tableCtrlCnt");

			// Select multi row cells to the right (END)
			qutils.triggerKeydown(oCellRefA, KeyCodes.END, true);
			assertSelection(assert, this._oTable, oCellRefA, aRows[1].getCells()[aCells.length - 1].$().parents("td")[0], "tableCtrlCnt");

			// Select multi row cells to the left (HOME)
			qutils.triggerKeydown(aRows[1].getCells()[aCells.length - 1].$().parents("td")[0], KeyCodes.HOME, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, aCells[0].$().parents("td")[0], aRows[1].getCells()[3].$().parents("td")[0], "tableCtrlCnt");
		}.bind(this));
	});

	QUnit.test("Select/Deselect whole row with cell selection", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var aRows = this._oTable.getRows();
			assert.ok(aRows.length, "Rows are rendered");

			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");

			// Select third cell in second row
			var oCellRefA = aRows[1].getCells()[2].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			var aCells = aRows[1].getCells();
			// Select whole row
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, aCells[0].$().parents("td")[0], aCells[aCells.length - 1].$().parents("td")[0], "tableCtrlCnt");

			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 1, colIndex: 0}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 1, colIndex: (aRows[1].getCells().length - 1)}, "Target cell coordinates are correct");

			oSelectCellsSpy.restore();

			// Select two rows and then select whole row
			// Select third cell in fourth row
			oCellRefA = aRows[3].getCells()[2].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");

			// Navigate down
			var oCellRefB = aRows[4].getCells()[2].$().parents("td")[0];
			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_DOWN, true);
			assertSelection(assert, this._oTable, oCellRefA, oCellRefB, "tableCtrlCnt");

			// Select whole rows
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, true);
			assertSelection(assert, this._oTable, aRows[3].getCells()[0].$().parents("td")[0], aRows[4].getCells()[aCells.length - 1].$().parents("td")[0], "tableCtrlCnt");

			// Clear Selection
			qutils.triggerKeydown(oCellRefA, KeyCodes.A, true, false, true);
			assertEmptySelection(assert, this._oTable);
		}.bind(this));
	});

	QUnit.test("Select/Deselect whole column with cell selection", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var aRows = this._oTable.getRows();
			var iTotalRows = this._oTable._getTotalRowCount();
			var iPages = Math.floor(iTotalRows / aRows.length);
			assert.ok(aRows.length, "Rows are rendered");

			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");

			// Select third cell in second row
			var oCellRefA = aRows[1].getCells()[2].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Select whole column
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, false, false, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");

			for (var iRows = 0; iRows < iPages; iRows++) {
				var oRow = aRows[0];
				assertSelection(assert, this._oTable, oRow.getCells()[2].$().parents("td")[0], aRows[aRows.length - 1].getCells()[2].$().parents("td")[0], "tableCtrlCnt");
				this._oTable.setFirstVisibleRow(aRows.length + 1);
			}
			this._oTable.setFirstVisibleRow(0);

			// Select column block
			// Select single cell
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");

			// Navigate right
			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_RIGHT, true);
			assertSelection(assert, this._oTable, oCellRefA, aRows[1].getCells()[3].$().parents("td")[0], "tableCtrlCnt");

			// Select two columns
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, false, false, true);
			for (var iRows = 0; iRows < iPages; iRows++) {
				var oRow = aRows[0];
				assertSelection(assert, this._oTable, oRow.getCells()[2].$().parents("td")[0], aRows[aRows.length - 1].getCells()[3].$().parents("td")[0], "tableCtrlCnt");
				this._oTable.setFirstVisibleRow(aRows.length + 1);
			}

			oSelectCellsSpy.restore();
		}.bind(this));
	});
});