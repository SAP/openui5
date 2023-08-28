/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Row",
	"sap/ui/core/Core",
	"sap/ui/table/qunit/TableQUnitUtils" // implicitly used via globals (e.g. createTables)
], function(TableUtils, Device, Table, TreeTable, AnalyticalTable, Row, oCore) {
	"use strict";

	// mapping of global function calls
	var oModel = window.oModel;
	var aFields = window.aFields;
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;
	var fakeSumRow = window.fakeSumRow;
	var fakeGroupRow = window.fakeGroupRow;

	// Shortcuts
	var Grouping = TableUtils.Grouping;

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Grouping, "Grouping namespace available");
		assert.ok(TableUtils.Grouping.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Determine row type", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("isInSummaryRow", function(assert) {
		initRowActions(oTable, 1, 1);

		return fakeSumRow(0).then(function() {
			assert.ok(TableUtils.Grouping.isInSummaryRow(getCell(0, 0)), "DATACELL in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getCell(1, 0)), "DATACELL in normal row");

			assert.ok(TableUtils.Grouping.isInSummaryRow(getRowHeader(0)), "ROWHEADER in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowHeader(1)), "ROWHEADER in normal row");

			assert.ok(TableUtils.Grouping.isInSummaryRow(getRowAction(0)), "ROWACTION in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowAction(1)), "ROWACTION in normal row");

			assert.ok(!TableUtils.Grouping.isInSummaryRow(getColumnHeader(0)), "COLUMNHEADER");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getSelectAll()), "COLUMNROWHEADER");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(null), "null");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(document.getElementById("outerelement")), "Foreign DOM");
		});
	});

	QUnit.test("isInGroupHeaderRow", function(assert) {
		initRowActions(oTable, 1, 1);

		return fakeGroupRow(0).then(function() {
			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getCell(0, 0)), "DATACELL in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getCell(1, 0)), "DATACELL in normal row");

			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(0)), "ROWHEADER in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(1)), "ROWHEADER in normal row");

			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowAction(0)), "ROWACTION in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowAction(1)), "ROWACTION in normal row");

			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getColumnHeader(0)), "COLUMNHEADER");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getSelectAll()), "COLUMNROWHEADER");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(null), "null");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(document.getElementById("outerelement")), "Foreign DOM");
		});
	});

	QUnit.module("Hierarchy modes", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		},
		assertMode: function(assert, sExpectedMode, sMessage) {
			sMessage = "Table is in mode '" + sExpectedMode + "'" + (sMessage ? " - " + sMessage : "");
			assert.strictEqual(TableUtils.Grouping.getHierarchyMode(oTable), sExpectedMode, sMessage);
		},
		assertAccessors: function(assert, bFlat, bGroup, bTree) {
			var sModeCSSClass = null;

			if (bGroup) {
				sModeCSSClass = "sapUiTableGroupMode";
			} else if (bTree) {
				sModeCSSClass = "sapUiTableTreeMode";
			}

			assert.strictEqual(Grouping.isInFlatMode(oTable), bFlat, "#isInFlatMode");
			assert.strictEqual(Grouping.isInGroupMode(oTable), bGroup, "#isInGroupMode");
			assert.strictEqual(Grouping.isInTreeMode(oTable), bTree, "#isInTreeMode");
			assert.strictEqual(Grouping.getModeCssClass(oTable), sModeCSSClass, "#getModeCssClass");
		},
		assertAccessorsForFlatMode: function(assert) {
			this.assertAccessors(assert, true, false, false);
		},
		assertAccessorsForGroupMode: function(assert) {
			this.assertAccessors(assert, false, true, false);
		},
		assertAccessorsForTreeMode: function(assert) {
			this.assertAccessors(assert, false, false, true);
		}
	});

	QUnit.test("Default", function(assert) {
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set to default flat mode", function(assert) {
		Grouping.setToDefaultGroupMode(oTable);
		Grouping.setToDefaultFlatMode(oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set to default group mode", function(assert) {
		Grouping.setToDefaultGroupMode(oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Group);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set to default tree mode", function(assert) {
		Grouping.setToDefaultTreeMode(oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Tree);
		this.assertAccessorsForTreeMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Flat + "'", function(assert) {
		Grouping.setHierarchyMode(oTable, Grouping.HierarchyMode.Group);
		Grouping.setHierarchyMode(oTable, Grouping.HierarchyMode.Flat);
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Group + "'", function(assert) {
		Grouping.setHierarchyMode(oTable, Grouping.HierarchyMode.Group);
		this.assertMode(assert, Grouping.HierarchyMode.Group);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Tree + "'", function(assert) {
		Grouping.setHierarchyMode(oTable, Grouping.HierarchyMode.Tree);
		this.assertMode(assert, Grouping.HierarchyMode.Tree);
		this.assertAccessorsForTreeMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.GroupedTree + "'", function(assert) {
		Grouping.setHierarchyMode(oTable, Grouping.HierarchyMode.GroupedTree);
		this.assertMode(assert, Grouping.HierarchyMode.GroupedTree);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set invalid mode'", function(assert) {
		Grouping.setHierarchyMode(oTable, "I_do_not_exist");
		this.assertMode(assert, Grouping.HierarchyMode.Flat, "Set to invalid string");
		this.assertAccessorsForFlatMode(assert);

		Grouping.setHierarchyMode(oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Flat, "Set to 'undefined'");
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Table invalidation", function(assert) {
		var oInvalidate = this.spy(oTable, "invalidate");
		var sCurrentMode = "default flat";
		var mGroupModeSetter = {};

		mGroupModeSetter["default flat"] = Grouping.setToDefaultFlatMode.bind(Grouping, oTable);
		mGroupModeSetter["default group"] = Grouping.setToDefaultGroupMode.bind(Grouping, oTable);
		mGroupModeSetter["default tree"] = Grouping.setToDefaultTreeMode.bind(Grouping, oTable);
		mGroupModeSetter[Grouping.HierarchyMode.Flat] = Grouping.setHierarchyMode.bind(Grouping, oTable, Grouping.HierarchyMode.Flat);
		mGroupModeSetter[Grouping.HierarchyMode.Group] = Grouping.setHierarchyMode.bind(Grouping, oTable, Grouping.HierarchyMode.Group);
		mGroupModeSetter[Grouping.HierarchyMode.Tree] = Grouping.setHierarchyMode.bind(Grouping, oTable, Grouping.HierarchyMode.Tree);
		mGroupModeSetter[Grouping.HierarchyMode.GroupedTree] = Grouping.setHierarchyMode.bind(Grouping, oTable, Grouping.HierarchyMode.GroupedTree);

		[
			{newMode: "default flat", expectInvalidation: false},
			{newMode: Grouping.HierarchyMode.Flat, expectInvalidation: false},
			{newMode: "default group", expectInvalidation: true},
			{newMode: "default group", expectInvalidation: false},
			{newMode: Grouping.HierarchyMode.Group, expectInvalidation: false},
			{newMode: "default tree", expectInvalidation: true},
			{newMode: "default tree", expectInvalidation: false},
			{newMode: Grouping.HierarchyMode.Tree, expectInvalidation: false},
			{newMode: Grouping.HierarchyMode.Flat, expectInvalidation: true},
			{newMode: Grouping.HierarchyMode.Group, expectInvalidation: true},
			{newMode: Grouping.HierarchyMode.GroupedTree, expectInvalidation: true},
			{newMode: Grouping.HierarchyMode.Tree, expectInvalidation: true},
			{newMode: Grouping.HierarchyMode.GroupedTree, expectInvalidation: true}
		].forEach(function(mTestSettings) {
			mGroupModeSetter[mTestSettings.newMode]();
			assert.equal(oInvalidate.callCount, mTestSettings.expectInvalidation ? 1 : 0,
				"Set from " + sCurrentMode + " mode to " + mTestSettings.newMode + " mode");
			oInvalidate.resetHistory();
			sCurrentMode = mTestSettings.newMode;
		});
	});

	QUnit.module("Rendering", {
		beforeEach: function() {
			createTables();
			oTreeTable.setVisibleRowCount(12);
			oCore.applyChanges();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("showGroupMenuButton", function(assert) {
		var bOrigDesktop = Device.system.desktop;

		Device.system.desktop = false;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / no desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / no desktop");
		assert.ok(Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / no desktop");

		Device.system.desktop = true;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / desktop");

		Device.system.desktop = bOrigDesktop;
	});

	QUnit.test("calcGroupIndent", function(assert) {
		var oRow = new Row();
		var oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 0, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 24, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 36, "Level 4");

		oRowGetLevel.returns(5);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 44, "Level 5");

		oRowGetLevel.returns(6);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 52, "Level 6");
	});

	QUnit.test("calcTreeIndent", function(assert) {
		var oRow = new Row();
		var oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 17, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 34, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 51, "Level 4");
	});

	QUnit.test("Tree Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var oRow = oTreeTable.getRows()[i];
				var oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");
				assert.ok(oTreeIcon != null, "Tree Icon Available in first column - row " + (i + 1));
				var sClass = "sapUiTableTreeIconNodeClosed";
				if (bSecondPass) {
					if (i === 0) {
						sClass = "sapUiTableTreeIconNodeOpen";
					} else if (i === 1) {
						sClass = "sapUiTableTreeIconLeaf";
					} else if (i === iCount - 1) {
						sClass = "sapUiTableTreeIconLeaf";
					}
				} else if (i === iCount - 1) {
					sClass = "sapUiTableTreeIconLeaf";
				}
				assert.ok(oTreeIcon.classList.contains(sClass), "Icon has correct expand state: " + sClass);
			}

			if (bSecondPass) {
				oTreeTable.setShowNoData(false);
				oTreeTable.unbindRows();
				oCore.applyChanges();

				for (var i = 0; i < 12; i++) {
					var oRow = oTreeTable.getRows()[i];
					var oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");
					assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeOpen"),
						"No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
					assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconLeaf"),
						"No state class on icon after unbind: sapUiTableTreeIconLeaf");
					assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeClosed"),
						"No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
				}

				done();
			}
		};

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("rowsUpdated", fnHandler);
		oTreeTable.getRows()[0].expand();
	});

	QUnit.test("Group Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var oRow = oTreeTable.getRows()[i];
				var $Row = oRow.$();
				var oRowHeader = oTreeTable.getDomRef("rowsel" + i).parentElement;
				var oGroupHeader = oRow.getDomRef("groupHeader");
				var bExpectGroupHeaderClass = true;
				var bExpectExpanded = false;
				if (bSecondPass && i === 1) {
					bExpectGroupHeaderClass = false;
				} else if (bSecondPass && i === 0) {
					bExpectExpanded = true;
				} else if (i === iCount - 1) {
					bExpectGroupHeaderClass = false;
				}
				assert.ok($Row.hasClass("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass || !$Row.hasClass("sapUiTableGroupHeaderRow")
						  && !bExpectGroupHeaderClass, "Row " + (i + 1) + " is Group Header");
				assert.ok(oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass
						  || !oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && !bExpectGroupHeaderClass,
					"Row Header " + (i + 1) + " is Group Header");
				if (bExpectExpanded) {
					assert.ok(oGroupHeader.classList.contains("sapUiTableGroupIconOpen"), "Header has correct expand state");
				} else if (bExpectGroupHeaderClass) {
					assert.ok(oGroupHeader.classList.contains("sapUiTableGroupIconClosed"), "Header has correct expand state");
				} else {
					assert.ok(!oGroupHeader.classList.contains("sapUiTableGroupIconClosed")
							  && !oGroupHeader.classList.contains("sapUiTableGroupIconOpen"),
						"Header has correct expand state");
				}
			}

			if (bSecondPass) {
				oTreeTable.setShowNoData(false);
				oTreeTable.unbindRows();
				oCore.applyChanges();

				for (var i = 0; i < 12; i++) {
					var $Row = oTreeTable.getRows()[i].$();
					assert.ok(!$Row.hasClass("sapUiTableGroupHeaderRow"), "No group headers any more after unbind");
				}

				done();
			}
		};

		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("rowsUpdated", fnHandler);
		oTreeTable.getRows()[0].expand();
	});

	QUnit.test("GroupMenuButton", function(assert) {
		var i;
		var oGroupMenuButton;
		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();

		for (i = 0; i < 12; i++) {
			oGroupMenuButton = oTreeTable.getDomRef("rowsel" + i).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton == null, "Row Header " + i + " has no GroupMenuButton");
		}

		sinon.stub(TableUtils.Grouping, "showGroupMenuButton").returns(true);
		oTreeTable.invalidate();
		oCore.applyChanges();

		for (i = 0; i < 12; i++) {
			oGroupMenuButton = oTreeTable.getDomRef("rowsel" + i).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton != null, "Row Header " + i + " has GroupMenuButton");
		}

		TableUtils.Grouping.showGroupMenuButton.restore();
	});
});