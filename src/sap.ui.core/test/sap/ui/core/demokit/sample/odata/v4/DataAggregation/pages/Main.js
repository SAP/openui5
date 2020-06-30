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
				pressExpandInRow : function (iRow, sComment) {
					return this.waitFor({
						controlType : "sap.m.Button",
						errorMessage : "Could not press Expand Button in row " + iRow,
						id : /expand/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Pressed Expand Button in row: " + iRow
								+ ". " + sComment);
						},
						viewName : sViewName
					});
				},
				scrollToRow : function (iRow, sComment) {
					return this.waitFor({
						actions : function (oTable) {
							oTable.setFirstVisibleRow(iRow);
						},
						controlType : "sap.ui.table.Table",
						errorMessage : "Could not select row: " + iRow,
						id : "table",
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
								"Scrolled table to row: " + iRow + ". " + sComment);
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkTable : function (aExpected) {
					return this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "table",
						success : function (oTable) {
							var aCells,
								aRows = oTable.getRows();

							aExpected.forEach(function(oExpected, iRowIndex) {
								if (iRowIndex >= aRows.length) {
									Opa5.assert.ok(false, "Row " + iRowIndex + " is missing");
									return;
								}

								aCells = aRows[iRowIndex].getCells();

								Opa5.assert.strictEqual(aCells[0].getText(),
									oExpected.level.toString(),
									"Row " + iRowIndex + ": Level is " + aCells[0].getText());
								Opa5.assert.strictEqual(aCells[1].getIcon(),
									mIconForExpand[oExpected.expanded],
									"Row " + iRowIndex + ": Expanded is " + aCells[1].getIcon());
								Opa5.assert.strictEqual(aCells[2].getText(),
									oExpected.country,
									"Row " + iRowIndex + ": Country is " + aCells[2].getText());
								Opa5.assert.strictEqual(aCells[3].getText(),
									oExpected.region,
									"Row " + iRowIndex + ": Region is " + aCells[3].getText());
								Opa5.assert.strictEqual(aCells[4].getText(),
									oExpected.segment,
									"Row " + iRowIndex + ": Segment is " + aCells[4].getText());
								Opa5.assert.strictEqual(aCells[5].getText(),
									oExpected.accountResponsible,
									"Row " + iRowIndex + ": Account Responsible is "
										+ aCells[5].getText());
								Opa5.assert.strictEqual(aCells[8].getSelected(),
									oExpected.subtotal,
									"Row " + iRowIndex + ": Subtotal is "
										+ aCells[8].getSelected());
							});
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});