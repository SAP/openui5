/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/TreeTable",
	"sap/ui/table/library",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	TreeTable,
	library,
	MockServer,
	Core
) {
	"use strict";

	var oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	var aAnnotationsMockdata;
	var sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");
	var SelectionMode = library.SelectionMode;

	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");
	aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
	aAnnotationsMockdata.forEach(function(oAnnotationMockdata) {
		oAnnotationMockdata.FinStatementHierarchyLevelVal = parseInt(oAnnotationMockdata.FinStatementHierarchyLevelVal);
	});
	oAnnotationMockServer.start();

	QUnit.module("Selection API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable, {
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

	QUnit.test("#setSelected", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Select a row");
		assert.equal(oSelectionChangeSpy.callCount, 1, "'selectionChange' event fired once");

		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelected(this.oTable.getRows()[2], true, {range: true});
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Select a range");
		assert.equal(oSelectionChangeSpy.callCount, 1, "'selectionChange' event fired once");

		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelected(this.oTable.getRows()[1], false);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 2], "Deselect a row");
		assert.equal(oSelectionChangeSpy.callCount, 1, "'selectionChange' event fired once");

		this.oTable.setSelectionMode(SelectionMode.Single);
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelected(this.oTable.getRows()[1], true);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [1], "Select a row in selection mode 'Single'");
		assert.equal(oSelectionChangeSpy.callCount, 1, "'selectionChange' event fired once");

		this.oTable.setSelectionMode(SelectionMode.MultiToggle);
		this.oTable.collapseAll();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.setSelected(this.oTable.getRows()[1], true);
			return new Promise(function(resolve) {
				setTimeout(resolve, 100);
			});
		}.bind(this)).then(function() {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Select a row that is not selectable");
			assert.equal(oSelectionChangeSpy.callCount, 0, "'selectionChange' event not fired");
		});
	});
});