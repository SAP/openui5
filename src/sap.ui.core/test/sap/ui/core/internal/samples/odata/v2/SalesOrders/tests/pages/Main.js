sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	'sap/ui/test/Opa5'
], function(Helper, EnterText, Press, Ancestor, Properties, Opa5) {
	"use strict";

	var iCurrentItemCount, iCurrentMessageCount, oSalesOrderDetails, iCurrentSalesOrdersCount,
		mColumn = {
			Status : 0,
			SalesOrderID : 1,
			ItemPosition : 2,
			ProductID : 3,
			Quantity : 4,
			Unit : 5,
			GrossAmount : 6,
			Currency : 7,
			DeliveryDate : 8,
			Note : 9,
			Fix : 10
		},
		mMessageShort2Message = {
			approval : "For a quantity greater than 1 you need an approval reason",
			empty : "",
			error : "My error message",
			info : "My info message",
			infoCurrency : "Avoid currency 'JPY'",
			maintenance : "System maintenance starts in 2 hours",
			note : "Enter an Item Note",
			order : "Order at least 2 EA of product 'HT-1000'",
			success : "My success message",
			updateSuccess : "Successfully updated the quantity",
			updateSuccessAll : "Fixed quantity to 2 EA",
			warning : "My warning message"
		},
		mNoteShort2Note = {
			error : "Error: My error message",
			errorNoPrefix : "My error Message",
			info : "Info: My info message",
			none : "No message",
			reason : "Reason: do it",
			success : "Success: My success message",
			warning : "Warning: My warning message"
		},
		rMessageDetails = /messageDetails/,
		rObjectPage = /objectPage/,
		rProductDetailsDialog = /productDetailsDialog/,
		mSalesOrderProperty2Column = {
			Status : 0,
			SalesOrderID : 1,
			CustomerName : 2,
			GrossAmount : 3,
			Note : 4
		},
		rToLineItems = /ToLineItems/,
		sViewName = "sap.ui.core.internal.samples.odata.v2.SalesOrders.Main";

	function pressButton(oOpa5, sId, bSearchOpenDialogs) {
		Helper.pressButton(oOpa5, sViewName, sId, bSearchOpenDialogs);
	}

	/*
	 * Finds the table on the page and loops through its rows. Applies given function to each row.
	 *
	 * @param {sap.ui.test.Opa5} oOpa5
	 *   An instance of Opa5 to access the current page object
	 * @param {function} fnCheckRow
	 *   A function to check the rows values. Gets passed the rows cells and the item position
	 * @param {function} [fnCheckResult]
	 *   A function called after looping the rows to check the end result
	 */
	function loopTableRows(oOpa5, fnCheckRow, fnCheckResult) {
		oOpa5.waitFor({
			id : "ToLineItems",
			success : function (oTable) {
				var aCells, i, sItemPosition,
					aRows = oTable.getRows();

				for (i = 0; i < aRows.length; i += 1) {
					aCells = aRows[i].getCells();
					sItemPosition = aCells[mColumn.ItemPosition].getValue();

					fnCheckRow(aCells, sItemPosition);
				}

				if (fnCheckResult) {
					fnCheckResult();
				}
			},
			viewName : sViewName
		});
	}

	Opa5.createPageObjects({
		onMainPage : {
			actions : {
				/*
				 * Changes the note of the item at the given position to a message from
				 * <code>mNoteShort2Note</code> or to the given value.
				 *
				 * @param {number} iRow
				 *   The item position in the table, with the top being 0
				 * @param {string} sNewNote
				 *   A message shortcut referring to <code>mNoteShort2Note</code>; if it is not
				 *   contained use the given note value
				 */
				changeItemNote : function (iRow, sNewNote) {
					this.waitFor({
						id : "ToLineItems",
						matchers : function (oTable) {
							return oTable.getRows()[iRow].getCells()[mColumn.Note];
						},
						actions : new EnterText({text : mNoteShort2Note[sNewNote] || sNewNote}),
						viewName : sViewName
					});
				},
				/*
				 * Changes the quantity of an item to the given value.
				 *
				 * @param {number} iRow The items position in the table
				 * @param {number} iNewQuantity The new quantity for the item
				 */
				changeItemQuantity : function (iRow, iNewQuantity) {
					this.waitFor({
						actions : new EnterText({text : iNewQuantity}),
						id : "ToLineItems",
						matchers : function (oTable) {
							return oTable.getRows()[iRow].getCells()[mColumn.Quantity];
						},
						viewName : sViewName
					});
				},
				/*
				 * Changes the values of an item to the given values.
				 *
				 * @param {number} iRow The items position in the table
				 * @param {Object<string,string>} mValues Maps the property name to the new value
				 */
				changeItemValues : function (iRow, mValues) {
					var that = this;

					Object.keys(mValues).forEach(function (sPropertyName) {
						that.waitFor({
							actions : new EnterText({text : mValues[sPropertyName]}),
							id : "ToLineItems",
							matchers : function (oTable) {
								return oTable.getRows()[iRow].getCells()[mColumn[sPropertyName]];
							},
							viewName : sViewName
						});
					});
				},
				/*
				 * Changes the note of the new product in the "Create New Item" dialog.
				 *
				 * @param {string} sNewNote The note for the new item
				 */
				changeNoteInDialog : function (sNewNote) {
					this.waitFor({
						actions : new EnterText({text : sNewNote}),
						id : "note::createSalesOrderItemDialog",
						searchOpenDialogs : true,
						success : function () {
							Opa5.assert.ok(true, "Changed the note of the new sales order item to "
								+ "'" + sNewNote + "'.");
						},
						viewName : sViewName
					});
				},
				/*
				 * Changes the id of the new product in the "Create New Item" dialog.
				 *
				 * @param {string} sNewId The product id for the new item
				 */
				changeProductIdInDialog : function (sNewId) {
					this.waitFor({
						actions : new EnterText({text : sNewId}),
						id : "productID::createSalesOrderItemDialog",
						searchOpenDialogs : true,
						success : function () {
							Opa5.assert.ok(true, "Changed the product ID of the new sales order"
								+ " item to '" + sNewId + "'.");
						},
						viewName : sViewName
					});
				},
				/*
				 * Changes the note of the sales order at the given position to the given value.
				 *
				 * @param {number} iRow The item position in the table, with the top being 0
				 * @param {string} sNewNote The new note value
				 */
				changeSalesOrderNoteOfRow : function (iRow, sNewNote) {
					this.waitFor({
						actions : new EnterText({text : sNewNote}),
						id : "SalesOrderSet",
						matchers : function (oTable) {
							return oTable.getItems()[iRow]
								.getCells()[mSalesOrderProperty2Column.Note];
						},
						viewName : sViewName
					});
				},
				/*
				 * Changes the note of the sales order on the object page.
				 *
				 * @param {string} sNewNote The new note value
				 */
				changeSalesOrderNoteOnObjectPage : function (sNewNote) {
					this.waitFor({
						actions : new EnterText({text : sNewNote}),
						id : "note::objectPage",
						viewName : sViewName
					});
				},
				/*
				 * Changes the filter value for the sales orders table.
				 *
				 * @param {string} sFilterValue The new filter value
				 */
				changeSalesOrdersFilter : function (sFilterValue) {
					this.waitFor({
						actions : new EnterText({text : sFilterValue}),
						id : "salesOrdersFilter",
						viewName : sViewName
					});
				},
				/*
				 * Close the currently showing dialog.
				 *
				 * @param {string} sDialogTitle Title of the dialog to match
				 */
				closeDialog : function (sDialogTitle) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						success : function (aDialogs) {
							var oDialog = aDialogs.find(function(oDialog) {
								return oDialog.getTitle().includes(sDialogTitle);
							});

							oDialog.close();
						}
					});
				},
				/*
				 * Confirms a confirmation dialog.
				 */
				confirmDialog : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						matchers : function (oButton) {
							return oButton.getText() === "OK";
						},
						searchOpenDialogs : true
					});
				},
				/*
				 * Filters the sales order items table as given.
				 *
				 * @param {string} sFilter The filter value
				 */
				filterItems : function (sFilter) {
					this.waitFor({
						actions: new Press(),
						id : "grossAmountColumn",
						success : function (oSelect) {
							this.waitFor({
								actions : new EnterText({
									clearTextFirst : true,
									pressEnterKey : true,
									text : sFilter
								}),
								controlType: "sap.ui.unified.MenuTextFieldItem",
								matchers: [
									new Ancestor(oSelect),
									new Properties({icon : "sap-icon://filter"})
								],
								success : function (oMenuTextField) {
									Opa5.assert.ok(true, "Filter sales order items by \""
										+ sFilter + "\".");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Opens the technical details of a message. Only works if the message popover is
				 * open and a message is selected.
				 */
				openTechnicalDetails : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Link",
						success : function (aLinks) {
							return aLinks.find(function (oLink) {
								return oLink.getId().includes("messageView");
							});
						},
						searchOpenDialogs : true,
						viewName : sViewName
					});
				},
				/*
				 * Presses the "clone item" button
				 */
				pressCloneItem : function () {
					pressButton(this, "cloneItem::ToLineItems");
				},
				/*
				 * Presses the "create item" button
				 */
				pressCreateItem : function () {
					pressButton(this, "createItem::ToLineItems");
				},
				/*
				 * Presses the "delete item" button
				 */
				pressDeleteItem : function () {
					pressButton(this, "deleteItem::ToLineItems");
				},
				/*
				 * Presses the "Fix Quantities" button.
				 */
				pressFixAllQuantities : function () {
					pressButton(this, "fixAllQuantities::ToLineItems");
				},
				/*
				 * Presses the "Fix Quantity Issues" Button in the specified row.
				 *
				 * @param {number} iRow The row in which the fix button should be pressed
				 */
				pressFixQuantityInRow : function (iRow) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var oFixButton = oTable.getRows()[iRow].getCells()[mColumn.Fix];

							oFixButton.firePress();
							Opa5.assert.ok(true,
								"Fix Quantity button in row " + iRow + " has been pressed.");
						},
						viewName : sViewName,
						visible : false
					});
				},
				/*
				 * Presses the "Refresh sales order items table" button.
				 */
				pressItemsRefreshButton : function () {
					pressButton(this, "refresh::ToLineItems");
				},
				/*
				 * Presses the "Show more details" button in the specified line in the table.
				 *
				 * @param {number} iRow The row in which the button should be pressed
				 */
				pressMoreDetails : function (iRow) {
					this.waitFor({
						id : rToLineItems,
						success : function (aElements) {
							var i, oRow, oMoreDetailsButton;

							for (i = 0; i < aElements.length; i += 1) {
								if (aElements[i].getId()
										.endsWith("showProductDetails::ToLineItems")) {
									oMoreDetailsButton = aElements[i];
								} else if (typeof aElements[i].getRows === "function") {
									oRow = aElements[i].getRows()[iRow];
								}
							}

							if (!oRow || !oMoreDetailsButton) {
								Opa5.assert.ok(false, "Couldn't find necessary controls.");
							}

							oMoreDetailsButton.firePress({row : oRow});
						},
						viewName : sViewName,
						visible : false
					});
				},
				/*
				 * Presses the Close button in the "Create new item" Dialog.
				 */
				pressNewItemCloseButton : function () {
					pressButton(this, "closeCreatedItem::createSalesOrderItemDialog");
				},
				/*
				 * Presses the Discard button in the "Create new item" Dialog.
				 */
				pressNewItemDiscardButton : function () {
					pressButton(this, "discardCreatedItem::createSalesOrderItemDialog");
				},
				/*
				 * Presses the Save button in the "Create new item" Dialog.
				 */
				pressNewItemSaveButton : function () {
					pressButton(this, "saveCreatedItem::createSalesOrderItemDialog");
				},
				/*
				 * Presses the "Create sales order" button
				 */
				pressSalesOrdersCreateButton : function () {
					pressButton(this, "createSalesOrder");
				},
				/*
				 * Presses the "Delete selected sales order" button
				 */
				pressSalesOrdersDelete : function () {
					pressButton(this, "delete::SalesOrderList");
				},
				/*
				 * Presses the "Go" button to filter the sales orders table
				 */
				pressSalesOrdersFilterGoButton : function () {
					pressButton(this, "salesOrdersFilterGo");
				},
				/*
				 * Presses the "More" button of the sales orders table
				 */
				pressSalesOrdersMoreButton : function () {
					Helper.pressMoreButton(this, sViewName, "SalesOrderSet");
				},
				/*
				 * Presses the "Refresh sales orders table" button.
				 */
				pressSalesOrdersRefreshButton : function () {
					pressButton(this, "refresh::SalesOrderSet");
				},
				/*
				 * Presses the Save button at the bottom of the page.
				 */
				pressSalesOrderSaveButton : function () {
					pressButton(this, "saveSalesOrder");
				},
				/*
				 * Presses the Reset Changes button at the bottom of the page.
				 */
				pressResetChangesButton : function () {
					pressButton(this, "resetChanges");
				},
				/*
				 * Presses the "Use Table" button at the top of the page.
				 */
				pressUseTableButton : function () {
					pressButton(this, "showSalesOrderTable");
				},
				/*
				 * Stores the current item count.
				 */
				rememberCurrentItemCount : function () {
					iCurrentItemCount = 0;

					this.waitFor({
						id : "salesOrderItemsTitle",
						success : function (oTitle) {
							var sNumber = oTitle.getText().split(" ")[0];

							iCurrentItemCount = parseInt(sNumber);
							Opa5.assert.ok(true, "Current number of sales order items: " + sNumber);
						},
						viewName : sViewName
					});
				},
				/*
				 * Stores the current sales orders count.
				 */
				rememberSalesOrdersCount : function () {
					iCurrentSalesOrdersCount = 0;
					this.waitFor({
						id : "salesOrdersTitle",
						success : function (oTitle) {
							var sNumber = oTitle.getText().split(" ")[0];

							iCurrentSalesOrdersCount = parseInt(sNumber);
							Opa5.assert.ok(true, "Current number of sales orders: " + sNumber);
						},
						viewName : sViewName
					});
				},
				/*
				 * Reads and stores the number of current messages shown on the message popover
				 * button.
				 */
				rememberCurrentMessageCount : function () {
					this.waitFor({
						id : "messagePopoverButton",
						success : function (oButton) {
							iCurrentMessageCount = parseInt(oButton.getText());
						},
						viewName : sViewName
					});
				},
				/*
				 * Reads and stores the sales order details.
				 */
				rememberSalesOrderDetails : function () {
					this.waitFor({
						id : rObjectPage,
						success : function (aInputFields) {
							var i;

							oSalesOrderDetails = {};
							for (i = 0; i < aInputFields.length; i += 1) {
								if (aInputFields[i].getId().includes("grossAmount")) {
									oSalesOrderDetails["grossAmount"] = aInputFields[i].getValue();
								} else if (aInputFields[i].getId().includes("changedAt")) {
									oSalesOrderDetails["changedAt"] = aInputFields[i].getValue();
								}
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Scrolls through the items in the table. Positive values scroll up, negative
				 * values down.
				 *
				 * @param {number} iDelta Number of items to scroll.
				 */
				scrollTable : function (iDelta) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var iCurrentFirst = oTable.getFirstVisibleRow();
							oTable.setFirstVisibleRow(iCurrentFirst + iDelta);

							Opa5.assert.ok(true, "Scrolling by " + iDelta);
						},
						viewName : sViewName
					});
				},
				/*
				 * Selects a row in the table.
				 *
				 * @param {number} iRow The index of the visible row to select
				 */
				selectRow : function (iRow) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							oTable.setSelectedIndex(oTable.getFirstVisibleRow() + iRow);
						},
						viewName : sViewName
					});
				},
				/*
				 * Selects the given row in the sales orders table.
				 *
				 * @param {number} iRow The row to select, with the top being 0
				 */
				selectSalesOrderAtRow : function (iRow) {
					this.waitFor({
						id : "SalesOrderSet",
						success : function (oTable) {
							var oListItem = oTable.getItems()[iRow];

							this.waitFor({
								actions: new Press(),
								controlType: "sap.m.ColumnListItem",
								matchers: [
									new Ancestor(oTable),
									function (oColumnListItem) {
										return oColumnListItem === oListItem;
									}
								],
								success : function () {
									Opa5.assert.ok(true, "Selected sales order at index " + iRow);
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Chooses a filter from the drop down list and selects it.
				 *
				 * @param {string} sFilterKey The key for the specific filter
				 */
				setFilter : function (sFilterKey) {
					this.waitFor({
						id : "itemFilter",
						success : function (oFilter) {
							var aItems = oFilter.getItems(),
								mParameters = aItems.find(function (oItem) {
									return oItem.getKey() === sFilterKey;
								});

							oFilter.setSelectedKey(sFilterKey);
							oFilter.fireChange(mParameters);
							Opa5.assert.ok(true, "Filter has been applied.");
						},
						viewName : sViewName
					});
				},
				/*
				 * Loads the specified sales order.
				 *
				 * @param {string} sSalesOrderId The sales order id
				 */
				showSalesOrder : function (sSalesOrderId) {
					this.waitFor({
						id : "salesOrderID",
						actions : new EnterText({clearTextFirst : true, text : sSalesOrderId}),
						success : function () {
							pressButton(this, "selectSalesOrder");
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				/*
				 * Sort the sales order items table as given.
				 *
				 * @param {string} sSortOrder The sort order "asc" or "desc"
				 */
				sortItems : function (sSortOrder) {
					this.waitFor({
						actions: new Press(),
						id : "itemPositionColumn",
						success : function (oColumn) {
							this.waitFor({
								actions: new Press(),
								controlType: "sap.ui.unified.MenuItem",
								matchers: [
									new Ancestor(oColumn),
									new Properties({icon : sSortOrder === "asc"
										? "sap-icon://sort-ascending"
										: "sap-icon://sort-descending"})
								],
								success : function () {
									Opa5.assert.ok(true, "Sort sales order items \"" + sSortOrder
										+ "\".");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Sort the sales orders table as given.
				 *
				 * @param {string} sSortOrder The sort order "asc" or "desc"
				 */
				sortSalesOrders : function (sSortOrder) {
					this.waitFor({
						actions: new Press(),
						id : "salesOrdersSort",
						success : function (oSelect) {
							this.waitFor({
								actions: new Press(),
								controlType: "sap.ui.core.Item",
								matchers: [
									new Ancestor(oSelect),
									new Properties({key : sSortOrder})
								],
								success : function () {
									Opa5.assert.ok(true, "Sort sales orders \"" + sSortOrder
										+ "\".");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Opens or closes the Message Popover, respectively.
				 */
				toggleMessagePopover : function () {
					pressButton(this, "messagePopoverButton");
				},
				/*
				 * Presses the "Transition Messages Only" button
				 */
				toggleTransitionMessages : function () {
					pressButton(this, "transitionMessagesOnly");
				}
			},
			assertions : {
				/*
				 * Checks if the named dialog is not open.
				 *
				 * @param {string} sTitleText Part of the title which will be searched for
				 */
				checkDialogNotOpen : function (sTitleText) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						success : function (aDialogs) {
							var oDialog = aDialogs.find(function (oDialog) {
								return oDialog.getTitle().includes(sTitleText);
							});

							Opa5.assert.ok(!oDialog.isOpen(),
								"Dialog " + sTitleText + " not showing.");
						},
						visible : false
					});
				},
				/*
				 * Checks if there is a dialog open currently.
				 *
				 * @param {string} sTitleText Part of the title which will be searched for
				 * @param {string} [sSubHeader] Part of the sub header which can be searched for
				 */
				checkDialogOpen : function (sTitleText, sSubHeader) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						success : function (aDialogs) {
							var oDialog = aDialogs.find(function (oDialog) {
								if (sSubHeader) {
									return oDialog.getTitle().includes(sTitleText)
										&& oDialog.getContent()[0].getText().includes(sSubHeader);
								} else {
									return oDialog.getTitle().includes(sTitleText);
								}
							});

							Opa5.assert.ok(!!oDialog, "Dialog " + sTitleText + " showing.");
						}
					});
				},
				/*
				 * Checks if the product details dialog is showing the correct information.
				 *
				 * @param {string} sProductId The product idea which should be shown
				 * @param {string} sProductName The product name which should be shown
				 */
				checkDialogShowingProductIdAndName : function (sProductId, sProductName) {
					this.waitFor({
						id : rProductDetailsDialog,
						success : function (aControls) {
							var oControl, i;

							for (i = 0; i < aControls.length; i++) {
								oControl = aControls[i];

								if (oControl.getId().includes("productID")) {
									Opa5.assert.equal(oControl.getValue(), sProductId,
										"Product ID " + sProductId + " in dialog correct");
								} else if (oControl.getId().includes("name")) {
									Opa5.assert.equal(oControl.getValue(), sProductName,
										"Product " + sProductName + " name in dialog correct");
								}
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the filter has been reset to "Show all".
				 */
				checkFilterReset : function () {
					this.waitFor({
						id : "itemFilter",
						success : function (oFilter) {
							Opa5.assert.equal(oFilter.getSelectedKey(), "Show all",
								"Filter has been reset.");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks whether the sales order item in the given row has the content.
				 *
				 * @param {number} iRow
				 *   The position of the sales order item in the table, with the top being 0
				 * @param {Object<string,string>} mExpectedValues
				 * @param {string} [mExpectedValues.Currency=""]
				 *   The expected currency
				 * @param {string} [mExpectedValues.GrossAmount=""]
				 *   The expected gross amount
				 * @param {string} [mExpectedValues.ItemPosition=""]
				 *   The expected sale order item position
				 * @param {string} [mExpectedValues.Note=""]
				 *   The expected note
				 * @param {string} [mExpectedValues.ProductID=""]
				 *   The expected product ID
				 * @param {string} [mExpectedValues.Quantity=""]
				 *   The expected quantity
				 * @param {string} [mExpectedValues.SalesOrderID=""]
				 *   The expected sales order ID
				 * @param {string} [mExpectedValues.Status="From Server"]
				 *   The expected status
				 * @param {string} [mExpectedValues.Unit="EA"]
				 *   The expected unit
				 */
				checkItemAtRow : function (iRow, mExpectedValues) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var sMsgPrefix = "The sales order item in row " + iRow
									+ " has the expected ",
								oRow = oTable.getRows()[iRow],
								aCells = oRow.getCells();

							Object.keys(mColumn).forEach(function (sColumn) {
								var sExpectedValue,
									iColumn = mColumn[sColumn],
									sCurrentValueGetter = "getValue";

								switch (sColumn) {
									case "Status":
										sCurrentValueGetter = "getTooltip";
										sExpectedValue = mExpectedValues[sColumn] || "From Server";
										break;
									case "SalesOrderID":
									case "ItemPosition":
									case "ProductID":
									case "Quantity":
									case "GrossAmount":
									case "Currency":
									case "Note":
										sExpectedValue = mExpectedValues[sColumn] || "";
										break;
									case "Unit":
										sExpectedValue = mExpectedValues.hasOwnProperty("Unit")
											? mExpectedValues[sColumn]
											: "EA";
										break;
									default:
										return;
								}
								Opa5.assert.strictEqual(aCells[iColumn][sCurrentValueGetter](),
									sExpectedValue, sMsgPrefix + sColumn + ": " + sExpectedValue);
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the item count has changed by a specified value.
				 *
				 * @param {number} iDelta
				 *   The supposed difference between the current and the old item count
				 */
				checkItemCountChangedBy : function (iDelta) {
					this.waitFor({
						id : "salesOrderItemsTitle",
						success : function (oTitle) {
							var iCount = parseInt(oTitle.getText().split(" ")[0]);

							iCurrentItemCount += iDelta;
							Opa5.assert.equal(iCount, iCurrentItemCount,
								"Sales order items count has changed by " + iDelta + " to "
									+ iCount);
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if all item quantities are as described in the MIT. All HT-1000 items need
				 * a quantity of at least two, all other items a quantity of at least one.
				 */
				checkItemQuantities : function () {
					loopTableRows(this, function (aCells, sItemPosition) {
						var sProductId = aCells[mColumn.ProductID].getValue(),
							iQuantity = parseInt(aCells[mColumn.Quantity].getValue());

						if (sProductId === "HT-1000") {
							Opa5.assert.ok(iQuantity >= 2,
								"Quantity for item " + sItemPosition + " is ok.");
						} else if (sProductId !== "") {
							Opa5.assert.ok(iQuantity >= 1,
								"Quantity for item " + sItemPosition + " is ok.");
						}
					});
				},
				/*
				 * Checks if all items in the table match the selected filter.
				 *
				 * @param {string|string[]} vAllowedValueState To the filter matching value state(s)
				 */
				checkItemsMatchingFilter : function (vAllowedValueState) {
					loopTableRows(this, function (aCells, sItemPosition) {
						var sValueState;

						if (sItemPosition !== "") {
							sValueState = aCells[mColumn.SalesOrderID].getParent()
								.getAggregation("_settings").getProperty("highlight");

							if (Array.isArray(vAllowedValueState)) {
								Opa5.assert.ok(vAllowedValueState.indexOf(sValueState) >= 0,
									sItemPosition + " has a correct value state.");
							} else {
								Opa5.assert.equal(sValueState, vAllowedValueState,
									sItemPosition + " has a correct value state.");
							}
						}
					});
				},
				/*
				 * Checks if the sales order items count (rememberCurrentItemCount) differs by the
				 * given delta from the corresponding bindings length.
				 *
				 * @param {number} iDelta
				 *   The supposed difference between the current sales order items count and the
				 *   bindings length.
				 */
				checkItemsTableLengthDiffersBy : function (iDelta) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var iLength = oTable.getBinding("rows").getLength();

							Opa5.assert.equal(iLength, iCurrentItemCount + iDelta,
								"Sales order items count differs by " + iDelta
								+ " from the bindings length");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks, if the message count has changed by a specified amount.
				 *
				 * @param {number} iCount Amount by which the message count should be changed
				 */
				checkMessageCountHasChangedBy : function (iCount) {
					this.waitFor({
						id : "messagePopoverButton",
						success : function (oButton) {
							var iNewMessageCount = parseInt(oButton.getText());
							Opa5.assert.equal(iCurrentMessageCount + iCount, iNewMessageCount,
								"The message count has been changed by " + iCount);
							iCurrentMessageCount += iCount;
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the specified detail is correct in the message. Only works if the
				 * message details dialog is opened.
				 *
				 * @param {string} sId The full id of the detail text field
				 * @param {string} sExpectedValue The expected value of the field
				 */
				checkMessageHasTechnicalDetail : function (sId, sExpectedValue) {
					this.waitFor({
						id : rMessageDetails,
						success : function (aControls) {
							var oControl, i;

							for (i = 0; i < aControls.length; i += 1) {
								oControl = aControls[i];

								if (oControl.getId().endsWith(sId)) {
									Opa5.assert.equal(oControl.getText(), sExpectedValue,
										"Message has correct details at " + sId);
								}
							}
						},
						viewName : sViewName,
						visible : false
					});
				},
				/*
				 * Searches for a part of the message and, if specified, the item position. Asserts
				 * ok if exactly one match has been found.
				 *
				 * @param {string} [sItemPosition]
				 *   The position of the item which will be searched for
				 * @param {string} sMessageShort
				 *   The whole message or a part of it, will be searched for
				 */
				checkMessageInPopover : function (sItemPosition, sMessageShort) {
					this.waitFor({
						id : "messagePopover",
						success : function (oPopover) {
							var aMessages = oPopover.getItems();

							aMessages = (aMessages || []).filter(function (oMessage) {
								return sItemPosition
									? oMessage.getTitle() === mMessageShort2Message[sMessageShort]
										&& oMessage.getSubtitle().includes(sItemPosition)
									: oMessage.getTitle() === mMessageShort2Message[sMessageShort];
							});

							switch (aMessages.length) {
								case 0:
									Opa5.assert.ok(false,
										"No fitting message displayed for message: "
											+ sMessageShort);
									break;
								case 1:
									Opa5.assert.ok(true,
										"A message is displayed for message: " + sMessageShort);
									break;
								default:
									Opa5.assert.ok(false,
										"Too many messages match " + sMessageShort);
									break;
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if a specific message is not in the popover. Does so by looking for a
				 * combination of item position and a message string.
				 *
				 * @param {string} sItemPosition The item position property
				 * @param {string} [sMessageShort] The key of a message in
				 *   <code>mMessageShort2Message</code> which should not be shown
				 */
				checkMessageNotInPopover : function (sItemPosition, sMessageShort) {
					this.waitFor({
						id : "messagePopover",
						success : function (oPopover) {
							var aMessages = oPopover.getItems();

							aMessages = (aMessages || []).filter(function (oMessage) {
								return sMessageShort
									? oMessage.getTitle() === mMessageShort2Message[sMessageShort]
										&& oMessage.getSubtitle().includes(sItemPosition)
									: oMessage.getSubtitle().includes(sItemPosition);
							});

							switch (aMessages.length) {
								case 0:
									Opa5.assert.ok(true,
										"No message displayed for message: " + sMessageShort);
									break;
								case 1:
									Opa5.assert.ok(false,
										"A message is displayed for message: " + sMessageShort);
									break;
								default:
									Opa5.assert.ok(false,
										"Too many messages match " + sMessageShort);
									break;
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the message popover has been opened.
				 */
				checkMessagePopoverOpen : function () {
					this.waitFor({
						id : "messagePopover",
						success : function () {
							Opa5.assert.ok(true, "The message popover is open");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the message strip is shown and if it shows the correct color.
				 *
				 * @param {string} sExpectedMessageType
				 *   The expected severity shown by the message strip
				 */
				checkMessageStrip : function (sExpectedMessageType) {
					this.waitFor({
						controlType : "sap.m.MessageStrip",
						success : function (aMatchedControls) {
							var sMessageType = aMatchedControls[0].getProperty("type");

							Opa5.assert.strictEqual(sMessageType, sExpectedMessageType,
								"Message strip shows correct message: " + sExpectedMessageType);
						},
						viewName : sViewName,
						visible : false
					});
				},
				/*
				 * Checks if a message toast is showing.
				 */
				checkMessageToast : function () {
					this.waitFor({
						autoWait : false,
						check : function () {
							return !!Opa5.getJQuery()(".sapMMessageToast").length;
						},
						errorMessage : "No Toast message detected!",
						success : function () {
							Opa5.assert.ok(true, "Found a Toast");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks whether the sales order in the given row has the given ID, customer name
				 * and note.
				 *
				 * @param {number} iRow
				 *   The position of the sales order in the table, with the top being 0
				 * @param {string} sExpectedID
				 *   The expected sales order ID
				 * @param {string} sExpectedCustomerName
				 *   The expected customer name
				 * @param {string} sExpectedNote
				 *   The expected sales order note
				 * @param {string} sExpectedStatus
				 *   The expected sales order status
				 */
				checkSalesOrderAtRow : function (iRow, sExpectedID, sExpectedCustomerName,
					sExpectedNote, sExpectedStatus) {
					this.waitFor({
						id : "SalesOrderSet",
						success : function (oTable) {
							var oRow = oTable.getItems()[iRow],
								aCells = oRow.getCells();

							Opa5.assert.strictEqual(
								aCells[mSalesOrderProperty2Column.SalesOrderID].getValue(),
								sExpectedID,
								"The sales order in row " + iRow + " has the expected ID: "
									+ sExpectedID);
							Opa5.assert.strictEqual(
								aCells[mSalesOrderProperty2Column.CustomerName].getValue(),
								sExpectedCustomerName,
								"The sales order in row " + iRow + " has the expected customer"
									+ " name: " + sExpectedCustomerName);
							Opa5.assert.strictEqual(
								aCells[mSalesOrderProperty2Column.Note].getValue(),
								sExpectedNote,
								"The sales order in row " + iRow + " has the expected note: "
									+ sExpectedNote);
							Opa5.assert.strictEqual(
								aCells[mSalesOrderProperty2Column.Status].getTooltip(),
								sExpectedStatus,
								"The sales order in row " + iRow + " has the expected status: "
									+ sExpectedStatus);
						},
						viewName : sViewName
					});
				},
				/*
				 * Compares the sales order details with the details that have been stored earlier.
				 * Stores the current details after comparing.
				 */
				checkSalesOrderDetailsUpdated : function () {
					this.waitFor({
						id : rObjectPage,
						success : function (aInputFields) {
							var i,
								oNewSalesOrderDetails = {};

							for (i = 0; i < aInputFields.length; i += 1) {
								if (aInputFields[i].getId().includes("grossAmount")) {
									oNewSalesOrderDetails["grossAmount"]
										= aInputFields[i].getValue();
								} else if (aInputFields[i].getId().includes("changedAt")) {
									oNewSalesOrderDetails["changedAt"] = aInputFields[i].getValue();
								}
							}

							Opa5.assert.notDeepEqual(oNewSalesOrderDetails, oSalesOrderDetails,
								"Sales order details have changed");
							oSalesOrderDetails = oNewSalesOrderDetails;
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks whether the sales order items table is empty.
				 */
				checkSalesOrderItemsTableIsEmpty : function () {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getBinding("rows").getLength(), 0,
								"The sales order items table is empty");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the line items to the given sales order have been loaded. Does that by
				 * comparing the first line items <code>SalesOrderID</code> property in the table.
				 *
				 * @param {string} sSalesOrderId
				 *   The id of the sales order which is supposed to load
				 */
				checkSalesOrderItemsLoaded : function (sSalesOrderId) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var sValue =
								oTable.getRows()[0].getCells()[mColumn.SalesOrderID].getValue();

							Opa5.assert.strictEqual(sValue, sSalesOrderId,
								"The sales order items have been loaded for sales order "
									+ sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the given sales order has been loaded.
				 *
				 * @param {string} sSalesOrderId
				 *   The id of the sales order which is supposed to load
				 */
				checkSalesOrderLoaded : function (sSalesOrderId) {
					this.waitFor({
						id : "salesOrderID::objectPage",
						success : function (oField) {
							Opa5.assert.strictEqual(oField.getValue(), sSalesOrderId,
								"The sales order " + sSalesOrderId + " has been loaded");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the sales orders count has changed by the given value.
				 *
				 * @param {number} iDelta
				 *   The supposed difference between the current and the old sales orders count
				 */
				checkSalesOrdersCountChangedBy : function (iDelta) {
					this.waitFor({
						id : "salesOrdersTitle",
						success : function (oTitle) {
							var iCount = parseInt(oTitle.getText().split(" ")[0]);

							iCurrentSalesOrdersCount += iDelta;
							Opa5.assert.equal(iCount, iCurrentSalesOrdersCount,
								"Sales orders count has changed by " + iDelta + " to " + iCount);
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the sales orders count (rememberSalesOrdersCount) differs by the given
				 * delta from the corresponding bindings length.
				 *
				 * @param {number} iDelta
				 *   The supposed difference between the current sales orders count and the bindings
				 *   length.
				 */
				checkSalesOrdersTableLengthDiffersBy : function (iDelta) {
					this.waitFor({
						id : "SalesOrderSet",
						success : function (oTable) {
							var iCount = oTable.getGrowingInfo().total;

							Opa5.assert.equal(iCount, iCurrentSalesOrdersCount + iDelta,
								"Sales orders count differs by " + iDelta
								+ " from the bindings length");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the given row is highlighted in the correct color.
				 *
				 * @param {number} iRow The position of the item in the table
				 * @param {string} sExpectedValueState The expected value state of the note field
				 */
				checkTableRowHighlight : function (iRow, sExpectedValueState) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var oRow = oTable.getRows()[iRow],
								sValueState =
									oRow.getAggregation("_settings").getProperty("highlight");

							Opa5.assert.equal(sValueState, sExpectedValueState,
								"The table row " + iRow +
									" has the correct value state: " + sValueState);
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the given rows have equal values in selected columns.
				 *
				 * @param {number} iRow0 The first row to compare
				 * @param {number} iRow1 The second row to compare
				 * @param {string[]} aColumns The columns that are compared for equality
				 */
				checkTableRowsEqualInColumns : function (iRow0, iRow1, aColumns) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var iColumn,
								oRowCells0 = oTable.getRows()[iRow0].getCells(),
								oRowCells1 = oTable.getRows()[iRow1].getCells();

							aColumns.forEach(function (sColumn) {
								iColumn = mColumn[sColumn];
								Opa5.assert.equal(
									oRowCells1[iColumn].getValue(),
									oRowCells0[iColumn].getValue(),
									"The rows " + iRow0 + " and " + iRow1 + " have the identical"
										+ " value in column '" + sColumn + "'");
							});
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the specified field has the correct value state and value state text.
				 * If it has, the border color and correct message will be displayed.
				 *
				 * @param {number} iRow
				 *   The position of the item in the table
				 * @param {string} sField
				 *   The field as key from <code>mColumn</code>
				 * @param {string} sExpectedValueState
				 *   The expected value state of the field
				 * @param {string} [sMessageShort]
				 *   Key in <code>mMessageShort2Message</code> for the expected text below the note
				 *   field; leave empty if no message is expected
				 */
				checkValueStateOfField : function (iRow, sField, sExpectedValueState,
					sMessageShort) {
					this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var oSelectedField = oTable.getRows()[iRow].getCells()[mColumn[sField]];

							sMessageShort = sMessageShort || "empty";

							Opa5.assert.equal(oSelectedField.getValueState(), sExpectedValueState,
								"The " + sField + " in row " + iRow +
									" has the correct value state");
							Opa5.assert.equal(oSelectedField.getValueStateText(),
								mMessageShort2Message[sMessageShort],
								"The " + sField + " in row " + iRow +
									" has the correct value state text");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});