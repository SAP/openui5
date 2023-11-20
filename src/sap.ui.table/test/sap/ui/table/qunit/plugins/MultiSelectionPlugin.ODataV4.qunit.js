/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	Core
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
		var oBinding = oTable.getBinding();
		var aContexts = oBinding.getContexts(0, iNumber, 0, true);

		assert.equal(oBinding.getAllCurrentContexts().length, iNumber, "The expected number of binding contexts is available");
		assert.equal(aContexts.length, iNumber, "Binding contexts in relevant range are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	}

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assertAllContextsAvailable(assert, this.oTable);
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data with server-driven paging", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createModelForListDataService({paging: true})
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assertAllContextsAvailable(assert, this.oTable);
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data without count", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
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

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 400,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 190,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});

	QUnit.module("Load data without count and short read", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
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