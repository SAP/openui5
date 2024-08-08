/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/TreeTable",
	"sap/ui/table/library",
	"sap/ui/core/util/MockServer"
], function(
	TableQUnitUtils,
	TreeTable,
	library,
	MockServer
) {
	"use strict";

	const oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	const sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");
	const SelectionMode = library.SelectionMode;

	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");
	const aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
	aAnnotationsMockdata.forEach(function(oAnnotationMockdata) {
		oAnnotationMockdata.FinStatementHierarchyLevelVal = parseInt(oAnnotationMockdata.FinStatementHierarchyLevelVal);
	});
	oAnnotationMockServer.start();

	QUnit.module("Selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable, {
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
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oSelectionChangeSpy = sinon.spy();

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

	QUnit.test("#onKeyboardShortcut - Event Marking", function(assert) {
		const sEventMarker = "sapUiTableClearAll";
		const oEvent = {
			setMarked: function() {}
		};
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oClearSelectionSpy = sinon.spy(oSelectionPlugin, "clearSelection");
		const oSelectAllSpy = sinon.spy(oSelectionPlugin, "selectAll");
		const oSetMarkedSpy = sinon.spy(oEvent, "setMarked");

		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		assert.ok(oSelectAllSpy.calledOnce, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked with ${sEventMarker}`);

		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledOnce, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		assert.ok(oClearSelectionSpy.calledTwice, "Selection is cleared");
		assert.ok(oSetMarkedSpy.calledTwice, `Event marked twice`);
		assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();

		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		assert.ok(oSelectAllSpy.callCount, 2, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, "Event has not been marked");

		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledThrice, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();
		oSelectAllSpy.reset();
	});
});