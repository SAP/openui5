/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType"
], function(
	Table,
	TreeTableType,
	TableP13nMode,
	TableType
) {
	"use strict";


	QUnit.module("Inner table initialization", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function() {
			this.destroyTable();
			this.oTable = new Table({
				type: new TreeTableType()
			});
			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Shorthand type='TreeTable'", function(assert) {
		const oTable = new Table({type: TableType.TreeTable});

		return oTable.initialized().then(function() {
			assert.ok(oTable._getType().isA("sap.ui.mdc.table.TreeTableType"), "Default type instance is a sap.ui.mdc.table.TreeTableType");
			assert.ok(oTable._oTable.isA("sap.ui.table.TreeTable"), "Is a sap.ui.table.TreeTable");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.test("Differences in settings applied by base class sap.ui.mdc.table.GridTableType", function(assert) {
		const oTable = this.createTable();
		let oTreeTable;

		return oTable.initialized().then(function() {
			oTreeTable = oTable._oTable;
			assert.ok(oTable._oTable.isA("sap.ui.table.TreeTable"), "Is a sap.ui.table.TreeTable");
			assert.equal(oTreeTable.getId(), oTable.getId() + "-innerTable", "ID");
			assert.strictEqual(oTreeTable._oProxy._bEnableV4, true, "'_bEnableV4' flag on the TreeBinding proxy");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.module("API", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function(mSettings) {
			this.destroyTable();
			this.oTable = new Table(Object.assign({
				type: new TreeTableType()
			}, mSettings));
			return this.oTable;
		},
		initTable: function() {
			this.createTable().initialized();
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("getSupportedP13nModes", function(assert) {
		const oTable = this.createTable();

		assert.deepEqual(oTable.getType().getSupportedP13nModes(), [
			TableP13nMode.Column,
			TableP13nMode.Sort,
			TableP13nMode.Filter,
			TableP13nMode.Group, // The delegate is responsible to forbid this
			TableP13nMode.Aggregate // The delegate is responsible to forbid this
		]);
	});

	QUnit.test("Fix column count", function(assert) {
		const oTable = this.createTable({
			type: new TreeTableType({fixedColumnCount: 1})
		});

		return oTable.initialized().then(function() {
			assert.equal(oTable.getType().getFixedColumnCount(), 1, "fixedColumnCount for type is set to 1");
			assert.equal(oTable._oTable.getFixedColumnCount(), 1, "Inner table has a fixed column count of 1");

			oTable.getType().setFixedColumnCount(2);

			assert.equal(oTable.getType().getFixedColumnCount(), 2, "fixedColumnCount for type is set to 2");
			assert.equal(oTable._oTable.getFixedColumnCount(), 2, "Inner table has a fixed column count of 2");

			oTable.getType().setFixedColumnCount(0);

			assert.equal(oTable.getType().getFixedColumnCount(), 0, "fixedColumnCount for type is set to 0");
			assert.equal(oTable._oTable.getFixedColumnCount(), 0, "Inner table has a fixed column count of 0");
		});
	});
});