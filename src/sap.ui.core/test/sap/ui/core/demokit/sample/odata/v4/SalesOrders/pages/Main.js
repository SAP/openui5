/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (MessageBox, Helper, Filter, FilterOperator, ODataUtils, Opa, Opa5, TestUtils,
		EnterText, Press, Interactable, Properties, PropertyStrictEquals) {
	"use strict";
	var COMPANY_NAME_COLUMN_INDEX = 1,
		GROSS_AMOUNT_COLUMN_INDEX = 2,
		ID_COLUMN_INDEX = 0,
		ITEM_COLUMN_INDEX = 1,
		NOTE_COLUMN_INDEX = 4,
		SOITEM_NOTE_COLUMN_INDEX = 11,
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
				new Press().executeOn(aControls[0].getButtons()[bConfirm ? 0 : 1]);
				Opa5.assert.ok(true, sLog || (bConfirm ? 'Confirm ' : 'Cancel ') + sTitle);
			}
		});
	}

	function selectSalesOrder(oOpa, iIndex, bRememberGrossAmount) {
		return oOpa.waitFor({
			controlType : "sap.m.Table",
			id : "SalesOrderList",
			success : function (oTable) {
				var oItem = oTable.getItems()[iIndex],
					oControl = oItem.getCells()[ID_COLUMN_INDEX];
				new Press().executeOn(oControl);
				Opa5.assert.ok(true, "Sales Order selected: " +
					oControl.getText());
				if (bRememberGrossAmount) {
					Opa.getContext().GrossAmount =
						oItem.getCells()[GROSS_AMOUNT_COLUMN_INDEX]
							.getBinding("text").getValue();
				}
			},
			viewName : sViewName
		});
	}

	function pressButton(oOpa5, sId, bSearchOpenDialogs) {
		return Helper.pressButton(oOpa5, sViewName, sId, bSearchOpenDialogs);
	}

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
						id : "Note::new",
						searchOpenDialogs : true,
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Note text set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				confirmDialog : function () {
					return pressButton(this, "confirmCreateSalesOrder", true);
				},
				pressValueHelpOnCurrencyCode : function () {
					return this.waitFor({
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : "CurrencyCode::new",
						searchOpenDialogs : true,
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
						id : "CurrencyCode::new",
						searchOpenDialogs : true,
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
						id : "BuyerID::new",
						searchOpenDialogs : true,
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
						id : "Note::new",
						searchOpenDialogs : true,
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
				changeNoteInDetails : function (sValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sValue }),
						controlType : "sap.m.Input",
						id : "Note::detail",
						success : function (oInput) {
							Opa5.assert.ok(true, "Details Note set to " + sValue);
						},
						viewName : sViewName
					});
				},
				changeNoteInLineItem : function (iRow, sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : /SO_2_SOITEM:Note/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function () {
							Opa5.assert.ok(true, "SO Item Note of first row set to " + sValue);
						},
						viewName : sViewName
					});
				},
				changeNoteInSalesOrders : function (iRow, sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						id : /Note-__clone/,
						success : function (oControls) {
							Opa5.assert.ok(true,
								"Note of Sales Order " + oControls[0].getBindingContext().getPath()
									+ " set to " + sValue);
						},
						viewName : sViewName
					});
				},
				changeQuantityInLineItem : function (iRow, sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : /SO_2_SOITEM:Quantity/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function () {
							Opa5.assert.ok(true, "SO Item Quantity of row " + iRow + " set to "
								+ sValue);
						},
						viewName : sViewName
					});
				},
				createInvalidSalesOrderViaAPI : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oTable) {
							var oNewContext = oTable.getBinding("items").create({
								"SalesOrderID" : "",
								// properties
								"BuyerID" : "0100000000",
								"ChangedAt" : "1970-01-01T00:00:00Z",
								"CreatedAt" : "1970-01-01T00:00:00Z",
								"CurrencyCode" : "EUR",
								"GrossAmount" : "0.00",
								"LifecycleStatus" : "N",
								"LifecycleStatusDesc" : "New",
								"Note" : "RAISE_ERROR",
								"NoteLanguage" : "E",
								// navigation property
								"SO_2_BP" : null
							});
						oNewContext.created().then(function () {
							MessageBox.success("SalesOrder created: " +
								oNewContext.getProperty("SalesOrderID"));
							});
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var sSalesOrderID,
								oSelected = oSalesOrderTable.getSelectedItem().getBindingContext();
							if (TestUtils.isRealOData() && oSelected.isTransient() === false) {
								sSalesOrderID = oSelected.getProperty("SalesOrderID");
							}
							return pressButton(this, "deleteSalesOrder").then(function() {
								if (sSalesOrderID &&
									!(oSelected in oSalesOrderTable.getBinding("items")
										.getCurrentContexts())) {
									delete Opa.getContext().mOrderIDs[sSalesOrderID];
								}
							});
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrderLineItem : function () {
					return pressButton(this, "deleteSalesOrderLineItem");
				},
				deleteSelectedSalesOrderViaGroupId : function (sGroupId) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oSalesOrderContext = oSalesOrderTable.getSelectedItem()
									.getBindingContext(),
								sOrderID = oSalesOrderContext.getProperty("SalesOrderID", true);
							oSalesOrderContext.delete(sGroupId).then(function () {
									Opa5.assert.ok(true, "Deleted Sales Order: " + sOrderID);
								}, function (oError) {
									Opa5.assert.ok(false, "Error deleting Sales Order: " + sOrderID
										+ " Error: " + oError);
								}
							);
						},
						viewName : sViewName
					});
				},
				doubleRefresh : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
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
							sFilterValue = sFilterValue || Opa.getContext().GrossAmount;
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
						id : "SalesOrderList",
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
						id : "SO_2_SOITEM",
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
							Opa.getContext().sExpectedSalesOrderID =
								oRow.getCells()[ID_COLUMN_INDEX].getText();
							Opa.getContext().sExpectedItem =
								oRow.getCells()[ITEM_COLUMN_INDEX].getText();

							// filter for SOItem with Product ID from 2nd row
							oSOItemsTable.getBinding("items")
								.changeParameters({
									$filter : "ProductID eq '" + sProductID + "'"
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
						id : "SO_2_SOITEM",
						success : function (oSalesOrderItemsTable) {
							// Note: filter cannot be triggered via UI; field is disabled
							oSalesOrderItemsTable.getBinding("items")
								.filter(new Filter("ProductID", FilterOperator.EQ, sValue));
						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsVisible : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						check : function (oSalesOrderTable) {
							return  oSalesOrderTable.getItems().length > 0;
						},
						success : function (oControl) {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrderList")
									.getItems()[0].getCells()[0].getText();
							Opa.getContext().firstSalesOrderId = sSalesOrderId;
							Opa5.assert.ok(true, "First SalesOrderID: " + sSalesOrderId);

						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsAtPos0 : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						check : function (oSalesOrderTable) {
							return  oSalesOrderTable.getItems()[0].getCells()[0].getText()
								=== Opa.getContext().firstSalesOrderId;
						},
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(true, "First SalesOrderID: " +
								oSalesOrderTable.getItems()[0].getCells()[0].getText());
						},
						viewName : sViewName
					});
				},
				pressCancelSalesOrderChangesButton : function () {
					return pressButton(this, "cancelSalesOrderChanges");
				},
				pressCancelSalesOrderListChangesButton : function () {
					return pressButton(this, "cancelSalesOrderListChanges");
				},
				pressConfirmSalesOrderButton : function () {
					return pressButton(this, "confirmSalesOrder");
				},
				pressCreateSalesOrderItemButton : function () {
					return pressButton(this, "createSalesOrderLineItem");
				},
				pressCreateSalesOrdersButton : function () {
					var oPromise = pressButton(this, "createSalesOrder");
					if (TestUtils.isRealOData()) {
						// remember created sales order for cleanup
						return oPromise.then(function() {
							var oCreated = sap.ui.getCore().byId(sViewName).byId("SalesOrderList")
									.getItems()[0].getBindingContext();
							oCreated.created().then(function () {
								var mOrderIDs = Opa.getContext().mOrderIDs || {},
									sSalesOrderID = oCreated.getProperty("SalesOrderID");
								mOrderIDs[oCreated.getProperty("SalesOrderID")] = sSalesOrderID;
								if (!Opa.getContext().mOrderIDs) {
									Opa.getContext().mOrderIDs = mOrderIDs;
								}
								Opa5.assert.ok(true, "Remembered SalesOrderID: " + sSalesOrderID);
							});
						});
					}
					return oPromise;
				},
				pressDeleteBusinessPartnerButton : function () {
					return pressButton(this, "deleteBusinessPartner");
				},
				pressMessagesButton : function () {
					return pressButton(this, "showMessages");
				},
				pressOpenSimulateDiscountDialog : function () {
					return pressButton(this, "openSimulateDiscountDialog");
				},
				pressRefreshAllButton : function () {
					return pressButton(this, "refreshAll");
				},
				pressRefreshSalesOrdersButton : function () {
					return pressButton(this, "refreshSalesOrders");
				},
				pressRefreshSelectedSalesOrdersButton : function () {
					return pressButton(this, "refreshSelectedSalesOrder");
				},
				pressSaveSalesOrderButton : function () {
					return pressButton(this, "saveSalesOrder");
				},
				pressSaveSalesOrdersButton : function () {
					return pressButton(this, "saveSalesOrders");
				},
				pressSetBindingContextButton : function () {
					return pressButton(this, "setBindingContext");
				},
				pressShowSalesOrderSchedules : function () {
					return pressButton(this, "showSalesOrderSchedules");
				},
				pressValueHelpOnProductCategory : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Input",
						// "0" is the index, "field" is the prefix for the control within ValueHelp
						id : /-0-field/,
						success : function (oValueHelp) {
							Opa5.assert.ok(true, "ValueHelp on Product.Category pressed");
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
				resetSalesOrderListChanges : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oTable) {
							oTable.getBinding("items").resetChanges();
							Opa5.assert.ok(true, "SalesOrderList reset by API");
						},
						viewName : sViewName
					});
				},
				selectFirstSalesOrder : function ( bRememberGrossAmount) {
					return selectSalesOrder(this, 0, bRememberGrossAmount);
				},
				selectSalesOrder : function (iIndex) {
					return selectSalesOrder(this, iIndex);
				},
				selectSalesOrderItemWithPosition : function (sPosition) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /SO_2_SOITEM-/,
						matchers : new Properties({text: sPosition}),
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Sales Order Item selected: " + sPosition);
						},
						viewName : sViewName
					});
				},
				selectSalesOrderWithId : function (sSalesOrderId) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /SalesOrderID-/,
						matchers : new Properties({text: sSalesOrderId}),
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				setValueHelpQualifier : function (sQualifier) {
					return this.waitFor({
						controlType : "sap.m.Input",
						// "0" is the index, "field" is the prefix for the control within ValueHelp
						id : /-0-field/,
						success : function (aValueHelps) {
							aValueHelps[0].oParent.setQualifier(sQualifier);
						},
						viewName : sViewName
					});
				},
				sortByGrossAmount : function () {
					return pressButton(this, "sortByGrossAmount");
				},
				sortByGrossAmountViaController : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function () {
							sap.ui.getCore().byId(sViewName).oController.onSortByGrossAmount();
							Opa5.assert.ok(true, "controller.onSortByGrossAmount() called" );
						},
						viewName : sViewName
					});
				},
				sortBySalesOrderID  : function () {
					return pressButton(this, "sortBySalesOrderId");
				},
				sortBySalesOrderIDviaController : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
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
					return Helper.checkButtonDisabled(this, sViewName, sButtonId);
				},
				checkButtonEnabled : function (sButtonId) {
					return Helper.checkButtonEnabled(this, sViewName, sButtonId);
				},
				checkCompanyName : function (iRow, sExpectedCompanyName) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							Opa5.assert.strictEqual(oSalesOrderTable.getItems()[iRow].getCells()
								[COMPANY_NAME_COLUMN_INDEX].getText(), sExpectedCompanyName,
								"CompanyName of row " + iRow + " as expected "
									+ sExpectedCompanyName);
						},
						viewName : sViewName
					});
				},
				checkContactNameInRow : function (iRow, sExpectedContactName) {
					return this.waitFor({
						controlType : "sap.m.List",
						id : "BP_2_CONTACT",
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
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.notStrictEqual(oRow.getCells()[ID_COLUMN_INDEX].getText(),
								sExpectedID,
								"ID of row " + iRow + " is not: " + sExpectedID);
						},
						viewName : sViewName
					});
				},
				checkFavoriteProductID : function () {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "favoriteProductId",
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
						id : "SalesOrderList",
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
								id : "SalesOrderList",
								success : function (oSalesOrderTable) {
									var oRow = oSalesOrderTable.getItems()[iRow];
									if (sExpectedID === undefined) {
										//compare with initial OrderID
										sExpectedID = Opa.getContext().firstSalesOrderId;
									}
									Opa5.assert.strictEqual(
										oRow.getCells()[ID_COLUMN_INDEX].getText(),
										sExpectedID,
										"ID of row " + iRow + " as expected: " + sExpectedID);
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				checkInputValue : function (sID, sValue) {
					return Helper.checkInputValue(this, sViewName, sID, sValue);
				},
				checkInputValueState : function (sID, sState, sMessage) {
					return Helper.checkInputValueState(this, sViewName, sID, sState, sMessage);
				},
				checkMessagesButtonCount : function (iExpectedCount) {
					return this.waitFor({
						controlType : "sap.m.Button",
						id : "showMessages",
						success : function (oButton) {
							Opa5.assert.strictEqual(parseInt(oButton.getText()), iExpectedCount,
								"Message count is as expected: " + iExpectedCount);
						},
						viewName : sViewName
					});
				},
				checkNewSalesOrderItemProductName : function (sExpectProductName) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SOITEM",
						success : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[0];

							Opa5.assert.strictEqual(oRow.getCells()[3].getText(),
								sExpectProductName, "Product name of new created SOItem");
						},
						viewName : sViewName
					});
				},
				checkNote : function (iRow, sExpectedNote, bAutoWait) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : !!bAutoWait, // default: false
						id : "SalesOrderList",
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
				checkNoteValueState : function (iRow, sExpectedState, sExpectedStateText) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oInput = oSalesOrderTable.getItems()[iRow]
									.getCells()[NOTE_COLUMN_INDEX];

							Opa5.assert.strictEqual(oInput.getValueState(), sExpectedState,
								"ValueState of note in row " + iRow + " as expected: "
									+ sExpectedState);
							Opa5.assert.strictEqual(oInput.getValueStateText(), sExpectedStateText,
								"ValueStateText of note in row " + iRow + " as expected: "
									+ sExpectedStateText);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderIdInDetails : function (bChanged) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "SalesOrderID::detail",
						success : function (oInput) {
							var sCurrentId = oInput.getValue(),
								sIdBefore  = Opa.getContext().firstSalesOrderId,
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
						id : "SO_2_SOITEM",
						check : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[iRow],
								sItem,
								sSalesOrderId;
							// if called without 2nd and 3rd parameter use previously stored values
							// for comparison
							sExpectedSalesOrderID = sExpectedSalesOrderID
								|| Opa.getContext().sExpectedSalesOrderID;
							sExpectedItem = sExpectedItem
								|| Opa.getContext().sExpectedItem;

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
					return checkCount(this, iExpectedCount, "lineItemsTitle");
				},
				checkSalesOrderLineItemNote : function (iRow, sNoteValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SOITEM",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.strictEqual(
								oRow.getCells()[SOITEM_NOTE_COLUMN_INDEX].getValue(), sNoteValue,
								"SO Item Note of row " + iRow + " is " + sNoteValue);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderLineItemQuantityValueState : function (iRow, sExpectedValueState,
						sExpectedValueStateText) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SOITEM",
						success : function (oTable) {
							var oInput = oTable.getItems()[iRow]
									.getCells()[SOITEM_QUANTITY_COLUMN_INDEX];

							Opa5.assert.strictEqual(oInput.getValueState(), sExpectedValueState,
								"ValueState of quantity in row " + iRow + " as expected: "
									+ sExpectedValueState);
							Opa5.assert.strictEqual(oInput.getValueStateText(),
								sExpectedValueStateText,
								"ValueStateText of quantity in row " + iRow + " as expected: "
									+ sExpectedValueStateText);
						},
						viewName : sViewName
					});
				},
				checkSalesOrdersCount : function (iExpectedCount) {
					return checkCount(this, iExpectedCount, "salesOrderListTitle");
				},
				checkSalesOrdersSelectionMode : function (sMode) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						matchers : new PropertyStrictEquals({name : "mode", value : sMode}),
						success : function () {
							Opa5.assert.ok(true, "SelectionMode is: " + sMode);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderSelected : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var aTableItems = oSalesOrderTable.getItems();

							Opa5.assert.strictEqual(oSalesOrderTable.getSelectedItem(),
								aTableItems[iRow],
								"Check that Sales Order #" + iRow + " is selected"
							);
						},
						viewName : sViewName
					});
				},
				checkSupplierPhoneNumber : function (sExpectedPhoneNumber) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "PRODUCT_2_BP:PhoneNumber",
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
				cancel : function () {
					return handleMessageBox(this, "Refresh", false, "Cancel 'pending changes'");
				},
				confirm : function () {
					return handleMessageBox(this, "Refresh", true, "Confirm 'pending changes'");
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
							new Press().executeOn(aControls[0].getButtons()[0]); // confirm deletion
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
							new Press().executeOn(aControls[0].getButtons()[0]); // confirm deletion
							Opa5.assert.ok(true, "Confirm Delete Sales Line Item Order");
						}
					});
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "Sales Order Schedules" dialog
		 */
		onTheSalesOrderSchedulesDialog : {
			actions : {
				close : function () {
					return pressButton(this, "closeSalesOrderSchedules", true);
				},
				deleteSalesOrderSchedules : function () {
					return pressButton(this, "deleteSalesOrderSchedules", true);
				},
				selectAll : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.CheckBox",
						id : "SO_2_SCHDL-sa",
						searchOpenDialogs : true,
						success : function (oCheckBox) {
							Opa5.assert.ok(true, "All schedule lines selected");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkLength : function (iLength) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SCHDL",
						searchOpenDialogs : true,
						success : function (oControl) {
							Opa5.assert.strictEqual(oControl.getItems().length, iLength,
								iLength + " schedule lines");
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Simulate Discount" dialog
		 */
		onTheSimulateDiscountDialog : {
			actions : {
				close : function () {
					return pressButton(this, "closeSimulateDiscountDialog", true);
				},
				enterDiscount : function (fDiscount) {
					return Helper.changeStepInputValue(this, sViewName,
						"SimulateDiscountForm::Discount", fDiscount, true);
				},
				executeSimulateDiscount : function () {
					return pressButton(this, "executeSimulateDiscount", true);
				}
			},
			assertions : {
				checkControlValue : function (sID, sValue) {
					return Helper.checkControlValue(this, sViewName, sID, sValue, true);
				},
				checkDiscountValueState : function (sState, sMessage) {
					return this.waitFor({
						controlType : "sap.m.StepInput",
						id : "SimulateDiscountForm::Discount",
						searchOpenDialogs : true,
						success : function (oStepInput) {
							Opa5.assert.strictEqual(oStepInput.getValueState(), sState,
								"checkStepInputValueState('" + oStepInput.getId() + "', '"
									+ sState + "')");
							if (sMessage) {
								Opa5.assert.strictEqual(oStepInput.getValueStateText(), sMessage,
									"ValueStateText: " + sMessage);
							}
						},
						viewName : sViewName
					});
				}
			}
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
			assertions : {
				checkTitle : function (sTitle) {
					return this.waitFor({
						controlType : "sap.m.Title",
						id : /-popover-title$/,
						success : function (aTitles) {
							Opa5.assert.strictEqual(aTitles[0].getText(), sTitle,
								"Expected popover title '" + sTitle + "'");
						}
					});
				}
			}
		}
	});
});