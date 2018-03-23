/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.require([
	"sap/ui/table/TableUtils",
	"sap/ui/Device"
], function(TableUtils, Device) {
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

	QUnit.test("toggleGroupHeader", function(assert) {

		function doToggle(sText, bForceExpand, bExpectExpanded, bExpectChange) {
			var bRes = Grouping.toggleGroupHeader(oTreeTable, 0, bForceExpand);
			if (bExpectChange) {
				assert.ok(bExpectExpanded && (bRes === true) || !bExpectExpanded && (bRes === false), sText);
			} else {
				assert.ok((bRes !== true) && (bRes !== false), sText);
			}
			var oBinding = oTreeTable.getBinding("rows");
			if (oBinding) {
				assert.equal(oBinding.isExpanded(0), bExpectExpanded, "First row " + (bExpectExpanded ? "" : "not ") + "expanded");
			}
		}

		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "First row not expanded yet");
		doToggle("Nothing changed when force collapse", false, false, false);
		doToggle("Change when force expand", true, true, true);
		doToggle("Nothing changed when force expand again", true, true, false);
		doToggle("Changed when force collapse", false, false, true);
		doToggle("Change when toggle", null, true, true);
		doToggle("Change when toggle", null, false, true);
		// make the first node a leaf
		var oData = oTreeTable.getModel().getData();
		delete oData.tree.rows[0].rows;
		oTreeTable.getModel().setData(oData);
		doToggle("Try toggle leaf", null, false, false);
		oTreeTable.unbindRows();
		doToggle("No Binding", true, false, false);
	});

	QUnit.test("toggleGroupHeaderByRef", function(assert) {
		var oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTreeTable.attachToggleOpenState(oToggleOpenStateEventSpy);

		function checkExpanded(sType, bExpectExpanded) {
			assert.equal(oTreeTable.getBinding("rows").isExpanded(0), bExpectExpanded,
				sType + ": First row " + (bExpectExpanded ? "" : "not ") + "expanded");
		}

		function doToggle(sType, sText, oRef, bForceExpand, bExpectExpanded, bExpectChange) {
			var iIndex = -1;
			var bExpanded = false;
			var bCalled = false;

			var fOnGroupHeaderChanged = oTreeTable._onGroupHeaderChanged;
			oTreeTable._onGroupHeaderChanged = function(iRowIndex, bIsExpanded) {
				iIndex = iRowIndex;
				bExpanded = bIsExpanded;
				bCalled = true;
				fOnGroupHeaderChanged.apply(oTreeTable, arguments);
			};

			var bRes = Grouping.toggleGroupHeaderByRef(oTreeTable, oRef, bForceExpand);

			assert.ok(bExpectChange && bRes || !bExpectChange && !bRes, sType + ": " + sText);

			if (bExpectChange) {
				assert.ok(bCalled, sType + ": _onGroupHeaderChanged called");
				assert.ok(bExpectExpanded === bExpanded, sType + ": _onGroupHeaderChanged provides correct expand state");
				assert.ok(iIndex == 0, sType + ": _onGroupHeaderChanged provides correct index");

				assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
				assert.deepEqual(oToggleOpenStateEventSpy._mEventParameters, {
					id: oTreeTable.getId(),
					rowIndex: iIndex,
					rowContext: oTreeTable.getContextByIndex(iIndex),
					expanded: bExpanded
				}, "The toggleOpenState event was called with the correct parameters");
			} else {
				assert.ok(!bCalled, sType + ": _onGroupHeaderChanged not called");
				assert.ok(oToggleOpenStateEventSpy.notCalled, "The toggleOpenState event was not called");
			}

			checkExpanded(sType, bExpectExpanded);

			oToggleOpenStateEventSpy.reset();
		}

		function testWithValidDomRef(sType, oRef) {
			assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), sType + ": First row not expanded yet");
			doToggle(sType, "Nothing changed when force collapse", oRef, false, false, false);
			doToggle(sType, "Change when force expand", oRef, true, true, true);
			doToggle(sType, "Nothing changed when force expand again", oRef, true, true, false);
			doToggle(sType, "Changed when force collapse", oRef, false, false, true);
			doToggle(sType, "Change when toggle", oRef, null, true, true);
			doToggle(sType, "Change when toggle", oRef, null, false, true);
		}

		testWithValidDomRef("TreeIcon", jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"));

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		testWithValidDomRef("GroupIcon", jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"));

		doToggle("Wrong DomRef", "", oTreeTable.$(), true, false, false);
		doToggle("Wrong DomRef", "", oTreeTable.$(), false, false, false);
		doToggle("Wrong DomRef", "", oTreeTable.$(), null, false, false);
	});

	QUnit.test("isInSumRow", function(assert) {
		initRowActions(oTable, 1, 1);

		fakeSumRow(0);

		assert.ok(TableUtils.Grouping.isInSumRow(getCell(0, 0)), "DATACELL in sum row");
		assert.ok(!TableUtils.Grouping.isInSumRow(getCell(1, 0)), "DATACELL in normal row");

		assert.ok(TableUtils.Grouping.isInSumRow(getRowHeader(0)), "ROWHEADER in sum row");
		assert.ok(!TableUtils.Grouping.isInSumRow(getRowHeader(1)), "ROWHEADER in normal row");

		assert.ok(TableUtils.Grouping.isInSumRow(getRowAction(0)), "ROWACTION in sum row");
		assert.ok(!TableUtils.Grouping.isInSumRow(getRowAction(1)), "ROWACTION in normal row");

		assert.ok(!TableUtils.Grouping.isInSumRow(getColumnHeader(0)), "COLUMNHEADER");
		assert.ok(!TableUtils.Grouping.isInSumRow(getSelectAll()), "COLUMNROWHEADER");
		assert.ok(!TableUtils.Grouping.isInSumRow(null), "null");
		assert.ok(!TableUtils.Grouping.isInSumRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
	});

	QUnit.test("isInGroupingRow", function(assert) {
		initRowActions(oTable, 1, 1);

		fakeGroupRow(0);

		assert.ok(TableUtils.Grouping.isInGroupingRow(getCell(0, 0)), "DATACELL in group row");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(getCell(1, 0)), "DATACELL in normal row");

		assert.ok(TableUtils.Grouping.isInGroupingRow(getRowHeader(0)), "ROWHEADER in group row");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(getRowHeader(1)), "ROWHEADER in normal row");

		assert.ok(TableUtils.Grouping.isInGroupingRow(getRowAction(0)), "ROWACTION in group row");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(getRowAction(1)), "ROWACTION in normal row");

		assert.ok(!TableUtils.Grouping.isInGroupingRow(getColumnHeader(0)), "COLUMNHEADER");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(getSelectAll()), "COLUMNROWHEADER");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(null), "null");
		assert.ok(!TableUtils.Grouping.isInGroupingRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
	});

	QUnit.test("isGroupingRow", function(assert) {
		fakeGroupRow(0);

		assert.ok(!TableUtils.Grouping.isGroupingRow(), "Returned false: Invalid parameter passed");
		assert.ok(!TableUtils.Grouping.isGroupingRow(null), "Returned false: Invalid parameter passed");

		assert.ok(TableUtils.Grouping.isGroupingRow(oTable.getRows()[0].getDomRef()), "Returned true: Row 1 is a group header row");
		assert.ok(TableUtils.Grouping.isGroupingRow(getRowHeader(0)), "Returned true: The row header cell in Row 1 is part of the group header row");

		assert.ok(!TableUtils.Grouping.isGroupingRow(oTable.getRows()[1].getDomRef()), "Returned false: Row 2 is a normal row");
		assert.ok(!TableUtils.Grouping.isGroupingRow(getCell(0, 0)), "Returned false: A cell is not a group header row");
		assert.ok(!TableUtils.Grouping.isGroupingRow(getColumnHeader(0)), "Returned false: A column header cell is not a group header row");
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

		jQuery.sap.require("sap.ui.table.AnalyticalTable");
		var oAnaTable = new sap.ui.table.AnalyticalTable();

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
		var bOrigDesktop = sap.ui.Device.system.desktop;

		sap.ui.Device.system.desktop = false;
		assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.Table()), "sap.ui.table.Table / no desktop");
		assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.TreeTable()), "sap.ui.table.TreeTable / no desktop");
		assert.ok(Grouping.showGroupMenuButton(new sap.ui.table.AnalyticalTable()), "sap.ui.table.AnalyticalTable / no desktop");

		sap.ui.Device.system.desktop = true;
		assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.Table()), "sap.ui.table.Table / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.TreeTable()), "sap.ui.table.TreeTable / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.AnalyticalTable()), "sap.ui.table.AnalyticalTable / desktop");

		sap.ui.Device.system.desktop = bOrigDesktop;
	});

	QUnit.test("_calcGroupIndent", function(assert) {
		var oTable = new sap.ui.table.Table();
		assert.equal(Grouping._calcGroupIndent(oTable, 0, true), 0, "sap.ui.table.Table, Level 0, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 0, false), 0, "sap.ui.table.Table, Level 0, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, true), 12, "sap.ui.table.Table, Level 1, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, false), 0, "sap.ui.table.Table, Level 1, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, true), 24, "sap.ui.table.Table, Level 2, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, false), 12, "sap.ui.table.Table, Level 2, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, true), 32, "sap.ui.table.Table, Level 3, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, false), 24, "sap.ui.table.Table, Level 3, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, true), 40, "sap.ui.table.Table, Level 4, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, false), 32, "sap.ui.table.Table, Level 4, !Group Header");

		oTable = new sap.ui.table.TreeTable();
		assert.equal(Grouping._calcGroupIndent(oTable, 0, true), 0, "sap.ui.table.TreeTable, Level 0, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 0, false), 0, "sap.ui.table.TreeTable, Level 0, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, true), 12, "sap.ui.table.TreeTable, Level 1, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, false), 12, "sap.ui.table.TreeTable, Level 1, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, true), 24, "sap.ui.table.TreeTable, Level 2, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, false), 24, "sap.ui.table.TreeTable, Level 2, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, true), 32, "sap.ui.table.TreeTable, Level 3, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, false), 32, "sap.ui.table.TreeTable, Level 3, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, true), 40, "sap.ui.table.TreeTable, Level 4, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, false), 40, "sap.ui.table.TreeTable, Level 4, !Group Header");

		oTable = new sap.ui.table.AnalyticalTable();
		assert.equal(Grouping._calcGroupIndent(oTable, 0, true), 0, "sap.ui.table.AnalyticalTable, Level 0, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 0, false), 0, "sap.ui.table.AnalyticalTable, Level 0, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 0, false, true), 0, "sap.ui.table.AnalyticalTable, Level 0, Sum");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, true), 0, "sap.ui.table.AnalyticalTable, Level 1, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, false), 0, "sap.ui.table.AnalyticalTable, Level 1, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 1, false, true), 0, "sap.ui.table.AnalyticalTable, Level 1, Sum");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, true), 24, "sap.ui.table.AnalyticalTable, Level 2, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, false), 0, "sap.ui.table.AnalyticalTable, Level 2, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 2, false, true), 24, "sap.ui.table.AnalyticalTable, Level 2, Sum");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, true), 36, "sap.ui.table.AnalyticalTable, Level 3, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, false), 24, "sap.ui.table.AnalyticalTable, Level 3, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 3, false, true), 36, "sap.ui.table.AnalyticalTable, Level 3, Sum");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, true), 44, "sap.ui.table.AnalyticalTable, Level 4, Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, false), 36, "sap.ui.table.AnalyticalTable, Level 4, !Group Header");
		assert.equal(Grouping._calcGroupIndent(oTable, 4, false, true), 44, "sap.ui.table.AnalyticalTable, Level 4, Sum");
	});

	QUnit.test("Tree Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-col0").find(".sapUiTableTreeIcon");
				var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
				assert.equal($Icon.length, 1, "Tree Icon Available in first column - row " + i);
				var sClass = "sapUiTableTreeIconNodeClosed";
				var iLevel = 0;
				if (bSecondPass) {
					if (i == 0) {
						sClass = "sapUiTableTreeIconNodeOpen";
					} else if (i == 1) {
						sClass = "sapUiTableTreeIconLeaf";
						iLevel = 1;
					} else if (i == iCount - 1) {
						sClass = "sapUiTableTreeIconLeaf";
					}
				} else {
					if (i == iCount - 1) {
						sClass = "sapUiTableTreeIconLeaf";
					}
				}
				assert.ok($Icon.hasClass(sClass), "Icon has correct expand state: " + sClass);
				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + i + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + i + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-col0").find(".sapUiTableTreeIcon");
						var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeOpen"), "No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconLeaf"), "No state class on icon after unbind: sapUiTableTreeIconLeaf");
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeClosed"),
							"No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
					}
					done();
				};

				oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
			}
		};

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		Grouping.toggleGroupHeaderByRef(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"), true);
	});

	QUnit.test("Group Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
				var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
				var $GroupHdr = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-groupHeader");
				var iLevel = 0;
				var bExpectGroupHeaderClass = true;
				var bExpectExpanded = false;
				if (bSecondPass && i == 1) {
					iLevel = 1;
					bExpectGroupHeaderClass = false;
				} else if (bSecondPass && i == 0) {
					bExpectExpanded = true;
				} else if (i == iCount - 1) {
					bExpectGroupHeaderClass = false;
				}
				assert.ok($Row.hasClass("sapUiTableGroupHeader") && bExpectGroupHeaderClass || !$Row.hasClass("sapUiTableGroupHeader")
						  && !bExpectGroupHeaderClass, "Row " + i + " is Group Header");
				assert.ok($RowHdr.hasClass("sapUiTableGroupHeader") && bExpectGroupHeaderClass || !$RowHdr.hasClass("sapUiTableGroupHeader")
						  && !bExpectGroupHeaderClass, "Row Header " + i + " is Group Header");
				if (bExpectExpanded) {
					assert.ok($GroupHdr.hasClass("sapUiTableGroupIconOpen"), "Header has correct expand state");
				} else if (bExpectGroupHeaderClass) {
					assert.ok($GroupHdr.hasClass("sapUiTableGroupIconClosed"), "Header has correct expand state");
				} else {
					assert.ok(!$GroupHdr.hasClass("sapUiTableGroupIconClosed") && !$GroupHdr.hasClass("sapUiTableGroupIconOpen"),
						"Header has correct expand state");
				}

				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + i + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + i + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
						assert.ok(!$Row.hasClass("sapUiTableGroupHeader"), "No group headers any more after unbind");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
					}
					done();
				};

				oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
			}
		};

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		Grouping.toggleGroupHeaderByRef(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"), true);
	});

	QUnit.test("GroupMenuButton", function(assert) {
		var i;
		var $RowHdr;
		var $Button;
		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			$RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
			$Button = $RowHdr.find(".sapUiTableGroupMenuButton");
			assert.equal($Button.length, 0, "Row Header " + i + " has no GroupMenuButton");
		}

		oTreeTable._bShowGroupMenuButton = true;
		oTreeTable.invalidate();
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			$RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
			$Button = $RowHdr.find(".sapUiTableGroupMenuButton");
			assert.equal($Button.length, 1, "Row Header " + i + " has GroupMenuButton");
		}
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
		}
	});

	QUnit.test("Activate Grouping", function(assert) {
		var done = assert.async();
		var oBinding = oTable.getBinding("rows");

		assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

		var fnHandler = function() {
			for (var i = 0; i < iNumberOfRows + 2; i++) {
				if (i == 0 || i == 5) {
					assert.ok(getRowHeader(i).hasClass("sapUiTableGroupHeader"), "Row " + i + " is group header");
				} else {
					assert.ok(!getRowHeader(i).hasClass("sapUiTableGroupHeader"), "Row " + i + " is no group header");
				}
			}

			assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");
			done();
		};

		var fnHandlerProxy = function() {
			oTable.attachEventOnce("_rowsUpdated", fnHandler);
		};

		oTable.attachEventOnce("_rowsUpdated", fnHandlerProxy);

		oTable.setGroupBy(oTable.getColumns()[0]);
	});

	QUnit.test("Collapse / Expand", function(assert) {
		var oBinding = oTable.getBinding("rows");
		var oClock = sinon.useFakeTimers();

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before Grouping");

		oTable.setGroupBy(oTable.getColumns()[0]);
		oClock.tick(50);
		assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");

		Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0), false);
		oClock.tick(50);
		assert.equal(oTable._getTotalRowCount(), 6, "Row count after Collapse");
		assert.ok(!oBinding.isExpanded(0), "!Expanded");

		Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0), true);
		oClock.tick(50);
		assert.equal(oTable._getTotalRowCount(), 10, "Row count after Expand");
		assert.ok(oBinding.isExpanded(0), "Expanded");

		Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0));
		oClock.tick(50);
		assert.equal(oTable._getTotalRowCount(), 6, "Row count after Toggle");
		assert.ok(!oBinding.isExpanded(0), "!Expanded");

		Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0));
		oClock.tick(50);
		assert.equal(oTable._getTotalRowCount(), 10, "Row count after Toggle");
		assert.ok(oBinding.isExpanded(0), "Expanded");

		oClock.restore();
	});

	QUnit.test("Reset Grouping", function(assert) {
		var done = assert.async();

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before grouping");

		function testAsync(mTestConfig) {
			var fnPromiseResolver;
			var oPromise = new Promise(function(resolve) {
				fnPromiseResolver = resolve;
			});

			oTable.attachEventOnce("_rowsUpdated", function() {
				if (Device.browser.msie) {
					/* BCP: 1780405070 */
					window.setTimeout(function() {
						mTestConfig.test();
						fnPromiseResolver();
					}, 1000);
				} else {
					mTestConfig.test();
					fnPromiseResolver();
				}
			});

			mTestConfig.act();

			return oPromise;
		}

		testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after grouping");
			}
		}).then(function() {
			return testAsync({
				act: function() {
					oTable.setEnableGrouping(false);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 8, "Row count after reset grouping");
				}
			});
		}).then(done);
	});
});