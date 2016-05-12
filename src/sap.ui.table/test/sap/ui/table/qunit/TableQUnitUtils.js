
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

var aFields = ["A", "B", "C", "D", "E"];
var iNumberOfRows = 5;
var iNumberOfCols = aFields.length;


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
	var oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iCol]).getId());
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