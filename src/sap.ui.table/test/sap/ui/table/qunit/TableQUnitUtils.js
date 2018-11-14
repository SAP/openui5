
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem"
], function (JSONModel, Control, Table, TreeTable, Column, RowAction, RowActionItem) {
	"use strict";

	var oTable, oTreeTable;
	var oModel = new JSONModel();
	var aFields = ["A", "B", "C", "D", "E"];
	var iNumberOfRows = 8;

	//************************************************************************
	// Preparation Code
	//************************************************************************

	var TestControl = Control.extend("sap.ui.table.test.TestControl", {
		metadata: {
			properties: {
				"text": "string",
				"src": "sap.ui.core.URI",
				"alt": "string",
				"visible": {type: "boolean", defaultValue: true},
				"focusable": {type: "boolean", defaultValue: false},
				"tabbable": {type: "boolean", defaultValue: false},
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
			if (oControl.getTabbable()) {
				oRm.writeAttribute("tabindex", "0");
			} else if (oControl.getFocusable()) {
				oRm.writeAttribute("tabindex", "-1");
			}
			if (!oControl.getVisible()) {
				oRm.addStyle("display", "none");
				oRm.writeStyles();
			}
			oRm.write(">");
			oRm.writeEscaped(oControl.getText() || oControl.getAlt() || "");
			oRm.write("</span>");
		}
	});

	var TestInputControl = Control.extend("sap.ui.table.test.TestInputControl", {
		metadata: {
			properties: {
				"text": "string",
				"visible": {type: "boolean", defaultValue: true},
				"tabbable": {type: "boolean", defaultValue: false},
				"index": "int", // Results in different behavior of the control in different columns.
				"type": "string"
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: function (oRm, oControl) {
			oRm.write("<input");
			oRm.writeControlData(oControl);
			oRm.writeAttribute("type", oControl.getType() || "text");
			oRm.writeAttribute("value", oControl.getText() || "");
			if (oControl.getTabbable()) {
				oRm.writeAttribute("tabindex", "0");
			}
			if (!oControl.getVisible()) {
				oRm.addStyle("display", "none");
				oRm.writeStyles();
			}
			oRm.write(">");
		}
	});

	sap.ui.table.TableHelper = {
		createLabel: function (mConfig) {
			return new TestControl(mConfig);
		},
		createTextView: function (mConfig) {
			return new TestControl(mConfig);
		},
		addTableClass: function () {
			return "sapUiTableTest";
		},
		bFinal: true
	};

	var TableQUnitUtils = { // TBD: Move global functions to this object
		getTestControl: function() {
			return TestControl;
		},

		getTestInputControl: function() {
			return TestInputControl;
		},

		/**
		 * Adds a column to the tested table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {string} sTitle The label of the column.
		 * @param {string} sText The text of the column template.
		 * @param {boolean} bInputElement If set to <code>true</code>, the column template will be an input element, otherwise a span.
		 * @param {boolean} bFocusable If set to <code>true</code>, the column template will focusable. Only relevant, if <code>bInputElement</code>
		 *                             is set to true.
		 * @param {boolean} bTabbable If set to <code>true</code>, the column template will be tabbable.
		 * @param {string} sInputType The type of the input element. Only relevant, if <code>bInputElement</code> is set to true.
		 * @param {boolean} [bBindText=true] If set to <code>true</code>, the text property will be bound to the value of <code>sText</code>.
		 * @returns {sap.ui.table.Column} The added column.
		 */
		addColumn: function(oTable, sTitle, sText, bInputElement, bFocusable, bTabbable, sInputType, bBindText) {
			if (bBindText == null) {
				bBindText = true;
			}

			var oControlTemplate;

			if (bInputElement) {
				oControlTemplate = new TestInputControl({
					text: bBindText ? "{" + sText + "}" : sText,
					index: oTable.getColumns().length,
					visible: true,
					tabbable: bTabbable,
					type: sInputType
				});
			} else {
				oControlTemplate = new TestControl({
					text: bBindText ? "{" + sText + "}" : sText,
					index: oTable.getColumns().length,
					visible: true,
					focusable: bFocusable,
					tabbable: bFocusable && bTabbable
				});
			}

			var oColumn = new Column({
				label: sTitle,
				width: "100px",
				template: oControlTemplate
			});
			oTable.addColumn(oColumn);

			for (var i = 0; i < iNumberOfRows; i++) {
				oTable.getModel().getData().rows[i][sText] = sText + (i + 1);
			}

			return oColumn;
		}
	};

	[Table, TreeTable].forEach(function(TableClass) {
		Object.defineProperty(TableClass.prototype, "columnCount", {
			get: function() {
				return this.getColumns().length;
			}
		});
	});

	window.oModel = oModel;
	window.aFields = aFields;
	window.iNumberOfRows = iNumberOfRows;

	window.createTables = function(bSkipPlaceAt, bFocusableCellTemplates) {
		oTable = new Table({
			rows: "{/rows}",
			title: "Grid Table",
			selectionMode: "MultiToggle",
			visibleRowCount: 3,
			ariaLabelledBy: "ARIALABELLEDBY",
			fixedColumnCount: 1
		});
		window.oTable = oTable;

		oTreeTable = new TreeTable({
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
					oTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						tooltip: j == 2 ? aFields[j] + "_TOOLTIP" : null,
						template: new TestControl({
							text: "{" + aFields[j] + "}",
							index: j,
							visible: j != 3,
							tabbable: !!bFocusableCellTemplates
						})
					}));
					oTreeTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						template: new TestControl({
							text: "{" + aFields[j] + "}",
							index: j,
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

		assert.deepEqual(document.activeElement, $Element[0], "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

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
		var oRowAction = new RowAction();
		var aActions = [{type: "Navigation"}, {type: "Delete"}, {icon: "sap-icon://search", text: "Inspect"}];
		for (var i = 0; i < Math.min(iNumberOfActions, 3); i++) {
			var oItem = new RowActionItem({
				icon: aActions[i].icon,
				text: aActions[i].text,
				type: aActions[i].type || "Custom"
			});
			oRowAction.addItem(oItem);
		}
		oTable.setRowActionTemplate(oRowAction);
		sap.ui.getCore().applyChanges();
	};

	return TableQUnitUtils;
});