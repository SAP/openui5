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
		...TableQUnitUtils.createSettingsForList(),
		dependents: [new MultiSelectionPlugin()]
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
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Select range", async function(assert) {
		await this.oMultiSelectionPlugin.setSelectionInterval(0, 189);
		assertContextsAvailable(assert, this.oTable, 190);
	});

	QUnit.module("Load data with server-driven paging", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({paging: true}));
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Select range", async function(assert) {
		await this.oMultiSelectionPlugin.setSelectionInterval(0, 189);
		assertContextsAvailable(assert, this.oTable, 190);
	});

	QUnit.module("Load data without count", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
				tableSettings: {
					rows: {
						parameters: {
							$count: false
						}
					}
				}
			}));
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Select range", async function(assert) {
		await this.oMultiSelectionPlugin.setSelectionInterval(0, 189);
		assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 190,
			"Not all binding contexts are available, but at least the Promise resolved");
	});

	QUnit.module("Load data without count and short read", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
				count: 180,
				tableSettings: {
					rows: {
						parameters: {
							$count: false
						}
					}
				}
			}));
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select range", async function(assert) {
		await this.oMultiSelectionPlugin.setSelectionInterval(0, 189);
		assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 180,
			"Not all binding contexts are available, but at least the Promise resolved");
	});
});