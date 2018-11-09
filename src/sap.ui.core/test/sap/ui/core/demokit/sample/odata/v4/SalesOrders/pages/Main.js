/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
], function (MessageBox, Helper, Filter, FilterOperator, ODataUtils, QUnitUtils, Opa5, EnterText,
		Press, Interactable, Properties) {
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
					sap.ui.test.Opa.getContext().GrossAmount =
						oItem.getCells()[GROSS_AMOUNT_COLUMN_INDEX]
							.getBinding("text").getValue();
				}
			},
			viewName : sViewName
		});
	}

	function pressButton(oOpa5, sId) {
		return Helper.pressButton(oOpa5, sViewName, sId);
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
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Note text set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				confirmDialog : function () {
					return pressButton(this, "confirmCreateSalesOrder");
				},
				pressValueHelpOnCurrencyCode : function () {
					return this.waitFor({
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : "CurrencyCode::new",
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
				changeNoteInFirstLineItem : function (sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : /.*SO_2_SOITEM:Note.*-0/,
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
						id : /--Note-__clone/,
						success : function (oControls) {
							Opa5.assert.ok(true,
								"Note of Sales Order " + oControls[0].getBindingContext().getPath()
									+ " set to " + sValue);
						},
						viewName : sViewName
					});
				},
				changeQuantityInFirstLineItem : function (sValue) {
					return this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : /.*SO_2_SOITEM:Quantity.*-0/,
						success : function () {
							Opa5.assert.ok(true, "SO Item Quantity of first row set to " + sValue);
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
						oNewContext.created().then(function() {
							MessageBox.success("SalesOrder created: " +
								oNewContext.getProperty("SalesOrderID"));
							});
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrder : function () {
					return pressButton(this, "deleteSalesOrder");
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
							sap.ui.test.Opa.getContext().sExpectedSalesOrderID =
								oRow.getCells()[ID_COLUMN_INDEX].getText();
							sap.ui.test.Opa.getContext().sExpectedItem =
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
							sap.ui.test.Opa.getContext().firstSalesOrderId = sSalesOrderId;
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
								=== sap.ui.test.Opa.getContext().firstSalesOrderId;
						},
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(true, "First SalesOrderID: " +
								oSalesOrderTable.getItems()[0].getCells()[0].getText());
						},
						viewName : sViewName
					});
				},
				pressBackToMessagesButton : function (sMessage) {
					return this.waitFor({
						controlType : "sap.m.Page",
						id : /-messageView-detailsPage/,
						success : function (aPages) {
							var $page = aPages[0].getDomRef();

							QUnitUtils.triggerEvent("tap",
								$page.getElementsByClassName("sapMMsgViewBackBtn")[0]);
							Opa5.assert.ok(true, "Back to Messages button pressed");
						}
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
					return pressButton(this, "createSalesOrder");
				},
				pressDeleteBusinessPartnerButton : function () {
					return pressButton(this, "deleteBusinessPartner");
				},
				pressMessagesButton : function () {
					return pressButton(this, "showMessages");
				},
				pressMessagePopoverCloseButton : function () {
					return this.waitFor({
						controlType : "sap.m.MessagePopover",
						success : function (aMessagePopover) {
							aMessagePopover[0].close();
							Opa5.assert.ok(true, "MessagePopover closed");
						}
					});
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
				rememberCreatedSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						success : function () {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrderList")
									.getItems()[0].getCells()[ID_COLUMN_INDEX].getText();
							if (!sap.ui.test.Opa.getContext().aOrderIds) {
								sap.ui.test.Opa.getContext().aOrderIds = [];
							}
							if (sap.ui.test.Opa.getContext().aOrderIds.indexOf(sSalesOrderId) < 0) {
								sap.ui.test.Opa.getContext().aOrderIds.push(sSalesOrderId);
							}

							Opa5.assert.ok(true, "SalesOrderID remembered:" + sSalesOrderId);
						}
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
				selectMessage : function (sMessage) {
					return this.waitFor({
						controlType : "sap.m.StandardListItem",
						matchers : new Properties({title: sMessage}),
						success : function (aItems) {
							if (aItems.length === 1) {
								QUnitUtils.triggerEvent("tap", aItems[0].getDomRef());
								Opa5.assert.ok(true, "Message selected: " + sMessage);
							} else {
								Opa5.assert.ok(false, "Duplicate Message: " + sMessage);
							}
						}
					});
				},
				selectSalesOrder : function (iIndex) {
					return selectSalesOrder(this, iIndex);
				},
				selectSalesOrderItemWithPosition : function (sPosition) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--SO_2_SOITEM-/,
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
						id : /--SalesOrderID-/,
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
										sExpectedID =
											sap.ui.test.Opa.getContext().firstSalesOrderId;
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
					return this.waitFor({
						controlType : "sap.m.Input",
						id : sID,
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValue(),
								sValue, "checkInputValue('" + sID + "', '" + sValue + "')");
						},
						viewName : sViewName
					});
				},
				checkInputValueState : function (sID, sState) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : sID,
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValueState(), sState,
								"checkInputValueState('" + sID + "', '" + sState + "')");
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
				checkNote : function (iRow, sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
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
				checkNoteValueState : function (iRow, sExpectedValueState, sExpectedValueStateText) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oInput = oSalesOrderTable.getItems()[iRow]
									.getCells()[NOTE_COLUMN_INDEX];

							Opa5.assert.strictEqual(oInput.getValueState(), sExpectedValueState,
								"ValueState of note in row " + iRow + " as expected: "
									+ sExpectedValueState);
							Opa5.assert.strictEqual(oInput.getValueStateText(),
								sExpectedValueStateText,
								"ValueStateText of note in row " + iRow + " as expected: "
									+ sExpectedValueStateText);
						},
						viewName : sViewName
					});
				},
				checkMessageCount : function (iExpectedCount) {
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
				checkMessageDetails : function (sMessage, sExpectedDetails) {
					return this.waitFor({
						id : /-messageViewMarkupDescription/,
						success : function (aDetailsHtml) {
							Opa5.assert.strictEqual(aDetailsHtml.length, 1);
							Opa5.assert.ok(aDetailsHtml[0].getContent().includes(sExpectedDetails),
								"Check Message Details: Details for message '" + sMessage
									+ " as expected: " + sExpectedDetails);
						}
					});
				},
				/*
				 * Checks whether the given array of messages matches the displayed messages
				 * {object[]} aExpectedMessages - Expected messages
				 * {string} aExpectedMessages.message - Expected message text
				 * {sap.ui.core.MessageType} aExpectedMessages.type - Expected message type
				 */
				checkMessages : function (aExpectedMessages) {
					return this.waitFor({
						controlType : "sap.m.MessagePopover",
						success : function (aMessagePopover) {
							var iExpectedCount = aExpectedMessages.length,
								aItems = aMessagePopover[0].getItems();

							Opa5.assert.strictEqual(aItems.length, iExpectedCount,
								"Check Messages: message count is as expected: " + iExpectedCount);
							aExpectedMessages.forEach(function (oExpectedMessage, i) {
								var bFound = aItems.some(function(oItem) {
									return oItem.getTitle() === oExpectedMessage.message &&
										oItem.getType() === oExpectedMessage.type;
								});
								Opa5.assert.ok(bFound, "Check Messages: expected message[" + i
									+ "]: " + oExpectedMessage.message + " type: "
									+ oExpectedMessage.type);
							});
						}
					});
				},
				checkSalesOrderIdInDetails : function (bChanged) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "SalesOrderID::detail",
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
						id : "SO_2_SOITEM",
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
		}
	});
});