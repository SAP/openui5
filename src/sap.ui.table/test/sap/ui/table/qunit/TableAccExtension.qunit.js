
//************************************************************************
// Preparation Code
//************************************************************************

sap.ui.core.Control.extend("TestControl", {
	metadata : {
		properties : {
			"text" : "string",
			"src" : "sap.ui.core.URI",
			"alt" : "string",
			"visible" : "boolean",
			"index" : "int" //Results in different behavior of the control in different columns
		}
	},

	renderer : function(oRm, oControl) {
		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getText() || oControl.getAlt() || "");
		oRm.write("</span>");
	},

	getAccessibilityInfo : function() {
		var iMode = this.getIndex();
		switch (iMode) {
			case 0:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					focusable: true,
					enabled: true,
					editable: false
				};
			case 1:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					focusable: false,
					enabled: true
				};
			case 2:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					focusable: true,
					enabled: false,
					children: [{description: "CHILD1"}, {description: "CHILD2"}]
				};
			case 3:
				return {
					type: "TYPE_" + this.getText(),
					description: "DESCRIPTION_" + this.getText(),
					focusable: true,
					enabled: true
				};
			default:
				return null;
		}
	}
});

sap.ui.table.TableHelper = {
	createLabel: function(mConfig){ return new TestControl(mConfig); },
	createTextView: function(mConfig){ return new TestControl(mConfig); },
	createTextField: function(mConfig){ throw new Error("no TextField control available!"); },
	createImage: function(mConfig){ return new TestControl(mConfig); },
	addTableClass: function() { return "sapUiTableM"; },
	bFinal: true
};

var oTable = new sap.ui.table.Table({
	rows: "{/rows}",
	title: "TABLE_TITLE",
	selectionMode: "MultiToggle",
	visibleRowCount: 3,
	ariaLabelledBy: "ARIALABELLEDBY",
	fixedColumnCount: 1
});

var oTreeTable = new sap.ui.table.TreeTable({
	rows: {
		path: "/tree",
		parameters: {arrayNames:["rows"]}
	},
	title: "TABLE_TITLE",
	selectionMode: "Single",
	visibleRowCount: 3,
	ariaLabelledBy: "ARIALABELLEDBY"
});

var aFields = ["A", "B", "C", "D", "E"];
var oData = {rows: [], tree: {rows: []}};
var oRow;
for (var i = 0; i < 5; i++) {
	oRow = {};
	oTree = {rows: [{}]};
	for (var j = 0; j < aFields.length; j++) {
		oRow[aFields[j]] = aFields[j] + (i+1);
		oTree[aFields[j]] = aFields[j] + (i+1);
		oTree.rows[0][aFields[j]] = aFields[j] + "SUB" + (i+1);
		if (i == 0) {
			oTable.addColumn(new sap.ui.table.Column({
				label: aFields[j] + "_TITLE",
				width: "100px",
				template: new TestControl({
					text: "{" + aFields[j] + "}",
					index: j,
					visible: j!=3
				})
			}));
			oTreeTable.addColumn(new sap.ui.table.Column({
				label: aFields[j] + "_TITLE",
				width: "100px",
				template: new TestControl({
					text: "{" + aFields[j] + "}"
				})
			}));
		}
	}
	oData.rows.push(oRow);
	oData.tree.rows.push(oTree);
}

jQuery.sap.require("sap.ui.model.json.JSONModel");
var oModel = new sap.ui.model.json.JSONModel();
oModel.setData(oData);
oTable.setModel(oModel);
oTable.setSelectedIndex(0);
oTable.placeAt("content");
oTreeTable.setModel(oModel);
oTreeTable.placeAt("content");

var oColumn = oTable.getColumns()[1];
oColumn.setSortProperty(aFields[1]);
oColumn.setFilterProperty(aFields[1]);
oColumn.setSortOrder("Ascending");
oColumn.setSorted(true);
oColumn.setFiltered(true);

//************************************************************************
// Helper Functions
//************************************************************************

function getCell(iRow, iCol, bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + iRow + "-col" + iCol);
	if (bFocus) {
		oCell.focus();
		assert.ok(oCell === document.activeElement, "Cell [" + iRow + ", " + iCol + "] focused");
	} else {
		assert.ok(oCell != document.activeElement, "Cell [" + iRow + ", " + iCol + "] not focused");
	}
	return jQuery(oCell);
}

function getColumnHeader(iCol, bFocus, assert) {
	var oCell = jQuery.sap.domById((oTable.getColumns()[iCol]).getId());
	if (bFocus) {
		oCell.focus();
		assert.ok(oCell === document.activeElement, "Column Header " + iCol + " focused");
	} else {
		assert.ok(oCell != document.activeElement, "Column Header " + iCol + " not focused");
	}
	return jQuery(oCell);
}

function getRowHeader(iRow, bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-rowsel" + iRow);
	if (bFocus) {
		oCell.focus();
		assert.ok(oCell === document.activeElement, "Row Header " + iRow + " focused");
	} else {
		assert.ok(oCell != document.activeElement, "Row Header " + iRow + " not focused");
	}
	return jQuery(oCell);
}

function getSelectAll(bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-selall");
	if (bFocus) {
		oCell.focus();
		assert.ok(oCell === document.activeElement, "Select All focused");
	} else {
		assert.ok(oCell != document.activeElement, "Select All not focused");
	}
	return jQuery(oCell);
}

function setFocusOutsideOfTable() {
	var oOuterElement = jQuery.sap.domById("outerelement");
	oOuterElement.focus();
	assert.ok(oOuterElement === document.activeElement, "Outer element focused");
}

function fakeGroupRow(iRow) {
	var oRow = oTable.getRows()[iRow];
	var $Row = oTable.$("rows-row" + iRow);
	var $RowFixed = oTable.$("rows-row" + iRow + "-fixed");
	var $RowHdr = oTable.$("rowsel" + iRow);

	$Row.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	$RowFixed.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	$RowHdr.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	oTable._getAccExtension().updateAriaForAnalyticalRow(oRow, $Row, $RowHdr, $RowFixed, true, true, 1);
	return {
		row: $Row,
		fixed: $RowFixed,
		hdr: $RowHdr
	};
}

function fakeSumRow(iRow) {
	var oRow = oTable.getRows()[iRow];
	var $Row = oTable.$("rows-row" + iRow);
	var $RowFixed = oTable.$("rows-row" + iRow + "-fixed");
	var $RowHdr = oTable.$("rowsel" + iRow);

	$Row.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	$RowFixed.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	$RowHdr.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	oTable._getAccExtension().updateAriaForAnalyticalRow(oRow, $Row, $RowHdr, $RowFixed, false, false, 1);
	return {
		row: $Row,
		fixed: $RowFixed,
		hdr: $RowHdr
	};
}


//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);



QUnit.module("Data Cells");

function testAriaLabelsForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
	var mParams = mParams || {};
	var bFirstTime = !!mParams.firstTime;
	var bRowChange = !!mParams.rowChange;
	var bColChange = !!mParams.colChange;
	var bGroup = !!mParams.group;
	var bSum = !!mParams.sum;

	var aLabels = [];
	if (bFirstTime) {
		aLabels.push("ARIALABELLEDBY");
		aLabels.push(oTable.getId() + "-ariadesc");
		aLabels.push(oTable.getId() + "-ariacount");
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

	aLabels.push(oColumn.getId());

	if (iIndex == 0) {
		aLabels.push(oTable.getId() + "-ariafixedcolumn");
	}

	if (!bGroup || iIndex != 0) {
		if (iIndex == 4) {
			aLabels.push(oCell.getId());
		} else {
			aLabels.push(oTable.getId() + "-cellacc");
		}
	}

	assert.strictEqual(
		($Cell.attr("aria-labelledby") || "").trim(),
		aLabels.join(" "),
		"aria-labelledby of cell [" + iRow + ", " + iCol + "]"
	);

	assert.strictEqual(
		($Cell.attr("headers") || "").trim(),
		oTable.getId() + "_col" + iCol,
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
	var oColumn = oTable._getVisibleColumns()[iCol];
	var oRow = oTable.getRows()[iRow];
	var oCell = oRow.getCells()[iCol];
	var iIndex = oCell.getIndex();

	aLabels.push(oColumn.getId());
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
		oTable.getId() + "_col" + iCol,
		"headers attribute of cell [" + iRow + ", " + iCol + "]"
	);
}

function testACCInfoForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
	var mParams = mParams || {};
	var oColumn = oTable._getVisibleColumns()[iCol];
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
		aExpected.push(sap.ui.getCore().getLibraryResourceBundle("sap.ui.table").getText("TBL_CTRL_STATE_READONLY"));
	}
	if (iIndex == 2) {
		aExpected.push(sap.ui.getCore().getLibraryResourceBundle("sap.ui.table").getText("TBL_CTRL_STATE_DISABLED"));
		aExpected.push("CHILD1 CHILD2");
	}

	var sExpected = aExpected.length ? aExpected.join(" ") : "";
	assert.strictEqual(sText, sExpected, "ACC Info description of cell [" + iRow + ", " + iCol + "]");
}

function testAriaDescriptionsForFocusedDataCell($Cell, iRow, iCol, assert, mParams) {
	var mParams = mParams || {};
	var bFirstTime = !!mParams.firstTime;
	var bRowChange = !!mParams.rowChange;
	var bColChange = !!mParams.colChange;
	var bGroup = !!mParams.group;

	var aDescriptions = [];

	var oColumn = oTable._getVisibleColumns()[iCol];
	var oRow = oTable.getRows()[iRow];
	var oCell = oRow.getCells()[iCol];
	var iIndex = oCell.getIndex();

	if ((iIndex == 0 && !bGroup) || iIndex == 2 || iIndex == 4) {
		aDescriptions.push(oTable.getId() + "-toggleedit");
	}

	assert.strictEqual(
		($Cell.attr("aria-describedby") || "").trim(),
		aDescriptions.join(" "),
		"aria-describedby of cell [" + iRow + ", " + iCol + "]"
	);
}

QUnit.asyncTest("aria-labelledby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true});
	}
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true});
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForNonFocusedDataCell($Cell, 1, aFields.length - 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.test("aria-labelledby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, false, assert);
		testAriaLabelsForNonFocusedDataCell($Cell, 0, i, assert);
	}
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, false, assert);
		testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert);
	}
	setFocusOutsideOfTable();
});

QUnit.asyncTest("ACCInfo", function(assert) {
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, true, assert);
		testACCInfoForFocusedDataCell($Cell, 0, i, assert);
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForNonFocusedDataCell($Cell, 0, aFields.length - 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.asyncTest("aria-describedby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, true, assert);
		testAriaDescriptionsForFocusedDataCell($Cell, 0, i, assert, {firstTime: i == 0, colChange: true});
	}
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, true, assert);
		testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {rowChange: i == 0, colChange: true});
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + (aFields.length - 1) + "]");
		QUnit.start();
	}, 100);
});

QUnit.test("aria-describedby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, false, assert);
		assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [0, " + i + "]");
	}
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, false, assert);
		assert.ok(!$Cell.attr("aria-describedby"), "No aria-describedby on cell [1, " + i + "]");
	}
	setFocusOutsideOfTable();
});

QUnit.asyncTest("Grouping Row", function(assert) {
	var oRefs = fakeGroupRow(1);

	assert.strictEqual(oRefs.row.attr("aria-expanded"), "true", "aria-expanded set on group row");
	assert.strictEqual(oRefs.row.attr("aria-level"), "2", "aria-level set on group row");
	assert.strictEqual(oRefs.fixed.attr("aria-expanded"), "true", "aria-expanded set on group row (fixed)");
	assert.strictEqual(oRefs.fixed.attr("aria-level"), "2", "aria-level set on group row (fixed)");

	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, false, assert);
		assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell group row");
		testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {group: true});
	}

	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, group: true});
		testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, group: true});
	}

	oTable.rerender();
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForNonFocusedDataCell($Cell, 1, aFields.length - 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.asyncTest("Sum Row", function(assert) {
	var oRefs = fakeSumRow(1);

	assert.strictEqual(oRefs.row.attr("aria-level"), "2", "aria-level set on group row");
	assert.strictEqual(oRefs.fixed.attr("aria-level"), "2", "aria-level set on group row (fixed)");

	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, false, assert);
		assert.strictEqual($Cell.attr("aria-describedby") || "", "", "aria-describedby not set on data cell sum row");
		testAriaLabelsForNonFocusedDataCell($Cell, 1, i, assert, {sum: true});
	}

	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, true, assert);
		testAriaLabelsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, sum: true});
		testAriaDescriptionsForFocusedDataCell($Cell, 1, i, assert, {firstTime: i == 0, colChange: true, sum: true});
	}

	oTable.rerender();
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForNonFocusedDataCell($Cell, 1, aFields.length - 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.test("Other ARIA Attributes of Data Cell", function(assert) {
	var $Elem = oTable.$("rows-row0-col0");
	assert.strictEqual($Elem.attr("role"), "gridcell" , "role");
	$Elem = oTreeTable.$("rows-row0-col0");
	assert.strictEqual($Elem.attr("role"), "gridcell" , "role");
	assert.strictEqual($Elem.attr("aria-level"), "1" , "aria-level");
	assert.strictEqual($Elem.attr("aria-expanded"), "false" , "aria-expanded");
	$Elem = oTreeTable.$("rows-row0-col1");
	assert.strictEqual($Elem.attr("role"), "gridcell" , "role");
	assert.ok(!$Elem.attr("aria-level"), "aria-level");
	assert.ok(!$Elem.attr("aria-expanded"), "aria-expanded");
});



QUnit.module("Column Header");

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
	}

	if (bFocus) {
		aLabels.push(oTable.getId() + "-colnumberofcols");
	}

	var oColumn = oTable._getVisibleColumns()[iCol];

	aLabels.push(oColumn.getId());

	if (iCol == 0) {
		aLabels.push(oTable.getId() + "-ariafixedcolumn");
	}

	if (iCol == 1) {
		aLabels.push(oTable.getId() + "-ariacolsortedasc");
		aLabels.push(oTable.getId() + "-ariacolfiltered");
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

QUnit.asyncTest("aria-labelledby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getColumnHeader(i, true, assert);
		testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true, focus: true});
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForColumnHeader($Cell, aFields.length - 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.test("aria-labelledby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getColumnHeader(i, false, assert);
		testAriaLabelsForColumnHeader($Cell, i, assert, {firstTime: i == 0, colChange: true});
	}
	setFocusOutsideOfTable();
});

QUnit.asyncTest("aria-describedby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getColumnHeader(i, true, assert);
		assert.strictEqual(
			($Cell.attr("aria-describedby") || "").trim(),
			i == 1 ? oTable.getId() + "-ariacolmenu" : "",
			"aria-describedby of column header " + i
		);
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		QUnit.start();
	}, 100);
});

QUnit.test("aria-describedby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getColumnHeader(i, false, assert);
		assert.strictEqual(
			($Cell.attr("aria-describedby") || "").trim(),
			i == 1 ? oTable.getId() + "-ariacolmenu" : "",
			"aria-describedby of column header " + i
		);
	}
	setFocusOutsideOfTable();
});

QUnit.test("Other ARIA Attributes of Column Header", function(assert) {
	var $Elem = oTable.getColumns()[0].$();
	assert.strictEqual($Elem.attr("role"), "columnheader" , "role");
	assert.ok(!$Elem.attr("aria-haspopup"), "aria-haspopup");
	assert.ok(!$Elem.attr("aria-sort"), "aria-sort");
	$Elem = oTable.getColumns()[1].$();
	assert.strictEqual($Elem.attr("role"), "columnheader" , "role");
	assert.strictEqual($Elem.attr("aria-haspopup"), "true" , "aria-haspopup");
	assert.strictEqual($Elem.attr("aria-sort"), "ascending" , "aria-sort");
});



QUnit.module("Row Header");

function testAriaLabelsForRowHeader($Cell, iRow, assert, mParams) {
	var mParams = mParams || {};
	var bFirstTime = !!mParams.firstTime;
	var bFocus = !!mParams.focus;
	var bRowChange = !!mParams.rowChange;
	var bGroup = !!mParams.group;
	var bSum = !!mParams.sum;

	var aLabels = [];
	if (bFirstTime && bFocus) {
		aLabels.push("ARIALABELLEDBY");
		aLabels.push(oTable.getId() + "-ariadesc");
		aLabels.push(oTable.getId() + "-ariacount");
	}

	aLabels.push(oTable.getId() + "-ariarowheaderlabel");

	if (bFocus) {
		aLabels.push(oTable.getId() + "-rownumberofrows");
		if (iRow == 0) {
			aLabels.push(oTable.getId() + "-ariarowselected");
		}
		if (bGroup) {
			aLabels.push(oTable.getId() + "-ariarowgrouplabel");
		} else if (bSum) {
			aLabels.push(oTable.getId() + "-ariagrouptotallabel");
		} else {
			aLabels.push(oTable.getId() + "-rows-row" + iRow + "-rowselecttext");
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

QUnit.asyncTest("aria-labelledby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < 2; i++) {
		$Cell = getRowHeader(i, true, assert);
		testAriaLabelsForRowHeader($Cell, i, assert, {firstTime: i == 0, rowChange: true, focus: true});
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForRowHeader($Cell, 2, assert);
		QUnit.start();
	}, 100);
});

QUnit.test("aria-labelledby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < 2; i++) {
		$Cell = getRowHeader(i, false, assert);
		testAriaLabelsForRowHeader($Cell, i, assert, {rowChange: true});
	}
	setFocusOutsideOfTable();
});

QUnit.asyncTest("aria-describedby with Focus", function(assert) {
	var $Cell;
	for (var i = 0; i < 2; i++) {
		$Cell = getRowHeader(i, true, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
	}
	setFocusOutsideOfTable();
	setTimeout(function() {
		QUnit.start();
	}, 100);
});

QUnit.test("aria-describedby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell;
	for (var i = 0; i < 2; i++) {
		$Cell = getRowHeader(i, false, assert);
		assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of row header " + i);
	}
	setFocusOutsideOfTable();
});

QUnit.asyncTest("Grouping Row", function(assert) {
	var oRefs = fakeGroupRow(1);

	assert.strictEqual(oRefs.hdr.attr("aria-expanded"), "true", "aria-expanded set on group row header");
	assert.strictEqual(oRefs.hdr.attr("aria-level"), "2", "aria-level set on group row header");
	assert.strictEqual(oRefs.hdr.attr("aria-haspopup"), "true", "aria-haspopup set on group row header");

	var $Cell = getRowHeader(1, false, assert);
	testAriaLabelsForRowHeader($Cell, 1, assert, {group: true});
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");
	$Cell = getRowHeader(1, true, assert);
	testAriaLabelsForRowHeader($Cell, 1, assert, {group: true, focus: true, firstTime: true});
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

	oTable.rerender();
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForRowHeader($Cell, 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.asyncTest("Sum Row", function(assert) {
	var oRefs = fakeSumRow(1);

	assert.strictEqual(oRefs.hdr.attr("aria-level"), "2", "aria-level set on sum row header");

	var $Cell = getRowHeader(1, false, assert);
	testAriaLabelsForRowHeader($Cell, 1, assert, {sum: true});
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");
	$Cell = getRowHeader(1, true, assert);
	testAriaLabelsForRowHeader($Cell, 1, assert, {sum: true, focus: true, firstTime: true});
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "", "aria-describedby of group row header");

	oTable.rerender();
	setFocusOutsideOfTable();
	setTimeout(function() {
		testAriaLabelsForRowHeader($Cell, 1, assert);
		QUnit.start();
	}, 100);
});

QUnit.test("Other ARIA Attributes of Row Header", function(assert) {
	var $Elem = oTable.$("rowsel0");
	assert.strictEqual($Elem.attr("aria-selected"), "true" , "aria-selected");
	$Elem = oTable.$("rowsel1");
	assert.strictEqual($Elem.attr("aria-selected"), "false" , "aria-selected");
});



QUnit.module("SelectAll");

QUnit.asyncTest("aria-labelledby with Focus", function(assert) {
	var sId = oTable.getId();
	var $Cell = getSelectAll(true, assert);
	assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
		"ARIALABELLEDBY " + sId + "-ariadesc " + sId + "-ariacount " + sId + "-ariacolrowheaderlabel " + sId + "-ariaselectall" , "aria-labelledby of select all");
	getRowHeader(0, true, assert); //set row header somewhere else on the table
	$Cell = getSelectAll(true, assert);
	assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
		sId + "-ariacolrowheaderlabel " + sId + "-ariaselectall" , "aria-labelledby of select all");
	setFocusOutsideOfTable();
	setTimeout(function() {
		QUnit.start();
	}, 100);
});

QUnit.test("aria-labelledby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell = getSelectAll(false, assert);
	assert.strictEqual(($Cell.attr("aria-labelledby") || "").trim(),
		oTable.getId() + "-ariacolrowheaderlabel " + oTable.getId() + "-ariaselectall" , "aria-labelledby of select all");
	setFocusOutsideOfTable();
});

QUnit.asyncTest("aria-describedby with Focus", function(assert) {
	var $Cell = getSelectAll(true, assert);
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "" , "aria-describedby of select all");
	setFocusOutsideOfTable();
	setTimeout(function() {
		QUnit.start();
	}, 100);
});

QUnit.test("aria-describedby without Focus", function(assert) {
	setFocusOutsideOfTable();
	var $Cell = getSelectAll(false, assert);
	assert.strictEqual(($Cell.attr("aria-describedby") || "").trim(), "" , "aria-describedby of select all");
	setFocusOutsideOfTable();
});



QUnit.module("Misc");

QUnit.test("ARIA Attributes of Tree Table Expand Icon", function(assert) {
	var $Elem = oTreeTable.$("rows-row0-col0").find(".sapUiTableTreeIcon");
	assert.strictEqual($Elem.attr("role"), "button" , "role");
});

QUnit.test("ARIA Attributes of Table Header", function(assert) {
	var $Elem = oTable.$().find(".sapUiTableHdr");
	assert.strictEqual($Elem.attr("role"), "heading" , "role");
});

QUnit.test("ARIA Attributes of Table Elements", function(assert) {
	var $Elem = oTable.$().find("table");
	$Elem.each(function(){
		assert.strictEqual(jQuery(this).attr("role"), "presentation" , "role");
	});
});

QUnit.test("ARIA Attributes of Content Element", function(assert) {
	var $Elem = oTable.$("sapUiTableCnt");
	assert.strictEqual($Elem.attr("role"), "grid" , "role");
	assert.strictEqual($Elem.attr("aria-multiselectable"), "true" , "aria-multiselectable");
	assert.strictEqual($Elem.attr("aria-labelledby"), oTable.getAriaLabelledBy() + " " + oTable.getTitle().getId() , "aria-labelledby");
	$Elem = oTreeTable.$("sapUiTableCnt");
	assert.strictEqual($Elem.attr("role"), "treegrid" , "role");
	assert.ok(!$Elem.attr("aria-multiselectable"), "aria-multiselectable");
});

QUnit.test("ARIA Attributes of TH Elements", function(assert) {
	var $Elem = oTable.$().find("th");
	$Elem.each(function(){
		var $TH = jQuery(this);
		assert.strictEqual($TH.attr("role"), "columnheader" , "role");
		assert.strictEqual($TH.attr("scope"), "col" , "scope");
		var oColumn = oTable.getColumns()[$TH.attr("data-sap-ui-headcolindex")];
		if (oColumn) {
			assert.strictEqual($TH.attr("aria-owns"), oColumn.getId() , "aria-owns");
			assert.strictEqual($TH.attr("aria-labelledby"), oColumn.getId() , "aria-labelledby");
		}
	});
});



QUnit.module("No Acc Mode");

QUnit.test("No Acc Mode", function(assert) {
	oTable._getAccExtension()._accMode = false;
	oTable.invalidate();
	sap.ui.getCore().applyChanges();

	var sHtml = oTable.$().html();
	assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM");

	var $Cell;
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(0, i, true, assert);
		assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM on focus of cell [0, " + i + "]");
	}
	for (var i = 0; i < aFields.length; i++) {
		$Cell = getCell(1, i, true, assert);
		assert.ok(sHtml.indexOf("aria") < 0, "No ACC related information in DOM on focus of cell [1, " + i + "]");
	}

	oTable._getAccExtension()._accMode = true;
	oTable.invalidate();
	sap.ui.getCore().applyChanges();
});



QUnit.module("Destruction");

QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getAccExtension();
	oTable.destroy();
	oTreeTable.destroy();
	assert.ok(!oExtension._table, "Table cleared");
});