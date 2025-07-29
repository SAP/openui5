/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";

	const rTableId = /^((treeTable)|(table))$/;
	const sViewName = "sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy";

	function findParent(sParent) {
		this.waitFor({
			actions : new EnterText({clearTextFirst : true, text : sParent}),
			controlType : "sap.m.SearchField",
			errorMessage : `Could not find parent with ID ${sParent}`,
			matchers : function (oControl) {
				return oControl.getId().includes("searchField");
			},
			success : function () {
				Opa5.assert.ok(true, `Found parent with ID ${sParent}`);
			},
			viewName : sViewName
		});
	}

	function getTableAsString(oTable, bCheckName, bCheckAge) {
		const bTreeTable = oTable.expand; // duck-typed check
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

	function pressButton(rButtonId, fnMatchers, sComment, sControlType = "sap.m.Button") {
		this.waitFor({
			actions : new Press(),
			controlType : sControlType,
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
				copyToParent : function (sId, sParent, sComment) {
					pressButtonInRow.call(this, sId, /copyToParent/, "Copy to parent", sComment);
					findParent.call(this, sParent);
					pressButton.call(this, undefined, function (oControl) {
							return oControl.getBindingContext().getProperty("ID") === sParent;
						}, `to select parent with ID ${sParent}`, "sap.m.StandardListItem");
				},
				copyToRoot : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /copyToRoot/, "Copy to root", sComment);
				},
				createNewChild : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /create/, "Create new child below node",
						sComment);
				},
				editName : function (sId, sName, sComment) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sName}),
						controlType : "sap.m.Input",
						errorMessage : `Could not edit name of node with ID ${sId}`,
						id : /name/,
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
						errorMessage : "Could not select row " + iRow,
						id : rTableId,
						success : function (aControls) {
							const oTable = aControls[0];
							Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
								"Scrolled table to row " + iRow + ". " + sComment);
						},
						viewName : sViewName
					});
				},
				synchronize : function (sComment) {
					pressButton.call(this, /synchronize/, null, "Synchronize (" + sComment + ")");
				},
				refreshKeepingTreeState : function (sComment) {
					pressButton.call(this, /sideEffectsRefresh/, null,
						`'Refresh (keeping tree state)'. ${sComment}`);
				},
				toggleExpand : function (sId, sComment) {
					this.waitFor({
						actions : (oTable) => {
							if (oTable.expand) { // TreeTable
								const iRow = oTable.getRows().find(function (oControl) {
									return oControl.getBindingContext().getProperty("ID") === sId;
								}).getBindingContext().getIndex();

								if (oTable.isExpanded(iRow)) {
									oTable.collapse(iRow);
								} else {
									oTable.expand(iRow);
								}
							} else { // Table
								pressButtonInRow.call(this, sId, /expandToggle/, "Expand",
									sComment);
							}
						},
						errorMessage : `Could not press button 'Expand' with ID ${sId}`,
						id : rTableId,
						success : function () {
							Opa5.assert.ok(true,
								`Pressed button 'Expand' with ID ${sId}. ${sComment}`);
						},
						viewName : sViewName
					});
				},
				expandAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /expandAll/, "Expand Levels", sComment);
				},
				collapseAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /collapseAll/, "Collapse All", sComment);
				}
			},
			assertions : {
				checkTable : function (sComment, sExpected, bCheckName, bCheckAge,
						iExpectedFirstVisibleRow) {
					this.waitFor({
						id : rTableId,
						success : function (aControls) {
							const oTable = aControls[0];
							const sResult = getTableAsString(oTable, bCheckName, bCheckAge);
							Opa5.assert.strictEqual(sResult, sExpected, sComment);
							if (iExpectedFirstVisibleRow !== undefined) {
								Opa5.assert.strictEqual(
									oTable.getFirstVisibleRow(), iExpectedFirstVisibleRow);
							}
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
