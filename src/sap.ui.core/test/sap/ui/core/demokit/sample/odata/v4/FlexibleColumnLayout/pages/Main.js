/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.FlexibleColumnLayout.Main";

	Opa5.createPageObjects({
		onTheApplication : {
			actions : {
				pressCancel : function () {
					return Helper.pressButton(this, sViewName, "cancel");
				},
				pressSave : function () {
					return Helper.pressButton(this, sViewName, "save");
				}
			}
		},
		onTheListReport : {
			actions : {
				selectSalesOrder : function (iRow) {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Text",
						id : /salesOrderId/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.ok(true, "Sales Order selected: " + aControls[0].getText());
						},
						viewName : sViewName
					});
				},
				sortBySalesOrderID  : function () {
					return Helper.pressButton(this, sViewName, "sortBySalesOrderId");
				}
			},
			assertions : {
				checkSalesOrder : function (iRow, sSalesOrderID, sNote) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /salesOrderId|salesOrderNote/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sSalesOrderID);
							Opa5.assert.strictEqual(aControls[1].getText(), sNote);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderNotInTheList : function (sSalesOrderID) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /salesOrderId/,
						success : function (aControls) {
							Opa5.assert.ok(
								aControls.every(function (oControl) {
									return oControl.getText() !== sSalesOrderID;
								}), "Sales Order '" + sSalesOrderID + "' not found"
							);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheObjectPage : {
			actions : {
				changeNote : function (sNote) {
					return Helper.changeInputValue(this, sViewName, "SalesOrder::note", sNote);
				},
				selectSalesOrderItem : function (iRow) {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Text",
						id : /itemPosition/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.ok(true, "Item selected: " + aControls[0].getText());
						},
						viewName : sViewName
					});
				},
				pressMore : function () {
					return this.waitFor({
						id : "SO_2_SOITEM-trigger",
						success : function (oTrigger) {
							new Press().executeOn(oTrigger);
							Opa5.assert.ok(true, "'More' Button pressed");
						},
						viewName : sViewName
					});
				},
				sortByGrossAmount : function () {
					return Helper.pressButton(this, sViewName, "sortByGrossAmount");
				}
			},
			assertions : {
				checkNote : function (sNote) {
					Helper.checkInputValue(this, sViewName, "SalesOrder::note", sNote);
				},
				checkSalesOrderItem : function (iRow, sItemPosition, sQuantity) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /itemPosition|itemQuantity/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sItemPosition);
							Opa5.assert.strictEqual(aControls[1].getText(), sQuantity);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderID : function (sSalesOrderID) {
					Helper.checkInputValue(this, sViewName, "SalesOrder::id", sSalesOrderID);
				},
				checkSalesOrderItemNotInTheList : function (sItemPosition) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /itemPosition/,
						success : function (aControls) {
							Opa5.assert.ok(
								aControls.every(function (oControl) {
									return oControl.getText() !== sItemPosition;
								}), "Item'" + sItemPosition + "' not found"
							);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheSubObjectPage : {
			actions : {
				changeQuantity : function (sQuantity) {
					return Helper.changeInputValue(this, sViewName, "SO_2_ITEM::quantity",
						sQuantity);
				}
			},
			assertions : {
				checkItemPosition : function (sItemPosition) {
					Helper.checkInputValue(this, sViewName, "SO_2_ITEM::itemPosition",
						sItemPosition);
				},
				checkQuantity : function (sQuantity) {
					Helper.checkInputValue(this, sViewName, "SO_2_ITEM::quantity", sQuantity);
				}
			}
		}
	});
});