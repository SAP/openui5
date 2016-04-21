
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

var oTable, oTreeTable;
jQuery.sap.require("sap.ui.model.json.JSONModel");
var oModel = new sap.ui.model.json.JSONModel();
var iNumberOfRows = 5;
var iNumberOfCols = 5;

function createTables() {
	oTable = new sap.ui.table.Table({
		rows: "{/rows}",
		title: "TABLE_TITLE",
		selectionMode: "MultiToggle",
		visibleRowCount: 3,
		ariaLabelledBy: "ARIALABELLEDBY",
		fixedColumnCount: 1
	});

	oTreeTable = new sap.ui.table.TreeTable({
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
	iNumberOfCols = aFields.length;
	var oData = {rows: [], tree: {rows: []}};
	var oRow;
	for (var i = 0; i < iNumberOfRows; i++) {
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

	oModel.setData(oData);
	oTable.setModel(oModel);
	oTable.setSelectedIndex(0);
	oTable.placeAt("content");
	oTreeTable.setModel(oModel);
	oTreeTable.placeAt("content");
	sap.ui.getCore().applyChanges();
}

function destroyTables() {
	oTable.destroy();
	oTable = null;
	oTreeTable.destroy();
	oTreeTable = null;
}

//************************************************************************
// Helper Functions
//************************************************************************

function getCell(iRow, iCol, bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + iRow + "-col" + iCol);
	if (bFocus) {
		oCell.focus();
	}
	if (assert) {
		if (bFocus) {
			assert.ok(oCell === document.activeElement, "Cell [" + iRow + ", " + iCol + "] focused");
		} else {
			assert.ok(oCell != document.activeElement, "Cell [" + iRow + ", " + iCol + "] not focused");
		}
	}
	return jQuery(oCell);
}

function getColumnHeader(iCol, bFocus, assert) {
	var oCell = jQuery.sap.domById((oTable.getColumns()[iCol]).getId());
	if (bFocus) {
		oCell.focus();
	}
	if (assert) {
		if (bFocus) {
			assert.ok(oCell === document.activeElement, "Column Header " + iCol + " focused");
		} else {
			assert.ok(oCell != document.activeElement, "Column Header " + iCol + " not focused");
		}
	}
	return jQuery(oCell);
}

function getRowHeader(iRow, bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-rowsel" + iRow);
	if (bFocus) {
		oCell.focus();
	}
	if (assert) {
		if (bFocus) {
			assert.ok(oCell === document.activeElement, "Row Header " + iRow + " focused");
		} else {
			assert.ok(oCell != document.activeElement, "Row Header " + iRow + " not focused");
		}
	}
	return jQuery(oCell);
}

function getSelectAll(bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-selall");
	if (bFocus) {
		oCell.focus();
	}
	if (assert) {
		if (bFocus) {
			assert.ok(oCell === document.activeElement, "Select All focused");
		} else {
			assert.ok(oCell != document.activeElement, "Select All not focused");
		}
	}
	return jQuery(oCell);
}

function setFocusOutsideOfTable() {
	var oOuterElement = jQuery.sap.domById("outerelement");
	oOuterElement.focus();
	assert.ok(oOuterElement === document.activeElement, "Outer element focused");
}

function checkFocus(oCell, assert) {
	assert.ok(oCell === document.activeElement || oCell.get(0) === document.activeElement,
		"Focus is on the expected position: " + jQuery(oCell).attr("id") + " == " + jQuery(document.activeElement).attr("id"));
	return jQuery(document.activeElement);
}

function checkDelegateType(sExpectedType) {
	var oTbl = new sap.ui.table.Table();
	var oExt = oTbl._getKeyboardExtension();
	var sType = oExt._delegate && oExt._delegate.getMetadata ? oExt._delegate.getMetadata().getName() : null;
	oTbl.destroy();
	return sType == sExpectedType;
}

//************************************************************************
//Test Code
//************************************************************************


QUnit.module("KeyboardDelegate");


QUnit.test("Delegate Type", function(assert) {
	//TBD: Switch type when new keyboard spec is implemented
	assert.ok(checkDelegateType("sap.ui.table.TableKeyboardDelegate"), "Correct delegate");
});


if (checkDelegateType("sap.ui.table.TableKeyboardDelegate")) {

//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate
//************************************************************************

	QUnit.module("Item Navigation", {
		setup: function() {
			createTables();
		},
		teardown: function () {
			destroyTables();
		}
	});

	QUnit.test("Arrow keys", function(assert) {
		var $Focus = checkFocus(getCell(0, 0, true), assert);

		qutils.triggerKeydown($Focus, "ARROW_LEFT", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_LEFT", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_UP", false, false, false);
		$Focus = checkFocus(getSelectAll(false), assert);

		qutils.triggerKeydown($Focus, "ARROW_RIGHT", false, false, false);
		$Focus = checkFocus(getColumnHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_RIGHT", false, false, false);
		$Focus = checkFocus(getColumnHeader(1, false), assert);

		var oRow, iIdx;
		var iVisibleRowCount = oTable.getVisibleRowCount();

		for (var i = 0; i < iNumberOfRows; i++) {
			qutils.triggerKeydown($Focus, "ARROW_DOWN", false, false, false);
			iIdx = i >= iVisibleRowCount ? iVisibleRowCount - 1 : i;
			oRow = oTable.getRows()[iIdx];
			$Focus = checkFocus(getCell(iIdx, 1), assert);
			assert.equal(oRow.getIndex(), i, "Row index correct");
		}
	});


	QUnit.test("Home/End", function(assert) {
		var $Focus = checkFocus(getCell(0, 0, true), assert);

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "END", false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, "END", false, false, false);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		var oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		var iVisibleRowCount = oTable.getVisibleRowCount();

		qutils.triggerKeydown($Focus, "END", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(iVisibleRowCount - 1, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

		qutils.triggerKeydown($Focus, "HOME", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getCell(0, 1), assert); //First Non-Fixed Column

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "END", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getRowHeader(iVisibleRowCount - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");
	});


} else if (checkDelegateType("sap.ui.table.TableKeyboardDelegate2")) {

//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate2 (new Keyboard Behavior)
//************************************************************************

	QUnit.module("Item Navigation", {
		setup: function() {
			createTables();
		},
		teardown: function () {
			destroyTables();
		}
	});

	QUnit.test("TBD", function(assert) {
		assert.ok(false, "Not yet implemented");
	});

}
