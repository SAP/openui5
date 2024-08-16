/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TableTypeBase"
], function(
	Table,
	TableTypeBase
) {
	"use strict";

	const TestTableType = TableTypeBase.extend("sap.ui.mdc.test.TestTableType", {
		metadata: {
			properties: {
				testProperty: {
					type: "int",
					defaultValue: 0
				}
			}
		}
	});

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
				type: new TestTableType({testProperty: 1})
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
		assert.equal(oModel.getProperty("/testProperty"), 1, "The model provides the correct data");
	});

	QUnit.test("Remove the type", function(assert) {
		const oPreviousModel = this.oTable.getModel(this.sModelName);
		this.oTable.setType(); // The table creates a new default type instance.
		const oNewModel = this.oTable.getModel(this.sModelName);

		assert.ok(!oPreviousModel.bDestroyed, "The model of the removed type is not destroyed");
		assert.ok(oNewModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oPreviousModel !== oNewModel, "The model is a new instance");
		assert.equal(oNewModel.getProperty("/testProperty"), null, "The model provides the correct data");
	});

	QUnit.test("Replace the type", function(assert) {
		const oPreviousType = this.oTable.getType();
		const oPreviousModel = this.oTable.getModel(this.sModelName);
		this.oTable.setType(new TestTableType({testProperty: 2}));
		const oNewModel = this.oTable.getModel(this.sModelName);

		assert.ok(!oPreviousModel.bDestroyed, "The model of the removed type is not destroyed");
		assert.ok(oNewModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oPreviousModel !== oNewModel, "The model is a new instance");
		assert.equal(oNewModel.getProperty("/testProperty"), 2, "The model provides the correct data");

		oPreviousType.destroy();
	});

	QUnit.test("Replace the default type", function(assert) {
		this.oTable.destroyType(); // The table creates a new default type instance.
		const oPreviousModel = this.oTable.getModel(this.sModelName);
		this.oTable.setType(new TestTableType({testProperty: 2}));
		const oNewModel = this.oTable.getModel(this.sModelName);

		assert.ok(oPreviousModel.bDestroyed, "The model of the removed default type is destroyed");
		assert.ok(oNewModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oPreviousModel !== oNewModel, "The model is a new instance");
		assert.equal(oNewModel.getProperty("/testProperty"), 2, "The model provides the correct data");
	});

	QUnit.test("Destroy the type", function(assert) {
		const oPreviousModel = this.oTable.getModel(this.sModelName);
		this.oTable.getType().destroy(); // The table creates a new default type instance.
		const oNewModel = this.oTable.getModel(this.sModelName);

		assert.ok(oPreviousModel.bDestroyed, "The model of the destroyed type is destroyed");
		assert.ok(oNewModel, "The table has a model with the name '" + this.sModelName + "'");
		assert.ok(oPreviousModel !== oNewModel, "The model is a new instance");
		assert.equal(oNewModel.getProperty("/testProperty"), null, "The model provides the correct data");
	});

	QUnit.test("Destroy the table", function(assert) {
		const oModel = this.oTable.getModel(this.sModelName);
		this.oTable.destroy();

		// To avoid unneccesary property updates in a table being destroyed, the model should be kept.
		assert.ok(oModel === this.oTable.getModel(this.sModelName), "The table still has the model instance");
		assert.ok(oModel.bDestroyed, "The model is destroyed");
		assert.equal(oModel.getProperty("/testProperty"), 1, "The model provides the correct data");
	});
});