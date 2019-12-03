/*global QUnit, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/base/ManagedObject",
	"sap/ui/table/RowSettings",
	"sap/ui/table/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/core/library"
], function(TableQUnitUtils, qutils, TableUtils, ManagedObject, RowSettings, Library, JSONModel, Device, coreLibrary) {
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
	var setFocusOutsideOfTable = window.setFocusOutsideOfTable;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	//************************************************************************
	// Preparation Code
	//************************************************************************

	var TextControl = ManagedObject.extend("sap.ui.table.test.TextControl", {
		metadata: {
			properties: {
				text: {
					type: "String"
				}
			}
		},
		getAccessibilityInfo: function() {
			return {
				description: this.getText()
			};
		}
	});

	var TestControl = TableQUnitUtils.getTestControl();
	var TestInputControl = TableQUnitUtils.getTestInputControl();

	TestControl.prototype.getAccessibilityInfo = function() {
		var iMode = this.getIndex();
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
			TableQUnitUtils.addColumn(_oTable, "B Label", "B");
			TableQUnitUtils.addColumn(_oTable, "C Label", "C", true).setTooltip("tooltip");
			TableQUnitUtils.addColumn(_oTable, "D Label", "D", false, true, true).getTemplate().setVisible(false);
			TableQUnitUtils.addColumn(_oTable, "E Label", "E", false, true, true);

			var oColumn = _oTable.getColumns()[1];
			oColumn.setSortProperty("SomeSortProperty");
			oColumn.setFilterProperty("SomeFilterProperty");
			oColumn.setSortOrder("Ascending");
			oColumn.setSorted(true);
			oColumn.setFiltered(true);

			_oTable.setRowSettingsTemplate(new RowSettings({
				highlight: "Success",
				navigated: true
			}));
		});

		oTreeTable.setFixedColumnCount(1);
		oTreeTable.setSelectedIndex(0);

		sap.ui.getCore().applyChanges();
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
		var bGroup = !!mParams.group;
		var bSum = !!mParams.sum;

		var aLabels = [];
		if (bFirstTime) {
			aLabels.push("ARIALABELLEDBY");
			aLabels.push(oTable.getId() + "-ariadesc");
			aLabels.push(oTable.getId() + "-ariacount");
			aLabels.push(oTable.getId() + "-ariaselection");
		}

		aLabels.push(oTable.getId() + "-rownumberofrows");
		aLabels.push(oTable.getId() + "-colnumberofcols");

		var oColumn = oTable._getVisibleColumns()[iCol];
		var oRow = oTable.getRows()[iRow];
		var oCell = oRow.getCells()[iCol];
		var iIndex = oCell.getIndex();

		if (bGroup) {
			aLabels.push(oTable.getId() + "-ariarowgrouplabel");
			aLabels.push(oTable.getId() + "-rows-row" + iRow + "-groupHeader");
		}

		if (bSum) {
			aLabels.push(oTable.getId() + "-ariagrouptotallabel");
			aLabels.push(oTable.getId() + "-rows-row" + iRow + "-groupHeader");
		}

		if (!bGroup && !bSum) {
			aLabels.push(oTable.getId() + "-rows-row" + iRow + "-highlighttext");
		}

		aLabels.push(oColumn.getId() + "-inner");

		if (iIndex == 0) {
			aLabels.push(oTable.getId() + "-ariafixedcolumn");
		}

		if (!bGroup) {
			if (iIndex === 4) {
				aLabels.push(oCell.getId());
			} else {
				aLabels.push(oTable.getId() + "-cellacc");
			}
		}

		if (oTable.isIndexSelected(iRow) && TableUtils.Grouping.isTreeMode(oTable)) {
			aLabels.push(oTable.getId() + "-ariarowselected");
		}

		if (bFirstTime || bRowChange) {
			aLabels.push(oTable.getId() + "-rownavigatedtext");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of cell [" + iRow + ", " + iCol + "]"
		);

		assert.strictEqual(
			($Cell.attr("headers") || "").trim(),
			oColumn.getId(),
			"headers attribute of cell [" + iRow + ", " + iCol + "]"
		);

		var sText = jQuery.sap.byId(oTable.getId() + "-rownumberofrows").text().trim();
		if (bFirstTime || bRowChange) {
			assert.ok(sText.length > 0, "Number of rows are set on row change: " + sText);
		} else {
			assert.ok(sText.length == 0, "Number of rows are not set when row not changed: " + sText);
		}
		sText = jQuery.sap.byId(oTable.getId() + "-colnumberofcols").text().trim();
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
		var iIndex = oCell.getIndex();

		aLabels.push(oColumn.getId() + "-inner");
		if (iIndex == 0) {
			aLabels.push(oTable.getId() + "-ariafixedcolumn");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of cell [" + iRow + ", " + iCol + "]"
		);

		assert.strictEqual(
			($Cell.attr("headers") || "").trim(),
			oColumn.getId(),
			"headers attribute of cell [" + iRow + ", " + iCol + "]"
		);
	}

	function testACCInfoForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
		var mParams = mParams || {};
		var oRow = oTable.getRows()[iRow];
		var oCell = oRow.getCells()[iCol];
		var iIndex = oCell.getIndex();
		var aExpected = [];

		var sText = jQuery.sap.byId(oTable.getId() + "-cellacc").text().trim();

		if (iIndex < 3) {
			aExpected.push("TYPE_" + oCell.getText());
			aExpected.push("DESCRIPTION_" + oCell.getText());
		}
		if (iIndex == 0) {
			aExpected.push(TableUtils.getResourceBundle().getText("TBL_CTRL_STATE_READONLY"));
		}
		if (iIndex == 2) {
			aExpected.push(TableUtils.getResourceBundle().getText("TBL_CTRL_STATE_DISABLED"));
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
		var iIndex = oCell.getIndex();

		if (!bGroup) {
			if (iIndex === 0 || iIndex === 2 || iIndex === 4) {
				aDescriptions.push(oTable.getId() + "-toggleedit");
			}
		}

		if (oTable instanceof sap.ui.table.TreeTable && iIndex == 0 && $Cell.find(".sapUiTableTreeIcon").not(".sapUiTableTreeIconLeaf").length == 1 || bGroup){
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
		setFocusOutsideOfTable(assert);
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
		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell($Cell, 1, oTreeTable.columnCount - 1, assert, {table: oTreeTable});
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
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
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("ACCInfo", function(assert) {
		var done = assert.async();
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(0, i, true, assert);
			testACCInfoForFocusedDataCell($Cell, 0, i, assert);
		}
		setFocusOutsideOfTable(assert);
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
		setFocusOutsideOfTable(assert);
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
		oTreeTable.attachEventOnce("_rowsUpdated", function() {
			setTimeout(function(){
				$Cell = getCell(0, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 0, 0, assert, {firstTime: true, colChange: true, table: oTreeTable}, true);
				$Cell = getCell(1, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 1, 0, assert, {firstTime: true, colChange: false, table: oTreeTable}, false);
				$Cell = getCell(2, 0, true, assert, oTreeTable);
				testAriaDescriptionsForFocusedDataCell($Cell, 2, 0, assert, {firstTime: true, colChange: true, table: oTreeTable}, true);

				setFocusOutsideOfTable(assert);
				setTimeout(function() {
					assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + (oTable.columnCount - 1) + "]");
					done();
				}, 100);
			}, 100);
		});
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
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
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("Group Header Row", function(assert) {
		var done = assert.async();
		initRowActions(oTable, 1, 1);

		var oRefs = fakeGroupRow(1);

		assert.strictEqual(oRefs.row.attr("aria-expanded"), "true", "aria-expanded set on group row");
		assert.strictEqual(oRefs.row.attr("aria-level"), "2", "aria-level set on group row");
		assert.strictEqual(oRefs.fixed.attr("aria-expanded"), "true", "aria-expanded set on group row (fixed)");
		assert.strictEqual(oRefs.fixed.attr("aria-level"), "2", "aria-level set on group row (fixed)");
		assert.strictEqual(oRefs.act.attr("aria-expanded"), "true", "aria-expanded set on row action");
		assert.strictEqual(oRefs.act.attr("aria-level"), "2", "aria-level set on row action");

		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, false, assert);
			assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell group row");
			testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {group: true});
		}

		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert);
			testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, group: true});
			testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true, group: true}, false);
		}

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell(getCell(1, oTable.columnCount - 1, false, assert), 1, oTable.columnCount - 1, assert);
			oTable.rerender();
			done();
		}, 100);
	});

	QUnit.test("Sum Row", function(assert) {
		var done = assert.async();
		initRowActions(oTable, 1, 1);

		var oRefs = fakeSumRow(1);

		assert.strictEqual(oRefs.row.attr("aria-level"), "2", "aria-level set on group row");
		assert.strictEqual(oRefs.fixed.attr("aria-level"), "2", "aria-level set on group row (fixed)");
		assert.strictEqual(oRefs.act.attr("aria-level"), "2", "aria-level set on row action");

		var $Cell;
		var i;
		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, false, assert);
			assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell sum row");
			testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {sum: true});
		}

		for (i = 0; i < oTable.columnCount; i++) {
			$Cell = getCell(1, i, true, assert);
			testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, sum: true});
			testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {
				firstTime: i == 0,
				colChange: true,
				sum: true
			});
		}

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForNonFocusedDataCell(getCell(1, oTable.columnCount - 1, false, assert), 1, oTable.columnCount - 1, assert);
			oTable.rerender();
			done();
		}, 100);
	});

	QUnit.test("Other ARIA Attributes of Data Cell", function(assert) {
		var $Elem = oTable.$("rows-row0-col0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = oTable.$("rows-row1-col0");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		$Elem = oTreeTable.$("rows-row0-col0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		assert.strictEqual($Elem.parent().attr("aria-level"), "1", "aria-level");
		assert.strictEqual($Elem.parent().attr("aria-expanded"), "false", "aria-expanded");
		$Elem = oTreeTable.$("rows-row0-col1");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		assert.strictEqual($Elem.parent().attr("aria-level"), "1", "aria-level");
		assert.strictEqual($Elem.parent().attr("aria-expanded"), "false", "aria-expanded");
		oTable.rerender();
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

		var aLabels = [];
		if (bFirstTime && bFocus) {
			aLabels.push("ARIALABELLEDBY");
			aLabels.push(oTable.getId() + "-ariadesc");
			aLabels.push(oTable.getId() + "-ariacount");
			aLabels.push(oTable.getId() + "-ariaselection");
		}

		if (bFocus) {
			aLabels.push(oTable.getId() + "-colnumberofcols");
		}

		var oColumn = oTable._getVisibleColumns()[iCol];

		aLabels.push(oColumn.getId() + "-inner");

		if (iCol == 0) {
			aLabels.push(oTable.getId() + "-ariafixedcolumn");
		}

		if (bFocus && iCol == 1) {
			if (Device.browser.msie) {
				aLabels.push(oTable.getId() + "-ariacolsortedasc");
			}
			aLabels.push(oTable.getId() + "-ariacolfiltered");
		}

		if (bFocus && iCol == 2) {
			aLabels.push(oTable.getId() + "-cellacc"); // Column 2 has tooltip see TableQUnitUtils.js
		}

		if (Device.browser.msie && bFocus && iCol == 1) {
			aLabels.push(oTable.getId() + "-ariacolmenu");
		}

		assert.strictEqual(
			($Cell.attr("aria-labelledby") || "").trim(),
			aLabels.join(" "),
			"aria-labelledby of colum header " + iCol
		);

		if (bFocus) {
			var sText = jQuery.sap.byId(oTable.getId() + "-colnumberofcols").text().trim();
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
		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			testAriaLabelsForColumnHeader($Cell, oTable.columnCount - 1, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true});
		}
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, true, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of column header " + i);
		}
		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
		var $Cell;
		for (var i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of column header " + i);
		}
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA Attributes of Column Header", function(assert) {
		var $Elem = oTable.getColumns()[0].$();
		assert.strictEqual($Elem.attr("role"), "columnheader", "role");
		assert.ok(!$Elem.attr("aria-haspopup"), "aria-haspopup");
		assert.ok(!$Elem.attr("aria-sort"), "aria-sort");
		$Elem = oTable.getColumns()[1].$();
		assert.strictEqual($Elem.attr("role"), "columnheader", "role");
		assert.strictEqual($Elem.attr("aria-haspopup"), "true", "aria-haspopup");
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

			var aLabels = [];
			if (bFirstTime && bFocus) {
				aLabels.push("ARIALABELLEDBY");
				aLabels.push(oTable.getId() + "-ariadesc");
				aLabels.push(oTable.getId() + "-ariacount");
				aLabels.push(oTable.getId() + "-ariaselection");
			}

			if (Device.browser.msie) {
				aLabels.push(oTable.getId() + "-ariarowheaderlabel");
			}

			if (bFocus) {
				aLabels.push(oTable.getId() + "-rownumberofrows");
				if (bGroup) {
					aLabels.push(oTable.getId() + "-ariarowgrouplabel");
					aLabels.push(oTable.getId() + (bExpanded ? "-rowcollapsetext" : "-rowexpandtext"));
				} else if (bSum) {
					aLabels.push(oTable.getId() + "-ariagrouptotallabel");
				} else {
					aLabels.push(oTable.getId() + "-rows-row" + iRow + "-rowselecttext");
					aLabels.push(oTable.getId() + "-rows-row" + iRow + "-highlighttext");
				}

				if (bFirstTime || bRowChange) {
					aLabels.push(oTable.getId() + "-rownavigatedtext");
				}
			}

			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim(),
				aLabels.join(" "),
				"aria-labelledby of row header " + iRow
			);

			if (bFocus) {
				var sText = jQuery.sap.byId(oTable.getId() + "-rownumberofrows").text().trim();
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

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);

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

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
		}
	});

	QUnit.test("Group Header Row", function(assert) {
		var that = this;
		var done = assert.async();
		var oRefs = fakeGroupRow(1);
		var $Cell;

		assert.strictEqual(oRefs.hdr.attr("aria-expanded"), "true", "aria-expanded set on group row header");
		assert.strictEqual(oRefs.hdr.attr("aria-level"), "2", "aria-level set on group row header");
		assert.strictEqual(oRefs.hdr.attr("aria-haspopup"), "true", "aria-haspopup set on group row header");

		$Cell = getRowHeader(1, false, assert);
		this.testAriaLabels($Cell, 1, assert, {group: true});
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

		$Cell = getRowHeader(1, true, assert);
		this.testAriaLabels($Cell, 1, assert, {group: true, focus: true, firstTime: true});
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 1, assert);
			done();
		}, 100);
	});

	QUnit.test("Group Header Row (TreeTable)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		$Cell = getRowHeader(0, true, assert, oTreeTable);
		this.testAriaLabels($Cell, 0, assert, {group: true, focus: true, firstTime: true, rowChange: true, colChange: true, table: oTreeTable});

		oTreeTable.expand(0);
		oTreeTable.attachEventOnce("_rowsUpdated", function() {
			setTimeout(function(){
				that.testAriaLabels($Cell, 0, assert, {group: true, focus: true, rowChange: true, expanded: true, table: oTreeTable});
				done();
			}, 100);
		});
	});

	QUnit.test("Sum Row", function(assert) {
		var that = this;
		var done = assert.async();
		var oRefs = fakeSumRow(1);
		var $Cell;

		assert.strictEqual(oRefs.hdr.attr("aria-level"), "2", "aria-level set on sum row header");

		$Cell = getRowHeader(1, false, assert);
		this.testAriaLabels($Cell, 1, assert, {sum: true});
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

		$Cell = getRowHeader(1, true, assert);
		this.testAriaLabels($Cell, 1, assert, {sum: true, focus: true, firstTime: true});
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 1, assert);
			oTable.rerender();
			done();
		}, 100);
	});

	QUnit.test("Other ARIA Attributes", function(assert) {
		var $Elem;

		$Elem = oTable.$("rowsel0");
		assert.strictEqual($Elem.attr("role"), "rowheader", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		oTable.rerender();

		$Elem = oTable.$("rowsel0");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.test("Title", function(assert) {
		var $Cell = getRowHeader(0, true, assert);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("_rowsUpdated", resolve);
		}).then(function() {
			assert.ok($Cell[0].title.toLowerCase().indexOf("deselect") > -1, "The row header has a title saying that clicking deselects the row");

			oTable.setSelectedIndex(0);
			assert.ok($Cell[0].title.toLowerCase().indexOf("select") > -1, "The row header has a title saying that clicking selects the row");

			oTable.setSelectionMode(SelectionMode.None);
			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			assert.ok(!$Cell[0].hasAttribute("title"), "The row header has no title because SelectionMode is \"None\"");

			oTable.setSelectionMode(SelectionMode.MultiToggle);
			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			assert.ok($Cell[0].title.toLowerCase().indexOf("select") > -1, "The row header has a title saying that clicking selects the row");

			oTable.getModel().setData([]);

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			assert.ok(!$Cell[0].hasAttribute("title"), "The row has no title because it is empty");
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
			var bColChange = !!mParams.colChange;
			var bGroup = !!mParams.group;
			var bSum = !!mParams.sum;
			var bExpanded = !!mParams.expanded;
			var oTable = !mParams.table ? window.oTable : mParams.table;

			var aLabels = [];
			if (bFirstTime && bFocus) {
				aLabels.push("ARIALABELLEDBY");
				aLabels.push(oTable.getId() + "-ariadesc");
				aLabels.push(oTable.getId() + "-ariacount");
				aLabels.push(oTable.getId() + "-ariaselection");
			}

			if (bFocus) {
				if (bFirstTime || bRowChange) {
					aLabels.push(oTable.getId() + "-rownumberofrows");
				}
				if (bColChange) {
					aLabels.push(oTable.getId() + "-colnumberofcols");
				}
				aLabels.push(oTable.getId() + "-rowacthdr");
				if (iRow == 0) {
					aLabels.push(oTable.getId() + "-ariarowselected");
				}
				if (!bGroup && !bSum) {
					aLabels.push(oTable.getId() + "-rows-row" + iRow + "-highlighttext");
				}
				if (bGroup) {
					aLabels.push(oTable.getId() + "-ariarowgrouplabel");
					aLabels.push(oTable.getId() + "-rows-row" + iRow + "-groupHeader");
					aLabels.push(oTable.getId() + (bExpanded ? "-rowcollapsetext" : "-rowexpandtext"));
				} else if (bSum) {
					aLabels.push(oTable.getId() + "-ariagrouptotallabel");
					aLabels.push(oTable.getId() + "-rows-row" + iRow + "-groupHeader");
				}
				if (!bGroup) {
					aLabels.push(oTable.getId() + "-cellacc");
				}
				if (bFirstTime || bRowChange) {
					aLabels.push(oTable.getId() + "-rownavigatedtext");
				}
			} else {
				aLabels.push(oTable.getId() + "-rowacthdr");
			}

			assert.strictEqual(
				($Cell.attr("aria-labelledby") || "").trim(),
				aLabels.join(" "),
				"aria-labelledby of row action " + iRow
			);

			if (bFocus) {
				var sText = jQuery.sap.byId(oTable.getId() + "-rownumberofrows").text().trim();
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

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (Group Row)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		fakeGroupRow(1);

		for (var i = 0; i < 2; i++) {
			$Cell = getRowAction(i, true, assert);
			this.testAriaLabels($Cell, i, assert, {
				firstTime: i == 0,
				rowChange: true,
				colChange: i < 2,
				focus: true,
				group: i == 1,
				expanded: false
			});
		}

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (Sum Row)", function(assert) {
		var that = this;
		var done = assert.async();
		var $Cell;

		fakeSumRow(1);

		for (var i = 0; i < 2; i++) {
			$Cell = getRowAction(i, true, assert);
			this.testAriaLabels($Cell, i, assert, {
				firstTime: i == 0,
				rowChange: true,
				colChange: i < 2,
				focus: true,
				sum: i == 1
			});
		}

		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			that.testAriaLabels($Cell, 2, assert);
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);

		for (var i = 0; i < 2; i++) {
			var $Cell = getRowAction(i, false, assert);
			this.testAriaLabels($Cell, i, assert, {rowChange: true, colChange: i < 2});
		}

		setFocusOutsideOfTable(assert);
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
		sap.ui.getCore().applyChanges();

		$Cell = getRowAction(1, true, assert, oTreeTable);
		this.testAriaLabels($Cell, 1, assert, {group: true, focus: true, firstTime: true, rowChange: true, colChange: true, table: oTreeTable});

		oTreeTable.expand(1);
		oTreeTable.attachEventOnce("_rowsUpdated", function() {
			setTimeout(function(){
				that.testAriaLabels($Cell, 1, assert, {group: true, focus: true, rowChange: true, colChange: true, expanded: true, table: oTreeTable});
				done();
			}, 100);
		});
	});

	QUnit.module("SelectAll", {
		beforeEach: function() {
			createTables();
			_modifyTables();
			this._sAdditionalLabeling = oTable._getShowStandardTooltips() ? "" : (" " + oTable.getId() + "-ariaselectall");
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		var done = assert.async();
		var sId = oTable.getId();
		var $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			"ARIALABELLEDBY " + sId + "-ariadesc " + sId + "-ariacount " + sId + "-ariaselection " + sId + "-ariacolrowheaderlabel"
			+ this._sAdditionalLabeling, "aria-labelledby of select all");
		getRowHeader(0, true, assert); //set row header somewhere else on the table
		$Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			sId + "-ariacolrowheaderlabel" + this._sAdditionalLabeling, "aria-labelledby of select all");
		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-labelledby with Focus (Single Selection)", function(assert) {
		oTable.setSelectionMode(SelectionMode.Single);
		sap.ui.getCore().applyChanges();

		var sId = oTable.getId();
		var $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			"ARIALABELLEDBY " + sId + "-ariadesc " + sId + "-ariacount " + sId + "-ariaselection " + sId + "-ariacolrowheaderlabel",
			"aria-labelledby of select all");
		getRowHeader(0, true, assert); //set focus somewhere else on the table
		$Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			sId + "-ariacolrowheaderlabel", "aria-labelledby of select all");
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
		var $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			oTable.getId() + "-ariacolrowheaderlabel" + this._sAdditionalLabeling, "aria-labelledby of select all");
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-labelledby without Focus (Single Selection)", function(assert) {
		oTable.setSelectionMode(SelectionMode.Single);
		sap.ui.getCore().applyChanges();
		setFocusOutsideOfTable(assert);
		var $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			oTable.getId() + "-ariacolrowheaderlabel", "aria-labelledby of select all");
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		var done = assert.async();
		var $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		setFocusOutsideOfTable(assert);
		var $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA Attributes SelectAll", function(assert) {
		var $Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("role"), "checkbox", "role");
		assert.strictEqual($Elem.attr("aria-checked"), "false", "aria-checked");
		oTable.selectAll();
		$Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("aria-checked"), "true", "aria-checked");
		oTable.setSelectionMode(SelectionMode.Single);
		sap.ui.getCore().applyChanges();
		assert.strictEqual($Elem.attr("role"), undefined, "role");
		assert.strictEqual($Elem.attr("aria-checked"), undefined, "aria-checked");
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
			_modifyTables();
			oTable.addExtension(new TestControl({text: "Extension"}));
			oTable.setFooter(new TestControl({text: "Footer"}));
			sap.ui.getCore().applyChanges();
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

		oTreeTable.attachEventOnce("_rowsUpdated", function() {
			var $Elem = oTreeTable.$("rows-row0-col0").find(".sapUiTableTreeIcon");
			assert.strictEqual($Elem.attr("role"), "button", "Tree icon role of expandable row");

			$Elem = oTreeTable.$("rows-row1-col0").find(".sapUiTableTreeIcon");
			assert.strictEqual($Elem.attr("role"), "", "Tree icon role of leaf row");

			done();
		});

		oTreeTable.expand(0);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("ARIA Attributes of Table Header", function(assert) {
		var $Elem = oTable.$().find(".sapUiTableHdr");
		assert.strictEqual($Elem.attr("role"), "heading", "role");
	});

	QUnit.test("ARIA Attributes of Table Elements", function(assert) {
		var $Elem = oTable.$().find("table");
		$Elem.each(function() {
			assert.strictEqual(jQuery(this).attr("role"), "presentation", "role");
		});
	});

	QUnit.test("ARIA Attributes of Content Element", function(assert) {
		var $Elem = oTable.$("sapUiTableGridCnt");
		assert.strictEqual($Elem.attr("role"), "grid", "role");
		assert.strictEqual($Elem.attr("aria-multiselectable"), "true", "aria-multiselectable");
		$Elem = oTreeTable.$("sapUiTableGridCnt");
		assert.strictEqual($Elem.attr("role"), "treegrid", "role");
		assert.ok(!$Elem.attr("aria-multiselectable"), "aria-multiselectable");
	});

	QUnit.test("ARIA Attributes of TH Elements", function(assert) {
		var $Elem = oTable.$().find(".sapUiTableCCnt th[id]"); // all with ID
		$Elem.each(function() {
			var $TH = jQuery(this);
			if ($TH.attr("id") === oTable.getId() + "-dummycolhdr") {
				assert.strictEqual($TH.attr("role"), "presentation", "role");
			} else {
				assert.strictEqual($TH.attr("scope"), "col", "scope");
				var oColumn = oTable.getColumns()[$TH.attr("data-sap-ui-headcolindex")];
				if (oColumn) {
					assert.strictEqual($TH.attr("aria-owns"), oColumn.getId(), "aria-owns");
					assert.strictEqual($TH.attr("aria-labelledby"), oColumn.getId(), "aria-labelledby");
				}
			}
		});
		$Elem = oTable.$().find(".sapUiTableCCnt th:not([id])"); // dummy column
		$Elem.each(function() {
			var $TH = jQuery(this);
			assert.strictEqual($TH.attr("role"), "presentation", "role");
		});
	});

	QUnit.test("ARIA Attributes of TR Elements", function(assert) {
		var $Elem = getCell(0, 0, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = getCell(0, 1, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = getCell(1, 0, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		$Elem = getCell(1, 1, false, assert).parent();
		assert.strictEqual($Elem.attr("role"), "row", "role");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.test("ARIA for Overlay", function(assert) {
		var $OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
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
		oTable.rerender();
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
		});
		oTable.setShowOverlay(false);
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});
	});

	QUnit.test("ARIA for NoData", function(assert) {
		var done = assert.async();
		var $NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
		//2xTable + Row Selector = 3
		assert.strictEqual($NoDataCoveredElements.length, 3, "Number of potentionally covered elements");
		$NoDataCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});

		function onNewModelApplied() {
			oTable.detachEvent("_rowsUpdated", onNewModelApplied);
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});
			oTable.rerender();
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});
			oTable.setShowNoData(false);
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
			});
			done();
		}

		oTable.attachEvent("_rowsUpdated", onNewModelApplied);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("HiddenTexts", function(assert) {
		var aHiddenTexts = [
			"ariadesc", "ariacount", "toggleedit", "ariaselectall", "ariarowheaderlabel", "ariarowgrouplabel", "ariagrandtotallabel",
			"ariagrouptotallabel", "ariacolrowheaderlabel", "rownumberofrows", "colnumberofcols", "cellacc", "ariarowselected", "ariacolmenu",
			"ariacolspan", "ariacolfiltered", "ariacolsortedasc", "ariacolsorteddes", "ariafixedcolumn", "ariainvalid", "ariaselection",
			"ariashowcolmenu", "ariahidecolmenu", "rowexpandtext", "rowcollapsetext", "rownavigatedtext"
		];
		var $Elem = oTable.$().find(".sapUiTableHiddenTexts");
		assert.strictEqual($Elem.length, 1, "Hidden Text Area available");
		$Elem = $Elem.children();
		assert.strictEqual($Elem.length, aHiddenTexts.length, "Number of hidden Texts");
		for (var i = 0; i < aHiddenTexts.length; i++) {
			assert.strictEqual(jQuery.sap.byId(oTable.getId() + "-" + aHiddenTexts[i]).length, 1, "Hidden Text " + aHiddenTexts[i] + " available");
		}
		$Elem.each(function() {
			var $T = jQuery(this);
			var sId = $T.attr("id");
			assert.strictEqual($T.attr("aria-hidden"), "true", "aria-hidden " + sId);
			assert.ok($T.hasClass("sapUiInvisibleText"), "sapUiInvisibleText " + sId);
		});
	});

	QUnit.test("Highlight texts", function(assert) {
		oTable.setVisibleRowCount(1);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		assertHighlightTexts(false);

		// Default texts
		for (i = 0; i < aVisibleHighlights.length; i++) {
			sHighlight = aVisibleHighlights[i];
			sHighlightText = "";

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

			assertHighlightTexts(true, sCustomHighlightText);
		}

		for (i = 0; i < aInvisibleHighlights.length; i++) {
			sHighlight = aInvisibleHighlights[i];

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			sap.ui.getCore().applyChanges();

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

		if (Device.browser.msie) {
			setTimeout(function() {
				assert.ok(!!$Cell.attr("aria-busy"), "Cell is temporarily set in busy mode");
				if (Device.browser.chrome) {
					assert.ok(!!$Cell.attr("aria-hidden"), "Cell is temporarily hidden");
				}
			}, 60);
		}

		setTimeout(function() {
			oTable.removeEventDelegate(oDelegate);
			assert.ok(!bFocusTriggered, "No Refocus of cell done after " + (iDelay + 10) + " ms");
			testAriaLabelsForFocusedDataCell($Cell, 2, 0, assert, {rowChange: true});
			assert.ok(!$Cell.attr("aria-busy"), "Cell is not in busy mode anymore");
			assert.ok(!$Cell.attr("aria-hidden"), "Cell is not hidden anymore");
			assert.ok((oTable.$("cellacc").html() || "").indexOf("A4") >= 0, "Acc Text after scrolling");
			setFocusOutsideOfTable(assert);
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
	});

	QUnit.test("Hidden Standard Tooltips", function(assert) {

		function checkTooltips(bEnable, sSelectionBehavior, sSelectionMode, iExpected) {
			oTable._bHideStandardTooltips = !bEnable;
			oTable.setSelectionBehavior(sSelectionBehavior);
			oTable.setSelectionMode(sSelectionMode);
			sap.ui.getCore().applyChanges();
			assert.equal(oTable.$().find("[title]").length, iExpected,
				"Tooltip enabled:" + bEnable + ", " + sSelectionBehavior + ", " + sSelectionMode);
		}

		var aColumns = oTable.getColumns();
		for (var i = 0; i < aColumns.length; i++) {
			aColumns[i].setTooltip(null);
		}
		initRowActions(oTable, 1, 1);
		sap.ui.getCore().applyChanges();

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

		checkTooltips(false, "Row", "MultiToggle", iActionItems);
		checkTooltips(false, "Row", "Single", iActionItems);
		checkTooltips(false, "Row", "None", iActionItems);
		checkTooltips(false, "RowOnly", "MultiToggle", iActionItems);
		checkTooltips(false, "RowOnly", "Single", iActionItems);
		checkTooltips(false, "RowOnly", "None", iActionItems);
		checkTooltips(false, "RowSelector", "MultiToggle", iActionItems);
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
		oTable.invalidate();
		sap.ui.getCore().applyChanges();

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