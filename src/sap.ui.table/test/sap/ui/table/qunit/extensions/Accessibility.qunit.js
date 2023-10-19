/*global QUnit, oTable, oTreeTable, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
    "sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
    "sap/ui/table/RowAction",
	"sap/ui/table/RowSettings",
    "sap/ui/table/TreeTable",
	"sap/ui/table/library",
    "sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/m/IllustratedMessage",
	"sap/m/Label",
	"sap/ui/core/ControlBehavior"
], function(
	TableQUnitUtils,
	TableUtils,
	ManagedObject,
	Control,
	AnalyticalTable,
	Column,
	RowAction,
	RowSettings,
	TreeTable,
	Library,
	JSONModel,
	Device,
	coreLibrary,
	Filter,
	FilterOperator,
	jQuery,
	oCore,
	IllustratedMessage,
	Label,
	ControlBehavior
) {
	"use strict";

	var SelectionMode = Library.SelectionMode;

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var initRowActions = window.initRowActions;
	var removeRowActions = window.removeRowActions;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	//************************************************************************
	// Preparation Code
	//************************************************************************

	var TextControl = ManagedObject.extend("sap.ui.table.test.TextControl", {
		metadata: {
			properties: {
				text: {
					type: "string"
				}
			}
		},
		getAccessibilityInfo: function() {
			return {
				description: this.getText()
			};
		}
	});

	var TestControl = TableQUnitUtils.TestControl;
	var TestInputControl = TableQUnitUtils.TestInputControl;

	TestControl.prototype.getAccessibilityInfo = function() {
		var iMode = Column.ofCell(this).getIndex();

		if (this.data("CustomAccessibilityInfo")) {
			return this.data("CustomAccessibilityInfo");
		}

		switch (iMode) {
			case 0:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					enabled: true,
					editable: false
				};
			case 1:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					enabled: true
				};
			case 2:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					enabled: false,
					children: [new TextControl({text: "CHILD1"}), new TextControl({text: "CHILD2"})]
				};
			case 3:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					enabled: true
				};
			default:
				return null;
		}
	};
	TestInputControl.prototype.getAccessibilityInfo = TestControl.prototype.getAccessibilityInfo;

	function _modifyTables() {
		[oTable, oTreeTable].forEach(function(_oTable) {
			_oTable.removeAllColumns();
			TableQUnitUtils.addColumn(_oTable, "A Label", "A", false, true, true);
			TableQUnitUtils.addColumn(_oTable, "B Label", "B").setTooltip("B Label");
			TableQUnitUtils.addColumn(_oTable, "C Label", "C", true).setTooltip("tooltip");
			TableQUnitUtils.addColumn(_oTable, "D Label", "D", false, true, true).getTemplate().setVisible(false);
			TableQUnitUtils.addColumn(_oTable, "E Label", "E", false, true, true).setLabel(new Label({text: "E Label", required: true}));

			var oColumn = _oTable.getColumns()[1];
			oColumn.setSortProperty("SomeSortProperty");
			oColumn.setFilterProperty("SomeFilterProperty");
			oColumn.setSortOrder("Ascending");
			/** @deprecated As of version 1.120 */
			oColumn.setSorted(true);
			oColumn.setFiltered(true);

			_oTable.setRowSettingsTemplate(new RowSettings({
				highlight: "Success",
				navigated: true
			}));
		});

		oTreeTable.setFixedColumnCount(1);
		oTreeTable.setSelectedIndex(0);

		oCore.applyChanges();
	}

	function checkAriaSelected(sPropertyValue, bExpectSelected, assert) {
		if (bExpectSelected) {
			assert.strictEqual(sPropertyValue, "true", "aria-selected");
		} else {
			assert.ok(sPropertyValue === "false" || !sPropertyValue, "aria-selected");
		}
	}

	//************************************************************************
	// Test Code
	//************************************************************************

	QUnit.module("Data Cells", {
		beforeEach: function() {
			createTables();
			_modifyTables();
			initRowActions(oTable, 1, 1);
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function testAriaLabelsForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
		var mParams = mParams || {};
		var bFirstTime = !!mParams.firstTime;
		var bRowChange = !!mParams.rowChange;
		var bColChange = !!mParams.colChange;
		var oTable = !mParams.table ? window.oTable : mParams.table;
		var sTableId = oTable.getId();
		var bGroup = !!mParams.group;
		var bSum = !!mParams.sum;

		var aLabels = [];
		if (bFirstTime) {
			aLabels.push(sTableId + "-ariacount");
			aLabels.push(sTableId + "-ariaselection");
		}

		aLabels.push(sTableId + "-rownumberofrows");
		aLabels.push(sTableId + "-colnumberofcols");

		var oColumn = oTable._getVisibleColumns()[iCol];
		var oRow = oTable.getRows()[iRow];
		var sRowId = oRow.getId();
		var oCell = oRow.getCells()[iCol];
		var iIndex = Column.ofCell(oCell).getIndex();

		if (bGroup) {
			aLabels.push(sTableId + "-ariarowgrouplabel");
			if (bRowChange) {
				aLabels.push(sRowId + "-groupHeader");
			}
		}

		if (bSum) {
			aLabels.push(sTableId + "-ariagrandtotallabel");
		}

		if (!bGroup && !bSum) {
			aLabels.push(sRowId + "-highlighttext");
		}

		aLabels.push(oColumn.getId() + "-inner");

		if (iIndex == 0) {
			aLabels.push(sTableId + "-ariafixedcolumn");
		}

		if (!bGroup) {
			if (iIndex === 4) {
				aLabels.push(oCell.getId());
			} else {
				aLabels.push(sTableId + "-cellacc");
			}

			if (iIndex === 0 || iIndex === 2 || iIndex === 4) {
				aLabels.push(sTableId + "-toggleedit");
			}
		}

		if (bFirstTime || bRowChange) {
			aLabels.push(sTableId + "-rownavigatedtext");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of cell [" + iRow + ", " + iCol + "]"
		);

		var sText = oTable.$("rownumberofrows").text().trim();
		if (bFirstTime || bRowChange) {
			assert.ok(sText.length > 0, "Number of rows are set on row change: " + sText);
		} else {
			assert.ok(sText.length == 0, "Number of rows are not set when row not changed: " + sText);
		}
		sText = oTable.$("colnumberofcols").text().trim();
		if (bFirstTime || bColChange) {
			assert.ok(sText.length > 0, "Number of columns are set on column change: " + sText);
		} else {
			assert.ok(sText.length == 0, "Number of columns are not set when column not changed: " + sText);
		}
	}

	function testAriaLabelsForNonFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
		var mParams = mParams || {};
		var aLabels = [];
		var oTable = !mParams.table ? window.oTable : mParams.table;
		var oColumn = oTable._getVisibleColumns()[iCol];
		var oRow = oTable.getRows()[iRow];
		var oCell = oRow.getCells()[iCol];
		var iIndex = Column.ofCell(oCell).getIndex();

		aLabels.push(oColumn.getId() + "-inner");
		if (iIndex == 0) {
			aLabels.push(oTable.getId() + "-ariafixedcolumn");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of cell [" + iRow + ", " + iCol + "]"
		);
	}

	function testACCInfoForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
		var oRow = oTable.getRows()[iRow];
		var oCell = oRow.getCells()[iCol];
		var iIndex = Column.ofCell(oCell).getIndex();
		var aExpected = [];

		var sText = oTable.$("cellacc").text().trim();

		if (iIndex < 3) {
			aExpected.push("TYPE_" + oCell.getText());
			aExpected.push("DESCRIPTION_" + oCell.getText());
		}
		if (iIndex == 0) {
			aExpected.push(TableUtils.getResourceText("TBL_CTRL_STATE_READONLY"));
		}
		if (iIndex == 2) {
			aExpected.push(TableUtils.getResourceText("TBL_CTRL_STATE_DISABLED"));
			aExpected.push("CHILD1 CHILD2");
		}
		if (iIndex == 3 || iIndex == 5 || iIndex == 6 || iIndex == 7) {
			aExpected.push(TableUtils.getResourceText("TBL_CTRL_STATE_EMPTY"));
		}
		if (iIndex == 8) {
			aExpected.push("CHILD1 CHILD2");
		}

		var sExpected = aExpected.length ? aExpected.join(" ") : "";
		assert.strictEqual(sText, sExpected, "ACC Info description of cell [" + iRow + ", " + iCol + "]");
	}

	function testAriaDescriptionsForFocusedDataCell($Cell, iRow, iCol, assert, mParams, bExpanded) {
		var mParams = mParams || {};
		var oTable = !mParams.table ? window.oTable : mParams.table;
		var bGroup = !!mParams.group;
		var aDescriptions = [];
		var oRow = oTable.getRows()[iRow];
		var oCell = oRow.getCells()[iCol];
		var iIndex = Column.ofCell(oCell).getIndex();

		if (oTable instanceof TreeTable && iIndex == 0 && $Cell.find(".sapUiTableTreeIcon").not(".sapUiTableTreeIconLeaf").length == 1 || bGroup) {
			aDescriptions.push(oTable.getId() + (bExpanded ? "-rowcollapsetext" : "-rowexpandtext"));
		}

		assert.strictEqual(
			($Cell.attr("aria-describedby") || "").trim(),
			aDescriptions.join(" "),
			"aria-describedby of cell [" + iRow + ", " + iCol + "]"
		);
	}

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var done = assert.async();
		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert);
			testAriaLabelsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true});
		}
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert);
			testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true});
		}

		removeRowActions(oTable);

		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(2, i, true, assert);
			testAriaLabelsForFocusedDataCell($Cell, 2, i, assert, {rowChange: i == 0, colChange: true});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell($Cell, 1, oTable.columnCount - 1, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (TreeTable)", function(assert) {
		var done = assert.async();
		var $Cell;
		var i;
		for (i = 0; i < oTreeTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert, oTreeTable);
			testAriaLabelsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true, table: oTreeTable});
		}
		for (i = 0; i < oTreeTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert, oTreeTable);
			testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true, table: oTreeTable});
		}

		removeRowActions(oTreeTable);

		for (i = 0; i < oTreeTable.columnCount; i++) {
			$Cell = getCell(2, i, true, assert, oTreeTable);
			testAriaLabelsForFocusedDataCell($Cell, 2, i, assert, {rowChange: i == 0, colChange: true, table: oTreeTable});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell($Cell, 1, oTreeTable.columnCount - 1, assert, {table: oTreeTable});
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, false, assert);
			testAriaLabelsForNonFocusedDataCell($Cell, 0, i, assert);
		}
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, false, assert);
			testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("no aria-labelledby attr. '-inner' in cell when columnHeaderVisible=false", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var oColumn;
		var $Cell;
		var i;

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();

		for (i = 0; i < oTable.columnCount; i++) {
			oColumn = oTable._getVisibleColumns()[i];
			$Cell = getCell(0, i, false, assert);
			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim().indexOf(oColumn.getId() + "-inner"),
				-1,
				"no aria-labelledby '" + oColumn.getId() + "-inner' in cell pointing to its column label"
			);
		}

		for (i = 0; i < oTable.columnCount; i++) {
			oColumn = oTable._getVisibleColumns()[i];
			$Cell = getCell(1, i, true, assert);
			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim().indexOf(oColumn.getId() + "-inner"),
				-1,
				"no aria-labelledby '" + oColumn.getId() + "-inner' in cell pointing to its column label"
			);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("ACCInfo", function(assert) {
		var done = assert.async();
		var $Cell;

		oTable.addColumn(new Column({
			label: "Column with empty content",
			template: new TestControl().data("CustomAccessibilityInfo", {
				description: ""
			})
		}));
		oTable.addColumn(new Column({
			label: "Column with invisible template",
			template: new TestControl({
				visible: false
			})
		}));
		oTable.addColumn(new Column({
			label: "Column with empty nested content",
			template: new TestControl().data("CustomAccessibilityInfo", {
				description: "",
				children: [new TextControl(), new TextControl()]
			})
		}));
		oTable.addColumn(new Column({
			label: "Column with nested content",
			template: new TestControl().data("CustomAccessibilityInfo", {
				description: "",
				children: [new TextControl({text: "CHILD1"}), new TextControl({text: "CHILD2"})]
			})
		}));
		oCore.applyChanges();

		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert);
			testACCInfoForFocusedDataCell($Cell, 0, i, assert);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell($Cell, 0, oTable.columnCount - 1, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();
		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert);
			testAriaDescriptionsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true});
		}
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert);
			testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + (oTable.columnCount - 1) + "]");
			done();
		}, 100);
	});

	QUnit.test("aria-describedby with Focus (TreeTable)", function(assert) {
		var done = assert.async();
		var $Cell;
		var i;
		for (i = 0; i < oTreeTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert, oTreeTable);
			testAriaDescriptionsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true, table: oTreeTable}, false);
		}
		for (i = 0; i < oTreeTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert, oTreeTable);
			testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, table: oTreeTable}, false);
		}

		oTreeTable.expand(0);
		oTreeTable.expand(2);
		oTreeTable.attachEventOnce("rowsUpdated", function() {
			setTimeout(function() {
				$Cell = getCell(0, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 0, 0, assert, {firstTime: true, colChange: true, table: oTreeTable}, true);
				$Cell = getCell(1, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 1, 0, assert, {firstTime: true, colChange: false, table: oTreeTable}, false);
				$Cell = getCell(2, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 2, 0, assert, {firstTime: true, colChange: true, table: oTreeTable}, true);

				TableQUnitUtils.setFocusOutsideOfTable(assert);
				setTimeout(function() {
					assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + (oTable.columnCount - 1) + "]");
					done();
				}, 100);
			}, 100);
		});
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, false, assert);
			assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [0, " + i + "]");
		}
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, false, assert);
			assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + i + "]");
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("Group Header Row", function(assert) {
		var done = assert.async();
		initRowActions(oTable, 1, 1);

		fakeGroupRow(1).then(function(oRefs) {
			assert.strictEqual(oRefs.row.attr("aria-expanded"), "true", "aria-expanded set on group row");
			assert.strictEqual(oRefs.row.attr("aria-level"), "1", "aria-level set on group row");
			assert.strictEqual(oRefs.fixed.attr("aria-expanded"), "true", "aria-expanded set on group row (fixed)");
			assert.strictEqual(oRefs.fixed.attr("aria-level"), "1", "aria-level set on group row (fixed)");
			assert.notOk(oRefs.act.attr("aria-expanded"), "aria-expanded is not set on row action");
			assert.notOk(oRefs.act.attr("aria-level"), "aria-level is not set on row action");

			var $Cell;
			var i;
			for (i = 0; i < oTable.columnCount; i++) {
				$Cell = getCell(1, i, false, assert);
				assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell group row");
				testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {group: true});
			}

			for (i = 0; i < oTable.columnCount; i++) {
				$Cell = getCell(1, i, true, assert);
				testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {
					firstTime: i == 0,
					rowChange: i == 0,
					colChange: true,
					group: true
				});
				testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {
					rowChange: i == 0,
					colChange: true,
					group: true
				}, true);
				oTable.setSelectionMode(SelectionMode.Row);
				oCore.applyChanges();
				assert.ok(!$Cell[0].hasAttribute("title"), "Group row data cells have no title");
				assert.equal(jQuery(document.getElementById(oTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
					"Group row doesn't have row selector text");
			}

			TableQUnitUtils.setFocusOutsideOfTable(assert);
			setTimeout(function() {
				testAriaLabelsForNonFocusedDataCell(getCell(1, oTable.columnCount - 1, false, assert), 1, oTable.columnCount - 1, assert);
				done();
			}, 100);
		});
	});

	QUnit.test("Sum Row", function(assert) {
		var oRowDomRefs;

		initRowActions(oTable, 1, 1);
		TableUtils.Grouping.setToDefaultGroupMode(oTable);

		return fakeSumRow(1).then(function(oRefs) {
			oRowDomRefs = oRefs;

			assert.strictEqual(oRefs.row.attr("aria-level"), "1", "aria-level set on sum row");
			assert.strictEqual(oRefs.fixed.attr("aria-level"), "1", "aria-level set on sum row (fixed part)");
			assert.notOk(oRefs.act.attr("aria-level"), "aria-level is not set on sum row (action part)");

			var $Cell;
			var i;
			for (i = 0; i < oTable.columnCount; i++) {
				$Cell = getCell(1, i, false, assert);
				assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell sum row");
				testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {sum: true});
			}

			for (i = 0; i < oTable.columnCount; i++) {
				$Cell = getCell(1, i, true, assert);
				testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {
					firstTime: i == 0,
					colChange: true,
					sum: true
				});
				testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {
					firstTime: i == 0,
					colChange: true,
					sum: true
				});
				oTable.setSelectionMode(SelectionMode.Row);
				oCore.applyChanges();
				assert.ok(!$Cell[0].hasAttribute("title"), "Sum row data cells have no title");
				assert.equal(jQuery(document.getElementById(oTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
					"Sum row doesn't have row selector text");
			}

			TableQUnitUtils.setFocusOutsideOfTable(assert);
		}).then(TableQUnitUtils.$wait(100)).then(function() {
			testAriaLabelsForNonFocusedDataCell(getCell(1, oTable.columnCount - 1, false, assert), 1, oTable.columnCount - 1, assert);
			TableUtils.Grouping.setToDefaultFlatMode(oTable);

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			assert.strictEqual(oRowDomRefs.row.attr("aria-level"), undefined, "aria-level set on sum row");
			assert.strictEqual(oRowDomRefs.fixed.attr("aria-level"), undefined, "aria-level set on sum row (fixed part)");
			assert.strictEqual(oRowDomRefs.act.attr("aria-level"), undefined, "aria-level set on sum row (action part)");
		});
	});

	QUnit.test("Other ARIA Attributes of Data Cell", function(assert) {
		var $Elem = oTable.$("rows-row0-col0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = oTable.$("rows-row0").find("td").last(); //dummyCell
		assert.strictEqual($Elem.attr("role"), "presentation", "role");
		$Elem = oTable.$("rows-row1-col0");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		$Elem = oTable.$("rows-row1").find("td").last(); //dummyCell
		assert.strictEqual($Elem.attr("role"), "presentation", "role");
		$Elem = oTreeTable.$("rows-row0-col0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		assert.strictEqual($Elem.parent().attr("aria-level"), "1", "aria-level");
		assert.strictEqual($Elem.parent().attr("aria-expanded"), "false", "aria-expanded");
		$Elem = oTreeTable.$("rows-row0").find("td").last(); //dummyCell
		assert.strictEqual($Elem.attr("role"), "presentation", "role");
		$Elem = oTreeTable.$("rows-row0-col1");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		assert.strictEqual($Elem.parent().attr("aria-level"), "1", "aria-level");
		assert.strictEqual($Elem.parent().attr("aria-expanded"), "false", "aria-expanded");
		oTable.invalidate();
		oCore.applyChanges();
		$Elem = oTable.$("rows-row0-col0");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = oTable.$("rows-row1-col0");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.module("Column Header", {
		beforeEach: function() {
			createTables();
			_modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function testAriaLabelsForColumnHeader($Cell, iCol, assert, mParams) {
		var mParams = mParams || {};
		var bFirstTime = !!mParams.firstTime;
		var bFocus = !!mParams.focus;
		var bColChange = !!mParams.colChange;
		var sTableId = oTable.getId();

		var aLabels = [];
		if (bFirstTime && bFocus) {
			aLabels.push(sTableId + "-ariacount");
			aLabels.push(sTableId + "-ariaselection");
		}

		if (bFocus) {
			aLabels.push(sTableId + "-colnumberofcols");
		}

		var oColumn = oTable._getVisibleColumns()[iCol];

		aLabels.push(oColumn.getId() + "-inner");

		if (iCol == 0) {
			aLabels.push(sTableId + "-ariafixedcolumn");
		}

		if (bFocus && iCol == 1) {
			aLabels.push(sTableId + "-ariacolfiltered");
		}

		if (bFocus && iCol == 2) {
			aLabels.push(sTableId + "-cellacc"); // Column 2 has tooltip see TableQUnitUtils.js
		}

		if (bFocus && iCol == 4) {
			aLabels.push(sTableId + "-ariarequired");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of colum header " + iCol
		);

		if (bFocus) {
			var sText = oTable.$("colnumberofcols").text().trim();
			if (bFirstTime || bColChange) {
				assert.ok(sText.length > 0, "Number of columns are set on column change: " + sText);
			} else {
				assert.ok(sText.length == 0, "Number of columns are not set when column not changed: " + sText);
			}
		}
	}

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var done = assert.async();
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, true, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true, focus: true});
		}

		removeRowActions(oTable);

		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, true, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: false, colChange: true, focus: true});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForColumnHeader($Cell, oTable.columnCount - 1, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, true, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of column header " + i);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of column header " + i);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("required state of multi column header with Focus", function(assert) {
		var $Cell;
		var sTableId = oTable.getId();
		var oCell = oTable._getVisibleColumns()[1].getDomRef();
		$Cell = jQuery(oCell);
		oTable.getColumns()[1].setLabel(null);
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new Label({required: true, text: "Test Text"}));
		oTable.getColumns()[1].setHeaderSpan([3, 2, 1]);
		oCore.applyChanges();

		oCell.focus();

		assert.ok($Cell.attr("aria-labelledby").includes(sTableId + "-ariarequired"), "aria-required");
	});

	QUnit.test("Other ARIA Attributes of Column Header", function(assert) {
		var $Elem = oTable.getColumns()[0].$();
		assert.strictEqual($Elem.attr("role"), "columnheader", "role");
		assert.ok(!$Elem.attr("aria-haspopup"), "aria-haspopup");
		assert.ok(!$Elem.attr("aria-sort"), "aria-sort");
		$Elem = oTable.getColumns()[1].$();
		assert.strictEqual($Elem.attr("role"), "columnheader", "role");
		assert.strictEqual($Elem.attr("aria-haspopup"), "menu", "aria-haspopup");
		assert.strictEqual($Elem.attr("aria-sort"), "ascending", "aria-sort");
	});

	QUnit.module("Row Header", {
		beforeEach: function() {
			createTables();
			_modifyTables();
		},
		afterEach: function() {
			destroyTables();
		},
		testAriaLabels: function($Cell, iRow, assert, mParams) {
			var mParams = mParams || {};
			var bFirstTime = !!mParams.firstTime;
			var bFocus = !!mParams.focus;
			var bRowChange = !!mParams.rowChange;
			var bGroup = !!mParams.group;
			var bSum = !!mParams.sum;
			var bExpanded = !!mParams.expanded;
			var oTable = !mParams.table ? window.oTable : mParams.table;
			var sTableId = oTable.getId();
			var oRow = oTable.getRows()[iRow];
			var sRowId = oRow.getId();

			var aLabels = [];
			if (bFirstTime && bFocus) {
				aLabels.push(sTableId + "-ariacount");
				aLabels.push(sTableId + "-ariaselection");
			}

			if (bFocus) {
				aLabels.push(sTableId + "-rownumberofrows");
				aLabels.push(sTableId + "-colnumberofcols");
				if (bGroup) {
					aLabels.push(sTableId + "-ariarowgrouplabel");
					aLabels.push(sRowId + "-groupHeader");
					aLabels.push(sTableId + (bExpanded ? "-rowcollapsetext" : "-rowexpandtext"));
				} else if (bSum) {
					aLabels.push(sTableId + "-ariagrandtotallabel");
				} else {
					aLabels.push(sRowId + "-rowselecttext");
					aLabels.push(sRowId + "-highlighttext");
				}

				if (bFirstTime || bRowChange) {
					aLabels.push(sTableId + "-rownavigatedtext");
				}
			}

			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim(),
				aLabels.join(" "),
				"aria-labelledby of row header " + iRow
			);

			if (bFocus) {
				var sText = oTable.$("rownumberofrows").text().trim();
				if (bFirstTime || bRowChange) {
					assert.ok(sText.length > 0, "Number of rows are set on row change: " + sText);
				} else {
					assert.ok(sText.length == 0, "Number of rows are not set when row not changed: " + sText);
				}
			}
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		for (var i = 0; i < 2; i++) {
			$Cell = getRowHeader(i, true, assert);
			this.testAriaLabels($Cell, i, assert, {firstTime: i == 0, rowChange: true, focus: true});
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowHeader(i, false, assert);
			this.testAriaLabels($Cell, i, assert, {rowChange: true});
		}
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowHeader(i, true, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
		}
	});

	QUnit.test("Group Header Row", function(assert) {
		var that = this;
		var done = assert.async();
		fakeGroupRow(1).then(function(oRefs) {
			var $Cell;

			assert.notOk(oRefs.hdr.attr("aria-expanded"), "aria-expanded is not set on group row header");
			assert.notOk(oRefs.hdr.attr("aria-level"), "aria-level is not set on group row header");
			assert.strictEqual(oRefs.hdr.attr("aria-haspopup"), "menu", "aria-haspopup set on group row header");

			$Cell = getRowHeader(1, false, assert);
			that.testAriaLabels($Cell, 1, assert, {group: true});
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

			$Cell = getRowHeader(1, true, assert);
			that.testAriaLabels($Cell, 1, assert, {
				group: true,
				focus: true,
				firstTime: true,
				expanded: true
			});
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

			assert.ok(!$Cell[0].hasAttribute("title"), "The row header of a group row has no title");
			assert.equal(jQuery(document.getElementById(oTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
				"The row header of a group row doesn't have row selector text");

			TableQUnitUtils.setFocusOutsideOfTable(assert);
			setTimeout(function() {
				that.testAriaLabels($Cell, 1, assert);
				done();
			}, 100);
		});
	});

	QUnit.test("Group Header Row (TreeTable)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();

		$Cell = getRowHeader(0, true, assert, oTreeTable);
		this.testAriaLabels($Cell, 0, assert, {group: true, focus: true, firstTime: true, rowChange: true, colChange: true, table: oTreeTable});

		assert.ok(!$Cell[0].hasAttribute("title"), "The row header of a group row has no title");
		assert.equal(jQuery(document.getElementById(oTreeTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
			"The row header of a group row doesn't have row selector text");

		oTreeTable.expand(0);
		oTreeTable.attachEventOnce("rowsUpdated", function() {
			setTimeout(function() {
				that.testAriaLabels($Cell, 0, assert, {group: true, focus: true, rowChange: true, expanded: true, table: oTreeTable});
				done();
			}, 100);
		});
	});

	QUnit.test("Sum Row", function(assert) {
		var $Cell;
		var oRowDomRefs;
		var that = this;

		TableUtils.Grouping.setToDefaultGroupMode(oTable);

		return fakeSumRow(1).then(function(oRefs) {
			oRowDomRefs = oRefs;
			assert.notOk(oRefs.hdr.attr("aria-level"), "aria-level is not set on sum row header");

			$Cell = getRowHeader(1, false, assert);
			that.testAriaLabels($Cell, 1, assert, {sum: true});
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

			$Cell = getRowHeader(1, true, assert);
			that.testAriaLabels($Cell, 1, assert, {sum: true, focus: true, firstTime: true});
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

			assert.ok(!$Cell[0].hasAttribute("title"), "The row header of a sum row has no title");
			assert.equal(jQuery(document.getElementById(oTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
				"The row header of a sum row doesn't have row selector text");

			TableQUnitUtils.setFocusOutsideOfTable(assert);
		}).then(TableQUnitUtils.$wait(100)).then(function() {
			that.testAriaLabels($Cell, 1, assert);
			TableUtils.Grouping.setToDefaultFlatMode(oTable);

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			assert.strictEqual(oRowDomRefs.hdr.attr("aria-level"), undefined, "aria-level not set on sum row header if table is in flat mode");
		});
	});

	QUnit.test("Other ARIA Attributes", function(assert) {
		var $Elem;

		$Elem = oTable.$("rowsel0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		oTable.invalidate();
		oCore.applyChanges();

		$Elem = oTable.$("rowsel0");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	function testTitleAndSelectorText(assert, sSelectionMode, sSelectionBehavior, iFixedColumnCount, bSelected) {
		var oRow = oTable.getRows()[0];
		var $Ref = oRow.getDomRefs(true);
		var $Cell = getRowHeader(0);
		var $RowSelectorTextRef = oRow.$("rowselecttext");

		if (sSelectionMode === "None") {
			assert.ok(!$Cell[0].hasAttribute("title"), "The row header has no title because SelectionMode is \"None\"");
			assert.ok(!$Ref.rowScrollPart[0].hasAttribute("title"), "The scrollable part of the row has no title because SelectionMode is \"None\"");
			assert.ok(!$Ref.rowActionPart[0].hasAttribute("title"), "The action part of the row has no title because SelectionMode is \"None\"");
			assert.equal($RowSelectorTextRef.text(), "", "The row header doesn't have row selector text because SelectionMode is \"None\"");
		} else {
			var sTitle = bSelected ? TableUtils.getResourceText("TBL_ROW_DESELECT") : TableUtils.getResourceText("TBL_ROW_SELECT");
			var sRowSelectorText = bSelected ? TableUtils.getResourceText("TBL_ROW_DESELECT_KEY") :
				TableUtils.getResourceText("TBL_ROW_SELECT_KEY");
			var sText = bSelected ? "deselects" : "selects";

			assert.equal($Cell[0].title, sTitle,
				"selectionBehavior = " + sSelectionBehavior + ", fixedColumnCount = " + iFixedColumnCount +
				", The row header has a title saying that clicking " + sText + " the row");
			if (sSelectionBehavior === "Row") {
				assert.equal($Ref.rowScrollPart[0].title, sTitle, "selectionBehavior = Row, fixedColumnCount = " + iFixedColumnCount +
				", The scrollable part of the row has a title saying that clicking " + sText + " the row");

				if (iFixedColumnCount === "1") {
					assert.equal($Ref.rowFixedPart[0].title, sTitle,
						"selectionBehavior = Row, fixedColumnCount = 1, The fixed part of the row has a title saying that clicking deselects the row");
				}

				assert.equal($Ref.rowActionPart[0].title, sTitle,
					"selectionBehavior = " + sSelectionBehavior + ", fixedColumnCount = " + iFixedColumnCount +
					", The action part of the row has a title saying that clicking " + sText + " the row");
			}
			assert.ok($RowSelectorTextRef.html().indexOf(sRowSelectorText) > -1,
				"selectionBehavior = " + sSelectionBehavior + ", fixedColumnCount = " + iFixedColumnCount +
				" The row header has a row selector text saying that pressing SPACE " + sText + " the row");
		}
	}

	QUnit.test("Title and selector text", function(assert) {
		var oRow = oTable.getRows()[0];
		var $Cell = getRowHeader(0);
		var $RowSelectorTextRef = oRow.$("rowselecttext");
		initRowActions(oTable, 1, 1);
		initRowActions(oTreeTable, 1, 1);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			testTitleAndSelectorText(assert, "MultiToggle", "RowSelector", 1, true);
			oTable.clearSelection();
			testTitleAndSelectorText(assert, "MultiToggle", "RowSelector", 1, false);

			oTable.setSelectionBehavior("Row");
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable._getSelectionPlugin().attachEventOnce("selectionChange", resolve);
				oTable.setSelectedIndex(0);
			});
		}).then(function() {
			testTitleAndSelectorText(assert, "MultiToggle", "Row", 1, true);
			oTable.clearSelection();
			testTitleAndSelectorText(assert, "MultiToggle", "Row", 1, false);

			oTable.setFixedColumnCount(0, false);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable._getSelectionPlugin().attachEventOnce("selectionChange", resolve);
				oTable.setSelectedIndex(0);
			});
		}).then(function() {
			testTitleAndSelectorText(assert, "MultiToggle", "Row", 0, true);
			oTable.clearSelection();
			testTitleAndSelectorText(assert, "MultiToggle", "Row", 0, false);

			oTable.setSelectionMode(SelectionMode.Single);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
				oTable.setSelectedIndex(0);
			});
		}).then(function() {
			testTitleAndSelectorText(assert, "Single", "Row", 0, true);
			oTable.clearSelection();
			testTitleAndSelectorText(assert, "Single", "Row", 0, false);

			oTable.setSelectionMode(SelectionMode.None);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			testTitleAndSelectorText(assert, "None");

			oTable.setSelectionMode(SelectionMode.MultiToggle);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			testTitleAndSelectorText(assert, "MultiToggle", "Row", 0, false);
			oTable.getModel().setData([]);

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			assert.ok(!$Cell[0].hasAttribute("title"), "The row has no title because it is empty");
			assert.equal($RowSelectorTextRef.text(), "", "The row doesn't have row selector text because it is empty");
		});
	});

	QUnit.module("Row Actions", {
		beforeEach: function() {
			createTables();
			_modifyTables();
			initRowActions(oTable, 1, 1);
			initRowActions(oTreeTable, 1, 1);
		},
		afterEach: function() {
			destroyTables();
		},
		testAriaLabels: function($Cell, iRow, assert, mParams) {
			var mParams = mParams || {};
			var bFirstTime = !!mParams.firstTime;
			var bFocus = !!mParams.focus;
			var bRowChange = !!mParams.rowChange;
			var bGroup = !!mParams.group;
			var bSum = !!mParams.sum;
			var bExpanded = !!mParams.expanded;
			var oTable = !mParams.table ? window.oTable : mParams.table;
			var sTableId = oTable.getId();
			var oRow = oTable.getRows()[iRow];
			var sRowId = oRow.getId();

			var aLabels = [];
			if (bFirstTime && bFocus) {
				aLabels.push(sTableId + "-ariacount");
				aLabels.push(sTableId + "-ariaselection");
			}

			if (bFocus) {
				aLabels.push(sTableId + "-rownumberofrows");
				aLabels.push(sTableId + "-colnumberofcols");
				aLabels.push(sTableId + "-rowacthdr");
				if (!bGroup && !bSum) {
					aLabels.push(sRowId + "-highlighttext");
				}
				if (bGroup) {
					aLabels.push(sTableId + "-ariarowgrouplabel");
					if (bRowChange) {
						aLabels.push(sRowId + "-groupHeader");
					}
					aLabels.push(sTableId + (bExpanded ? "-rowcollapsetext" : "-rowexpandtext"));
				} else if (bSum) {
					aLabels.push(sTableId + "-ariagrandtotallabel");
				}
				if (!bGroup) {
					aLabels.push(sTableId + "-cellacc");
				}
				if (bFirstTime || bRowChange) {
					aLabels.push(sTableId + "-rownavigatedtext");
				}
			} else {
				aLabels.push(sTableId + "-rowacthdr");
			}

			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim(),
				aLabels.join(" "),
				"aria-labelledby of row action " + iRow
			);

			if (bFocus) {
				var sText = oTable.$("rownumberofrows").text().trim();
				if (bFirstTime || bRowChange) {
					assert.ok(sText.length > 0, "Number of rows are set on row change: " + sText);
				} else {
					assert.ok(sText.length == 0, "Number of rows are not set when row not changed: " + sText);
				}
			}
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		for (var i = 0; i < 2; i++) {
			$Cell = getRowAction(i, true, assert);
			this.testAriaLabels($Cell, i, assert, {
				firstTime: i == 0,
				rowChange: true,
				colChange: i < 2,
				focus: true
			});
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (Group Row)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		fakeGroupRow(1).then(function() {
			for (var i = 0; i < 2; i++) {
				$Cell = getRowAction(i, true, assert);
				that.testAriaLabels($Cell, i, assert, {
					firstTime: i == 0,
					rowChange: true,
					colChange: i < 2,
					focus: true,
					group: i == 1,
					expanded: true
				});
			}

			$Cell = getCell(1, 4, true);
			$Cell = getRowAction(1, true, assert);
			that.testAriaLabels($Cell, 1, assert, {
				firstTime: false,
				rowChange: false,
				colChange: true,
				focus: true,
				group: true,
				expanded: true
			});

			TableQUnitUtils.setFocusOutsideOfTable(assert);
			setTimeout(function() {
				that.testAriaLabels($Cell, 2, assert);
				done();
			}, 100);
		});
	});

	QUnit.test("aria-labelledby with Focus (Sum Row)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		fakeSumRow(1).then(function() {
			for (var i = 0; i < 2; i++) {
				$Cell = getRowAction(i, true, assert);
				that.testAriaLabels($Cell, i, assert, {
					firstTime: i == 0,
					rowChange: true,
					colChange: i < 2,
					focus: true,
					sum: i == 1
				});
			}

			TableQUnitUtils.setFocusOutsideOfTable(assert);
			setTimeout(function() {
				that.testAriaLabels($Cell, 2, assert);
				done();
			}, 100);
		});
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowAction(i, false, assert);
			this.testAriaLabels($Cell, i, assert, {rowChange: true, colChange: i < 2});
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA Attributes", function(assert) {
		var $Elem;

		$Elem = oTable.$("rowact0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowact1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.test("Group Header Row (TreeTable)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();

		$Cell = getRowAction(1, true, assert, oTreeTable);
		this.testAriaLabels($Cell, 1, assert, {group: true, focus: true, firstTime: true, rowChange: true, colChange: true, table: oTreeTable});

		oTreeTable.setSelectionMode(SelectionMode.Row);
		oCore.applyChanges();
		assert.ok(!$Cell[0].hasAttribute("title"), "Group row data cells have no title");
		assert.equal(jQuery(document.getElementById(oTreeTable.getRows()[1].getId() + "-rowselecttext")).text(), "",
			"Group row data cells don't have row selector text");

		oTreeTable.expand(1);
		oTreeTable.attachEventOnce("rowsUpdated", function() {
			setTimeout(function() {
				that.testAriaLabels($Cell, 1, assert, {group: true, focus: true, rowChange: true, colChange: true, expanded: true, table: oTreeTable});
				done();
			}, 100);
		});
	});

	QUnit.module("SelectAll", {
		beforeEach: function() {
			createTables();
			_modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var done = assert.async();
		var sTableId = oTable.getId();
		var $Cell = getSelectAll(true, assert);

		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			sTableId + "-ariacount " + sTableId + "-ariaselection " + sTableId + "-colnumberofcols", "aria-labelledby of select all");

		$Cell = getCell(1, 1, true, assert); //set focus somewhere else on the table
		testAriaLabelsForFocusedDataCell($Cell, 1, 1, assert, {firstTime: false, rowChange: true, colChange: true});

		$Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(), sTableId + "-colnumberofcols",
			"aria-labelledby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (Single Selection)", function(assert) {
		oTable.setSelectionMode(SelectionMode.Single);
		oCore.applyChanges();

		var sTableId = oTable.getId();
		var $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			sTableId + "-ariacount " + sTableId + "-ariaselection " + sTableId + "-colnumberofcols", "aria-labelledby of select all");
		getRowHeader(0, true, assert); //set focus somewhere else on the table
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			"", "aria-labelledby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();
		var $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		var $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA Attributes SelectAll", function(assert) {
		var $Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("role"), "checkbox", "role");
		assert.strictEqual($Elem.attr("aria-checked"), "false", "aria-checked");
		oTable.selectAll();
		$Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("aria-checked"), "true", "aria-checked");
		oTable.setSelectionMode(SelectionMode.Single);
		oCore.applyChanges();
		assert.strictEqual($Elem.attr("role"), undefined, "role");
		assert.strictEqual($Elem.attr("aria-checked"), undefined, "aria-checked");
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
			_modifyTables();
			oTable.addExtension(new TestControl({text: "Extension"}));
			oTable.setFooter(new TestControl({text: "Footer"}));
			oCore.applyChanges();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("ARIA Labels of Column Template", function(assert) {
		var aColumns = oTable._getVisibleColumns();
		var aCells = oTable.getRows()[0].getCells();
		for (var i = 0; i < aCells.length; i++) {
			assert.strictEqual(aCells[i].getAriaLabelledBy()[0], aColumns[i].getId(), "ArialabelledBy to column header for cell in column " + i);
		}
	});

	QUnit.test("ARIA Attributes of Tree Table Expand Icon", function(assert) {
		var done = assert.async();
		var $Elem;

		oTreeTable.attachEventOnce("rowsUpdated", function() {
			$Elem = oTreeTable.$("rows-row0-col0").find(".sapUiTableTreeIcon");
			assert.strictEqual($Elem.attr("role"), "button", "Expanded Tree icon role of expandable row");
			assert.strictEqual($Elem.attr("aria-expanded"), "true", "Expanded Tree icon aria-expanded property");
			assert.strictEqual($Elem.attr("aria-hidden"), "false", "Expanded Tree icon aria-hidden property");
			assert.strictEqual($Elem.attr("title"), TableUtils.getResourceBundle().getText("TBL_COLLAPSE_EXPAND"), "Expanded Tree icon title property");

			$Elem = oTreeTable.$("rows-row1-col0").find(".sapUiTableTreeIcon");
			assert.strictEqual($Elem.attr("role"), "", "Tree icon role of leaf row");
			assert.strictEqual($Elem.attr("aria-hidden"), "true", "Leaf Tree icon aria-hidden property");

			done();
		});

		$Elem = oTreeTable.$("rows-row0-col0").find(".sapUiTableTreeIcon");
		assert.strictEqual($Elem.attr("role"), "button", "Collapsed Tree icon role of expandable row");
		assert.strictEqual($Elem.attr("aria-expanded"), "false", "Collapsed Tree icon aria-expanded property");
		assert.strictEqual($Elem.attr("aria-hidden"), "false", "Collapsed Tree icon aria-hidden property");
		assert.strictEqual($Elem.attr("title"), TableUtils.getResourceBundle().getText("TBL_COLLAPSE_EXPAND"), "Collapsed Tree icon title property");

		oTreeTable.expand(0);
		oCore.applyChanges();
	});

	/**
	 * @deprecated As of version 1.38
	 */
	QUnit.test("ARIA Attributes of Table Header", function(assert) {
		var $Elem = oTable.$().find(".sapUiTableHdr");
		assert.strictEqual($Elem.attr("role"), "heading", "role");
		assert.strictEqual($Elem.attr("aria-level"), "2", "aria-level");
	});

	QUnit.test("ARIA Attributes of Table Elements", function(assert) {
		var $Elem = oTable.$().find("table");
		$Elem.each(function() {
			assert.strictEqual(jQuery(this).attr("role"), "presentation", "role");
		});
	});

	QUnit.test("ARIA Attributes of Content Element", function(assert) {
		var $Elem = oTable.$("sapUiTableGridCnt");
		var done = assert.async();

		assert.strictEqual($Elem.attr("role"), "grid", "role");
		assert.strictEqual($Elem.attr("aria-rowcount"), "9", "aria-rowcount");
		assert.strictEqual($Elem.attr("aria-colcount"), "6", "aria-colcount");
		assert.strictEqual($Elem.attr("aria-multiselectable"), "true", "aria-multiselectable");
		assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getAriaLabelledBy() + " " + oTable.getTitle().getId(), "aria-labelledby");

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.strictEqual($Elem.attr("aria-rowcount"), "4", "aria-rowcount after filter is applied");

			oTable.setRowActionTemplate(new RowAction());
			oTable.setRowActionCount(1);
			oCore.applyChanges();

			assert.strictEqual($Elem.attr("aria-colcount"), "7", "aria-colcount");
			oTable.removeAriaLabelledBy(oTable.getAriaLabelledBy()[0]);
			oCore.applyChanges();
			assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getTitle().getId(), "aria-labelledby when ariaLabelledBy association is empty array");
			done();
		});

		var oBinding = oTable.getBinding();
		var oFilter = new Filter("A", FilterOperator.EQ, "A1");
		oBinding.filter(oFilter);
	});

	QUnit.test("ARIA Attributes of Content Element (TreeTable)", function(assert) {
		var $Elem = oTreeTable.$("sapUiTableGridCnt");
		var done = assert.async();

		assert.strictEqual($Elem.attr("role"), "treegrid", "role");
		assert.strictEqual($Elem.attr("aria-rowcount"), "9", "aria-rowcount");
		assert.strictEqual($Elem.attr("aria-colcount"), "6", "aria-colcount");
		assert.ok(!$Elem.attr("aria-multiselectable"), "aria-multiselectable");
		assert.strictEqual($Elem.attr("aria-labelledby"), oTreeTable.getAriaLabelledBy() + " " + oTreeTable.getTitle().getId(), "aria-labelledby");

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.strictEqual($Elem.attr("aria-rowcount"), "4", "aria-rowcount after filter is applied");

			oTreeTable.setRowActionTemplate(new RowAction());
			oTreeTable.setRowActionCount(1);
			oCore.applyChanges();

			assert.strictEqual($Elem.attr("aria-colcount"), "7", "aria-colcount");
			oTreeTable.removeAriaLabelledBy(oTreeTable.getAriaLabelledBy()[0]);
			oCore.applyChanges();
			assert.strictEqual($Elem.attr("aria-labelledby"), oTreeTable.getTitle().getId(), "aria-labelledby when ariaLabelledBy association is empty array");

			var oAnalyticalTable = new AnalyticalTable();
			oAnalyticalTable.placeAt("qunit-fixture");
			oCore.applyChanges();
			$Elem = oAnalyticalTable.$("sapUiTableGridCnt");
			assert.strictEqual($Elem.attr("aria-roledescription"), TableUtils.getResourceText("TBL_ANALYTICAL_TABLE_ROLE_DESCRIPTION"),
				"aria-roledescription");
			oAnalyticalTable.destroy();
			oAnalyticalTable = null;
			done();
		});

		var oBinding = oTreeTable.getBinding();
		var oFilter = new Filter("A", FilterOperator.EQ, "A1");
		oBinding.filter(oFilter);
	});

	QUnit.test("ARIA Attributes of TH Elements", function(assert) {
		var oDomRef = oTable.getDomRef("tableCCnt");

		var aThs = oDomRef.querySelectorAll("th[id]");
		for (var i = 0; i < aThs.length; i++) {
			assert.strictEqual(aThs[i].getAttribute("scope"), "col", "scope");
			assert.strictEqual(aThs[i].getAttribute("role"), "presentation", "role");
			assert.strictEqual(aThs[i].getAttribute("aria-hidden"), "true", "aria-hidden");
		}

		// dummy column
		assert.strictEqual(oDomRef.querySelector("th:not([id])").getAttribute("role"), "presentation", "role");
	});

	QUnit.test("ARIA Attributes of TR Elements", function(assert) {
		initRowActions(oTable, 1, 1);
		oCore.applyChanges();

		var sTableId = oTable.getId();
		var $Elem = getCell(0, 0, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		assert.strictEqual($Elem.attr("aria-owns"), undefined, "aria-owns");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = getCell(0, 1, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		assert.strictEqual($Elem.attr("aria-owns"), sTableId + "-rowsel0 " + sTableId + "-rows-row0-col0 " + sTableId + "-rowact0", "aria-owns");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = getCell(1, 0, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		assert.strictEqual($Elem.attr("aria-owns"), undefined, "aria-owns");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		$Elem = getCell(1, 1, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		assert.strictEqual($Elem.attr("aria-owns"), sTableId + "-rowsel1 " + sTableId + "-rows-row1-col0 " + sTableId + "-rowact1", "aria-owns");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.test("ARIA Role of Dummy Elements", function(assert) {
		var $Elem = oTable.$("focusDummy");
		assert.strictEqual($Elem.attr("role"), "none", "role");
		$Elem = oTable.$().find(".sapUiTableCtrlBefore").first();
		assert.strictEqual($Elem.attr("role"), "none", "role");
		$Elem = oTable.$().find(".sapUiTableCtrlAfter").first();
		assert.strictEqual($Elem.attr("role"), "none", "role");
	});

	QUnit.test("ARIA rowindices", function(assert) {
		var done = assert.async();
		var iNumberOfRows = oTable.getRows().length;
		var $Elem, i;

		function onAfterRowsUpdated() {
			for (i = 0; i < iNumberOfRows; i++) {
				$Elem = getCell(i, 0, false, assert).parent();
				assert.strictEqual($Elem.attr("aria-rowindex"),
					"" + (oTable.getFirstVisibleRow() + i + 2), "row " + i + ": aria-rowindex of the tr element");
				$Elem = oTable.$("rowsel" + i).parent();
				assert.notOk($Elem.attr("aria-rowindex"), "no aria-rowindex on the row header");
				$Elem = oTable.$("rowact" + i).parent();
				assert.notOk($Elem.attr("aria-rowindex"), "no aria-rowindex of the row action");
			}
			done();
		}
		oTable.attachEventOnce("rowsUpdated", onAfterRowsUpdated);
		oTable.setFirstVisibleRow(3);
	});

	QUnit.test("Row index and count", function(assert) {
		var oAriaCount = oTable.getDomRef("ariacount");
		var oNumberOfRows = oTable.getDomRef("rownumberofrows");
		var oNumberOfColumns = oTable.getDomRef("colnumberofcols");

		getCell(0, 0, true);
		assert.equal(oAriaCount.textContent, TableUtils.getResourceText("TBL_DATA_ROWS_COLS", [9, 6]),
			"Data cell in row 1 column 1: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [2, 9]),
			"Data cell in row 1 column 1: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [2, 6]),
			"Data cell in row 1 column 1: colnumberofcols");

		getCell(1, 1, true);
		assert.equal(oAriaCount.textContent.trim(), "", "Data cell in row 2 column 2: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [3, 9]),
			"Data cell in row 2 column 2: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [3, 6]),
			"Data cell in row 2 column 2: colnumberofcols");

		getColumnHeader(0, true);
		assert.equal(oAriaCount.textContent.trim(), "", "1st Column header cell: ariacount");
		assert.equal(oNumberOfRows.textContent.trim(), "", "1st Column header cell: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [2, 6]),
			"1st Column header cell: colnumberofcols");

		sinon.stub(oTable, "_getTotalRowCount").returns(1);
		oTable.getRowMode().setRowCount(1);
		oTable._bVariableRowHeightEnabled = true;
		oCore.applyChanges();

		getCell(0, 0, true);
		assert.equal(oAriaCount.textContent.trim(), "", "Data cell in row 1 column 1: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [2, 2]),
			"Data cell in row 1 column 1: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent.trim(), "", "Data cell in row 1 column 1: colnumberofcols");
	});

	QUnit.test("ARIA colindices", function(assert) {
		var iNumberOfColumns = oTable._getVisibleColumns().length;
		var $Elem, i;

		oTable.setRowActionTemplate(new RowAction());
		oTable.setRowActionCount(1);
		oCore.applyChanges();

		for (i = 0; i < iNumberOfColumns; i++) {
			$Elem = getColumnHeader(i, false);
			assert.strictEqual($Elem.attr("aria-colindex"),
				"" + (i + 2), "column " + i + ": aria-colindex of the column header");
			$Elem = getCell(0, i, false);
			assert.strictEqual($Elem.attr("aria-colindex"),
				"" + (i + 2), "column " + i + ": aria-colindex of the cell");
		}
		$Elem = oTable.$("rowact0");
		assert.strictEqual($Elem.attr("aria-colindex"),
			"" + (iNumberOfColumns + 2), "column " + i + ": aria-colindex of the row action");
	});

	QUnit.test("ARIA current", function(assert) {
		var done = assert.async();
		var iNumberOfRows = oTable.getRows().length;
		var $Elem, i;

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: {
				path: "",
				formatter: function() {
					var oRow = this._getRow();

					if (oRow != null) {
						var iIndex = oRow.getIndex();

						if (iIndex === 1) {
							return true;
						}
					}
				}
			}
		}));
		oCore.applyChanges();

		function checkAriaCurrent(iCurrentRow) {
			for (i = 0; i < iNumberOfRows; i++) {
				$Elem = getCell(i, 0, false, assert).parent();
				assert.strictEqual($Elem.attr("aria-current"), (i === iCurrentRow ? "true" : undefined),
					"row " + i + ": aria-current of the tr element");
				$Elem = oTable.$("rowsel" + i).parent();
			}
		}

		checkAriaCurrent(1);

		function onAfterRowsUpdated() {
			checkAriaCurrent(0);
			done();
		}
		oTable.attachEventOnce("rowsUpdated", onAfterRowsUpdated);
		oTable.setFirstVisibleRow(1);
	});

	QUnit.test("ARIA for Overlay", function(assert) {
		var $OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		var sTableId = oTable.getId();

		//Heading + Extension + Footer + 2xTable + Row Selector + 2xColumn Headers + NoData Container = 8
		assert.strictEqual($OverlayCoveredElements.length, 9, "Number of potentionally covered elements");
		$OverlayCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});
		oTable.setShowOverlay(true);
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
		});
		var $Elem = jQuery(document.getElementById(sTableId + "-overlay"));
		assert.strictEqual($Elem.attr("aria-labelledby"),
			oTable.getAriaLabelledBy() + " " + oTable.getTitle().getId() + " " + sTableId + "-ariainvalid", "aria-labelledby");
		oTable.invalidate();
		oCore.applyChanges();
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
		});
		oTable.setShowOverlay(false);
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});

		oTable.removeAriaLabelledBy(oTable.getAriaLabelledBy()[0]);
		oCore.applyChanges();
		$Elem = jQuery(document.getElementById(sTableId + "-overlay"));
		assert.strictEqual($Elem.attr("aria-labelledby"),
			oTable.getTitle().getId() + " " + sTableId + "-ariainvalid", "aria-labelledby when ariaLabelledBy association is empty array");
	});

	QUnit.test("ARIA for NoData", function(assert) {
		var done = assert.async();
		var $NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");

		// 2xTable + Row Selector = 3
		assert.strictEqual($NoDataCoveredElements.length, 3, "Number of potentially covered elements");
		$NoDataCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});

		function onNewModelApplied() {
			oTable.detachRowsUpdated(onNewModelApplied);
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});
			oTable.invalidate();
			oCore.applyChanges();
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});

			var $Elem = oTable.$("noDataCnt");
			assert.equal($Elem.attr("aria-labelledby"), oTable.getId() + "-noDataMsg");

			oTable.setNoData(new Control({id: "_noDataControl"}));
			oCore.applyChanges();
			assert.strictEqual($Elem.attr("aria-labelledby"), "_noDataControl");

			oTable.setNoData(new IllustratedMessage({
				illustrationType: "NoSearchResults",
				title: "No Items found",
				description: "Adjust your filter settings."
			}));

			oCore.applyChanges();
			assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getDomRef("noDataCnt").querySelector("figcaption>div").getAttribute("id") +
				" " + oTable.getDomRef("noDataCnt").querySelector("figcaption>span").getAttribute("id"));

			oTable.setShowNoData(false);
			oCore.applyChanges();
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
			});
			done();
		}

		oTable.attachRowsUpdated(onNewModelApplied);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("HiddenTexts", function(assert) {
		var aHiddenTexts = [
			"ariacount", "toggleedit", "ariarowgrouplabel", "ariagrandtotallabel",
			"ariagrouptotallabel", "rownumberofrows", "colnumberofcols", "cellacc", "ariacolmenu",
			"ariacolspan", "ariacolfiltered", "ariacolsortedasc", "ariacolsorteddes", "ariafixedcolumn", "ariainvalid", "ariaselection",
			"ariashowcolmenu", "ariahidecolmenu", "rowexpandtext", "rowcollapsetext", "rownavigatedtext", "ariarequired"
		];
		var $Elem = oTable.$().find(".sapUiTableHiddenTexts");
		assert.strictEqual($Elem.length, 1, "Hidden Text Area available");
		$Elem = $Elem.children();
		assert.strictEqual($Elem.length, aHiddenTexts.length, "Number of hidden Texts");
		for (var i = 0; i < aHiddenTexts.length; i++) {
			assert.ok(oTable.getDomRef(aHiddenTexts[i]) != null, "Hidden Text " + aHiddenTexts[i] + " available");
		}
		$Elem.each(function() {
			var $T = jQuery(this);
			var sId = $T.attr("id");
			assert.strictEqual($T.attr("aria-hidden"), "true", "aria-hidden " + sId);
			assert.ok($T.hasClass("sapUiInvisibleText"), "sapUiInvisibleText " + sId);
		});
	});

	QUnit.test("HiddenText cellacc", function(assert) {
		var oCol1 = oTable.getColumns()[0];
		var $Cell = getCell(1, 1, true, null, oTable);

		assert.ok((oTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"Table: HiddenText cellacc is properly set");

		oTable.setFixedColumnCount(0);
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oCol1);
		oCore.applyChanges();

		$Cell = getCell(1, 1, true, null, oTable);
		assert.ok((oTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"Table: HiddenText cellacc is properly set after the first column is grouped");

		oCol1 = oTreeTable.getColumns()[0];
		$Cell = getCell(1, 1, true, null, oTreeTable);

		assert.ok((oTreeTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"TreeTable: HiddenText cellacc is properly set");

		oTreeTable.setFixedColumnCount(0);
		oTreeTable.setEnableGrouping(true);
		oTreeTable.setGroupBy(oCol1);
		oCore.applyChanges();

		$Cell = getCell(1, 1, true, null, oTreeTable);
		assert.ok((oTreeTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"TreeTable: HiddenText cellacc is properly set after the first column is grouped");
	});

	QUnit.test("Highlight texts", function(assert) {
		oTable.getRowMode().setRowCount(1);
		oCore.applyChanges();

		var aVisibleHighlights = [
			coreLibrary.MessageType.Success,
			coreLibrary.MessageType.Warning,
			coreLibrary.MessageType.Error,
			coreLibrary.MessageType.Information
		].concat(Object.getOwnPropertyNames(coreLibrary.IndicationColor));

		var aInvisibleHighlights = [
			coreLibrary.MessageType.None,
			null
		];

		var i;
		var sHighlight;
		var sHighlightText;
		var sCustomHighlightText = "Custom highlight text";

		function assertHighlightTexts(bTextExists, sText) {
			var oRow = oTable.getRows()[0];
			var oHighlightTextElement = oRow.getDomRef("highlighttext");

			assert.strictEqual(oHighlightTextElement != null, bTextExists,
				"The highlight text element " + (bTextExists ? "exists in the DOM" : "does not exist in the DOM"));

			if (oHighlightTextElement != null) {
				assert.strictEqual(oHighlightTextElement.innerHTML, sText, "The highlight text is correct: \"" + sText + "\"");
			}
		}

		oTable.setRowSettingsTemplate(null);
		oCore.applyChanges();

		assertHighlightTexts(false);

		// Default texts
		for (i = 0; i < aVisibleHighlights.length; i++) {
			sHighlight = aVisibleHighlights[i];
			sHighlightText = "";

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			oCore.applyChanges();

			if (sHighlight in coreLibrary.MessageType) {
				sHighlightText = TableUtils.getResourceBundle().getText("TBL_ROW_STATE_" + sHighlight.toUpperCase());
			}

			assertHighlightTexts(true, sHighlightText);
		}

		// Custom texts
		for (i = 0; i < aVisibleHighlights.length; i++) {
			sHighlight = aVisibleHighlights[i];

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight,
				highlightText: sCustomHighlightText
			}));
			oCore.applyChanges();

			assertHighlightTexts(true, sCustomHighlightText);
		}

		for (i = 0; i < aInvisibleHighlights.length; i++) {
			sHighlight = aInvisibleHighlights[i];

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			oCore.applyChanges();

			assertHighlightTexts(false);
		}
	});

	QUnit.test("Scrolling", function(assert) {
		var done = assert.async();
		var $Cell = getCell(2, 0, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 2, 0, assert, {firstTime: true});

		var bFocusTriggered = false;
		var iDelay = 150;

		var oDelegate = {
			onfocusin: function(oEvent) {
				assert.ok(oEvent.target === $Cell.get(0), "Refocus of cell done to trigger screenreader refresh");
				bFocusTriggered = true;
			}
		};

		assert.ok((oTable.$("cellacc").html() || "").indexOf("A3") >= 0, "Acc Text before scrolling");
		oTable.addEventDelegate(oDelegate);
		oTable.setFirstVisibleRow(1); // Simulate scrolling by one row
		assert.ok(!bFocusTriggered, "No sync refocus of cell done");

		setTimeout(function() {
			oTable.removeEventDelegate(oDelegate);
			assert.ok(!bFocusTriggered, "No Refocus of cell done after " + (iDelay + 10) + " ms");
			testAriaLabelsForFocusedDataCell($Cell, 2, 0, assert, {rowChange: true});
			assert.ok(!$Cell.attr("aria-busy"), "Cell is not in busy mode anymore");
			assert.ok(!$Cell.attr("aria-hidden"), "Cell is not hidden anymore");
			assert.ok((oTable.$("cellacc").html() || "").indexOf("A4") >= 0, "Acc Text after scrolling");
			TableQUnitUtils.setFocusOutsideOfTable(assert);
			oTable.setFirstVisibleRow(0);
			setTimeout(function() {
				testAriaLabelsForNonFocusedDataCell($Cell, 2, 0, assert);
				done();
			}, 100);
		}, iDelay + 50);
	});

	QUnit.test("_debug()", function(assert) {
		var oExtension = oTable._getAccExtension();
		assert.ok(!oExtension._ExtensionHelper, "No debug mode");
		oExtension._debug();
		assert.ok(!!oExtension._ExtensionHelper, "Debug mode");
	});

	QUnit.test("ExtensionHelper.getColumnIndexOfFocusedCell", function(assert) {
		var oExtension = oTable._getAccExtension();
		oExtension._debug();
		oTable.getColumns()[1].setVisible(false);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		getCell(0, 0, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), 0, "DATACELL 0");

		getCell(0, 2, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), 2, "DATACELL 2");

		getRowHeader(0, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), -1, "ROWHEADER");

		getRowAction(0, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), oTable._getVisibleColumns().length, "ROWHEADER");

		getColumnHeader(0, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), 0, "COLUMNHEADER 0");

		getColumnHeader(2, true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), 2, "COLUMNHEADER 2");

		getSelectAll(true);
		assert.strictEqual(oExtension._ExtensionHelper.getColumnIndexOfFocusedCell(oExtension), -1, "COLUMNROWHEADER");
	});

	QUnit.test("ExtensionHelper.getRelevantColumnHeaders", function(assert) {
		var oExtension = oTable._getAccExtension();
		oExtension._debug();
		var oHelper = oExtension._ExtensionHelper;

		oTable.setFixedColumnCount(0);
		oTable.getColumns()[0].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[2].addMultiLabel(new TestControl());
		oTable.getColumns()[2].addMultiLabel(new TestControl());
		oTable.getColumns()[2].addMultiLabel(new TestControl());
		oTable.getColumns()[3].addMultiLabel(new TestControl());
		oTable.getColumns()[3].addMultiLabel(new TestControl());
		oTable.getColumns()[1].setHeaderSpan([3, 2, 1]);
		oCore.applyChanges();

		function checkColumnHeaders(tbl, col, aExpectedHeaders) {
			var aHeaders = oHelper.getRelevantColumnHeaders(tbl, col);
			var sId = tbl && col ? col.getId() : "";
			assert.equal(aHeaders.length, aExpectedHeaders.length, sId + ": Number of relevant headers");
			for (var i = 0; i < aExpectedHeaders.length; i++) {
				assert.equal(aHeaders[i], aExpectedHeaders[i], sId + ": Header " + i + " == " + aHeaders[i]);
			}
		}

		var oCol = oTable.getColumns()[0];
		checkColumnHeaders(null, oCol, []);
		checkColumnHeaders(oTable, null, []);
		checkColumnHeaders(oTable, oCol, [oCol.getId(), oCol.getId() + "_1", oCol.getId() + "_2"]);

		oCol = oTable.getColumns()[1];
		checkColumnHeaders(oTable, oCol, [oCol.getId(), oCol.getId() + "_1", oCol.getId() + "_2"]);

		oCol = oTable.getColumns()[2];
		checkColumnHeaders(oTable, oCol, [oTable.getColumns()[1].getId(), oTable.getColumns()[1].getId() + "_1", oCol.getId() + "_2"]);

		oCol = oTable.getColumns()[3];
		checkColumnHeaders(oTable, oCol, [oTable.getColumns()[1].getId(), oCol.getId() + "_1", oCol.getId() + "_2"]);

		oCol = oTable.getColumns()[4];
		checkColumnHeaders(oTable, oCol, [oCol.getId(), oCol.getId() + "_1", oCol.getId() + "_2"]);

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();
		oCol = oTable.getColumns()[0];
		checkColumnHeaders(oTable, oCol, []);
	});

	QUnit.test("Hidden Standard Tooltips", function(assert) {

		function checkTooltips(bEnable, sSelectionBehavior, sSelectionMode, iExpected) {
			oTable._setHideStandardTooltips(!bEnable);
			oTable.setSelectionBehavior(sSelectionBehavior);
			oTable.setSelectionMode(sSelectionMode);
			oCore.applyChanges();
			assert.equal(oTable.$().find("[title]").length, iExpected,
				"Tooltip enabled:" + bEnable + ", " + sSelectionBehavior + ", " + sSelectionMode);
		}

		var aColumns = oTable.getColumns();
		for (var i = 0; i < aColumns.length; i++) {
			aColumns[i].setTooltip(null);
		}
		initRowActions(oTable, 1, 1);
		oCore.applyChanges();

		var iRows = oTable.getRows().length;
		var iRowElements = iRows * 4; // Row areas: header, fixed, scrollable, action
		var iRowSelectors = iRows;
		var iActionItems = iRows; // The icons have tooltips.

		checkTooltips(true, "Row", "MultiToggle", 1 /*SelAll*/ + iRowElements + iRowSelectors + iActionItems);
		checkTooltips(true, "Row", "Single", iRowElements + iRowSelectors + iActionItems);
		checkTooltips(true, "Row", "None", iActionItems);
		checkTooltips(true, "RowOnly", "MultiToggle", 1 /*SelAll*/ + iRowElements + iActionItems);
		checkTooltips(true, "RowOnly", "Single", iRowElements + iActionItems);
		checkTooltips(true, "RowOnly", "None", iActionItems);
		checkTooltips(true, "RowSelector", "MultiToggle", 1 /*SelAll*/ + iRowSelectors + iActionItems);
		checkTooltips(true, "RowSelector", "Single", iRowSelectors + iActionItems);
		checkTooltips(true, "RowSelector", "None", iActionItems);

		checkTooltips(false, "Row", "MultiToggle", 1 /*SelAll*/ + iActionItems);
		checkTooltips(false, "Row", "Single", iActionItems);
		checkTooltips(false, "Row", "None", iActionItems);
		checkTooltips(false, "RowOnly", "MultiToggle", 1 /*SelAll*/ + iActionItems);
		checkTooltips(false, "RowOnly", "Single", iActionItems);
		checkTooltips(false, "RowOnly", "None", iActionItems);
		checkTooltips(false, "RowSelector", "MultiToggle", 1 /*SelAll*/ + iActionItems);
		checkTooltips(false, "RowSelector", "Single", iActionItems);
		checkTooltips(false, "RowSelector", "None", iActionItems);
	});

	QUnit.module("No Acc Mode", {
		beforeEach: function() {
			createTables();
			_modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("No Acc Mode", function(assert) {
		oTable._getAccExtension()._accMode = false;
		var oConfigStub = sinon.stub(ControlBehavior, "isAccessibilityEnabled");
		oConfigStub.returns(false);
		oTable.findElements(true, function(oElement) {
			oElement.invalidate();
		});
		oCore.applyChanges();

		var sHtml = oTable.$().html();
		assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM");

		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			getCell(0, i, true, assert);
			assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM on focus of cell [0, " + i + "]");
		}
		for (i = 0; i < oTable.columnCount; i++) {
			getCell(1, i, true, assert);
			assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM on focus of cell [1, " + i + "]");
		}

		assert.strictEqual(oTable.$().find(".sapUiTableHiddenTexts").length, 0, "No Hidden Texts");

		oConfigStub.restore();
	});

	QUnit.module("Destruction", {
		beforeEach: function() {
			createTables();
		}
	});

	QUnit.test("destroy()", function(assert) {
		var oExtension = oTable._getAccExtension();
		oTable.destroy();
		oTreeTable.destroy();
		assert.ok(!oExtension._table, "Table cleared");
	});
});