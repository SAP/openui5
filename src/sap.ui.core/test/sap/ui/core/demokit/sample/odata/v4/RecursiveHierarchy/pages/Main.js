/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Opa5, Press) {
	"use strict";

	var mIconForExpand = {
			expanded : "sap-icon://collapse",
			collapsed : "sap-icon://expand",
			leaf : "sap-icon://e-care"
		},
		sViewName = "sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy";

	function checkRow(oTable, mDefaults, oExpected, iRowIndex) {
		var aCells,
			aRows = oTable.getRows();

		if (iRowIndex >= aRows.length) {
			Opa5.assert.ok(false, "Row " + iRowIndex + " is missing");
			return;
		}

		aCells = aRows[iRowIndex].getCells();
		if (oExpected === null) {
			aCells.forEach(function (oCell, i) {
				// Note: don't care about invisible icon in 2nd column here
				Opa5.assert.strictEqual(oCell.getText(), "",
					"Row " + iRowIndex + ", cell " + i + " is empty");
			});
			return;
		}

		oExpected = Object.assign({}, mDefaults, oExpected);
		Opa5.assert.strictEqual(aCells[0].getText(),
			(oExpected.DistanceFromRoot + 1).toString(),
			"Row " + iRowIndex + ": Level is " + aCells[0].getText());
		Opa5.assert.strictEqual(aCells[1].getIcon(),
			mIconForExpand[oExpected.DrillState],
			"Row " + iRowIndex + ": Expanded is " + aCells[1].getIcon());
		Opa5.assert.strictEqual(aCells[2].getText(),
			oExpected.ID,
			"Row " + iRowIndex + ": ID is " + aCells[2].getText());
		Opa5.assert.strictEqual(aCells[3].getText(),
			oExpected.MANAGER_ID || "",
			"Row " + iRowIndex + ": Manager's ID is " + aCells[3].getText());
		Opa5.assert.strictEqual(aCells[4].getText(),
			oExpected.Name,
			"Row " + iRowIndex + ": Name is " + aCells[4].getText());
		Opa5.assert.strictEqual(aCells[5].getText(),
			oExpected.AGE.toString(),
			"Row " + iRowIndex + ": Age is "
				+ aCells[5].getText());
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				scrollToRow : function (iRow, sComment) {
					this.waitFor({
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
				},
				toggleExpandInRow : function (iRow, sComment) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						errorMessage : "Could not toggle Expand Button in row " + iRow,
						id : /expand/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function () {
							Opa5.assert.ok(true, "Toggle Expand Button in row: " + iRow
								+ ". " + sComment);
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkTable : function (aExpected, mDefaults) {
					this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "table",
						success : function (oTable) {
							aExpected.forEach(checkRow.bind(null, oTable, mDefaults));
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
