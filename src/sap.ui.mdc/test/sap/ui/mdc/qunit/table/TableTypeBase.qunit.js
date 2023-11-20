/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TableTypeBase"
], function(
	Table,
	TableTypeBase
) {
	"use strict";

	const TestTableType = TableTypeBase.extend("sap.ui.mdc.test.TestTableType");

	QUnit.module("API", {
		beforeEach: function() {
			this.createTable();
		},
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function() {
			this.destroyTable();
			this.oTable = new Table({
				type: new TestTableType()
			});
			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("#getTableStyleClasses", function(assert) {
		assert.deepEqual(this.oTable.getType().getTableStyleClasses(), []);
	});

	QUnit.module("Lifecycle of the ManagedObjectModel instance", {
		beforeEach: function() {
			this.createTable();
		},
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function() {
			this.destroyTable();
			this.oTable = new Table({
				type: new TestTableType()
			});
			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		sModelName: "$sap.ui.mdc.Table#type"
	});

	QUnit.test("After init", function(assert) {
		const oModel = this.oTable.getModel(this.sModelName);

		assert.ok(oModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oModel.isA("sap.ui.model.base.ManagedObjectModel"), "The model is of type sap.ui.model.base.ManagedObjectModel");
		assert.ok(!oModel.bDestroyed, "The model is not destroyed");
	});

	QUnit.test("Remove the type from the table", function(assert) {
		const oModel = this.oTable.getModel(this.sModelName);

		this.oTable.setAggregation("type", null); // Table#setType immediately creates a new default type instance.

		assert.equal(this.oTable.getModel(this.sModelName), null, "The table does not have a model with the name '" + this.sModelName + "'");
		assert.ok(!oModel.bDestroyed, "The model is not destroyed");
	});

	QUnit.test("Destroy the type", function(assert) {
		const oModel = this.oTable.getModel(this.sModelName);
		const sModelName = this.sModelName;
		const fnExit = this.oTable.getType().exit;

		// Injecting into the exit hook is necessary, because the table immediately creates a new default type instance.
		this.oTable.getType().exit = function() {
			fnExit.apply(this, arguments);
			assert.equal(this.getTable().getModel(sModelName), null, "The table does not have a model with the name '" + sModelName + "'");
			assert.ok(oModel.bDestroyed, "The model is destroyed");
		};

		this.oTable.getType().destroy();
	});

	QUnit.test("Destroy the table", function(assert) {
		this.oTable.destroy();

		const oModel = this.oTable.getModel(this.sModelName);
		assert.ok(oModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oModel.bDestroyed, "The model is destroyed");
	});
});