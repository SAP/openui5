/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, EnterText, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.Main";

	Opa5.createPageObjects({
		onTheListReport : {
			actions : {
				selectProduct : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Text",
						id : /productId/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.ok(true, "Product selected: " + aControls[0].getText());
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkFirstProduct : function (sExpectedProductId) {
					Helper.checkTextValue(this, sViewName, /productId/, sExpectedProductId, 0);
				}
			}
		},
		onTheObjectPage : {
			actions : {
				enterPartId : function (iRow, sId) {
					Helper.changeInputValue(this, sViewName, /partId/, sId, iRow);
				}
			},
			assertions : {
				checkPartsLength : function (iExpectedLength) {
					this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "parts",
						success : function (oPartsTable) {
							Opa5.assert.strictEqual(
								oPartsTable.getBinding("rows").getLength(),
								iExpectedLength,
								"Parts length is: " + iExpectedLength);
						},
						viewName : sViewName
					});
				},
				checkPart : function (iRow, sExpectedPartId, bExpectedDeletable) {
					Helper.waitForSortedByID(this, {
						autoWait : false,
						matchers : function (oControl) {
							return oControl.getBindingContext()
								&& oControl.getBindingContext().getIndex() === iRow;
						},
						id : /partDelete|partId/,
						success : function (aControls) {
							var bDeletable = aControls[0].getEnabled(),
								sPartId = aControls[1].getValue();
							Opa5.assert.strictEqual(aControls.length, 2);
							Opa5.assert.strictEqual(sPartId, sExpectedPartId,
								"Row " + iRow + ": Part ID: " + sPartId);
							Opa5.assert.strictEqual(bDeletable, bExpectedDeletable,
								"Row " + iRow + ": deletable: " + bDeletable);
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
