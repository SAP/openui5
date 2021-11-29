/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Draft.Main";

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
						viewName : sViewName
					});
				}
			}
		},
		onTheObjectPage : {
			actions : {
				changeName : function (sName) {
					Helper.changeInputValue(this, sViewName, "Product::name", sName);
				},
				changeQuantity : function (iRow, sQuantity) {
					Helper.changeInputValue(this, sViewName, /_Parts::quantity/, sQuantity, iRow);
				},
				pressCancel : function () {
					Helper.pressButton(this, sViewName, "cancel");
				},
				pressEdit : function () {
					Helper.pressButton(this, sViewName, "edit");
				},
				pressSave : function () {
					Helper.pressButton(this, sViewName, "save");
				}
			},
			assertions : {
				checkIsActiveEntity : function (bIsActiveEntity) {
					Helper.checkInputValue(this, sViewName, "Product::IsActiveEntity",
						bIsActiveEntity ? "Yes" : "No");
				},
				checkName : function (sName) {
					Helper.checkInputValue(this, sViewName, "Product::name", sName);
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
						viewName : sViewName
					});
				},
				checkProductID : function (sProductID) {
					Helper.checkInputValue(this, sViewName, "Product::ID", sProductID);
				}
			}
		}
	});
});
