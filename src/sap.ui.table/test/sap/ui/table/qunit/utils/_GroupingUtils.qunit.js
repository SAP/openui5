/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Row"
], function(TableQUnitUtils, TableUtils, Device, Table, TreeTable, AnalyticalTable, Row) {
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

	QUnit.module("Grouping Modes", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Mode Accessors", function(assert) {
		var oTbl = {};

		assert.ok(!Grouping.isGroupMode(oTbl), "Initial: No Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "Initial: No Tree Mode");
		assert.ok(!Grouping.getModeCssClass(oTbl), "Initial: No Mode Css Class");

		Grouping.setGroupMode(oTbl);

		assert.ok(Grouping.isGroupMode(oTbl), "Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "No Tree Mode");
		assert.strictEqual(Grouping.getModeCssClass(oTbl), "sapUiTableGroupMode", "Group Mode Css Class");

		Grouping.setTreeMode(oTbl);

		assert.ok(!Grouping.isGroupMode(oTbl), "No Group Mode");
		assert.ok(Grouping.isTreeMode(oTbl), "Tree Mode");
		assert.strictEqual(Grouping.getModeCssClass(oTbl), "sapUiTableTreeMode", "Tree Mode Css Class");

		Grouping.clearMode(oTbl);

		assert.ok(!Grouping.isGroupMode(oTbl), "Clear: No Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "Clear: No Tree Mode");
		assert.ok(!Grouping.getModeCssClass(oTbl), "Clear: No Mode Css Class");
	});

	QUnit.test("Table default modes", function(assert) {
		assert.ok(!Grouping.isGroupMode(oTable), "No Group Mode in sap.ui.table.Table");
		assert.ok(!Grouping.isTreeMode(oTable), "No Tree Mode in sap.ui.table.Table");

		var oColumn = oTable.getColumns()[0];
		oColumn.setSortProperty(aFields[0]);
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oColumn);
		sap.ui.getCore().applyChanges();

		assert.ok(Grouping.isGroupMode(oTable), "Group Mode in sap.ui.table.Table (in experimental Group mode)");
		assert.ok(!Grouping.isTreeMode(oTable), "No Tree Mode in sap.ui.table.Table (in experimental Group mode)");

		assert.ok(!Grouping.isGroupMode(oTreeTable), "No Group Mode in sap.ui.table.TreeTable");
		assert.ok(Grouping.isTreeMode(oTreeTable), "Tree Mode in sap.ui.table.TreeTable");

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		assert.ok(Grouping.isGroupMode(oTreeTable), "Group Mode in sap.ui.table.TreeTable (when useGroupMode=true)");
		assert.ok(!Grouping.isTreeMode(oTreeTable), "No Tree Mode in sap.ui.table.TreeTable (when useGroupMode=true)");

		var oAnaTable = new AnalyticalTable();

		assert.ok(Grouping.isGroupMode(oAnaTable), "Group Mode in sap.ui.table.AnalyticalTable");
		assert.ok(!Grouping.isTreeMode(oAnaTable), "No Tree Mode in sap.ui.table.AnalyticalTable");
	});

	QUnit.module("Rendering", {
		beforeEach: function() {
			createTables();
			oTreeTable.setVisibleRowCount(12);
			sap.ui.getCore().applyChanges();
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

		sap.ui.Device.system.desktop = true;
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
				var $Row = oRow.$();
				assert.ok(oTreeIcon != null, "Tree Icon Available in first column - row " + (i + 1));
				var sClass = "sapUiTableTreeIconNodeClosed";
				var iLevel = 1;
				if (bSecondPass) {
					if (i === 0) {
						sClass = "sapUiTableTreeIconNodeOpen";
					} else if (i === 1) {
						sClass = "sapUiTableTreeIconLeaf";
						iLevel = 2;
					} else if (i === iCount - 1) {
						sClass = "sapUiTableTreeIconLeaf";
						iLevel = 0; // empty row
					}
				} else if (i === iCount - 1) {
					sClass = "sapUiTableTreeIconLeaf";
					iLevel = 0; // empty row
				}
				assert.ok(oTreeIcon.classList.contains(sClass), "Icon has correct expand state: " + sClass);
				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var oRow = oTreeTable.getRows()[i];
						var oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");
						var $Row = oRow.$();
						assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeOpen"),
							"No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
						assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconLeaf"),
							"No state class on icon after unbind: sapUiTableTreeIconLeaf");
						assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeClosed"),
							"No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + (i + 1) + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + (i + 1) + " has no level in dom.");
					}
					done();
				};

				oTreeTable.setShowNoData(false);
				oTreeTable.attachEventOnce("rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
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
				var iLevel = 1;
				var bExpectGroupHeaderClass = true;
				var bExpectExpanded = false;
				if (bSecondPass && i === 1) {
					bExpectGroupHeaderClass = false;
					iLevel = 2;
				} else if (bSecondPass && i === 0) {
					bExpectExpanded = true;
				} else if (i === iCount - 1) {
					bExpectGroupHeaderClass = false;
					iLevel = 0; // empty row
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

				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var $Row = oTreeTable.getRows()[i].$();
						assert.ok(!$Row.hasClass("sapUiTableGroupHeaderRow"), "No group headers any more after unbind");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
					}
					done();
				};

				oTreeTable.setShowNoData(false);
				oTreeTable.attachEventOnce("rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
			}
		};

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("rowsUpdated", fnHandler);
		oTreeTable.getRows()[0].expand();
	});

	QUnit.test("GroupMenuButton", function(assert) {
		var i;
		var oGroupMenuButton;
		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			oGroupMenuButton = oTreeTable.getDomRef("rowsel" + i).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton == null, "Row Header " + i + " has no GroupMenuButton");
		}

		sinon.stub(TableUtils.Grouping, "showGroupMenuButton").returns(true);
		oTreeTable.invalidate();
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			oGroupMenuButton = oTreeTable.getDomRef("rowsel" + i).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton != null, "Row Header " + i + " has GroupMenuButton");
		}

		TableUtils.Grouping.showGroupMenuButton.restore();
	});

	QUnit.module("sap.ui.table.Table: Experimental Grouping", {
		beforeEach: function() {
			createTables();
			var oData = oModel.getData();
			for (var i = 0; i < iNumberOfRows; i++) {
				oData.rows[i][aFields[0]] = i < 4 ? "A" : "B";
			}
			oModel.setData(oData);
			oTable.getColumns()[0].setSortProperty(aFields[0]);
			oTable.setVisibleRowCount(12);
			oTable.setFixedColumnCount(0);
			oTable.setEnableGrouping(true);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		},
		testAsync: function(mTestConfig) {
			return new Promise(function(resolve) {
				var oOnAfterRenderingDelegate = {
					onAfterRendering: onAfterRendering
				};

				function onRowsUpdated() {
					if (Device.browser.msie) {
						/* BCP: 1780405070 */
						window.setTimeout(function() {
							mTestConfig.test();
							resolve();
						}, 1000);
					} else {
						mTestConfig.test();
						resolve();
					}
				}

				function onAfterRendering() {
					oTable.removeEventDelegate(oOnAfterRenderingDelegate);
					oTable.attachEventOnce("rowsUpdated", onRowsUpdated);
				}

				if (mTestConfig.onAfterRendering) {
					oTable.addEventDelegate(oOnAfterRenderingDelegate);
				} else {
					oTable.attachEventOnce("rowsUpdated", onRowsUpdated);
				}

				mTestConfig.act();
			});
		}
	});

	QUnit.test("Activate / Deactivate", function(assert) {
		var oBinding = oTable.getBinding();
		var that = this;

		assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

		return this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after grouping");
				for (var i = 0; i < oTable.getRows().length; i++) {
					if (i == 0 || i == 5) {
						assert.ok(oTable.getRows()[i].isGroupHeader(), "Row " + i + " is group header");
					} else {
						assert.ok(!oTable.getRows()[i].isGroupHeader(), "Row " + i + " is leaf");
					}
				}
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.setEnableGrouping(false);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 8, "Row count after reset grouping");
				}
			});
		});
	});

	QUnit.test("Collapse / Expand", function(assert) {
		var that = this;

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before Grouping");

		return this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].collapse();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after collapse");
					assert.notOk(oTable.getRows()[0].isExpanded(), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].expand();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after expand");
					assert.ok(oTable.getRows()[0].isExpanded(0), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].toggleExpandedState();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after toggle");
					assert.notOk(oTable.getRows()[0].isExpanded(), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].toggleExpandedState();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after Toggle");
					assert.ok(oTable.getRows()[0].isExpanded(0), "Row expanded state");
				}
			});
		});
	});
});