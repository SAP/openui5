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
	"sap/m/Text",
	"sap/ui/thirdparty/jquery"
], function (Core, qutils, KeyCodes, CellSelector, GridTable, GridColumn, JSONModel, Text, jQuery) {
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

	function getCell(oTable, iRow, iCol) {
		var oRowInstance = oTable.getRows().find(function (oRow) {
			return oRow.getIndex() === iRow;
		});
		if (oRowInstance) {
			return oRowInstance.getCells()[iCol].$().parents("td")[0];
		}
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
			var oCellRef = getCell(this._oTable, 2, 2);
			oCellRef.focus();
			qutils.triggerKeydown(oCellRef, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");

			oSelectCellsSpy.restore();

			// Move 2 to the right
			qutils.triggerKeydown(oCellRef, KeyCodes.ARROW_RIGHT, true);
			qutils.triggerKeydown(getCell(this._oTable, 2, 3), KeyCodes.ARROW_RIGHT, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, getCell(this._oTable, 2, 4), "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Move 2 down
			qutils.triggerKeydown(getCell(this._oTable, 2, 3), KeyCodes.ARROW_DOWN, true);
			qutils.triggerKeydown(getCell(this._oTable, 3, 3), KeyCodes.ARROW_DOWN, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRef, getCell(this._oTable, 4, 4), "tableCtrlCnt");

			oSelectCellsSpy.restore();

			// Move 4 up
			qutils.triggerKeydown(getCell(this._oTable, 4, 3), KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(getCell(this._oTable, 3, 3), KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(getCell(this._oTable, 2, 3), KeyCodes.ARROW_UP, true);
			qutils.triggerKeydown(getCell(this._oTable, 1, 3), KeyCodes.ARROW_UP, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, getCell(this._oTable, 0, 2), getCell(this._oTable, 2, 4), "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Move 4 left
			qutils.triggerKeydown(getCell(this._oTable, 2, 4), KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(getCell(this._oTable, 2, 3), KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(getCell(this._oTable, 2, 2), KeyCodes.ARROW_LEFT, true);
			qutils.triggerKeydown(getCell(this._oTable, 2, 1), KeyCodes.ARROW_LEFT, true);

			assert.ok(oSelectCellsSpy.called, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, getCell(this._oTable, 0, 0), getCell(this._oTable, 2, 2), "tableCtrlCnt");
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
			var oCellRefA = getCell(this._oTable, 0, 3);
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Select cells to the right (END)
			qutils.triggerKeydown(oCellRefA, KeyCodes.END, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");

			var aCells = aRows[0].getCells();
			assertSelection(assert, this._oTable, oCellRefA, getCell(this._oTable, 0, aCells.length - 1), "tableCtrlCnt");

			// Select cells to the left (HOME)
			qutils.triggerKeydown(getCell(this._oTable, 0, aCells.length - 1), KeyCodes.HOME, true);
			assertSelection(assert, this._oTable, getCell(this._oTable, 0, 0), oCellRefA, "tableCtrlCnt");

			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");

			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_DOWN, true);
			assertSelection(assert, this._oTable, oCellRefA, getCell(this._oTable, 1, 3), "tableCtrlCnt");

			// Select multi row cells to the right (END)
			qutils.triggerKeydown(oCellRefA, KeyCodes.END, true);
			assertSelection(assert, this._oTable, oCellRefA, getCell(this._oTable, 1, aCells.length - 1), "tableCtrlCnt");

			// Select multi row cells to the left (HOME)
			qutils.triggerKeydown(getCell(this._oTable, 1, aCells.length - 1), KeyCodes.HOME, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, getCell(this._oTable, 0, 0), getCell(this._oTable, 1, 3), "tableCtrlCnt");
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
			var oCellRefA = getCell(this._oTable, 1, 2);
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			var aCells = aRows[1].getCells();
			// Select whole row
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, getCell(this._oTable, 1, 0), getCell(this._oTable, 1, aCells.length - 1), "tableCtrlCnt");

			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 1, colIndex: -Infinity}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 1, colIndex: +Infinity}, "Target cell coordinates are correct");

			oSelectCellsSpy.restore();

			// Select two rows and then select whole row
			// Select third cell in fourth row
			oCellRefA = aRows[3].getCells()[2].$().parents("td")[0];
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");

			// Navigate down
			var oCellRefB = getCell(this._oTable, 4, 2);
			qutils.triggerKeydown(oCellRefA, KeyCodes.ARROW_DOWN, true);
			assertSelection(assert, this._oTable, oCellRefA, oCellRefB, "tableCtrlCnt");

			// Select whole rows
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, true);
			assertSelection(assert, this._oTable, getCell(this._oTable, 3, 0), getCell(this._oTable, 4, aCells.length - 1), "tableCtrlCnt");

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
			var oCellRefA = getCell(this._oTable, 1, 2);
			oCellRefA.focus();
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");
			assertSelection(assert, this._oTable, oCellRefA, oCellRefA, "tableCtrlCnt");
			oSelectCellsSpy.restore();

			// Select whole column
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, false, false, true);
			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's _selectCells method called");

			for (var iRows = 0; iRows < iPages; iRows++) {
				var iLastRow = (this._oTable.getFirstVisibleRow() + aRows.length - 1) < iTotalRows ?  (this._oTable.getFirstVisibleRow() + aRows.length - 1) : iTotalRows;
				assertSelection(assert, this._oTable, getCell(this._oTable, this._oTable.getFirstVisibleRow(), 2), getCell(this._oTable, iLastRow, 2), "tableCtrlCnt");
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
			assertSelection(assert, this._oTable, oCellRefA, getCell(this._oTable, 1, 3), "tableCtrlCnt");

			// Select two columns
			qutils.triggerKeydown(oCellRefA, KeyCodes.SPACE, false, false, true);
			for (var iRows = 0; iRows < iPages; iRows++) {
				var iLastRow = (this._oTable.getFirstVisibleRow() + aRows.length - 1) < iTotalRows ?  (this._oTable.getFirstVisibleRow() + aRows.length - 1) : iTotalRows;
				assertSelection(assert, this._oTable, getCell(this._oTable, this._oTable.getFirstVisibleRow(), 2), getCell(this._oTable, iLastRow, 3), "tableCtrlCnt");
				this._oTable.setFirstVisibleRow(aRows.length + 1);
			}

			oSelectCellsSpy.restore();
		}.bind(this));
	});

	QUnit.module("CellSelection - Mouse", {
		beforeEach: function () {
			this._oTable = createGridTable();
			this._oCellSelector = new CellSelector();
			this._oTable.addDependent(this._oCellSelector);

			this._oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this._oTable.destroy();
		},
		createEvent: function (sEventName, oTarget, oParams) {
			var oEvent = jQuery.Event(sEventName);
			oEvent.originalEvent = {};
			oEvent.target = oTarget;
			oEvent.preventDefault = function () {};
			if (oParams) {
				for (var x in oParams) {
					oEvent[x] = oParams[x];
					oEvent.originalEvent[x] = oParams[x];
				}
			}
			return oEvent;
		}
	});

	QUnit.test("Select a single cell", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");

			// Select Cell (2, 2)
			var oCellRef = getCell(this._oTable, 2, 2);

			var oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 2}, "Target cell coordinates are correct");

			// Select Cell (3, 2).
			oCellRef = getCell(this._oTable, 3, 2);
			oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assert.ok(oSelectCellsSpy.calledTwice, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 3, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 3, colIndex: 2}, "Target cell coordinates are correct");
		}.bind(this));
	});

	QUnit.test("Select an area with click and then mouse moving", function (assert) {
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var oSelectCellsSpy = sinon.spy(this._oCellSelector, "_selectCells");
			var oMousePosStub = sinon.stub(this._oCellSelector, "_getMousePosition");

			// Select Cell (2, 2)
			var oCellRef = getCell(this._oTable, 2, 2);

			var oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assert.ok(oSelectCellsSpy.calledOnce, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 2}, "Target cell coordinates are correct");

			oSelectCellsSpy.restore();

			// Select from Cell (2, 2) to Cell (4, 4)
			var oCellTargetRef = getCell(this._oTable, 4, 4);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef, {clientX: 0, clientY: 0});
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assert.ok(oSelectCellsSpy.called, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellRef, oCellTargetRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 4, colIndex: 4}, "Target cell coordinates are correct");

			// Continue Selection from (2, 2) to Cell (0, 0)
			oCellTargetRef = getCell(this._oTable, 0, 0);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef, {clientX: 0, clientY: 0});
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assert.ok(oSelectCellsSpy.called, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellTargetRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 0, colIndex: 0}, "Target cell coordinates are correct");

			// Continue Selection from (2, 2) to Cell (2, 0)
			oCellTargetRef = getCell(this._oTable, 2, 0);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef, {clientX: 0, clientY: 0});
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assert.ok(oSelectCellsSpy.called, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellTargetRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 0}, "Target cell coordinates are correct");

			// Continue Selection from (2, 2) to Cell (0, 1)
			oCellTargetRef = getCell(this._oTable, 0, 1);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef, {clientX: 0, clientY: 0});
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assert.ok(oSelectCellsSpy.called, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellTargetRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 0, colIndex: 1}, "Target cell coordinates are correct");

			// Reset Selection to single Cell (3, 3)
			var oCellRef = getCell(this._oTable, 3, 3);

			oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assert.ok(oSelectCellsSpy.called, "CellSelector's method _selectCells was called");
			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 3, colIndex: 3}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 3, colIndex: 3}, "Target cell coordinates are correct");

			oMousePosStub.restore();
		}.bind(this));
	});

	QUnit.test("Enhance selection via borders", function (assert) {
		/**
		 * Resets selection back to given cell
		 */
		function resetSelection (oCellRef, oTable, oCellSelector, assert, that) {
			var oTouchStart = that.createEvent("touchstart", oCellRef);
			that._oCellSelector.ontouchstart(oTouchStart);

			assertSelection(assert, oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 2}, "Target cell coordinates are correct");
		}
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var oMousePosStub = sinon.stub(this._oCellSelector, "_getMousePosition");
			var oTestData = {
				"N": {cell: [0, 4], target: [0, 2]},
				"E": {cell: [4, 4], target: [2, 4]},
				"S": {cell: [4, 4], target: [4, 2]},
				"W": {cell: [4, 0], target: [2, 0]}
			};

			var oCellRef = getCell(this._oTable, 2, 2);
			resetSelection(oCellRef, this._oTable, this._oCellSelector, assert, this);
			Object.entries(oTestData).forEach(function (aEntry) {
				// Emulate border "touchstart"
				this._oCellSelector._onHandleMove(aEntry[0], true);

				var oTestBorderData = oTestData[aEntry[0]];
				var oMovedCell = getCell(this._oTable, oTestBorderData.cell[0], oTestBorderData.cell[1]);
				var oTargetCell = getCell(this._oTable, oTestBorderData.target[0], oTestBorderData.target[1]);

				var oTouchMove = this.createEvent("touchmove", oMovedCell);
				oMousePosStub.returns({x: 4, y: 4});
				this._oCellSelector.ontouchmove(oTouchMove);

				if (aEntry[0] === "N" || aEntry[0] === "W") {
					assertSelection(assert, this._oTable, oTargetCell, oCellRef, "tableCtrlCnt");
				} else {
					assertSelection(assert, this._oTable, oCellRef, oTargetCell, "tableCtrlCnt");
				}
				assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
				assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: oTestBorderData.target[0], colIndex: oTestBorderData.target[1]}, "Target cell coordinates are correct for direction " + aEntry[0]);

				this._oCellSelector._onmouseup();
				assert.equal(this._oCellSelector._oBorderMoveInfo, null, "Border move information is reset");

				resetSelection(oCellRef, this._oTable, this._oCellSelector, assert, this);
			}.bind(this));

			oMousePosStub.restore();
		}.bind(this));
	});

	QUnit.test("Enhance selection with edge handles", function (assert) {
		/**
		 * Resets selection back to given cell
		 */
		 function resetSelection (oCellRef, oTable, oCellSelector, assert, that) {
			var oTouchStart = that.createEvent("touchstart", oCellRef);
			that._oCellSelector.ontouchstart(oTouchStart);

			assertSelection(assert, oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 2}, "Target cell coordinates are correct");
		}

		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			var oMousePosStub = sinon.stub(this._oCellSelector, "_getMousePosition");
			var oTestData = {
				"NE": {cell: [0, 4], target: [0, 2]},
				"SE": {cell: [4, 4], target: [2, 4]},
				"SW": {cell: [4, 4], target: [4, 2]},
				"NW": {cell: [4, 0], target: [2, 0]}
			};

			var oCellRef = getCell(this._oTable, 2, 2);
			resetSelection(oCellRef, this._oTable, this._oCellSelector, assert, this);
			Object.entries(oTestData).forEach(function (aEntry) {
				// Emulate border "touchstart"
				this._oCellSelector._onHandleMove(aEntry[0]);

				var oTargetCell = getCell(this._oTable, 4, 4);
				var oTouchMove = this.createEvent("touchmove", oTargetCell);
				oMousePosStub.returns({x: 4, y: 4});
				this._oCellSelector.ontouchmove(oTouchMove);

				assertSelection(assert, this._oTable, oCellRef, oTargetCell, "tableCtrlCnt");
				assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 2, colIndex: 2}, "Starting cell coordinates are correct");
				assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 4, colIndex: 4}, "Target cell coordinates are correct");

				this._oCellSelector._onmouseup();
				assert.equal(this._oCellSelector._oEdgeInfo, null, "Edge information is reset");

				resetSelection(oCellRef, this._oTable, this._oCellSelector, assert, this);

				oMousePosStub.restore();
			}.bind(this));
		}.bind(this));
	});

	// TODO: Scrolling Unit test. Oh boy
	QUnit.test("Scroll Selection of cells (down)", function (assert) {
		var fnDone = assert.async();
		this._oTable.setVisibleRowCount(3);
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			// Select Cell (0, 0)
			var oMousePosStub = sinon.stub(this._oCellSelector, "_getMousePosition");
			var oCellRef = getCell(this._oTable, 0, 0);

			var oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 0, colIndex: 0}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 0, colIndex: 0}, "Target cell coordinates are correct");

			// Select from Cell (0, 0) to Cell (2, 2)
			var oCellTargetRef = getCell(this._oTable, 2, 2);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef);
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assertSelection(assert, this._oTable, oCellRef, oCellTargetRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 0, colIndex: 0}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 2, colIndex: 2}, "Target cell coordinates are correct");

			// Scroll Select
			oMousePosStub.returns({x: 4, y: 2});
			this._oCellSelector._onMouseLeave({clientX: 0, clientY: 0});

			setTimeout(function () {
				this._oCellSelector._onmouseup();

				// After 4 seconds, selection from Cell (0,0) to Cell (5, 2), because in 4 seconds, 3 rows will be selected
				assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 0, colIndex: 0}, "Starting cell coordinates are correct");
				assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 5, colIndex: 2}, "Target cell coordinates are correct");

				oCellRef = getCell(this._oTable, 3, 0);
				oCellTargetRef = getCell(this._oTable, 5, 2);
				assertSelection(assert, this._oTable, oCellRef, oCellTargetRef, "tableCtrlCnt");
				fnDone();
			}.bind(this), 400);

			oMousePosStub.restore();
		}.bind(this));
	});

	QUnit.test("Scroll Selection of cells (up)", function (assert) {
		var fnDone = assert.async();
		this._oTable.setVisibleRowCount(3);
		this._oTable.setFirstVisibleRow(10);
		return new Promise(function(resolve) {
			this._oTable.attachEventOnce("rowsUpdated", resolve);
		}.bind(this)).then(function () {
			// Select Cell (12, 2)
			var oMousePosStub = sinon.stub(this._oCellSelector, "_getMousePosition");
			var oCellRef = getCell(this._oTable, 12, 2);

			var oTouchStart = this.createEvent("touchstart", oCellRef);
			this._oCellSelector.ontouchstart(oTouchStart);

			assertSelection(assert, this._oTable, oCellRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 12, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 12, colIndex: 2}, "Target cell coordinates are correct");

			// Select from Cell (12, 2) to Cell (10, 0)
			var oCellTargetRef = getCell(this._oTable, 10, 0);

			// Emulating touchmove event
			var oTouchMove = this.createEvent("touchmove", oCellTargetRef);
			oMousePosStub.returns({x: 4, y: 4});
			this._oCellSelector.ontouchmove(oTouchMove);

			assertSelection(assert, this._oTable, oCellTargetRef, oCellRef, "tableCtrlCnt");
			assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 12, colIndex: 2}, "Starting cell coordinates are correct");
			assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 10, colIndex: 0}, "Target cell coordinates are correct");

			// Scroll Select
			oMousePosStub.returns({x: 4, y: 0});
			this._oCellSelector._onMouseLeave({clientX: 0, clientY: 0});

			setTimeout(function () {
				this._oCellSelector._onmouseup();

				// After 4 seconds, selection from Cell (12,2)/(9,2) to Cell (7, 0), because in 4 seconds, 3 rows will be selected
				assert.deepEqual(this._oCellSelector._oSession.mSource, {rowIndex: 12, colIndex: 2}, "Starting cell coordinates are correct");
				assert.deepEqual(this._oCellSelector._oSession.mTarget, {rowIndex: 7, colIndex: 0}, "Target cell coordinates are correct");

				oCellRef = getCell(this._oTable, 9, 2);
				oCellTargetRef = getCell(this._oTable, 7, 0);
				assertSelection(assert, this._oTable, oCellTargetRef, oCellRef, "tableCtrlCnt");
				fnDone();
			}.bind(this), 400);

			oMousePosStub.restore();
		}.bind(this));
	});
});