import Helper from "sap/ui/core/sample/common/Helper";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
import Opa5 from "sap/ui/test/Opa5";
var iCurrentItemCount, iCurrentMessageCount, oSalesOrderDetails, mColumn = {
    Status: 0,
    SalesOrderID: 1,
    ItemPosition: 2,
    ProductID: 3,
    Quantity: 4,
    Unit: 5,
    GrossAmount: 6,
    Currency: 7,
    Note: 8,
    Fix: 9
}, mMessageShort2Message = {
    approval: "For a quantity greater than 1 you need an approval reason",
    empty: "",
    error: "My error message",
    info: "My info message",
    infoCurrency: "Avoid currency 'JPY'",
    maintenance: "System maintenance starts in 2 hours",
    note: "Enter an Item Note",
    order: "Order at least 2 EA of product 'HT-1000'",
    success: "My success message",
    updateSuccess: "Successfully updated the quantity",
    updateSuccessAll: "Fixed quantity to 2 EA",
    warning: "My warning message"
}, mNoteShort2Note = {
    error: "Error: My error message",
    errorNoPrefix: "My error Message",
    info: "Info: My info message",
    none: "No message",
    reason: "Reason: do it",
    success: "Success: My success message",
    warning: "Warning: My warning message"
}, rMessageDetails = /messageDetails/, rObjectPage = /objectPage/, rProductDetailsDialog = /productDetailsDialog/, rToLineItems = /ToLineItems/, sViewName = "sap.ui.core.internal.samples.odata.v2.SalesOrders.Main";
function pressButton(oOpa5, sId, bSearchOpenDialogs) {
    Helper.pressButton(oOpa5, sViewName, sId, bSearchOpenDialogs);
}
function loopTableRows(oOpa5, fnCheckRow, fnCheckResult) {
    oOpa5.waitFor({
        id: "ToLineItems",
        success: function (oTable) {
            var aCells, i, sItemPosition, aRows = oTable.getRows();
            for (i = 0; i < aRows.length; i += 1) {
                aCells = aRows[i].getCells();
                sItemPosition = aCells[mColumn.ItemPosition].getValue();
                fnCheckRow(aCells, sItemPosition);
            }
            if (fnCheckResult) {
                fnCheckResult();
            }
        },
        viewName: sViewName
    });
}
Opa5.createPageObjects({
    onMainPage: {
        actions: {
            changeItemNote: function (iRow, sNewNote) {
                this.waitFor({
                    id: "ToLineItems",
                    matchers: function (oTable) {
                        return oTable.getRows()[iRow].getCells()[mColumn.Note];
                    },
                    actions: new EnterText({ text: mNoteShort2Note[sNewNote] }),
                    viewName: sViewName
                });
            },
            changeItemQuantity: function (iRow, iNewQuantity) {
                this.waitFor({
                    actions: new EnterText({ text: iNewQuantity }),
                    id: "ToLineItems",
                    matchers: function (oTable) {
                        return oTable.getRows()[iRow].getCells()[mColumn.Quantity];
                    },
                    viewName: sViewName
                });
            },
            changeNoteInDialog: function (sNewNote) {
                this.waitFor({
                    actions: new EnterText({ text: sNewNote }),
                    id: "note::createSalesOrderItemDialog",
                    searchOpenDialogs: true,
                    viewName: sViewName
                });
            },
            changeProductIdInDialog: function (sNewId) {
                this.waitFor({
                    actions: new EnterText({ text: sNewId }),
                    id: "productID::createSalesOrderItemDialog",
                    searchOpenDialogs: true,
                    viewName: sViewName
                });
            },
            closeDialog: function (sDialogTitle) {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    success: function (aDialogs) {
                        var oDialog = aDialogs.find(function (oDialog) {
                            return oDialog.getTitle().includes(sDialogTitle);
                        });
                        oDialog.close();
                    }
                });
            },
            confirmDialog: function () {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.Button",
                    matchers: function (oButton) {
                        return oButton.getText() === "OK";
                    },
                    searchOpenDialogs: true
                });
            },
            openTechnicalDetails: function () {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.Link",
                    success: function (aLinks) {
                        return aLinks.find(function (oLink) {
                            return oLink.getId().includes("messageView");
                        });
                    },
                    searchOpenDialogs: true,
                    viewName: sViewName
                });
            },
            pressCloneItem: function () {
                pressButton(this, "cloneItem::ToLineItems");
            },
            pressCreateItem: function () {
                pressButton(this, "createItem::ToLineItems");
            },
            pressDeleteItem: function () {
                pressButton(this, "deleteItem::ToLineItems");
            },
            pressFixAllQuantities: function () {
                pressButton(this, "fixAllQuantities::ToLineItems");
            },
            pressFixQuantityInRow: function (iRow) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var oFixButton = oTable.getRows()[iRow].getCells()[mColumn.Fix];
                        oFixButton.firePress();
                        Opa5.assert.ok(true, "Fix Quantity button in row " + iRow + " has been pressed.");
                    },
                    viewName: sViewName,
                    visible: false
                });
            },
            pressMoreDetails: function (iRow) {
                this.waitFor({
                    id: rToLineItems,
                    success: function (aElements) {
                        var i, oRow, oMoreDetailsButton;
                        for (i = 0; i < aElements.length; i += 1) {
                            if (aElements[i].getId().endsWith("showProductDetails::ToLineItems")) {
                                oMoreDetailsButton = aElements[i];
                            }
                            else if (typeof aElements[i].getRows === "function") {
                                oRow = aElements[i].getRows()[iRow];
                            }
                        }
                        if (!oRow || !oMoreDetailsButton) {
                            Opa5.assert.ok(false, "Couldn't find necessary controls.");
                        }
                        oMoreDetailsButton.firePress({ row: oRow });
                    },
                    viewName: sViewName,
                    visible: false
                });
            },
            pressNewItemDiscardButton: function () {
                pressButton(this, "discardCreatedItem::createSalesOrderItemDialog");
            },
            pressNewItemSaveButton: function () {
                pressButton(this, "saveCreatedItem::createSalesOrderItemDialog");
            },
            pressSalesOrderSaveButton: function () {
                pressButton(this, "saveSalesOrder");
            },
            rememberCurrentItemCount: function () {
                iCurrentItemCount = 0;
                loopTableRows(this, function (aCells, sItemPosition) {
                    if (sItemPosition !== "") {
                        iCurrentItemCount += 1;
                    }
                });
            },
            rememberCurrentMessageCount: function () {
                this.waitFor({
                    id: "messagePopoverButton",
                    success: function (oButton) {
                        iCurrentMessageCount = parseInt(oButton.getText());
                    },
                    viewName: sViewName
                });
            },
            rememberSalesOrderDetails: function () {
                this.waitFor({
                    id: rObjectPage,
                    success: function (aInputFields) {
                        var i;
                        oSalesOrderDetails = {};
                        for (i = 0; i < aInputFields.length; i += 1) {
                            if (aInputFields[i].getId().includes("grossAmount")) {
                                oSalesOrderDetails["grossAmount"] = aInputFields[i].getValue();
                            }
                            else if (aInputFields[i].getId().includes("changedAt")) {
                                oSalesOrderDetails["changedAt"] = aInputFields[i].getValue();
                            }
                        }
                    },
                    viewName: sViewName
                });
            },
            scrollTable: function (iDelta) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var iCurrentFirst = oTable.getFirstVisibleRow();
                        oTable.setFirstVisibleRow(iCurrentFirst + iDelta);
                        Opa5.assert.ok(true, "Scrolling by " + iDelta);
                    },
                    viewName: sViewName
                });
            },
            selectRow: function (iRow) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        oTable.setSelectedIndex(iRow);
                    },
                    viewName: sViewName
                });
            },
            setFilter: function (sFilterKey) {
                this.waitFor({
                    id: "itemFilter",
                    success: function (oFilter) {
                        var aItems = oFilter.getItems(), mParameters = aItems.find(function (oItem) {
                            return oItem.getKey() === sFilterKey;
                        });
                        oFilter.setSelectedKey(sFilterKey);
                        oFilter.fireChange(mParameters);
                        Opa5.assert.ok(true, "Filter has been applied.");
                    },
                    viewName: sViewName
                });
            },
            showSalesOrder: function (sSalesOrderId) {
                this.waitFor({
                    id: "salesOrderID",
                    actions: new EnterText({ clearTextFirst: true, text: sSalesOrderId }),
                    success: function () {
                        pressButton(this, "selectSalesOrder");
                        Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
                    },
                    viewName: sViewName
                });
            },
            toggleMessagePopover: function () {
                pressButton(this, "messagePopoverButton");
            },
            toggleTransitionMessages: function () {
                pressButton(this, "transitionMessagesOnly");
            }
        },
        assertions: {
            checkDialogNotOpen: function (sTitleText) {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    success: function (aDialogs) {
                        var oDialog = aDialogs.find(function (oDialog) {
                            return oDialog.getTitle().includes(sTitleText);
                        });
                        Opa5.assert.ok(!oDialog.isOpen(), "Dialog " + sTitleText + " not showing.");
                    },
                    visible: false
                });
            },
            checkDialogOpen: function (sTitleText, sSubHeader) {
                this.waitFor({
                    controlType: "sap.m.Dialog",
                    success: function (aDialogs) {
                        var oDialog = aDialogs.find(function (oDialog) {
                            if (sSubHeader) {
                                return oDialog.getTitle().includes(sTitleText) && oDialog.getContent()[0].getText().includes(sSubHeader);
                            }
                            else {
                                return oDialog.getTitle().includes(sTitleText);
                            }
                        });
                        Opa5.assert.ok(!!oDialog, "Dialog " + sTitleText + " showing.");
                    }
                });
            },
            checkDialogShowingProductIdAndName: function (sProductId, sProductName) {
                this.waitFor({
                    id: rProductDetailsDialog,
                    success: function (aControls) {
                        var oControl, i;
                        for (i = 0; i < aControls.length; i++) {
                            oControl = aControls[i];
                            if (oControl.getId().includes("productID")) {
                                Opa5.assert.equal(oControl.getValue(), sProductId, "Product ID " + sProductId + " in dialog correct");
                            }
                            else if (oControl.getId().includes("name")) {
                                Opa5.assert.equal(oControl.getValue(), sProductName, "Product " + sProductName + " name in dialog correct");
                            }
                        }
                    },
                    viewName: sViewName
                });
            },
            checkFilterReset: function () {
                this.waitFor({
                    id: "itemFilter",
                    success: function (oFilter) {
                        Opa5.assert.equal(oFilter.getSelectedKey(), "Show all", "Filter has been reset.");
                    },
                    viewName: sViewName
                });
            },
            checkItemQuantities: function () {
                loopTableRows(this, function (aCells, sItemPosition) {
                    var sProductId = aCells[mColumn.ProductID].getValue(), iQuantity = parseInt(aCells[mColumn.Quantity].getValue());
                    if (sProductId === "HT-1000") {
                        Opa5.assert.ok(iQuantity >= 2, "Quantity for item " + sItemPosition + " is ok.");
                    }
                    else if (sProductId !== "") {
                        Opa5.assert.ok(iQuantity >= 1, "Quantity for item " + sItemPosition + " is ok.");
                    }
                });
            },
            checkItemCountChangedBy: function (iDelta) {
                var iItemCount = 0, fnCheckRows = function (aCells, sItemPosition) {
                    if (sItemPosition !== "") {
                        iItemCount += 1;
                    }
                }, fnCheckResult = function () {
                    iCurrentItemCount += iDelta;
                    Opa5.assert.equal(iItemCount, iCurrentItemCount, "Item count has changed by " + iDelta);
                };
                loopTableRows(this, fnCheckRows, fnCheckResult);
            },
            checkItemsMatchingFilter: function (vAllowedValueState) {
                loopTableRows(this, function (aCells, sItemPosition) {
                    var sValueState;
                    if (sItemPosition !== "") {
                        sValueState = aCells[mColumn.SalesOrderID].getParent().getAggregation("_settings").getProperty("highlight");
                        if (Array.isArray(vAllowedValueState)) {
                            Opa5.assert.ok(vAllowedValueState.indexOf(sValueState) >= 0, sItemPosition + " has a correct value state.");
                        }
                        else {
                            Opa5.assert.equal(sValueState, vAllowedValueState, sItemPosition + " has a correct value state.");
                        }
                    }
                });
            },
            checkMessageCountHasChangedBy: function (iCount) {
                this.waitFor({
                    id: "messagePopoverButton",
                    success: function (oButton) {
                        var iNewMessageCount = parseInt(oButton.getText());
                        Opa5.assert.equal(iCurrentMessageCount + iCount, iNewMessageCount, "The message count has been changed by " + iCount);
                        iCurrentMessageCount += iCount;
                    },
                    viewName: sViewName
                });
            },
            checkMessageHasTechnicalDetail: function (sId, sExpectedValue) {
                this.waitFor({
                    id: rMessageDetails,
                    success: function (aControls) {
                        var oControl, i;
                        for (i = 0; i < aControls.length; i += 1) {
                            oControl = aControls[i];
                            if (oControl.getId().endsWith(sId)) {
                                Opa5.assert.equal(oControl.getText(), sExpectedValue, "Message has correct details at " + sId);
                            }
                        }
                    },
                    viewName: sViewName,
                    visible: false
                });
            },
            checkMessageInPopover: function (sItemPosition, sMessageShort) {
                this.waitFor({
                    id: "messagePopover",
                    success: function (oPopover) {
                        var aMessages = oPopover.getItems();
                        aMessages = (aMessages || []).filter(function (oMessage) {
                            return sItemPosition ? oMessage.getTitle() === mMessageShort2Message[sMessageShort] && oMessage.getSubtitle().includes(sItemPosition) : oMessage.getTitle() === mMessageShort2Message[sMessageShort];
                        });
                        switch (aMessages.length) {
                            case 0:
                                Opa5.assert.ok(false, "No fitting message displayed for message: " + sMessageShort);
                                break;
                            case 1:
                                Opa5.assert.ok(true, "A message is displayed for message: " + sMessageShort);
                                break;
                            default:
                                Opa5.assert.ok(false, "Too many messages match " + sMessageShort);
                                break;
                        }
                    },
                    viewName: sViewName
                });
            },
            checkMessageNotInPopover: function (sItemPosition, sMessageShort) {
                this.waitFor({
                    id: "messagePopover",
                    success: function (oPopover) {
                        var aMessages = oPopover.getItems();
                        aMessages = (aMessages || []).filter(function (oMessage) {
                            return sMessageShort ? oMessage.getTitle() === mMessageShort2Message[sMessageShort] && oMessage.getSubtitle().includes(sItemPosition) : oMessage.getSubtitle().includes(sItemPosition);
                        });
                        switch (aMessages.length) {
                            case 0:
                                Opa5.assert.ok(true, "No message displayed for message: " + sMessageShort);
                                break;
                            case 1:
                                Opa5.assert.ok(false, "A message is displayed for message: " + sMessageShort);
                                break;
                            default:
                                Opa5.assert.ok(false, "Too many messages match " + sMessageShort);
                                break;
                        }
                    },
                    viewName: sViewName
                });
            },
            checkMessagePopoverOpen: function () {
                this.waitFor({
                    id: "messagePopover",
                    success: function () {
                        Opa5.assert.ok(true, "The message popover is open");
                    },
                    viewName: sViewName
                });
            },
            checkMessageStrip: function (sExpectedMessageType) {
                this.waitFor({
                    controlType: "sap.m.MessageStrip",
                    success: function (aMatchedControls) {
                        var sMessageType = aMatchedControls[0].getProperty("type");
                        Opa5.assert.strictEqual(sMessageType, sExpectedMessageType, "Message strip shows correct message: " + sExpectedMessageType);
                    },
                    viewName: sViewName,
                    visible: false
                });
            },
            checkMessageToast: function () {
                this.waitFor({
                    autoWait: false,
                    check: function () {
                        return !!sap.ui.test.Opa5.getJQuery()(".sapMMessageToast").length;
                    },
                    errorMessage: "No Toast message detected!",
                    success: function () {
                        Opa5.assert.ok(true, "Found a Toast");
                    },
                    viewName: sViewName
                });
            },
            checkSalesOrderDetailsUpdated: function () {
                this.waitFor({
                    id: rObjectPage,
                    success: function (aInputFields) {
                        var i, oNewSalesOrderDetails = {};
                        for (i = 0; i < aInputFields.length; i += 1) {
                            if (aInputFields[i].getId().includes("grossAmount")) {
                                oNewSalesOrderDetails["grossAmount"] = aInputFields[i].getValue();
                            }
                            else if (aInputFields[i].getId().includes("changedAt")) {
                                oNewSalesOrderDetails["changedAt"] = aInputFields[i].getValue();
                            }
                        }
                        Opa5.assert.notDeepEqual(oNewSalesOrderDetails, oSalesOrderDetails, "Sales order details have changed");
                        oSalesOrderDetails = oNewSalesOrderDetails;
                    },
                    viewName: sViewName
                });
            },
            checkSalesOrderItemsLoaded: function (sSalesOrderId) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var sValue = oTable.getRows()[0].getCells()[mColumn.SalesOrderID].getValue();
                        Opa5.assert.strictEqual(sValue, sSalesOrderId, "The sales order items have been loaded for sales order " + sSalesOrderId);
                    },
                    viewName: sViewName
                });
            },
            checkSalesOrderLoaded: function (sSalesOrderId) {
                this.waitFor({
                    id: "salesOrderID::objectPage",
                    success: function (oField) {
                        Opa5.assert.strictEqual(oField.getValue(), sSalesOrderId, "The sales order " + sSalesOrderId + " has been loaded");
                    },
                    viewName: sViewName
                });
            },
            checkTableRowHighlight: function (iRow, sExpectedValueState) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var oRow = oTable.getRows()[iRow], sValueState = oRow.getAggregation("_settings").getProperty("highlight");
                        Opa5.assert.equal(sValueState, sExpectedValueState, "The table row " + iRow + " has the correct value state: " + sValueState);
                    },
                    viewName: sViewName
                });
            },
            checkTableRowsEqualInColumns: function (iRow0, iRow1, aColumns) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var iColumn, oRowCells0 = oTable.getRows()[iRow0].getCells(), oRowCells1 = oTable.getRows()[iRow1].getCells();
                        aColumns.forEach(function (sColumn) {
                            iColumn = mColumn[sColumn];
                            Opa5.assert.equal(oRowCells1[iColumn].getValue(), oRowCells0[iColumn].getValue(), "The rows " + iRow0 + " and " + iRow1 + " have the identical" + " value in column '" + sColumn + "'");
                        });
                    },
                    viewName: sViewName
                });
            },
            checkValueStateOfField: function (iRow, sField, sExpectedValueState, sMessageShort) {
                this.waitFor({
                    id: "ToLineItems",
                    success: function (oTable) {
                        var oSelectedField = oTable.getRows()[iRow].getCells()[mColumn[sField]];
                        sMessageShort = sMessageShort || "empty";
                        Opa5.assert.equal(oSelectedField.getValueState(), sExpectedValueState, "The " + sField + " in row " + iRow + " has the correct value state");
                        Opa5.assert.equal(oSelectedField.getValueStateText(), mMessageShort2Message[sMessageShort], "The " + sField + " in row " + iRow + " has the correct value state text");
                    },
                    viewName: sViewName
                });
            }
        }
    }
});