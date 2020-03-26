/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/RowMode",
	"sap/ui/table/Table"
], function(TableQUnitUtils, RowMode, Table) {
	"use strict";

	var RowModeSubclass = RowMode.extend("sap.ui.table.test.RowModeSubClass", {
		getMinRequestLength: function() {
			return 0;
		},
		getComputedRowCounts: function() {
			return {
				count: 0,
				scrollable: 0,
				fixedTop: 0,
				fixedBottom: 0
			};
		},
		getTableStyles: function() {
			return {};
		},
		getRowContainerStyles: function() {
			return {};
		},
		getTableBottomPlaceholderStyles: function() {
			return {};
		}
	});

	QUnit.module("Inheriting from RowMode");

	QUnit.test("Abstract methods", function(assert) {
		var InvalidSubclass = RowMode.extend("sap.ui.table.test.RowModeInvalidSubClass");
		var oMode = new InvalidSubclass();

		assert.throws(oMode.getMinRequestLength, "#getMinRequestLength throws an error if not implemented in subclass");
		assert.throws(oMode.getComputedRowCounts, "#getComputedRowCounts throws an error if not implemented in subclass");
		assert.throws(oMode.getTableStyles, "#getTableStyles throws an error if not implemented in subclass");
		assert.throws(oMode.getRowContainerStyles, "#getRowContainerStyles throws an error if not implemented in subclass");
		assert.throws(oMode.getTableBottomPlaceholderStyles, "#getTableBottomPlaceholderStyles throws an error if not implemented in subclass");
	});

	QUnit.module("Methods", {
		beforeEach: function() {
			this.oRowMode = new RowModeSubclass();
			this.oTable = new Table();
		},
		afterEach: function() {
			this.oRowMode.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("sanitizeRowCounts", function(assert) {
		var aTestParameters = [
			{input: [-1, -1, -1], output: {count: 0, scrollable: 0, fixedTop: 0, fixedBottom: 0}},
			{input: [-1, 10, 10], output: {count: 0, scrollable: 0, fixedTop: 0, fixedBottom: 0}},
			{input: [1, 10, 10], output: {count: 1, scrollable: 1, fixedTop: 0, fixedBottom: 0}},
			{input: [5, 10, 10], output: {count: 5, scrollable: 1, fixedTop: 4, fixedBottom: 0}},
			{input: [5, 0, 10], output: {count: 5, scrollable: 1, fixedTop: 0, fixedBottom: 4}},
			{input: [5, 10, 0], output: {count: 5, scrollable: 1, fixedTop: 4, fixedBottom: 0}},
			{input: [5, -1, -1], output: {count: 5, scrollable: 5, fixedTop: 0, fixedBottom: 0}},
			{input: [5, 2, 0], output: {count: 5, scrollable: 3, fixedTop: 2, fixedBottom: 0}},
			{input: [5, 0, 2], output: {count: 5, scrollable: 3, fixedTop: 0, fixedBottom: 2}},
			{input: [5, 2, 2], output: {count: 5, scrollable: 1, fixedTop: 2, fixedBottom: 2}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 6, fixedTop: 2, fixedBottom: 2}}
		];

		for (var i = 0; i < aTestParameters.length; i++) {
			var mTestParameter = aTestParameters[i];
			assert.deepEqual(this.oRowMode.sanitizeRowCounts.apply(this.oRowMode, mTestParameter.input), mTestParameter.output,
				"(count: " + mTestParameter.input[0]
				+ ", fixedTop: " + mTestParameter.input[1]
				+ ", fixedBottom: " + mTestParameter.input[2] + ")"
				+ " => " + JSON.stringify(mTestParameter.output, null, 1));
		}
	});

	QUnit.test("getBaseRowHeightOfTable", function(assert) {
		assert.strictEqual(this.oRowMode.getBaseRowHeightOfTable(), 0, "Returns 0 if not child of a table");

		sinon.stub(this.oTable, "_getBaseRowHeight").returns(11);
		this.oTable.setRowMode(this.oRowMode);
		assert.strictEqual(this.oRowMode.getBaseRowHeightOfTable(), 11, "Returns the default row height of the table");
	});

	QUnit.test("getTotalRowCountOfTable", function(assert) {
		assert.strictEqual(this.oRowMode.getTotalRowCountOfTable(), 0, "Returns 0 if not child of a table");

		sinon.stub(this.oTable, "_getTotalRowCount").returns(11);
		this.oTable.setRowMode(this.oRowMode);
		assert.strictEqual(this.oRowMode.getTotalRowCountOfTable(), 11, "Returns the total row count of the table");
	});
});