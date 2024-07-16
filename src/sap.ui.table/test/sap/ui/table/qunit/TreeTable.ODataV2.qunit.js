/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	TreeTable,
	Column,
	FixedRowMode,
	ODataModel,
	Filter,
	MockServer,
	Element,
	jQuery
) {
	"use strict";

	//MockServer for use with annotated tree
	const oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	const sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");
	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");

	/**
	 * Clean-Up Hierarchy Annotation Mockdata/Metadata
	 * This is necessary because, the V1 ODataTreeBinding implements routines not conform to the Hierarchy Annotation Spec.
	 */
	const aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
	for (let i = 0; i < aAnnotationsMockdata.length; i++) {
		//convert string based level properties (NUMC fields) to real numbers
		aAnnotationsMockdata[i].FinStatementHierarchyLevelVal = parseInt(aAnnotationsMockdata[i].FinStatementHierarchyLevelVal);
	}

	// TODO: Refactor tests to use TableQunitUtils. See "TreeTable with Annotations, starting level 1 > Expand and Collapse" for reference. Delete
	//  config afterwards.
	MockServer.config({
		autoRespondAfter: 999
	});

	function attachRowsUpdatedOnce(oControl, fnHandler, that) {
		oControl.attachEventOnce("rowsUpdated", fnHandler, that);
	}

	async function createTable(mSettings) {
		return await TableQUnitUtils.createTable(TreeTable, {
			id: "table0",
			columns: [
				new Column({label: "HierarchyNode", template: "HierarchyNode"}),
				new Column({label: "ParentNode", template: "ParentNode"}),
				new Column({label: "Level", template: "FinStatementHierarchyLevelVal"}),
				new Column({label: "FinancialStatementItemText", template: "FinancialStatementItemText"}),
				new Column({label: "DrilldownState", template: "DrilldownState"})
			],
			models: this.oModel,
			...mSettings
		});
	}

	QUnit.module("TreeTable with Annotations, starting level 1", {
		beforeEach: function() {
			oAnnotationMockServer.start();
			this.oModel = new ODataModel("/metadata/", {useBatch: true});
			// let QUnit wait for the metadata to be loaded
			return this.oModel.metadataLoaded();
		},
		afterEach: function() {
			oAnnotationMockServer.stop();
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial Test", async function(assert) {
		this.oTable = await createTable.call(this, {
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				parameters: {rootLevel: 1}
			}
		});
		await this.oTable.qunit.whenRenderingFinished();

		const oBinding = this.oTable.getBinding();
		assert.notOk(oBinding.mParameters.numberOfExpandedLevels, "Number of expanded levels is not in parameters when not set explicitly");
		assert.equal(oBinding.mParameters.rootLevel, 1, "RootLevel is 1");
		assert.notOk(oBinding.mParameters.collapseRecursive, "Collapse recursive is not existing when it is not set explicitly");
		assert.ok(!this.oTable.getUseGroupMode(), "useGroupMode is false");

		const aRows = this.oTable.getRows();
		assert.equal(aRows.length, 10, "10 Rows present");

		let iContexts = 0;
		for (let i = 0; i < aRows.length; i++) {
			if (aRows[i].getBindingContext()) {
				iContexts++;
			}
		}

		assert.equal(iContexts, 1, "Only one row has a context");
	});

	QUnit.test("Expand and Collapse", async function(assert) {
		this.oTable = await createTable.call(this, {
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				parameters: {rootLevel: 1}
			},
			threshold: 10
		});
		await this.oTable.qunit.whenRenderingFinished();

		const oBinding = this.oTable.getBinding();
		assert.ok(oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding"), "treeBinding class check");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 1, "One node is rendered, State: collapsed");
		assert.ok(oBinding.getCollapseRecursive(), "CollapseRecursive is true (default)");

		// expand first node
		this.oTable.expand(0);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].$().find(".sapUiTableTreeIconNodeOpen").length, 1, "Expand(0): 1st node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 1, "Expand(0): One node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9, "Expand(0): 9 nodes are collapsed");

		// expand second node
		this.oTable.expand(1);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 2, "Expand(1): 2 nodes are expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 8, "Expand(1): 8 nodes are collapsed");

		// collapse to root, collapse recursive true
		this.oTable.collapse(0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 1, "Collapse(0): One node is rendered, State: collapsed");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 0, "Collapse(0): There shall be no other rows");

		// expand root
		this.oTable.expand(0);
		// data already loaded, only one change event fired by expand
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].$().find(".sapUiTableTreeIconNodeOpen").length, 1, "Expand(0) after collapse(0): 1st node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 1, "Expand(0) after collapse(0): One node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9, "Expand(0) after collapse(0): 9 nodes are collapsed");

		// expand first node
		this.oTable.expand(1);
		// data already loaded, only one change event fired by expand
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 2, "Expand(1): 2 nodes are expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 8, "Expand(1): 8 nodes are collapsed");

		// collapseRecursive=false, collapse to root
		this.oTable.getBinding().setCollapseRecursive(false);
		this.oTable.collapse(0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 1,
			"Collapse(0) recursive false: One node is rendered, State: collapsed");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 0,
			"Collapse(0) recursive false: There shall be no other rows");

		// expand root
		this.oTable.expand(0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 2,
			"Expand(0) after Collapse recursive: 2 nodes are expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 8,
			"Expand(0) after Collapse recursive: 8 nodes are collapsed");

		// check margins of levels
		const iLevel0a = parseInt(this.oTable.getRows()[0].$().find(".sapUiTableTreeIcon").css("margin-left"));
		const iLevel1a = parseInt(this.oTable.getRows()[1].$().find(".sapUiTableTreeIcon").css("margin-left"));
		const iLevel2a = parseInt(this.oTable.getRows()[2].$().find(".sapUiTableTreeIcon").css("margin-left"));
		const iLevel2b = parseInt(this.oTable.getRows()[3].$().find(".sapUiTableTreeIcon").css("margin-left"));
		const iLevel2c = parseInt(this.oTable.getRows()[8].$().find(".sapUiTableTreeIcon").css("margin-left"));
		const iLevel1b = parseInt(this.oTable.getRows()[9].$().find(".sapUiTableTreeIcon").css("margin-left"));

		assert.ok(iLevel0a < iLevel1a, "Margin-left: Level 0 smaller Level 1");
		assert.ok(iLevel1a < iLevel2a, "Margin-left: Level 1 smaller Level 2");
		assert.ok(iLevel2a === iLevel2b, "Margin-left: Level 2 equals Level 2");
		assert.ok(iLevel1b < iLevel2c, "Margin-left: Level 1 smaller Level 2");

		// check isExpanded
		assert.ok(this.oTable.isExpanded(0), "Root expanded");
		assert.ok(this.oTable.isExpanded(1), "First child of Root expanded");
		assert.ok(!this.oTable.isExpanded(2), "1st grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(3), "2nd grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(4), "3rd grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(5), "4th grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(6), "5th grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(7), "6th grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(8), "7th grand child of Root NOT expanded");
		assert.ok(!this.oTable.isExpanded(9), "2nd child of Root NOT expanded");
		// also check a node which is not in the visible area of the table
		assert.ok(!this.oTable.isExpanded(12), "5th child of Root NOT expanded");

		this.oTable.getBinding().setCollapseRecursive(true);
		this.oTable.collapseAll();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 1, "CollapseAll: One node is rendered, State: collapsed");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 0, "CollapseAll: There shall be no other rows");

		// expand root
		this.oTable.expand(0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].$().find(".sapUiTableTreeIconNodeOpen").length, 1,
			"Expand(0) after collapseAll recursive: 1st node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 1,
			"Expand(0) after collapseAll recursive: One node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9,
			"Expand(0) after collapseAll recursive: 9 nodes are collapsed");

		// expand to level 2
		this.oTable.expandToLevel(2);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 3, "ExpandToLevel(2): 3 nodes are expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 7, "ExpandToLevel(2): 7 nodes are collapsed");
		assert.ok(this.oTable.isExpanded(0), "Root expanded");
		assert.ok(this.oTable.isExpanded(1), "First child of root expanded");
		assert.ok(!this.oTable.isExpanded(2), "1st grand child of Root NOT expanded");

		assert.ok(!this.oTable.isExpanded(8), "Node 000360 NOT expanded");
		assert.ok(this.oTable.isExpanded(9), "Node 000362 expanded");
		assert.ok(!this.oTable.isExpanded(10), "Node 000363 NOT expanded");

		assert.ok(!this.oTable.isExpanded(14), "Node 000680 NOT expanded");
		assert.ok(this.oTable.isExpanded(15), "Node 000682 expanded");
		assert.ok(!this.oTable.isExpanded(16), "Node 000683 NOT expanded");

		assert.ok(!this.oTable.isExpanded(14), "Node 000680 NOT expanded");
		assert.ok(this.oTable.isExpanded(15), "Node 000682 expanded");
		assert.ok(!this.oTable.isExpanded(16), "Node 000683 NOT expanded");

		assert.ok(!this.oTable.isExpanded(31), "Node 001114 NOT expanded");
		assert.ok(this.oTable.isExpanded(32), "Node 001131 expanded");
		assert.ok(!this.oTable.isExpanded(33), "Node 001132 NOT expanded");

		this.oTable.setFirstVisibleRow(20);
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 1, "After Scrolling: One node is expanded");
		assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9, "After Scrolling: 9 nodes are collapsed");
		assert.ok(!this.oTable.isExpanded(31), "Node 001114 NOT expanded");
		assert.ok(this.oTable.isExpanded(32), "Node 001131 expanded");
		assert.ok(!this.oTable.isExpanded(33), "Node 001132 NOT expanded");
	});

	QUnit.test("Number Of Expanded Levels", async function(assert) {
		const done = assert.async();
		this.oTable = await createTable.call(this, {rowMode: new FixedRowMode({rowCount: 15})});

		let oBinding;

		const fnHandler1 = function() {
			attachRowsUpdatedOnce(this.oTable, fnHandler2, this);
		};

		const fnHandler2 = function() {
			oBinding = this.oTable.getBinding();
			// test some defaults
			assert.equal(oBinding.mParameters.numberOfExpandedLevels, 1, "Number of expanded levels is 1");
			assert.equal(oBinding.mParameters.rootLevel, 1, "RootLevel is 1");

			const aRows = this.oTable.getRows();
			assert.equal(aRows.length, 15, "15 Rows present");

			let iCountContexts = 0;
			for (let i = 0; i < aRows.length; i++) {
				if (aRows[i].getBindingContext()) {
					iCountContexts++;
				}
			}

			assert.equal(iCountContexts, 10, "10 rows have a context");

			assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 1, "ExpandToLevel(2): Test that 3 nodes are expanded");
			assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9, "ExpandToLevel(2): Test that 7 nodes are collapsed");
			assert.ok(this.oTable.isExpanded(0), "Root expanded");
			assert.ok(!this.oTable.isExpanded(1), "First child of Root NOT expanded");
			assert.ok(!this.oTable.isExpanded(2), "Second child of Root NOT expanded");

			assert.equal(this.oTable.getContextByIndex(0).getProperty("HierarchyNode"), "000001", "Root Node is 000001");
			assert.equal(this.oTable.getContextByIndex(1).getProperty("HierarchyNode"), "000002", "First child of Root Node is 000002");
			assert.equal(this.oTable.getContextByIndex(9).getProperty("HierarchyNode"), "001180", "Last child of Root Node is 001180");

			attachRowsUpdatedOnce(this.oTable, fnHandler1, this);

			done();
		};

		attachRowsUpdatedOnce(this.oTable, fnHandler1, this);
		this.oTable.bindRows({
			path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
			parameters: {rootLevel: 1, numberOfExpandedLevels: 1}
		});
	});

	QUnit.test("Root Level 2", async function(assert) {
		const done = assert.async();
		this.oTable = await createTable.call(this);
		let oBinding;

		const fnHandler1 = function() {
			// test some defaults
			oBinding = this.oTable.getBinding();
			assert.notOk(oBinding.mParameters.numberOfExpandedLevels, "Number of expanded levels is not set");
			assert.equal(oBinding.mParameters.rootLevel, 2, "RootLevel is 2");
			assert.ok(true, "Expand first Level is false");
			const aRows = this.oTable.getRows();
			assert.equal(aRows.length, 10, "10 Rows present");

			let iCountContexts = 0;
			for (let i = 0; i < aRows.length; i++) {
				if (aRows[i].getBindingContext()) {
					iCountContexts++;
				}
			}

			assert.equal(iCountContexts, 9, "9 rows have a context");

			assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeOpen").length, 0, "rootLevel 2: Test that 0 nodes are expanded");
			assert.equal(jQuery("#table0").find(".sapUiTableTreeIconNodeClosed").length, 9, "rootLevel 2: Test that 9 nodes are collapsed");

			assert.equal(this.oTable.getContextByIndex(0).getProperty("HierarchyNode"), "000002", "First Root Node is 000002");
			assert.equal(this.oTable.getContextByIndex(8).getProperty("HierarchyNode"), "001180", "Last  Root Node is 001180");
			assert.equal(this.oTable.getContextByIndex(9), undefined, "There are only 9 Rows");

			done();

		};
		attachRowsUpdatedOnce(this.oTable, fnHandler1, this);
		this.oTable.bindRows({
			path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
			parameters: {rootLevel: 2}
		});
	});

	QUnit.test("Selection", async function(assert) {
		const done = assert.async();
		this.oTable = await createTable.call(this, {rowMode: new FixedRowMode({rowCount: 15})});
		let oBinding;

		const fnHandler0 = function() {
			attachRowsUpdatedOnce(this.oTable, fnHandler1, this);
		};

		const fnHandler1 = function() {
			oBinding = this.oTable.getBinding();
			// the selection is already handled by the ODataTreeBindingAdapter.qunit.html
			// just do some basic check to ensure the API is called correctly
			this.oTable.setSelectedIndex(1);
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 1, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 2, "Row and RowHeader are selected");

			this.oTable.setSelectionInterval(2, 4);
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Selection Interval: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [2, 3, 4], "Selection Interval: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 3, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 6, "Row and RowHeader are selected");

			this.oTable.addSelectionInterval(5, 0);
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Add Selection Interval: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5], "Add Selection Interval: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 6, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 12, "Row and RowHeader are selected");

			this.oTable.removeSelectionInterval(1, 1);
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Remove Selection Interval: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0, 2, 3, 4, 5], "Remove Selection Interval: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 5, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 10, "Row and RowHeader are selected");

			assert.ok(this.oTable.isIndexSelected(0), "Index 0 selected");
			assert.ok(!this.oTable.isIndexSelected(1), "Index 1 selected");
			assert.ok(this.oTable.isIndexSelected(5), "Index 5 selected");
			assert.ok(!this.oTable.isIndexSelected(6), "Index 6 NOT selected");
			assert.ok(!this.oTable.isIndexSelected(16), "Index 16 NOT selected");

			// remove leadSelection
			this.oTable.removeSelectionInterval(5, 5);
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Remove Selection Interval: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0, 2, 3, 4], "Remove Selection Interval: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 4, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 8, "Row and RowHeader are selected");

			attachRowsUpdatedOnce(this.oTable, fnHandler2, this);
			this.oTable.addSelectionInterval(5, 5);
			this.oTable.collapse(0);
		};

		const fnHandler2 = function() {
			attachRowsUpdatedOnce(this.oTable, fnHandler3, this);
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Collapse(0): SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0], "Collapse(0): SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 1, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 2, "Row and RowHeader are selected");
			this.oTable.expand(0);
		};

		// collapseRecursive=false
		// collapse(0)
		const fnHandler3 = function() {
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "Expand(0): SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0], "Expand(0): SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 1, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 2, "Row and RowHeader are selected");

			this.oTable.selectAll();
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "SelectAll: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "SelectAll: SelectedIndices Values OK");

			this.oTable.getBinding().setCollapseRecursive(false);
			attachRowsUpdatedOnce(this.oTable, fnHandler4, this);
			this.oTable.collapse(0);
		};

		// expand(0)
		const fnHandler4 = function() {

			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(),
				"Collapse(0), CollapseRecursive=false: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0], "Collapse(0), CollapseRecursive=false: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 1, "Only one row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 2, "Row and RowHeader are selected");

			attachRowsUpdatedOnce(this.oTable, fnHandler5, this);
			this.oTable.expand(0);
		};

		const fnHandler5 = function() {
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(),
				"Expand(0), CollapseRecursive=false: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
				"Expand(0), CollapseRecursive=false: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 10, "10 rows selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 20, "Row and RowHeader are selected");

			this.oTable.clearSelection();
			assert.deepEqual(oBinding.getSelectedIndices(), this.oTable.getSelectedIndices(), "clearSelection: SelectedIndices OK");
			assert.deepEqual(this.oTable.getSelectedIndices(), [], "clearSelection: SelectedIndices Values OK");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel .sapUiTableRowSelectionCell").length, 0, "No row selected");
			assert.equal(this.oTable.$().find(".sapUiTableRowSel").length, 0, "No Row and RowHeader are selected");

			done();
		};

		attachRowsUpdatedOnce(this.oTable, fnHandler0, this);
		this.oTable.bindRows({
			path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
			parameters: {rootLevel: 1, numberOfExpandedLevels: 1}
		});
	});

	QUnit.test("SelectAll with scrolling and paging", async function(assert) {
		const done = assert.async();
		this.oTable = await createTable.call(this);

		const fnHandler0 = function() {
			attachRowsUpdatedOnce(this.oTable, fnHandler1, this);
		};

		const fnHandler1 = function() {
			this.oTable.selectAll();
			assert.equal(this.oTable.getSelectedIndices().length, 55, "55 Nodes in Tree");
			assert.equal(this.oTable._getTotalRowCount(), 55, "Binding length is 55");

			let i = 1;
			const fnVisibleRowHandler = function() {
				// section length is the row count, make sure to scroll to all the sections/nodes
				if (i < this.oTable._getMaxFirstVisibleRowIndex()) {
					i += this.oTable._getRowCounts().count;
					this.oTable.setFirstVisibleRow(i);
				} else {
					this.oTable.detachRowsUpdated(fnVisibleRowHandler);
					assert.equal(this.oTable.getSelectedIndices().length, 55, "55 Nodes in Tree, all selected");
					done();
				}
			};

			this.oTable.attachRowsUpdated(fnVisibleRowHandler, this);
			this.oTable.setFirstVisibleRow(i);
		};

		attachRowsUpdatedOnce(this.oTable, fnHandler0, this);
		this.oTable.bindRows({
			path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
			parameters: {rootLevel: 2, numberOfExpandedLevels: 1}
		});
	});

	QUnit.module("BusyIndicator", {
		before: function() {
			oAnnotationMockServer.start();
			this.oDataModel = new ODataModel("/metadata/", {useBatch: true});

			TableQUnitUtils.setDefaultSettings({
				id: "table",
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		afterEach: function() {
			this.getTable().destroy();
		},
		after: function() {
			oAnnotationMockServer.stop();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertState: function(assert, sMessage, mExpectation) {
			const oTable = this.getTable();

			assert.deepEqual({
				pendingRequests: oTable._hasPendingRequests(),
				busy: oTable.getBusy()
			}, mExpectation, sMessage);
		},
		getTable: function() {
			return Element.getElementById("table");
		}
	});

	QUnit.test("Initial request; Automatic BusyIndicator disabled", function(assert) {
		const done = assert.async();
		const that = this;

		assert.expect(4);

		TableQUnitUtils.createTable(TreeTable, {
			busyStateChanged: function() {
				assert.ok(false, "The 'busyStateChanged' event should not be fired");
			},
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: false});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: false});

						setTimeout(function() {
							that.assertState(assert, "200ms after 'dataReceived'", {pendingRequests: false, busy: false});
							done();
						}, 200);
					}
				}
			}
		});

		// the underlying TreeBinding adapter is loaded async and therefore no requests are pending initially
		this.assertState(assert, "After initialization", {pendingRequests: false, busy: false});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled", function(assert) {
		const done = assert.async();
		const that = this;

		assert.expect(5);

		TableQUnitUtils.createTable(TreeTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});

		// the underlying TreeBinding adapter is loaded async and therefore no requests are pending initially
		this.assertState(assert, "After initialization", {pendingRequests: false, busy: false});
	});

	QUnit.test("Multiple sequential and parallel requests", function(assert) {
		const done = assert.async();
		const that = this;

		assert.expect(25);

		TableQUnitUtils.createTable(TreeTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				},
				parameters: {
					numberOfExpandedLevels: 2,
					rootLevel: 1
				}
			}
		});

		// the underlying TreeBinding adapter is loaded async and therefore no requests are pending initially
		this.assertState(assert, "After initialization", {pendingRequests: false, busy: false});
	});

	QUnit.module("NoData", {
		before: function() {
			oAnnotationMockServer.start();
			this.oDataModel = new ODataModel("/metadata/", {useBatch: true});

			TableQUnitUtils.setDefaultSettings({
				rows: {
					path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
					parameters: {
						rootLevel: 1
					}
				},
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable);
			this.iNoDataVisibilityChanges = 0;

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				this.oObserver = new MutationObserver(function(aRecords) {
					const oRecord = aRecords[0];
					const bNoDataWasVisible = oRecord.oldValue.includes("sapUiTableEmpty");
					const bNoDataIsVisible = oRecord.target.classList.contains("sapUiTableEmpty");

					if (bNoDataWasVisible !== bNoDataIsVisible) {
						this.iNoDataVisibilityChanges++;
					}
				}.bind(this));

				this.oObserver.observe(this.oTable.getDomRef(), {attributes: true, attributeOldValue: true, attributeFilter: ["class"]});
			}.bind(this));
		},
		afterEach: function() {
			if (this.oObserver) {
				this.oObserver.disconnect();
			}
			this.oTable.destroy();
		},
		after: function() {
			oAnnotationMockServer.stop();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertNoDataVisibilityChangeCount: function(assert, iCount) {
			assert.equal(this.iNoDataVisibilityChanges, iCount, "Number of NoData visibility changes");
			this.resetNoDataVisibilityChangeCount();
		},
		resetNoDataVisibilityChangeCount: function() {
			this.iNoDataVisibilityChanges = 0;
		}
	});

	QUnit.test("After rendering with data", async function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable(TreeTable, function(oTable) {
			new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					// the underlying TreeBinding adapter is loaded async and therefore no requests are pending initially
					// this means the no data message is visible
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
				done();
			});
		});
	});

	QUnit.test("After rendering without data", async function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable(TreeTable, {
			rows: {
				path: "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result",
				filters: [new Filter({path: "GLAccountName", operator: "EQ", value1: "DoesNotExist"})]
			}
		}, function(oTable) {
			new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					// the underlying TreeBinding adapter is loaded async and therefore no requests are pending
					// this means the no data message is visible
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
				done();
			});
		});
	});

	QUnit.test("Filter", function(assert) {
		const that = this;

		this.oTable.getBinding().filter(new Filter({path: "GLAccountName", operator: "EQ", value1: "DoesNotExist"}), "Application");
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.getBinding().filter(undefined, "Application");
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Remove filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
		});
	});

	QUnit.test("Rerender while filtering", async function(assert) {
		const that = this;

		this.oTable.getBinding().filter(new Filter({path: "GLAccountName", operator: "EQ", value1: "DoesNotExist"}), "Application");
		this.oTable.invalidate();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Filter");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);

		that.oTable.getBinding().filter(undefined, "Application");
		that.oTable.invalidate();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Remove Filter");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);
	});

	QUnit.test("Bind/Unbind", function(assert) {
		const oBindingInfo = this.oTable.getBindingInfo("rows");
		const that = this;

		this.oTable.unbindRows();
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			oBindingInfo.parameters.rootLevel = 1;
			that.oTable.bindRows(oBindingInfo);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
		});
	});

	QUnit.test("Rerender while binding/unbinding", async function(assert) {
		const oBindingInfo = this.oTable.getBindingInfo("rows");
		const that = this;

		this.oTable.unbindRows();
		this.oTable.invalidate();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);

		oBindingInfo.parameters.rootLevel = 1;
		that.oTable.bindRows(oBindingInfo);
		that.oTable.invalidate();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);
	});
});