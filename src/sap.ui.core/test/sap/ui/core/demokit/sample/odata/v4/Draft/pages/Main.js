/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";
	var sListReport = "sap.ui.core.sample.odata.v4.Draft.ListReport",
		sObjectPage = "sap.ui.core.sample.odata.v4.Draft.ObjectPage";

	Opa5.createPageObjects({
		onTheErrorPage : {
			assertions : {
				checkError : function (sMessage) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : "error",
						success : function (oErrorText) {
							Opa5.assert.strictEqual(oErrorText.getText(), sMessage, "Error text");
						},
						viewName : "sap.ui.core.sample.odata.v4.Draft.Error"
					});
				}
			}
		},
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
						viewName : sListReport
					});
				}
			},
			assertions : {
				checkProduct : function (iRow, sProductID, bIsActiveEntity, sName) {
					Helper.waitForSortedByID(this, {
						controlType : "sap.m.Text",
						id : /isActiveEntity|productId|productName/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[1].getText(), sProductID,
								"Product ID is " + sProductID);
							Opa5.assert.strictEqual(aControls[0].getBinding("text").getValue(),
								bIsActiveEntity, "IsActiveEntity is " + bIsActiveEntity);
							Opa5.assert.strictEqual(aControls[2].getText(), sName,
								"Product name is " + sName);
						},
						viewName : sListReport
					});
				}
			}
		},
		onTheObjectPage : {
			actions : {
				changeName : function (sName) {
					Helper.changeInputValue(this, sObjectPage, "Product::name", sName);
				},
				changeQuantity : function (iRow, sQuantity) {
					Helper.changeInputValue(this, sObjectPage, /_Parts::quantity/, sQuantity, iRow);
				},
				pressCancel : function () {
					Helper.pressButton(this, sObjectPage, "cancel");
				},
				pressEdit : function () {
					Helper.pressButton(this, sObjectPage, "edit");
				},
				pressSave : function () {
					Helper.pressButton(this, sObjectPage, "save");
				},
				pressShowList : function () {
					Helper.pressButton(this, sObjectPage, "showList");
				}
			},
			assertions : {
				checkIsActiveEntity : function (bIsActiveEntity) {
					Helper.checkInputValue(this, sObjectPage, "Product::IsActiveEntity",
						bIsActiveEntity ? "Yes" : "No");
				},
				checkName : function (sName) {
					Helper.checkInputValue(this, sObjectPage, "Product::name", sName);
				},
				checkPart : function (iRow, sPartID, sDescription, sQuantity) {
					Helper.waitForSortedByID(this, {
						id : /_Parts::ID|_Parts::description|_Parts::quantity/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sPartID,
								"Part ID is " + sPartID);
							Opa5.assert.strictEqual(aControls[1].getBinding("text").getValue(),
								sDescription, "Description is " + sDescription);
							Opa5.assert.strictEqual(aControls[2].getValue(), sQuantity,
								"Quantity is " + sQuantity);
						},
						viewName : sObjectPage
					});
				},
				checkProductID : function (sProductID) {
					Helper.checkInputValue(this, sObjectPage, "Product::ID", sProductID);
				}
			}
		}
	});
});
