
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
			"tabbable" : "boolean",
			"index" : "int", //Results in different behavior of the control in different columns
			"width" : "sap.ui.core.CSSSize" // Table sets "width" for the title text
		},
		associations : {
			"ariaLabelledBy" : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		}
	},

	renderer : function(oRm, oControl) {
		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		if (oControl.getTabbable()) {
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.write(">");
		oRm.writeEscaped(oControl.getText() || oControl.getAlt() || "");
		oRm.write("</span>");
	}
});

sap.ui.core.Control.extend("TestInputControl", {
	metadata : {
		properties : {
			"text" : "string",
			"visible" : "boolean",
			"tabbable" : "boolean",
			"index" : "int" //Results in different behavior of the control in different columns
		}
	},

	renderer : function(oRm, oControl) {
		oRm.write("<input");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("type", "text");
		oRm.writeAttribute("value", oControl.getText());
		oRm.writeClasses();
		if (!oControl.getTabbable()) {
			oRm.writeAttribute("tabindex", "-1");
		}
		oRm.write(">");
	}
});

sap.ui.table.TableHelper = {
	createLabel: function(mConfig){ return new TestControl(mConfig); },
	createTextView: function(mConfig){ return new TestControl(mConfig); },
	addTableClass: function() { return "sapUiTableTest"; },
	bFinal: true
};


var oTable, oTreeTable;
jQuery.sap.require("sap.ui.model.json.JSONModel");
var oModel = new sap.ui.model.json.JSONModel();

var aFields = ["A", "B", "C", "D", "E"];
var iNumberOfRows = 8;
var iNumberOfCols = aFields.length;


function createTables(bSkipPlaceAt, bFocusableCellTemplates) {
	oTable = new sap.ui.table.Table({
		rows: "{/rows}",
		title: "Grid Table",
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
		title: "Tree Table",
		selectionMode: "Single",
		visibleRowCount: 3,
		groupHeaderProperty: aFields[0],
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
					tooltip: j == 2 ? aFields[j] + "_TOOLTIP" : null,
					template: new TestControl({
						text: "{" + aFields[j] + "}",
						index: j,
						visible: j!=3,
						tabbable: !!bFocusableCellTemplates
					})
				}));
				oTreeTable.addColumn(new sap.ui.table.Column({
					label: aFields[j] + "_TITLE",
					width: "100px",
					template: new TestControl({
						text: "{" + aFields[j] + "}",
						tabbable: !!bFocusableCellTemplates
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
	oTreeTable.setModel(oModel);
	if (!bSkipPlaceAt) {
		oTable.placeAt("content");
		oTreeTable.placeAt("content");
		sap.ui.getCore().applyChanges();
	}
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


function getCell(iRow, iCol, bFocus, assert, oTableInstance) {
	if (oTableInstance == null) {
		oTableInstance = oTable;
	}

	var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rows-row" + iRow + "-col" + iCol);
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

function getColumnHeader(iCol, bFocus, assert, oTableInstance) {
	if (oTableInstance == null) {
		oTableInstance = oTable;
	}

	var oCell = jQuery.sap.domById((oTableInstance._getVisibleColumns()[iCol]).getId());
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

function getRowHeader(iRow, bFocus, assert, oTableInstance) {
	if (oTableInstance == null) {
		oTableInstance = oTable;
	}

	var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowsel" + iRow);
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

function getRowAction(iRow, bFocus, assert, oTableInstance) {
	if (oTableInstance == null) {
		oTableInstance = oTable;
	}

	var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowact" + iRow);
	if (bFocus) {
		oCell.focus();
	}
	if (assert) {
		if (bFocus) {
			assert.ok(oCell === document.activeElement, "Row Action " + iRow + " focused");
		} else {
			assert.ok(oCell != document.activeElement, "Row Action " + iRow + " not focused");
		}
	}
	return jQuery(oCell);
}

function getSelectAll(bFocus, assert, oTableInstance) {
	if (oTableInstance == null) {
		oTableInstance = oTable;
	}

	var oCell = jQuery.sap.domById(oTableInstance.getId() + "-selall");
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

function setFocusOutsideOfTable(sId) {
	sId = sId || "outerelement";
	var oOuterElement = jQuery.sap.domById(sId);
	oOuterElement.focus();
	assert.ok(oOuterElement === document.activeElement, "Outer element with id '" + sId + "' focused");
	return jQuery(oOuterElement);
}

function checkFocus(oCell, assert, bInside) {
	var activeElement = document.activeElement || document;
	var cell = oCell.get && oCell.get(0) || oCell;
	if (bInside) {
		assert.ok(cell !== activeElement && cell.contains(activeElement),
			"Focus is inside of the expected cell: " + cell.id + " is parent of " + activeElement.id);
	} else {
		assert.ok(cell === activeElement, "Focus is on the expected position: " + cell.id + " == " + activeElement.id);
	}
	return jQuery(activeElement);
}

function fakeGroupRow(iRow) {
	var oRow = oTable.getRows()[iRow];
	var $Row = oTable.$("rows-row" + iRow);
	var $RowFixed = oTable.$("rows-row" + iRow + "-fixed");
	var $RowHdr = oTable.$("rowsel" + iRow);
	var $RowAct = oTable.$("rowact" + iRow);

	$Row.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	$RowFixed.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	$RowHdr.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	$RowAct.toggleClass("sapUiTableGroupHeader", true).data("sap-ui-level", 1);
	oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, $Row, $RowHdr, $RowFixed, $RowAct, true, true, 1, null);
	return {
		row: $Row,
		fixed: $RowFixed,
		hdr: $RowHdr,
		act: $RowAct
	};
}

function fakeSumRow(iRow) {
	var oRow = oTable.getRows()[iRow];
	var $Row = oTable.$("rows-row" + iRow);
	var $RowFixed = oTable.$("rows-row" + iRow + "-fixed");
	var $RowHdr = oTable.$("rowsel" + iRow);
	var $RowAct = oTable.$("rowact" + iRow);

	$Row.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	$RowFixed.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	$RowHdr.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	$RowAct.toggleClass("sapUiAnalyticalTableSum", true).data("sap-ui-level", 1);
	oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, $Row, $RowHdr, $RowFixed, $RowAct, false, false, 1, null);
	return {
		row: $Row,
		fixed: $RowFixed,
		hdr: $RowHdr,
		act: $RowAct
	};
}

function initRowActions(oTable, iCount, iNumberOfActions) {
	oTable.setRowActionCount(iCount);
	var oRowAction = new sap.ui.table.RowAction();
	var aActions = [{type: "Navigation"}, {type: "Delete"}, {icon: "sap-icon://search", text: "Inspect"}];
	for (var i = 0; i < Math.min(iNumberOfActions, 3); i++) {
		var oItem = new sap.ui.table.RowActionItem({
			icon: aActions[i].icon,
			text: aActions[i].text,
			type: aActions[i].type || "Custom"
		});
		oRowAction.addItem(oItem);
	}
	oTable.setRowActionTemplate(oRowAction);
	sap.ui.getCore().applyChanges();
}