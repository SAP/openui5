/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TreeTableType"
], function(
	Table,
	TreeTableType
) {
	"use strict";

	QUnit.module("Inner table settings", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new TreeTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", async function(assert) {
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.TreeTable"), "Inner table type is sap.ui.table.TreeTable");
	});

	QUnit.test("Flag to enable V4 support", async function(assert) {
		await this.oTable.initialized();
		assert.strictEqual(this.oTable._oTable._oProxy._bEnableV4, true, "'_bEnableV4' flag on the TreeBinding proxy");
	});
});