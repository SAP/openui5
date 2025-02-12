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

	function checkRow(oTable, mDefaults, oExpected, iRowIndex) {
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
				if (oCell.getText || oCell.getValue) {
					strictEqual(oCell.getText?.() ?? oCell.getValue(), "",
						"Row " + iRowIndex + ", cell " + i + " is empty");
				} // else: don't care about invisible icon in 2nd column here (or button column)
			});
			return;
		}

		if (bTreeTable) {
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
		oActual = bTreeTable ? {
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

	function getTableAsString(oTable) {
		let sResult = "";

		for (const oRow of oTable.getRows()) {
			const oRowContext = oRow.getBindingContext();
			if (!oRowContext) {
				break; // empty row found, no more data to process
			}

			const bDrillState = oRowContext.getProperty("@$ui5.node.isExpanded");
			let sDrillState = "* "; // leaf by default
			if (bDrillState === true) {
				sDrillState = "- "; // expanded
			} else if (bDrillState === false) {
				sDrillState = "+ "; // collapsed
			}

			const iLevel = oRowContext.getProperty("@$ui5.node.level");
			const sID = oRow.getCells()[bTreeTable ? 0 : 2].getText();
			sResult += "\n" + "\t".repeat(iLevel - 1) + sDrillState + sID;
		}

		return sResult;
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

	function getIdOrRowDetails(vRowIndexOrId) {
		const bIsId = typeof vRowIndexOrId === "string";
		const sIsIdText = (bIsId ? "with ID " : "in row ") + vRowIndexOrId;
		const fnMatch = function (oControl) {
			return (bIsId)
				? oControl.getBindingContext()?.getProperty("ID") === vRowIndexOrId
				: oControl.getBindingContext().getIndex() === vRowIndexOrId;
		};

		return [bIsId, sIsIdText, fnMatch];
	}

	function pressButton(rButtonId, fnMatchers, sComment) {
		this.waitFor({
			actions : new Press(),
			controlType : "sap.m.Button",
			errorMessage : `Could not press button ${sComment}`,
			id : rButtonId,
			matchers : fnMatchers,
			success : function () {
				Opa5.assert.ok(true, `Pressed button ${sComment}`);
			},
			viewName : sViewName
		});
	}

	function pressButtonInRow(vRowIndexOrId, rButtonId, sText, sComment) {
		const [, sIsIdText, fnMatch] = getIdOrRowDetails(vRowIndexOrId);
		pressButton.call(this, rButtonId, fnMatch, `'${sText}' ${sIsIdText}. ${sComment}`);
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
				refreshKeepingTreeState : function (sComment) {
					pressButton.call(this,
						bTreeTable ? "sideEffectsRefreshTreeTable" : "sideEffectsRefresh", null,
						`'Refresh (keeping tree state)'. ${sComment}`
					);
				},
				toggleExpand : function (vRowIndexOrId, sComment) {
					if (bTreeTable) {
						const [bIsId, sIsIdText, fnMatch] = getIdOrRowDetails(vRowIndexOrId);
						this.waitFor({
							actions : function (oTable) {
								const iRow = bIsId
									? oTable.getRows().find(fnMatch).getBindingContext().getIndex()
									: vRowIndexOrId;

								if (oTable.isExpanded(iRow)) {
									oTable.collapse(iRow);
								} else {
									oTable.expand(iRow);
								}
							},
							controlType : getTableType(),
							errorMessage : `Could not press button 'Expand' ${sIsIdText}`,
							id : getTableId(),
							success : function () {
								Opa5.assert.ok(true,
									`Pressed button 'Expand' ${sIsIdText}. ${sComment}`);
							},
							viewName : sViewName
						});
					} else {
						pressButtonInRow.call(this,
							vRowIndexOrId, /expandToggle/, "Expand", sComment
						);
					}
				},
				expandAll : function (vRowIndexOrId, sComment) {
					pressButtonInRow.call(this, vRowIndexOrId,
						bTreeTable ? /expandAllTreeTable/ : /expandAll/,
						"Expand Levels", sComment
					);
				},
				collapseAll : function (vRowIndexOrId, sComment) {
					pressButtonInRow.call(this, vRowIndexOrId,
						bTreeTable ? /collapseAllTreeTable/ : /collapseAll/,
						"Collapse All", sComment
					);
				}
			},
			assertions : {
				checkTable : function (vExpected, mDefaults, sComment) {
					this.waitFor({
						controlType : getTableType(),
						id : getTableId(),
						success : function (oTable) {
							if (typeof vExpected === "string") {
								const sResult = getTableAsString(oTable);
								Opa5.assert.strictEqual(sResult, vExpected, sComment);
							} else {
								SandboxModel.update(vExpected).forEach(
									checkRow.bind(null, oTable, mDefaults)
								);
							}
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
