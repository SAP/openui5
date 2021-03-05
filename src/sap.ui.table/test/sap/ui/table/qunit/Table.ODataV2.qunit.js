/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/model/odata/v2/ODataListBinding"
], function(TableQUnitUtils, ODataListBinding) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(ODataListBinding.prototype, "getContexts");

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
			assert.equal(oGetContextsSpy.callCount, 2, "Binding#getContexts called 2 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100, undefined), "First call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 100, undefined), "Second call to Binding#getContexts");
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
			assert.equal(oGetContextsSpy.callCount, 3, "Binding#getContexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 9, 100, undefined), "First call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 9, 100, undefined), "Second call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(15, 1, 0, true), "Third call to Binding#getContexts");
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
			assert.equal(oGetContextsSpy.callCount, 5, "Binding#getContexts called 5 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(1, 4, 5, undefined), "First call to Binding#getContexts"); // refreshRows
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(1, 4, 5, undefined), "Second call to Binding#getContexts"); // updateRows
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(15, 1, 0, true), "Third call to Binding#getContexts"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(1, 4, 5, undefined), "Fourth call to Binding#getContexts"); // updateRows
			assert.ok(oGetContextsSpy.getCall(4).calledWithExactly(15, 1, 0, true), "Fifth call to Binding#getContexts"); // fixed bottom contexts
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
			assert.equal(oGetContextsSpy.callCount, 2, "Binding#getContexts called 2 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100, undefined), "First call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 100, undefined), "Second call to Binding#getContexts");
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
			assert.equal(oGetContextsSpy.callCount, 4, "Binding#getContexts called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 9, 100, undefined), "First call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(15, 1, 0, true), "Second call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 9, 100, undefined), "Third call to Binding#getContexts");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(15, 1, 0, true), "Fourth call to Binding#getContexts");
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
			assert.equal(oGetContextsSpy.callCount, 6, "Binding#getContexts called 6 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 4, 5, undefined), "First call to Binding#getContexts"); // refreshRows
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(15, 1, 0, true), "Second call to Binding#getContexts"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 4, 5, undefined), "Third call to Binding#getContexts"); // updateRows
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(15, 1, 0, true), "Fourth call to Binding#getContexts"); // fixed bottom contexts
			assert.ok(oGetContextsSpy.getCall(4).calledWithExactly(0, 4, 5, undefined), "Fifth call to Binding#getContexts"); // updateRows
			assert.ok(oGetContextsSpy.getCall(5).calledWithExactly(15, 1, 0, true), "Sixth call to Binding#getContexts"); // fixed bottom contexts
			oTable.destroy();
		});
	});
});
