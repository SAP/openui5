/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/enums/TableType"
], function(
	Table,
	GridTableType,
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
				type: new GridTableType()
			});
			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Shorthand type='GridTable'", function(assert) {
		const oTable = new Table({type: TableType.Table});

		return oTable.initialized().then(function() {
			assert.ok(oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Default type instance is a sap.ui.mdc.table.GridTableType");
			assert.ok(oTable._oTable.isA("sap.ui.table.Table"), "Is a sap.ui.table.Table");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.test("GridTable - HideStandardTooltips", function(assert) {
		const oTable = new Table({type: TableType.Table});

		return oTable.initialized().then(function() {
			assert.ok(oTable._oTable._getHideStandardTooltips(), "HideStandardTooltips option set in inner GridTable");
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
				type: new GridTableType()
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

	QUnit.test("Fix column count", function(assert) {
		const oTable = this.createTable({
			type: new GridTableType({fixedColumnCount: 1})
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