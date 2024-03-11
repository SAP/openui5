/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
], function (Element, Helper, Filter, FilterOperator, ODataUtils, Opa, Opa5, TestUtils, EnterText,
		Press, Ancestor, Interactable, Properties) {
	"use strict";
	var COMPANY_NAME_COLUMN_INDEX = 1,
		GROSS_AMOUNT_COLUMN_INDEX = 2,
		ID_COLUMN_INDEX = 0,
		ITEM_COLUMN_INDEX = 1,
		NOTE_COLUMN_INDEX = 4,
		SOITEM_NOTE_COLUMN_INDEX = 11,
		sLastNewNoteValue,
		sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

	/*
	 * Search for the control with the given ID, extract the number and compare with the expected
	 * count and optional expected overall count.
	 */
	function checkCount(oOpa, iExpectedCount, sTitleId, iExpectedOverallCount) {
		if (TestUtils.isRealOData()) {
			return; // checkCount not possible with realOData=true
		}

		oOpa.waitFor({
			id : sTitleId,
			success : function (oTitle) {
				Opa5.assert.strictEqual(
					// extract number from title
					Number(oTitle.getText().split(" ")[0]),
					iExpectedCount,
					"Expected count for " + sTitleId + ": " + iExpectedCount);
				if (iExpectedOverallCount !== undefined) {
					Opa5.assert.strictEqual(
						// extract number from title "... (xyz overall)"
						Number(oTitle.getText().split("(")[1].split(" ")[0]),
						iExpectedOverallCount,
						"Expected overall count for " + sTitleId + ": " + iExpectedOverallCount);
				}
			},
			viewName : sViewName
		});
	}

	function handleMessageBox(oOpa, sTitle, bConfirm, sLog) {
		oOpa.waitFor({
			controlType : "sap.m.Dialog",
			matchers : new Properties({title : sTitle}),
			success : function (aControls) {
				new Press().executeOn(aControls[0].getButtons()[bConfirm ? 0 : 1]);
				Opa5.assert.ok(true, sLog || (bConfirm ? "Confirm " : "Cancel ") + sTitle);
			}
		});
	}

	function selectSalesOrder(oOpa, iIndex, bRememberGrossAmount) {
		oOpa.waitFor({
			controlType : "sap.m.Table",
			id : "SalesOrderList",
			success : function (oTable) {
				var oItem = oTable.getItems()[iIndex],
					oControl = oItem.getCells()[ID_COLUMN_INDEX];

				new Press().executeOn(oControl);
				Opa5.assert.ok(true, "Sales Order selected: "
					+ oControl.getText());
				if (bRememberGrossAmount) {
					Opa.getContext().GrossAmount
						= oItem.getCells()[GROSS_AMOUNT_COLUMN_INDEX].getText();
				}
			},
			viewName : sViewName
		});
	}

	function pressButton(oOpa5, sId, bSearchOpenDialogs) {
		Helper.pressButton(oOpa5, sViewName, sId, bSearchOpenDialogs);
	}

	Opa5.createPageObjects({
		/*
		 * Actions and assertions for the "Create Sales Order" dialog
		 */
		onTheCreateNewSalesOrderDialog : {
			actions : {
				changeNote : function (sNewNoteValue) {
					Helper.changeInputValue(this, sViewName, "Note::new", sNewNoteValue, undefined,
						true);
				},
				confirmDialog : function () {
					pressButton(this, "confirmCreateSalesOrder", true);
				},
				pressValueHelpOnCurrencyCode : function () {
					this.waitFor({
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
					this.waitFor({
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
					Helper.checkInputValue(this, sViewName, "BuyerID::new", sExpectedBuyerID,
						undefined, true);
				},
				// store note value in sLastNewNoteValue and check note value if sExpectedNote is
				// not empty
				checkNewNote : function (sExpectedNote) {
					this.waitFor({
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
					Helper.changeInputValue(this, sViewName, "Note::detail", sValue);
				},
				changeNoteInLineItem : function (iRow, sValue) {
					Helper.changeInputValue(this, sViewName, /SO_2_SOITEM:Note/, sValue, iRow);
				},
				changeNoteInSalesOrders : function (iRow, sValue) {
					Helper.changeInputValue(this, sViewName, /Note::list/, sValue, iRow);
				},
				changeProductIDinLineItem : function (iRow, sProductID) {
					this.waitFor({
						// actions : new EnterText({clearTextFirst : true, text : sProductID}),
						actions : function (oValueHelp) {
							oValueHelp.setValue(sProductID);
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SO_2_SOITEM:ProductID/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(sProductID, aControls[0].getValue(),
								"ProductID changed to: " + sProductID);
						},
						viewName : sViewName
					});
				},
				changeQuantityInLineItem : function (iRow, sValue) {
					Helper.changeInputValue(this, sViewName, /SO_2_SOITEM:Quantity/, sValue, iRow);
				},
				createInvalidSalesOrderViaAPI : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oTable) {
							var oBinding = oTable.getBinding("items"),
								oNewContext = oBinding.create({
								BuyerID : "0100000000",
								LifecycleStatus : "N",
								Note : "RAISE_ERROR"
							});

						oNewContext.created().then(function () {
							var sSalesOrderID = oNewContext.getProperty("SalesOrderID");

							Opa5.assert.ok(true, "Sales order created (via API): " + sSalesOrderID);
							oBinding.filter(
								new Filter("SalesOrderID", FilterOperator.EQ, sSalesOrderID)
							);
							Opa5.assert.ok(true, "Filter for the new sales order: "
								+ sSalesOrderID);
							});
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrder : function () {
					pressButton(this, "deleteSalesOrder");
				},
				deleteSelectedSalesOrderLineItem : function () {
					pressButton(this, "deleteSalesOrderLineItem");
				},
				deleteSelectedSalesOrderViaGroupId : function (sGroupId) {
					this.waitFor({
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
					this.waitFor({
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
					this.waitFor({
						controlType : "sap.m.SearchField",
						id : "filterGrossAmount",
						success : function () {
							sFilterValue ??= Opa.getContext().GrossAmount;
							this.waitFor({
								actions :
									new EnterText({clearTextFirst : true, text : sFilterValue}),
								controlType : "sap.m.SearchField",
								id : "filterGrossAmount",
								success : function () {
									Opa5.assert.ok(true, "Filter by GrossAmount:" + sFilterValue);
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				filterGrossAmountViaAPI : function (sFilterValue) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oTable) {
							oTable.getBinding("items").filter(
								new Filter("GrossAmount", FilterOperator.GT, sFilterValue));
							Opa5.assert.ok(true, "Filtered SalesOrders via API by GrossAmount > "
								+ sFilterValue);
						},
						viewName : sViewName
					});
				},
				filterSOItemsByProductIdWithChangeParameters : function (iRow) {
					this.waitFor({
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
							oRow = oSOItemsTable.getItems()[iRow];
							sProductID = oRow.getCells()[2].getValue();
							// store sales order id and item postion for later comparison
							Opa.getContext().sExpectedSalesOrderID
								= oRow.getCells()[ID_COLUMN_INDEX].getText();
							Opa.getContext().sExpectedItem
								= oRow.getCells()[ITEM_COLUMN_INDEX].getText();

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
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SOITEM",
						success : function (oSalesOrderItemsTable) {
							// Note: filter cannot be invoked via UI; field is disabled
							oSalesOrderItemsTable.getBinding("items")
								.filter(new Filter("ProductID", FilterOperator.EQ, sValue));
						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsVisible : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						check : function (oSalesOrderTable) {
							return oSalesOrderTable.getItems().length > 0;
						},
						success : function () {
							var sSalesOrderId = Element.getElementById(sViewName)
									.byId("SalesOrderList").getItems()[0].getCells()[0].getText();

							Opa.getContext().firstSalesOrderId = sSalesOrderId;
							Opa5.assert.ok(true, "First SalesOrderID: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsAtPos0 : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						check : function (oSalesOrderTable) {
							return oSalesOrderTable.getItems()[0].getCells()[0].getText()
								=== Opa.getContext().firstSalesOrderId;
						},
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(true, "First SalesOrderID: "
								+ oSalesOrderTable.getItems()[0].getCells()[0].getText());
						},
						viewName : sViewName
					});
				},
				increaseSalesOrderItemsQuantity : function () {
					Helper.pressButton(this, sViewName, "increaseSalesOrderItemsQuantity");
				},
				modifyCompanyName : function () {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "CompanyName::detail",
						success : function () {
							Helper.changeInputValue(this, sViewName, "CompanyName::detail",
								Opa.getContext().CompanyName + " - modified by OPA");
						},
						viewName : sViewName
					});
				},
				pressCancelSalesOrderChangesButton : function () {
					pressButton(this, "cancelSalesOrderChanges");
				},
				pressCancelSalesOrderListChangesButton : function () {
					pressButton(this, "cancelSalesOrderListChanges");
				},
				pressCancelSelectedSalesOrderChangesButton : function () {
					pressButton(this, "cancelSelectedSalesOrderChanges");
				},
				pressCancelStrictModeButton : function () {
					pressButton(this, "cancelStrictMode", true);
				},
				pressConfirmSalesOrderButton : function () {
					pressButton(this, "confirmSalesOrder");
				},
				pressCreateSalesOrderItemButton : function () {
					pressButton(this, "createSalesOrderLineItem");
				},
				pressCreateSalesOrdersButton : function () {
					pressButton(this, "createSalesOrder");
					if (TestUtils.isRealOData()) {
						// remember created sales order for cleanup
						this.waitFor({success : function () {
							var oCreated = Element.getElementById(sViewName).byId("SalesOrderList")
									.getItems()[0].getBindingContext();

							oCreated.created().then(function () {
								var aCreatedEntityPaths = Opa.getContext().aCreatedEntityPaths,
									sPath = oCreated.getPath();

								if (!aCreatedEntityPaths) {
									Opa.getContext().aCreatedEntityPaths = aCreatedEntityPaths = [];
								}
								aCreatedEntityPaths.push(sPath);
								Opa5.assert.ok(true, "Remembered SalesOrder: " + sPath);
							}, function () { /* ignore */ });
						}});
					}
				},
				pressConfirmStrictModeButton : function () {
					pressButton(this, "confirmStrictMode", true);
				},
				pressDeleteBusinessPartnerButton : function () {
					pressButton(this, "deleteBusinessPartner");
				},
				pressMessagesButton : function () {
					pressButton(this, "showMessages");
				},
				pressMoreButton : function () {
					Helper.pressMoreButton(this, sViewName, "SalesOrderList");
				},
				pressOpenSimulateDiscountDialog : function () {
					pressButton(this, "openSimulateDiscountDialog");
				},
				pressRefreshAllButton : function () {
					pressButton(this, "refreshAll");
				},
				pressRefreshSalesOrdersButton : function () {
					pressButton(this, "refreshSalesOrders");
				},
				pressRefreshSelectedSalesOrderButton : function () {
					pressButton(this, "refreshSelectedSalesOrder");
				},
				pressUndoSalesOrderDeletionButton : function () {
					pressButton(this, "undoSalesOrderDeletion");
				},
				pressSaveSalesOrderButton : function () {
					pressButton(this, "saveSalesOrder");
				},
				pressSaveSalesOrdersButton : function () {
					pressButton(this, "saveSalesOrders");
				},
				pressSetBindingContextButton : function () {
					pressButton(this, "setBindingContext");
				},
				pressShowSalesOrderSchedules : function () {
					pressButton(this, "showSalesOrderSchedules");
				},
				pressValueHelpOnProductCategory : function () {
					this.waitFor({
						actions : function (oControl) {
							new Press().executeOn(oControl.getAggregation("field"));
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SOITEM_2_PRODUCT:Category/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 1;
						},
						success : function (oControls) {
							Opa5.assert.ok(true, "ValueHelp pressed: " + oControls[0].getValue());
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnProductID : function (iRow) {
					this.waitFor({
						actions : function (oControl) {
							new Press().executeOn(oControl.getAggregation("field"));
						},
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SO_2_SOITEM:ProductID/,
						success : function (oControls) {
							Opa5.assert.ok(true, "ValueHelp pressed: " + oControls[0].getValue());
						},
						viewName : sViewName
					});
				},
				pressValueHelpOnProductTypeCode : function () {
					this.waitFor({
						actions : function (oControl) {
							new Press().executeOn(oControl.getAggregation("field"));
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SOITEM_2_PRODUCT:TypeCode/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 1;
						},
						success : function (oControls) {
							Opa5.assert.ok(true, "ValueHelp pressed: " + oControls[0].getValue());
						},
						viewName : sViewName
					});
				},
				rememberCompanyName : function () {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "CompanyName::detail",
						success : function (oInput) {
							var oOpaContext = Opa.getContext();

							oOpaContext.CompanyName = oInput.getValue();
							Opa5.assert.ok(oOpaContext.CompanyName, "Remembered Company Name: "
								+ oOpaContext.CompanyName);
						},
						viewName : sViewName
					});
				},
				resetSalesOrderListChanges : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oTable) {
							oTable.getBinding("items").resetChanges();
							Opa5.assert.ok(true, "SalesOrderList reset by API");
						},
						viewName : sViewName
					});
				},
				restoreCompanyName : function () {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "CompanyName::detail",
						success : function () {
							Helper.changeInputValue(this, sViewName, "CompanyName::detail",
								Opa.getContext().CompanyName);
						},
						viewName : sViewName
					});
				},
				selectFirstSalesOrder : function (bRememberGrossAmount) {
					selectSalesOrder(this, 0, bRememberGrossAmount);
				},
				selectSalesOrder : function (iIndex) {
					selectSalesOrder(this, iIndex);
				},
				selectSalesOrderItemWithPosition : function (sPosition) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Text",
						id : /SO_2_SOITEM-/,
						matchers : new Properties({text : sPosition}),
						success : function () {
							Opa5.assert.ok(true, "Sales Order Item selected: " + sPosition);
						},
						viewName : sViewName
					});
				},
				selectSalesOrderWithId : function (sSalesOrderId) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /SalesOrderID-/,
						matchers : new Properties({text : sSalesOrderId}),
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				setFilter : function (sFilterKey) {
					this.waitFor({
						id : "itemFilter",
						actions : function (oFilter) {
							oFilter.setSelectedKey(sFilterKey);
							oFilter.fireEvent("change");
						},
						success : function (oFilter) {
							Opa5.assert.strictEqual(oFilter.getSelectedKey(), sFilterKey,
								"Filter applied to " + sFilterKey);
						},
						viewName : sViewName
					});
				},
				setValueHelpQualifier : function (sQualifier) {
					this.waitFor({
						actions : function (oControl) {
							oControl.setQualifier(sQualifier);
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SOITEM_2_PRODUCT:Category/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 1;
						},
						success : function (oControls) {
							Opa5.assert.ok(true, "Qualifier Set to: " + sQualifier
								+ " for ValueHelp: " + oControls[0].getValue());
						},
						viewName : sViewName
					});
				},
				sortByGrossAmount : function () {
					pressButton(this, "sortByGrossAmount");
				},
				sortByGrossAmountViaController : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function () {
							Element.getElementById(sViewName).getController().onSortByGrossAmount();
							Opa5.assert.ok(true, "controller.onSortByGrossAmount() called");
						},
						viewName : sViewName
					});
				},
				sortBySalesOrderID : function () {
					pressButton(this, "sortBySalesOrderId");
				},
				sortBySalesOrderIDviaController : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function () {
							Element.getElementById(sViewName).getController()
								.onSortBySalesOrderID();
							Opa5.assert.ok(true, "controller.onSortBySalesOrderID() called");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkButtonDisabled : function (sButtonId) {
					Helper.checkButtonDisabled(this, sViewName, sButtonId);
				},
				checkButtonEnabled : function (sButtonId) {
					Helper.checkButtonEnabled(this, sViewName, sButtonId);
				},
				checkCompanyName : function (iRow, sExpectedCompanyName) {
					this.waitFor({
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
				checkCompanyNameModified : function () {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "CompanyName::detail",
						success : function (oInput) {
							var sBuyerID = oInput.getBindingContext()
									.getProperty("SO_2_BP/BusinessPartnerID"),
								sExpectedCompanyName = Opa.getContext().CompanyName
									+ " - modified by OPA";

							Opa5.assert.strictEqual(oInput.getValue(), sExpectedCompanyName,
								"Company Name is: " + sExpectedCompanyName);

							// check company names in sales order list
							this.waitFor({
								controlType : "sap.m.Table",
								id : "SalesOrderList",
								success : function (oSalesOrderTable) {
									var iChecked = 0;

									oSalesOrderTable.getItems().filter(function (oItem) {
										return oItem.getBindingContext()
											.getProperty("SO_2_BP/BusinessPartnerID") === sBuyerID;
									}).every(function (oItem) {
										iChecked += 1;
										Opa5.assert.strictEqual(
											oItem.getCells()[COMPANY_NAME_COLUMN_INDEX].getText(),
											sExpectedCompanyName,
											"SalesOrderID: "
												+ oItem.getCells()[ID_COLUMN_INDEX].getText()
												+ " company Name is: " + sExpectedCompanyName);
										return true;
									});
									Opa5.assert.ok(iChecked, "Company Name checked in " + iChecked
										+ " rows");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				checkContactNameInRow : function (iRow, sExpectedContactName) {
					this.waitFor({
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
					this.waitFor({
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
					Helper.checkInputValue(this, sViewName, "favoriteProductId", "HT-1000");
				},
				checkFirstGrossAmountGreater : function (sExpectedAmount) {
					this.waitFor({
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
				checkFirstSalesOrderChanged : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						check : function (oSalesOrderTable) {
							var sActual = oSalesOrderTable.getItems()[0].getCells()[0].getText(),
								sExpected = Opa.getContext().firstSalesOrderId;

							return sActual !== sExpected;
						},
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(true, "First SalesOrderID changed from: "
								+ Opa.getContext().firstSalesOrderId + " to: "
								+ oSalesOrderTable.getItems()[0].getCells()[0].getText());
						},
						viewName : sViewName
					});
				},
				checkHighlight : function (iRow, sHighlight) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.strictEqual(oRow.getHighlight(), sHighlight,
								"Highlighted correctly");
						},
						viewName : sViewName
					});
				},
				checkID : function (iRow, sExpectedID) {
					var that = this;

					this.waitFor({
						controlType : "sap.m.Button",
						id : "refreshSalesOrders",
						// we wait for the refresh button becomes interactable before checking the
						// Sales Orders list
						matchers : new Interactable(),
						success : function () {
							that.waitFor({
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
					Helper.checkInputValue(this, sViewName, sID, sValue);
				},
				checkInputValueState : function (sID, sState, sMessage) {
					Helper.checkValueState(this, sViewName, sID, sState, sMessage);
				},
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
				/*
				 * Checks if a message strip with the given type is shown for the given table.
				 *
				 * @param {string} sTableId
				 *   Table control id
				 * @param {string} [sExpectedMessageType]
				 *   The expected message type; undefined if no message strip is expected
				 */
				checkMessageStrip : function (sTableId, sExpectedMessageType) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : sTableId,
						success : function (oTable) {
							this.waitFor({
								controlType : "sap.m.MessageStrip",
								matchers : new Ancestor(oTable),
								success : function (aControls) {
									var oMessageStrip = aControls[0];

									if (oMessageStrip.getVisible()) {
										Opa5.assert.strictEqual(oMessageStrip.getType(),
											sExpectedMessageType,
											"Message strip in table " + sTableId
												+ " shows correct message type: "
												+ sExpectedMessageType);
									} else {
										Opa5.assert.strictEqual(sExpectedMessageType, undefined,
											"Message strip in table " + sTableId + " is invisible");
									}
								},
								viewName : sViewName,
								visible : false
							});
						},
						viewName : sViewName
					});
				},
				checkNewSalesOrderItemProductName : function (sExpectProductName) {
					this.waitFor({
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
					this.waitFor({
						controlType : "sap.m.Table",
						autoWait : !!bAutoWait, // default: false
						id : "SalesOrderList",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							sExpectedNote ??= sLastNewNoteValue;
							Opa5.assert.strictEqual(oRow.getCells()[NOTE_COLUMN_INDEX].getValue(),
								sExpectedNote,
								"Note of row " + iRow + " as expected " + sExpectedNote);
						},
						viewName : sViewName
					});
				},
				checkNoteInDetails : function (sExpectedNote) {
					Helper.checkInputValue(this, sViewName, "Note::detail", sExpectedNote);
				},
				checkNoteValueState : function (iRow, sValueState, sValueStateText) {
					Helper.checkValueState(this, sViewName, /Note::list/, sValueState,
						sValueStateText, false, iRow);
				},
				checkObjectPageInvisible : function () {
					this.waitFor({
						controlType : "sap.m.VBox",
						id : "objectPage",
						success : function (oPage) {
							Opa5.assert.notOk(oPage.getVisible(), "Object page invisible");
						},
						viewName : sViewName,
						visible : false
					});
				},
				checkSalesOrderIdInDetails : function (bChanged) {
					this.waitFor({
						controlType : "sap.m.Input",
						id : "SalesOrderID::detail",
						success : function (oInput) {
							var sCurrentId = oInput.getValue(),
								sIdBefore = Opa.getContext().firstSalesOrderId,
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
					this.waitFor({
						controlType : "sap.m.Table",
						id : "SO_2_SOITEM",
						check : function (oSalesOrderItemsTable) {
							var oRow = oSalesOrderItemsTable.getItems()[iRow],
								sItem,
								sSalesOrderId;

							// if called without 2nd and 3rd parameter use previously stored values
							// for comparison
							sExpectedSalesOrderID ??= Opa.getContext().sExpectedSalesOrderID;
							sExpectedItem ??= Opa.getContext().sExpectedItem;

							if (oRow) {
								sSalesOrderId = oRow.getCells()[ID_COLUMN_INDEX].getText();
								sItem = oRow.getCells()[ITEM_COLUMN_INDEX].getText();
								if (sSalesOrderId === sExpectedSalesOrderID
										&& sItem === sExpectedItem) {
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
					checkCount(this, iExpectedCount, "lineItemsTitle");
				},
				checkSalesOrderLineItemGrossAmount : function (iRow, sValue) {
					Helper.checkTextValue(this, sViewName, /SO_2_SOITEM:GrossAmount/, sValue, iRow);
				},
				checkSalesOrderLineItemNote : function (iRow, sNoteValue) {
					this.waitFor({
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
				checkSalesOrderLineItemQuantity : function (iRow, sValue) {
					Helper.checkInputValue(this, sViewName, /SO_2_SOITEM:Quantity/, sValue, iRow);
				},
				checkProductNameInLineItem : function (iRow, sProductName) {
					this.waitFor({
						controlType : "sap.m.Text",
						id : /SOITEM_2_PRODUCT:Name/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sProductName,
								"Product Name is " + sProductName);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderLineItemQuantityValueState : function (iRow, sValueState,
						sValueStateText) {
					Helper.checkValueState(this, sViewName, /SO_2_SOITEM:Quantity/, sValueState,
						sValueStateText, false, iRow);
				},
				checkSalesOrderLineItemProductIDValueState : function (iRow, sValueState,
						sValueStateText) {
					Helper.checkValueState(this, sViewName, /SO_2_SOITEM:ProductID.*\d$/,
						sValueState, sValueStateText, false, iRow);
				},
				checkSalesOrdersCount : function (iExpectedCount, iExpectedOverallCount) {
					checkCount(this, iExpectedCount, "salesOrderListTitle", iExpectedOverallCount);
				},
				checkSalesOrderSelected : function (iRow) {
					this.waitFor({
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
					Helper.checkInputValue(this, sViewName, "PRODUCT_2_BP:PhoneNumber",
						sExpectedPhoneNumber);
				},
				checkTableLength : function (iExpectedLength, sTableId) {
					this.waitFor({
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
				checkUndoSalesOrderDeletionButtonIsEnabled : function (bEnabled) {
					this.waitFor({
						controlType : "sap.m.Button",
						enabled : bEnabled,
						id : "undoSalesOrderDeletion",
						success : function (oPage) {
							Opa5.assert.strictEqual(oPage.getEnabled(), bEnabled,
								"Undo Button is " + (bEnabled ? "enabled" : "disabled"));
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
					handleMessageBox(this, "Refresh", false, "Cancel 'pending changes'");
				},
				confirm : function () {
					handleMessageBox(this, "Refresh", true, "Confirm 'pending changes'");
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
					pressButton(this, "closeSalesOrderSchedules", true);
				},
				deleteSalesOrderSchedules : function () {
					pressButton(this, "deleteSalesOrderSchedules", true);
				},
				selectAll : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.CheckBox",
						id : "SO_2_SCHDL-sa",
						searchOpenDialogs : true,
						success : function () {
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
					pressButton(this, "closeSimulateDiscountDialog", true);
				},
				enterDiscount : function (sDiscount) {
					Helper.changeStepInputValue(this, sViewName,
						"SimulateDiscountForm::Discount", sDiscount, sDiscount, true);
				},
				invokeSimulateDiscount : function () {
					pressButton(this, "invokeSimulateDiscount", true);
				}
			},
			assertions : {
				checkApproverValueState : function (sValueState, sValueStateText) {
					Helper.checkValueState(this, sViewName, "SimulateDiscountForm::Approver",
						sValueState, sValueStateText, true);
				},
				checkInputValue : function (sID, sValue) {
					Helper.checkInputValue(this, sViewName, sID, sValue, undefined, true);
				},
				checkTextValue : function (sID, sValue) {
					Helper.checkTextValue(this, sViewName, sID, sValue, undefined, true);
				},
				checkDiscountValueState : function (sValueState, sValueStateText) {
					Helper.checkValueState(this, sViewName, "SimulateDiscountForm::Discount",
						sValueState, sValueStateText, true);
				}
			}
		},
		/*
		 * Actions and assertions for the "ValueHelp" Popover
		 */
		onTheValueHelpPopover : {
			actions : {
				close : function () {
					this.waitFor({
						controlType : "sap.m.Popover",
						success : function (aControls) {
							aControls[0].close();
							Opa5.assert.ok(true, "ValueHelp Popover closed");
						}
					});
				},
				selectByKey : function (sKey) {
					this.waitFor({
						actions : function (oControl) {
							var oNewItem,
								oTable = oControl.getAggregation("content")[0];

							oTable.getItems().some(function (oItem) {
								if (oItem.getCells()[0].getText() === sKey) {
									oNewItem = oItem.getCells()[0];
									new Press().executeOn(oNewItem);
									return true;
								}
								return false;
							});
							Opa5.assert.ok(oNewItem, "Selected item: " + oNewItem.getText());
						},
						controlType : "sap.m.Popover",
						success : function () {
							Opa5.assert.ok(true, "Selected Value");
						}
					});
				}
			},
			assertions : {
				checkTitle : function (sTitle) {
					this.waitFor({
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
