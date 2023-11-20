/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (library, Helper, Opa5, TestUtils, EnterText, Press, Properties) {
	"use strict";
	var LayoutType = library.LayoutType,
		sViewName = "sap.ui.core.sample.odata.v4.FlexibleColumnLayout.Main";

	Opa5.createPageObjects({
		onTheApplication : {
			actions : {
				closeDialog : function (sTitle) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : sTitle}),
						success : function (aControls) {
							new Press().executeOn(aControls[0].getButtons()[0]);
							Opa5.assert.ok(true, "Success Dialog closed");
						}
					});
				},
				pressCancel : function () {
					Helper.pressButton(this, sViewName, "cancel");
				},
				pressCreate : function () {
					Helper.pressButton(this, sViewName, "create");
				},
				pressSave : function () {
					Helper.pressButton(this, sViewName, "save");
				}
			},
			assertions : {
				checkMessagesButtonCount : function (iExpectedCount) {
					this.waitFor({
						controlType : "sap.m.Button",
						id : "showMessages",
						success : function (oButton) {
							Opa5.assert.strictEqual(parseInt(oButton.getText()), iExpectedCount,
								"Message count is as expected: " + iExpectedCount);
						},
						viewName : sViewName
					});
				},
				checkObjectPageNotVisible : function () {
					this.waitFor({
						controlType : "sap.f.FlexibleColumnLayout",
						id : "layout",
						success : function (oLayout) {
							Opa5.assert.strictEqual(oLayout.getLayout(), LayoutType.OneColumn,
								"Object page not visible");
						},
						viewName : sViewName
					});
				},
				checkSubObjectPageNotVisible : function () {
					this.waitFor({
						controlType : "sap.f.FlexibleColumnLayout",
						id : "layout",
						success : function (oLayout) {
							Opa5.assert.strictEqual(oLayout.getLayout(),
								LayoutType.TwoColumnsMidExpanded, "Sub-object page not visible");
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheListReport : {
			actions : {
				filterByGrossAmount : function (sGrossAmount) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sGrossAmount}),
						controlType : "sap.m.SearchField",
						id : "filterGrossAmount",
						success : function () {
							Opa5.assert.ok(true, "Filter by GrossAmount gt :" + sGrossAmount);
						},
						viewName : sViewName
					});
				},
				refresh : function () {
					this.waitFor({
						success : function () {
							TestUtils.setData(
								"SalesOrderList_Refresh_with_GrossAmount_GT_1000.json", true);
						}
					});
					Helper.pressButton(this, sViewName, "refreshSalesOrderList");
				},
				selectSalesOrder : function (iRow) {
					this.waitFor({
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
				sortBySalesOrderID : function () {
					Helper.pressButton(this, sViewName, "sortBySalesOrderId");
				}
			},
			assertions : {
				checkSalesOrder : function (iRow, sSalesOrderID, sNote) {
					Helper.waitForSortedByID(this, {
						controlType : "sap.m.Text",
						id : /salesOrderId|salesOrderNote/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sSalesOrderID,
								"Sales Order Id is " + sSalesOrderID);
							Opa5.assert.strictEqual(aControls[1].getText(), sNote,
								"Note is " + sNote);
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
				},
				checkSalesOrdersCount : function (iCount) {
					Helper.waitForSortedByID(this, {
						id : /SalesOrderList-trigger|salesOrderListTitle/,
						success : function (aControls) {
							Helper.checkMoreButtonCount(aControls[0], "[5/" + iCount + "]");
							Opa5.assert.strictEqual(aControls[1].getText(),
								iCount + " New Sales Orders", "Count in title is " + iCount);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheObjectPage : {
			actions : {
				changeNote : function (sNote) {
					Helper.changeInputValue(this, sViewName, "SalesOrder::note", sNote);
				},
				createSalesOrderItem : function () {
					Helper.pressButton(this, sViewName, "createSalesOrderLineItem");
				},
				deleteSalesOrder : function () {
					Helper.pressButton(this, sViewName, "deleteSalesOrder");
				},
				increaseSalesOrderItemsQuantity : function () {
					Helper.pressButton(this, sViewName, "increaseSalesOrderItemsQuantity");
				},
				pressResetChanges : function () {
					Helper.pressButton(this, sViewName, "resetSalesOrder");
				},
				refresh : function () {
					Helper.pressButton(this, sViewName, "refreshSalesOrder");
				},
				selectSalesOrderItem : function (iRow) {
					this.waitFor({
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
					Helper.pressMoreButton(this, sViewName, "SO_2_SOITEM");
				},
				sortByGrossAmount : function () {
					Helper.pressButton(this, sViewName, "sortByGrossAmount");
				}
			},
			assertions : {
				checkGrossAmount : function (sGrossAmount) {
					Helper.checkInputValue(this, sViewName, "SalesOrder::grossAmount",
						sGrossAmount);
				},
				checkNote : function (sNote) {
					Helper.checkInputValue(this, sViewName, "SalesOrder::note", sNote);
				},
				checkSalesOrderID : function (sSalesOrderID) {
					Helper.checkInputValue(this, sViewName, "SalesOrder::id", sSalesOrderID);
				},
				checkSalesOrderItem : function (iRow, sItemPosition, sQuantity) {
					Helper.waitForSortedByID(this, {
						controlType : "sap.m.Text",
						id : /itemPosition|itemQuantity/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sItemPosition,
								"Item position is " + sItemPosition);
							Opa5.assert.strictEqual(aControls[1].getText(), sQuantity,
								"Quantity is " + sQuantity);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemNotInTheList : function (sItemPosition) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /itemPosition/,
						success : function (aControls) {
							Opa5.assert.ok(
								aControls.every(function (oControl) {
									return oControl.getText() !== sItemPosition;
								}), "Item '" + sItemPosition + "' not found"
							);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemsCount : function (iCount) {
					Helper.waitForSortedByID(this, {
						id : /SO_2_SOITEM-trigger|lineItemsTitle/,
						success : function (aControls) {
							if (aControls.length === 2) {
								Helper.checkMoreButtonCount(aControls.shift(),
									"[5/" + iCount + "]");
							}
							Opa5.assert.strictEqual(aControls[0].getText(),
								iCount + " Sales Order Line Items", "Count in title is " + iCount);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheSubObjectPage : {
			actions : {
				changeQuantity : function (sQuantity) {
					Helper.changeInputValue(this, sViewName, "SO_2_ITEM::quantity", sQuantity);
				},
				deleteSalesOrderItem : function () {
					Helper.pressButton(this, sViewName, "deleteSalesOrderItem");
				},
				pressResetChanges : function () {
					Helper.pressButton(this, sViewName, "resetLineItem");
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
