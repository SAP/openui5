
//************************************************************************
// Helper Functions
//************************************************************************

jQuery.sap.require("sap.ui.table.TableUtils");
var Grouping = sap.ui.table.TableUtils.Grouping;
var TableUtils = sap.ui.table.TableUtils;


//************************************************************************
// Test Code
//************************************************************************

QUnit.module("Misc", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		destroyTables();
	}
});

QUnit.test("Connection to TableUtils", function(assert) {
	assert.ok(!!sap.ui.table.TableUtils.Grouping, "Grouping namespace available");
	assert.ok(sap.ui.table.TableUtils.Grouping.TableUtils === sap.ui.table.TableUtils, "Dependency forwarding of TableUtils correct");
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

	oTreeTable.unbindRows();
	doToggle("No Binding", true, false, false);
});


QUnit.module("Grouping Modes", {
	setup: function() {
		createTables();
	},
	teardown: function () {
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
	setup: function() {
		createTables();
		oTreeTable.setVisibleRowCount(12);
		sap.ui.getCore().applyChanges();
	},
	teardown: function () {
		destroyTables();
	}
});

QUnit.test("showGroupMenuButton", function(assert) {
	var bOrigTouch = sap.ui.Device.support.touch;

	sap.ui.Device.support.touch = false;
	assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.Table()), "sap.ui.table.Table / no touch");
	assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.TreeTable()), "sap.ui.table.TreeTable / no touch");
	assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.AnalyticalTable()), "sap.ui.table.AnalyticalTable / no touch");

	sap.ui.Device.support.touch = true;
	assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.Table()), "sap.ui.table.Table / touch");
	assert.ok(!Grouping.showGroupMenuButton(new sap.ui.table.TreeTable()), "sap.ui.table.TreeTable / touch");
	assert.ok(Grouping.showGroupMenuButton(new sap.ui.table.AnalyticalTable()), "sap.ui.table.AnalyticalTable / touch");

	sap.ui.Device.support.touch = bOrigTouch;
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
	assert.equal(Grouping._calcGroupIndent(oTable, 0, true), 0, "sap.ui.table.TreeTable, Level 0, Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 0, false), 0, "sap.ui.table.TreeTable, Level 0, !Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 1, true), 0, "sap.ui.table.TreeTable, Level 1, Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 1, false), 0, "sap.ui.table.TreeTable, Level 1, !Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 2, true), 24, "sap.ui.table.TreeTable, Level 2, Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 2, false), 0, "sap.ui.table.TreeTable, Level 2, !Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 3, true), 36, "sap.ui.table.TreeTable, Level 3, Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 3, false), 24, "sap.ui.table.TreeTable, Level 3, !Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 4, true), 44, "sap.ui.table.TreeTable, Level 4, Group Header");
	assert.equal(Grouping._calcGroupIndent(oTable, 4, false), 36, "sap.ui.table.TreeTable, Level 4, !Group Header");
});

QUnit.asyncTest("Tree Mode", function(assert) {
	var iRowCount = oTreeTable._getRowCount();
	assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows, "Row count before expand");
	ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

	var bSecondPass = false;

	var fnHandler = function() {
		sap.ui.getCore().applyChanges();
		var iCount = iNumberOfRows + 1;
		if (bSecondPass) {
			iCount++;
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
				sap.ui.getCore().applyChanges();
				for (var i = 0; i < 12; i++) {
					var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-col0").find(".sapUiTableTreeIcon");
					var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
					assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeOpen"), "No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
					assert.ok(!$Icon.hasClass("sapUiTableTreeIconLeaf"), "No state class on icon after unbind: sapUiTableTreeIconLeaf");
					assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeClosed"), "No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
					assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
					assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
				}
				QUnit.start();
			};

			oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
			oTreeTable.unbindRows();
		}
	};

	fnHandler();

	bSecondPass = true;
	oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
	TableUtils.toggleGroupHeader(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"), true);
	ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
	assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows + 1, "Row count after expand");
});

QUnit.asyncTest("Group Mode", function(assert) {
	oTreeTable.setUseGroupMode(true);
	sap.ui.getCore().applyChanges();

	var iRowCount = oTreeTable._getRowCount();
	assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows, "Row count before expand");
	ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

	var bSecondPass = false;

	var fnHandler = function() {
		sap.ui.getCore().applyChanges();
		var iCount = iNumberOfRows + 1;
		if (bSecondPass) {
			iCount++;
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
			assert.ok($Row.hasClass("sapUiTableGroupHeader") && bExpectGroupHeaderClass || !$Row.hasClass("sapUiTableGroupHeader") && !bExpectGroupHeaderClass, "Row " + i + " is Group Header");
			assert.ok($RowHdr.hasClass("sapUiTableGroupHeader") && bExpectGroupHeaderClass || !$RowHdr.hasClass("sapUiTableGroupHeader") && !bExpectGroupHeaderClass, "Row Header " + i + " is Group Header");
			if (bExpectExpanded) {
				assert.ok($GroupHdr.hasClass("sapUiTableGroupIconOpen"), "Header has correct expand state");
			} else if (bExpectGroupHeaderClass) {
				assert.ok($GroupHdr.hasClass("sapUiTableGroupIconClosed"), "Header has correct expand state");
			} else {
				assert.ok(!$GroupHdr.hasClass("sapUiTableGroupIconClosed") && !$GroupHdr.hasClass("sapUiTableGroupIconOpen"), "Header has correct expand state");
			}

			assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + i + " has correct level in data.");
			assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + i + " has correct level in dom.");
		}

		if (bSecondPass) {
			var fnUnbindHandler = function() {
				sap.ui.getCore().applyChanges();
				for (var i = 0; i < 12; i++) {
					var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
					assert.ok(!$Row.hasClass("sapUiTableGroupHeader"), "No group headers any more after unbind");
					assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
					assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
				}
				QUnit.start();
			};

			oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
			oTreeTable.unbindRows();
		}
	};

	fnHandler();

	bSecondPass = true;
	oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
	TableUtils.toggleGroupHeader(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"), true);
	ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
	assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows + 1, "Row count after expand");
});

QUnit.test("GroupMenuButton", function(assert) {
	oTreeTable.setUseGroupMode(true);
	sap.ui.getCore().applyChanges();

	for (var i = 0; i < 12; i++) {
		var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
		var $Button = $RowHdr.find(".sapUiTableGroupMenuButton");
		assert.equal($Button.length, 0, "Row Header " + i + " has no GroupMenuButton");
	}

	oTreeTable._bShowGroupMenuButton = true;
	oTreeTable.invalidate();
	sap.ui.getCore().applyChanges();

	for (var i = 0; i < 12; i++) {
		var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
		var $Button = $RowHdr.find(".sapUiTableGroupMenuButton");
		assert.equal($Button.length, 1, "Row Header " + i + " has GroupMenuButton");
	}
});


QUnit.module("sap.ui.table.Table: Experimental Grouping", {
	setup: function() {
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
	teardown: function () {
		destroyTables();
	}
});

QUnit.asyncTest("Activate Grouping", function(assert) {
	var oBinding = oTable.getBinding("rows");
	assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

	var fnHandlerProxy = function() {
		oTable.attachEventOnce("_rowsUpdated", fnHandler);
	};

	var fnHandler = function() {
		sap.ui.getCore().applyChanges();
		for (var i = 0; i < iNumberOfRows + 2; i++) {
			if (i == 0 || i == 5) {
				assert.ok(getRowHeader(i).hasClass("sapUiTableGroupHeader"), "Row " + i + " is group header");
			} else {
				assert.ok(!getRowHeader(i).hasClass("sapUiTableGroupHeader"), "Row " + i + " is no group header");
			}
		}
		QUnit.start();
	};

	oTable.attachEventOnce("_rowsUpdated", fnHandlerProxy);

	oTable.setGroupBy(oTable.getColumns()[0]);
	oBinding = oTable.getBinding("rows");
	equal(oBinding.getLength(), 10, "Row count after Grouping");
});

QUnit.test("Collapse / Expand", function(assert) {
	var oBinding = oTable.getBinding("rows");
	assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

	oTable.setGroupBy(oTable.getColumns()[0]);
	oBinding = oTable.getBinding("rows");
	equal(oBinding.getLength(), 10, "Row count after Grouping");

	sap.ui.getCore().applyChanges();

	TableUtils.toggleGroupHeader(oTable, getRowHeader(0), false);
	equal(oBinding.getLength(), 6, "Row count after Collapse");
	ok(!oBinding.isExpanded(0), "!Expanded");
	TableUtils.toggleGroupHeader(oTable, getRowHeader(0), true);
	equal(oBinding.getLength(), 10, "Row count after Expand");
	ok(oBinding.isExpanded(0), "Expanded");
	TableUtils.toggleGroupHeader(oTable, getRowHeader(0));
	equal(oBinding.getLength(), 6, "Row count after Toggle");
	ok(!oBinding.isExpanded(0), "!Expanded");
	TableUtils.toggleGroupHeader(oTable, getRowHeader(0));
	equal(oBinding.getLength(), 10, "Row count after Toggle");
	ok(oBinding.isExpanded(0), "Expanded");
});

QUnit.test("Reset Grouping", 3, function() {
	var oBinding = oTable.getBinding("rows");
	assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

	oTable.setGroupBy(oTable.getColumns()[0]);
	oBinding = oTable.getBinding("rows");
	equal(oBinding.getLength(), 10, "Row count after Grouping");

	oTable.setEnableGrouping(false);

	oBinding = oTable.getBinding("rows");
	equal(oBinding.getLength(), 8, "Row count after rest Grouping");
});
