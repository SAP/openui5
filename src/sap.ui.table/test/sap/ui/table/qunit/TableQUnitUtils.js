(function () {
	"use strict";

	//************************************************************************
	// Preparation Code
	//************************************************************************

	sap.ui.core.Control.extend("sap.ui.table.test.TestControl", {
		metadata: {
			properties: {
				"text": "string",
				"src": "sap.ui.core.URI",
				"alt": "string",
				"visible": "boolean",
				"focusable": "boolean",
				"tabbable": "boolean",
				"index": "int", // Results in different behavior of the control in different columns.
				"width": "sap.ui.core.CSSSize" // Table sets "width" for the title text.
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: function (oRm, oControl) {
			oRm.write("<span");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			if (oControl.getTabbable()) {
				oRm.writeAttribute("tabindex", "0");
			} else if (oControl.getFocusable()) {
				oRm.writeAttribute("tabindex", "-1");
			}
			oRm.write(">");
			oRm.writeEscaped(oControl.getText() || oControl.getAlt() || "");
			oRm.write("</span>");
		}
	});

	sap.ui.core.Control.extend("sap.ui.table.test.TestInputControl", {
		metadata: {
			properties: {
				"text": "string",
				"visible": "boolean",
				"tabbable": "boolean",
				"index": "int", // Results in different behavior of the control in different columns.
				"type": "string"
			}
		},

		renderer: function (oRm, oControl) {
			oRm.write("<input");
			oRm.writeControlData(oControl);
			oRm.writeAttribute("type", oControl.getType() || "text");
			oRm.writeAttribute("value", oControl.getText() || "");
			oRm.writeClasses();
			if (oControl.getTabbable()) {
				oRm.writeAttribute("tabindex", "0");
			}
			oRm.write(">");
		}
	});

	sap.ui.table.TableHelper = {
		createLabel: function (mConfig) {
			return new sap.ui.table.test.TestControl(mConfig);
		},
		createTextView: function (mConfig) {
			return new sap.ui.table.test.TestControl(mConfig);
		},
		addTableClass: function () {
			return "sapUiTableTest";
		},
		bFinal: true
	};


	var oTable, oTreeTable;
	jQuery.sap.require("sap.ui.model.json.JSONModel");

	var oModel = new sap.ui.model.json.JSONModel();
	window.oModel = oModel;

	var aFields = ["A", "B", "C", "D", "E"];
	var iNumberOfRows = 8;
	var iNumberOfCols = aFields.length;
	window.aFields = aFields;
	window.iNumberOfRows = iNumberOfRows;
	window.iNumberOfCols = iNumberOfCols;

	window.createTables = function(bSkipPlaceAt, bFocusableCellTemplates) {
		oTable = new sap.ui.table.Table({
			rows: "{/rows}",
			title: "Grid Table",
			selectionMode: "MultiToggle",
			visibleRowCount: 3,
			ariaLabelledBy: "ARIALABELLEDBY",
			fixedColumnCount: 1
		});
		window.oTable = oTable;

		oTreeTable = new sap.ui.table.TreeTable({
			rows: {
				path: "/tree",
				parameters: {arrayNames: ["rows"]}
			},
			title: "Tree Table",
			selectionMode: "Single",
			visibleRowCount: 3,
			groupHeaderProperty: aFields[0],
			ariaLabelledBy: "ARIALABELLEDBY"
		});
		window.oTreeTable = oTreeTable;

		var oData = {rows: [], tree: {rows: []}};
		var oRow;
		var oTree;
		for (var i = 0; i < iNumberOfRows; i++) {
			oRow = {};
			oTree = {rows: [{}]};
			for (var j = 0; j < aFields.length; j++) {
				oRow[aFields[j]] = aFields[j] + (i + 1);
				oTree[aFields[j]] = aFields[j] + (i + 1);
				oTree.rows[0][aFields[j]] = aFields[j] + "SUB" + (i + 1);
				if (i == 0) {
					oTable.addColumn(new sap.ui.table.Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						tooltip: j == 2 ? aFields[j] + "_TOOLTIP" : null,
						template: new sap.ui.table.test.TestControl({
							text: "{" + aFields[j] + "}",
							index: j,
							visible: j != 3,
							tabbable: !!bFocusableCellTemplates
						})
					}));
					oTreeTable.addColumn(new sap.ui.table.Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						template: new sap.ui.table.test.TestControl({
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
			oTable.placeAt("qunit-fixture");
			oTreeTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		}
	};

	window.destroyTables = function() {
		oTable.destroy();
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	};


	//************************************************************************
	// Helper Functions
	//************************************************************************


	window.getCell = function(iRow, iCol, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rows-row" + iRow + "-col" + iCol);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Cell [" + iRow + ", " + iCol + "] focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Cell [" + iRow + ", " + iCol + "] not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getColumnHeader = function(iCol, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById((oTableInstance._getVisibleColumns()[iCol]).getId());
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Column Header " + iCol + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Column Header " + iCol + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getRowHeader = function(iRow, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowsel" + iRow);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Row Header " + iRow + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Row Header " + iRow + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getRowAction = function(iRow, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowact" + iRow);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Row Action " + iRow + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Row Action " + iRow + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getSelectAll = function(bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-selall");
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Select All focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Select All not focused");
			}
		}
		return jQuery(oCell);
	};

	window.setFocusOutsideOfTable = function(assert, sId) {
		sId = sId || "outerelement";
		var oOuterElement = jQuery.sap.domById(sId);
		oOuterElement.focus();
		assert.deepEqual(oOuterElement, document.activeElement, "Outer element with id '" + sId + "' focused");
		return jQuery(oOuterElement);
	};

	/**
	 * Check whether an element is focused.
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @param {Object} assert QUnit assert object.
	 * @returns {jQuery} A jQuery object containing the active element.
	 */
	window.checkFocus = function(oElement, assert) {
		var $ActiveElement = jQuery(document.activeElement);
		var $Element = jQuery(oElement);

		assert.deepEqual($Element[0], document.activeElement, "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	};

	window.fakeGroupRow = function(iRow) {
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
	};

	window.fakeSumRow = function(iRow) {
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
	};

	window.initRowActions = function(oTable, iCount, iNumberOfActions) {
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
	};

}());