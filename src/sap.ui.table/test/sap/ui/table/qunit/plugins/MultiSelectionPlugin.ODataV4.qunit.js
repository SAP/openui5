/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new MultiSelectionPlugin()],
		rows: {
			path: "/Products",
			parameters: {
				$count: true
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true}),
		models: TableQUnitUtils.createModelForListDataService()
	});

	function assertAllContextsAvailable(assert, oTable) {
		assert.equal(oTable.getBinding().getAllCurrentContexts().length, 400, "All binding contexts are available");
	}

	function assertContextsAvailable(assert, oTable, iNumber) {
		const oBinding = oTable.getBinding();
		const aContexts = oBinding.getContexts(0, iNumber, 0, true);

		assert.equal(oBinding.getAllCurrentContexts().length, iNumber, "The expected number of binding contexts is available");
		assert.equal(aContexts.length, iNumber, "Binding contexts in relevant range are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	}

	QUnit.module("Load data", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		assertAllContextsAvailable(assert, this.oTable);
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data with server-driven paging", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				models: TableQUnitUtils.createModelForListDataService({paging: true})
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		assertAllContextsAvailable(assert, this.oTable);
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data without count", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: {
					path: "/Products"
				}
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 400,
			"Not all binding contexts are available, but at least the Promise resolved");
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 190,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});

	QUnit.module("Load data without count and short read", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: {
					path: "/Products"
				},
				models: TableQUnitUtils.createModelForListDataService({count: 180})
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 180,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});
});