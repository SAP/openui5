/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
],
function (Filter, FilterOperator, ODataUtils, Opa5, EnterText, Press, Interactable, Properties) {
	"use strict";
	var GROSS_AMOUNT_COLUMN_INDEX = 2,
		ID_COLUMN_INDEX = 0,
		ITEM_COLUMN_INDEX = 1,
		NOTE_COLUMN_INDEX = 5,
		SOITEM_NOTE_COLUMN_INDEX = 10,
		SOITEM_QUANTITY_COLUMN_INDEX = 7,
		sLastNewNoteValue,
		sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

	/*
	 * Search for the control with the given ID, extract the number and compare with the expected
	 * count.
	 */
	function checkCount(oOpa, iExpectedCount, sTitleId) {
		return oOpa.waitFor({
			id : sTitleId,
			success : function (oTitle) {
				Opa5.assert.strictEqual(
					// extract number from title
					Number(oTitle.getText().split(" ")[0]),
					iExpectedCount,
					"Expected count for " + sTitleId + ": " + iExpectedCount);
			},
			viewName : sViewName
		});
	}

	function handleMessageBox(oOpa, sTitle, bConfirm, sLog) {
		return oOpa.waitFor({
			controlType : "sap.m.Dialog",
			matchers : new Properties({title : sTitle}),
			success : function (aControls) {
				aControls[0].getButtons()[bConfirm ? 0 : 1].$().tap();
				Opa5.assert.ok(true, sLog || (bConfirm ? 'Confirm ' : 'Cancel ') + sTitle);
			}
		});
	}

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		/*
		 * Actions and assertions for the "Create Sales Order" dialog
		 */
		onTheCreateNewSalesOrderDialog : {
			actions : {
				changeNote : function (sNewNoteValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sNewNoteValue }),
						controlType : "sap.m.Input",
						id : "NewNote",
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Note text set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				confirmDialog : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "confirmCreateSalesOrder",
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Create Sales Order dialog confirmed");
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnCurrencyCode : function () {
					return this.waitFor({
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : "NewCurrencyCode",
						success : function (oValueHelp) {
							oValueHelp.onValueHelp();
							Opa5.assert.ok(true, "ValueHelp on CurrencyCode pressed");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkCurrencyCodeIsValueHelp : function () {
					return this.waitFor({
						controlType : "sap.ui.core.sample.common.ValueHelp",
						matchers : new Interactable(),
						id : "NewCurrencyCode",
						success : function (oValueHelp) {
							Opa5.assert.ok(oValueHelp.getAggregation("field").getShowValueHelp(),
								"CurrencyCode has value help");
						},
						viewName : sViewName
					});
				},
				checkNewBuyerId : function (sExpectedBuyerID) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "NewBuyerID",
						success : function (oNewBuyerIDInput) {
							Opa5.assert.strictEqual(oNewBuyerIDInput.getValue(), sExpectedBuyerID,
								"New Buyer ID");
						},
						viewName : sViewName
					});
				},
				// store note value in sLastNewNoteValue and check note value if sExpectedNote is
				// not empty
				checkNewNote : function (sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "NewNote",
						success : function (oNewNoteInput) {
							sLastNewNoteValue = oNewNoteInput.getValue();
							if (sExpectedNote) {
								Opa5.assert.strictEqual(oNewNoteInput.getValue(), sExpectedNote,
									"New Note");
							} else {
								Opa5.assert.ok(true, "Stored NewNote value " + sLastNewNoteValue);
							}
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the main view of the Sales Orders application
		 */
		onTheMainPage : {
			actions : {
				changeNote : function (iRow, sNewNoteValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							oRow.getCells()[NOTE_COLUMN_INDEX].setValue(sNewNoteValue);
							Opa5.assert.ok(true,
								"Note of row " + iRow + " set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				changeSalesOrderLineItemNote : function (iRow, sNewNoteValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							oRow.getCells()[SOITEM_NOTE_COLUMN_INDEX].setValue(sNewNoteValue);
							Opa5.assert.ok(true,
								"SO Item Note of row " + iRow + " set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				changeSalesOrderLineItemQuantity : function (iRow, sNewQuantity) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							oRow.getCells()[SOITEM_QUANTITY_COLUMN_INDEX].setValue(sNewQuantity);
							Opa5.assert.ok(true,
								"SO Item Note of row " + iRow + " set to " + sNewQuantity);
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrder : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "deleteSalesOrder",
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrderLineItem : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "deleteSalesOrderLineItem",
						viewName : sViewName
					});
				},
				doubleRefresh : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							oSalesOrderTable.getBinding("items").refresh();
							oSalesOrderTable.getBinding("items").refresh();
						},
						viewName : sViewName
					});
				},
				filterGrossAmount : function (sFilterValue) {
					// no sFilterValue means 'take GrossAmount from OPA context'
					// but then the constructor of EnterText above has to call delayed
					// this is why the check is chained here
					return this.waitFor({
						controlType : "sap.m.SearchField",
						id : "filterGrossAmount",
						success : function () {
							sFilterValue = sFilterValue ||
								sap.ui.test.Opa.getContext().GrossAmount;
							return this.waitFor({
								actions: new EnterText({clearTextFirst: true, text: sFilterValue}),
								controlType : "sap.m.SearchField",
								id : "filterGrossAmount",
								success : function (oSearchField) {
									Opa5.assert.ok(true, "Filter by GrossAmount:" + sFilterValue);
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				filterGrossAmountViaAPI : function (sFilterValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oTable) {
							oTable.getBinding("items").filter(
								new Filter("GrossAmount", FilterOperator.GT, sFilterValue));
							Opa5.assert.ok(true, "Filtered SalesOrders via API by GrossAmount > " +
								sFilterValue);
						},
						viewName : sViewName
					});
				},
				filterSOItemsByProductIdWithChangeParameters : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSOItemsTable) {
							var sProductID,
								oRow;
							if (iRow === undefined) {
								oSOItemsTable.getBinding("items")
									.changeParameters({
										$filter : undefined
								});
								Opa5.assert.ok(true,
									"Reset Filter by ProductID with changeParameters");
								return;
							}
							oRow  = oSOItemsTable.getItems()[iRow];
							sProductID = oRow.getCells()[2].getText();
							// store sales order id and item postion for later comparison
							sap.ui.test.Opa.getContext().sExpectedSalesOrderID =
								oRow.getCells()[ID_COLUMN_INDEX].getText();
							sap.ui.test.Opa.getContext().sExpectedItem =
								oRow.getCells()[ITEM_COLUMN_INDEX].getText();

							// filter for SOItem with Product ID from 2nd row
							oSOItemsTable.getBinding("items")
								.changeParameters({
									$filter : "Product/ProductID eq '" + sProductID + "'"
								});
							Opa5.assert.ok(true, "Filter by ProductID with changeParameters:"
								+ sProductID);
						},
						viewName : sViewName
					});
				},
				filterSalesOrderItemsByProductID : function (sValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderItemsTable) {
							// Note: filter cannot be triggered via UI; field is disabled
							oSalesOrderItemsTable.getBinding("items")
								.filter(new Filter("Product/ProductID", FilterOperator.EQ, sValue));
						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsVisible : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						check : function (oSalesOrderTable) {
							return  oSalesOrderTable.getItems().length > 0;
						},
						success : function (oControl) {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[0].getText();
							sap.ui.test.Opa.getContext().firstSalesOrderId = sSalesOrderId;
							Opa5.assert.ok(true, "First SalesOrderID " + sSalesOrderId);

						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsAtPos0 : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						check : function (oSalesOrderTable) {
							return  oSalesOrderTable.getItems()[0].getCells()[0].getText()
								=== sap.ui.test.Opa.getContext().firstSalesOrderId;
						},
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(true, "First SalesOrderID " +
								oSalesOrderTable.getItems()[0].getCells()[0].getText());
						},
						viewName : sViewName
					});
				},
				pressCancelSalesOrderChangesButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "cancelSalesOrderChanges",
						success : function (oCancelSalesOrderChangesButton) {
							Opa5.assert.ok(true, "Cancel Sales Order Changes button pressed");
						},
						viewName : sViewName
					});
				},
				pressCancelSalesOrderListChangesButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "cancelSalesOrderListChanges",
						success : function (oCancelSalesOrderListChangesButton) {
							Opa5.assert.ok(true, "Cancel Sales Order List Changes button pressed");
						},
						viewName : sViewName
					});
				},
				pressCreateSalesOrderItemButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "createSalesOrderLineItem",
						success : function (oCreateSalesOrderLineItemButton) {
							Opa5.assert.ok(true, "Create Sales Order Line Item button pressed");
						},
						viewName : sViewName
					});
				},
				pressCreateSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "createSalesOrder",
						success : function (oCreateSalesOrderButton) {
							Opa5.assert.ok(true, "Create Sales Order button pressed");
						},
						viewName : sViewName
					});
				},
				pressRefreshAllButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshAll",
						success : function (aControls) {
							Opa5.assert.ok(true, "Refresh All pressed");
						},
						viewName : sViewName
					});
				},
				pressRefreshSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshSalesOrders",
						success : function (aControls) {
							Opa5.assert.ok(true, "Refresh Sales Orders pressed");
						},
						viewName : sViewName
					});
				},
				pressSaveSalesOrderButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "saveSalesOrder",
						viewName : sViewName
					});
				},
				pressSaveSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "saveSalesOrders",
						viewName : sViewName
					});
				},
				pressSetBindingContextButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "setBindingContext",
						viewName : sViewName
					});
				},
				pressValueHelpOnProductCategory : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Input",
						// "0" is the index, "field" is the prefix for the control within ValueHelp
						id : /-0-field/,
						success : function (oValueHelp) {
							Opa5.assert.ok(true, "ValueHelp on Product.Category pressed");
							return this.waitFor({
								controlType : "sap.m.Popover",
								success : function (aControls) {
									aControls[0].close();
									Opa5.assert.ok(true, "ValueHelp Popover closed");
								}
							});
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnProductTypeCode : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.ComboBox",
						// "0" is the index, "field" is the prefix for the control within ValueHelp
						id : /-0-field/,
						success : function (oValueHelp) {
							Opa5.assert.ok(true, "ValueHelp on Product.TypeCode pressed");
						},
						viewName : sViewName
					});
				},
				rememberCreatedSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						success : function () {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[ID_COLUMN_INDEX].getText();
							if (!sap.ui.test.Opa.getContext().aOrderIds) {
								sap.ui.test.Opa.getContext().aOrderIds = [];
							}
							sap.ui.test.Opa.getContext().aOrderIds.push(sSalesOrderId);

							Opa5.assert.ok(true, "SalesOrderID remembered:" + sSalesOrderId);
						}
					});
				},
				resetSalesOrderListChanges : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oTable) {
							oTable.getBinding("items").resetChanges();
							Opa5.assert.ok(true, "SalesOrders reset by API");
						},
						viewName : sViewName
					});
				},
				selectFirstSalesOrder : function (bRememberGrossAmount) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oTable) {
							var oFirstItem = oTable.getItems()[0],
								oControl = oFirstItem.getCells()[ID_COLUMN_INDEX];
							oControl.$().tap();
							Opa5.assert.ok(true, "First Sales Order selected: " +
								oControl.getText());
							if (bRememberGrossAmount) {
								sap.ui.test.Opa.getContext().GrossAmount =
									oFirstItem.getCells()[GROSS_AMOUNT_COLUMN_INDEX]
										.getBinding("text").getValue();
							}
						},
						viewName : sViewName
					});
				},
				selectSalesOrderItemWithPosition : function (sPosition) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--SalesOrderLineItems-/,
						matchers : new Properties({text: sPosition}),
						success : function (aControls) {
							aControls[0].$().tap();
							Opa5.assert.ok(true, "Sales Order Item selected: " + sPosition);
						},
						viewName : sViewName
					});
				},
				selectSalesOrderWithId : function (sSalesOrderId) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--SalesOrders_ID-/,
						matchers : new Properties({text: sSalesOrderId}),
						success : function (aControls) {
							aControls[0].$().tap();
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				sortByGrossAmount : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "sortByGrossAmount",
						viewName : sViewName
					});
				},
				sortByGrossAmountViaController : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function () {
							sap.ui.getCore().byId(sViewName).oController.onSortByGrossAmount();
							Opa5.assert.ok(true, "controller.onSortByGrossAmount() called" );
						},
						viewName : sViewName
					});
				},
				sortBySalesOrderID  : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "sortBySalesOrderID",
						viewName : sViewName
					});
				},
				sortBySalesOrderIDviaController : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function () {
							sap.ui.getCore().byId(sViewName).oController.onSortBySalesOrderID();
							Opa5.assert.ok(true, "controller.onSortBySalesOrderID() called" );
						},
						viewName : sViewName
					});
				}
			},
			assertions: {
				checkButtonDisabled : function (sButtonId) {
					return this.waitFor({
						autoWait : false,
						controlType : "sap.m.Button",
						id : sButtonId,
						success : function (oButton) {
							Opa5.assert.ok(oButton.getEnabled() === false,
								"Button is disabled: " + sButtonId);
						},
						viewName : sViewName
					});
				},
				checkButtonEnabled : function (sButtonId) {
					return this.waitFor({
						controlType : "sap.m.Button",
						id : sButtonId,
						matchers : new Interactable(),
						success : function (oButton) {
							Opa5.assert.ok(oButton.getEnabled(), "Button is enabled: " + sButtonId);
						},
						viewName : sViewName
					});
				},
				checkContactNameInRow : function (iRow, sExpectedContactName) {
					return this.waitFor({
						controlType : "sap.m.List",
						id : "SupplierContactData",
						success : function (oContactList) {
							var oItem = oContactList.getItems()[iRow];

							Opa5.assert.strictEqual(
								oItem.getTitle().slice(0, sExpectedContactName.length),
								sExpectedContactName, "Contact Name '" + sExpectedContactName
								+ "' in row " + iRow);
						},
						viewName : sViewName
					});
				},
				checkDifferentID : function (iRow, sExpectedID) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.notStrictEqual(oRow.getCells()[ID_COLUMN_INDEX].getText(),
								sExpectedID,
								"ID of row " + iRow + " is not \"" + sExpectedID + "\"");
						},
						viewName : sViewName
					});
				},
				checkFavoriteProductID : function () {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "FavoriteProductID",
						matchers : new Properties({value : "HT-1000"}),
						success : function () {
							Opa5.assert.ok(true, "Product ID 'HT-1000' found");
						},
						viewName : sViewName
					});
				},
				checkFirstGrossAmountGreater : function (sExpectedAmount) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var sAmount,
								aTableItems = oSalesOrderTable.getItems();
							if (aTableItems.length > 0) {
								sAmount = aTableItems[0].getBindingContext()
									.getProperty("GrossAmount");
								Opa5.assert.ok(
									ODataUtils.compare(sAmount, sExpectedAmount, true) > 0,
									"checkFirstGrossAmountGreater('" + sExpectedAmount + "')");
							}
						},
						viewName : sViewName
					});
				},
				checkID : function (iRow, sExpectedID) {
					var that = this;
					return this.waitFor({
						controlType : "sap.m.Button",
						id : "refreshSalesOrders",
						// we wait for the refresh button becomes interactable before checking the
						// Sales Orders list
						matchers : new Interactable(),
						success : function () {
							return that.waitFor({
								controlType : "sap.m.Table",
								id : "SalesOrders",
								success : function (oSalesOrderTable) {
									var oRow = oSalesOrderTable.getItems()[iRow];
									if (sExpectedID === undefined) {
										//compare with initial OrderID
										sExpectedID =
											sap.ui.test.Opa.getContext().firstSalesOrderId;
									}
									Opa5.assert.strictEqual(
										oRow.getCells()[ID_COLUMN_INDEX].getText(),
										sExpectedID,
										"ID of row " + iRow + " as expected \""
											+ sExpectedID + "\"");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				checkNewSalesOrderItemProductName : function (sExpectProductName) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[0];

							Opa5.assert.strictEqual(oRow.getCells()[3].getText(),
								sExpectProductName, "Product name of new created SOItem");
						},
						viewName : sViewName
					});
				},
				checkNote : function (iRow, sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							sExpectedNote = sExpectedNote || sLastNewNoteValue;
							Opa5.assert.strictEqual(oRow.getCells()[NOTE_COLUMN_INDEX].getValue(),
								sExpectedNote,
								"Note of row " + iRow + " as expected " + sExpectedNote);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderIdInDetails : function (bChanged) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "Details_SalesOrderID",
						success : function (oText) {
							var sCurrentId = oText.getText(),
								sIdBefore  = sap.ui.test.Opa.getContext().firstSalesOrderId,
								sMessage = "checkSalesOrderIdInDetails(" + !!bChanged
									+ ") before: '" + sIdBefore + "' current: '" + sCurrentId;
							Opa5.assert.ok(
								bChanged ? sCurrentId !== sIdBefore : sCurrentId === sIdBefore,
								sMessage);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemInRow : function (iRow, sExpectedSalesOrderID, sExpectedItem) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						check : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[iRow],
								sItem,
								sSalesOrderId;
							// if called without 2nd and 3rd parameter use previously stored values
							// for comparison
							sExpectedSalesOrderID = sExpectedSalesOrderID
								|| sap.ui.test.Opa.getContext().sExpectedSalesOrderID;
							sExpectedItem = sExpectedItem
								|| sap.ui.test.Opa.getContext().sExpectedItem;

							if (oRow) {
								sSalesOrderId  = oRow.getCells()[ID_COLUMN_INDEX].getText();
								sItem = oRow.getCells()[ITEM_COLUMN_INDEX].getText();
								if (sSalesOrderId ===  sExpectedSalesOrderID &&
										sItem === sExpectedItem) {
									Opa5.assert.strictEqual(sSalesOrderId, sExpectedSalesOrderID,
										"Sales Order ID '" + sExpectedSalesOrderID + "' in row "
										+ iRow);
									Opa5.assert.strictEqual(sItem, sExpectedItem,
										"Item position '" + sExpectedItem + "' in row " + iRow);
									return true;
								}
							}
							return false;
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemsCount : function (iExpectedCount) {
					return checkCount(this, iExpectedCount, "SalesOrderLineItemsTitle");
				},
				checkSalesOrderLineItemNote : function (iRow, sNoteValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.strictEqual(
								oRow.getCells()[SOITEM_NOTE_COLUMN_INDEX].getValue(), sNoteValue,
								"SO Item Note of row " + iRow + " is " + sNoteValue);
						},
						viewName : sViewName
					});
				},
				checkSalesOrdersCount : function (iExpectedCount) {
					return checkCount(this, iExpectedCount, "SalesOrdersTitle");
				},
				checkSalesOrderSelected : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var aTableItems = oSalesOrderTable.getItems();

							Opa5.assert.strictEqual(oSalesOrderTable.getSelectedItem(),
								aTableItems[iRow]);
						},
						viewName : sViewName
					});
				},
				checkSupplierPhoneNumber : function (sExpectedPhoneNumber) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "PhoneNumber",
						success : function (oPhoneNumberInput) {
							Opa5.assert.strictEqual(oPhoneNumberInput.getValue(),
								sExpectedPhoneNumber, "checkSupplierPhoneNumber('"
								+ sExpectedPhoneNumber + "')");
						},
						viewName : sViewName
					});
				},
				checkTableLength : function (iExpectedLength, sTableId) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : sTableId,
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getBinding("items").getLength(),
								iExpectedLength,
								"Expected length for table with ID " + sTableId + ": "
									+ iExpectedLength);
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Refresh" confirmation dialog
		 */
		onTheRefreshConfirmation : {
			actions : {
				cancel : function() {
					return handleMessageBox(this, "Refresh", false, "Cancel 'pending changes'");
				},
				confirm : function() {
					return handleMessageBox(this, "Refresh", true, "Confirm 'pending changes'");
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "ValueHelp" Popover
		 */
		onTheValueHelpPopover : {
			actions : {
				close : function () {
					return this.waitFor({
						controlType : "sap.m.Popover",
						success : function (aControls) {
							aControls[0].close();
							Opa5.assert.ok(true, "ValueHelp Popover closed");
						}
					});
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "Sales Order Deletion" confirmation dialog
		 */
		onTheSalesOrderDeletionConfirmation : {
			actions : {
				cancel : function () {
					return handleMessageBox(this, "Sales Order Deletion", false);
				},
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Sales Order Deletion"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap(); // confirm deletion
							Opa5.assert.ok(true, "Confirm Delete Sales Order");
						}
					});
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "Sales Order Deletion" confirmation dialog
		 */
		onTheSalesOrderLineItemDeletionConfirmation : {
			actions : {
				cancel : function () {
					return handleMessageBox(this, "Sales Order Line Item Deletion", false);
				},
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Sales Order Line Item Deletion"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap(); // confirm deletion
							Opa5.assert.ok(true, "Confirm Delete Sales Line Item Order");
						}
					});
				}
			},
			assertions : {}
		}
	});
});