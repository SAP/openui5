/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/library"
], function(
	Table,
	TreeTableType,
	library
) {
	"use strict";

	var TableType = library.TableType;
	var P13nMode = library.TableP13nMode;

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
		var oTable = new Table({type: TableType.TreeTable});

		return oTable.initialized().then(function() {
			assert.ok(oTable._getType().isA("sap.ui.mdc.table.TreeTableType"), "Default type instance is a sap.ui.mdc.table.TreeTableType");
			assert.ok(oTable._oTable.isA("sap.ui.table.TreeTable"), "Is a sap.ui.table.TreeTable");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.test("Differences in settings applied by base class sap.ui.mdc.table.GridTableType", function(assert) {
		var oTable = this.createTable();
		var oTreeTable;

		return oTable.initialized().then(function() {
			oTreeTable = oTable._oTable;
			assert.ok(oTable._oTable.isA("sap.ui.table.TreeTable"), "Is a sap.ui.table.TreeTable");
			assert.equal(oTreeTable.getId(), oTable.getId() + "-innerTable", "ID");
			assert.ok(oTreeTable.getDragDropConfig().length === 0, "Has no dragDropConfig");
			assert.strictEqual(oTreeTable._oProxy._bEnableV4, true, "'_bEnableV4' flag on the TreeBinding proxy");
			sinon.stub(oTable.getControlDelegate(), "isSelectionSupported").returns(false);
			oTable.setType("TreeTable");
			return oTable.initialized();
		}).then(function() {
			oTreeTable = oTable._oTable;
			assert.ok(oTreeTable.getPlugins().length === 0, "Delegate does not support selection: Inner table has no selection plugin");
			assert.equal(oTreeTable.getSelectionMode(), "None", "Delegate does not support selection: Inner table 'selectionMode'");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.module("API", {
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
		var oTable = this.createTable();

		assert.deepEqual(oTable.getType().getSupportedP13nModes(), [
			P13nMode.Sort,
			P13nMode.Filter,
			P13nMode.Group, // The delegate is responsible to forbid this
			P13nMode.Aggregate // The delegate is responsible to forbid this
		]);
	});
});