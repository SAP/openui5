/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (SandboxModel, Opa5, EnterText, Press) {
	"use strict";

	var mIcon2DrillState = {
			"sap-icon://collapse" : "expanded",
			"sap-icon://expand" : "collapsed",
			"sap-icon://e-care" : "leaf"
		},
		bTreeTable,
		sViewName = "sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy";

	function checkRow(oTable, bTreeTable0, mDefaults, oExpected, iRowIndex) {
		var oActual,
			aCells,
			sDrillState,
			aRows = oTable.getRows();

		if (iRowIndex >= aRows.length) {
			Opa5.assert.ok(false, "Row " + iRowIndex + " is missing");
			return;
		}

		aCells = aRows[iRowIndex].getCells();
		if (oExpected === null) {
			aCells.forEach(function (oCell, i) {
				// Note: don't care about invisible icon in 2nd column here
				strictEqual(oCell.getText ? oCell.getText() : oCell.getValue(), "",
					"Row " + iRowIndex + ", cell " + i + " is empty");
			});
			return;
		}

		if (bTreeTable0) {
			sDrillState = aCells[0].getBindingContext().getProperty("@$ui5.node.isExpanded");
			switch (sDrillState) {
				case true:
					sDrillState = "expanded";
					break;
				case false:
					sDrillState = "collapsed";
					break;
				case undefined:
					sDrillState = "leaf";
					break;
				default:
					// sDrillState now contains the wrong value, albeit not necessarily as a string
			}
		}

		oExpected = Object.assign({}, mDefaults, oExpected);
		oActual = bTreeTable0 ? {
			// Note: no good way to extract Level from aCells[0]'s indentation
			Level : parseInt(aCells[1].getText()),
			// Note: no stable way to extract DrillState from aCells[0]'s list of CSS classes
			DrillState : sDrillState,
			ID : aCells[0].getText(),
			MANAGER_ID : aCells[2].getText() || null,
			Name : aCells[3].getValue(),
			AGE : parseInt(aCells[4].getText().replace(",", ""))
		} : {
			Level : parseInt(aCells[0].getText()),
			DrillState : mIcon2DrillState[aCells[1].getIcon()],
			ID : aCells[2].getText(),
			MANAGER_ID : aCells[3].getText() || null,
			Name : aCells[4].getValue(),
			AGE : parseInt(aCells[5].getText().replace(",", ""))
		};
		strictEqual(oActual.Level, oExpected.DistanceFromRoot + 1,
			"Row " + iRowIndex + ": Level is " + oActual.Level);
		strictEqual(oActual.DrillState, oExpected.DrillState,
			"Row " + iRowIndex + ": DrillState is " + oActual.DrillState);
		strictEqual(oActual.ID, oExpected.ID,
			"Row " + iRowIndex + ": ID is " + oActual.ID);
		strictEqual(oActual.MANAGER_ID, oExpected.MANAGER_ID,
			"Row " + iRowIndex + ": Manager's ID is " + oActual.MANAGER_ID);
		strictEqual(oActual.Name, oExpected.Name,
			"Row " + iRowIndex + ": Name is " + oActual.Name);
		strictEqual(oActual.AGE, oExpected.AGE,
			"Row " + iRowIndex + ": Age is " + oActual.AGE);
	}

	function getTableId() {
		return bTreeTable ? "treeTable" : "table";
	}

	function getTableType() {
		return bTreeTable ? "sap.ui.table.TreeTable" : "sap.ui.table.Table";
	}

	function strictEqual(vActual, vExpected, sTitle) {
		if (vActual !== vExpected) {
			Opa5.assert.strictEqual(vActual, vExpected, sTitle);
		} // else: do not spam the output ;-)
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				createNewChild : function (iRow, sComment) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						errorMessage : `Could not create new child below row ${iRow}`,
						id : bTreeTable ? /createInTreeTable/ : /create/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function () {
							Opa5.assert.ok(true,
								`Create new child below row ${iRow}. ${sComment}`);
						},
						viewName : sViewName
					});
				},
				editName : function (iRow, sName, sComment) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sName}),
						controlType : "sap.m.Input",
						errorMessage : `Could not edit name in row ${iRow}`,
						id : bTreeTable ? /nameInTreeTable/ : /name/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function () {
							Opa5.assert.ok(true,
								`Entered name in row ${iRow} as "${sName}". ${sComment}`);
						},
						viewName : sViewName
					});
				},
				scrollToRow : function (iRow, sComment) {
					this.waitFor({
						actions : function (oTable) {
							oTable.setFirstVisibleRow(iRow);
						},
						controlType : getTableType(),
						errorMessage : "Could not select row " + iRow,
						id : getTableId(),
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
								"Scrolled table to row " + iRow + ". " + sComment);
						},
						viewName : sViewName
					});
				},
				synchronize : function (sComment) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : bTreeTable ? "synchronizeTreeTable" : "synchronize",
						success : function () {
							Opa5.assert.ok(true, "Synchronize (" + sComment + ")");
						},
						viewName : sViewName
					});
				},
				toggleExpandInRow : function (iRow, sComment) {
					if (bTreeTable) {
						this.waitFor({
							actions : function (oTable) {
								if (oTable.isExpanded(iRow)) {
									oTable.collapse(iRow);
								} else {
									oTable.expand(iRow);
								}
							},
							controlType : getTableType(),
							errorMessage : "Could not toggle Expand Button in row " + iRow,
							id : getTableId(),
							success : function () {
								Opa5.assert.ok(true, "Toggle Expand Button in row " + iRow
									+ ". " + sComment);
							},
							viewName : sViewName
						});
					} else {
						this.waitFor({
							actions : new Press(),
							controlType : "sap.m.Button",
							errorMessage : "Could not toggle Expand Button in row " + iRow,
							id : /expand/,
							matchers : function (oControl) {
								return oControl.getBindingContext().getIndex() === iRow;
							},
							success : function () {
								Opa5.assert.ok(true, "Toggle Expand Button in row " + iRow
									+ ". " + sComment);
							},
							viewName : sViewName
						});
					}
				}
			},
			assertions : {
				checkTable : function (aExpected, mDefaults) {
					var bTreeTable0 = bTreeTable; // remember current(!) value for later!

					this.waitFor({
						controlType : getTableType(),
						id : getTableId(),
						success : function (oTable) {
							SandboxModel.update(aExpected)
								.forEach(checkRow.bind(null, oTable, bTreeTable0, mDefaults));
						},
						viewName : sViewName
					});
				}
			}
		}
	});

	return {
		setTreeTable : function (bTreeTable0) {
			bTreeTable = bTreeTable0;
		}
	};
});
