sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/PluginBase"
], function(
	TableQUnitUtils,
	PluginBase
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();

	QUnit.module("Row count constraints", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [TableQUnitUtils.createTextColumn()]
			});
			this.oRowMode = this.oTable.getRowMode();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Force fixed rows", function(assert) {
		this.oTable._setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 1, 8, 1);
		}.bind(this));
	});

	QUnit.test("Disable fixed rows", function(assert) {
		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oTable._setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 10, 0);
		}.bind(this));
	});

	QUnit.test("Change constraints", function(assert) {
		const that = this;

		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oTable._setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oTable._setRowCountConstraints({fixedTop: false});
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertRenderedRows(assert, that.oTable, 0, 8, 2);
		});
	});

	return QUnit;
});