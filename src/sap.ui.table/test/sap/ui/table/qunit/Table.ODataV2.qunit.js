/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/Table"
], function(TableQUnitUtils, Table) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

			TableQUnitUtils.setDefaultSettings({
				rows: {path : "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Refresh", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100), "First call");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 100), "Second call");
			oTable.destroy();
		});
	});

	QUnit.skip("Refresh; With fixed rows", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			fixedTopRowCount: 1,
			fixedBottomRowCount: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 9, 100), "First call");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 9, 100), "Second call");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(15, 1, 0, true), "Third call");
			oTable.destroy();
		});
	});

	QUnit.skip("Refresh; With fixed rows, firstVisibleRow = 1, threshold = 1", function(assert) {
		window.breaky = true;
		var oTable = TableQUnitUtils.createTable({
			visibleRowCount: 5,
			fixedTopRowCount: 1,
			fixedBottomRowCount: 1,
			firstVisibleRow: 1,
			threshold: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 5, "Method to get contexts called 5 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(1, 4, 5), "First call"); // refreshRows
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(1, 4, 5), "Second call"); // updateRows
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(15, 1, 0, true), "Third call"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(1, 4, 5), "Fourth call"); // updateRows
			assert.ok(oGetContextsSpy.getCall(4).calledWithExactly(15, 1, 0, true), "Fifth call"); // fixed bottom contexts
			oTable.destroy();
		});
	});

	QUnit.test("Sort", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100), "First call");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 100), "Second call");
			oTable.destroy();
		});
	});

	QUnit.skip("Sort; With fixed rows", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			fixedTopRowCount: 1,
			fixedBottomRowCount: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 4, "Method to get contexts called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 9, 100), "First call");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(15, 1, 0, true), "Second call");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 9, 100), "Third call");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(15, 1, 0, true), "Fourth call");
			oTable.destroy();
		});
	});

	QUnit.skip("Sort; With fixed rows, firstVisibleRow = 1, threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			visibleRowCount: 5,
			fixedTopRowCount: 1,
			fixedBottomRowCount: 1,
			firstVisibleRow: 1,
			threshold: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 6, "Method to get contexts called 6 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 4, 5), "First call"); // refreshRows
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(15, 1, 0, true), "Second call"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 4, 5), "Third call"); // updateRows
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(15, 1, 0, true), "Fourth call"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(4).calledWithExactly(0, 4, 5), "Fifth call"); // updateRows
			assert.ok(oGetContextsSpy.getCall(5).calledWithExactly(15, 1, 0, true), "Sixth call"); // fixed bottom contexts
			oTable.destroy();
		});
	});
});