/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated.ODataV2",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Interactive"
], function(
	TableQUnitUtils,
	RowsUpdatedTest,
	Table,
	InteractiveRowMode
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		rowMode: new InteractiveRowMode(),
		rows: {path: "/Products"}
	});

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.resetHistory();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
		},
		createTable: function(mSettings, fnBeforePlaceAt) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				models: this.oDataModel,
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Name",
						text: "Name",
						bind: true
					})
				]
			}, mSettings), fnBeforePlaceAt);

			return this.oTable;
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", function(assert) {
		this.createTable({models: TableQUnitUtils.createODataModel(null, true)});

		// render, refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	QUnit.test("Initialization", function(assert) {
		this.createTable();

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	QUnit.test("Initialization; Bound on initialization; threshold = 1", function(assert) {
		this.createTable({threshold: 1});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 10, 10);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 10, 10);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 10, 10);
		});
	});

	QUnit.test("Initialization; Bound between initialization and rendering; threshold = 1", function(assert) {
		this.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path: "/Products"});
		});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 10);
		});
	});

	QUnit.test("Initialization; Bound after rendering; threshold = 1", function(assert) {
		this.createTable({threshold: 1, rows: undefined});
		this.oTable.bindRows({path: "/Products"});

		// refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 10);
		});
	});

	QUnit.test("Refresh", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	RowsUpdatedTest.registerTo(QUnit);
});