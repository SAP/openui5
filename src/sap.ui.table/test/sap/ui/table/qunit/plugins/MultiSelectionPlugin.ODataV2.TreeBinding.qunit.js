/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/table/TreeTable",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	TreeTable,
	MockServer,
	Core
) {
	"use strict";

	var oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	var aAnnotationsMockdata;
	var sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");

	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");
	aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
	aAnnotationsMockdata.forEach(function(oAnnotationMockdata) {
		oAnnotationMockdata.FinStatementHierarchyLevelVal = parseInt(oAnnotationMockdata.FinStatementHierarchyLevelVal);
	});
	oAnnotationMockServer.start();

	TableQUnitUtils.setDefaultSettings({
		dependents: [new MultiSelectionPlugin()],
		rows: {
			path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
			parameters: {
				rootLevel: 1,
				numberOfExpandedLevels: 4
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "HierarchyNode", bind: true}),
		models: TableQUnitUtils.createODataModel("/metadata")
	});

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable);
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];

			// The binding is expanding to level 4 in 4 steps. We need to wait for completion before test execution.
			function waitForLevel4(oTable) {
				if (oTable.getRows()[3].getLevel() < 4) {
					return oTable.qunit.whenNextRowsUpdated().then(function() {
						return waitForLevel4(oTable);
					});
				} else {
					return oTable.qunit.whenRenderingFinished();
				}
			}
			return waitForLevel4(this.oTable);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			var oBinding = this.oTable.getBinding();
			var iBindingLength = oBinding.getLength();
			var aContexts = oBinding.getContexts(0, iBindingLength, 0);

			assert.equal(aContexts.length, iBindingLength, "All binding contexts are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			var aContexts = this.oTable.getBinding().getContexts(0, 190, 0);

			assert.equal(aContexts.length, 190, "Binding contexts in selected range are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});
});