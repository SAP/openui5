/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/qunit/rowmodes/sets/FixedRowHeight",
	"sap/ui/table/qunit/rowmodes/sets/RowCountConstraints",
	"sap/ui/table/qunit/rowmodes/sets/RowsUpdated",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	FixedRowHeightTest,
	RowCountConstraintsTest,
	RowsUpdatedTest,
	Table,
	Column,
	RowAction,
	TableUtils,
	Core,
	qutils,
	jQuery
) {
	"use strict";

	var HeightTestControl = TableQUnitUtils.HeightTestControl;

	TableQUnitUtils.setDefaultSettings({
		rowMode: {Type: "sap.ui.table.rowmodes.Interactive"},
		rows: {path: "/"}
	});

	QUnit.module("Get contexts", {
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});
		},
		afterEach: function() {
			this.oGetContextsSpy.restore();
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oGetContextsSpy = this.oGetContextsSpy;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, 10, 100), "The call considers the rendered row count");
		});
	});

	QUnit.test("Change row count", function(assert) {
		var oTable = this.oTable;
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.setFirstVisibleRow(10);

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();

			oTable.getRowMode().setRowCount(8);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Decreased row count: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, 8, 100), "Decreased row count: The call considers the row count");

			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Increased row count: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, 10, 100), "Decreased row count: The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(8);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Decreased row count when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(90, 8, 100),
				"Decreased row count when scrolled to bottom: The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Increased row count when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(90, 10, 100),
				"Increased row count when scrolled to bottom: The call considers the row count");
		});
	});

	QUnit.module("Resize", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("D&D Resizer", function(assert) {
		const fnTestAdaptations = (bDuringResize) => {
			assert.equal(this.oTable.getDomRef("rzoverlay") != null, bDuringResize,
				"The handle to resize overlay is" + (bDuringResize ? "" : " not") + " visible");
			assert.equal(this.oTable.getDomRef("ghost") != null, bDuringResize,
				"The handle to resize ghost is" + (bDuringResize ? "" : " not") + " visible");

			var oEvent = jQuery.Event({type: "selectstart"});
			oEvent.target = this.oTable.getDomRef();
			$Table.trigger(oEvent);
			assert.ok(oEvent.isDefaultPrevented() && bDuringResize || !oEvent.isDefaultPrevented() && !bDuringResize,
				"Prevent Default of selectstart event");
			assert.ok(oEvent.isPropagationStopped() && bDuringResize || !oEvent.isPropagationStopped() && !bDuringResize,
				"Stopped Propagation of selectstart event");
			var sUnselectable = jQuery(document.body).attr("unselectable") || "off";
			assert.ok(sUnselectable == (bDuringResize ? "on" : "off"), "Text Selection switched " + (bDuringResize ? "off" : "on"));
		};

		var $Table = this.oTable.$();
		var $Resizer = $Table.find(".sapUiTableHeightResizer");
		var iInitialHeight = $Table.height();
		var iY = $Resizer.offset().top;

		assert.equal($Resizer.length, 1, "The handle to resize the table is visible");
		assert.equal(this.oTable._getRowCounts().count, 10, "Initial visible rows");
		fnTestAdaptations(false);

		qutils.triggerMouseEvent(this.oTable.$("sb"), "mousedown", 0, 0, 10, iY, 0);
		for (var i = 0; i < 10; i++) {
			iY += 10;
			qutils.triggerMouseEvent($Table, "mousemove", 0, 0, 10, iY, 0);
			if (i == 5) { // Just check somewhere in between
				fnTestAdaptations(true);
			}
		}
		qutils.triggerMouseEvent($Table, "mouseup", 0, 0, 10, iY + 10, 0);
		// resized table by 110px, in cozy mode this allows 2 rows to be added
		assert.equal(this.oTable._getRowCounts().count, 12, "Visible rows after resize");
		Core.applyChanges();
		assert.ok(iInitialHeight < this.oTable.$().height(), "Height of the table increased");
		fnTestAdaptations(false);
	});

	FixedRowHeightTest.registerTo(QUnit);

	RowCountConstraintsTest.test("Force fixed rows if row count too low", function(assert) {
		this.oRowMode.setRowCount(1);
		this.oRowMode.setMinRowCount(1);
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
		}.bind(this));
	});

	RowCountConstraintsTest.registerTo(QUnit);
	RowsUpdatedTest.registerTo(QUnit);
});