/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/TestUtils"
],
function (Filter, FilterOperator, ODataUtils, _Requestor, Opa5, EnterText, Press, BindingPath,
		Interactable, Properties, TestUtils) {
	"use strict";
	var ID_COLUMN_INDEX = 0,
		NOTE_COLUMN_INDEX = 5,
		SOITEM_NOTE_COLUMN_INDEX = 9,
		ITEM_COLUMN_INDEX = 1,
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
						actions : new Press(),
						controlType : "sap.ui.core.sample.common.ValueHelp",
						matchers : new Interactable(),
						id : "NewCurrencyCode",
						success : function (oValueHelp) {
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
		 * Actions and assertions for the "Error" information dialog
		 */
		onTheErrorInfo : {
			actions : {
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://message-error"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap();
							Opa5.assert.ok(true, "Confirm 'Error'");
						}
					});
				}
			},
			assertions : {}
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
					return this.waitFor({
						actions: new EnterText({clearTextFirst : true, text : sFilterValue}),
						controlType : "sap.m.SearchField",
						id : "filterGrossAmount",
						success : function (oSearchField) {
							Opa5.assert.ok(true, "Filter by GrossAmount:" + sFilterValue);
						},
						viewName : sViewName
					});
				},
				filterSOItemsByProductIdWithChangeParameters : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSOItemsTable) {
							var oRow = oSOItemsTable.getItems()[iRow],
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
						controlType : "sap.m.Text",
						matchers : new BindingPath({path : "/SalesOrderList/0"}),
						success : function (oControl) {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[0].getText();
							sap.ui.test.Opa.getContext().firstSalesOrderId = sSalesOrderId;
							Opa5.assert.ok(true, "First SalesOrderID " + sSalesOrderId);

						}
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
				pressConfirmSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "confirmSalesOrder",
						success : function (oCreateSalesOrderButton) {
							Opa5.assert.ok(true, "Confirm Sales Order button pressed");
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
				rememberCreatedSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						matchers : new BindingPath({path : "/SalesOrderList/0"}),
						success : function (oControl) {
							var oCore = sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[0].getText();
							if (!sap.ui.test.Opa.getContext().aOrderIds) {
								sap.ui.test.Opa.getContext().aOrderIds = [];
							}
							sap.ui.test.Opa.getContext().aOrderIds.push(sSalesOrderId);

							Opa5.assert.ok(true, "SalesOrderID remembered:" + sSalesOrderId);
						}
					});
				},
				selectFirstSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--SalesOrders_ID-/,
						matchers : new BindingPath({path : "/SalesOrderList/0"}),
						success : function (aControls) {
							aControls[0].$().tap();
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
				sortBySalesOrderID  : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "sortBySalesOrderID",
						viewName : sViewName
					});
				},
				// Uses #changeParameters() to delete the 'Note' entry of the $select query option,
				// in order to achieve that the edit text note is not shown anymore
				unselectSODetailsNoteWithChangeParameters : function () {
					return this.waitFor({
						controlType : "sap.m.VBox",
						id : "ObjectPage",
						success : function (oSODetails) {
							oSODetails.getBindingContext().getBinding().changeParameters({
								$select : 'ChangedAt,CreatedAt,LifecycleStatusDesc,SalesOrderID'
							});
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
								sExpectedContactName, "Contact Name in row " + iRow);
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
				checkFirstGrossAmountGreater : function (sAmount) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var sAmount,
								aTableItems = oSalesOrderTable.getItems();
							if (aTableItems.length > 0) {
								sAmount = aTableItems[0].getBindingContext()
									.getProperty("GrossAmount");
								Opa5.assert.ok(ODataUtils.compare(sAmount, "1000", true) > 0);
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
				checkLog : function (aExpected) {
					return this.waitFor({
						success : function (oControl) {
							var aLogEntries = jQuery.sap.log.getLogEntries(),
								iStartIndex = sap.ui.test.Opa.getContext().iNextLogIndex || 0;

							function isExpected(oLog) {
								if (!aExpected) {
									return false;
								}
								return aExpected.some(function (oExpected, i) {
									if (oLog.component === oExpected.component &&
											oLog.level === oExpected.level &&
											oLog.message.indexOf(oExpected.message) >= 0) {
										aExpected.splice(i, 1);
										return true;
									}
								});
							}

							sap.ui.test.Opa.getContext().iNextLogIndex = aLogEntries.length;
							aLogEntries.splice(iStartIndex).forEach(function (oLog) {
								var sComponent = oLog.component || "";

								if ((sComponent.indexOf("sap.ui.model.odata.v4.") === 0
										|| sComponent.indexOf("sap.ui.model.odata.type.") === 0)
										&& oLog.level <= jQuery.sap.log.Level.WARNING) {
									if (isExpected(oLog)) {
										Opa5.assert.ok(true,
											"Expected Warning or error found: " + sComponent
											+ " Level: " + oLog.level
											+ " Message: " + oLog.message );
									} else {
										Opa5.assert.ok(false,
											"Unexpected warning or error found: " + sComponent
											+ " Level: " + oLog.level
											+ " Message: " + oLog.message );
									}
								}
							});
							if (aExpected) {
								aExpected.forEach(function (oExpected) {
								Opa5.assert.ok(false,
									"Expected warning or error not logged: " + oExpected.component
									+ " Level: " + oExpected.level
									+ " Message: " + oExpected.message );
								});
							}
							Opa5.assert.ok(true, "Log checked");
						}
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
				checkSalesOrderDetailsNote: function () {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "Note",
						success : function (oSONote) {
							Opa5.assert.strictEqual(oSONote.getValue(), "");
						},
						viewName : sViewName
					});
				},
				checkSalesOrderIdInDetailsChanged : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "Details_SalesOrderID",
						success : function (oText) {
							Opa5.assert.notStrictEqual(
								oText.getText(),
								sap.ui.test.Opa.getContext().firstSalesOrderId,
								"Current sales order ID in 'Sales Order Details'" + oText.getText()
									+ ", previous " + sap.ui.test.Opa.getContext().firstSalesOrderId
							);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemInRow : function (iRow, sExpectedSalesOrderID, sExpectedItem) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderLineItems",
						success : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[iRow];

							// if called without 2nd and 3rd parameter use previously stored values
							// for comparison
							sExpectedSalesOrderID = sExpectedSalesOrderID
								|| sap.ui.test.Opa.getContext().sExpectedSalesOrderID;
							sExpectedItem = sExpectedItem
								|| sap.ui.test.Opa.getContext().sExpectedItem;

							Opa5.assert.strictEqual(oRow.getCells()[ID_COLUMN_INDEX].getText(),
								sExpectedSalesOrderID, "Sales Order ID in row " + iRow);
							Opa5.assert.strictEqual(oRow.getCells()[ITEM_COLUMN_INDEX].getText(),
								sExpectedItem, "Item position in row " + iRow);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderItemsCount : function (iExpectedCount) {
					return checkCount(this, iExpectedCount, "SalesOrderLineItemsTitle");
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
								sExpectedPhoneNumber);
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
				},
				cleanUp : function() {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var aPromises = [],
								bCleanUpFinished = false,
								// use private requestor to prevent additional read requests(ETag)
								// which need additional mockdata
								oRequestor = oSalesOrderTable.getModel().oRequestor;
							sap.ui.test.Opa.getContext().aOrderIds.forEach(function (sOrderId) {
								aPromises.push(oRequestor.request("DELETE",
									"SalesOrderList('" + sOrderId + "')", "Cleanup",
									{"If-Match" : "*"}));
								Opa5.assert.ok(true, "Cleanup; delete SalesOrder:" + sOrderId);
							});
							sap.ui.test.Opa.getContext().aOrderIds = [];
							oRequestor.submitBatch("Cleanup").then(function () {
								Opa5.assert.ok(true, "Cleanup finished");
								bCleanUpFinished = true;
							}, function (oError) {
								Opa5.assert.ok(false, "Cleanup failed: " + oError.message);
								bCleanUpFinished = true;
							});
							return this.waitFor({
								check : function() {
									return bCleanUpFinished;
								}
							});
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
		},
		/*
		 * Actions and assertions for the "Success" information dialog
		 */
		onTheSuccessInfo : {
			actions : {
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({icon : "sap-icon://message-success"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap();
							Opa5.assert.ok(true, "Confirm 'Success'");
						}
					});
				}
			},
			assertions : {}
		}
	});
});