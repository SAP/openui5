/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";

	var mIconForExpand = {
			true : "sap-icon://collapse",
			false : "sap-icon://expand",
			undefined : "sap-icon://e-care"
		},
		sViewName = "sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation";

	function checkRow(oTable, oExpected, iRowIndex) {
		var aCells,
			aRows = oTable.getRows();

		if (iRowIndex >= aRows.length) {
			Opa5.assert.ok(false, "Row " + iRowIndex + " is missing");
			return;
		}

		aCells = aRows[iRowIndex].getCells();

		Opa5.assert.strictEqual(aCells[0].getText(),
			oExpected.level.toString(),
			"Row " + iRowIndex + ": Level is " + aCells[0].getText());
		Opa5.assert.strictEqual(aCells[1].getText(),
			oExpected.groupLevelCount.toString(),
			"Row " + iRowIndex + ": GroupLevelCount is " + aCells[1].getText());
		Opa5.assert.strictEqual(aCells[2].getIcon(),
			mIconForExpand[oExpected.expanded],
			"Row " + iRowIndex + ": Expanded is " + aCells[2].getIcon());
		Opa5.assert.strictEqual(aCells[3].getText(),
			oExpected.country,
			"Row " + iRowIndex + ": Country is " + aCells[3].getText());
		Opa5.assert.strictEqual(aCells[4].getText(),
			oExpected.region,
			"Row " + iRowIndex + ": Region is " + aCells[4].getText());
		Opa5.assert.strictEqual(aCells[5].getText(),
			oExpected.segment,
			"Row " + iRowIndex + ": Segment is " + aCells[5].getText());
		Opa5.assert.strictEqual(aCells[6].getText(),
			oExpected.accountResponsible,
			"Row " + iRowIndex + ": Account Responsible is "
				+ aCells[6].getText());
		Opa5.assert.strictEqual(aCells[7].getText(),
			oExpected.salesAmountLocalCurrency,
			"Row " + iRowIndex + ": Sales Amount is "
				+ aCells[7].getText());
		Opa5.assert.strictEqual(aCells[8].getText(),
			oExpected.localCurrency,
			"Row " + iRowIndex + ": Local Currency is "
				+ aCells[8].getText());
		Opa5.assert.strictEqual(aCells[9].getText(),
			oExpected.salesNumber,
			"Row " + iRowIndex + ": Sales Number is "
				+ aCells[9].getText());
		Opa5.assert.strictEqual(aCells[10].getSelected(),
			oExpected.subtotal,
			"Row " + iRowIndex + ": Subtotal is "
				+ aCells[10].getSelected());
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				enterSearch : function (sText) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sText}),
						controlType : "sap.m.SearchField",
						errorMessage : "Could not enter search text",
						id : "search",
						success : function () {
							Opa5.assert.ok(true, "Entered: \"" + sText + "\" in search field.");
						},
						viewName : sViewName
					});
				},
				scrollToRow : function (iRow, sComment) {
					this.waitFor({
						actions : function (oTable) {
							oTable.setFirstVisibleRow(iRow);
						},
						controlType : "sap.ui.table.Table",
						errorMessage : "Could not select row: " + iRow,
						id : "table",
						success : function (oTable) {
							if (iRow < Infinity) {
								Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
									"Scrolled table to row: " + iRow + ". " + sComment);
							} // scrolled to the end
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
				checkRow : function (oExpected, iRowIndex) {
					this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "table",
						success : function (oTable) {
							checkRow(oTable, oExpected, iRowIndex);
						},
						viewName : sViewName
					});
				},
				checkTable : function (aExpected) {
					this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "table",
						success : function (oTable) {
							aExpected.forEach(checkRow.bind(null, oTable));
						},
						viewName : sViewName
					});
				},
				checkTitle : function (sExpectedTitle) {
					this.waitFor({
						controlType : "sap.m.Title",
						id : "title",
						success : function (oTitle) {
							Opa5.assert.strictEqual(oTitle.getText(), sExpectedTitle,
								"Title is: " + sExpectedTitle);
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
