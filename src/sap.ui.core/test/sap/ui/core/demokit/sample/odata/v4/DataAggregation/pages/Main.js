/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation",
		mIconForExpand = {
			"true" : "sap-icon://collapse",
			"false" : "sap-icon://expand",
			undefined : "sap-icon://e-care"
		};

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressExpandInRow : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Button",
						errorMessage : "Could not press Expand Button in row " + iRow,
						id : /expand/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Pressed Expand Button in row: " + iRow);
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkRow : function (iRow, iLevel, bExpanded, bSubTotal, sRegion,
						sAccountResponsible) {
					return this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "table",
						success : function (oTable) {
							var aRows = oTable.getRows(),
								aRowCells;

							if (aRows.length < iRow) {
								Opa5.assert.ok(false, "Row " + iRow + " is missing");
								return;
							}

							aRowCells = aRows[iRow].getCells();

							Opa5.assert.strictEqual(aRowCells[0].getText(), iLevel.toString(),
								"Row " + iRow + ": Level is " + aRowCells[0].getText());
							Opa5.assert.strictEqual(aRowCells[1].getIcon(),
								mIconForExpand[bExpanded],
								"Row " + iRow + ": Expanded is " + aRowCells[1].getIcon());
							Opa5.assert.strictEqual(aRowCells[2].getText(), sRegion,
								"Row " + iRow + ": Region is " + aRowCells[2].getText());
							Opa5.assert.strictEqual(aRowCells[3].getText(), sAccountResponsible,
								"Row " + iRow + ": Account Responsible is "
								+ aRowCells[3].getText());
							Opa5.assert.strictEqual(aRowCells[6].getSelected(), bSubTotal,
								"Row " + iRow + ": Subtotal is " + aRowCells[6].getSelected());
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});