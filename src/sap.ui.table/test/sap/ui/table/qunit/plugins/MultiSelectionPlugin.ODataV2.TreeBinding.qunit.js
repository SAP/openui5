/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/table/TreeTable",
	"sap/ui/core/util/MockServer"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	TreeTable,
	MockServer
) {
	"use strict";

	const oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	const sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");

	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");
	const aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable);
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

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		const oBinding = this.oTable.getBinding();
		const iBindingLength = oBinding.getLength();
		const aContexts = oBinding.getContexts(0, iBindingLength, 0);

		assert.equal(aContexts.length, iBindingLength, "All binding contexts are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			const aContexts = this.oTable.getBinding().getContexts(0, 190, 0);

			assert.equal(aContexts.length, 190, "Binding contexts in selected range are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});
});