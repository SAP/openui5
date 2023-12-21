/*global QUnit, oTable, oTreeTable, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowSettings",
	"sap/ui/table/library",
	"sap/m/IllustratedMessage",
	"sap/m/Label",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	TreeTable,
	AnalyticalTable,
	Column,
	RowAction,
	RowSettings,
	library,
	IllustratedMessage,
	Label,
	Control,
	oCore,
	ControlBehavior,
	coreLibrary,
	JSONModel,
	Filter,
	FilterOperator,
	jQuery
) {
	"use strict";

	const SelectionMode = library.SelectionMode;
	const SortOrder = coreLibrary.SortOrder;
	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const initRowActions = window.initRowActions;
	const removeRowActions = window.removeRowActions;
	const fakeGroupRow = window.fakeGroupRow;
	const fakeSumRow = window.fakeSumRow;

	const TextControl = Control.extend("sap.ui.table.test.TextControl", {
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

	const TestControl = TableQUnitUtils.TestControl;
	const TestInputControl = TableQUnitUtils.TestInputControl;

	TestControl.prototype.getAccessibilityInfo = function() {
		const iMode = Column.ofCell(this).getIndex();

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

	async function _modifyTables() {
		[oTable, oTreeTable].forEach(function(_oTable) {
			_oTable.destroyColumns();
			TableQUnitUtils.addColumn(_oTable, "A Label", "A", false, true, true);
			TableQUnitUtils.addColumn(_oTable, "B Label", "B").setTooltip("B Label");
			TableQUnitUtils.addColumn(_oTable, "C Label", "C", true).setTooltip("tooltip");
			TableQUnitUtils.addColumn(_oTable, "D Label", "D", false, true, true).getTemplate().setVisible(false);
			TableQUnitUtils.addColumn(_oTable, "E Label", "E", false, true, true).setLabel(new Label({text: "E Label", required: true}));

			const oColumn = _oTable.getColumns()[1];
			oColumn.setSortProperty("SomeSortProperty");
			oColumn.setFilterProperty("SomeFilterProperty");
			oColumn.setSortOrder(SortOrder.Ascending);
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

		await nextUIUpdate();
	}

	function checkAriaSelected(sPropertyValue, bExpectSelected, assert) {
		if (bExpectSelected) {
			assert.strictEqual(sPropertyValue, "true", "aria-selected");
		} else {
			assert.ok(sPropertyValue === "false" || !sPropertyValue, "aria-selected");
		}
	}

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getAccExtension();
		assert.ok(oExtension, "Extension available in table");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getAccExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Data Cells", {
		beforeEach: async function() {
			createTables();
			await _modifyTables();
			initRowActions(oTable, 1, 1);
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function testAriaLabelsForFocusedDataCell($Cell, iRow, iCol, assert, mParams = {}) {
		const bFirstTime = !!mParams.firstTime;
		const bRowChange = !!mParams.rowChange;
		const bColChange = !!mParams.colChange;
		const oTable = !mParams.table ? window.oTable : mParams.table;
		const sTableId = oTable.getId();
		const bGroup = !!mParams.group;
		const bSum = !!mParams.sum;

		const aLabels = [];
		if (bFirstTime) {
			aLabels.push(sTableId + "-ariacount");
			aLabels.push(sTableId + "-ariaselection");
		}

		aLabels.push(sTableId + "-rownumberofrows");
		aLabels.push(sTableId + "-colnumberofcols");

		const oColumn = oTable._getVisibleColumns()[iCol];
		const oRow = oTable.getRows()[iRow];
		const sRowId = oRow.getId();
		const oCell = oRow.getCells()[iCol];
		const iIndex = Column.ofCell(oCell).getIndex();

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

		let sText = oTable.$("rownumberofrows").text().trim();
		if (bFirstTime || bRowChange) {
			assert.ok(sText.length > 0 && sText !== ".", "Number of rows are set on row change: " + sText);
		} else {
			assert.ok(sText === ".", "Number of rows are not set when row not changed: " + sText);
		}
		sText = oTable.$("colnumberofcols").text().trim();
		if (bFirstTime || bColChange) {
			assert.ok(sText.length > 0 && sText !== ".", "Number of columns are set on column change: " + sText);
		} else {
			assert.ok(sText === ".", "Number of columns are not set when column not changed: " + sText);
		}
	}

	function testAriaLabelsForNonFocusedDataCell($Cell, iRow, iCol, assert, mParams = {}) {
		const aLabels = [];
		const oTable = !mParams.table ? window.oTable : mParams.table;
		const oColumn = oTable._getVisibleColumns()[iCol];
		const oRow = oTable.getRows()[iRow];
		const oCell = oRow.getCells()[iCol];
		const iIndex = Column.ofCell(oCell).getIndex();

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
		const oRow = oTable.getRows()[iRow];
		const oCell = oRow.getCells()[iCol];
		const iIndex = Column.ofCell(oCell).getIndex();
		const aExpected = [];

		const sText = oTable.$("cellacc").text().trim();

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

		const sExpected = aExpected.length ? aExpected.join(" ") : ".";
		assert.strictEqual(sText, sExpected, "ACC Info description of cell [" + iRow + ", " + iCol + "]");
	}

	function testAriaDescriptionsForFocusedDataCell($Cell, iRow, iCol, assert, mParams, bExpanded = false) {
		const oTable = mParams.table || window.oTable;
		const bGroup = !!mParams.group;
		const aDescriptions = [];
		const oRow = oTable.getRows()[iRow];
		const oCell = oRow.getCells()[iCol];
		const iIndex = Column.ofCell(oCell).getIndex();

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
		const done = assert.async();
		let $Cell;
		let i;
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
		const done = assert.async();
		let $Cell;
		let i;
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
		let $Cell;
		let i;
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

	QUnit.test("no aria-labelledby attr. '-inner' in cell when columnHeaderVisible=false", async function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		let oColumn;
		let $Cell;
		let i;

		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();

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

	QUnit.test("ACCInfo", async function(assert) {
		const done = assert.async();
		let $Cell;

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
		await nextUIUpdate();

		for (let i = 0; i < oTable.columnCount; i++) {
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
		const done = assert.async();
		let $Cell;
		let i;
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
		const done = assert.async();
		let $Cell;
		let i;
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
		let $Cell;
		let i;
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
		const done = assert.async();
		initRowActions(oTable, 1, 1);

		fakeGroupRow(1).then(async function(oRefs) {
			assert.strictEqual(oRefs.row.attr("aria-expanded"), "true", "aria-expanded set on group row");
			assert.strictEqual(oRefs.row.attr("aria-level"), "1", "aria-level set on group row");
			assert.strictEqual(oRefs.fixed.attr("aria-expanded"), "true", "aria-expanded set on group row (fixed)");
			assert.strictEqual(oRefs.fixed.attr("aria-level"), "1", "aria-level set on group row (fixed)");
			assert.notOk(oRefs.act.attr("aria-expanded"), "aria-expanded is not set on row action");
			assert.notOk(oRefs.act.attr("aria-level"), "aria-level is not set on row action");

			let $Cell;
			let i;
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
				await nextUIUpdate();
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
		let oRowDomRefs;

		initRowActions(oTable, 1, 1);
		TableUtils.Grouping.setToDefaultGroupMode(oTable);

		return fakeSumRow(1).then(async function(oRefs) {
			oRowDomRefs = oRefs;

			assert.strictEqual(oRefs.row.attr("aria-level"), "1", "aria-level set on sum row");
			assert.strictEqual(oRefs.fixed.attr("aria-level"), "1", "aria-level set on sum row (fixed part)");
			assert.notOk(oRefs.act.attr("aria-level"), "aria-level is not set on sum row (action part)");

			let $Cell;
			let i;
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
				await nextUIUpdate();
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

	QUnit.test("Other ARIA attributes of data cell", async function(assert) {
		let $Elem = oTable.$("rows-row0-col0");
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
		await nextUIUpdate();
		$Elem = oTable.$("rows-row0-col0");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);
		$Elem = oTable.$("rows-row1-col0");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.module("Column Header", {
		beforeEach: async function() {
			createTables();
			await _modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function testAriaLabelsForColumnHeader($Cell, iCol, assert, mParams = {}) {
		const bFirstTime = !!mParams.firstTime;
		const bFocus = !!mParams.focus;
		const bColChange = !!mParams.colChange;
		const sTableId = oTable.getId();

		const aLabels = [];
		if (bFirstTime && bFocus) {
			aLabels.push(sTableId + "-ariacount");
			aLabels.push(sTableId + "-ariaselection");
		}

		if (bFocus) {
			aLabels.push(sTableId + "-colnumberofcols");
		}

		const oColumn = oTable._getVisibleColumns()[iCol];

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
			const sText = oTable.$("colnumberofcols").text().trim();
			if (bFirstTime || bColChange) {
				assert.ok(sText.length > 0, "Number of columns are set on column change: " + sText);
			} else {
				assert.ok(sText.length == 0, "Number of columns are not set when column not changed: " + sText);
			}
		}
	}

	QUnit.test("aria-labelledby with Focus", function(assert) {
		const done = assert.async();
		let $Cell;
		for (let i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, true, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true, focus: true});
		}

		removeRowActions(oTable);

		for (let i = 0; i < oTable.columnCount; i++) {
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
		let $Cell;
		for (let i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true});
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		const done = assert.async();
		let $Cell;
		for (let i = 0; i < oTable.columnCount; i++) {
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
		let $Cell;
		for (let i = 0; i < oTable.columnCount; i++) {
			$Cell = getColumnHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of column header " + i);
		}
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("required state of multi column header with Focus", async function(assert) {
		const sTableId = oTable.getId();
		const oCell = oTable._getVisibleColumns()[1].getDomRef();
		const $Cell = jQuery(oCell);
		oTable.getColumns()[1].setLabel(null);
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new Label({required: true, text: "Test Text"}));
		oTable.getColumns()[1].setHeaderSpan([3, 2, 1]);
		await nextUIUpdate();

		oCell.focus();

		assert.ok($Cell.attr("aria-labelledby").includes(sTableId + "-ariarequired"), "aria-required");
	});

	QUnit.test("aria-haspopup", async function(assert) {
		const oColumn = oTable.getColumns()[0];
		const oHeaderMenu = new TableQUnitUtils.ColumnHeaderMenu();

		assert.ok(!oColumn.getDomRef().hasAttribute("aria-haspopup"), "Not set after rendering without header menu");

		oColumn.setHeaderMenu(oHeaderMenu);
		await nextUIUpdate();
		assert.equal(oColumn.getDomRef().getAttribute("aria-haspopup"), "menu", "Set after rendering with header menu that returns HasPopup.Menu");

		oColumn.setHeaderMenu();
		await nextUIUpdate();
		assert.ok(!oColumn.getDomRef().hasAttribute("aria-haspopup"), "Not set after the header menu is removed");

		oHeaderMenu.destroy();
	});

	/** @deprecated As of Version 1.117 */
	QUnit.test("aria-haspopup (legacy)", function(assert) {
		const oColumn = oTable.getColumns()[1];
		const oDomRef = oColumn.getDomRef();

		assert.strictEqual(oDomRef.getAttribute("aria-haspopup"), "menu", "aria-haspopup");

		oColumn.setSortProperty();
		oColumn.setFilterProperty();
		oCore.applyChanges();
		assert.notOk(oDomRef.hasAttribute("aria-haspopup"), "aria-haspopup");
	});

	QUnit.test("aria-sort", async function(assert) {
		const oFirstColumn = oTable.getColumns()[0];
		const oSecondColumn = oTable.getColumns()[1];

		assert.strictEqual(oFirstColumn.getDomRef().getAttribute("aria-sort"), "none", "First column");
		assert.strictEqual(oSecondColumn.getDomRef().getAttribute("aria-sort"), "ascending", "Second column");

		/** @deprecated As of version 1.120 */
		oFirstColumn.setSorted(true);
		oFirstColumn.setSortOrder(SortOrder.Ascending);
		await new Promise((resolve) => {
			oTable.attachEventOnce("rowsUpdated", resolve);
		});

		assert.strictEqual(oFirstColumn.getDomRef().getAttribute("aria-sort"), "ascending", "First column");
		assert.strictEqual(oSecondColumn.getDomRef().getAttribute("aria-sort"), "ascending", "Second column");

		oFirstColumn.setSortOrder(SortOrder.Descending);
		oSecondColumn.setSortOrder(SortOrder.None);
		await new Promise((resolve) => {
			oTable.attachEventOnce("rowsUpdated", resolve);
		});

		assert.strictEqual(oFirstColumn.getDomRef().getAttribute("aria-sort"), "descending", "First column");
		assert.strictEqual(oSecondColumn.getDomRef().getAttribute("aria-sort"), "none", "Second column");
	});

	QUnit.test("aria-sort with multi header", async function(assert) {
		const oColumn1 = new Column({
			multiLabels: [
				new TestControl({text: "Person"}),
				new TestControl({text: "Name"}),
				new TestControl({text: "First Name"})
			],
			headerSpan: [3, 2],
			hAlign: "Center",
			template: new TestControl(),
			sortProperty: "sortProperty",
			sortOrder: SortOrder.Ascending
		});
		const oColumn2 = new Column({
			multiLabels: [
				new TestControl(),
				new TestControl(),
				new TestControl({text: "Last Name"})
			],
			hAlign: "Center",
			template: new TestControl(),
			sortProperty: "sortProperty"
		});
		const oColumn3 = new Column({
			multiLabels: [
				new TestControl(),
				new TestControl({text: "Age"})
			],
			hAlign: "Center",
			template: new TestControl(),
			sortProperty: "sortProperty",
			sortOrder: SortOrder.Descending
		});

		oTable.destroyColumns();
		oTable.addColumn(oColumn1);
		oTable.addColumn(oColumn2);
		oTable.addColumn(oColumn3);
		/** @deprecated As of version 1.120 */
		(function() {
			oColumn1.setSorted(true);
			oColumn3.setSorted(true);
		})();
		await nextUIUpdate();

		// Check only visible cells. The others are not relevant since they can't be focused.
		assert.notOk(document.getElementById(oColumn1.getId()).hasAttribute("aria-sort"), "1st row, 1st cell (span 3)");
		assert.notOk(document.getElementById(oColumn1.getId() + "_1").hasAttribute("aria-sort"), "2nd row, 1st cell (span 2)");
		assert.strictEqual(document.getElementById(oColumn3.getId() + "_1").getAttribute("aria-sort"), "descending", "2nd row, 2nd cell");
		assert.strictEqual(document.getElementById(oColumn1.getId() + "_2").getAttribute("aria-sort"), "ascending", "3rd row, 1st cell");
		assert.strictEqual(document.getElementById(oColumn2.getId() + "_2").getAttribute("aria-sort"), "none", "3rd row, 2nd cell");
		assert.strictEqual(document.getElementById(oColumn3.getId() + "_2").getAttribute("aria-sort"), "descending", "3rd row, 3rd cell");
	});

	QUnit.test("role", function(assert) {
		assert.strictEqual(oTable.getColumns()[0].getDomRef().getAttribute("role"), "columnheader", "First column");
		assert.strictEqual(oTable.getColumns()[1].getDomRef().getAttribute("role"), "columnheader", "Second column");
	});

	QUnit.module("Row Header", {
		beforeEach: async function(assert) {
			createTables();
			await _modifyTables();
		},
		afterEach: function() {
			destroyTables();
		},
		testAriaLabels: function($Cell, iRow, assert, mParams = {}) {
			const bFirstTime = !!mParams.firstTime;
			const bFocus = !!mParams.focus;
			const bRowChange = !!mParams.rowChange;
			const bGroup = !!mParams.group;
			const bSum = !!mParams.sum;
			const bExpanded = !!mParams.expanded;
			const oTable = !mParams.table ? window.oTable : mParams.table;
			const sTableId = oTable.getId();
			const oRow = oTable.getRows()[iRow];
			const sRowId = oRow.getId();

			const aLabels = [];
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
				const sText = oTable.$("rownumberofrows").text().trim();
				if (bFirstTime || bRowChange) {
					assert.ok(sText.length > 0 && sText !== ".", "Number of rows are set on row change: " + sText);
				} else {
					assert.ok(sText === ".", "Number of rows are not set when row not changed: " + sText);
				}
			}
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		const that = this;
		const done = assert.async();
		let $Cell;

		for (let i = 0; i < 2; i++) {
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

		for (let i = 0; i < 2; i++) {
			const $Cell = getRowHeader(i, false, assert);
			this.testAriaLabels($Cell, i, assert, {rowChange: true});
		}
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		const done = assert.async();

		for (let i = 0; i < 2; i++) {
			const $Cell = getRowHeader(i, true, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);

		for (let i = 0; i < 2; i++) {
			const $Cell = getRowHeader(i, false, assert);
			assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
		}
	});

	QUnit.test("Group Header Row", function(assert) {
		const that = this;
		const done = assert.async();
		fakeGroupRow(1).then(function(oRefs) {
			let $Cell;

			assert.notOk(oRefs.hdr.attr("aria-expanded"), "aria-expanded is not set on group row header");
			assert.notOk(oRefs.hdr.attr("aria-level"), "aria-level is not set on group row header");

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

	QUnit.test("Group Header Row (TreeTable)", async function(assert) {
		const that = this;
		const done = assert.async();

		oTreeTable.setUseGroupMode(true);
		await nextUIUpdate();

		const $Cell = getRowHeader(0, true, assert, oTreeTable);
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
		let $Cell;
		let oRowDomRefs;
		const that = this;

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

	QUnit.test("Other ARIA attributes", async function(assert) {
		let $Elem;

		$Elem = oTable.$("rowsel0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
		oTable.invalidate();
		await nextUIUpdate();

		$Elem = oTable.$("rowsel0");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowsel1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	function testSelectorText(assert, sSelectionMode, sSelectionBehavior, bSelected) {
		const oRow = oTable.getRows()[0];
		const $RowSelectorTextRef = oRow.$("rowselecttext");

		if (sSelectionMode === "None") {
			assert.equal($RowSelectorTextRef.text(), ".", "The row header doesn't have row selector text because SelectionMode is \"None\"");
		} else {
			const sRowSelectorText = bSelected ? TableUtils.getResourceText("TBL_ROW_DESELECT_KEY") : TableUtils.getResourceText("TBL_ROW_SELECT_KEY");

			assert.ok($RowSelectorTextRef.html().indexOf(sRowSelectorText) > -1,
				`selectionBehavior = ${sSelectionBehavior} - 
				The row header has a row selector text saying that pressing SPACE ${bSelected ? "deselects" : "selects"} the row`);
		}
	}

	QUnit.test("Selector text", async function(assert) {
		const oRow = oTable.getRows()[0];
		const $Cell = getRowHeader(0);
		const $RowSelectorTextRef = oRow.$("rowselecttext");

		testSelectorText(assert, "MultiToggle", "RowSelector", true);
		oTable.clearSelection();
		testSelectorText(assert, "MultiToggle", "RowSelector", false);

		oTable.setSelectionBehavior("Row");
		await nextUIUpdate();

		return new Promise(function(resolve) {
			oTable._getSelectionPlugin().attachEventOnce("selectionChange", resolve);
			oTable.setSelectedIndex(0);
		}).then(async function() {
			testSelectorText(assert, "MultiToggle", "Row", true);
			oTable.clearSelection();
			testSelectorText(assert, "MultiToggle", "Row", false);

			oTable.setSelectionMode(SelectionMode.Single);
			await nextUIUpdate();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
				oTable.setSelectedIndex(0);
			});
		}).then(async function() {
			testSelectorText(assert, "Single", "Row", true);
			oTable.clearSelection();
			testSelectorText(assert, "Single", "Row", false);

			oTable.setSelectionMode(SelectionMode.None);
			await nextUIUpdate();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(async function() {
			testSelectorText(assert, "None");

			oTable.setSelectionMode(SelectionMode.MultiToggle);
			await nextUIUpdate();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			testSelectorText(assert, "MultiToggle", "Row", false);
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
		beforeEach: async function() {
			createTables();
			await _modifyTables();
			initRowActions(oTable, 1, 1);
			initRowActions(oTreeTable, 1, 1);
		},
		afterEach: function() {
			destroyTables();
		},
		testAriaLabels: function($Cell, iRow, assert, mParams = {}) {
			const bFirstTime = !!mParams.firstTime;
			const bFocus = !!mParams.focus;
			const bRowChange = !!mParams.rowChange;
			const bGroup = !!mParams.group;
			const bSum = !!mParams.sum;
			const bExpanded = !!mParams.expanded;
			const oTable = !mParams.table ? window.oTable : mParams.table;
			const sTableId = oTable.getId();
			const oRow = oTable.getRows()[iRow];
			const sRowId = oRow.getId();

			const aLabels = [];
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
				const sText = oTable.$("rownumberofrows").text().trim();
				if (bFirstTime || bRowChange) {
					assert.ok(sText.length > 0 && sText !== ".", "Number of rows are set on row change: " + sText);
				} else {
					assert.ok(sText === ".", "Number of rows are not set when row not changed: " + sText);
				}
			}
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		const that = this;
		const done = assert.async();
		let $Cell;

		for (let i = 0; i < 2; i++) {
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
		const that = this;
		const done = assert.async();
		let $Cell;

		fakeGroupRow(1).then(function() {
			for (let i = 0; i < 2; i++) {
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
		const that = this;
		const done = assert.async();
		let $Cell;

		fakeSumRow(1).then(function() {
			for (let i = 0; i < 2; i++) {
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

		for (let i = 0; i < 2; i++) {
			const $Cell = getRowAction(i, false, assert);
			this.testAriaLabels($Cell, i, assert, {rowChange: true, colChange: i < 2});
		}

		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA attributes", function(assert) {
		let $Elem;

		$Elem = oTable.$("rowact0");
		assert.strictEqual($Elem.attr("role"), "gridcell", "role");
		checkAriaSelected($Elem.attr("aria-selected"), true, assert);

		$Elem = oTable.$("rowact1");
		checkAriaSelected($Elem.attr("aria-selected"), false, assert);
	});

	QUnit.test("Group Header Row (TreeTable)", async function(assert) {
		const that = this;
		const done = assert.async();

		oTreeTable.setUseGroupMode(true);
		await nextUIUpdate();

		const $Cell = getRowAction(1, true, assert, oTreeTable);
		this.testAriaLabels($Cell, 1, assert, {group: true, focus: true, firstTime: true, rowChange: true, colChange: true, table: oTreeTable});

		oTreeTable.setSelectionMode(SelectionMode.Row);
		await nextUIUpdate();
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
		beforeEach: async function() {
			createTables();
			await _modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("aria-labelledby with Focus", function(assert) {
		const done = assert.async();
		const sTableId = oTable.getId();
		let $Cell = getSelectAll(true, assert);

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

	QUnit.test("aria-labelledby with Focus (Single Selection)", async function(assert) {
		oTable.setSelectionMode(SelectionMode.Single);
		await nextUIUpdate();

		const sTableId = oTable.getId();
		const $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			sTableId + "-ariacount " + sTableId + "-ariaselection " + sTableId + "-colnumberofcols", "aria-labelledby of select all");
		getRowHeader(0, true, assert); //set focus somewhere else on the table
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-labelledby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		const $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
			"", "aria-labelledby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("aria-describedby with Focus", function(assert) {
		const done = assert.async();
		const $Cell = getSelectAll(true, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		setTimeout(function() {
			done();
		}, 100);
	});

	QUnit.test("aria-describedby without Focus", function(assert) {
		TableQUnitUtils.setFocusOutsideOfTable(assert);
		const $Cell = getSelectAll(false, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of select all");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("Other ARIA attributes of select all cell", async function(assert) {
		let $Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("role"), "checkbox", "role");
		assert.strictEqual($Elem.attr("aria-checked"), "false", "aria-checked");
		oTable.selectAll();
		$Elem = getSelectAll(false);
		assert.strictEqual($Elem.attr("aria-checked"), "true", "aria-checked");
		oTable.setSelectionMode(SelectionMode.Single);
		await nextUIUpdate();
		assert.strictEqual($Elem.attr("role"), undefined, "role");
		assert.strictEqual($Elem.attr("aria-checked"), undefined, "aria-checked");
	});

	QUnit.module("Misc", {
		beforeEach: async function() {
			createTables();
			await _modifyTables();
			oTable.addExtension(new TestControl({text: "Extension"}));
			oTable.setFooter(new TestControl({text: "Footer"}));
			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("ARIA Labels of Column Template", function(assert) {
		const aColumns = oTable._getVisibleColumns();
		const aCells = oTable.getRows()[0].getCells();
		for (let i = 0; i < aCells.length; i++) {
			assert.strictEqual(aCells[i].getAriaLabelledBy()[0], aColumns[i].getId(), "ArialabelledBy to column header for cell in column " + i);
		}
	});

	QUnit.test("ARIA attributes of TreeTable expand icon", async function(assert) {
		const done = assert.async();
		let $Elem;

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
		await nextUIUpdate();
	});

	/**
	 * @deprecated As of version 1.38
	 */
	QUnit.test("ARIA attributes of table header", function(assert) {
		oTable.setTitle(new Label());
		oCore.applyChanges();

		const $Elem = oTable.$().find(".sapUiTableHdr");
		assert.strictEqual($Elem.attr("role"), "heading", "role");
		assert.strictEqual($Elem.attr("aria-level"), "2", "aria-level");
	});

	QUnit.test("ARIA attributes of table elements", function(assert) {
		const $Elem = oTable.$().find("table");
		$Elem.each(function() {
			assert.strictEqual(jQuery(this).attr("role"), "presentation", "role");
		});
	});

	QUnit.test("ARIA attributes of content element", async function(assert) {
		const $Elem = oTable.$("sapUiTableGridCnt");

		assert.strictEqual($Elem.attr("role"), "grid", "role");
		assert.strictEqual($Elem.attr("aria-rowcount"), "9", "aria-rowcount");
		assert.strictEqual($Elem.attr("aria-colcount"), "6", "aria-colcount");
		assert.strictEqual($Elem.attr("aria-multiselectable"), "true", "aria-multiselectable");
		assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getAriaLabelledBy().toString(), "aria-labelledby");

		oTable.addAriaLabelledBy("test");
		await nextUIUpdate();
		assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getAriaLabelledBy().join(" "), "aria-labelledby");

		oTable.getBinding().filter(new Filter("A", FilterOperator.EQ, "A1"));
		assert.strictEqual($Elem.attr("aria-rowcount"), "4", "aria-rowcount after filter is applied");

		oTable.setRowActionTemplate(new RowAction());
		oTable.setRowActionCount(1);
		await nextUIUpdate();
		assert.strictEqual($Elem.attr("aria-colcount"), "7", "aria-colcount");

		oTable.removeAllAriaLabelledBy();
		await nextUIUpdate();
		assert.notOk($Elem.attr("aria-labelledby"), "aria-labelledby when ariaLabelledBy association is empty array");
	});

	QUnit.test("ARIA attributes of content element (TreeTable)", async function(assert) {
		const $Elem = oTreeTable.$("sapUiTableGridCnt");

		assert.strictEqual($Elem.attr("role"), "treegrid", "role");
		assert.strictEqual($Elem.attr("aria-rowcount"), "9", "aria-rowcount");
		assert.strictEqual($Elem.attr("aria-colcount"), "6", "aria-colcount");
		assert.ok(!$Elem.attr("aria-multiselectable"), "aria-multiselectable");

		oTreeTable.getBinding().filter(new Filter("A", FilterOperator.EQ, "A1"));
		assert.strictEqual($Elem.attr("aria-rowcount"), "4", "aria-rowcount after filter is applied");

		oTreeTable.setRowActionTemplate(new RowAction());
		oTreeTable.setRowActionCount(1);
		await nextUIUpdate();
		assert.strictEqual($Elem.attr("aria-colcount"), "7", "aria-colcount");
	});

	QUnit.test("ARIA attributes of content element (AnalyticalTable)", async function(assert) {
		const oAnalyticalTable = new AnalyticalTable();

		oAnalyticalTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(
			oAnalyticalTable.$("sapUiTableGridCnt").attr("aria-roledescription"),
			TableUtils.getResourceText("TBL_ANALYTICAL_TABLE_ROLE_DESCRIPTION"),
			"aria-roledescription"
		);

		oAnalyticalTable.destroy();
	});

	/** @deprecated As of version 1.72 */
	QUnit.test("ARIA attributes of content element with title (legacy)", function(assert) {
		oTable.setTitle(new Label());
		oCore.applyChanges();
		assert.strictEqual(oTable.$("sapUiTableGridCnt").attr("aria-labelledby"), oTable.getAriaLabelledBy() + " " + oTable.getTitle().getId(),
			"aria-labelledby");

		oTable.removeAriaLabelledBy(oTable.getAriaLabelledBy()[0]);
		oCore.applyChanges();
		assert.strictEqual(oTable.$("sapUiTableGridCnt").attr("aria-labelledby"), oTable.getTitle().getId(),
			"aria-labelledby when ariaLabelledBy association is empty array");
	});

	QUnit.test("ARIA attributes of TH elements", function(assert) {
		const oDomRef = oTable.getDomRef("tableCCnt");

		const aThs = oDomRef.querySelectorAll("th[id]");
		for (let i = 0; i < aThs.length; i++) {
			assert.strictEqual(aThs[i].getAttribute("scope"), "col", "scope");
			assert.strictEqual(aThs[i].getAttribute("role"), "presentation", "role");
			assert.strictEqual(aThs[i].getAttribute("aria-hidden"), "true", "aria-hidden");
		}

		// dummy column
		assert.strictEqual(oDomRef.querySelector("th:not([id])").getAttribute("role"), "presentation", "role");
	});

	QUnit.test("ARIA attributes of TR elements", async function(assert) {
		initRowActions(oTable, 1, 1);
		await nextUIUpdate();

		const sTableId = oTable.getId();
		let $Elem = getCell(0, 0, false, assert).parent();
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

	QUnit.test("ARIA Role of dummy elements", function(assert) {
		let $Elem = oTable.$("focusDummy");
		assert.strictEqual($Elem.attr("role"), "none", "role");
		$Elem = oTable.$().find(".sapUiTableCtrlBefore").first();
		assert.strictEqual($Elem.attr("role"), "none", "role");
		$Elem = oTable.$().find(".sapUiTableCtrlAfter").first();
		assert.strictEqual($Elem.attr("role"), "none", "role");
	});

	QUnit.test("ARIA rowindices", function(assert) {
		const done = assert.async();
		const iNumberOfRows = oTable.getRows().length;
		let $Elem; let i;

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

	QUnit.test("Row index and count", async function(assert) {
		const oAriaCount = oTable.getDomRef("ariacount");
		const oNumberOfRows = oTable.getDomRef("rownumberofrows");
		const oNumberOfColumns = oTable.getDomRef("colnumberofcols");

		getCell(0, 0, true);
		assert.equal(oAriaCount.textContent, TableUtils.getResourceText("TBL_DATA_ROWS_COLS", [9, 6]),
			"Data cell in row 1 column 1: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [2, 9]),
			"Data cell in row 1 column 1: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [2, 6]),
			"Data cell in row 1 column 1: colnumberofcols");

		getCell(1, 1, true);
		assert.equal(oAriaCount.textContent.trim(), ".", "Data cell in row 2 column 2: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [3, 9]),
			"Data cell in row 2 column 2: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [3, 6]),
			"Data cell in row 2 column 2: colnumberofcols");

		getColumnHeader(0, true);
		assert.equal(oAriaCount.textContent.trim(), ".", "1st Column header cell: ariacount");
		assert.equal(oNumberOfRows.textContent.trim(), ".", "1st Column header cell: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent, TableUtils.getResourceText("TBL_COL_COLCOUNT", [2, 6]),
			"1st Column header cell: colnumberofcols");

		sinon.stub(oTable, "_getTotalRowCount").returns(1);
		oTable.getRowMode().setRowCount(1);
		oTable._bVariableRowHeightEnabled = true;
		await nextUIUpdate();

		getCell(0, 0, true);
		assert.equal(oAriaCount.textContent.trim(), ".", "Data cell in row 1 column 1: ariacount");
		assert.equal(oNumberOfRows.textContent, TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [2, 2]),
			"Data cell in row 1 column 1: rownumberofrows");
		assert.equal(oNumberOfColumns.textContent.trim(), ".", "Data cell in row 1 column 1: colnumberofcols");
	});

	QUnit.test("ARIA colindices", async function(assert) {
		const iNumberOfColumns = oTable._getVisibleColumns().length;
		let $Elem; let i;

		oTable.setRowActionTemplate(new RowAction());
		oTable.setRowActionCount(1);
		await nextUIUpdate();

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

	QUnit.test("ARIA current", async function(assert) {
		const done = assert.async();
		const iNumberOfRows = oTable.getRows().length;
		let $Elem; let i;

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: {
				path: "",
				formatter: function() {
					const oRow = this._getRow();

					if (oRow != null) {
						const iIndex = oRow.getIndex();

						if (iIndex === 1) {
							return true;
						}
					}
				}
			}
		}));
		await nextUIUpdate();

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

	QUnit.test("ARIA for Overlay", async function(assert) {
		let $OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		const sTableId = oTable.getId();

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
		let $Elem = jQuery(document.getElementById(sTableId + "-overlay"));
		assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getAriaLabelledBy() + " " + sTableId + "-ariainvalid", "aria-labelledby");
		oTable.invalidate();
		await nextUIUpdate();
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
		});
		oTable.setShowOverlay(false);
		$OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		$OverlayCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});

		oTable.removeAllAriaLabelledBy();
		await nextUIUpdate();
		$Elem = jQuery(document.getElementById(sTableId + "-overlay"));
		assert.strictEqual($Elem.attr("aria-labelledby"), sTableId + "-ariainvalid",
			"aria-labelledby when ariaLabelledBy association is empty array");
	});

	/** @deprecated As of version 1.72 */
	QUnit.test("ARIA for Overlay with title (legacy)", function(assert) {
		let $OverlayCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']");
		const sTableId = oTable.getId();

		oTable.setTitle(new Label());
		oCore.applyChanges();

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
		let $Elem = jQuery(document.getElementById(sTableId + "-overlay"));
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
		const done = assert.async();
		let $NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");

		// 2xTable + Row Selector = 3
		assert.strictEqual($NoDataCoveredElements.length, 3, "Number of potentially covered elements");
		$NoDataCoveredElements.each(function() {
			assert.ok(!jQuery(this).attr("aria-hidden"), "No aria-hidden");
		});

		async function onNewModelApplied() {
			oTable.detachRowsUpdated(onNewModelApplied);
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});
			oTable.invalidate();
			await nextUIUpdate();
			// eslint-disable-next-line require-atomic-updates
			$NoDataCoveredElements = oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']");
			$NoDataCoveredElements.each(function() {
				assert.ok(jQuery(this).attr("aria-hidden") === "true", "aria-hidden");
			});

			const $Elem = oTable.$("noDataCnt");
			assert.equal($Elem.attr("aria-labelledby"), oTable.getId() + "-noDataMsg");

			oTable.setNoData(new Control({id: "_noDataControl"}));
			await nextUIUpdate();
			assert.strictEqual($Elem.attr("aria-labelledby"), "_noDataControl");

			oTable.setNoData(new IllustratedMessage({
				illustrationType: "NoSearchResults",
				title: "No Items found",
				description: "Adjust your filter settings."
			}));

			await nextUIUpdate();
			assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getDomRef("noDataCnt").querySelector("figcaption>div").getAttribute("id") +
				" " + oTable.getDomRef("noDataCnt").querySelector("figcaption>span").getAttribute("id"));

			oTable.setShowNoData(false);
			await nextUIUpdate();
			// eslint-disable-next-line require-atomic-updates
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
		const aHiddenTexts = [
			"ariacount", "toggleedit", "ariarowgrouplabel", "ariagrandtotallabel",
			"ariagrouptotallabel", "rownumberofrows", "colnumberofcols", "cellacc", "ariacolmenu",
			"ariacolspan", "ariacolfiltered", "ariacolsortedasc", "ariacolsorteddes", "ariafixedcolumn", "ariainvalid", "ariaselection",
			"ariashowcolmenu", "ariahidecolmenu", "rowexpandtext", "rowcollapsetext", "rownavigatedtext", "ariarequired"
		];
		let $Elem = oTable.$().find(".sapUiTableHiddenTexts");
		assert.strictEqual($Elem.length, 1, "Hidden Text Area available");
		$Elem = $Elem.children();
		assert.strictEqual($Elem.length, aHiddenTexts.length, "Number of hidden Texts");
		for (let i = 0; i < aHiddenTexts.length; i++) {
			assert.ok(oTable.getDomRef(aHiddenTexts[i]) != null, "Hidden Text " + aHiddenTexts[i] + " available");
		}
		$Elem.each(function() {
			const $T = jQuery(this);
			const sId = $T.attr("id");
			assert.strictEqual($T.attr("aria-hidden"), "true", "aria-hidden " + sId);
			assert.ok($T.hasClass("sapUiInvisibleText"), "sapUiInvisibleText " + sId);
		});
	});

	QUnit.test("HiddenText cellacc", async function(assert) {
		let oCol1 = oTable.getColumns()[0];
		let $Cell = getCell(1, 1, true, null, oTable);

		assert.ok((oTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"Table: HiddenText cellacc is properly set");

		oTable.setFixedColumnCount(0);
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oCol1);
		await nextUIUpdate();

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
		await nextUIUpdate();

		$Cell = getCell(1, 1, true, null, oTreeTable);
		assert.ok((oTreeTable.$("cellacc").text()).indexOf($Cell.text()) > -1,
			"TreeTable: HiddenText cellacc is properly set after the first column is grouped");
	});

	QUnit.test("Highlight texts", async function(assert) {
		oTable.getRowMode().setRowCount(1);
		await nextUIUpdate();

		const aVisibleHighlights = [
			coreLibrary.MessageType.Success,
			coreLibrary.MessageType.Warning,
			coreLibrary.MessageType.Error,
			coreLibrary.MessageType.Information
		].concat(Object.getOwnPropertyNames(coreLibrary.IndicationColor));

		const aInvisibleHighlights = [
			coreLibrary.MessageType.None,
			null
		];

		let i;
		let sHighlight;
		let sHighlightText;
		const sCustomHighlightText = "Custom highlight text";

		function assertHighlightTexts(bTextExists, sText) {
			const oRow = oTable.getRows()[0];
			const oHighlightTextElement = oRow.getDomRef("highlighttext");

			assert.strictEqual(oHighlightTextElement != null, bTextExists,
				"The highlight text element " + (bTextExists ? "exists in the DOM" : "does not exist in the DOM"));

			if (oHighlightTextElement != null) {
				assert.strictEqual(oHighlightTextElement.innerHTML, sText || ".", "The highlight text is correct: \"" + sText + "\"");
			}
		}

		oTable.setRowSettingsTemplate(null);
		await nextUIUpdate();

		assertHighlightTexts(false);

		// Default texts
		for (i = 0; i < aVisibleHighlights.length; i++) {
			sHighlight = aVisibleHighlights[i];
			sHighlightText = "";

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			await nextUIUpdate();

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
			await nextUIUpdate();

			assertHighlightTexts(true, sCustomHighlightText);
		}

		for (i = 0; i < aInvisibleHighlights.length; i++) {
			sHighlight = aInvisibleHighlights[i];

			oTable.setRowSettingsTemplate(new RowSettings({
				highlight: sHighlight
			}));
			await nextUIUpdate();

			assertHighlightTexts(false);
		}
	});

	QUnit.test("Scrolling", function(assert) {
		const done = assert.async();
		const $Cell = getCell(2, 0, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 2, 0, assert, {firstTime: true});

		let bFocusTriggered = false;
		const iDelay = 150;

		const oDelegate = {
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

	QUnit.test("ExtensionHelper.getColumnIndexOfFocusedCell", async function(assert) {
		const oExtension = oTable._getAccExtension();
		oExtension._debug();
		oTable.getColumns()[1].setVisible(false);
		initRowActions(oTable, 2, 2);
		await nextUIUpdate();

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

	QUnit.test("ExtensionHelper.getRelevantColumnHeaders", async function(assert) {
		const oExtension = oTable._getAccExtension();
		oExtension._debug();
		const oHelper = oExtension._ExtensionHelper;

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
		await nextUIUpdate();

		function checkColumnHeaders(tbl, col, aExpectedHeaders) {
			const aHeaders = oHelper.getRelevantColumnHeaders(tbl, col);
			const sId = tbl && col ? col.getId() : "";
			assert.equal(aHeaders.length, aExpectedHeaders.length, sId + ": Number of relevant headers");
			for (let i = 0; i < aExpectedHeaders.length; i++) {
				assert.equal(aHeaders[i], aExpectedHeaders[i], sId + ": Header " + i + " == " + aHeaders[i]);
			}
		}

		let oCol = oTable.getColumns()[0];
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
		await nextUIUpdate();
		oCol = oTable.getColumns()[0];
		checkColumnHeaders(oTable, oCol, []);
	});

	QUnit.module("No Acc Mode", {
		beforeEach: async function() {
			createTables();
			await _modifyTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("No Acc Mode", async function(assert) {
		oTable._getAccExtension()._accMode = false;
		const oConfigStub = sinon.stub(ControlBehavior, "isAccessibilityEnabled");
		oConfigStub.returns(false);
		oTable.findElements(true, function(oElement) {
			oElement.invalidate();
		});
		await nextUIUpdate();

		const sHtml = oTable.$().html();
		assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM");

		let i;
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
});