/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";

	var bTreeTable,
		sViewName = "sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy";

	function getTableAsString(oTable, bCheckName, bCheckAge) {
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
			const aCells = oRow.getCells();
			const sID = aCells[bTreeTable ? 0 : 2].getText();
			sResult += "\n" + "\t".repeat(iLevel - 1) + sDrillState + sID;
			const sName = aCells[bTreeTable ? 3 : 4].getValue();
			if (sName && bCheckName) {
				sResult += " " + sName;
			}
			if (bCheckAge) {
				sResult += " " + aCells[bTreeTable ? 4 : 5].getText();
			}
		}

		return sResult;
	}

	function getTableId() {
		return bTreeTable ? "treeTable" : "table";
	}

	function getTableType() {
		return bTreeTable ? "sap.ui.table.TreeTable" : "sap.ui.table.Table";
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

	function pressButtonInRow(sId, rButtonId, sText, sComment) {
		pressButton.call(this, rButtonId, function (oControl) {
				return oControl.getBindingContext().getProperty("ID") === sId;
			}, `'${sText}' with ID ${sId}. ${sComment}`);
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				createNewChild : function (sId, sComment) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						errorMessage : `Could not create new child below node ${sId}`,
						id : bTreeTable ? /createInTreeTable/ : /create\b/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getProperty("ID") === sId;
						},
						success : function () {
							Opa5.assert.ok(true,
								`Create new child below node ${sId}. ${sComment}`);
						},
						viewName : sViewName
					});
				},
				editName : function (sId, sName, sComment) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sName}),
						controlType : "sap.m.Input",
						errorMessage : `Could not edit name of node with ID ${sId}`,
						id : bTreeTable ? /nameInTreeTable/ : /name\b/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getProperty("ID") === sId;
						},
						success : function () {
							Opa5.assert.ok(true,
								`Entered name of node ${sId} as "${sName}". ${sComment}`);
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
						bTreeTable ? /sideEffectsRefreshTreeTable/ : /sideEffectsRefresh\b/, null,
						`'Refresh (keeping tree state)'. ${sComment}`
					);
				},
				toggleExpand : function (sId, sComment) {
					if (bTreeTable) {
						this.waitFor({
							actions : function (oTable) {
								const iRow = oTable.getRows().find(function (oControl) {
									return oControl.getBindingContext().getProperty("ID") === sId;
								}).getBindingContext().getIndex();

								if (oTable.isExpanded(iRow)) {
									oTable.collapse(iRow);
								} else {
									oTable.expand(iRow);
								}
							},
							controlType : getTableType(),
							errorMessage : `Could not press button 'Expand' with ID ${sId}`,
							id : getTableId(),
							success : function () {
								Opa5.assert.ok(true,
									`Pressed button 'Expand' with ID ${sId}. ${sComment}`);
							},
							viewName : sViewName
						});
					} else {
						pressButtonInRow.call(this, sId, /expandToggle/, "Expand", sComment);
					}
				},
				expandAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId,
						bTreeTable ? /expandAllTreeTable/ : /expandAll\b/,
						"Expand Levels", sComment
					);
				},
				collapseAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId,
						bTreeTable ? /collapseAllTreeTable/ : /collapseAll\b/,
						"Collapse All", sComment
					);
				}
			},
			assertions : {
				checkTable : function (sComment, sExpected, bCheckName, bCheckAge) {
					this.waitFor({
						controlType : getTableType(),
						id : getTableId(),
						success : function (oTable) {
							const sResult = getTableAsString(oTable, bCheckName, bCheckAge);
							Opa5.assert.strictEqual(sResult, sExpected, sComment);
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
